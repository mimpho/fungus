"""/observatory/point/*: login, validation, cache source, errors. No DB, no network."""
from datetime import timedelta
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.database import get_db
from app.dependencies import get_current_user
from app.routers import observatory as obs
from app.services.point_forest import LandCover, Toponym
from tests.unit.test_cell_provider import TODAY, FakeStore, _provider

SANTA_FE = {"lat": 41.7745, "lon": 2.4350}


class _Db:
    """get_db stand-in: no species in the catalogue."""

    async def get(self, model, key):
        return None

    async def scalars(self, statement):
        return SimpleNamespace(all=lambda: [])


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

    # ICGC services: unknown by default (a failing service); tests set env.cover / env.toponym
    env = SimpleNamespace(app=app, provider=provider, store=store, log=log, cover=None,
                          toponym=None)

    async def cover(lat, lon):
        return env.cover

    async def toponym(lat, lon):
        return env.toponym

    monkeypatch.setattr(obs, "land_cover", cover)
    monkeypatch.setattr(obs, "fetch_toponym", toponym)
    return env


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
    async def test_it_returns_a_single_thermometer(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/snapshot", params=SANTA_FE)).json()
        assert 0 <= body["score"] <= 100 and body["limiting_factor"]
        assert isinstance(body["conditions"], list) and "explanation" in body


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

    async def test_the_user_limit_is_429_with_retry_after_and_stored_cells_still_work(self, env):
        provider, _ = _provider(max_per_user=1)
        env.app.dependency_overrides[obs.get_cell_provider] = lambda: provider
        _logged_in(env)
        async with _client(env.app) as c:
            ok = await c.get("/observatory/point/series", params=SANTA_FE)
            far = await c.get("/observatory/point/series", params={"lat": 42.2, "lon": 1.8})
            again = await c.get("/observatory/point/series", params=SANTA_FE)
            env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
                id=2, role="user"
            )
            other_user = await c.get("/observatory/point/series", params={"lat": 42.2, "lon": 1.8})
        assert ok.status_code == 200 and again.status_code == 200
        assert far.status_code == 429 and int(far.headers["Retry-After"]) > 0
        assert "limit" in far.json()["detail"].lower()
        assert other_user.status_code == 200  # the limit is per user

    @pytest.mark.parametrize(
        "path",
        [
            "/observatory/point/series",
            "/observatory/point/snapshot",
            "/observatory/point/species",
            "/observatory/point/calendar",
        ],
    )
    async def test_every_climate_endpoint_applies_the_user_limit(self, env, path):
        provider, _ = _provider(max_per_user=1)
        env.app.dependency_overrides[obs.get_cell_provider] = lambda: provider
        _logged_in(env)
        async with _client(env.app) as c:
            await c.get("/observatory/point/series", params=SANTA_FE)  # uses the one allowed
            far = await c.get(path, params={"lat": 42.2, "lon": 1.8})
        assert far.status_code == 429

    async def test_zero_disables_the_user_limit(self, env):
        provider, _ = _provider(max_per_user=0)
        env.app.dependency_overrides[obs.get_cell_provider] = lambda: provider
        _logged_in(env)
        async with _client(env.app) as c:
            codes = []
            for lat, lon in ((41.7745, 2.4350), (42.2, 1.8), (41.0, 1.0)):
                r = await c.get("/observatory/point/series", params={"lat": lat, "lon": lon})
                codes.append(r.status_code)
        assert codes == [200, 200, 200]

    async def test_the_provider_takes_both_limits_from_the_settings(self, monkeypatch):
        monkeypatch.setattr(obs.settings, "observatory_max_new_cells_per_day", 33)
        monkeypatch.setattr(obs.settings, "observatory_max_new_cells_per_user_per_day", 4)
        obs.get_cell_provider.cache_clear()
        try:
            provider = obs.get_cell_provider()
            assert (provider._max_new, provider._max_new_per_user) == (33, 4)
        finally:
            obs.get_cell_provider.cache_clear()

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


