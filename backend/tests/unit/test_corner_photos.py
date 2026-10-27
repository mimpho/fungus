"""Corner photos, endpoints and flow (feat/observatory-corners-photos).

No DB, no network: in-memory stores and a fake object storage. Scenarios agreed on 2026-10-22/24:
up to 5 photos per corner, WebP thumbnail + large, no EXIF, private storage with short-lived signed
URLs, species tagged per photo, anti-abuse limits (size, pixels, uploads/day, new corners/day),
objects removed when a photo, a corner or the account goes away.
"""
import io
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from PIL import Image

from app.dependencies import get_current_user
from app.routers import corner_photos as cp
from app.routers import saved_points as sp
from app.services.corner_photos import (
    EVENT_CORNER_CREATE,
    EVENT_PHOTO_UPLOAD,
    seconds_until_midnight_utc,
)
from app.services.saved_points import SavedPointRecord
from tests.unit.fakes import FakePhotoStorage, FakePhotoStore, FakeUsageLog
from tests.unit.test_saved_points import FakeSavedStore

BASE = "/observatory/saved-points"


def _jpeg(size=(1600, 1200), fmt="JPEG"):
    buf = io.BytesIO()
    Image.new("RGB", size, (30, 120, 60)).save(buf, fmt)
    return buf.getvalue()


@pytest.fixture
def env(monkeypatch):
    points, photos, storage, usage = FakeSavedStore(), FakePhotoStore(), FakePhotoStorage(), (
        FakeUsageLog()
    )
    app = FastAPI()
    app.include_router(sp.router, prefix="/api/v1")
    app.include_router(cp.router, prefix="/api/v1")
    app.dependency_overrides[sp.get_saved_point_store] = lambda: points
    app.dependency_overrides[sp.get_photo_store] = lambda: photos
    app.dependency_overrides[sp.get_photo_storage] = lambda: storage
    app.dependency_overrides[sp.get_usage_log] = lambda: usage
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1, role="user")
    for name, value in (
        ("corner_photos_max_per_corner", 5), ("corner_photo_max_bytes", 15 * 1024 * 1024),
        ("corner_photo_max_pixels", 60_000_000), ("corner_photo_uploads_per_user_per_day", 30),
        ("corner_photo_url_ttl_seconds", 3600),
    ):
        monkeypatch.setattr(cp.settings, name, value)
    monkeypatch.setattr(sp.settings, "observatory_max_new_corners_per_user_per_day", 50)
    monkeypatch.setattr(sp.settings, "observatory_max_saved_points_per_user", 0)
    return SimpleNamespace(
        app=app, points=points, photos=photos, storage=storage, usage=usage, mp=monkeypatch
    )


def _client(app):
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t/api/v1")


def _login(env, user_id):
    env.app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=user_id, role="user"
    )


async def _corner(env, user_id=1, lat=41.77):
    record = await env.points.add(
        SavedPointRecord(user_id=user_id, lat=lat, lon=2.43, name="Mi fageda")
    )
    env.photos.own(record.id, user_id)
    return record.id


async def _upload(env, point_id, data=None, species=(), filename="foto.jpg", user_id=None):
    if user_id:
        _login(env, user_id)
    data = _jpeg() if data is None else data
    async with _client(env.app) as c:
        return await c.post(
            f"{BASE}/{point_id}/photos",
            files={"file": (filename, data, "application/octet-stream")},
            data={"species_ids": list(species)},
        )


# ── Login and ownership ───────────────────────────────────────────────────────

