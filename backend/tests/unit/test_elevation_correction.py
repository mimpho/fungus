"""Altitude correction of a cell to a point (T3 of feat/observatory-api). Pure, no DB."""
from datetime import date

import pytest

from app.services.elevation_correction import (
    correct_day,
    correct_days,
    elevation_delta_m,
)
from app.services.scoring_v2 import ClimateDay


def _day(**kw) -> ClimateDay:
    base = dict(
        date=date(2026, 10, 1), temp_max_c=20.0, temp_min_c=8.0, temp_avg_c=14.0,
        soil_temp_c=13.0, precipitation_mm=4.0, humidity_pct=70.0, wind_kmh=12.0,
    )
    return ClimateDay(**{**base, **kw})


class TestAPointAbove:
    def test_temperature_and_soil_are_3_25_degrees_lower_at_500_m(self):
        out = correct_day(_day(), 500)
        assert out.temp_max_c == pytest.approx(16.75)
        assert out.temp_min_c == pytest.approx(4.75)
        assert out.temp_avg_c == pytest.approx(10.75)
        assert out.soil_temp_c == pytest.approx(9.75)

    def test_humidity_is_0_65_points_lower_at_500_m(self):
        assert correct_day(_day(), 500).humidity_pct == pytest.approx(69.35)

    def test_rain_and_wind_are_not_corrected(self):
        out = correct_day(_day(), 500)
        assert (out.precipitation_mm, out.wind_kmh) == (4.0, 12.0)

    def test_the_date_and_gap_flag_are_kept(self):
        out = correct_day(_day(filled=True), 500)
        assert out.date == date(2026, 10, 1) and out.filled is True


class TestAPointBelow:
    def test_it_is_warmer_and_more_humid(self):
        out = correct_day(_day(), -300)
        assert out.temp_avg_c == pytest.approx(15.95)
        assert out.humidity_pct == pytest.approx(70.39)


class TestEdges:
    def test_no_difference_returns_the_same_day(self):
        d = _day()
        assert correct_day(d, 0) is d

    def test_humidity_stays_between_0_and_100(self):
        assert correct_day(_day(humidity_pct=99.8), -2000).humidity_pct == 100.0
        assert correct_day(_day(humidity_pct=0.2), 2000).humidity_pct == 0.0

    def test_it_does_not_change_the_input(self):
        d = _day()
        correct_day(d, 500)
        assert d.temp_avg_c == 14.0

    def test_a_whole_series_is_shifted_day_by_day(self):
        series = [_day(), _day(date=date(2026, 10, 2), temp_avg_c=10.0)]
        out = correct_days(series, 1000)
        assert [round(d.temp_avg_c, 2) for d in out] == [7.5, 3.5]


class TestDelta:
    def test_point_minus_cell(self):
        assert elevation_delta_m(1380, 667) == 713
        assert elevation_delta_m(400, 667) == -267

    def test_unknown_elevation_means_no_correction(self):
        assert elevation_delta_m(None, 667) == 0.0
        assert elevation_delta_m(1380, None) == 0.0
