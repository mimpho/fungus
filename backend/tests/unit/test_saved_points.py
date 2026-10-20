"""Saved points (feat/observatory-saved-points): CRUD, provenance, author's forest types.

No DB, no network. Scenarios follow the proposal agreed on 2026-10-16: the server records the
provenance (land cover layer/code/name/date, toponym name/label, MCSC-4 codes with their
percentage), never the services' raw texts; the author's forest types win over the land cover.
"""
import dataclasses
import importlib.util
from datetime import UTC, datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import ARRAY
from sqlalchemy.dialects.postgresql import JSONB

from app.config import Settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import SavedPoint
from app.models.climate_cell import lookup_key
from app.routers import observatory as obs
from app.routers import saved_points as sp
from app.services.point_forest import LandCover, Toponym, cover_from_class
from app.services.saved_points import (
    DuplicatePoint,
    NewPoint,
    PointContext,
    SavedPointRecord,
    author_forest_types,
    composition_json,
    create_saved_point,
)
from tests.unit.test_cell_provider import TODAY, _provider
from tests.unit.test_observatory_router import SANTA_FE, _StoreWithHistory

BASE = "/observatory/saved-points"
RETRIEVED = "2026-10-16T21:00:00+00:00"
RETRIEVED_AT = datetime(2026, 10, 16, 21, 0, tzinfo=UTC)

FOREST = LandCover(4, "Bosc dens d'aciculifolis", "conifera", True, fetched_at=RETRIEVED)
URBAN = LandCover(31, "Eixample", None, False, fetched_at=RETRIEVED)
TOPONYM = Toponym(
    name="Santa Fe del Montseny", label="Santa Fe del Montseny (Fogars de Montclús)",
    kind="Disseminat", layer="topo2", municipality="Fogars de Montclús", comarca="Vallès",
    distance_km=0.2,
)


def _species(sid, forest_types, edibility="good"):
    return SimpleNamespace(
        id=sid, scientific_name=f"Species {sid}", edibility=edibility,
        temp_min_c=5, temp_opt_c=14, temp_max_c=22, rain_min_mm=30, rain_opt_mm=80,
        cycle_days=10, forest_types=forest_types, fruiting_months=[9, 10, 11],
        elevation_min_m=400, elevation_max_m=1500,
    )


CATALOGUE = [
    _species("pinar-sp", ["pinar"]),
    _species("encinar-sp", ["encinar"]),
    _species("hayedo-sp", ["hayedo"]),
    _species("any-sp", ["mixto"]),
]


class FakeSavedStore:
    """In-memory SavedPointStore; a clock that ticks one minute per write."""

    def __init__(self):
        self.rows: dict[int, SavedPointRecord] = {}
        self._next = 1
        self._clock = datetime(2026, 10, 16, 21, 0, tzinfo=UTC)
        self.race_on_add = False

    def _tick(self):
        self._clock += timedelta(minutes=1)
        return self._clock

    async def count_for_user(self, user_id):
        return sum(r.user_id == user_id for r in self.rows.values())

    async def list_for_user(self, user_id):
        mine = [r for r in self.rows.values() if r.user_id == user_id]
        return sorted(mine, key=lambda r: r.created_at, reverse=True)

    async def get(self, user_id, point_id):
        row = self.rows.get(point_id)
        return row if row and row.user_id == user_id else None

    async def find_at(self, user_id, lat, lon):
        return next(
            (r for r in self.rows.values()
             if (r.user_id, r.lat, r.lon) == (user_id, lat, lon)),
            None,
        )

    async def add(self, record):
        if self.race_on_add:
            raise DuplicatePoint(0)
        now = self._tick()
        saved = dataclasses.replace(record, id=self._next, created_at=now, updated_at=now)
        self.rows[saved.id] = saved
        self._next += 1
        return saved

    async def update(self, user_id, point_id, changes):
        row = await self.get(user_id, point_id)
        if row is None:
            return None
        self.rows[point_id] = dataclasses.replace(row, **changes, updated_at=self._tick())
        return self.rows[point_id]

    async def delete(self, user_id, point_id):
        if await self.get(user_id, point_id) is None:
            return False
        del self.rows[point_id]
        return True


class _Db:
    """get_db stand-in: the first `scalars` call is the species catalogue, the rest are empty."""

    def __init__(self):
        self.calls = 0

    async def get(self, model, key):
        return None

    async def scalars(self, statement):
        self.calls += 1
        rows = CATALOGUE if self.calls == 1 else []
        return SimpleNamespace(all=lambda: rows)


