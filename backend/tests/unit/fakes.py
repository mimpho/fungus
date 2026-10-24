"""Test doubles shared by several unit-test modules."""
from app.services.photo_storage import StorageError


class FakePhotoStorage:
    """In-memory PhotoStorage. `fail = True` makes every call raise StorageError."""

    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}
        self.fail = False

    def _check(self) -> None:
        if self.fail:
            raise StorageError("fake storage is down")

    async def put(self, key: str, data: bytes, content_type: str) -> None:
        self._check()
        self.objects[key] = data

    async def delete(self, keys: list[str]) -> None:
        self._check()
        for key in keys:
            self.objects.pop(key, None)

    async def signed_urls(self, keys: list[str], *, expires_in: int) -> dict[str, str]:
        self._check()
        return {k: f"https://fake.storage/{k}?exp={expires_in}" for k in keys if k in self.objects}


class FakeUsageLog:
    """In-memory UsageLog: counts per (user, kind); `today` stands for the current UTC day."""

    def __init__(self) -> None:
        self.counts: dict[tuple[int, str], int] = {}

    async def count_today(self, user_id: int, kind: str) -> int:
        return self.counts.get((user_id, kind), 0)

    async def record(self, user_id: int, kind: str) -> None:
        self.counts[(user_id, kind)] = self.counts.get((user_id, kind), 0) + 1


class FakePhotoStore:
    """In-memory PhotoStore (and the data the router needs to know which corners have keys)."""

    def __init__(self) -> None:
        from app.services.corner_photos import PhotoRecord

        self._record = PhotoRecord
        self.rows: dict[int, object] = {}
        self.owner: dict[int, int] = {}  # point id -> user id, to answer keys_for_user
        self._next = 1
        self.fail_add = False

    def own(self, point_id: int, user_id: int) -> None:
        self.owner[point_id] = user_id

    async def list_photos(self, point_id):
        rows = [r for r in self.rows.values() if r.saved_point_id == point_id]
        return sorted(rows, key=lambda r: r.position)

    async def get_photo(self, point_id, photo_id):
        row = self.rows.get(photo_id)
        return row if row and row.saved_point_id == point_id else None

    async def add_photo(self, point_id, thumb_key, large_key, species_ids, *, max_photos):
        from app.services.corner_photos import PhotoLimitReached

        if self.fail_add:
            raise RuntimeError("db down")
        used = {r.position for r in await self.list_photos(point_id)}
        free = [p for p in range(max_photos) if p not in used]
        if not free:
            raise PhotoLimitReached(max_photos)
        row = self._record(
            id=self._next, saved_point_id=point_id, position=free[0], thumb_key=thumb_key,
            large_key=large_key, species_ids=tuple(dict.fromkeys(species_ids)),
        )
        self.rows[row.id] = row
        self._next += 1
        return row

    async def delete_photo(self, point_id, photo_id):
        if await self.get_photo(point_id, photo_id) is None:
            return False
        del self.rows[photo_id]
        return True

    async def set_photo_species(self, point_id, photo_id, species_ids):
        import dataclasses

        row = await self.get_photo(point_id, photo_id)
        if row is None:
            return None
        self.rows[photo_id] = dataclasses.replace(
            row, species_ids=tuple(dict.fromkeys(species_ids))
        )
        return self.rows[photo_id]

    async def keys_for_point(self, point_id):
        return [k for r in await self.list_photos(point_id) for k in (r.thumb_key, r.large_key)]

    async def keys_for_user(self, user_id):
        return [
            k for r in self.rows.values() if self.owner.get(r.saved_point_id) == user_id
            for k in (r.thumb_key, r.large_key)
        ]