class TestSpecies:
    async def test_an_empty_catalogue_answers_with_empty_lists(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/species", params=SANTA_FE)
        body = r.json()
        assert r.status_code == 200 and body["species"] == [] and body["excellent"] == []
        assert body["forest_known"] is False and body["cell"]["elevation_m"] == 667

    async def test_it_needs_a_login(self, env):
        async with _client(env.app) as c:
            assert (await c.get("/observatory/point/species", params=SANTA_FE)).status_code == 401


FOREST = LandCover(9, "Boscos densos d'esclerofil·les i laurifolis", "esclerofilo", True)
URBAN = LandCover(21, "Casc urbà", None, False)
COLL_PREGON = Toponym("Coll Pregon", "Coll Pregon, Fogars de Montclús", "Orografia", "topo2",
                      "Fogars de Montclús", "Vallès Oriental", 0.136)


class TestForest:
    async def test_it_needs_a_login(self, env):
        async with _client(env.app) as c:
            assert (await c.get("/observatory/point/forest", params=SANTA_FE)).status_code == 401

    async def test_a_forest_point(self, env):
        _logged_in(env)
        env.cover, env.toponym = FOREST, COLL_PREGON
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/forest", params=SANTA_FE)
        body = r.json()
        assert r.status_code == 200
        assert body["point"] == {**SANTA_FE, "elevation_m": 1167.0}
        assert body["toponym"]["name"] == "Coll Pregon" and body["toponym"]["kind"] == "Orografia"
        assert body["forest"] is True and body["macrotype"] == "esclerofilo"
        assert body["composition"] is None and body["radius_m"] == 300
        assert body["species_forest_types"] == ["encinar", "mixto"] and body["reason"] is None

    async def test_no_forest_at_the_point(self, env):
        _logged_in(env)
        env.cover = URBAN
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/forest", params=SANTA_FE)).json()
        assert body["forest"] is False and body["reason"] == "no_forest"
        assert body["macrotype"] is None and body["composition"] is None

    async def test_failing_services_are_never_an_error(self, env):
        _logged_in(env)  # cover and toponym are None, as when the ICGC does not answer
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/forest", params=SANTA_FE)
        body = r.json()
        assert r.status_code == 200 and body["toponym"] is None and body["forest"] is None

    @pytest.mark.parametrize(
        ("radius", "status"), [(100, 200), (1000, 200), (99, 422), (1001, 422)]
    )
    async def test_the_radius_accepts_100_to_1000(self, env, radius, status):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/forest", params={**SANTA_FE, "radius": radius})
        assert r.status_code == status

    async def test_the_raw_answers_are_left_out_by_default(self, env):
        _logged_in(env)
        env.cover = LandCover(9, "x", "esclerofilo", True, raw="RAW")
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/forest", params=SANTA_FE)).json()
        assert "raw" not in body

    async def test_the_raw_answers_come_with_raw_true(self, env):
        _logged_in(env)
        env.cover = LandCover(9, "x", "esclerofilo", True, raw="GetFeatureInfo results: ...")
        env.toponym = Toponym("Coll Pregon", "Coll Pregon, F", "Orografia", "topo2", "F", "V", 0.1,
                              raw={"properties": {"nom": "Coll Pregon"}})
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/forest", params={**SANTA_FE, "raw": "true"})
        body = r.json()
        assert body["raw"] == {
            "land_cover": "GetFeatureInfo results: ...",
            "toponym": {"properties": {"nom": "Coll Pregon"}},
        }
        assert body["toponym"]["provider"] == "ICGC" and body["toponym"]["licence"] is None

    async def test_it_does_not_load_any_climate_cell(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            await c.get("/observatory/point/forest", params=SANTA_FE)
        assert env.log["resolve"] == [] and env.log["fetch"] == []


class TestForestInOtherEndpoints:
    async def test_species_with_no_forest_is_empty_with_a_reason_but_the_cell_loads(self, env):
        _logged_in(env)
        env.cover = URBAN
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/species", params=SANTA_FE)).json()
        assert body["species"] == [] and body["excellent"] == []
        assert body["reason"] == "no_forest" and body["forest"] is False
        assert body["forest_known"] is True and body["cell"]["elevation_m"] == 667

    async def test_species_in_a_forest_is_flagged_as_known(self, env):
        _logged_in(env)
        env.cover = FOREST
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/species", params=SANTA_FE)).json()
        assert body["forest_known"] is True and body["forest"] is True and body["reason"] is None

    @pytest.mark.parametrize(
        ("cover", "source"), [(FOREST, "land_cover"), (URBAN, "land_cover"), (None, None)]
    )
    async def test_species_says_where_the_forest_types_came_from(self, env, cover, source):
        _logged_in(env)
        env.cover = cover
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/species", params=SANTA_FE)).json()
        assert body["forest_source"] == source

    @pytest.mark.parametrize("path", ["forest", "species", "snapshot"])
    @pytest.mark.parametrize("cover", [FOREST, URBAN])
    async def test_the_land_cover_as_the_icgc_gave_it_travels_with_the_answer(
        self, env, path, cover
    ):
        _logged_in(env)
        env.cover = cover
        async with _client(env.app) as c:
            body = (await c.get(f"/observatory/point/{path}", params=SANTA_FE)).json()
        lc = body["land_cover"]
        assert (lc["code"], lc["name"]) == (cover.code, cover.name)
        assert lc["provider"] == "ICGC" and lc["layer"] == "cobertes_2024"
        assert lc["licence"] == "CC BY 4.0" and "retrieved_at" in lc

    @pytest.mark.parametrize("path", ["forest", "species", "snapshot"])
    async def test_an_unknown_land_cover_is_null(self, env, path):
        _logged_in(env)
        async with _client(env.app) as c:
            body = (await c.get(f"/observatory/point/{path}", params=SANTA_FE)).json()
        assert body["land_cover"] is None

    @pytest.mark.parametrize("cover", [None, URBAN, FOREST])
    async def test_snapshot_is_one_thermometer_whatever_the_forest(self, env, cover):
        _logged_in(env)
        env.cover = cover
        async with _client(env.app) as c:
            body = (await c.get("/observatory/point/snapshot", params=SANTA_FE)).json()
        assert "entries" not in body and "score" in body
        assert body["forest"] == (None if cover is None else cover.forest)


class TestCalendar:
    async def test_it_returns_7_real_days_and_35_ahead_flagged(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/point/calendar", params=SANTA_FE)
        body = r.json()
        assert r.status_code == 200 and len(body["days"]) == 42
        assert {d["basis"] for d in body["days"]} <= {"real", "forecast", "estimate"}
        assert all(d["estimated_without_forecast"] == (d["basis"] == "estimate")
                   for d in body["days"])
        assert "best_day" in body["summary"] and "good_days" in body["summary"]

    async def test_it_needs_a_login(self, env):
        async with _client(env.app) as c:
            assert (await c.get("/observatory/point/calendar", params=SANTA_FE)).status_code == 401
