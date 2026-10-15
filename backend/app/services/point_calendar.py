"""
Calendar of a point: the last 7 real days and the next 35.

The next days use the cell's stored forecast (16 days from today) as far as it reaches; after
that, and whenever there is none, an estimate without forecast: no rain, and the mean
temperatures, humidity (at most 85 %) and wind of the last real week repeated. Every day says
which of the three it is, so the front never presents an estimate as a forecast.
"""
from collections.abc import Sequence
from datetime import date, timedelta
from typing import Any

from app.services.elevation_correction import correct_day, elevation_delta_m
from app.services.point_series import prepare_climate
from app.services.scoring import score_label
from app.services.scoring_v2 import ClimateDay, SpeciesParams, V2Result, compute_v2_series
from app.services.zone_scores import V2_WINDOW_DAYS

REAL_DAYS = 7
AHEAD_DAYS = 35
GOOD_SCORE = 55  # "Bueno" and above
ESTIMATE_MAX_HUMIDITY_PCT = 85.0


def estimate_day(day: date, last_week: Sequence[ClimateDay]) -> ClimateDay:
    """A day with no rain and the last week's mean temperatures, humidity (max 85 %), wind."""
    n = len(last_week)

    def mean(name: str) -> float:
        return sum(getattr(d, name) for d in last_week) / n

    return ClimateDay(
        date=day,
        temp_max_c=mean("temp_max_c"),
        temp_min_c=mean("temp_min_c"),
        temp_avg_c=mean("temp_avg_c"),
        soil_temp_c=mean("soil_temp_c"),
        precipitation_mm=0.0,
        humidity_pct=min(ESTIMATE_MAX_HUMIDITY_PCT, mean("humidity_pct")),
        wind_kmh=mean("wind_kmh"),
    )


def _entry(day: ClimateDay, basis: str, v2: V2Result | None) -> dict:
    return {
        "date": day.date.isoformat(),
        "basis": basis,  # real | forecast | estimate
        "estimated_without_forecast": basis == "estimate",
        "score": None if v2 is None else v2.score,
        "label": None if v2 is None else score_label(v2.score),
        "limiting_factor": None if v2 is None else v2.limiting_factor,
        "temp_max_c": round(day.temp_max_c, 1),
        "temp_min_c": round(day.temp_min_c, 1),
        "precipitation_mm": round(day.precipitation_mm, 1),
    }


def build_calendar(
    rows: Sequence[Any],
    today: date,
    cell_elevation_m: float | None,
    point_elevation_m: float | None,
    on: date | None = None,
    species: SpeciesParams | None = None,
) -> dict | None:
    prepared = prepare_climate(rows, today, cell_elevation_m, point_elevation_m)
    if prepared is None:
        return None
    corrected, elevation = prepared
    last = corrected[-1].date
    ref = min(on, last) if on else last
    history = [d for d in corrected if d.date <= ref]
    window = [d for d in history if d.date >= ref - timedelta(days=V2_WINDOW_DAYS)]

    # The stored forecast is only the right basis when counting from the last real day: from an
    # earlier date the calendar is a pure estimate, it must not look at what happened afterwards.
    forecast: dict[date, ClimateDay] = {}
    if ref == last:
        delta = elevation_delta_m(point_elevation_m, cell_elevation_m)
        for r in rows:
            d = ClimateDay.from_row(r) if r.date > ref else None
            if d is not None:
                forecast[d.date] = correct_day(d, delta)

    last_week = history[-REAL_DAYS:]
    ahead: list[tuple[ClimateDay, str]] = []
    for i in range(1, AHEAD_DAYS + 1):
        day = ref + timedelta(days=i)
        if day in forecast:
            ahead.append((forecast[day], "forecast"))
        else:
            ahead.append((estimate_day(day, last_week), "estimate"))

    first = ref - timedelta(days=REAL_DAYS - 1)
    scored = {
        r.date: r
        for r in compute_v2_series(
            [*window, *(d for d, _ in ahead)], elevation, species, output_from=first
        )
    }
    real = [_entry(d, "real", scored.get(d.date)) for d in history if d.date >= first]
    future = [_entry(d, basis, scored.get(d.date)) for d, basis in ahead]

    scored_future = [e for e in future if e["score"] is not None]
    best = None  # the earliest day among those with the highest score
    for e in scored_future:
        if best is None or e["score"] > best["score"]:
            best = e
    return {
        "date": ref.isoformat(),
        "last_data_date": last.isoformat(),
        "clamped": bool(on and on > last),
        "forecast_days": sum(1 for e in future if e["basis"] == "forecast"),
        "days": [*real, *future],
        "summary": {
            "best_day": None if best is None else {
                "date": best["date"], "score": best["score"], "basis": best["basis"]},
            "good_days": sum(1 for e in scored_future if e["score"] >= GOOD_SCORE),
            "threshold": GOOD_SCORE,
        },
    }
