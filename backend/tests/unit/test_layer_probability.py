"""Probability layer (7b): one species over the stored cells. Pure, no DB."""
from datetime import timedelta
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.database import get_db
from app.dependencies import get_current_user
from app.routers import observatory_layer as layer
from app.services import layer_cache
from app.services.layer_probability import (
    BAND_SPREAD_M,
    BAND_STEP_M,
    CellClimate,
    band_elevations,
    excellent_layer,
    history_start,
    species_layer,
)
from app.services.point_species import SpeciesRecord
from app.services.scoring_v2 import round_half_up
from tests.unit.test_point_series import TODAY, _rows

REF = TODAY - timedelta(days=1)  # last day with data



PINES = ["pinar_carrasco", "pinar_silvestre", "pinar_pinassa", "pinar_negro", "pinar_otros"]

def _sp(**kw) -> SpeciesRecord:
    base = dict(
        id="esp-1", scientific_name="Boletus edulis", edibility="good",
        temp_min_c=5.0, temp_opt_c=14.0, temp_max_c=22.0, rain_min_mm=30.0, rain_opt_mm=80.0,
        cycle_days=10, forest_types=("pinar",), fruiting_months=(9, 10, 11),
        elevation_min_m=400, elevation_max_m=1500,
    )
    return SpeciesRecord(**{**base, **kw})


def _cell(cid, lat, lon, elevation=667.0, rows=None) -> CellClimate:
    return CellClimate(cid, lat, lon, elevation, _rows() if rows is None else rows)


# A 2 x 3 block of cells, so the grid gives their size
CELLS = [_cell(f"c{i}{j}", 41.60 + 0.07 * i, 2.00 + 0.127 * j) for i in range(2) for j in range(3)]


def _by_id(result):
    return {c["id"]: c for c in result["cells"]}


class TestLayer:
    def test_every_cell_that_the_species_reaches_has_a_score_between_0_and_100(self):
        r = species_layer(CELLS, TODAY, _sp())
        assert r["in_season"] and r["date"] == REF.isoformat()
        assert all(c["status"] == "scored" and 0 <= c["score"] <= 100 for c in r["cells"])

    def test_the_score_is_the_one_a_point_in_the_cell_gets_in_species_for_point(self):
        from app.services.point_species import species_for_point

        sp = _sp()
        point = species_for_point(_rows(), TODAY, 667, 667, [sp], forest_types=None)
        assert species_layer([_cell("a", 41.6, 2.0)], TODAY, sp)["cells"][0]["score"] \
            == point["species"][0]["score"]

    def test_a_cell_above_the_species_range_has_no_score(self):
        r = species_layer(
            [_cell("high", 42.3, 1.9, elevation=2300.0), _cell("low", 41.6, 2.0)], TODAY, _sp()
        )
        got = _by_id(r)
        assert got["high"]["status"] == "altitude" and got["high"]["score"] is None
        assert got["low"]["status"] == "scored"

    def test_a_cell_within_150_m_of_the_range_is_scored_with_the_limit_factor(self):
        inside = species_layer([_cell("a", 41.6, 2.0, elevation=700.0)], TODAY,
                               _sp(elevation_min_m=600, elevation_max_m=1500))["cells"][0]
        limit = species_layer([_cell("a", 41.6, 2.0, elevation=700.0)], TODAY,
                              _sp(elevation_min_m=800, elevation_max_m=1500))["cells"][0]
        assert inside["score"] > 0
        assert limit["status"] == "scored"
        assert limit["score"] == round_half_up(inside["score"] * 0.85)

    def test_out_of_the_fruiting_months_nothing_is_scored(self):
        r = species_layer(CELLS, TODAY, _sp(fruiting_months=(4, 5)))
        assert r["in_season"] is False
        assert all(c["status"] == "no_data" and c["score"] is None for c in r["cells"])

    def test_a_species_without_months_is_always_in_season(self):
        assert species_layer(CELLS, TODAY, _sp(fruiting_months=()))["in_season"] is True

    def test_a_species_without_thermal_range_uses_the_generic_model_and_says_so(self):
        sp = _sp(temp_min_c=None, temp_opt_c=None, temp_max_c=None)
        r = species_layer(CELLS, TODAY, sp)
        assert r["species"]["generic_model"] is True
        assert all(c["score"] is not None for c in r["cells"])

    def test_a_date_after_the_last_data_is_clamped_to_it(self):
        r = species_layer(CELLS, TODAY, _sp(), on=TODAY + timedelta(days=5))
        assert r["clamped"] is True and r["date"] == REF.isoformat()

    def test_an_earlier_date_scores_that_day(self):
        on = REF - timedelta(days=10)
        r = species_layer(CELLS, TODAY, _sp(), on=on)
        assert r["date"] == on.isoformat() and r["clamped"] is False

    def test_a_cell_without_rows_is_listed_without_score(self):
        r = species_layer([*CELLS, _cell("empty", 41.9, 2.0, rows=[])], TODAY, _sp())
        empty = _by_id(r)["empty"]
        assert empty["status"] == "no_data" and empty["score"] is None

    def test_no_cells_gives_an_empty_layer(self):
        r = species_layer([], TODAY, _sp())
        assert r["cells"] == [] and r["date"] is None and r["in_season"] is False

    def test_each_cell_carries_its_size_from_the_grid(self):
        c = species_layer(CELLS, TODAY, _sp())["cells"][0]
        assert c["half_lat"] == pytest.approx(0.035, abs=0.002)
        assert c["half_lon"] == pytest.approx(0.0635, abs=0.003)

    def test_history_starts_before_the_model_window(self):
        assert history_start(TODAY, None) < TODAY - timedelta(days=100)
        on = TODAY - timedelta(days=30)
        assert history_start(TODAY, on) == history_start(TODAY - timedelta(days=30), None)


