"""Saved points / corners (feat/observatory-corners-model): CRUD, kind, tagged species.

No DB, no network. Scenarios follow the proposal agreed on 2026-10-22: a corner stores only
what the user writes (name, notes, kind, tagged species) and the coordinates, plus the
elevation; the toponym, the land cover, the climate cell and the like are never stored.
"""
import dataclasses
import importlib.util
from datetime import UTC, datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.config import Settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    SavedPoint,
    SavedPointPhoto,
    SavedPointPhotoSpecies,
    SavedPointSpecies,
)
from app.routers import observatory as obs
from app.routers import saved_points as sp
from app.services.point_forest import LandCover, Toponym
from app.services.saved_points import (
    KINDS,
    DuplicatePoint,
    NewPoint,
    PointContext,
    SavedPointRecord,
    all_species_ids,
    create_saved_point,
)
from tests.unit.fakes import FakePhotoStore, FakeUsageLog
from tests.unit.test_cell_provider import TODAY, _provider
from tests.unit.test_observatory_router import SANTA_FE, _StoreWithHistory

BASE = "/observatory/saved-points"
RETRIEVED = "2026-10-16T21:00:00+00:00"

FOREST = LandCover(4, "Bosc dens d'aciculifolis", "conifera", True, fetched_at=RETRIEVED)
URBAN = LandCover(31, "Eixample", None, False, fetched_at=RETRIEVED)
TOPONYM = Toponym(
    name="Santa Fe del Montseny", label="Santa Fe del Montseny (Fogars de Montclús)",
    kind="Disseminat", layer="topo2", municipality="Fogars de Montclús", comarca="Vallès",
    distance_km=0.2,
)

# The catalogue ids a corner can be tagged with in these tests
KNOWN_SPECIES = {"esp-001", "esp-002", "esp-003", "pinar-sp", "encinar-sp", "hayedo-sp", "any-sp"}


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
        self._clock = datetime(2026, 10, 22, 19, 0, tzinfo=UTC)
        self.race_on_add = False
        self.catalogue = set(KNOWN_SPECIES)

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
        changes = dict(changes)
        if "species_ids" in changes:
            changes["species_ids"] = tuple(changes["species_ids"])
        self.rows[point_id] = dataclasses.replace(row, **changes, updated_at=self._tick())
        return self.rows[point_id]

    async def delete(self, user_id, point_id):
        if await self.get(user_id, point_id) is None:
            return False
        del self.rows[point_id]
        return True

    async def known_species(self, ids):
        return set(ids) & self.catalogue


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
    app.dependency_overrides[sp.get_photo_store] = FakePhotoStore
    app.dependency_overrides[sp.get_photo_storage] = lambda: None
    app.dependency_overrides[sp.get_usage_log] = FakeUsageLog
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

    monkeypatch.setattr(obs, "land_cover", cover)
    for module in (sp, obs):
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
    async def test_it_saves_what_the_user_wrote_and_the_elevation(self, env):
        env.cover, env.toponym = FOREST, TOPONYM
        r = await _save(env, name="Mi fageda", notes="buen año")
        body = r.json()
        assert r.status_code == 201 and body["id"] >= 1
        assert (body["name"], body["notes"]) == ("Mi fageda", "buen año")
        assert (body["lat"], body["lon"]) == (SANTA_FE["lat"], SANTA_FE["lon"])
        assert body["elevation_m"] == 1167.0

    async def test_it_stores_nothing_a_service_or_a_model_derives(self, env):
        env.cover, env.toponym = FOREST, TOPONYM
        body = (await _save(env)).json()
        record = env.points.rows[body["id"]]
        derived = (
            "land_cover", "toponym", "cell_id", "composition", "forest_types", "macrotype",
            "forest", "raw",
        )
        for name in derived:
            assert name not in body and not hasattr(record, name)

    async def test_the_land_cover_is_not_even_asked_when_saving(self, env):
        env.cover, env.toponym = FOREST, TOPONYM
        await _save(env)
        assert "cover" not in env.calls and env.log["resolve"] == [] and env.log["fetch"] == []

    @pytest.mark.parametrize(
        "extra",
        [
            {"land_cover_code": 4}, {"elevation_m": 10}, {"cell_id": "x"},
            {"composition": {"items": []}}, {"toponym_name": "x"}, {"forest_types": ["pinar"]},
            {"forest_type": "pinar"}, {"photos": []},
        ],
    )
    async def test_data_the_server_derives_or_that_is_gone_is_rejected(self, env, extra):
        assert (await _save(env, **extra)).status_code == 422
        assert env.points.rows == {}

    async def test_without_a_name_it_uses_the_toponym_and_with_one_the_user_wins(self, env):
        env.toponym = TOPONYM
        assert (await _save(env)).json()["name"] == TOPONYM.name
        assert (await _save(env, lat=41.80, name="Mi sitio")).json()["name"] == "Mi sitio"

    async def test_a_blank_name_is_the_same_as_none(self, env):
        env.toponym = TOPONYM
        assert (await _save(env, name="   ")).json()["name"] == TOPONYM.name
        assert (await _save(env, lat=41.80, name="")).json()["name"] == TOPONYM.name

    async def test_without_a_name_nor_toponym_it_uses_the_coordinates(self, env):
        assert (await _save(env)).json()["name"] == "41.7745, 2.4350"

    async def test_failing_services_never_block_the_save(self, env):
        env.elevation = None
        r = await _save(env)
        assert r.status_code == 201 and r.json()["elevation_m"] is None

    async def test_coordinates_are_rounded_to_five_decimals(self, env):
        body = (await _save(env, lat=41.774512345, lon=2.435049999)).json()
        assert (body["lat"], body["lon"]) == (41.77451, 2.43505)

    @pytest.mark.parametrize(
        "bad",
        [
            {"lat": 48.85, "lon": 2.35}, {"lat": 41.7, "lon": -3.7},
            {"name": "x" * 81}, {"notes": "x" * 2001},
        ],
    )
    async def test_invalid_input_is_422(self, env, bad):
        assert (await _save(env, **bad)).status_code == 422
        assert env.points.rows == {}

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


