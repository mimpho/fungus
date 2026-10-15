"""Per-cell provider: resolution, on-demand loading, cache, budget. No DB, no network.

Scenarios follow memory/observatory-plan.md, «Update 2026-10-14».
"""
import asyncio
from datetime import UTC, date, datetime, timedelta

import pytest

from app.connectors.base import DailyWeatherData, ProviderUnavailable
from app.connectors.open_meteo import ARCHIVE_CUTOFF_DAYS, OpenMeteoConnector
from app.models.climate_cell import cell_id as make_cell_id
from app.models.climate_cell import lookup_key
from app.services.cell_provider import (
    FORECAST_DAYS,
    HISTORY_DAYS,
    CellBudgetExceeded,
    CellInfo,
    CellProvider,
    build_rows,
    should_overwrite,
)

TODAY = date(2026, 10, 14)
NOW = datetime(2026, 10, 14, 18, 0, tzinfo=UTC)

# Santa Fe del Montseny and a point ~15 km away in a different cell.
SANTA_FE = (41.7745, 2.4350)
SANTA_FE_NEAR = (41.7800, 2.4400)  # a different 500 m bucket, same cell
FAR = (42.2000, 1.8000)


def _day(d: date, tag: str = "x") -> DailyWeatherData:
    return DailyWeatherData(
        zone_id=tag, date=d, temp_max_c=20.0, temp_min_c=10.0, temp_avg_c=15.0,
        soil_temp_c=14.0, precipitation_mm=1.0, humidity_pct=80, wind_kmh=10,
        source="open-meteo",
    )


class FakeConnector:
    """Stands in for OpenMeteoConnector; counts calls shared through `log`."""

    def __init__(self, log, cell_id, lat, lon, elevation, fail=False):
        self.log, self.cell_id, self.fail = log, cell_id, fail
        self.lat, self.lon, self.elevation = lat, lon, elevation

    async def resolve_grid(self):
        self.log["resolve"].append((self.lat, self.lon))
        await asyncio.sleep(0)
        # Everything within 0.2 degrees snaps to the same grid cell.
        return (round(self.lat * 5) / 5, round(self.lon * 5) / 5, 667.0)

    async def fetch_range_and_forecast(self, start, end, forecast_days=0):
        self.log["fetch"].append((self.cell_id, self.lat, self.lon, self.elevation, start, end))
        await asyncio.sleep(0)
        if self.fail:
            raise ProviderUnavailable("down")
        days = (end - start).days + 1
        history = [_day(start + timedelta(days=i)) for i in range(days)]
        forecast = [_day(TODAY + timedelta(days=i)) for i in range(forecast_days)]
        return history, forecast


class FakeStore:
    def __init__(self):
        self.lookups, self.cells, self.rows = {}, {}, {}
        self.created_at: dict[str, datetime] = {}

    async def get_lookup(self, key):
        return self.lookups.get(key)

    async def save_lookup(self, key, cell_id):
        self.lookups[key] = cell_id

    async def get_cell(self, cell_id):
        return self.cells.get(cell_id)

    async def create_cell(self, cell):
        self.cells[cell.id] = cell
        self.created_at[cell.id] = NOW

    async def count_cells_created_since(self, since):
        return sum(1 for t in self.created_at.values() if t >= since)

    async def upsert_rows(self, rows):
        for r in rows:
            key = (r["cell_id"], r["date"])
            old = self.rows.get(key)
            if should_overwrite(old["source"] if old else None, r["source"]):
                self.rows[key] = r

    async def mark_loaded(self, cell_id, loaded_from, loaded_to, at):
        c = self.cells[cell_id]
        c.loaded_from, c.loaded_to = loaded_from, loaded_to


def _provider(log=None, fail=False, max_new=60):
    log = log if log is not None else {"resolve": [], "fetch": []}
    provider = CellProvider(
        connector_factory=lambda cid, lat, lon, elev: FakeConnector(log, cid, lat, lon, elev, fail),
        max_new_cells_per_day=max_new,
        today=lambda: TODAY,
        now=lambda: NOW,
    )
    return provider, log


# ── Pure helpers ──────────────────────────────────────────────────────────────

def test_the_archive_is_never_replaced_by_the_forecast():
    assert should_overwrite("archive", "forecast") is False
    assert should_overwrite("forecast", "archive") is True
    assert should_overwrite("forecast", "forecast") is True
    assert should_overwrite(None, "forecast") is True


