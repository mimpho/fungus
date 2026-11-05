"""Forecast storage in the daily ingest, the connector's single call, and day warnings.

No database or network. Scenarios follow memory/observatory-plan.md, section 6.
"""
from datetime import date, timedelta
from types import SimpleNamespace

import pytest

from app.config import settings
from app.connectors.base import DailyWeatherData
from app.connectors.open_meteo import FORECAST_DAILY_VARS, OpenMeteoConnector
from app.services import forecast as fc
from app.services import ingest
from tests.unit.test_ingest import _FakeConnector, _payload, _StrictSession

TODAY = date.today()


def _payload_with_prob(start: date, end: date, soil_key: str = "soil_temperature_0cm") -> dict:
    raw = _payload(start, end, soil_key)
    raw["daily"]["precipitation_probability_max"] = [40] * len(raw["daily"]["time"])
    return raw


# ── Connector: same call for recent days and forecast ─────────────────────────

class TestConnectorForecast:
    async def _run(self, monkeypatch, start, end, days=16):
        calls = []

        async def fake_request(self, s, e, archive=False):
            calls.append((s, e, archive))
            return _payload_with_prob(s, e)

        monkeypatch.setattr(OpenMeteoConnector, "_request", fake_request)
        monkeypatch.setattr("app.connectors.open_meteo._utc_today", lambda: TODAY)
        out = await OpenMeteoConnector("zone-x", 42.0, 2.0).fetch_range_and_forecast(
            start, end, forecast_days=days
        )
        return calls, out

    async def test_daily_run_asks_once_and_gets_16_days(self, monkeypatch):
        y = TODAY - timedelta(days=1)
        calls, (history, forecast) = await self._run(monkeypatch, y - timedelta(days=6), y)
        assert len(calls) == 1 and calls[0][2] is False  # one forecast-API call, as before
        assert history[-1].date == y and len(history) == 7
        assert [r.date for r in forecast] == [TODAY + timedelta(days=i) for i in range(16)]

    async def test_between_midnight_and_2am_in_madrid_it_does_not_ask_for_day_16(
        self, monkeypatch
    ):
        # Local date is already tomorrow; Open-Meteo still counts from the UTC date.
        y = TODAY - timedelta(days=1)
        calls = []

        async def fake_request(self, s, e, archive=False):
            calls.append((s, e))
            return _payload_with_prob(s, e)

        monkeypatch.setattr(OpenMeteoConnector, "_request", fake_request)
        monkeypatch.setattr(
            "app.connectors.open_meteo._utc_today", lambda: TODAY - timedelta(days=1)
        )
        await OpenMeteoConnector("zone-x", 42.0, 2.0).fetch_range_and_forecast(
            y - timedelta(days=6), y, forecast_days=16
        )
        assert calls[0][1] == TODAY + timedelta(days=14)  # UTC today + 15, not local + 15

    async def test_a_400_keeps_the_providers_reason(self, monkeypatch):
        import httpx

        from app.connectors.base import ProviderUnavailable

        class _Resp:
            status_code = 400
            text = '{"error":true,"reason":"Parameter \'end_date\' is out of allowed range"}'

            def raise_for_status(self):
                raise httpx.HTTPStatusError("bad", request=None, response=self)

        class _Client:
            def __init__(self, *a, **k): ...
            async def __aenter__(self): return self
            async def __aexit__(self, *a): ...
            async def get(self, url, params): return _Resp()

        monkeypatch.setattr("app.connectors.open_meteo.httpx.AsyncClient", _Client)
        with pytest.raises(ProviderUnavailable, match="out of allowed range"):
            await OpenMeteoConnector("zone-x", 42.0, 2.0)._request(TODAY, TODAY)

    async def test_forecast_keeps_precipitation_probability(self, monkeypatch):
        y = TODAY - timedelta(days=1)
        _, (_, forecast) = await self._run(monkeypatch, y, y)
        assert forecast[0].precip_prob_pct == 40

    async def test_no_forecast_requested_changes_nothing(self, monkeypatch):
        y = TODAY - timedelta(days=1)
        calls, (history, forecast) = await self._run(monkeypatch, y, y, days=0)
        assert forecast == [] and len(history) == 1
        assert calls[0][1] == y

    async def test_backfill_range_in_the_past_never_asks_for_forecast(self, monkeypatch):
        calls, (history, forecast) = await self._run(
            monkeypatch, date(2024, 10, 1), date(2024, 10, 31)
        )
        assert forecast == [] and all(c[2] for c in calls)  # archive only

    def test_archive_request_does_not_ask_for_precip_probability(self):
        # The archive API rejects the variable; only the forecast API gets it.
        assert "precipitation_probability_max" in FORECAST_DAILY_VARS


# ── Ingest: forecast is stored apart from observed days ───────────────────────