# ── Kind ──────────────────────────────────────────────────────────────────────

class TestKind:
    def test_the_four_kinds_and_the_default(self):
        assert KINDS == ("unspecified", "mushroom_site", "prospect", "parking")

    async def test_a_corner_is_unspecified_unless_the_user_says_otherwise(self, env):
        assert (await _save(env)).json()["kind"] == "unspecified"

    @pytest.mark.parametrize("kind", ["unspecified", "mushroom_site", "prospect", "parking"])
    async def test_every_kind_can_be_chosen_when_saving(self, env, kind):
        assert (await _save(env, kind=kind)).json()["kind"] == kind

    @pytest.mark.parametrize("bad", ["setal", "", "PARKING", None, 3])
    async def test_an_unknown_kind_is_422(self, env, bad):
        assert (await _save(env, kind=bad)).status_code == 422
        assert env.points.rows == {}

    async def test_the_kind_is_not_computed_from_the_tagged_species(self, env):
        body = (await _save(env, species_ids=["esp-001"])).json()
        assert body["kind"] == "unspecified"  # tagging a mushroom never turns it into a setal


# ── Tagged species ────────────────────────────────────────────────────────────

class TestSpecies:
    async def test_a_corner_can_be_saved_with_species_from_the_catalogue(self, env):
        body = (await _save(env, species_ids=["esp-002", "esp-001"])).json()
        assert body["species_ids"] == ["esp-002", "esp-001"]
        assert body["all_species_ids"] == ["esp-002", "esp-001"]

    async def test_without_species_the_lists_are_empty(self, env):
        body = (await _save(env)).json()
        assert (body["species_ids"], body["all_species_ids"]) == ([], [])

    async def test_duplicates_are_dropped_and_the_order_is_kept(self, env):
        body = (await _save(env, species_ids=["esp-002", "esp-001", "esp-002"])).json()
        assert body["species_ids"] == ["esp-002", "esp-001"]

    async def test_an_unknown_species_is_422_and_nothing_is_saved(self, env):
        r = await _save(env, species_ids=["esp-001", "esp-999"])
        assert r.status_code == 422 and "esp-999" in r.json()["detail"]
        assert env.points.rows == {} and env.calls == []

    async def test_there_is_a_ceiling_on_tags_per_corner(self, env):
        env.points.catalogue = {f"s{i}" for i in range(60)}
        assert (await _save(env, species_ids=[f"s{i}" for i in range(50)])).status_code == 201
        assert (
            await _save(env, lat=41.9, species_ids=[f"s{i}" for i in range(51)])
        ).status_code == 422

    def test_the_species_of_the_photos_join_the_corners_own_without_repeats(self):
        record = SavedPointRecord(
            1, 41.0, 2.0, "x", species_ids=("esp-001", "esp-002"),
            photo_species_ids=("esp-002", "esp-003"),
        )
        assert all_species_ids(record) == ["esp-001", "esp-002", "esp-003"]

    def test_a_corner_with_only_tagged_photos_lists_those(self):
        record = SavedPointRecord(1, 41.0, 2.0, "x", photo_species_ids=("esp-003",))
        assert all_species_ids(record) == ["esp-003"]

    async def test_the_response_unites_both_lists(self, env):
        pid = (await _save(env, species_ids=["esp-001"])).json()["id"]
        env.points.rows[pid] = dataclasses.replace(
            env.points.rows[pid], photo_species_ids=("esp-001", "esp-003")
        )
        _login(env)
        async with _client(env.app) as c:
            body = (await c.get(f"{BASE}/{pid}")).json()
        assert body["species_ids"] == ["esp-001"]
        assert body["all_species_ids"] == ["esp-001", "esp-003"]


