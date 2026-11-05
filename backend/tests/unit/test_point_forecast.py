"""Forecast of a point. Pure, no DB."""
from datetime import timedelta

from app.services.point_forecast import FORECAST_DAYS, build_forecast
from tests.unit.test_point_calendar import _forecast_rows
from tests.unit.test_point_series import TODAY, _rows


class TestForecast:
    def test_it_returns_the_forecast_from_today_and_not_the_real_days(self):
        out = build_forecast(_rows() + _forecast_rows(16), TODAY, 667, 667)
        assert out["forecast_days"] == 16
        assert out["days"][0]["date"] == TODAY.isoformat()
        assert out["days"][-1]["date"] == (TODAY + timedelta(days=15)).isoformat()

    def test_it_never_goes_past_16_days(self):
        out = build_forecast(_forecast_rows(25), TODAY, 667, 667)
        assert len(out["days"]) == FORECAST_DAYS

    def test_a_cell_without_forecast_gives_an_empty_list(self):
        out = build_forecast(_rows(), TODAY, 667, 667)
        assert out["days"] == [] and out["forecast_days"] == 0

    def test_a_day_with_missing_data_is_left_out(self):
        rows = _forecast_rows(3)
        rows[1].temp_max_c = None
        out = build_forecast(rows, TODAY, 667, 667)
        assert [d["date"] for d in out["days"]] == [rows[0].date.isoformat(), rows[2].date.isoformat()]

    def test_temperatures_follow_the_point_elevation_and_rain_does_not(self):
        rows = _forecast_rows(1, precipitation_mm=4.0)
        at_cell = build_forecast(rows, TODAY, 667, 667)["days"][0]
        higher = build_forecast(rows, TODAY, 667, 1067)["days"][0]
        assert higher["temp_max_c"] < at_cell["temp_max_c"]
        assert higher["temp_min_c"] < at_cell["temp_min_c"]
        assert higher["precipitation_mm"] == at_cell["precipitation_mm"] == 4.0
        assert higher["wind_kmh"] == at_cell["wind_kmh"]