@pytest.fixture
def env(monkeypatch):
    provider, log = _provider()
    cells, points = _StoreWithHistory(), FakeSavedStore()
    app = FastAPI()
    app.include_router(sp.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: _Db()
    app.dependency_overrides[obs.get_cell_store] = lambda: cells
    app.dependency_overrides[obs.get_cell_provider] = lambda: provider
    app.dependency_overrides[sp.get_saved_point_store] = lambda: points
    monkeypatch.setattr(obs, "_today", lambda: TODAY)
    monkeypatch.setattr(sp.settings, "observatory_max_saved_points_per_user", 0)

    env = SimpleNamespace(
        app=app, provider=provider, cells=cells, points=points, log=log,
        cover=None, toponym=None, elevation=1167.0, calls=[],
    )

    async def cover(lat, lon):
        env.calls.append("cover")
        return env.cover

    async def toponym(lat, lon):
        env.calls.append("toponym")
        return env.toponym

    async def elevation(lat, lon):
        env.calls.append("elevation")
        return env.elevation

    for module in (sp, obs):
        monkeypatch.setattr(module, "land_cover", cover)
        monkeypatch.setattr(module, "point_elevation", elevation)
    monkeypatch.setattr(sp, "fetch_toponym", toponym)
    return env


def _client(app):
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t/api/v1")


def _login(env, user_id=1):
    env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=user_id, role="user"
    )


async def _save(env, user_id=1, **body):
    _login(env, user_id)
    async with _client(env.app) as c:
        return await c.post(BASE, json={**SANTA_FE, **body})


# ── Login ─────────────────────────────────────────────────────────────────────

class TestLogin:
    @pytest.mark.parametrize(
        ("method", "path"),
        [
            ("GET", BASE), ("POST", BASE), ("GET", f"{BASE}/1"), ("PATCH", f"{BASE}/1"),
            ("DELETE", f"{BASE}/1"), ("GET", f"{BASE}/1/species"),
        ],
    )
    async def test_without_a_token_every_endpoint_answers_401(self, env, method, path):
        async with _client(env.app) as c:
            r = await c.request(method, path, json={} if method in ("POST", "PATCH") else None)
        assert r.status_code == 401
        assert env.calls == [] and env.log["fetch"] == []


# ── Create ────────────────────────────────────────────────────────────────────