class TestAccess:
    @pytest.mark.parametrize(
        ("method", "path"),
        [
            ("GET", f"{BASE}/1/photos"), ("POST", f"{BASE}/1/photos"),
            ("DELETE", f"{BASE}/1/photos/1"), ("PATCH", f"{BASE}/1/photos/1"),
        ],
    )
    async def test_without_a_token_every_endpoint_answers_401(self, env, method, path):
        env.app.dependency_overrides.pop(get_current_user)
        async with _client(env.app) as c:
            assert (await c.request(method, path)).status_code == 401
        assert env.storage.objects == {}

    async def test_someone_elses_corner_looks_like_a_missing_one(self, env):
        point = await _corner(env, user_id=2)
        assert (await _upload(env, point)).status_code == 404
        assert env.storage.objects == {} and env.photos.rows == {}
        async with _client(env.app) as c:
            assert (await c.get(f"{BASE}/{point}/photos")).status_code == 404
            assert (await c.delete(f"{BASE}/{point}/photos/1")).status_code == 404

    async def test_a_photo_of_another_corner_is_a_404(self, env):
        a, b = await _corner(env), await _corner(env, lat=41.8)
        photo = (await _upload(env, a)).json()["id"]
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{b}/photos/{photo}")).status_code == 404
            r = await c.patch(f"{BASE}/{b}/photos/{photo}", json={"species_ids": []})
            assert r.status_code == 404
        assert photo in env.photos.rows

    async def test_without_configured_storage_uploading_is_503(self, env):
        point = await _corner(env)
        env.app.dependency_overrides[sp.get_photo_storage] = lambda: None
        r = await _upload(env, point)
        assert r.status_code == 503 and env.photos.rows == {}


# ── Upload ────────────────────────────────────────────────────────────────────

class TestUpload:
    async def test_it_stores_both_copies_and_answers_with_signed_urls(self, env):
        point = await _corner(env)
        r = await _upload(env, point)
        body = r.json()
        assert r.status_code == 201
        assert body["position"] == 0 and body["species_ids"] == []
        assert len(env.storage.objects) == 2
        keys = sorted(env.storage.objects)
        assert all(k.startswith(f"corners/1/{point}/") and k.endswith(".webp") for k in keys)
        assert body["thumb_url"].startswith("https://fake.storage/")
        assert body["large_url"].startswith("https://fake.storage/")
        assert "exp=3600" in body["thumb_url"]
        thumb = Image.open(io.BytesIO(env.storage.objects[env.photos.rows[body["id"]].thumb_key]))
        assert thumb.format == "WEBP" and max(thumb.size) == 600

    async def test_the_response_never_exposes_the_storage_keys(self, env):
        body = (await _upload(env, await _corner(env))).json()
        assert not any("key" in name for name in body)

    async def test_species_are_tagged_on_the_photo(self, env):
        point = await _corner(env)
        r = await _upload(env, point, species=["esp-001", "esp-002", "esp-001"])
        assert r.status_code == 201 and r.json()["species_ids"] == ["esp-001", "esp-002"]

    async def test_an_unknown_species_is_422_and_nothing_is_stored(self, env):
        point = await _corner(env)
        r = await _upload(env, point, species=["esp-001", "nope"])
        assert r.status_code == 422 and "nope" in r.text
        assert env.storage.objects == {} and env.photos.rows == {}

    async def test_too_many_species_on_one_photo_is_422(self, env):
        point = await _corner(env)
        env.points.catalogue |= {f"s{i}" for i in range(60)}
        assert (await _upload(env, point, species=[f"s{i}" for i in range(51)])).status_code == 422

    async def test_positions_fill_the_lowest_free_slot(self, env):
        point = await _corner(env)
        ids = [(await _upload(env, point)).json()["id"] for _ in range(3)]
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}/photos/{ids[1]}")).status_code == 204
        assert (await _upload(env, point)).json()["position"] == 1

    async def test_the_sixth_photo_is_409_and_nothing_extra_is_stored(self, env):
        point = await _corner(env)
        for _ in range(5):
            assert (await _upload(env, point)).status_code == 201
        before = dict(env.storage.objects)
        r = await _upload(env, point)
        assert r.status_code == 409 and "5" in r.json()["detail"]
        assert env.storage.objects == before

    async def test_a_full_corner_is_checked_before_the_file_is_decoded(self, env):
        point = await _corner(env)
        for _ in range(5):
            await _upload(env, point)
        assert (await _upload(env, point, data=b"not an image")).status_code == 409

    async def test_it_accepts_any_file_name_and_content_type(self, env):
        point = await _corner(env)
        assert (await _upload(env, point, filename="IMG_0001.HEIC")).status_code == 201

    async def test_a_file_that_is_not_an_image_is_415(self, env):
        point = await _corner(env)
        r = await _upload(env, point, data=b"%PDF-1.4 definitely not a photo")
        assert r.status_code == 415
        assert env.storage.objects == {} and env.usage.counts == {}

    async def test_no_file_is_422(self, env):
        point = await _corner(env)
        async with _client(env.app) as c:
            assert (await c.post(f"{BASE}/{point}/photos")).status_code == 422

    async def test_over_the_byte_limit_is_413(self, env):
        point = await _corner(env)
        env.mp.setattr(cp.settings, "corner_photo_max_bytes", 1000)
        r = await _upload(env, point, data=_jpeg((2000, 2000)))
        assert r.status_code == 413 and env.storage.objects == {}

    async def test_over_the_pixel_limit_is_413(self, env):
        point = await _corner(env)
        env.mp.setattr(cp.settings, "corner_photo_max_pixels", 1_000_000)
        r = await _upload(env, point, data=_jpeg((2000, 1000)))
        assert r.status_code == 413 and env.storage.objects == {}

    async def test_zero_turns_the_byte_limit_off(self, env):
        point = await _corner(env)
        env.mp.setattr(cp.settings, "corner_photo_max_bytes", 0)
        assert (await _upload(env, point)).status_code == 201

    async def test_a_storage_outage_is_502_and_costs_no_slot(self, env):
        point = await _corner(env)
        env.storage.fail = True
        r = await _upload(env, point)
        assert r.status_code == 502
        assert env.photos.rows == {} and env.usage.counts == {}

    async def test_if_the_row_cannot_be_written_the_objects_are_removed(self, env):
        point = await _corner(env)
        env.photos.fail_add = True
        with pytest.raises(RuntimeError):
            await _upload(env, point)
        assert env.storage.objects == {} and env.usage.counts == {}


