"""
Daily series of Condiciones for all of Catalonia: what the weekly bars of the day selector show.

A day's figure is, per stored cell, the score at the cell's mean elevation (no forest or soil, so
it is no point of the map): for one species, its own; for «excellent», the mean of the excellent
edibles in season that reach that elevation. Over the cells with a figure it keeps the mean and
the p90.

The excellent ones (together and one by one) are computed ahead and stored, each day exactly as
the map computes it, with its own V2_WINDOW_DAYS of history: the model's «warm» state depends on
where a calculation starts (memory/gotchas.md). Computing a day costs well under a second for
all of them; the job (`update_day_series`) does only the days that changed. Any other species is
computed when asked, in one pass per cell (`species_daily`), which is far cheaper and moves the
mean of all Catalonia by tenths of a point at most.

Reads only what is stored: no Open-Meteo calls. Product rules: memory/observatory-meteo-plan.md.
"""
import asyncio
import hashlib
import math
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from typing import Any

from app.services.altitude_fit import altitude_fit, zone_band
from app.services.cell_provider import REFRESH_WINDOW_DAYS
from app.services.layer_probability import (
    FORECAST_MAX_AGE_DAYS,
    HISTORY_MARGIN_DAYS,
    CellClimate,
    forecast_fresh_since,
    forecast_limit,
    scores_at_many,
)
from app.services.meteo_weeks import first_bar_day
from app.services.point_series import prepare_climate
from app.services.point_species import SpeciesRecord
from app.services.scoring_v2 import MODEL_VERSION, compute_v2_series, round_half_up
from app.services.zone_scores import V2_WINDOW_DAYS

EXCELLENT_SERIES = "excellent"
# Days back from today that the cell refresh rewrites (its window, plus one for the day it ran)
REFRESHED_DAYS_BACK = REFRESH_WINDOW_DAYS + 1
# How many days are computed from one read of the history: what keeps the memory bounded
CHUNK_DAYS = 14
CELL_BATCH = 50  # cells read at a time for a species computed when asked
SERIES_VERSION = 1  # raise it when the figures of a day are computed differently
P90 = 0.9


@dataclass(frozen=True)
class DayFigure:
    mean: float | None
    p90: float | None  # the figure the best tenth of the cells reaches or passes
    cells: int  # how many cells have a figure


@dataclass(frozen=True)
class JobStats:
    computed: int


def _figure(values: list[float]) -> DayFigure:
    if not values:
        return DayFigure(None, None, 0)
    ordered = sorted(values)
    return DayFigure(
        sum(ordered) / len(ordered),
        ordered[math.floor(P90 * (len(ordered) - 1))],
        len(ordered),
    )


def day_figures(
    cells: Sequence[CellClimate],
    today: date,
    species: Sequence[SpeciesRecord],
    day: date,
    fresh_since: datetime | None = None,
) -> dict[str, DayFigure]:
    """{series: figure} of one day: every species by its id, and EXCELLENT_SERIES for the mean of
    them at each cell."""
    in_season = [not sp.fruiting_months or day.month in sp.fruiting_months for sp in species]
    per_species: list[list[float]] = [[] for _ in species]
    together: list[float] = []
    for c in cells:
        scores = scores_at_many(c, today, species, day, c.elevation_m, in_season, fresh_since)
        found = [v for v in scores if v is not None]
        if found:
            together.append(sum(found) / len(found))
        for i, v in enumerate(scores):
            if v is not None:
                per_species[i].append(v)
    return {
        EXCELLENT_SERIES: _figure(together),
        **{sp.id: _figure(v) for sp, v in zip(species, per_species, strict=True)},
    }


def inputs_hash(species: Sequence[SpeciesRecord]) -> str:
    """Changes with the model, the way a day is computed or the catalogue of the species: what is
    stored under another hash is computed again."""
    text = repr((MODEL_VERSION, SERIES_VERSION, sorted(species, key=lambda s: s.id)))
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def pending_days(
    today: date,
    stored: Mapping[date, tuple[str, datetime]],
    inputs: str,
    data_changed_at: datetime | None,
) -> list[date]:
    """Days of the bar to compute, newest first. `stored` is {day: (inputs, computed_at)}.
    A day is pending when it is missing; when it was computed from other species or another
    model; when it is past and was computed before it ended (it was still a forecast); or when a
    refresh may have rewritten it and climate was downloaded after it was computed."""
    first, last = first_bar_day(today), forecast_limit(today)
    rewritten_from = today - timedelta(days=REFRESHED_DAYS_BACK)
    out = []
    day = last
    while day >= first:
        done = stored.get(day)
        if (
            done is None
            or done[0] != inputs
            or (day < today and done[1].astimezone(UTC).date() <= day)
            or (day >= rewritten_from and data_changed_at is not None and done[1] < data_changed_at)
        ):
            out.append(day)
        day -= timedelta(days=1)
    return out


