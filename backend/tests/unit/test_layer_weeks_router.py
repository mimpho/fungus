"""GET /observatory/layer/weeks and the job after the cell refresh. No DB.

Scenarios D1.10-D1.12 of memory/observatory-meteo-plan.md («Day selector»).
"""
from datetime import UTC, datetime, time, timedelta
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app import main
from app.database import get_db
from app.dependencies import get_current_user
from app.routers import observatory_layer as layer
from app.services import layer_cache
from app.services.day_series import JobStats
from app.services.meteo_weeks import first_bar_day
from tests.unit.test_layer_probability import CELLS, _Db, _row, _sp
from tests.unit.test_point_series import TODAY

URL = "/observatory/layer/weeks"
REF = TODAY - timedelta(days=1)
PINE = _sp(id="esp-1", edibility="excelente")
OTHER = _sp(id="esp-2", edibility="toxico")


class _CatalogDb(_Db):
    """The excellent edibles are what the query returns; `get` finds any species."""

    async def get(self, model, key):
        return {s.id: _row(s) for s in (PINE, OTHER)}.get(key)


class _Climate:
    def __init__(self):
        self.signature, self.rain_reads, self.species_reads = ("v1",), [], 0

    async def data_signature(self):
        return self.signature

    async def list_cells(self):
        return [SimpleNamespace(id=c.id, loaded_to=REF) for c in CELLS]

    def _cells(self, ids=None):
        return [(SimpleNamespace(id=c.id, lat=c.lat, lon=c.lon, elevation_m=c.elevation_m),
                 [SimpleNamespace(**{"source": "archive", "fetched_at": None, **vars(r)})
                  for r in c.rows])
                for c in CELLS if ids is None or c.id in ids]

    async def loaded_cells_rain(self, since, today):
        self.rain_reads.append((since, today))
        return self._cells()

    async def loaded_cells_climate(self, since, *, until=None, recent_from=None, cell_ids=None):
        self.species_reads += 1
        return self._cells(cell_ids)


class _Series:
    def __init__(self):
        self.asked = []

    async def series_rows(self, series, first, last):
        self.asked.append((series, first, last))
        return [SimpleNamespace(day=REF, mean=42.04,
                                computed_at=datetime.combine(TODAY, time(1), tzinfo=UTC))]


@pytest.fixture(autouse=True)
def _fresh_cache():
    layer_cache.answers.clear()
    yield
    layer_cache.answers.clear()


@pytest.fixture
def env(monkeypatch):
    climate, series = _Climate(), _Series()
    app = FastAPI()
    app.include_router(layer.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: _CatalogDb(_row(PINE))
    app.dependency_overrides[layer.get_layer_store] = lambda: climate
    app.dependency_overrides[layer.get_series_store] = lambda: series
    monkeypatch.setattr(layer, "_today", lambda: TODAY)
    return SimpleNamespace(app=app, climate=climate, series=series)


async def _get(env, login=True, **params):
    if login:
        env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
    transport = httpx.ASGITransport(app=env.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://t/api/v1") as c:
        return await c.get(URL, params=params)


class TestWeeksEndpoint:
    async def test_without_a_token_it_answers_401_and_reads_nothing(self, env):
        r = await _get(env, login=False, layer="rain")
        assert r.status_code == 401 and env.climate.rain_reads == []

    @pytest.mark.parametrize("params", [{"layer": "wind"}, {}])
    async def test_another_layer_or_none_is_422(self, env, params):
        assert (await _get(env, **params)).status_code == 422

    async def test_rain_is_computed_from_the_start_of_the_bar_and_remembered(self, env):
        body = (await _get(env, layer="rain", species="esp-2")).json()
        await _get(env, layer="rain")
        assert env.climate.rain_reads == [(first_bar_day(TODAY), TODAY)]
        assert (body["layer"], body["series"]) == ("rain", None)
        assert body["first_date"] == first_bar_day(TODAY).isoformat()
        assert body["max_date"] == REF.isoformat() and len(body["weeks"]) == 27

    async def test_without_a_species_it_is_the_stored_excellent_series(self, env):
        body = (await _get(env, layer="conditions")).json()
        assert body["series"] == "excellent" and env.series.asked[0][0] == "excellent"
        assert body["weeks"][-1]["real"] == {"days": 1, "value": 42.0}
        assert env.climate.species_reads == 0

    async def test_an_excellent_species_has_its_stored_series(self, env):
        body = (await _get(env, layer="conditions", species="esp-1")).json()
        assert body["series"] == "esp-1" and env.series.asked[0][0] == "esp-1"
        assert env.climate.species_reads == 0

    async def test_any_other_is_computed_then_and_cached_until_the_data_changes(self, env):
        body = (await _get(env, layer="conditions", species="esp-2")).json()
        assert body["series"] == "esp-2" and env.series.asked == []
        assert any(w["real"]["value"] is not None for w in body["weeks"])
        await _get(env, layer="conditions", species="esp-2")
        assert env.climate.species_reads == 1
        env.climate.signature = ("v2",)
        await _get(env, layer="conditions", species="esp-2")
        assert env.climate.species_reads == 2

    async def test_an_unknown_species_is_404(self, env):
        assert (await _get(env, layer="conditions", species="nope")).status_code == 404


class _Session:
    async def __aenter__(self):
        return _CatalogDb(_row(PINE))

    async def __aexit__(self, *_):
        return False


@pytest.fixture
def jobs(monkeypatch):
    calls = []

    async def refresh(*_a, **_kw):
        calls.append("refresh")
        return SimpleNamespace(summary=lambda: "ok")

    async def not_due(*_a, **_kw):
        calls.append("not due")

    async def series(climate_store, series_store, species, today):
        calls.append(("series", [s.id for s in species]))
        return JobStats(3)

    monkeypatch.setattr(main, "AsyncSessionLocal", _Session)
    monkeypatch.setattr(main, "refresh_all", refresh)
    monkeypatch.setattr(main, "startup_refresh", not_due)
    monkeypatch.setattr(main, "update_day_series", series)
    monkeypatch.setattr(main.settings, "observatory_cell_refresh_budget", 100)
    return calls


class TestJobHook:
    async def test_the_series_follows_the_daily_refresh(self, jobs):
        await main._scheduled_cell_refresh()
        assert jobs == ["refresh", ("series", ["esp-1"])]

    async def test_it_runs_at_start_up_even_when_the_refresh_is_not_due(self, jobs):
        await main._startup_cell_refresh()
        assert jobs == ["not due", ("series", ["esp-1"])]

    async def test_with_the_refresh_switched_off_the_series_still_runs(self, jobs, monkeypatch):
        monkeypatch.setattr(main.settings, "observatory_cell_refresh_budget", 0)
        await main._scheduled_cell_refresh()
        assert jobs == [("series", ["esp-1"])]

    async def test_a_failed_refresh_does_not_stop_it(self, jobs, monkeypatch):
        async def broken(*_a, **_kw):
            raise RuntimeError("quota")

        monkeypatch.setattr(main, "refresh_all", broken)
        await main._scheduled_cell_refresh()
        assert jobs == [("series", ["esp-1"])]

    async def test_a_failure_of_the_series_is_logged_and_goes_no_further(
        self, jobs, monkeypatch, caplog
    ):
        async def broken(*_a):
            raise RuntimeError("no table")

        monkeypatch.setattr(main, "update_day_series", broken)
        await main._scheduled_cell_refresh()
        assert jobs == ["refresh"] and "Day series failed" in caplog.text