# ── Daily limit ───────────────────────────────────────────────────────────────

class TestDailyUploadLimit:
    async def test_over_the_limit_is_429_with_retry_after_until_midnight_utc(self, env):
        point = await _corner(env)
        env.mp.setattr(cp.settings, "corner_photo_uploads_per_user_per_day", 2)
        assert [(await _upload(env, point)).status_code for _ in range(2)] == [201, 201]
        r = await _upload(env, point)
        assert r.status_code == 429
        assert 1 <= int(r.headers["retry-after"]) <= 86400
        assert len(env.storage.objects) == 4

    async def test_deleting_a_photo_does_not_give_the_slot_back(self, env):
        point = await _corner(env)
        env.mp.setattr(cp.settings, "corner_photo_uploads_per_user_per_day", 2)
        first = (await _upload(env, point)).json()["id"]
        await _upload(env, point)
        async with _client(env.app) as c:
            await c.delete(f"{BASE}/{point}/photos/{first}")
        assert (await _upload(env, point)).status_code == 429

    async def test_the_limit_is_per_user(self, env):
        env.mp.setattr(cp.settings, "corner_photo_uploads_per_user_per_day", 1)
        mine, theirs = await _corner(env), await _corner(env, user_id=2, lat=41.8)
        assert (await _upload(env, mine)).status_code == 201
        assert (await _upload(env, mine)).status_code == 429
        assert (await _upload(env, theirs, user_id=2)).status_code == 201

    async def test_zero_means_no_limit(self, env):
        env.mp.setattr(cp.settings, "corner_photo_uploads_per_user_per_day", 0)
        env.mp.setattr(cp.settings, "corner_photos_max_per_corner", 40)
        point = await _corner(env)
        codes = {(await _upload(env, point, data=_jpeg((200, 200)))).status_code
                 for _ in range(35)}
        assert codes == {201}

    async def test_a_rejected_file_costs_no_slot(self, env):
        point = await _corner(env)
        await _upload(env, point, data=b"junk")
        assert env.usage.counts == {}
        await _upload(env, point)
        assert env.usage.counts == {(1, EVENT_PHOTO_UPLOAD): 1}

    def test_seconds_until_midnight(self):
        from datetime import UTC, datetime

        assert seconds_until_midnight_utc(datetime(2026, 10, 24, 23, 0, tzinfo=UTC)) == 3600
        assert seconds_until_midnight_utc(datetime(2026, 10, 24, 0, 0, tzinfo=UTC)) == 86400