def test_rows_are_final_only_up_to_the_archive_cutoff():
    cutoff = TODAY - timedelta(days=ARCHIVE_CUTOFF_DAYS)
    history = [_day(cutoff - timedelta(days=1)), _day(cutoff), _day(cutoff + timedelta(days=1)),
               _day(TODAY - timedelta(days=1))]
    forecast = [_day(TODAY), _day(TODAY + timedelta(days=1))]
    rows = {r["date"]: r["source"] for r in build_rows("c", history, forecast, TODAY)}
    assert rows[cutoff - timedelta(days=1)] == "archive"
    assert rows[cutoff] == "archive"
    assert rows[cutoff + timedelta(days=1)] == "forecast"
    assert rows[TODAY - timedelta(days=1)] == "forecast"
    assert rows[TODAY] == rows[TODAY + timedelta(days=1)] == "forecast"


def test_nearby_clicks_share_a_bucket_and_far_ones_do_not():
    assert lookup_key(41.7741, 2.4349) == lookup_key(41.7744, 2.4352)
    assert lookup_key(*SANTA_FE) != lookup_key(*SANTA_FE_NEAR)
    assert lookup_key(*SANTA_FE) != lookup_key(*FAR)


# ── Scenarios ─────────────────────────────────────────────────────────────────

class TestFirstRequestLoadsTheCell:
    async def test_it_fetches_the_cell_with_its_own_coordinates_and_mean_elevation(self):
        provider, log = _provider()
        store = FakeStore()
        result = await provider.get(store, *SANTA_FE)
        assert result.source == "live"
        (cid, lat, lon, elev, start, end), = log["fetch"]
        cell = store.cells[cid]
        assert (lat, lon, elev) == (cell.lat, cell.lon, 667.0)  # the cell, not the click
        assert (start, end) == (TODAY - timedelta(days=HISTORY_DAYS), TODAY - timedelta(days=1))

    async def test_rows_are_stored_with_archive_or_forecast_and_the_cell_is_marked_loaded(self):
        provider, _ = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        sources = {r["source"] for r in store.rows.values()}
        assert sources == {"archive", "forecast"}
        assert max(d for _, d in store.rows) == TODAY + timedelta(days=FORECAST_DAYS - 1)
        cell = next(iter(store.cells.values()))
        assert cell.loaded_to == TODAY - timedelta(days=1)

    async def test_a_failure_leaves_the_cell_unloaded_so_the_next_click_retries(self):
        provider, _ = _provider(fail=True)
        store = FakeStore()
        with pytest.raises(ProviderUnavailable):
            await provider.get(store, *SANTA_FE)
        assert next(iter(store.cells.values())).loaded_to is None
        assert store.rows == {}
        provider2, log2 = _provider()
        again = await provider2.get(store, *SANTA_FE)
        assert again.source == "live" and len(log2["fetch"]) == 1


class TestTheCacheMakesLaterRequestsFree:
    async def test_the_second_request_makes_no_http_call(self):
        provider, log = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        calls = (len(log["resolve"]), len(log["fetch"]))
        again = await provider.get(store, *SANTA_FE)
        assert again.source == "stored"
        assert (len(log["resolve"]), len(log["fetch"])) == calls

    async def test_a_new_process_resolves_from_the_lookup_table_with_no_http_call(self):
        store = FakeStore()
        first, _ = _provider()
        await first.get(store, *SANTA_FE)
        restarted, log = _provider()  # empty memory cache
        result = await restarted.get(store, *SANTA_FE)
        assert result.source == "stored"
        assert log == {"resolve": [], "fetch": []}

    async def test_another_bucket_in_a_known_cell_resolves_once_and_does_not_reload(self):
        provider, log = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        result = await provider.get(store, *SANTA_FE_NEAR)
        assert result.source == "stored"
        assert len(log["resolve"]) == 2 and len(log["fetch"]) == 1
        assert len(store.cells) == 1 and len(store.lookups) == 2


class TestSimultaneousRequests:
    async def test_two_first_requests_for_the_same_point_call_open_meteo_once(self):
        provider, log = _provider()
        store = FakeStore()
        a, b = await asyncio.gather(
            provider.get(store, *SANTA_FE), provider.get(store, *SANTA_FE)
        )
        assert len(log["resolve"]) == 1 and len(log["fetch"]) == 1
        assert a.cell.id == b.cell.id

    async def test_two_different_buckets_of_one_new_cell_load_it_once(self):
        provider, log = _provider()
        store = FakeStore()
        await asyncio.gather(provider.get(store, *SANTA_FE), provider.get(store, *SANTA_FE_NEAR))
        assert len(log["fetch"]) == 1 and len(store.cells) == 1


