"""Corner photos: records, store protocols and the upload flow.

A corner has up to `corner_photos_max_per_corner` photos. Each one is two WebP objects in private
storage (thumbnail and large) plus a row with their keys and the species tagged on it. Daily
limits (photo uploads, new corners) are counted from a usage log, not from `created_at`, so
deleting a photo or a corner does not give the slot back.
"""
import asyncio
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Protocol

from app.services.photo_images import CONTENT_TYPE, process_photo
from app.services.photo_storage import PhotoStorage, StorageError, photo_keys

EVENT_PHOTO_UPLOAD = "photo_upload"
EVENT_CORNER_CREATE = "corner_create"
EVENT_KINDS = (EVENT_PHOTO_UPLOAD, EVENT_CORNER_CREATE)
PHOTO_SPECIES_MAX = 50  # species tagged on one photo, an abuse guard like the corner's own


class PhotoLimitReached(Exception):
    def __init__(self, limit: int) -> None:
        super().__init__(f"Limit of {limit} photos per corner reached")
        self.limit = limit


class DailyLimitExceeded(Exception):
    def __init__(self, kind: str, limit: int, retry_after: int) -> None:
        super().__init__(f"Daily limit of {limit} reached for {kind}")
        self.kind, self.limit, self.retry_after = kind, limit, retry_after


@dataclass(frozen=True)
class PhotoRecord:
    id: int
    saved_point_id: int
    position: int
    thumb_key: str
    large_key: str
    species_ids: tuple[str, ...] = ()
    created_at: datetime | None = None


class PhotoStore(Protocol):
    async def list_photos(self, point_id: int) -> list[PhotoRecord]: ...
    async def get_photo(self, point_id: int, photo_id: int) -> PhotoRecord | None: ...
    async def add_photo(
        self, point_id: int, thumb_key: str, large_key: str, species_ids: Iterable[str],
        *, max_photos: int,
    ) -> PhotoRecord:
        """Takes the lowest free position. Raises PhotoLimitReached when the corner is full
        (also when two uploads race for the last slot)."""
        ...
    async def delete_photo(self, point_id: int, photo_id: int) -> bool: ...
    async def set_photo_species(
        self, point_id: int, photo_id: int, species_ids: Iterable[str]
    ) -> PhotoRecord | None: ...
    async def remove_species(self, point_id: int, species_ids: Iterable[str]) -> None:
        """Take these species off every photo of the corner (the photos stay)."""
        ...
    async def keys_for_point(self, point_id: int) -> list[str]: ...
    async def keys_for_user(self, user_id: int) -> list[str]: ...


class UsageLog(Protocol):
    async def count_today(self, user_id: int, kind: str) -> int: ...
    async def record(self, user_id: int, kind: str) -> None: ...


def seconds_until_midnight_utc(now: datetime | None = None) -> int:
    now = now or datetime.now(UTC)
    midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return max(1, int((midnight - now).total_seconds()))


async def check_daily_limit(usage: UsageLog, user_id: int, kind: str, limit: int) -> None:
    """Raise DailyLimitExceeded when the user already used `limit` today (UTC). 0 = off."""
    if limit > 0 and await usage.count_today(user_id, kind) >= limit:
        raise DailyLimitExceeded(kind, limit, seconds_until_midnight_utc())


async def store_photo(
    photos: PhotoStore,
    storage: PhotoStorage,
    usage: UsageLog,
    *,
    user_id: int,
    point_id: int,
    data: bytes,
    species_ids: Iterable[str],
    max_photos: int,
    max_pixels: int,
) -> PhotoRecord:
    """Process, upload and register one photo.

    Order: cheap checks first (full corner), then the decoding in a worker thread, then the
    objects, then the row. If the row fails the objects are removed again; the usage is recorded
    last, so only a photo that was really stored costs a slot of the day. Raises PhotoLimitReached,
    InvalidImage, ImageTooLarge or StorageError."""
    if len(await photos.list_photos(point_id)) >= max_photos:
        raise PhotoLimitReached(max_photos)
    processed = await asyncio.to_thread(process_photo, data, max_pixels=max_pixels)
    keys = photo_keys(user_id, point_id)
    try:
        await storage.put(keys.thumb, processed.thumb, CONTENT_TYPE)
        await storage.put(keys.large, processed.large, CONTENT_TYPE)
        record = await photos.add_photo(
            point_id, keys.thumb, keys.large, species_ids, max_photos=max_photos
        )
    except BaseException:
        try:
            await storage.delete([keys.thumb, keys.large])
        except StorageError:
            pass  # an orphan object is invisible; the original error is the one that matters
        raise
    await usage.record(user_id, EVENT_PHOTO_UPLOAD)
    return record


async def purge_point_photos(
    photos: PhotoStore, storage: PhotoStorage | None, point_id: int
) -> None:
    """Remove the objects of a corner's photos (call before deleting the corner: the database
    cascade does not touch storage). Raises StorageError, so nothing is deleted half way."""
    await _purge(storage, await photos.keys_for_point(point_id))


async def purge_user_photos(
    photos: PhotoStore, storage: PhotoStorage | None, user_id: int
) -> None:
    """Same for every corner of a user, before deleting the account."""
    await _purge(storage, await photos.keys_for_user(user_id))


async def _purge(storage: PhotoStorage | None, keys: list[str]) -> None:
    if not keys:
        return
    if storage is None:
        raise StorageError("photo storage is not configured")
    await storage.delete(keys)
