"""GET /observatory/layer/rain (scenario 1.12 of memory/observatory-meteo-plan.md). No DB."""
from datetime import timedelta
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.dependencies import get_current_user
from app.routers import observatory_layer as layer
from app.services import layer_cache
from app.services.layer_rain import history_since
from tests.unit.test_layer_rain import REF, _block
from tests.unit.test_point_series import TODAY

URL = "/observatory/layer/rain"


class _Store:
    def __init__(self, cells):
        self.cells, self.since, self.signature, self.reads = cells, None, ("v1",), 0

    async def data_signature(self):
        return self.signature

    async def loaded_cells_climate(self, since):
        self.since = since
        self.reads += 1
        return [(SimpleNamespace(id=c.id, lat=c.lat, lon=c.lon, elevation_m=c.elevation_m),
                 c.rows) for c in self.cells]


@pytest.fixture(autouse=True)
def _fresh_cache():
    layer_cache.answers.clear()
    yield
    layer_cache.answers.clear()


@pytest.fixture
def env(monkeypatch):
    store = _Store(_block())
    app = FastAPI()
    app.include_router(layer.router, prefix="/api/v1")
    app.dependency_overrides[layer.get_layer_store] = lambda: store
    monkeypatch.setattr(layer, "_today", lambda: TODAY)
    return SimpleNamespace(app=app, store=store)


def _client(app):
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t/api/v1")


def _logged_in(env):
    env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="user")


async def _get(env, **params):
    async with _client(env.app) as c:
        return await c.get(URL, params=params)


class TestRainEndpoint:
    async def test_without_a_token_it_answers_401_and_reads_nothing(self, env):
        r = await _get(env)
        assert r.status_code == 401 and env.store.since is None

    @pytest.mark.parametrize("params", [{"window": "3d"}, {"date": "yesterday"}])
    async def test_a_value_it_does_not_know_is_422(self, env, params):
        _logged_in(env)
        r = await _get(env, **params)
        assert r.status_code == 422 and env.store.since is None

    async def test_by_default_it_answers_the_last_seven_days_with_data(self, env):
        _logged_in(env)
        r = await _get(env)
        body = r.json()
        assert r.status_code == 200
        assert (body["window"], body["window_days"], body["date"]) == ("7d", 7, REF.isoformat())
        assert len(body["cells"]) == 9
        assert all(c["status"] == "measured" and c["mm"] == 7.0 for c in body["cells"])
        assert env.store.since == history_since(TODAY, None)

    async def test_the_window_and_the_date_are_taken(self, env):
        _logged_in(env)
        on = REF - timedelta(days=4)
        body = (await _get(env, window="24h", date=on.isoformat())).json()
        assert (body["window_days"], body["date"]) == (1, on.isoformat())
        assert env.store.since == history_since(TODAY, on)

    async def test_the_answer_is_remembered_while_the_data_does_not_change(self, env):
        _logged_in(env)
        await _get(env)
        await _get(env)
        assert env.store.reads == 1
        await _get(env, window="21d")
        assert env.store.reads == 2
        env.store.signature = ("v2",)
        await _get(env)
        assert env.store.reads == 3