# ── Service: create ───────────────────────────────────────────────────────────

class TestCreateService:
    async def test_the_service_keeps_kind_and_species_as_given(self):
        store = FakeSavedStore()

        async def context(lat, lon):
            return PointContext(None, 950.0)

        record = await create_saved_point(
            store, 1, NewPoint(41.7745, 2.435, "Fageda", None, "mushroom_site", ("esp-001",)),
            context, max_per_user=0,
        )
        assert (record.kind, record.species_ids, record.elevation_m) == (
            "mushroom_site", ("esp-001",), 950.0
        )
        assert store.rows[record.id] == record


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
        pid = (await _save(env, name="Mío", kind="parking")).json()["id"]
        _login(env, 1)
        async with _client(env.app) as c:
            mine = await c.get(f"{BASE}/{pid}")
            _login(env, 2)
            theirs = await c.get(f"{BASE}/{pid}")
            missing = await c.get(f"{BASE}/999")
            bad = await c.get(f"{BASE}/abc")
        assert mine.json()["name"] == "Mío" and mine.json()["kind"] == "parking"
        assert (theirs.status_code, missing.status_code, bad.status_code) == (404, 404, 422)


# ── Update ────────────────────────────────────────────────────────────────────

class TestUpdate:
    async def _patch(self, env, pid, body, user_id=1):
        _login(env, user_id)
        async with _client(env.app) as c:
            return await c.patch(f"{BASE}/{pid}", json=body)

    async def test_name_notes_kind_and_species_change_and_the_rest_does_not(self, env):
        first = (await _save(env, name="A", notes="n")).json()
        r = await self._patch(
            env, first["id"],
            {"name": "B", "notes": "m", "kind": "mushroom_site", "species_ids": ["esp-001"]},
        )
        body = r.json()
        assert r.status_code == 200
        assert (body["name"], body["notes"], body["kind"]) == ("B", "m", "mushroom_site")
        assert body["species_ids"] == ["esp-001"]
        assert body["created_at"] == first["created_at"]
        assert body["updated_at"] != first["updated_at"]
        assert (body["lat"], body["lon"], body["elevation_m"]) == (
            first["lat"], first["lon"], first["elevation_m"]
        )

    async def test_the_kind_changes_on_its_own(self, env):
        pid = (await _save(env, kind="prospect", species_ids=["esp-001"])).json()["id"]
        body = (await self._patch(env, pid, {"kind": "mushroom_site"})).json()
        assert body["kind"] == "mushroom_site" and body["species_ids"] == ["esp-001"]

    async def test_species_are_replaced_as_a_whole_and_an_empty_list_clears_them(self, env):
        pid = (await _save(env, species_ids=["esp-001", "esp-002"])).json()["id"]
        body = (await self._patch(env, pid, {"species_ids": ["esp-003"]})).json()
        assert body["species_ids"] == ["esp-003"]
        body = (await self._patch(env, pid, {"species_ids": []})).json()
        assert body["species_ids"] == [] and body["all_species_ids"] == []

    async def test_a_name_change_leaves_the_species_alone(self, env):
        pid = (await _save(env, species_ids=["esp-001"])).json()["id"]
        assert (await self._patch(env, pid, {"name": "B"})).json()["species_ids"] == ["esp-001"]

    async def test_a_blank_name_puts_the_toponym_back(self, env):
        env.toponym = TOPONYM
        pid = (await _save(env, name="Mi sitio")).json()["id"]
        for blank in ("", "   "):
            await self._patch(env, pid, {"name": "Otro"})
            body = (await self._patch(env, pid, {"name": blank})).json()
            assert body["name"] == TOPONYM.name

    async def test_a_blank_name_without_toponym_puts_the_coordinates_back(self, env):
        pid = (await _save(env, name="Mi sitio")).json()["id"]
        assert (await self._patch(env, pid, {"name": ""})).json()["name"] == "41.7745, 2.4350"

    async def test_null_clears_notes(self, env):
        pid = (await _save(env, notes="n")).json()["id"]
        assert (await self._patch(env, pid, {"notes": None})).json()["notes"] is None

    @pytest.mark.parametrize(
        "bad",
        [
            {}, {"lat": 41.0}, {"land_cover_code": 1}, {"name": None}, {"name": "x" * 81},
            {"kind": None}, {"kind": "setal"}, {"species_ids": None},
            {"species_ids": ["esp-999"]}, {"forest_types": ["pinar"]}, {"notes": "x" * 2001},
        ],
    )
    async def test_invalid_changes_are_422_and_nothing_changes(self, env, bad):
        pid = (await _save(env, name="A", species_ids=["esp-001"])).json()["id"]
        before = env.points.rows[pid]
        assert (await self._patch(env, pid, bad)).status_code == 422
        assert env.points.rows[pid] == before

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


