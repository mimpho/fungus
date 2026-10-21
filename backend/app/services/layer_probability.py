"""
Probability layer of the interactive map: one species scored over the stored cells.

Pure functions. Every cell is scored like a point of /point/species would be (v2 index with the
species' own thermal range, times the altitude factor), but at the cell's mean elevation: there
is no per-cell DEM or forest cover, so the layer says nothing about forest type and a point inside
the cell can be higher or lower than the cell's mean. A species without thermal range in the
catalogue uses the generic model, as in /point/species.
The reference day can go up to FORECAST_LAYER_DAYS after today: the days from today on come from
the cell's stored forecast (see point_series._forecast_chain), only while it is continuous from
today and recent (FORECAST_MAX_AGE_DAYS). Where it is not, the cell has no score for that day.
The backend returns numbers and codes; the front paints and writes the sentences.
"""
import math
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from typing import Any

from app.services.altitude_fit import altitude_fit, zone_band
from app.services.cell_discovery import Grid, build_grid
from app.services.forest_classes import classes_for
from app.services.point_series import prepare_climate
from app.services.point_species import SpeciesRecord
from app.services.scoring_v2 import compute_v2_multi, compute_v2_series, round_half_up
from app.services.substrate_classes import SUBSTRATE_CLASSES, ph_fit
from app.services.zone_scores import V2_WINDOW_DAYS

HISTORY_MARGIN_DAYS = 7  # a few days more than the model's window, so no day is cut

# How far ahead the layer may be asked: today + 7. The cells store 16 forecast days, but the
# further the day the less a score means, so the map stops where the forecast is still useful.
FORECAST_LAYER_DAYS = 7
# A forecast older than this (in UTC days) is not shown as one: the daily refresh did not reach
# the cell. By whole days, so the answer does not change within a day and stays cacheable.
FORECAST_MAX_AGE_DAYS = 2

# Relief bands. A cell is ~8 x 11 km and in a mountain region it spans hundreds of metres, so its
# mean elevation hides where a species can fruit. Each cell is also scored at fixed elevations
# (multiples of BAND_STEP_M, the same for every cell), with the climate shifted to each one; the
# map then gives every pixel the score of its own elevation (read from a DEM that is never drawn).
BAND_STEP_M = 300
# How far from the cell's mean elevation a pixel may lie. A stand-in until the DEM gives each
# cell's real range; it keeps the bands that are scored to a handful per cell.
BAND_SPREAD_M = 900


@dataclass(frozen=True)
class CellClimate:
    """A stored cell with its daily rows (any objects with the climate_cell_history columns)."""

    id: str
    lat: float
    lon: float
    elevation_m: float
    rows: Sequence[Any]


def history_start(today: date, on: date | None) -> date:
    """First day of history worth reading to score `on` (default: the last day with data)."""
    return min(on or today, today) - timedelta(days=V2_WINDOW_DAYS + HISTORY_MARGIN_DAYS)


def forecast_limit(today: date) -> date:
    """Last day the layer may be asked for."""
    return today + timedelta(days=FORECAST_LAYER_DAYS)


def forecast_fresh_since(today: date) -> datetime:
    """A forecast row fetched before this instant (UTC midnight, FORECAST_MAX_AGE_DAYS before
    `today`) is too old to count."""
    return datetime.combine(today - timedelta(days=FORECAST_MAX_AGE_DAYS), time.min, tzinfo=UTC)


def _real_last(days: Sequence[Any], today: date) -> date:
    """Last observed day of a prepared climate (the forecast, if any, comes after it)."""
    return max(d.date for d in days if d.date < today)


def _reference(
    prepared: dict, today: date, on: date | None
) -> tuple[date | None, date | None, date | None]:
    """(reference day, last observed day, last day any cell can be scored) over the prepared
    cells. The reference is `on` limited to the last scorable day; without `on`, the last
    observed day, as before the forecast existed."""
    ready = [p[0] for p in prepared.values() if p is not None]
    if not ready:
        return None, None, None
    last = max(_real_last(days, today) for days in ready)
    reach = max(days[-1].date for days in ready)
    return (min(on, reach) if on else last), last, reach


def _window_fields(
    ref: date | None, last: date | None, reach: date | None, today: date, on: date | None
) -> dict:
    """What the answer says about the days it can show: `date` (the one scored), the last
    observed day, the last scorable one, where the forecast starts and whether `date` is one."""
    iso = lambda d: d.isoformat() if d else None  # noqa: E731
    return {
        "date": iso(ref),
        "last_data_date": iso(last),
        "max_date": iso(reach),
        "forecast_from": today.isoformat(),
        "basis": None if ref is None else ("forecast" if ref >= today else "real"),
        "clamped": bool(on and reach and on > reach),
    }