class TestBands:
    def test_the_bands_are_multiples_of_the_step_within_the_spread(self):
        bands = band_elevations(1100.0)
        assert all(e % BAND_STEP_M == 0 for e in bands)
        assert min(bands) >= 1100 - BAND_SPREAD_M and max(bands) <= 1100 + BAND_SPREAD_M

    def test_neighbouring_cells_share_their_band_elevations(self):
        assert set(band_elevations(1000.0)) & set(band_elevations(1150.0)) >= {600, 900, 1200}

    def test_the_bands_never_go_below_sea_level(self):
        assert min(band_elevations(50.0)) == 0

    def test_a_cell_scores_at_the_elevations_the_species_reaches_inside_it(self):
        sp = _sp(elevation_min_m=800, elevation_max_m=1500)
        c = species_layer([_cell("a", 41.6, 2.0, elevation=1200.0)], TODAY, sp)["cells"][0]
        elevations = [e for e, _ in c["bands"]]
        assert elevations and all(800 - 150 <= e <= 1500 + 150 for e in elevations)
        assert all(0 <= score <= 100 for _, score in c["bands"])

    def test_the_band_at_the_cells_own_elevation_is_the_cells_score(self):
        c = species_layer([_cell("a", 41.6, 2.0, elevation=900.0)], TODAY, _sp())["cells"][0]
        assert dict((e, s) for e, s in c["bands"])[900] == c["score"]

    def test_a_low_cell_still_has_bands_where_its_higher_ground_reaches_the_species(self):
        """Mean elevation 500 m, species from 1,000 m: the cell has no score of its own, but
        the 1,200 m ground inside it can have one."""
        sp = _sp(elevation_min_m=1000, elevation_max_m=2000)
        c = species_layer([_cell("a", 41.6, 2.0, elevation=500.0)], TODAY, sp)["cells"][0]
        assert c["status"] == "altitude" and c["score"] is None
        assert [e for e, _ in c["bands"]] == [900, 1200]  # 900 m is inside the 150 m margin

    def test_a_species_that_reaches_no_elevation_of_the_cell_has_no_bands(self):
        sp = _sp(elevation_min_m=1800, elevation_max_m=2500)
        c = species_layer([_cell("a", 41.4, 2.2, elevation=50.0)], TODAY, sp)["cells"][0]
        assert c["status"] == "altitude" and c["bands"] == []

    def test_warmer_ground_scores_differently_from_colder_ground_of_the_same_cell(self):
        sp = _sp(elevation_min_m=0, elevation_max_m=3000)
        c = species_layer([_cell("a", 41.6, 2.0, elevation=900.0)], TODAY, sp)["cells"][0]
        assert len({score for _, score in c["bands"]}) > 1

    def test_out_of_season_there_are_no_bands(self):
        c = species_layer(CELLS, TODAY, _sp(fruiting_months=(4, 5)))["cells"][0]
        assert c["bands"] == []

    def test_the_answer_says_the_band_step(self):
        assert species_layer(CELLS, TODAY, _sp())["band_step_m"] == BAND_STEP_M