# ── Read ──────────────────────────────────────────────────────────────────────

class TestRead:
    async def test_it_lists_the_photos_in_order_with_signed_urls(self, env):
        point = await _corner(env)
        await _upload(env, point, species=["esp-001"])
        await _upload(env, point)
        async with _client(env.app) as c:
            body = (await c.get(f"{BASE}/{point}/photos")).json()
        assert [p["position"] for p in body] == [0, 1]
        assert body[0]["species_ids"] == ["esp-001"]
        assert all(p["thumb_url"] and p["large_url"] for p in body)

    async def test_a_corner_without_photos_is_an_empty_list_even_without_storage(self, env):
        point = await _corner(env)
        env.app.dependency_overrides[sp.get_photo_storage] = lambda: None
        async with _client(env.app) as c:
            r = await c.get(f"{BASE}/{point}/photos")
        assert r.status_code == 200 and r.json() == []

    async def test_a_photo_whose_object_cannot_be_signed_has_null_urls(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point)).json()["id"]
        row = env.photos.rows[photo]
        del env.storage.objects[row.thumb_key]
        async with _client(env.app) as c:
            body = (await c.get(f"{BASE}/{point}/photos")).json()
        assert body[0]["thumb_url"] is None and body[0]["large_url"]

    async def test_a_storage_outage_while_signing_is_502(self, env):
        point = await _corner(env)
        await _upload(env, point)
        env.storage.fail = True
        async with _client(env.app) as c:
            assert (await c.get(f"{BASE}/{point}/photos")).status_code == 502


# ── Tag species on a photo ────────────────────────────────────────────────────

class TestPhotoSpecies:
    async def test_it_replaces_the_species_of_the_photo(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point, species=["esp-001"])).json()["id"]
        async with _client(env.app) as c:
            r = await c.patch(f"{BASE}/{point}/photos/{photo}",
                              json={"species_ids": ["esp-002", "esp-003"]})
            assert r.status_code == 200 and r.json()["species_ids"] == ["esp-002", "esp-003"]
            r = await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": []})
            assert r.json()["species_ids"] == []

    async def test_unknown_species_are_422(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point, species=["esp-001"])).json()["id"]
        async with _client(env.app) as c:
            r = await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": ["nope"]})
        assert r.status_code == 422
        assert env.photos.rows[photo].species_ids == ("esp-001",)

    @pytest.mark.parametrize("body", [{}, {"species_ids": None}, {"species_ids": "x"},
                                      {"species_ids": [], "position": 3}])
    async def test_bad_bodies_are_422(self, env, body):
        point = await _corner(env)
        photo = (await _upload(env, point)).json()["id"]
        async with _client(env.app) as c:
            assert (await c.patch(f"{BASE}/{point}/photos/{photo}", json=body)).status_code == 422

    async def test_photo_species_show_up_in_the_corners_all_species(self, env):
        # all_species_ids unions the corner's own tags with the photos' (store level)
        point = await _corner(env)
        await env.points.update(1, point, {"species_ids": ["esp-001"]})
        row = await env.points.get(1, point)
        import dataclasses

        env.points.rows[point] = dataclasses.replace(row, photo_species_ids=("esp-002",))
        async with _client(env.app) as c:
            body = (await c.get(f"{BASE}/{point}")).json()
        assert body["all_species_ids"] == ["esp-001", "esp-002"]


