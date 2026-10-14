"""/observatory/point/*: login, validation, cache source, errors. No DB, no network."""
from datetime import timedelta
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.database import get_db
from app.dependencies import get_current_user
from app.routers import observatory as obs
from tests.unit.test_cell_provider import TODAY, FakeStore, _provider

SANTA_FE = {"lat": 41.7745, "lon": 2.4350}


class _Db:
    """get_db stand-in: no species in the catalogue."""

    async def get(self, model, key):
        return None


class _StoreWithHistory(FakeStore):
    async def history(self, cell_id):
        return [SimpleNamespace(**r) for _, r in sorted(self.rows.items())]


@pytest.fixture
def env(monkeypatch):
    provider, log = _provider()
    store = _StoreWithHistory()
    app = FastAPI()
    app.include_router(obs.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: _Db()
    app.dependency_overrides[obs.get_cell_store] = lambda: store
    app.dependency_overrides[obs.get_cell_provider] = lambda: provider
    monkeypatch.setattr(obs, "_today", lambda: TODAY)

    async def elevation(lat, lon):
        return 1167.0

    monkeypatch.setattr(obs, "point_elevation", elevation)
    return SimpleNamespace(app=app, provider=provider, store=store, log=log)


def _client(app):
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t/api/v1")


def _logged_in(env):
    env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="user")


class TestLogin:
    @pytest.mark.parametrize("path", ["/observatory/point/series", "/observatory/point/snapshot"])
    async def test_without_a_token_every_endpoint_answers_401(self, env, path):
        async with _client(env.app) as c:
            r = await c.get(path, params=SANTA_FE)
        assert r.status_code == 401
        assert env.log["resolve"] == [] and env.log["fetch"] == []  # nothing was loaded


class TestValidation:
    @pytest.mark.parametrize(
        "params",
        [
            {"lat": 48.85, "lon": 2.35},   # Paris
            {"lat": 41.7, "lon": -3.7},    # Castilla
            {"lat": 39.0, "lon": 2.4},     # south of Catalonia
            {"lat": 41.7},                 # missing lon
        ],
    )
    async def test_points_outside_catalonia_or_incomplete_are_422(self, env, params):
        _logged_in(env)
        async with _client(env.app) as c:
            assert (await c.get("/observatory/point/series", params=params)).status_code == 422

    @pytest.mark.parametrize(("days", "status"), [(7, 200), (180, 200), (6, 422), (181, 422)])
    async def test_the_window_accepts_7_to_180_days(self, env, days, status):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/series", params={**SANTA_FE, "days": days})
        assert r.status_code == status

    async def test_an_unknown_species_is_404(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/series", params={**SANTA_FE, "species": "esp-x"})
        assert r.status_code == 404


class TestSeries:
    async def test_the_first_request_is_live_and_the_second_stored(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            first = (await c.get("/observatory/point/series", params=SANTA_FE)).json()
            fetches = len(env.log["fetch"])
            second = (await c.get("/observatory/point/series", params=SANTA_FE)).json()
        assert first["source"] == "live" and second["source"] == "stored"
        assert len(env.log["fetch"]) == fetches == 1

    async def test_the_response_describes_point_cell_and_correction(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/series", params=SANTA_FE)).json()
        assert body["point"] == {**SANTA_FE, "elevation_m": 1167.0}
        assert body["cell"]["elevation_m"] == 667
        assert body["elevation_delta_m"] == 500 and body["elevation_corrected"] is True
        assert len(body["days"]) == 20
        assert isinstance(body["events"], list) and "lowest_min" in body
        assert body["last_data_date"] == (TODAY - timedelta(days=1)).isoformat()

    async def test_a_date_after_the_data_is_clamped(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            body = (
                await c.get(
                    "/observatory/point/series", params={**SANTA_FE, "to": "2099-01-01"}
                )
            ).json()
        assert body["clamped"] is True and body["to"] == body["last_data_date"]

    async def test_without_a_point_elevation_it_says_the_climate_was_not_corrected(
        self, env, monkeypatch
    ):
        async def none(lat, lon):
            return None

        monkeypatch.setattr(obs, "point_elevation", none)
        _logged_in(env)
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/series", params=SANTA_FE)).json()
        assert body["elevation_corrected"] is False and body["elevation_delta_m"] is None


class TestSnapshot:
    async def test_it_returns_one_generic_entry_until_the_forest_exists(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/snapshot", params=SANTA_FE)).json()
        (entry,) = body["entries"]
        assert entry["forest_type"] is None and entry["share"] is None
        assert 0 <= entry["score"] <= 100 and entry["limiting_factor"]
        assert isinstance(entry["conditions"], list) and "explanation" in entry


class TestErrors:
    async def test_the_daily_budget_is_503_with_retry_after_and_cached_cells_still_work(self, env):
        provider, _ = _provider(max_new=1)
        env.app.dependency_overrides[obs.get_cell_provider] = lambda: provider
        _logged_in(env)
        async with _client(env.app) as c:
            ok = await c.get("/observatory/point/series", params=SANTA_FE)
            far = await c.get("/observatory/point/series", params={"lat": 42.2, "lon": 1.8})
            again = await c.get("/observatory/point/series", params=SANTA_FE)
        assert ok.status_code == 200 and again.status_code == 200
        assert far.status_code == 503 and int(far.headers["Retry-After"]) > 0

    async def test_a_provider_outage_is_503_and_the_next_request_retries(self, env):
        down, _ = _provider(fail=True)
        env.app.dependency_overrides[obs.get_cell_provider] = lambda: down
        _logged_in(env)
        async with _client(env.app) as c:
            bad = await c.get("/observatory/point/series", params=SANTA_FE)
            env.app.dependency_overrides[obs.get_cell_provider] = lambda: env.provider
            good = await c.get("/observatory/point/series", params=SANTA_FE)
        assert bad.status_code == 503 and bad.headers["Retry-After"] == "60"
        assert good.status_code == 200 and good.json()["source"] == "live"
