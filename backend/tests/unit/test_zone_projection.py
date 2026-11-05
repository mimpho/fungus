"""Projected scores: real climate plus a forecast, scored with v2."""

import json
from datetime import date, timedelta
from pathlib import Path
from types import SimpleNamespace

from app.services.zone_projection import project_scores

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "climate"
LAST = date(2026, 10, 6)  # last real day of the fixtures


def fixture(zone_id: str):
    doc = json.loads((FIXTURES / f"{zone_id}.json").read_text())
    cols = doc["columns"]
    rows = []
    for r in doc["rows"]:
        values = dict(zip(cols, r, strict=True))
        values["date"] = date.fromisoformat(values["date"])
        rows.append(SimpleNamespace(**values))
    return doc["elevation_m"], rows


def day(offset: int, rain: float, tmax=18.0, tmin=8.0):
    return SimpleNamespace(
        date=LAST + timedelta(days=offset),
        temp_max_c=tmax,
        temp_min_c=tmin,
        temp_avg_c=(tmax + tmin) / 2,
        soil_temp_c=11.0,
        precipitation_mm=rain,
        humidity_pct=80.0,
        wind_kmh=8.0,
    )


def test_days_after_the_last_real_one_are_flagged_as_forecast():
    elevation, rows = fixture("zone-003")
    dry = [day(i, 0.0) for i in range(1, 4)]
    out = project_scores(rows, dry, elevation, from_date=LAST)
    assert [d.forecast for d in out] == [False, True, True, True]
    assert out[0].day == LAST


def test_a_real_day_wins_over_a_forecast_day_with_the_same_date():
    elevation, rows = fixture("zone-003")
    wrong = [day(0, 80.0)]  # a forecast for a day that already has real data
    with_wrong = project_scores(rows, wrong, elevation, from_date=LAST)
    alone = project_scores(rows, [], elevation, from_date=LAST)
    assert with_wrong[0].score == alone[0].score


def test_a_rainy_forecast_does_not_lower_the_score_of_the_real_days():
    elevation, rows = fixture("zone-003")
    rain = [day(i, 25.0) for i in range(1, 4)]
    dry = [day(i, 0.0) for i in range(1, 4)]
    wet = project_scores(rows, rain, elevation, from_date=LAST)
    no = project_scores(rows, dry, elevation, from_date=LAST)
    assert wet[0].score == no[0].score  # the real day does not depend on what follows


def test_no_history_gives_no_projection():
    assert project_scores([], [day(1, 0.0)], 900, from_date=LAST) == []