# ── Nothing of a user's corners is cached ─────────────────────────────────────

class TestNoCaching:
    """The global middleware gives every GET a public hour of cache; a corner and its photos
    change as they are used (a tag added from a photo must show at once), and are the user's."""

    async def test_corners_and_photos_are_never_cached(self, env):
        point = await _corner(env)
        await _upload(env, point)
        async with _client(env.app) as c:
            for path in (BASE, f"{BASE}/{point}", f"{BASE}/{point}/photos"):
                r = await c.get(path)
                assert r.status_code == 200, path
                assert r.headers["cache-control"] == "private, no-store", path


# ── The corner's species follow its photos' ───────────────────────────────────

class TestCornerSpeciesFollowPhotos:
    """The corner's species mirror its photos': tagging a mushroom on a photo tags it on the
    corner too, and taking it off a photo takes it off the corner unless another photo still has
    it; taking it off the corner takes it off every photo (the photos stay). Agreed 2026-10-27."""

    async def _corner_species(self, env, point):
        return list((await env.points.get(1, point)).species_ids)

    async def test_uploading_a_tagged_photo_adds_the_species_to_the_corner(self, env):
        point = await _corner(env)
        await env.points.update(1, point, {"species_ids": ["esp-001"]})
        await _upload(env, point, species=["esp-002", "esp-001"])
        assert await self._corner_species(env, point) == ["esp-001", "esp-002"]

    async def test_tagging_a_photo_adds_the_species_to_the_corner(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point)).json()["id"]
        async with _client(env.app) as c:
            r = await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": ["esp-003"]})
        assert r.status_code == 200
        assert await self._corner_species(env, point) == ["esp-003"]

    async def test_a_species_the_corner_already_has_is_not_repeated(self, env):
        point = await _corner(env)
        await env.points.update(1, point, {"species_ids": ["esp-001", "esp-002"]})
        photo = (await _upload(env, point)).json()["id"]
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": ["esp-002"]})
        assert await self._corner_species(env, point) == ["esp-001", "esp-002"]

    async def test_untagging_a_photo_removes_the_species_from_the_corner(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point, species=["esp-001", "esp-002"])).json()["id"]
        async with _client(env.app) as c:
            r = await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": ["esp-002"]})
        assert r.status_code == 200
        assert await self._corner_species(env, point) == ["esp-002"]
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": []})
        assert await self._corner_species(env, point) == []

    async def test_a_species_another_photo_still_has_stays_on_the_corner(self, env):
        point = await _corner(env)
        a = (await _upload(env, point, species=["esp-001"])).json()["id"]
        await _upload(env, point, species=["esp-001", "esp-003"])
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{point}/photos/{a}", json={"species_ids": []})
        assert await self._corner_species(env, point) == ["esp-001", "esp-003"]

    async def test_untagging_leaves_the_other_corner_tags_and_other_corners_alone(self, env):
        a, b = await _corner(env), await _corner(env, lat=41.8)
        await env.points.update(1, a, {"species_ids": ["esp-003"]})  # tagged by hand, on no photo
        photo = (await _upload(env, a, species=["esp-001"])).json()["id"]
        await _upload(env, b, species=["esp-001"])
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{a}/photos/{photo}", json={"species_ids": []})
        assert await self._corner_species(env, a) == ["esp-003"]
        assert await self._corner_species(env, b) == ["esp-001"]

    async def test_replacing_the_tags_of_a_photo_adds_and_removes_in_one_go(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point, species=["esp-001"])).json()["id"]
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": ["esp-002"]})
        assert await self._corner_species(env, point) == ["esp-002"]

    async def test_a_rejected_tag_changes_nothing_on_the_corner(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point)).json()["id"]
        async with _client(env.app) as c:
            r = await c.patch(f"{BASE}/{point}/photos/{photo}", json={"species_ids": ["nope"]})
        assert r.status_code == 422
        assert await self._corner_species(env, point) == []
        assert (await _upload(env, point, data=b"not an image", species=["esp-002"])
                ).status_code == 415
        assert await self._corner_species(env, point) == []

    async def test_removing_a_species_from_the_corner_removes_it_from_its_photos(self, env):
        point = await _corner(env)
        a = (await _upload(env, point, species=["esp-001", "esp-002"])).json()["id"]
        b = (await _upload(env, point, species=["esp-002"])).json()["id"]
        async with _client(env.app) as c:
            r = await c.patch(f"{BASE}/{point}", json={"species_ids": ["esp-001"]})
        assert r.status_code == 200 and r.json()["species_ids"] == ["esp-001"]
        assert env.photos.rows[a].species_ids == ("esp-001",)
        assert env.photos.rows[b].species_ids == ()
        assert set(env.photos.rows) == {a, b}  # the photos themselves stay
        assert len(env.storage.objects) == 4

    async def test_clearing_the_corner_species_clears_every_photo(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point, species=["esp-001", "esp-003"])).json()["id"]
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{point}", json={"species_ids": []})
        assert env.photos.rows[photo].species_ids == ()

    async def test_other_corners_photos_and_other_edits_are_untouched(self, env):
        a, b = await _corner(env), await _corner(env, lat=41.8)
        mine = (await _upload(env, a, species=["esp-001"])).json()["id"]
        theirs = (await _upload(env, b, species=["esp-001"])).json()["id"]
        async with _client(env.app) as c:
            await c.patch(f"{BASE}/{a}", json={"name": "Otro nombre"})  # no species in the body
            assert env.photos.rows[mine].species_ids == ("esp-001",)
            await c.patch(f"{BASE}/{a}", json={"species_ids": []})
        assert env.photos.rows[mine].species_ids == ()
        assert env.photos.rows[theirs].species_ids == ("esp-001",)


