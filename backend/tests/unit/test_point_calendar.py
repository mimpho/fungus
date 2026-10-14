"""Calendar of a point (T7 of feat/observatory-api). Pure, no DB."""
from datetime import timedelta
from types import SimpleNamespace

from app.services.point_calendar import (
    AHEAD_DAYS,
    GOOD_SCORE,
    REAL_DAYS,
    build_calendar,
    estimate_day,
)
from app.services.scoring_v2 import ClimateDay, SpeciesParams
from tests.unit.test_point_series import TODAY, _rows

REF = TODAY - timedelta(days=1)  # last real day


def _forecast_rows(days=16, start=TODAY, **kw):
    out = []
    for i in range(days):
        base = dict(
            date=start + timedelta(days=i), temp_max_c=19.0, temp_min_c=9.0, temp_avg_c=14.0,
            soil_temp_c=13.0, precipitation_mm=0.0, humidity_pct=75, wind_kmh=10,
        )
        out.append(SimpleNamespace(**{**base, **kw}))
    return out


def _cal(rows=None, **kw):
    return build_calendar(rows or _rows(), TODAY, 667, 667, **kw)


class TestShape:
    def test_it_has_the_last_7_real_days_and_the_next_35(self):
        cal = _cal(_rows() + _forecast_rows())
        days = cal["days"]
        assert len(days) == REAL_DAYS + AHEAD_DAYS
        assert [d["basis"] for d in days[:REAL_DAYS]] == ["real"] * REAL_DAYS
        assert days[REAL_DAYS - 1]["date"] == REF.isoformat()
        assert days[REAL_DAYS]["date"] == TODAY.isoformat()
        assert days[-1]["date"] == (REF + timedelta(days=AHEAD_DAYS)).isoformat()

    def test_the_dates_are_consecutive(self):
        days = _cal(_rows() + _forecast_rows())["days"]
        dates = [d["date"] for d in days]
        assert dates == [(REF - timedelta(days=6 - i)).isoformat() for i in range(len(dates))]

    def test_no_data_means_no_calendar(self):
        assert build_calendar([], TODAY, 667, 667) is None


class TestForecastThenEstimate:
    def test_the_stored_forecast_is_used_as_far_as_it_reaches(self):
        cal = _cal(_rows() + _forecast_rows(16))
        future = cal["days"][REAL_DAYS:]
        assert [d["basis"] for d in future[:16]] == ["forecast"] * 16
        assert [d["basis"] for d in future[16:]] == ["estimate"] * (AHEAD_DAYS - 16)
        assert cal["forecast_days"] == 16

    def test_without_any_forecast_every_future_day_is_an_estimate_without_forecast(self):
        cal = _cal()
        future = cal["days"][REAL_DAYS:]
        assert all(d["basis"] == "estimate" and d["estimated_without_forecast"] for d in future)
        assert cal["forecast_days"] == 0

    def test_real_and_forecast_days_are_not_flagged_as_estimates(self):
        cal = _cal(_rows() + _forecast_rows(3))
        assert not any(d["estimated_without_forecast"] for d in cal["days"][:REAL_DAYS + 3])

    def test_forecast_rain_shows_in_the_calendar(self):
        rows = _rows() + _forecast_rows(4, precipitation_mm=22.0)
        future = _cal(rows)["days"][REAL_DAYS:]
        assert future[0]["precipitation_mm"] == 22.0
        assert future[10]["precipitation_mm"] == 0.0  # estimate: no rain

    def test_a_forecast_row_with_missing_values_falls_back_to_the_estimate(self):
        rows = _rows() + _forecast_rows(3)
        rows[-2].temp_max_c = None
        future = _cal(rows)["days"][REAL_DAYS:]
        assert [d["basis"] for d in future[:3]] == ["forecast", "estimate", "forecast"]


class TestEstimate:
    def test_no_rain_and_the_last_weeks_means(self):
        week = [
            ClimateDay(REF - timedelta(days=i), 20.0 + i, 8.0, 14.0, 13.0, 5.0, 70.0, 12.0)
            for i in range(7)
        ]
        e = estimate_day(TODAY, week)
        assert e.precipitation_mm == 0.0
        assert e.temp_max_c == 23.0 and e.temp_min_c == 8.0 and e.wind_kmh == 12.0
        assert e.humidity_pct == 70.0

    def test_humidity_is_capped_at_85_percent(self):
        week = [ClimateDay(REF - timedelta(days=i), 20, 8, 14, 13, 0, 95.0, 5) for i in range(7)]
        assert estimate_day(TODAY, week).humidity_pct == 85.0

    def test_the_estimate_uses_the_real_week_not_the_forecast(self):
        rows = _rows() + _forecast_rows(16, temp_max_c=5.0, temp_avg_c=0.0, temp_min_c=-5.0)
        future = _cal(rows)["days"][REAL_DAYS:]
        assert future[20]["temp_max_c"] == 21.0  # _rows() maxima, not the cold forecast


class TestSummary:
    def test_best_day_and_days_at_55_or_more(self):
        cal = _cal(_rows() + _forecast_rows())
        future = [d for d in cal["days"][REAL_DAYS:] if d["score"] is not None]
        top = max(d["score"] for d in future)
        earliest = next(d for d in future if d["score"] == top)
        assert cal["summary"]["best_day"] == {
            "date": earliest["date"], "score": top, "basis": earliest["basis"]}
        assert cal["summary"]["good_days"] == sum(d["score"] >= GOOD_SCORE for d in future)
        assert cal["summary"]["threshold"] == 55

    def test_the_summary_only_counts_future_days(self):
        cal = _cal()
        future_dates = {d["date"] for d in cal["days"][REAL_DAYS:]}
        assert cal["summary"]["best_day"]["date"] in future_dates


class TestDateAndSpecies:
    def test_an_earlier_date_is_a_pure_estimate_that_ignores_what_came_after(self):
        on = REF - timedelta(days=10)
        cal = _cal(_rows() + _forecast_rows(), on=on)
        assert cal["date"] == on.isoformat() and cal["forecast_days"] == 0
        assert all(d["basis"] == "estimate" for d in cal["days"][REAL_DAYS:])

    def test_a_date_after_the_data_is_clamped(self):
        cal = _cal(on=TODAY + timedelta(days=9))
        assert cal["clamped"] is True and cal["date"] == REF.isoformat()

    def test_the_species_changes_the_scores(self):
        def total(cal):
            return sum(d["score"] for d in cal["days"] if d["score"] is not None)

        cold = SpeciesParams(-5.0, -2.0, 2.0)
        assert total(_cal(species=cold)) != total(_cal())

    def test_the_climate_is_shifted_to_the_point_elevation(self):
        low = build_calendar(_rows() + _forecast_rows(), TODAY, 667, 667)
        high = build_calendar(_rows() + _forecast_rows(), TODAY, 667, 1667)
        assert high["days"][REAL_DAYS]["temp_max_c"] == low["days"][REAL_DAYS]["temp_max_c"] - 6.5