# ── Endpoint ──────────────────────────────────────────────────────────────────

class _Db:
    def __init__(self, species=None):
        self.species = species

    async def get(self, model, key):
        return self.species if self.species and self.species.id == key else None

    async def scalars(self, _query):
        found = [self.species] if self.species else []
        return SimpleNamespace(all=lambda: found)


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


def _row(sp: SpeciesRecord):
    return SimpleNamespace(**{k: getattr(sp, k) for k in (
        "id", "scientific_name", "edibility", "temp_min_c", "temp_opt_c", "temp_max_c",
        "rain_min_mm", "rain_opt_mm", "cycle_days", "forest_types", "fruiting_months",
        "elevation_min_m", "elevation_max_m")})


@pytest.fixture(autouse=True)
def _fresh_cache():
    layer_cache.answers.clear()
    yield
    layer_cache.answers.clear()


@pytest.fixture
def env(monkeypatch, tmp_path):
    store = _Store(CELLS)
    app = FastAPI()
    app.dependency_overrides[layer.get_forest_dir] = lambda: tmp_path
    app.dependency_overrides[layer.get_substrate_dir] = lambda: tmp_path
    app.include_router(layer.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: _Db(_row(_sp()))
    app.dependency_overrides[layer.get_layer_store] = lambda: store
    monkeypatch.setattr(layer, "_today", lambda: TODAY)
    return SimpleNamespace(app=app, store=store, forest_dir=tmp_path)


def _client(app):
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t/api/v1")


def _logged_in(env):
    env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="user")