# ── Species that fit a saved point ────────────────────────────────────────────

class TestSpeciesOfASavedPoint:
    async def _species(self, env, pid, user_id=1):
        _login(env, user_id)
        async with _client(env.app) as c:
            return await c.get(f"{BASE}/{pid}/species")

    @staticmethod
    def _ids(r):
        return sorted(i["id"] for i in r.json()["species"])

    async def test_the_land_cover_is_asked_now_and_decides(self, env):
        pid = (await _save(env)).json()["id"]
        env.cover = FOREST  # conifer: pinar
        r = await self._species(env, pid)
        assert self._ids(r) == ["any-sp", "pinar-sp"]
        assert r.json()["forest_source"] == "land_cover" and env.calls.count("cover") == 1

    async def test_a_non_forest_class_means_no_forest(self, env):
        pid = (await _save(env)).json()["id"]
        env.cover = URBAN
        body = (await self._species(env, pid)).json()
        assert body["species"] == [] and body["reason"] == "no_forest"
        assert body["land_cover"]["code"] == 31

    async def test_a_corner_s_own_species_do_not_change_what_fits_there(self, env):
        env.cover = FOREST
        pid = (await _save(env, species_ids=["hayedo-sp"])).json()["id"]
        assert self._ids(await self._species(env, pid)) == ["any-sp", "pinar-sp"]

    async def test_when_the_icgc_does_not_answer_nobody_is_excluded_by_forest(self, env):
        pid = (await _save(env)).json()["id"]
        env.cover = None
        r = await self._species(env, pid)
        assert r.json()["forest_source"] is None and len(self._ids(r)) == len(CATALOGUE)

    async def test_it_answers_for_the_saved_coordinates(self, env):
        pid = (await _save(env, lat=41.80, lon=2.40)).json()["id"]
        body = (await self._species(env, pid)).json()
        assert (body["point"]["lat"], body["point"]["lon"]) == (41.8, 2.4)

    async def test_someone_else_s_or_unknown_point_is_404(self, env):
        pid = (await _save(env)).json()["id"]
        assert (await self._species(env, pid, user_id=2)).status_code == 404
        assert (await self._species(env, 999)).status_code == 404


