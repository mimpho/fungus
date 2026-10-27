"""Corner photos, object storage (feat/observatory-corners-photos): the Supabase Storage REST
client behind the PhotoStorage protocol, tested against a mocked transport (no network), plus
the in-memory fake the other tests use."""
import json

import httpx
import pytest

from app.services.photo_storage import (
    PhotoKeys,
    StorageError,
    SupabasePhotoStorage,
    photo_keys,
)
from tests.unit.fakes import FakePhotoStorage

URL = "https://proj.supabase.co"
BUCKET = "corner-photos-dev"
KEY = "service-key-secret"


def _storage(handler):
    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return SupabasePhotoStorage(URL, KEY, BUCKET, client=client)


class TestKeys:
    def test_keys_are_scoped_by_user_and_corner_and_unguessable(self):
        a, b = photo_keys(7, 42), photo_keys(7, 42)
        assert isinstance(a, PhotoKeys)
        assert a.thumb.startswith("corners/7/42/") and a.thumb.endswith("-thumb.webp")
        assert a.large.startswith("corners/7/42/") and a.large.endswith("-large.webp")
        assert a.thumb != b.thumb and a.large != b.large
        assert a.thumb.replace("-thumb", "") == a.large.replace("-large", "")


class TestSupabase:
    async def test_put_sends_the_bytes_with_the_service_key_and_never_overwrites(self):
        seen = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen.update(
                method=request.method, url=str(request.url), body=request.content,
                auth=request.headers["authorization"], apikey=request.headers["apikey"],
                ctype=request.headers["content-type"],
                upsert=request.headers.get("x-upsert"),
            )
            return httpx.Response(200, json={"Key": f"{BUCKET}/a/b.webp"})

        await _storage(handler).put("a/b.webp", b"BYTES", "image/webp")
        assert seen["method"] == "POST"
        assert seen["url"] == f"{URL}/storage/v1/object/{BUCKET}/a/b.webp"
        assert seen["body"] == b"BYTES" and seen["ctype"] == "image/webp"
        assert seen["auth"] == f"Bearer {KEY}" and seen["apikey"] == KEY
        assert seen["upsert"] == "false"

    async def test_a_failed_put_raises_without_leaking_the_key(self):
        storage = _storage(lambda r: httpx.Response(500, json={"message": "boom"}))
        with pytest.raises(StorageError) as exc:
            await storage.put("a.webp", b"x", "image/webp")
        assert KEY not in str(exc.value)

    async def test_a_network_error_is_a_storage_error(self):
        def handler(request):
            raise httpx.ConnectError("down")

        with pytest.raises(StorageError):
            await _storage(handler).put("a.webp", b"x", "image/webp")

    async def test_delete_removes_several_keys_in_one_call(self):
        seen = {}

        def handler(request):
            seen.update(method=request.method, url=str(request.url),
                        body=json.loads(request.content))
            return httpx.Response(200, json=[])

        await _storage(handler).delete(["a.webp", "b.webp"])
        assert seen["method"] == "DELETE" and seen["url"] == f"{URL}/storage/v1/object/{BUCKET}"
        assert seen["body"] == {"prefixes": ["a.webp", "b.webp"]}

    async def test_delete_with_no_keys_makes_no_call(self):
        def handler(request):
            raise AssertionError("no call expected")

        await _storage(handler).delete([])

    async def test_a_failed_delete_raises(self):
        with pytest.raises(StorageError):
            await _storage(lambda r: httpx.Response(502)).delete(["a.webp"])

    async def test_signed_urls_come_in_one_batch_call_and_are_absolute(self):
        seen = {}

        def handler(request):
            seen.update(url=str(request.url), body=json.loads(request.content))
            return httpx.Response(200, json=[
                {"path": "a.webp", "signedURL": "/object/sign/b/a.webp?token=T1", "error": None},
                {"path": "b.webp", "signedURL": "/object/sign/b/b.webp?token=T2", "error": None},
            ])

        urls = await _storage(handler).signed_urls(["a.webp", "b.webp"], expires_in=600)
        assert seen["url"] == f"{URL}/storage/v1/object/sign/{BUCKET}"
        assert seen["body"] == {"expiresIn": 600, "paths": ["a.webp", "b.webp"]}
        assert urls == {
            "a.webp": f"{URL}/storage/v1/object/sign/b/a.webp?token=T1",
            "b.webp": f"{URL}/storage/v1/object/sign/b/b.webp?token=T2",
        }

    async def test_a_key_that_could_not_be_signed_is_left_out(self):
        def handler(request):
            return httpx.Response(200, json=[
                {"path": "a.webp", "signedURL": None, "error": "Object not found"},
            ])

        assert await _storage(handler).signed_urls(["a.webp"], expires_in=60) == {}

    async def test_signing_nothing_makes_no_call(self):
        def handler(request):
            raise AssertionError("no call expected")

        assert await _storage(handler).signed_urls([], expires_in=60) == {}


class TestFake:
    async def test_it_behaves_like_the_protocol(self):
        fake = FakePhotoStorage()
        await fake.put("a.webp", b"1", "image/webp")
        assert fake.objects == {"a.webp": b"1"}
        urls = await fake.signed_urls(["a.webp", "missing.webp"], expires_in=60)
        assert list(urls) == ["a.webp"] and urls["a.webp"].startswith("https://fake.storage/")
        await fake.delete(["a.webp", "missing.webp"])  # missing keys are not an error
        assert fake.objects == {}

    async def test_it_can_be_told_to_fail(self):
        fake = FakePhotoStorage()
        fake.fail = True
        with pytest.raises(StorageError):
            await fake.put("a.webp", b"1", "image/webp")
        with pytest.raises(StorageError):
            await fake.delete(["a.webp"])