class TestDailyBudget:
    async def test_a_new_cell_over_the_budget_is_refused_with_a_retry_time(self):
        provider, _ = _provider(max_new=1)
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        with pytest.raises(CellBudgetExceeded) as exc:
            await provider.get(store, *FAR)
        assert exc.value.retry_after == 6 * 3600  # 18:00 UTC -> next midnight

    async def test_cached_cells_keep_working_when_the_budget_is_spent(self):
        provider, _ = _provider(max_new=1)
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        with pytest.raises(CellBudgetExceeded):
            await provider.get(store, *FAR)
        assert (await provider.get(store, *SANTA_FE)).source == "stored"
        assert (await provider.get(store, *SANTA_FE_NEAR)).source == "stored"


class TestDailyRefresh:
    async def test_archive_days_replace_provisional_ones(self):
        provider, _ = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        cid = next(iter(store.cells))
        # The days that were provisional are now final in Open-Meteo's archive.
        recent = [(cid, TODAY - timedelta(days=i)) for i in range(1, 4)]
        assert all(store.rows[k]["source"] == "forecast" for k in recent)
        await store.upsert_rows([{**store.rows[k], "source": "archive"} for k in recent])
        assert all(store.rows[k]["source"] == "archive" for k in recent)

    async def test_the_refresh_never_downgrades_final_days_and_extends_the_window(self):
        provider, _ = _provider()
        store = FakeStore()
        await provider.get(store, *SANTA_FE)
        cid = next(iter(store.cells))
        final = (cid, TODAY - timedelta(days=100))
        assert store.rows[final]["source"] == "archive"
        store.rows[final] = {**store.rows[final], "precipitation_mm": 99.0}
        await provider.refresh_recent(store, cid)
        assert store.rows[final]["precipitation_mm"] == 99.0  # outside the refresh window
        assert store.cells[cid].loaded_to == TODAY - timedelta(days=1)


# ── Connector: elevation parameter and grid resolution ────────────────────────

class TestConnector:
    async def test_elevation_is_sent_only_when_set(self, monkeypatch):
        seen = []

        class _Resp:
            def raise_for_status(self): ...
            def json(self): return {"daily": {"time": []}, "hourly": {}}

        class _Client:
            def __init__(self, *a, **k): ...
            async def __aenter__(self): return self
            async def __aexit__(self, *a): ...
            async def get(self, url, params):
                seen.append(params)
                return _Resp()

        monkeypatch.setattr("app.connectors.open_meteo.httpx.AsyncClient", _Client)
        await OpenMeteoConnector("z", 42.0, 2.0)._request(TODAY, TODAY)
        await OpenMeteoConnector("c", 42.0, 2.0, elevation=667.0)._request(TODAY, TODAY)
        assert "elevation" not in seen[0]
        assert seen[1]["elevation"] == 667.0

    async def test_resolve_grid_returns_the_cell_and_restores_the_elevation(self, monkeypatch):
        seen = []

        async def fake_request(self, s, e, archive=False):
            seen.append((self.elevation, archive, s, e))
            return {"latitude": 41.78, "longitude": 2.44, "elevation": 667.0}

        monkeypatch.setattr(OpenMeteoConnector, "_request", fake_request)
        conn = OpenMeteoConnector("r", 41.7745, 2.435, elevation=500.0)
        assert await conn.resolve_grid() == (41.78, 2.44, 667.0)
        assert seen == [("nan", True, seen[0][2], seen[0][2])]  # one archive day, elevation=nan
        assert conn.elevation == 500.0
        assert make_cell_id(41.78, 2.44) == "41.7800_2.4400"

    async def test_resolve_grid_fails_cleanly_when_the_response_has_no_cell(self, monkeypatch):
        async def fake_request(self, s, e, archive=False):
            return {"daily": {}}

        monkeypatch.setattr(OpenMeteoConnector, "_request", fake_request)
        with pytest.raises(ProviderUnavailable):
            await OpenMeteoConnector("r", 41.7, 2.4).resolve_grid()


def test_cellinfo_defaults_to_unloaded():
    assert CellInfo("c", 1.0, 2.0, 3.0).loaded_to is None
