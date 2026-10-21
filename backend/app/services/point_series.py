"""
Series and snapshot for a clicked point, from its cell's climate.

Pure functions: climate rows (cell) in, JSON-ready dicts out. The cell's climate is shifted
to the point's elevation (app.services.elevation_correction) and scored with the same v1/v2
code as the zones. Days without data come back with null climate and no score.
"""
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any

from app.services.elevation_correction import correct_days, elevation_delta_m
from app.services.point_ensemble import Ensemble, score_series
from app.services.point_events import build_conditions, build_explanation, find_events
from app.services.scoring import score_label
from app.services.scoring_v2 import ClimateDay, SpeciesParams, V2Result
from app.services.zone_scores import V2_WINDOW_DAYS, v1_detail, v1_from_rows, v2_detail

MIN_DAYS, MAX_DAYS, DEFAULT_DAYS = 7, 180, 20


@dataclass(frozen=True)
class SeriesWindow:
    last_data_date: date | None
    to: date | None  # last day of the window actually returned
    clamped: bool  # the requested end was after the last data
    days: list[dict]
    events: list[dict]  # triggers, brakes and frosts, numbered in date order
    lowest_min: dict | None  # coldest night of the window


def _usable(
    rows: Sequence[Any],
    today: date,
    forecast_until: date | None = None,
    fresh_since: datetime | None = None,
) -> list[ClimateDay]:
    """Complete days before `today`. Today's own row and the forecast are not observed yet, so
    they are left out unless the caller asks for the forecast (`forecast_until`, see
    `_forecast_chain`)."""
    out = [d for r in rows if r.date < today if (d := ClimateDay.from_row(r))]
    out.sort(key=lambda d: d.date)
    if forecast_until is not None and out and out[-1].date == today - timedelta(days=1):
        out.extend(_forecast_chain(rows, today, forecast_until, fresh_since))
    return out


def _forecast_chain(
    rows: Sequence[Any], today: date, until: date, fresh_since: datetime | None
) -> list[ClimateDay]:
    """The forecast days from `today` to `until`, up to the first one that is missing, incomplete
    or stale (fetched before `fresh_since`). A hole is never filled: the model would invent the
    rain of that day, and a forecast with a gap says nothing about the days after it."""
    by_date: dict[date, ClimateDay] = {}
    for r in rows:
        if not today <= r.date <= until:
            continue
        fetched = getattr(r, "fetched_at", None)
        if fresh_since is not None and fetched is not None and fetched < fresh_since:
            continue
        if (d := ClimateDay.from_row(r)) is not None:
            by_date[d.date] = d
    chain: list[ClimateDay] = []
    day = today
    while day <= until and day in by_date:
        chain.append(by_date[day])
        day += timedelta(days=1)
    return chain


def _climate(d: ClimateDay) -> dict:
    return {
        "temp_max_c": round(d.temp_max_c, 1),
        "temp_min_c": round(d.temp_min_c, 1),
        "temp_avg_c": round(d.temp_avg_c, 1),
        "soil_temp_c": round(d.soil_temp_c, 1),
        "precipitation_mm": round(d.precipitation_mm, 1),
        "humidity_pct": round(d.humidity_pct),
        "wind_kmh": round(d.wind_kmh),
        "filled": d.filled,
    }


def _v1(days: Sequence[ClimateDay], ref: date) -> dict | None:
    oi = v1_from_rows(days, ref)
    return None if oi is None else {**v1_detail(oi), "label": score_label(oi.score)}


def _v2(r: V2Result) -> dict:
    return {**v2_detail(r), "label": score_label(r.score)}