# ── Delete ────────────────────────────────────────────────────────────────────

class TestDeletePhoto:
    async def test_it_removes_the_row_and_both_objects(self, env):
        point = await _corner(env)
        keep = (await _upload(env, point)).json()["id"]
        gone = (await _upload(env, point)).json()["id"]
        gone_keys = {env.photos.rows[gone].thumb_key, env.photos.rows[gone].large_key}
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}/photos/{gone}")).status_code == 204
        assert gone not in env.photos.rows and keep in env.photos.rows
        assert not (gone_keys & set(env.storage.objects)) and len(env.storage.objects) == 2

    async def test_if_the_storage_fails_the_row_stays_so_it_can_be_retried(self, env):
        point = await _corner(env)
        photo = (await _upload(env, point)).json()["id"]
        env.storage.fail = True
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}/photos/{photo}")).status_code == 502
        assert photo in env.photos.rows
        env.storage.fail = False
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}/photos/{photo}")).status_code == 204
        assert env.storage.objects == {}


class TestDeleteCorner:
    async def test_deleting_a_corner_removes_every_object_of_its_photos(self, env):
        point, other = await _corner(env), await _corner(env, lat=41.8)
        for _ in range(3):
            await _upload(env, point)
        await _upload(env, other)
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}")).status_code == 204
        assert point not in env.points.rows
        assert len(env.storage.objects) == 2  # only the other corner's photo is left

    async def test_if_the_storage_fails_the_corner_is_kept(self, env):
        point = await _corner(env)
        await _upload(env, point)
        env.storage.fail = True
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}")).status_code == 502
        assert point in env.points.rows

    async def test_a_corner_without_photos_is_deleted_even_without_storage(self, env):
        point = await _corner(env)
        env.app.dependency_overrides[sp.get_photo_storage] = lambda: None
        async with _client(env.app) as c:
            assert (await c.delete(f"{BASE}/{point}")).status_code == 204