def _chunks(days: list[date]) -> list[list[date]]:
    """`days` (newest first) in groups spanning less than CHUNK_DAYS."""
    out: list[list[date]] = []
    for day in days:
        if out and (out[-1][0] - day).days < CHUNK_DAYS:
            out[-1].append(day)
        else:
            out.append([day])
    return out


def _climate_cells(stored: Sequence[tuple[Any, list]]) -> list[CellClimate]:
    return [CellClimate(c.id, c.lat, c.lon, c.elevation_m, rows) for c, rows in stored]


async def update_day_series(
    climate_store: Any,
    series_store: Any,
    species: Sequence[SpeciesRecord],
    today: date,
    *,
    clock: Callable[[], datetime] = lambda: datetime.now(UTC),
) -> JobStats:
    """Computes the pending days and saves them one by one, newest first, so a run cut half way
    keeps what it did. `species` are the excellent edibles of the mean."""
    if not species:
        return JobStats(0)
    inputs = inputs_hash(species)
    pending = pending_days(
        today, await series_store.stored_state(), inputs, await series_store.data_changed_at()
    )
    computed = 0
    for chunk in _chunks(pending):
        # taken before reading: climate written from now on makes these days pending again
        read_at = clock()
        stored = await climate_store.loaded_cells_climate(
            chunk[-1] - timedelta(days=V2_WINDOW_DAYS + HISTORY_MARGIN_DAYS - 1), until=chunk[0]
        )
        cells = _climate_cells(stored)
        if not cells:
            break
        for day in chunk:
            figures = await asyncio.to_thread(
                day_figures, cells, today, species, day, forecast_fresh_since(today)
            )
            await series_store.save_day(day, figures, inputs, read_at)
            computed += 1
    return JobStats(computed)


def served_daily(
    rows: Sequence[Any], today: date, fresh_since: datetime
) -> dict[date, float]:
    """{day: mean} of the stored rows that can still be shown: a day from today on only while its
    computation is fresh, and a past one only if it was computed no earlier than
    FORECAST_MAX_AGE_DAYS before it (the rule of the layers for a forecast)."""
    out = {}
    for r in rows:
        if r.mean is None:
            continue
        if r.day >= today:
            if r.computed_at < fresh_since:
                continue
        elif (r.day - r.computed_at.astimezone(UTC).date()).days > FORECAST_MAX_AGE_DAYS:
            continue
        out[r.day] = r.mean
    return out


def _add_species_days(
    totals: dict[date, list[float]], cells: Sequence[CellClimate], today: date, sp: SpeciesRecord
) -> None:
    """Adds each cell's scores of one species, day by day over the bar, to {day: [sum, count]}."""
    first, limit = first_bar_day(today), forecast_limit(today)
    fresh_since = forecast_fresh_since(today)
    for c in cells:
        fit = altitude_fit(
            zone_band(round(c.elevation_m), None, None), sp.elevation_min_m, sp.elevation_max_m
        )
        if not fit.compatible:
            continue
        prepared = prepare_climate(c.rows, today, c.elevation_m, c.elevation_m, limit, fresh_since)
        if prepared is None:
            continue
        for r in compute_v2_series(prepared[0], prepared[1], sp.params, output_from=first):
            if sp.fruiting_months and r.date.month not in sp.fruiting_months:
                continue
            entry = totals.setdefault(r.date, [0.0, 0])
            entry[0] += min(100, round_half_up(r.score * fit.score_factor))
            entry[1] += 1


async def species_daily(
    climate_store: Any, today: date, sp: SpeciesRecord, *, batch: int = CELL_BATCH
) -> dict[date, float]:
    """{day: mean over the cells} of one species over the whole bar, computed now: one pass per
    cell, the cells read `batch` at a time. A day out of its months is absent."""
    ids = [c.id for c in await climate_store.list_cells() if c.loaded_to is not None]
    since = first_bar_day(today) - timedelta(days=V2_WINDOW_DAYS + HISTORY_MARGIN_DAYS)
    totals: dict[date, list[float]] = {}
    for i in range(0, len(ids), batch):
        stored = await climate_store.loaded_cells_climate(since, cell_ids=ids[i : i + batch])
        await asyncio.to_thread(_add_species_days, totals, _climate_cells(stored), today, sp)
    return {day: total / count for day, (total, count) in totals.items()}