class TestCreate:
    async def test_it_saves_the_provenance_the_services_gave(self, env):
        env.cover, env.toponym = FOREST, TOPONYM
        r = await _save(env, name="Mi fageda", notes="buen año")
        body = r.json()
        assert r.status_code == 201 and body["id"] >= 1
        assert (body["name"], body["notes"]) == ("Mi fageda", "buen año")
        assert body["elevation_m"] == 1167.0
        assert body["land_cover"]["layer"] == "cobertes_2024"
        assert (body["land_cover"]["code"], body["land_cover"]["name"]) == (4, FOREST.name)
        stamp = body["land_cover"]["retrieved_at"].replace("Z", "+00:00")
        assert datetime.fromisoformat(stamp) == RETRIEVED_AT
        assert body["toponym"] == {"name": TOPONYM.name, "label": TOPONYM.label}

    async def test_it_never_keeps_the_raw_texts_nor_the_derived_macrotype(self, env):
        env.cover, env.toponym = (
            dataclasses.replace(FOREST, raw="class = 'x' colour pixel"),
            dataclasses.replace(TOPONYM, raw={"properties": {"nom": "x"}}),
        )
        body = (await _save(env)).json()
        record = env.points.rows[body["id"]]
        for name in ("macrotype", "forest", "raw"):
            assert name not in body and not hasattr(record, name)
        assert "pixel" not in str(dataclasses.asdict(record))

    @pytest.mark.parametrize(
        "extra",
        [
            {"land_cover_code": 4}, {"elevation_m": 10}, {"cell_id": "x"},
            {"composition": {"items": []}}, {"toponym_name": "x"}, {"forest_type": "pinar"},
        ],
    )
    async def test_provenance_sent_by_the_client_is_rejected(self, env, extra):
        assert (await _save(env, **extra)).status_code == 422
        assert env.points.rows == {}

    async def test_without_a_name_it_uses_the_toponym_and_with_one_the_user_wins(self, env):
        env.toponym = TOPONYM
        assert (await _save(env)).json()["name"] == TOPONYM.name
        assert (await _save(env, lat=41.80, name="Mi sitio")).json()["name"] == "Mi sitio"

    async def test_without_a_name_nor_toponym_it_uses_the_coordinates(self, env):
        assert (await _save(env)).json()["name"] == "41.7745, 2.4350"

    async def test_failing_services_never_block_the_save(self, env):
        env.elevation = None
        r = await _save(env)
        body = r.json()
        assert r.status_code == 201
        assert (body["land_cover"], body["toponym"], body["elevation_m"]) == (None, None, None)

    async def test_coordinates_are_rounded_to_five_decimals(self, env):
        body = (await _save(env, lat=41.774512345, lon=2.435049999)).json()
        assert (body["lat"], body["lon"]) == (41.77451, 2.43505)

    async def test_forest_types_keep_their_order_and_lose_duplicates(self, env):
        body = (await _save(env, forest_types=["pinar", "encinar", "pinar"])).json()
        assert body["forest_types"] == ["pinar", "encinar"]
        assert (await _save(env, lat=41.8)).json()["forest_types"] is None

    @pytest.mark.parametrize(
        "bad",
        [
            {"lat": 48.85, "lon": 2.35}, {"lat": 41.7, "lon": -3.7}, {"name": "  "},
            {"name": "x" * 81}, {"notes": "x" * 2001}, {"forest_types": ["bosque"]},
            {"forest_types": []}, {"forest_types": ["mixto"]},
        ],
    )
    async def test_invalid_input_is_422(self, env, bad):
        assert (await _save(env, **bad)).status_code == 422
        assert env.points.rows == {}

    async def test_the_cell_comes_from_the_lookup_and_saving_loads_nothing(self, env):
        env.cells.lookups[lookup_key(SANTA_FE["lat"], SANTA_FE["lon"])] = "41.8000_2.4000"
        assert (await _save(env)).json()["cell_id"] == "41.8000_2.4000"
        assert (await _save(env, lat=41.9, lon=1.9)).json()["cell_id"] is None
        assert env.log["resolve"] == [] and env.log["fetch"] == []

    async def test_the_same_place_twice_is_409_and_the_services_are_not_asked_again(self, env):
        assert (await _save(env)).status_code == 201
        asked = len(env.calls)
        assert (await _save(env)).status_code == 409
        assert len(env.calls) == asked and len(env.points.rows) == 1
        assert (await _save(env, user_id=2)).status_code == 201  # another user's place

    async def test_a_race_on_the_unique_key_is_409(self, env):
        env.points.race_on_add = True
        assert (await _save(env)).status_code == 409


class TestLimit:
    def test_there_is_no_limit_by_default(self):
        default = Settings.model_fields["observatory_max_saved_points_per_user"].default
        assert default == 0

    async def test_over_the_limit_is_409_before_asking_any_service(self, env, monkeypatch):
        monkeypatch.setattr(sp.settings, "observatory_max_saved_points_per_user", 2)
        assert (await _save(env, lat=41.1)).status_code == 201
        assert (await _save(env, lat=41.2)).status_code == 201
        asked = len(env.calls)
        r = await _save(env, lat=41.3)
        assert r.status_code == 409 and "limit" in r.json()["detail"].lower()
        assert len(env.calls) == asked
        assert (await _save(env, user_id=2, lat=41.3)).status_code == 201  # per user

    async def test_zero_means_no_limit(self, env):
        codes = [(await _save(env, lat=41.0 + i / 10)).status_code for i in range(1, 6)]
        assert codes == [201] * 5


class TestComposition:
    def test_codes_and_percentages_sorted_and_rounded_without_anything_else(self):
        assert composition_json([("bqi20", 4.96), ("bfs20", 95.04)], 300) == {
            "radius_m": 300,
            "items": [{"code": "bfs20", "pct": 95.0}, {"code": "bqi20", "pct": 5.0}],
        }

    def test_an_empty_composition_is_none(self):
        assert composition_json([], 300) is None

    async def test_the_service_stores_it_as_given(self):
        store = FakeSavedStore()
        comp = composition_json([("bfs20", 95.04), ("bqi20", 4.96)], 300)

        async def context(lat, lon):
            return PointContext(None, None, None, None, comp)

        record = await create_saved_point(
            store, 1, NewPoint(41.7745, 2.435, "Fageda", None, None), context, max_per_user=0
        )
        assert record.composition == comp and store.rows[record.id].composition == comp

    async def test_through_the_api_it_is_null_until_the_mcsc_grid_exists(self, env):
        assert (await _save(env)).json()["composition"] is None


# ── Read ──────────────────────────────────────────────────────────────────────

