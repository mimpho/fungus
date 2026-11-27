"""
Weekly figures of the Meteo day bar: one bar per calendar week, for all of Catalonia.

Pure functions. A week runs Monday to Sunday (UTC days); the bar starts on the Monday
BAR_WEEKS_BACK weeks before the current week and ends on the last day with a figure. Each week
comes in two parts, `real` (before today) and `forecast` (today and later), so the current week
can be drawn split at today. A day without a figure never counts as zero.
Product rules: memory/observatory-meteo-plan.md, «Day selector».
"""
from collections.abc import Callable, Mapping, Sequence
from datetime import date, datetime, timedelta

from app.services.layer_probability import CellClimate, forecast_limit
from app.services.layer_rain import usable_days

BAR_WEEKS_BACK = 26

Combine = Callable[[list[float]], float]


def week_start(day: date) -> date:
    return day - timedelta(days=day.weekday())


def first_bar_day(today: date) -> date:
    """First day of the bar (and of a link's `dia`: the front end follows the same rule)."""
    return week_start(today) - timedelta(weeks=BAR_WEEKS_BACK)


def mean(values: list[float]) -> float:
    return sum(values) / len(values)


def _part(values: list[float], combine: Combine) -> dict:
    return {"days": len(values), "value": round(combine(values), 1) if values else None}


def weekly(
    daily: Mapping[date, float | None], today: date, end: date, combine: Combine
) -> list[dict]:
    """The weeks from `first_bar_day` to `end`, the last one cut there. `daily` holds one figure
    per day (missing or None = no figure); `combine` turns a part's days into its value (`sum`
    for rain, `mean` for conditions)."""
    out = []
    start = first_bar_day(today)
    while start <= end:
        last = min(start + timedelta(days=6), end)
        days = [start + timedelta(days=i) for i in range((last - start).days + 1)]
        found = [(d, daily.get(d)) for d in days]
        real = [v for d, v in found if v is not None and d < today]
        ahead = [v for d, v in found if v is not None and d >= today]
        out.append({
            "from": start.isoformat(),
            "to": last.isoformat(),
            "real": _part(real, combine),
            "forecast": _part(ahead, combine),
        })
        start += timedelta(days=7)
    return out


def weeks_answer(daily: Mapping[date, float | None], today: date, combine: Combine) -> dict:
    """What the endpoint says about a series: its range and its weeks. `max_date` is the last day
    with a figure inside the range (null with none); the weeks always reach today."""
    first, limit = first_bar_day(today), forecast_limit(today)
    known = [d for d, v in daily.items() if v is not None and first <= d <= limit]
    reach = max(known, default=None)
    return {
        "first_date": first.isoformat(),
        "forecast_from": today.isoformat(),
        "max_date": reach.isoformat() if reach else None,
        "weeks": weekly(daily, today, max(reach or today, today), combine),
    }


def rain_daily(
    cells: Sequence[CellClimate], today: date, fresh_since: datetime | None
) -> dict[date, float]:
    """{day: rain of all Catalonia in mm}: the mean over the cells that have the day, with the
    rain layer's own rules for what counts as a day (`usable_days`). A day no cell has is
    absent."""
    totals: dict[date, list[float]] = {}
    for c in cells:
        days = usable_days(c.rows, today, fresh_since)
        for day, mm in (days.past | days.ahead).items():
            entry = totals.setdefault(day, [0.0, 0])
            entry[0] += mm
            entry[1] += 1
    return {day: total / count for day, (total, count) in totals.items()}
