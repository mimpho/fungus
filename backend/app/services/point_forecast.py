"""
Forecast of a point: the weather the cell's stored forecast announces, shifted to the point.

The cell keeps the Open-Meteo forecast (16 days from today). This returns it as it is, day by
day, with the same altitude correction as the series and the calendar (air temperature and
humidity; rain and wind stay the cell's regional value). No score here: it is the weather, the
score of those days is the calendar's.
"""
from collections.abc import Sequence
from datetime import date
from typing import Any

from app.services.elevation_correction import correct_day, elevation_delta_m
from app.services.scoring_v2 import ClimateDay

FORECAST_DAYS = 16


def build_forecast(
    rows: Sequence[Any],
    today: date,
    cell_elevation_m: float | None,
    point_elevation_m: float | None,
) -> dict:
    """The forecast days from `today` on (at most 16), oldest first. Empty when there is none."""
    delta = elevation_delta_m(point_elevation_m, cell_elevation_m)
    days = sorted(
        (d for r in rows if r.date >= today and (d := ClimateDay.from_row(r)) is not None),
        key=lambda d: d.date,
    )[:FORECAST_DAYS]
    return {
        "from": today.isoformat(),
        "forecast_days": len(days),
        "days": [_entry(correct_day(d, delta)) for d in days],
    }


def _entry(d: ClimateDay) -> dict:
    return {
        "date": d.date.isoformat(),
        "temp_max_c": round(d.temp_max_c, 1),
        "temp_min_c": round(d.temp_min_c, 1),
        "temp_avg_c": round(d.temp_avg_c, 1),
        "precipitation_mm": round(d.precipitation_mm, 1),
        "humidity_pct": round(d.humidity_pct),
        "wind_kmh": round(d.wind_kmh),
    }
