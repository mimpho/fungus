"""
Projected scores: the v2 score of the next days, from real climate plus a forecast.

Pure functions: climate rows in, scores out. The script `scripts/zone_forecast.py` reads the
rows and the forecast; the Observatory API will use the same function.

A projected day is only as good as the forecast it rests on, so every day after the last real
one is flagged `forecast=True`.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date
from typing import Any

from app.services.scoring import score_label
from app.services.scoring_v2 import ClimateDay, PendingRain, compute_v2_series


@dataclass(frozen=True)
class ProjectedDay:
    day: date
    score: int
    label: str
    limiting_factor: str
    forecast: bool  # True when the day is not real climate yet
    precipitation_mm: float
    temp_min_c: float
    pending_rains: list[PendingRain]


def project_scores(
    history: Sequence[Any],
    forecast: Sequence[Any],
    elevation_m: float | None,
    from_date: date,
) -> list[ProjectedDay]:
    """v2 for every day from `from_date` to the last forecast day.

    `history` and `forecast` are rows with the attribute names of `climate_history`
    (the ORM row, or the connector's DailyWeatherData). A forecast day is used only when the
    real one is missing, so late archive data wins.
    """
    days: dict[date, ClimateDay] = {}
    for rows in (forecast, history):  # history last: it overwrites a forecast day
        for r in rows:
            d = ClimateDay.from_row(r)
            if d is not None:
                days[d.date] = d
    real = [d.date for d in map(ClimateDay.from_row, history) if d is not None]
    if not real:
        return []  # a forecast alone is not enough to score a zone
    last_real = max(real)
    ordered = [days[k] for k in sorted(days)]

    series = compute_v2_series(ordered, elevation_m, output_from=from_date)
    return [
        ProjectedDay(
            day=r.date,
            score=r.score,
            label=score_label(r.score),
            limiting_factor=r.limiting_factor,
            forecast=r.date > last_real,
            precipitation_mm=days[r.date].precipitation_mm,
            temp_min_c=days[r.date].temp_min_c,
            pending_rains=r.pending_rains,
        )
        for r in series
    ]