def band_elevations(
    cell_elevation_m: float, spread_m: float = BAND_SPREAD_M, step_m: int = BAND_STEP_M
) -> list[int]:
    """Elevations (multiples of `step_m`, never below sea level) within `spread_m` of the cell's
    mean. The grid is absolute so neighbouring cells share their bands."""
    low = max(0, math.ceil((cell_elevation_m - spread_m) / step_m) * step_m)
    high = math.floor((cell_elevation_m + spread_m) / step_m) * step_m
    return list(range(low, high + 1, step_m))


def _prepare(
    c: CellClimate,
    today: date,
    elevation_m: float | None,
    ref: date | None,
    fresh_since: datetime | None,
):
    """The cell's climate at `elevation_m`, with the forecast when `ref` is not an observed day."""
    until = forecast_limit(today) if ref is None or ref >= today else None
    return prepare_climate(c.rows, today, c.elevation_m, elevation_m, until, fresh_since)


def _score_at(
    c: CellClimate,
    today: date,
    sp: SpeciesRecord,
    ref: date,
    elevation_m: float,
    fresh_since: datetime | None = None,
) -> tuple[int | None, bool]:
    """Score of the species in the cell's climate seen from `elevation_m`, and whether the
    species reaches that altitude at all. (None, True) when there is no model answer."""
    fit = altitude_fit(zone_band(round(elevation_m), None, None),
                       sp.elevation_min_m, sp.elevation_max_m)
    if not fit.compatible:
        return None, False
    prepared = _prepare(c, today, elevation_m, ref, fresh_since)
    if prepared is None:
        return None, True
    corrected, elevation = prepared
    window = [d for d in corrected if ref - timedelta(days=V2_WINDOW_DAYS) <= d.date <= ref]
    series = compute_v2_series(window, elevation, sp.params, output_from=ref)
    if not series or series[-1].date != ref:
        return None, True
    return min(100, round_half_up(series[-1].score * fit.score_factor)), True


def _cell_dict(cell: CellClimate, grid: Grid | None, **fields) -> dict:
    return {
        "id": cell.id,
        "lat": cell.lat,
        "lon": cell.lon,
        "half_lat": None if grid is None else round(grid.half_lat, 5),
        "half_lon": None if grid is None else round(grid.half_lon(cell.lat), 5),
        "elevation_m": round(cell.elevation_m),
        **fields,
    }


def species_layer(
    cells: Sequence[CellClimate],
    today: date,
    sp: SpeciesRecord,
    on: date | None = None,
    fresh_since: datetime | None = None,
) -> dict:
    """Score of `sp` in every cell on a date (default: the last day with data; up to
    FORECAST_LAYER_DAYS after `today`, from the stored forecast).

    Each cell has `status`: "scored" (score 0-100 at the cell's mean elevation), "altitude" (the
    species does not reach that elevation, no score) or "no_data", and `bands`: [[elevation_m,
    score], ...] at the elevations the species does reach inside the cell (see BAND_STEP_M).
    Out of the species' fruiting months nothing is scored (`in_season` false): the model would
    only shrink the score, and a map of near-zeros says less than saying so."""
    limit = forecast_limit(today)
    prepared = {
        c.id: prepare_climate(c.rows, today, c.elevation_m, None, limit, fresh_since)
        for c in cells
    }
    ref, last_data, reach = _reference(prepared, today, on)

    in_season = ref is not None and (not sp.fruiting_months or ref.month in sp.fruiting_months)
    grid = build_grid((c.lat, c.lon) for c in cells)
    out = []
    for c in cells:
        if prepared[c.id] is None or not in_season:
            out.append(_cell_dict(c, grid, status="no_data", score=None, bands=[]))
            continue
        score, reaches = _score_at(c, today, sp, ref, c.elevation_m, fresh_since)
        status = "scored" if score is not None else ("altitude" if not reaches else "no_data")
        bands = []
        for e in band_elevations(c.elevation_m):
            band_score, _ = _score_at(c, today, sp, ref, e, fresh_since)
            if band_score is not None:
                bands.append([e, band_score])
        out.append(_cell_dict(c, grid, status=status, score=score, bands=bands))

    return {
        "species": {
            "id": sp.id,
            "scientific_name": sp.scientific_name,
            "fruiting_months": list(sp.fruiting_months),
            "elevation_min_m": sp.elevation_min_m,
            "elevation_max_m": sp.elevation_max_m,
            "generic_model": sp.params is None,
            # forest classes it fits (forest_classes.py); None = the forest cannot judge it
            "forest_classes": classes_for(sp.forest_types),
            # how well its soil pH range fits each substrate class (in that order); None = unknown
            "substrate_classes": list(SUBSTRATE_CLASSES),
            "substrate_factors": ph_fit(sp.ph_min, sp.ph_max),
        },
        **_window_fields(ref, last_data, reach, today, on),
        "in_season": bool(in_season),
        "band_step_m": BAND_STEP_M,
        "cells": out,
    }


