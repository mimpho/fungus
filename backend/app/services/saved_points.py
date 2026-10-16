"""
Saved points: create with server-side provenance, store protocol, author's forest types.

The client sends only coordinates, name, notes and forest types. Land cover, toponym,
elevation, cell and composition are fetched by the server at saving time (a service that
fails leaves its fields null: it never blocks the save). Only codes and names are kept, never
the services' raw answers, nor the macrotype derived from the class.
"""
from collections.abc import Awaitable, Callable, Iterable
from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from app.services.point_forest import COVER_LAYER, LandCover, Toponym

FOREST_TYPES = ("pinar", "hayedo", "robledal", "encinar")  # the catalogue's forest types
MIXED = "mixto"  # catalogue species that grow in any forest
NAME_MAX = 80
NOTES_MAX = 2000
COORD_DECIMALS = 5  # ~1 m


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
    forest_types: list[str] | None = None
    elevation_m: float | None = None
    cell_id: str | None = None
    land_cover_layer: str | None = None
    land_cover_code: int | None = None
    land_cover_name: str | None = None
    land_cover_retrieved_at: datetime | None = None
    toponym_name: str | None = None
    toponym_label: str | None = None
    composition: dict | None = None
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass(frozen=True)
class NewPoint:
    lat: float
    lon: float
    name: str | None
    notes: str | None
    forest_types: list[str] | None


@dataclass(frozen=True)
class PointContext:
    """What the server learns about a point when it is saved."""

    cover: LandCover | None
    toponym: Toponym | None
    elevation_m: float | None
    cell_id: str | None
    composition: dict | None


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


def author_forest_types(types: Iterable[str]) -> frozenset[str]:
    """Catalogue forest types that fit a point the author typed: theirs, plus the species
    that grow in any forest ("mixto"), as with a land-cover macrotype."""
    return frozenset(types) | {MIXED}


def composition_json(items: Iterable[tuple[str, float]], radius_m: int) -> dict | None:
    """MCSC-4 codes with their share (%) within `radius_m`, biggest first. Nothing else."""
    ordered = sorted(
        ((code, round(float(pct), 1)) for code, pct in items), key=lambda i: (-i[1], i[0])
    )
    if not ordered:
        return None
    return {"radius_m": radius_m, "items": [{"code": c, "pct": p} for c, p in ordered]}


def _retrieved_at(cover: LandCover | None) -> datetime | None:
    return datetime.fromisoformat(cover.fetched_at) if cover and cover.fetched_at else None


async def create_saved_point(
    store: SavedPointStore,
    user_id: int,
    point: NewPoint,
    context: Callable[[float, float], Awaitable[PointContext]],
    *,
    max_per_user: int,
) -> SavedPointRecord:
    """Save a point. Duplicates and the limit are checked before asking any service."""
    lat, lon = round(point.lat, COORD_DECIMALS), round(point.lon, COORD_DECIMALS)
    existing = await store.find_at(user_id, lat, lon)
    if existing is not None:
        raise DuplicatePoint(existing.id)
    if max_per_user > 0 and await store.count_for_user(user_id) >= max_per_user:
        raise SavedPointLimitExceeded(max_per_user)

    ctx = await context(lat, lon)
    cover, toponym = ctx.cover, ctx.toponym
    name = point.name or (toponym.name if toponym else f"{lat:.4f}, {lon:.4f}")
    return await store.add(
        SavedPointRecord(
            user_id=user_id, lat=lat, lon=lon, name=name, notes=point.notes,
            forest_types=point.forest_types, elevation_m=ctx.elevation_m, cell_id=ctx.cell_id,
            land_cover_layer=COVER_LAYER if cover else None,
            land_cover_code=cover.code if cover else None,
            land_cover_name=cover.name if cover else None,
            land_cover_retrieved_at=_retrieved_at(cover),
            toponym_name=toponym.name if toponym else None,
            toponym_label=toponym.label if toponym else None,
            composition=ctx.composition,
        )
    )


def stored_cover(record: SavedPointRecord) -> LandCover | None:
    """The land cover a point was saved with, read again (macrotype derived now), or None if
    the service had not answered when it was saved."""
    from app.services.point_forest import cover_from_class

    if record.land_cover_name is None:
        return None
    fetched = record.land_cover_retrieved_at
    return cover_from_class(
        record.land_cover_code, record.land_cover_name,
        fetched_at=fetched.isoformat() if fetched else None,
    )