class TestDeleteAccount:
    async def test_purge_removes_every_object_of_the_user_and_only_theirs(self, env):
        from app.services.corner_photos import purge_user_photos

        mine, theirs = await _corner(env), await _corner(env, user_id=2, lat=41.8)
        await _upload(env, mine)
        await _upload(env, mine)
        await _upload(env, theirs, user_id=2)
        await purge_user_photos(env.photos, env.storage, 1)
        assert len(env.storage.objects) == 2
        assert all(k.startswith("corners/2/") for k in env.storage.objects)

    async def test_purge_failing_raises_so_the_account_is_not_deleted_half_way(self, env):
        from app.services.corner_photos import purge_user_photos
        from app.services.photo_storage import StorageError

        await _upload(env, await _corner(env))
        env.storage.fail = True
        with pytest.raises(StorageError):
            await purge_user_photos(env.photos, env.storage, 1)

    async def test_purge_without_photos_needs_no_storage(self, env):
        from app.services.corner_photos import purge_user_photos

        await purge_user_photos(env.photos, None, 1)


# ── New corners per day ───────────────────────────────────────────────────────

class TestDailyCornerLimit:
    async def _save(self, env, i, user_id=1):
        _login(env, user_id)
        env.app.dependency_overrides[sp.get_saved_point_store] = lambda: env.points
        async with _client(env.app) as c:
            return await c.post(BASE, json={"lat": 41.1 + i / 100, "lon": 2.4, "name": f"c{i}"})

    @pytest.fixture(autouse=True)
    def _services(self, env):
        async def toponym(lat, lon):
            return None

        async def elevation(lat, lon):
            return 500.0

        env.mp.setattr(sp, "fetch_toponym", toponym)
        env.mp.setattr(sp, "point_elevation", elevation)
        env.app.dependency_overrides[sp.get_db] = lambda: None
        env.points.catalogue = set()

    async def test_over_the_limit_is_429_with_retry_after(self, env):
        env.mp.setattr(sp.settings, "observatory_max_new_corners_per_user_per_day", 3)
        assert [(await self._save(env, i)).status_code for i in range(3)] == [201] * 3
        r = await self._save(env, 9)
        assert r.status_code == 429 and 1 <= int(r.headers["retry-after"]) <= 86400
        assert len(env.points.rows) == 3

    async def test_deleting_a_corner_does_not_give_the_slot_back(self, env):
        env.mp.setattr(sp.settings, "observatory_max_new_corners_per_user_per_day", 2)
        first = (await self._save(env, 0)).json()["id"]
        await self._save(env, 1)
        async with _client(env.app) as c:
            await c.delete(f"{BASE}/{first}")
        assert (await self._save(env, 2)).status_code == 429

    async def test_it_is_per_user_and_zero_means_no_limit(self, env):
        env.mp.setattr(sp.settings, "observatory_max_new_corners_per_user_per_day", 1)
        assert (await self._save(env, 0)).status_code == 201
        assert (await self._save(env, 1)).status_code == 429
        assert (await self._save(env, 1, user_id=2)).status_code == 201
        env.mp.setattr(sp.settings, "observatory_max_new_corners_per_user_per_day", 0)
        assert (await self._save(env, 2)).status_code == 201

    async def test_a_duplicate_or_invalid_save_costs_no_slot(self, env):
        env.mp.setattr(sp.settings, "observatory_max_new_corners_per_user_per_day", 5)
        await self._save(env, 0)
        assert (await self._save(env, 0)).status_code == 409
        _login(env, 1)
        async with _client(env.app) as c:
            assert (await c.post(BASE, json={"lat": 10, "lon": 2})).status_code == 422
        assert env.usage.counts == {(1, EVENT_CORNER_CREATE): 1}

    async def test_the_default_is_fifty(self):
        from app.config import Settings

        field = Settings.model_fields["observatory_max_new_corners_per_user_per_day"]
        assert field.default == 50
        defaults = Settings.model_fields
        assert defaults["corner_photo_uploads_per_user_per_day"].default == 30
        assert defaults["corner_photos_max_per_corner"].default == 5
        assert defaults["corner_photo_max_bytes"].default == 15 * 1024 * 1024
