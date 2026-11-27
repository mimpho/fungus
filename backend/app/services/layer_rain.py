"""
Rain layer of the interactive map: the accumulated rain of every stored cell.

Pure functions. The window is the 1, 7 or 21 calendar days ending on the reference day, both
included, and the sum uses the stored rain only: no correction for altitude, forest or soil, and
none of the gap filling of the scoring model (which takes a missing day as 0 mm).
A past day is what happened when its row was downloaded after it ended. One downloaded on the
day or up to FORECAST_MAX_AGE_DAYS before still counts, and the answer says the window includes
forecast (`includes_forecast`): otherwise the coming days would go empty every night until the
daily refresh. An older one is missing: a forecast never refreshed is not rain that fell. Today
and later come from the stored forecast, under the rule of the conditions layer (continuous from
today and recent, up to a week ahead).
A cell with a day missing never shows its partial sum: it is estimated from the cells around it
when enough of them have the whole window, and has no data otherwise.
Product rules: memory/observatory-meteo-plan.md.
"""
import math
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from typing import Any

from app.services.cell_discovery import Grid, build_grid
from app.services.layer_probability import (
    FORECAST_MAX_AGE_DAYS,
    CellClimate,
    cell_dict,
    forecast_limit,
    window_fields,
)
from app.services.point_series import forecast_chain

RAIN_WINDOWS = {"24h": 1, "7d": 7, "21d": 21}
DEFAULT_RAIN_WINDOW = "7d"

# How many cells with the whole window are needed around a gap to estimate it
MIN_NEIGHBOURS = 3
# Neighbour reach, in half-cells (1 = from a centre to its own edge): the ring around a cell,
# whose sides are 2 away and whose diagonals are 2.83 away
NEIGHBOUR_REACH = 3.0

# Days read before the longest window, so that the last day with data is still found, with its
# whole window, when the daily refresh has not run for weeks
HISTORY_MARGIN_DAYS = 30


def history_since(today: date, on: date | None) -> date:
    """First day of history worth reading to answer `on` (default: the last day with data)."""
    longest = max(RAIN_WINDOWS.values())
    return min(on or today, today) - timedelta(days=longest + HISTORY_MARGIN_DAYS)


def _downloaded_ahead(row: Any) -> int | None:
    """For a past row: None if it says what happened (the archive, or a forecast-API row
    downloaded once its day was over, in UTC), else how many days before the end of its day it
    was downloaded (0 = during the day itself)."""
    if row.source != "forecast" or row.fetched_at is None:
        return None
    ahead = (row.date - row.fetched_at.astimezone(UTC).date()).days
    return None if ahead < 0 else ahead


@dataclass(frozen=True)
class _CellDays:
    """The days of a cell that can be added up."""

    past: dict[date, float]  # {date: mm}
    ahead: dict[date, float]  # today and later, from the forecast
    provisional: frozenset[date]  # past days still as they were forecast


def usable_days(rows: Sequence[Any], today: date, fresh_since: datetime | None) -> _CellDays:
    past: dict[date, float] = {}
    provisional = set()
    for r in rows:
        if r.date >= today:
            continue
        before = _downloaded_ahead(r)
        if before is not None:
            if before > FORECAST_MAX_AGE_DAYS:
                continue
            provisional.add(r.date)
        past[r.date] = float(r.precipitation_mm)
    ahead = {
        d.date: d.precipitation_mm
        for d in forecast_chain(rows, today, forecast_limit(today), fresh_since)
    }
    return _CellDays(past, ahead, frozenset(provisional))


def _total(days: dict[date, float], end: date, length: int) -> float | None:
    """The rain of the `length` days ending on `end`; None if any of them is missing."""
    window = [days.get(end - timedelta(days=i)) for i in range(length)]
    return None if any(v is None for v in window) else sum(window)


def _estimate(
    target: CellClimate, measured: Sequence[tuple[CellClimate, float]], grid: Grid
) -> float | None:
    """Mean of the measured cells around `target`, each weighted by 1 / distance². None with
    fewer than MIN_NEIGHBOURS. Only measured cells are passed in: an estimate never feeds
    another one, so the middle of a large hole stays empty."""
    half_lon = grid.half_lon(target.lat)
    near = []
    for cell, mm in measured:
        distance = math.hypot(
            (cell.lat - target.lat) / grid.half_lat, (cell.lon - target.lon) / half_lon
        )
        if 0 < distance <= NEIGHBOUR_REACH:
            near.append((1 / distance**2, mm))
    if len(near) < MIN_NEIGHBOURS:
        return None
    return sum(w * mm for w, mm in near) / sum(w for w, _ in near)


def rain_layer(
    cells: Sequence[CellClimate],
    today: date,
    window: str = DEFAULT_RAIN_WINDOW,
    on: date | None = None,
    fresh_since: datetime | None = None,
) -> dict:
    """Accumulated rain of every cell over `window` ("24h", "7d", "21d") ending on `on` (default:
    the last past day with data; up to FORECAST_LAYER_DAYS after `today`, from the forecast).

    Each cell has `status`: "measured" (`mm` is the sum of its own days), "estimated" (a day is
    missing and `mm` comes from the cells around it) or "no_data" (`mm` null).
    `includes_forecast`: the date is today or later, or some cell's sum has a past day still as
    it was forecast. `basis` only says which side of today the date is."""
    length = RAIN_WINDOWS[window]
    usable = {c.id: usable_days(c.rows, today, fresh_since) for c in cells}
    last = max((d for u in usable.values() for d in u.past), default=None)
    reach = max((d for u in usable.values() for d in (*u.past, *u.ahead)), default=None)
    ref = (min(on, reach) if reach else None) if on else last

    totals: dict[str, float] = {}
    includes_forecast = ref is not None and ref >= today
    if ref is not None:
        for c in cells:
            days = usable[c.id]
            if (total := _total(days.past | days.ahead, ref, length)) is not None:
                totals[c.id] = total
                includes_forecast |= any(0 <= (ref - d).days < length for d in days.provisional)
    measured = [(c, totals[c.id]) for c in cells if c.id in totals]
    grid = build_grid((c.lat, c.lon) for c in cells)

    out = []
    for c in cells:
        mm, status = totals.get(c.id), "measured"
        if mm is None:
            mm = None if grid is None else _estimate(c, measured, grid)
            status = "no_data" if mm is None else "estimated"
        out.append(cell_dict(c, grid, status=status, mm=None if mm is None else round(mm, 1)))

    return {
        "window": window,
        "window_days": length,
        "window_from": None if ref is None else (ref - timedelta(days=length - 1)).isoformat(),
        **window_fields(ref, last, reach, today, on),
        "includes_forecast": bool(includes_forecast),
        "cells": out,
    }
