"""Soil temperature picked from Open-Meteo's hourly series (weather_cache)."""
from app.services.weather_cache import _current_hour_value

HOURLY = {
    "time": ["2026-10-07T10:00", "2026-10-07T11:00", "2026-10-07T12:00", "2026-10-07T13:00"],
    "soil_temperature_0cm": [11.04, 12.36, 13.71, 15.0],
}


def test_takes_the_current_hour():
    assert _current_hour_value(HOURLY, "soil_temperature_0cm", "2026-10-07T12:15") == 13.7


def test_falls_back_to_last_value_before_now_when_hour_is_null():
    hourly = {**HOURLY, "soil_temperature_0cm": [11.04, 12.36, None, 15.0]}
    assert _current_hour_value(hourly, "soil_temperature_0cm", "2026-10-07T12:15") == 12.4


def test_missing_series_or_time_returns_none_or_latest():
    assert _current_hour_value({}, "soil_temperature_0cm", "2026-10-07T12:15") is None
    # Without current.time, the latest available value is used
    assert _current_hour_value(HOURLY, "soil_temperature_0cm", None) == 15.0