# ── All the excellent edibles at once ─────────────────────────────────────────

def _scores_at_many(
    c: CellClimate,
    today: date,
    species: Sequence[SpeciesRecord],
    ref: date,
    elevation_m: float,
    in_season: Sequence[bool],
    fresh_since: datetime | None = None,
) -> list[int | None]:
    """`_score_at` for several species at one elevation: one climate preparation and one pass
    over the part of the model that does not depend on the species. None for each species that
    does not reach the elevation, is out of season or has no answer."""
    out: list[int | None] = [None] * len(species)
    band = zone_band(round(elevation_m), None, None)
    fits = {
        i: altitude_fit(band, sp.elevation_min_m, sp.elevation_max_m)
        for i, sp in enumerate(species) if in_season[i]
    }
    todo = [i for i, fit in fits.items() if fit.compatible]
    prepared = _prepare(c, today, elevation_m, ref, fresh_since) if todo else None
    if prepared is None:
        return out
    corrected, elevation = prepared
    window = [d for d in corrected if ref - timedelta(days=V2_WINDOW_DAYS) <= d.date <= ref]
    series = compute_v2_multi(window, elevation, [species[i].params for i in todo], output_from=ref)
    for i, rows in zip(todo, series, strict=True):
        if rows and rows[-1].date == ref:
            out[i] = min(100, round_half_up(rows[-1].score * fits[i].score_factor))
    return out


def excellent_layer(
    cells: Sequence[CellClimate],
    today: date,
    species: Sequence[SpeciesRecord],
    on: date | None = None,
    fresh_since: datetime | None = None,
) -> dict:
    """The scores of every given species (the excellent edibles) in every cell on a date, for the
    map to average where more than one grows: per cell, `score` (at its mean elevation) and
    `bands` ([[elevation_m, [score per species]], ...]), each list in the order of `species`
    and null where a species does not reach, is out of season or has no answer. Each species
    carries what the client needs to judge a pixel's forest and soil, as in `species_layer`."""
    limit = forecast_limit(today)
    prepared = {
        c.id: prepare_climate(c.rows, today, c.elevation_m, None, limit, fresh_since)
        for c in cells
    }
    ref, last_data, reach = _reference(prepared, today, on)
    in_season = [
        ref is not None and (not sp.fruiting_months or ref.month in sp.fruiting_months)
        for sp in species
    ]
    grid = build_grid((c.lat, c.lon) for c in cells)
    none = [None] * len(species)
    out = []
    for c in cells:
        if prepared[c.id] is None or not any(in_season):
            out.append(_cell_dict(c, grid, status="no_data", score=none, bands=[]))
            continue
        mean = _scores_at_many(c, today, species, ref, c.elevation_m, in_season, fresh_since)
        bands = []
        for e in band_elevations(c.elevation_m):
            scores = _scores_at_many(c, today, species, ref, e, in_season, fresh_since)
            if any(v is not None for v in scores):
                bands.append([e, scores])
        status = "scored" if any(v is not None for v in mean) else (
            "altitude" if not bands else "no_data")
        out.append(_cell_dict(c, grid, status=status, score=mean, bands=bands))
    return {
        "species": [
            {
                "id": sp.id,
                "scientific_name": sp.scientific_name,
                "elevation_min_m": sp.elevation_min_m,
                "elevation_max_m": sp.elevation_max_m,
                "in_season": bool(in_season[i]),
                "forest_classes": classes_for(sp.forest_types),
                "substrate_factors": ph_fit(sp.ph_min, sp.ph_max),
            }
            for i, sp in enumerate(species)
        ],
        "substrate_classes": list(SUBSTRATE_CLASSES),
        **_window_fields(ref, last_data, reach, today, on),
        "in_season": bool(any(in_season)),
        "band_step_m": BAND_STEP_M,
        "cells": out,
    }