class TestRead:
    async def test_an_empty_list(self, env):
        _login(env)
        async with _client(env.app) as c:
            assert (await c.get(BASE)).json() == []

    async def test_the_list_is_mine_only_and_newest_first(self, env):
        a = (await _save(env, lat=41.1)).json()["id"]
        b = (await _save(env, lat=41.2)).json()["id"]
        await _save(env, user_id=2, lat=41.3)
        _login(env, 1)
        async with _client(env.app) as c:
            ids = [p["id"] for p in (await c.get(BASE)).json()]
        assert ids == [b, a]

    async def test_the_detail_is_mine_only(self, env):
        env.cover = FOREST
        pid = (await _save(env, name="Mío")).json()["id"]
        _login(env, 1)
        async with _client(env.app) as c:
            mine = await c.get(f"{BASE}/{pid}")
            _login(env, 2)
            theirs = await c.get(f"{BASE}/{pid}")
            missing = await c.get(f"{BASE}/999")
            bad = await c.get(f"{BASE}/abc")
        assert mine.json()["name"] == "Mío" and mine.json()["land_cover"]["code"] == 4
        assert (theirs.status_code, missing.status_code, bad.status_code) == (404, 404, 422)


# ── Update ────────────────────────────────────────────────────────────────────

class TestUpdate:
    async def _patch(self, env, pid, body, user_id=1):
        _login(env, user_id)
        async with _client(env.app) as c:
            return await c.patch(f"{BASE}/{pid}", json=body)

    async def test_name_notes_and_forest_types_change_and_the_rest_does_not(self, env):
        env.cover = FOREST
        first = (await _save(env, name="A", notes="n")).json()
        r = await self._patch(
            env, first["id"], {"name": "B", "notes": "m", "forest_types": ["hayedo", "pinar"]}
        )
        body = r.json()
        assert r.status_code == 200
        assert (body["name"], body["notes"]) == ("B", "m")
        assert body["forest_types"] == ["hayedo", "pinar"]
        assert body["created_at"] == first["created_at"]
        assert body["updated_at"] != first["updated_at"]
        assert (body["lat"], body["lon"], body["land_cover"]) == (
            first["lat"], first["lon"], first["land_cover"]
        )

    async def test_null_clears_notes_and_forest_types(self, env):
        pid = (await _save(env, notes="n", forest_types=["pinar"])).json()["id"]
        body = (await self._patch(env, pid, {"notes": None, "forest_types": None})).json()
        assert body["notes"] is None and body["forest_types"] is None

    @pytest.mark.parametrize(
        "bad",
        [
            {}, {"lat": 41.0}, {"land_cover_code": 1}, {"name": None}, {"name": " "},
            {"forest_types": []}, {"forest_types": ["bosque"]}, {"notes": "x" * 2001},
        ],
    )
    async def test_invalid_changes_are_422_and_nothing_changes(self, env, bad):
        pid = (await _save(env, name="A")).json()["id"]
        assert (await self._patch(env, pid, bad)).status_code == 422
        assert env.points.rows[pid].name == "A"

    async def test_someone_else_s_point_is_404_and_untouched(self, env):
        pid = (await _save(env, name="A")).json()["id"]
        assert (await self._patch(env, pid, {"name": "B"}, user_id=2)).status_code == 404
        assert env.points.rows[pid].name == "A"


# ── Delete ────────────────────────────────────────────────────────────────────

class TestDelete:
    async def test_it_deletes_once(self, env):
        pid = (await _save(env)).json()["id"]
        _login(env)
        async with _client(env.app) as c:
            first = await c.delete(f"{BASE}/{pid}")
            second = await c.delete(f"{BASE}/{pid}")
        assert (first.status_code, second.status_code) == (204, 404) and env.points.rows == {}

    async def test_someone_else_s_point_is_404_and_still_there(self, env):
        pid = (await _save(env)).json()["id"]
        _login(env, 2)
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{pid}")).status_code == 404
        assert pid in env.points.rows


# ── Species of a saved point: the author's forest types ──────────────────────