# ── Model and migration ───────────────────────────────────────────────────────

VERSIONS = Path(__file__).parents[2] / "migrations" / "versions"
MIGRATION = VERSIONS / "020_corners.py"
DROPPED = {
    "forest_types", "cell_id", "land_cover_layer", "land_cover_code", "land_cover_name",
    "land_cover_retrieved_at", "toponym_name", "toponym_label", "composition",
}


def _migration():
    spec = importlib.util.spec_from_file_location("m_020", MIGRATION)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class TestModel:
    def test_it_belongs_to_a_user_and_follows_its_deletion(self):
        fk = next(iter(SavedPoint.__table__.c.user_id.foreign_keys))
        assert fk.column.table.name == "users" and fk.ondelete == "CASCADE"

    def test_one_point_per_user_and_place(self):
        uniques = [
            [c.name for c in k.columns]
            for k in SavedPoint.__table__.constraints
            if k.__class__.__name__ == "UniqueConstraint"
        ]
        assert ["user_id", "lat", "lon"] in uniques

    def test_only_what_the_user_writes_the_coordinates_and_the_elevation_are_stored(self):
        names = {c.name for c in SavedPoint.__table__.columns}
        assert names == {
            "id", "user_id", "lat", "lon", "name", "notes", "kind", "elevation_m", "created_at",
            "updated_at",
        }
        assert not names & DROPPED

    def test_the_kind_is_closed_to_the_four_values_and_defaults_to_unspecified(self):
        kind = SavedPoint.__table__.c.kind
        assert not kind.nullable and kind.server_default.arg == "unspecified"
        checks = [str(k.sqltext) for k in SavedPoint.__table__.constraints
                  if k.__class__.__name__ == "CheckConstraint"]
        assert any(all(f"'{v}'" in text for v in KINDS) for text in checks)

    @pytest.mark.parametrize(
        ("model", "parent", "column"),
        [
            (SavedPointSpecies, "saved_points", "saved_point_id"),
            (SavedPointSpecies, "species", "species_id"),
            (SavedPointPhoto, "saved_points", "saved_point_id"),
            (SavedPointPhotoSpecies, "saved_point_photos", "photo_id"),
            (SavedPointPhotoSpecies, "species", "species_id"),
        ],
    )
    def test_tags_and_photos_follow_the_deletion_of_what_they_hang_from(
        self, model, parent, column
    ):
        fk = next(iter(model.__table__.c[column].foreign_keys))
        assert fk.column.table.name == parent and fk.ondelete == "CASCADE"

    def test_a_species_is_tagged_once_per_corner_and_once_per_photo(self):
        assert [c.name for c in SavedPointSpecies.__table__.primary_key.columns] == [
            "saved_point_id", "species_id"
        ]
        assert [c.name for c in SavedPointPhotoSpecies.__table__.primary_key.columns] == [
            "photo_id", "species_id"
        ]

    def test_a_photo_position_is_unique_within_its_corner(self):
        uniques = [
            [c.name for c in k.columns]
            for k in SavedPointPhoto.__table__.constraints
            if k.__class__.__name__ == "UniqueConstraint"
        ]
        assert ["saved_point_id", "position"] in uniques

    def test_the_migration_follows_019_enables_rls_and_drops_the_provenance(self):
        module = _migration()
        assert (module.revision, module.down_revision) == ("020", "019")
        assert tuple(module.KINDS) == KINDS
        assert {name for name, _ in module.DROPPED} == DROPPED
        text = MIGRATION.read_text()
        assert "ENABLE ROW LEVEL SECURITY" in text
        assert (
            'for table in ("saved_point_species", "saved_point_photos", '
            '"saved_point_photo_species")'
        ) in text

    def test_the_migration_is_the_next_after_019_and_nothing_else_claims_020(self):
        revisions = {p.name[:3] for p in VERSIONS.glob("0*.py")}
        assert "019" in revisions and "020" in revisions
        assert len([p for p in VERSIONS.glob("020_*.py")]) == 1