def prepare_climate(
    rows: Sequence[Any],
    today: date,
    cell_elevation_m: float | None,
    point_elevation_m: float | None,
    forecast_until: date | None = None,
    fresh_since: datetime | None = None,
) -> tuple[list[ClimateDay], float | None] | None:
    """Complete days shifted to the point's elevation, and the elevation the model scores at.
    With `forecast_until` the list goes on with the stored forecast from `today` (continuous
    days only, and only fresh ones if `fresh_since` is given); the callers that do not pass it
    get observed days only."""
    usable = _usable(rows, today, forecast_until, fresh_since)
    if not usable:
        return None
    corrected = correct_days(usable, elevation_delta_m(point_elevation_m, cell_elevation_m))
    return corrected, point_elevation_m if point_elevation_m is not None else cell_elevation_m


def build_series(
    rows: Sequence[Any],
    today: date,
    cell_elevation_m: float | None,
    point_elevation_m: float | None,
    to: date | None = None,
    days: int = DEFAULT_DAYS,
    species: SpeciesParams | Ensemble | None = None,
) -> SeriesWindow:
    prepared = prepare_climate(rows, today, cell_elevation_m, point_elevation_m)
    if prepared is None:
        return SeriesWindow(None, None, False, [], [], None)
    corrected, elevation = prepared
    last = corrected[-1].date
    end = min(to, last) if to else last
    start = end - timedelta(days=days - 1)

    by_date = {d.date: d for d in corrected}
    warm_up = start - timedelta(days=V2_WINDOW_DAYS)
    window_days = [d for d in corrected if warm_up <= d.date <= end]
    v2 = {
        r.date: r
        for r in score_series(window_days, elevation, species, output_from=start)
    }
    out = []
    for i in range(days):
        day = start + timedelta(days=i)
        d = by_date.get(day)
        out.append(
            {
                "date": day.isoformat(),
                "climate": _climate(d) if d else None,
                "v1": _v1(corrected, day) if d else None,
                "v2": _v2(v2[day]) if day in v2 else None,
            }
        )
    events, lowest_min = find_events(by_date, start, end)
    return SeriesWindow(last, end, bool(to and to > last), out, events, lowest_min)


def build_snapshot(
    rows: Sequence[Any],
    today: date,
    cell_elevation_m: float | None,
    point_elevation_m: float | None,
    on: date | None = None,
    species: SpeciesParams | Ensemble | None = None,
) -> dict | None:
    """Thermometer for one date (default: the last with data): v2, band, limiting factor, v1,
    every condition behind the score and the explanation code for the grey areas."""
    prepared = prepare_climate(rows, today, cell_elevation_m, point_elevation_m)
    if prepared is None:
        return None
    corrected, elevation = prepared
    last = corrected[-1].date
    ref = min(on, last) if on else last
    upto = [d for d in corrected if d.date <= ref]
    if not upto:
        return None  # the date is before the first day the cell has
    ref = upto[-1].date  # a day missing from the cell scores as the nearest one before it
    warm_up = ref - timedelta(days=V2_WINDOW_DAYS)
    series = score_series([d for d in upto if d.date >= warm_up], elevation, species, ref)
    if not series or series[-1].date != ref:
        return None
    result = series[-1]
    v2 = _v2(result)
    day = next((d for d in reversed(upto) if d.date == ref), None)
    return {
        "date": ref.isoformat(),
        "last_data_date": last.isoformat(),
        "clamped": bool(on and on > last),
        "score": v2["score"],
        "label": v2["label"],
        "limiting_factor": v2["limiting_factor"],
        "factors": v2["factors"],
        "warm": v2["warm"],
        "estimated": v2["estimated"],
        "key_facts": {
            "soil_water_mm": v2["soil_water_mm"],
            "soil_temp_7d_c": v2["soil_temp_7d_c"],
            "air_temp_20d_c": v2["air_temp_20d_c"],
            "last_night_min_c": round(day.temp_min_c, 1) if day else None,
            "dry_days": v2["dry_days"],
        },
        "pending_rains": v2["pending_rains"],
        # an ensemble has no thresholds of its own to list: the conditions are each species'
        "conditions": ([] if isinstance(species, Ensemble)
                       else build_conditions(result, upto[-10:], elevation, species)),
        "explanation": build_explanation(result),
        "v1": _v1(corrected, ref) if day else None,
    }
