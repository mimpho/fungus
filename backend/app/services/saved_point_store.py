"""SQL implementation of the SavedPointStore protocol of app.services.saved_points."""
from collections import defaultdict
from collections.abc import Iterable

from sqlalchemy import delete, func, insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_point import (
    SavedPoint,
    SavedPointPhoto,
    SavedPointPhotoSpecies,
    SavedPointSpecies,
)
from app.models.species import Species
from app.services.saved_points import DuplicatePoint, SavedPointRecord

_FIELDS = (
    "user_id", "lat", "lon", "name", "notes", "kind", "elevation_m", "id", "created_at",
    "updated_at",
)


def _record(
    row: SavedPoint, species: Iterable[str] = (), photo_species: Iterable[str] = ()
) -> SavedPointRecord:
    data = {f: getattr(row, f) for f in _FIELDS}
    return SavedPointRecord(
        **data, species_ids=tuple(species), photo_species_ids=tuple(photo_species)
    )


class SqlSavedPointStore:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _tags(
        self, point_ids: list[int]
    ) -> tuple[dict[int, list[str]], dict[int, list[str]]]:
        """Species tagged on each point, and on its photos, in the order they were tagged."""
        direct: dict[int, list[str]] = defaultdict(list)
        via_photos: dict[int, list[str]] = defaultdict(list)
        if not point_ids:
            return direct, via_photos
        rows = await self.db.execute(
            select(SavedPointSpecies.saved_point_id, SavedPointSpecies.species_id)
            .where(SavedPointSpecies.saved_point_id.in_(point_ids))
            .order_by(SavedPointSpecies.created_at, SavedPointSpecies.species_id)
        )
        for point_id, species_id in rows:
            direct[point_id].append(species_id)
        rows = await self.db.execute(
            select(SavedPointPhoto.saved_point_id, SavedPointPhotoSpecies.species_id)
            .join(SavedPointPhoto, SavedPointPhoto.id == SavedPointPhotoSpecies.photo_id)
            .where(SavedPointPhoto.saved_point_id.in_(point_ids))
            .order_by(SavedPointPhoto.position, SavedPointPhotoSpecies.species_id)
        )
        for point_id, species_id in rows:
            if species_id not in via_photos[point_id]:
                via_photos[point_id].append(species_id)
        return direct, via_photos

    async def _with_tags(self, rows: list[SavedPoint]) -> list[SavedPointRecord]:
        direct, via_photos = await self._tags([r.id for r in rows])
        return [_record(r, direct[r.id], via_photos[r.id]) for r in rows]

    async def count_for_user(self, user_id: int) -> int:
        return await self.db.scalar(
            select(func.count()).select_from(SavedPoint).where(SavedPoint.user_id == user_id)
        )

    async def list_for_user(self, user_id: int) -> list[SavedPointRecord]:
        rows = await self.db.scalars(
            select(SavedPoint)
            .where(SavedPoint.user_id == user_id)
            .order_by(SavedPoint.created_at.desc(), SavedPoint.id.desc())
        )
        return await self._with_tags(list(rows))

    async def _row(self, user_id: int, point_id: int) -> SavedPoint | None:
        return await self.db.scalar(
            select(SavedPoint).where(SavedPoint.id == point_id, SavedPoint.user_id == user_id)
        )

    async def get(self, user_id: int, point_id: int) -> SavedPointRecord | None:
        row = await self._row(user_id, point_id)
        return (await self._with_tags([row]))[0] if row else None

    async def find_at(self, user_id: int, lat: float, lon: float) -> SavedPointRecord | None:
        row = await self.db.scalar(
            select(SavedPoint).where(
                SavedPoint.user_id == user_id, SavedPoint.lat == lat, SavedPoint.lon == lon
            )
        )
        return (await self._with_tags([row]))[0] if row else None

    async def add(self, record: SavedPointRecord) -> SavedPointRecord:
        generated = ("id", "created_at", "updated_at")
        values = {f: getattr(record, f) for f in _FIELDS if f not in generated}
        row = SavedPoint(**values)
        self.db.add(row)
        try:
            await self.db.flush()  # the id, to tag the species in the same transaction
            await self._write_species(row.id, record.species_ids)
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            if "uq_saved_points_user_place" in str(exc.orig):  # two saves at once
                raise DuplicatePoint(0) from exc
            raise
        await self.db.refresh(row)
        return (await self._with_tags([row]))[0]

    async def _write_species(self, point_id: int, species_ids: Iterable[str]) -> None:
        await self.db.execute(
            delete(SavedPointSpecies).where(SavedPointSpecies.saved_point_id == point_id)
        )
        ids = list(dict.fromkeys(species_ids))
        if ids:
            await self.db.execute(
                insert(SavedPointSpecies),
                [{"saved_point_id": point_id, "species_id": sid} for sid in ids],
            )

    async def update(
        self, user_id: int, point_id: int, changes: dict
    ) -> SavedPointRecord | None:
        row = await self._row(user_id, point_id)
        if row is None:
            return None
        changes = dict(changes)
        species_ids = changes.pop("species_ids", None)
        for field, value in changes.items():
            setattr(row, field, value)
        if species_ids is not None:
            await self._write_species(row.id, species_ids)
        row.updated_at = func.now()  # also when only the tagged species changed
        await self.db.commit()
        await self.db.refresh(row)
        return (await self._with_tags([row]))[0]

    async def delete(self, user_id: int, point_id: int) -> bool:
        row = await self._row(user_id, point_id)
        if row is None:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True

    async def known_species(self, ids: Iterable[str]) -> set[str]:
        wanted = set(ids)
        if not wanted:
            return set()
        found = await self.db.scalars(select(Species.id).where(Species.id.in_(wanted)))
        return set(found)
