"""
Smoke test of the corner-photo storage against a REAL bucket (never used by the unit tests).

Run it from your machine, with SUPABASE_URL, SUPABASE_SERVICE_KEY and CORNER_PHOTOS_BUCKET in
`backend/.env` or in the environment (use the DEV bucket):

    cd backend
    python -m scripts.check_photo_storage

It uploads two tiny WebP objects, signs their URLs, downloads one through the signed URL, checks
that the unsigned URL is refused (the bucket is private), deletes both and checks they are gone.
It prints which step failed and the HTTP status, never the key. Leaves nothing behind.
"""
import asyncio
import io
import sys

import httpx
from PIL import Image

from app.config import settings
from app.services.photo_storage import StorageError, SupabasePhotoStorage, photo_keys


def _webp() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (8, 8), (30, 120, 60)).save(buf, "WEBP")
    return buf.getvalue()


async def main() -> int:
    if not settings.has_photo_storage:
        print("SUPABASE_URL / SUPABASE_SERVICE_KEY are not set")
        return 2
    print(f"bucket: {settings.corner_photos_bucket}  url: {settings.supabase_url}")
    storage = SupabasePhotoStorage(
        settings.supabase_url, settings.supabase_service_key, settings.corner_photos_bucket
    )
    keys = photo_keys(0, 0)
    both = [keys.thumb, keys.large]
    step = "put"
    try:
        for key in both:
            await storage.put(key, _webp(), "image/webp")
        print("ok  put")

        step = "put again (must refuse to overwrite)"
        try:
            await storage.put(keys.thumb, _webp(), "image/webp")
            print("!!  a second put on the same key was accepted")
        except StorageError:
            print("ok  second put on the same key refused")

        step = "sign"
        urls = await storage.signed_urls(both, expires_in=60)
        assert set(urls) == set(both), f"signed {sorted(urls)}"
        print("ok  signed urls")

        step = "download through the signed url"
        async with httpx.AsyncClient(timeout=20) as client:
            got = await client.get(urls[keys.thumb])
            assert got.status_code == 200 and got.content[:4] == b"RIFF", got.status_code
            print("ok  signed url serves the object")
            step = "unsigned url must be refused"
            base = f"{settings.supabase_url.rstrip('/')}/storage/v1/object"
            direct = await client.get(f"{base}/public/{settings.corner_photos_bucket}/{keys.thumb}")
            assert direct.status_code >= 400, "the bucket answers without a signature: it is public"
            print(f"ok  unsigned url refused ({direct.status_code})")

        step = "delete"
        await storage.delete(both)
        await storage.delete(both)  # idempotent
        print("ok  delete (twice)")
        step = "gone after delete"
        gone = await storage.signed_urls(both, expires_in=60)
        assert gone == {}, "objects still there"
        print("ok  objects are gone")
    except (StorageError, AssertionError, httpx.HTTPError) as exc:
        print(f"FAIL at '{step}': {exc}")
        try:
            await storage.delete(both)
        except StorageError:
            pass
        return 1
    print("All good")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