class _ForecastConnector(_FakeConnector):
    async def fetch_range_and_forecast(self, start, end, forecast_days=0):
        history = await self.fetch_range(start, end)
        future = [
            DailyWeatherData(
                zone_id=self.zone_id, date=TODAY + timedelta(days=i),
                temp_max_c=20.0, temp_min_c=8.0, temp_avg_c=14.0, soil_temp_c=12.0,
                precipitation_mm=1.0, humidity_pct=80, wind_kmh=10, source="open-meteo",
                precip_prob_pct=30,
            )
            for i in range(forecast_days)
        ]
        return history, future


def _patch(monkeypatch, forecast_fails_for=None):
    climate, stored = [], {}

    async def fake_climate(session, row):
        await session.execute(None)
        climate.append(row)

    async def fake_replace(session, zone_id, rows):
        if zone_id == forecast_fails_for:
            raise ValueError("forecast write failed")
        await session.execute(None)
        stored[zone_id] = rows

    monkeypatch.setattr(ingest, "_get_connector", lambda z: _ForecastConnector(z.id))
    monkeypatch.setattr(ingest, "_upsert_climate_row", fake_climate)
    monkeypatch.setattr(ingest, "_replace_forecast", fake_replace)
    return climate, stored


async def test_forecast_rows_go_to_their_table_not_to_climate_history(monkeypatch):
    zones = [SimpleNamespace(id=f"zone-{i:03d}", lat=42.0, lon=2.0) for i in range(5)]
    climate, stored = _patch(monkeypatch)
    y = TODAY - timedelta(days=1)

    result = await ingest._ingest_date_range(
        _StrictSession(), zones, start=y - timedelta(days=6), end=y, forecast_days=16
    )

    assert result["errors"] == []
    assert result["upserted"] == 5 * 7 and result["forecast_rows"] == 5 * 16
    assert all(r.date <= y for r in climate)  # nothing from today on in climate_history
    assert all(len(rows) == 16 for rows in stored.values()) and len(stored) == 5


async def test_a_failing_forecast_write_keeps_the_observed_days(monkeypatch):
    zones = [SimpleNamespace(id=f"zone-{i:03d}", lat=42.0, lon=2.0) for i in range(3)]
    climate, stored = _patch(monkeypatch, forecast_fails_for="zone-001")
    y = TODAY - timedelta(days=1)

    result = await ingest._ingest_date_range(
        _StrictSession(), zones, start=y, end=y, forecast_days=16
    )

    assert result["errors"] == []  # not a zone error: the observed day is saved
    assert result["upserted"] == 3
    assert set(stored) == {"zone-000", "zone-002"}


async def test_backfill_stores_no_forecast(monkeypatch):
    zones = [SimpleNamespace(id="zone-000", lat=42.0, lon=2.0)]
    climate, stored = _patch(monkeypatch)
    result = await ingest._ingest_date_range(
        _StrictSession(), zones, start=date(2024, 10, 1), end=date(2024, 10, 3)
    )
    assert stored == {} and result["forecast_rows"] == 0


def test_the_daily_run_asks_for_16_days_by_default():
    assert settings.forecast_days == 16


# ── Warnings and shape of the stored forecast ─────────────────────────────────

def _row(day, tmax=18.0, tmin=6.0, rain=0.0, prob=None):
    return SimpleNamespace(
        date=day, temp_max_c=tmax, temp_min_c=tmin, precipitation_mm=rain, precip_prob_pct=prob
    )


class TestWarnings:
    def test_frost_when_the_minimum_is_below_zero(self):
        assert fc.day_warnings(_row(TODAY, tmin=-0.5)) == ("frost",)
        assert fc.day_warnings(_row(TODAY, tmin=0.0)) == ()

    def test_heat_above_25(self):
        assert fc.day_warnings(_row(TODAY, tmax=25.1)) == ("heat",)
        assert fc.day_warnings(_row(TODAY, tmax=25.0)) == ()

    def test_useful_rain_from_10_mm(self):
        assert fc.day_warnings(_row(TODAY, rain=10.0)) == ("useful_rain",)
        assert fc.day_warnings(_row(TODAY, rain=9.9)) == ()

    def test_several_warnings_keep_a_fixed_order(self):
        assert fc.day_warnings(_row(TODAY, tmax=27, tmin=-1, rain=12)) == (
            "frost", "heat", "useful_rain",
        )

    def test_missing_temperatures_give_no_warning(self):
        assert fc.day_warnings(_row(TODAY, tmax=None, tmin=None)) == ()


class TestBuildForecastDays:
    def test_first_seven_days_are_cards_the_rest_trend(self):
        rows = [_row(TODAY + timedelta(days=i)) for i in range(16)]
        days = fc.build_forecast_days(rows, TODAY)
        assert [d.detailed for d in days] == [True] * 7 + [False] * 9

    def test_past_days_are_ignored_and_order_is_by_date(self):
        rows = [_row(TODAY + timedelta(days=1)), _row(TODAY - timedelta(days=2)), _row(TODAY)]
        days = fc.build_forecast_days(rows, TODAY)
        assert [d.day for d in days] == [TODAY, TODAY + timedelta(days=1)]

    def test_empty_forecast_gives_empty_list(self):
        assert fc.build_forecast_days([], TODAY) == []