class TestSpeciesOfASavedPoint:
    async def _species(self, env, pid, user_id=1):
        _login(env, user_id)
        async with _client(env.app) as c:
            return await c.get(f"{BASE}/{pid}/species")

    @staticmethod
    def _ids(r):
        return sorted(i["id"] for i in r.json()["species"])

    def test_the_authors_types_also_admit_the_mixed_forest_species(self):
        assert author_forest_types(["pinar", "encinar"]) == {"pinar", "encinar", "mixto"}

    async def test_the_authors_types_do_not_override_no_forest(self, env):
        env.cover = URBAN
        pid = (await _save(env, forest_types=["pinar", "encinar"])).json()["id"]
        body = (await self._species(env, pid)).json()
        assert body["species"] == [] and body["reason"] == "no_forest"
        assert body["forest_source"] == "land_cover"

    async def test_the_authors_types_do_not_override_the_map_sources(self, env):
        env.cover = FOREST  # conifer: pinar
        pid = (await _save(env, forest_types=["encinar"])).json()["id"]
        r = await self._species(env, pid)
        assert self._ids(r) == ["any-sp", "pinar-sp"]
        assert r.json()["forest_source"] == "land_cover"

    async def test_without_authors_types_the_stored_cover_decides_and_the_icgc_is_not_asked(
        self, env
    ):
        env.cover = FOREST
        pid = (await _save(env)).json()["id"]
        env.cover = None  # the service would now say "unknown"
        asked = env.calls.count("cover")
        r = await self._species(env, pid)
        assert self._ids(r) == ["any-sp", "pinar-sp"]
        assert r.json()["forest_source"] == "land_cover" and env.calls.count("cover") == asked

    async def test_a_stored_non_forest_class_means_no_forest(self, env):
        env.cover = URBAN
        pid = (await _save(env)).json()["id"]
        body = (await self._species(env, pid)).json()
        assert body["species"] == [] and body["reason"] == "no_forest"
        assert body["land_cover"]["code"] == 31

    async def test_with_nothing_stored_it_asks_the_icgc_now(self, env):
        pid = (await _save(env)).json()["id"]  # the ICGC failed when saving
        env.cover = FOREST
        r = await self._species(env, pid)
        assert self._ids(r) == ["any-sp", "pinar-sp"] and r.json()["forest_source"] == "land_cover"

    async def test_it_answers_for_the_saved_coordinates(self, env):
        pid = (await _save(env, lat=41.80, lon=2.40)).json()["id"]
        body = (await self._species(env, pid)).json()
        assert (body["point"]["lat"], body["point"]["lon"]) == (41.8, 2.4)

    async def test_someone_else_s_or_unknown_point_is_404(self, env):
        pid = (await _save(env)).json()["id"]
        assert (await self._species(env, pid, user_id=2)).status_code == 404
        assert (await self._species(env, 999)).status_code == 404


class TestStoredCover:
    def test_the_macrotype_is_derived_again_from_the_stored_class(self):
        assert cover_from_class(4, "Bosc dens d'aciculifolis").macrotype == "conifera"
        assert cover_from_class(5, "Bosc dens d'esclerofil·les").macrotype == "esclerofilo"
        assert cover_from_class(31, "Eixample").forest is False

    def test_the_sea_has_no_data(self):
        cover = cover_from_class(0, "Sense dades")
        assert cover.forest is None and cover.macrotype is None


# ── Model and migration ───────────────────────────────────────────────────────

MIGRATION = Path(__file__).parents[2] / "migrations" / "versions" / "019_saved_points.py"


class TestModel:
    def test_it_belongs_to_a_user_and_follows_its_deletion(self):
        fk = next(iter(SavedPoint.__table__.c.user_id.foreign_keys))
        assert fk.column.table.name == "users" and fk.ondelete == "CASCADE"

    def test_a_cell_is_not_a_foreign_key_because_cells_are_a_rebuildable_cache(self):
        assert not SavedPoint.__table__.c.cell_id.foreign_keys

    def test_forest_types_are_a_list_and_the_composition_json(self):
        cols = SavedPoint.__table__.c
        assert isinstance(cols.forest_types.type, ARRAY) and cols.forest_types.nullable
        assert isinstance(cols.composition.type, JSONB) and cols.composition.nullable

    def test_one_point_per_user_and_place(self):
        uniques = [
            [c.name for c in k.columns]
            for k in SavedPoint.__table__.constraints
            if k.__class__.__name__ == "UniqueConstraint"
        ]
        assert ["user_id", "lat", "lon"] in uniques

    def test_the_stored_provenance_has_no_raw_or_derived_columns(self):
        names = {c.name for c in SavedPoint.__table__.columns}
        assert names >= {"land_cover_layer", "land_cover_code", "land_cover_name",
                         "land_cover_retrieved_at", "toponym_name", "toponym_label"}
        assert not names & {"macrotype", "forest", "raw", "land_cover_raw", "toponym_raw"}

    def test_the_migration_follows_018_and_enables_rls(self):
        spec = importlib.util.spec_from_file_location("m_019", MIGRATION)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert (module.revision, module.down_revision) == ("019", "018")
        assert "ENABLE ROW LEVEL SECURITY" in MIGRATION.read_text()
