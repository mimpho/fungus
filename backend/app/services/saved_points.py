"""
Saved points ("corners"): create with a server-side default name, store protocol, species tags.

The client sends coordinates, name, notes, kind and tagged species. The server only looks up
what it needs to fill in: the nearest toponym (the default name) and the elevation. A service
that fails leaves its field null: it never blocks the save. Nothing else a service or a model
derives is stored (see app.models.saved_point).
"""
from collections.abc import Awaitable, Callable, Iterable
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from app.models.saved_point import DEFAULT_KIND, KINDS
from app.services.corner_photos import EVENT_CORNER_CREATE, UsageLog, check_daily_limit
from app.services.point_forest import Toponym

NAME_MAX = 80
NOTES_MAX = 2000
SPECIES_MAX = 50  # tagged species per corner, an abuse guard rather than a product limit
COORD_DECIMALS = 5  # ~1 m

__all__ = [
    "COORD_DECIMALS", "DEFAULT_KIND", "KINDS", "NAME_MAX", "NOTES_MAX", "SPECIES_MAX",
    "DuplicatePoint", "NewPoint", "PointContext", "SavedPointLimitExceeded", "SavedPointRecord",
    "SavedPointStore", "all_species_ids", "create_saved_point",
]


class DuplicatePoint(Exception):
    """The user already saved a point at these coordinates."""

    def __init__(self, existing_id: int) -> None:
        super().__init__("Point already saved")
        self.existing_id = existing_id


class SavedPointLimitExceeded(Exception):
    def __init__(self, limit: int) -> None:
        super().__init__(f"Limit of {limit} saved points reached")
        self.limit = limit


@dataclass(frozen=True)
class SavedPointRecord:
    user_id: int
    lat: float
    lon: float
    name: str
    notes: str | None = None
    kind: str = DEFAULT_KIND
    elevation_m: float | None = None
    # Species the user tagged on the corner itself (what a change writes) ...
    species_ids: tuple[str, ...] = ()
    # ... and the ones tagged on its photos (read only here)
    photo_species_ids: tuple[str, ...] = ()
    photo_count: int = 0  # read only here; the photos themselves are /{id}/photos
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True)
class NewPoint:
    lat: float
    lon: float
    name: str | None
    notes: str | None
    kind: str = DEFAULT_KIND
    species_ids: tuple[str, ...] = ()


@dataclass(frozen=True)
class PointContext:
    """What the server learns about a point when it is saved."""

    toponym: Toponym | None
    elevation_m: float | None


class SavedPointStore(Protocol):
    async def count_for_user(self, user_id: int) -> int: ...
    async def list_for_user(self, user_id: int) -> list[SavedPointRecord]: ...
    async def get(self, user_id: int, point_id: int) -> SavedPointRecord | None: ...
    async def find_at(self, user_id: int, lat: float, lon: float) -> SavedPointRecord | None: ...
    async def add(self, record: SavedPointRecord) -> SavedPointRecord: ...
    async def update(
        self, user_id: int, point_id: int, changes: dict
    ) -> SavedPointRecord | None: ...
    async def delete(self, user_id: int, point_id: int) -> bool: ...
    async def known_species(self, ids: Iterable[str]) -> set[str]: ...


def all_species_ids(record: SavedPointRecord) -> list[str]:
    """Every species of a corner: the ones tagged on it and on its photos, once each, in the
    order they were first tagged (the corner's own first)."""
    return list(dict.fromkeys((*record.species_ids, *record.photo_species_ids)))


def default_name(lat: float, lon: float, toponym: Toponym | None) -> str:
    """Name for a corner whose owner gives none: the nearest toponym, else the coordinates."""
    return toponym.name if toponym else f"{lat:.4f}, {lon:.4f}"


async def create_saved_point(
    store: SavedPointStore,
    user_id: int,
    point: NewPoint,
    context: Callable[[float, float], Awaitable[PointContext]],
    *,
    max_per_user: int,
    usage: UsageLog | None = None,
    max_new_per_day: int = 0,
) -> SavedPointRecord:
    """Save a point. Duplicates and the limits are checked before asking any service. The daily
    limit counts corners created today, deleted ones included (`usage`); 0 = no limit."""
    lat, lon = round(point.lat, COORD_DECIMALS), round(point.lon, COORD_DECIMALS)
    existing = await store.find_at(user_id, lat, lon)
    if existing is not None:
        raise DuplicatePoint(existing.id)
    if max_per_user > 0 and await store.count_for_user(user_id) >= max_per_user:
        raise SavedPointLimitExceeded(max_per_user)
    if usage is not None:
        await check_daily_limit(usage, user_id, EVENT_CORNER_CREATE, max_new_per_day)

    ctx = await context(lat, lon)
    name = point.name or default_name(lat, lon, ctx.toponym)
    saved = await store.add(
        SavedPointRecord(
            user_id=user_id, lat=lat, lon=lon, name=name, notes=point.notes, kind=point.kind,
            elevation_m=ctx.elevation_m, species_ids=point.species_ids,
        )
    )
    if usage is not None:
        await usage.record(user_id, EVENT_CORNER_CREATE)
    return saved
