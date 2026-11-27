"""A day without a rain value is not 0 mm (scenario 1.13 of memory/observatory-meteo-plan.md).
No DB, no network."""
from dataclasses import replace
from datetime import date, timedelta

from app.connectors.open_meteo import OpenMeteoConnector
from app.services.cell_provider import build_rows
from tests.unit.test_cell_provider import SANTA_FE, TODAY, FakeStore, _day, _provider
from tests.unit.test_ingest import _payload

START = date(2026, 10, 1)


def _missing(d: date):
    return replace(_day(d), precipitation_mm=0.0, precipitation_missing=True)


class TestConnector:
    def _parse(self, values):
        raw = _payload(START, START + timedelta(days=2))
        raw["daily"]["precipitation_sum"] = values
        return OpenMeteoConnector("cell", 42.0, 2.0)._parse(raw, START, START)

    def test_a_null_value_is_flagged_and_a_zero_is_not(self):
        got = self._parse([None, 0.0, 4.2])
        assert [r.precipitation_missing for r in got] == [True, False, False]
        assert [r.precipitation_mm for r in got] == [0.0, 0.0, 4.2]  # the zones read this

    def test_a_day_past_the_end_of_the_list_is_flagged(self):
        assert [r.precipitation_missing for r in self._parse([1.0])] == [False, True, True]


class TestCellRows:
    def test_a_day_without_rain_value_is_not_written_observed_or_forecast(self):
        history = [_day(TODAY - timedelta(days=2)), _missing(TODAY - timedelta(days=1))]
        forecast = [_missing(TODAY), _day(TODAY + timedelta(days=1))]
        rows = build_rows("c", history, forecast, TODAY)
        assert [r["date"] for r in rows] == [
            TODAY - timedelta(days=2), TODAY + timedelta(days=1)]

    async def test_the_refresh_keeps_the_row_it_already_had(self):
        provider, _ = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        cid = next(iter(store.cells))
        yesterday = (cid, TODAY - timedelta(days=1))
        store.rows[yesterday] = {**store.rows[yesterday], "precipitation_mm": 12.0}

        class _NoRainYesterday:
            async def fetch_range_and_forecast(self, start, end, forecast_days=0):
                return [_missing(end)], []

        provider._factory = lambda *args: _NoRainYesterday()
        await provider.refresh_recent(store, cid)
        assert store.rows[yesterday]["precipitation_mm"] == 12.0

    async def test_a_refresh_with_no_rain_values_at_all_writes_nothing_and_does_not_fail(self):
        provider, _ = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        cid = next(iter(store.cells))
        before = dict(store.rows)

        class _NoRain:
            async def fetch_range_and_forecast(self, start, end, forecast_days=0):
                return [_missing(end)], []

        provider._factory = lambda *args: _NoRain()
        await provider.refresh_recent(store, cid)
        assert store.rows == before
