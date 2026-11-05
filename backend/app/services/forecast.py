"""
Stored zone forecast: loading and day warnings.

The daily ingest writes up to 16 days per zone into zone_forecast (see services/ingest.py).
The Observatory API (Momento, calendar, «Previsión en la zona») reads them here. Logic stays
in the backend: warnings are codes, the front builds the sentences (i18n).
"""
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.zone_forecast import ZoneForecast
from app.services.scoring_v2 import HEAT_THRESHOLD_C

USEFUL_RAIN_MM = 10.0  # a rain of this size or more wets the soil enough to matter
FROST_C = 0.0
DETAIL_DAYS = 7  # days 1–7 as cards, the rest as a compact trend row


@dataclass(frozen=True)
class ForecastDay:
    day: date
    temp_max_c: float | None
    temp_min_c: float | None
    precipitation_mm: float
    precip_prob_pct: int | None
    warnings: tuple[str, ...]  # subset of "frost", "heat", "useful_rain"
    detailed: bool  # one of the first 7 days (card); the rest go in the trend row


def day_warnings(row: Any) -> tuple[str, ...]:
    """Frost (min < 0 °C), heat (max > 25 °C) and useful rain (≥ 10 mm), in that order."""
    out: list[str] = []
    if row.temp_min_c is not None and float(row.temp_min_c) < FROST_C:
        out.append("frost")
    if row.temp_max_c is not None and float(row.temp_max_c) > HEAT_THRESHOLD_C:
        out.append("heat")
    if float(row.precipitation_mm or 0) >= USEFUL_RAIN_MM:
        out.append("useful_rain")
    return tuple(out)


def build_forecast_days(rows: Sequence[Any], today: date) -> list[ForecastDay]:
    """Rows from today on, ordered, with warnings; earlier days are ignored."""
    days = sorted((r for r in rows if r.date >= today), key=lambda r: r.date)
    return [
        ForecastDay(
            day=r.date,
            temp_max_c=None if r.temp_max_c is None else float(r.temp_max_c),
            temp_min_c=None if r.temp_min_c is None else float(r.temp_min_c),
            precipitation_mm=float(r.precipitation_mm or 0),
            precip_prob_pct=r.precip_prob_pct,
            warnings=day_warnings(r),
            detailed=i < DETAIL_DAYS,
        )
        for i, r in enumerate(days)
    ]


async def load_zone_forecast(db: AsyncSession, zone_id: str, today: date) -> list[ZoneForecast]:
    """Stored forecast rows of a zone from `today` on; empty when the zone has none
    (callers fall back to the estimate without forecast)."""
    res = await db.execute(
        select(ZoneForecast)
        .where(ZoneForecast.zone_id == zone_id, ZoneForecast.date >= today)
        .order_by(ZoneForecast.date)
    )
    return list(res.scalars())