class TestEndpoint:
    async def test_without_a_token_it_answers_401_and_reads_nothing(self, env):
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/probability", params={"species": "esp-1"})
        assert r.status_code == 401 and env.store.since is None

    async def test_the_species_is_required(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/probability")
        assert r.status_code == 422

    async def test_an_unknown_species_is_404(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/probability", params={"species": "nope"})
        assert r.status_code == 404

    async def test_it_answers_the_scored_cells_of_the_species(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/probability", params={"species": "esp-1"})
        body = r.json()
        assert r.status_code == 200 and body["species"]["id"] == "esp-1"
        assert len(body["cells"]) == len(CELLS) and body["date"] == REF.isoformat()
        assert env.store.since == history_start(TODAY, None)

    async def test_the_date_moves_the_history_it_reads(self, env):
        _logged_in(env)
        on = REF - timedelta(days=20)
        async with _client(env.app) as c:
            r = await c.get(
                "/observatory/layer/probability",
                params={"species": "esp-1", "date": on.isoformat()},
            )
        assert r.json()["date"] == on.isoformat()
        assert env.store.since == history_start(TODAY, on)


class TestForestClasses:
    def test_the_species_says_which_forest_classes_it_fits(self):
        out = species_layer(CELLS, TODAY, _sp(forest_types=("pinar", "hayedo")))
        assert out["species"]["forest_classes"] == [
            *PINES, "hayedo", "castanar", "ribera", "caducifolio_otro"]

    def test_a_species_the_forest_cannot_judge_has_no_filter(self):
        out = species_layer(CELLS, TODAY, _sp(forest_types=("prados",)))
        assert out["species"]["forest_classes"] is None
        bare = species_layer(CELLS, TODAY, _sp(forest_types=()))
        assert bare["species"]["forest_classes"] is None


class TestForestRasterEndpoint:
    async def test_without_a_token_it_answers_401(self, env):
        (env.forest_dir / "forest-catalonia.bin").write_bytes(b"\x01")
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/forest-raster")
        assert r.status_code == 401

    async def test_it_serves_the_raster_and_its_description_privately(self, env):
        (env.forest_dir / "forest-catalonia.bin").write_bytes(b"\x00\x01\x02")
        (env.forest_dir / "forest-catalonia.json").write_text('{"width": 1}')
        _logged_in(env)
        async with _client(env.app) as c:
            raster = await c.get("/observatory/layer/forest-raster")
            meta = await c.get("/observatory/layer/forest-raster/meta")
        assert raster.status_code == 200 and raster.content == b"\x00\x01\x02"
        assert meta.json() == {"width": 1}
        for r in (raster, meta):
            assert r.headers["cache-control"] == "private, max-age=86400"

    async def test_without_the_files_it_is_404(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            raster = await c.get("/observatory/layer/forest-raster")
            meta = await c.get("/observatory/layer/forest-raster/meta")
        assert raster.status_code == 404 and meta.status_code == 404


class TestSubstrate:
    def test_the_species_carries_how_its_ph_fits_each_substrate_class(self):
        out = species_layer(CELLS, TODAY, _sp(ph_min=5.5, ph_max=7.5))
        assert out["species"]["substrate_classes"] == ["acid", "mixed", "calcareous"]
        assert out["species"]["substrate_factors"] == [0.462, 1.0, 0.615]

    def test_without_a_ph_range_there_is_no_soil_filter(self):
        assert species_layer(CELLS, TODAY, _sp())["species"]["substrate_factors"] is None

    async def test_the_substrate_raster_is_served_like_the_forest_one(self, env):
        (env.forest_dir / "substrate-catalonia.bin").write_bytes(b"\x07")
        (env.forest_dir / "substrate-catalonia.json").write_text('{"classes": ["acid"]}')
        _logged_in(env)
        async with _client(env.app) as c:
            raster = await c.get("/observatory/layer/substrate-raster")
            meta = await c.get("/observatory/layer/substrate-raster/meta")
            missing = await c.get("/observatory/layer/forest-raster")
        assert raster.content == b"\x07" and meta.json() == {"classes": ["acid"]}
        assert raster.headers["cache-control"] == "private, max-age=86400"
        assert missing.status_code == 404


class TestExcellent:
    def test_each_species_scores_like_the_one_species_layer(self):
        warm = _sp(id="warm", temp_opt_c=17.0, temp_min_c=8.0, temp_max_c=25.0)
        cold = _sp(id="cold", temp_opt_c=9.0, temp_min_c=2.0, temp_max_c=16.0)
        many = excellent_layer(CELLS, TODAY, [warm, cold])
        for k, sp in enumerate([warm, cold]):
            one = _by_id(species_layer(CELLS, TODAY, sp))
            for cell in many["cells"]:
                single = one[cell["id"]]
                expected = single["score"] if single["status"] == "scored" else None
                assert cell["score"][k] == expected
                bands = {e: s[k] for e, s in cell["bands"] if s[k] is not None}
                assert bands == {e: s for e, s in single["bands"]}

    def test_a_species_out_of_season_or_out_of_altitude_is_null(self):
        late = _sp(id="late", fruiting_months=(3,))
        high = _sp(id="high", elevation_min_m=2500, elevation_max_m=3000)
        res = excellent_layer(CELLS, TODAY, [_sp(), late, high])
        assert [s["in_season"] for s in res["species"]] == [True, False, True]
        for cell in res["cells"]:
            assert cell["score"][1] is None and cell["score"][2] is None

    def test_it_carries_what_the_client_needs_to_judge_a_pixel(self):
        res = excellent_layer(CELLS, TODAY, [_sp(ph_min=4.5, ph_max=6.0)])
        sp = res["species"][0]
        assert sp["forest_classes"] == PINES and len(sp["substrate_factors"]) == 3
        assert res["substrate_classes"] == ["acid", "mixed", "calcareous"]
        assert res["band_step_m"] == BAND_STEP_M

    def test_without_species_or_cells_it_is_empty_not_an_error(self):
        assert excellent_layer(CELLS, TODAY, [])["species"] == []
        assert excellent_layer([], TODAY, [_sp()])["cells"] == []


class TestExcellentEndpoint:
    async def test_it_needs_a_login(self, env):
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/probability-excellent")
        assert r.status_code == 401

    async def test_it_answers_every_excellent_species_over_the_cells(self, env):
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get("/observatory/layer/probability-excellent")
        body = r.json()
        assert r.status_code == 200 and [s["id"] for s in body["species"]] == ["esp-1"]
        assert len(body["cells"]) == len(CELLS) and body["date"] == REF.isoformat()


class TestAnswersAreRemembered:
    async def _get(self, env, path, **params):
        async with _client(env.app) as c:
            return await c.get(f"/observatory/layer/{path}", params=params)

    async def test_the_same_question_is_answered_without_reading_the_cells_again(self, env):
        _logged_in(env)
        first = await self._get(env, "probability-excellent")
        second = await self._get(env, "probability-excellent")
        assert first.json() == second.json() and env.store.reads == 1

    async def test_each_species_and_each_date_has_its_own_answer(self, env):
        _logged_in(env)
        await self._get(env, "probability", species="esp-1")
        await self._get(env, "probability", species="esp-1")
        assert env.store.reads == 1
        await self._get(env, "probability", species="esp-1", date=REF.isoformat())
        assert env.store.reads == 2

    async def test_new_data_makes_a_new_answer(self, env):
        _logged_in(env)
        await self._get(env, "probability-excellent")
        env.store.signature = ("v2",)  # a cell was refreshed
        await self._get(env, "probability-excellent")
        assert env.store.reads == 2

    def test_it_keeps_only_the_last_few(self):
        cache = layer_cache.LayerCache(max_entries=2)
        for k in "abc":
            cache.put(k, {"k": k})
        assert cache.get("a") is None and cache.get("c") == {"k": "c"}


class TestForecastEndpoint:
    """The date can be a day of the stored forecast (see test_layer_forecast.py for the model)."""

    async def _ask(self, env, path, **params):
        async with _client(env.app) as c:
            return (await c.get(f"/observatory/layer/{path}", params=params)).json()

    def _with_forecast(self, env, fetched):
        from tests.unit.test_layer_forecast import _forecast

        rows = [*_rows(), *_forecast(fetched=fetched)]
        env.store.cells = [_cell(f"c{i}", 41.6, 2.0 + 0.127 * i, rows=rows) for i in range(3)]

    async def test_a_day_ahead_is_answered_from_the_forecast(self, env):
        from tests.unit.test_layer_forecast import FRESH

        _logged_in(env)
        self._with_forecast(env, FRESH)
        on = TODAY + timedelta(days=3)
        for path, params in (("probability", {"species": "esp-1"}), ("probability-excellent", {})):
            body = await self._ask(env, path, date=on.isoformat(), **params)
            assert body["date"] == on.isoformat() and body["basis"] == "forecast"
            assert body["max_date"] == (TODAY + timedelta(days=7)).isoformat()

    async def test_a_forecast_older_than_two_days_is_not_shown(self, env):
        from tests.unit.test_layer_forecast import FRESH

        _logged_in(env)
        self._with_forecast(env, FRESH - timedelta(days=4))
        body = await self._ask(
            env, "probability", species="esp-1", date=(TODAY + timedelta(days=3)).isoformat()
        )
        assert body["date"] == REF.isoformat() and body["clamped"] is True


class TestForestWeightsInTheLayer:
    def test_the_species_carries_the_weight_of_each_class(self):
        sp = _sp(forest_types=("encinar",), forest_affinity=(("hayedo", 1.0), ("robledal", 0.6)))
        out = species_layer(CELLS, TODAY, sp)
        assert out["species"]["forest_classes"] == ["hayedo", "robledal"]
        assert out["species"]["forest_class_weights"] == {"hayedo": 1.0, "robledal": 0.6}

    def test_without_affinity_every_class_weighs_one(self):
        out = species_layer(CELLS, TODAY, _sp(forest_types=("pinar",)))
        assert out["species"]["forest_class_weights"] == dict.fromkeys(PINES, 1.0)
        none = species_layer(CELLS, TODAY, _sp(forest_types=("prados",)))
        assert none["species"]["forest_class_weights"] is None

    def test_the_ensemble_carries_them_per_species(self):
        a = _sp(id="a", forest_types=("pinar",))
        b = _sp(id="b", forest_types=(), forest_affinity=(("hayedo", 0.8),))
        res = excellent_layer(CELLS, TODAY, [a, b])
        assert [s["forest_class_weights"] for s in res["species"]] == [
            dict.fromkeys(PINES, 1.0), {"hayedo": 0.8}]
