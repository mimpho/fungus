"""SQL implementations of PhotoStore and UsageLog (app.services.corner_photos)."""
from collections import defaultdict
from collections.abc import Iterable
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.corner_usage import CornerUsageEvent
from app.models.saved_point import SavedPoint, SavedPointPhoto, SavedPointPhotoSpecies
from app.services.corner_photos import PhotoLimitReached, PhotoRecord

USAGE_RETENTION_DAYS = 7


def _utc_day_start() -> datetime:
    return datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)


class SqlUsageLog:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def count_today(self, user_id: int, kind: str) -> int:
        return await self.db.scalar(
            select(func.count()).select_from(CornerUsageEvent).where(
                CornerUsageEvent.user_id == user_id,
                CornerUsageEvent.kind == kind,
                CornerUsageEvent.created_at >= _utc_day_start(),
            )
        )

    async def record(self, user_id: int, kind: str) -> None:
        self.db.add(CornerUsageEvent(user_id=user_id, kind=kind))
        cutoff = _utc_day_start() - timedelta(days=USAGE_RETENTION_DAYS)
        # Keep the table small: only today's rows are ever read
        await self.db.execute(delete(CornerUsageEvent).where(CornerUsageEvent.created_at < cutoff))
        await self.db.commit()


class SqlPhotoStore:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _species(self, photo_ids: list[int]) -> dict[int, list[str]]:
        tags: dict[int, list[str]] = defaultdict(list)
        if photo_ids:
            rows = await self.db.execute(
                select(SavedPointPhotoSpecies.photo_id, SavedPointPhotoSpecies.species_id)
                .where(SavedPointPhotoSpecies.photo_id.in_(photo_ids))
                .order_by(SavedPointPhotoSpecies.species_id)
            )
            for photo_id, species_id in rows:
                tags[photo_id].append(species_id)
        return tags

    async def _records(self, rows: list[SavedPointPhoto]) -> list[PhotoRecord]:
        tags = await self._species([r.id for r in rows])
        return [
            PhotoRecord(
                id=r.id, saved_point_id=r.saved_point_id, position=r.position,
                thumb_key=r.thumb_key, large_key=r.large_key,
                species_ids=tuple(tags[r.id]), created_at=r.created_at,
            )
            for r in rows
        ]

    async def list_photos(self, point_id: int) -> list[PhotoRecord]:
        rows = await self.db.scalars(
            select(SavedPointPhoto)
            .where(SavedPointPhoto.saved_point_id == point_id)
            .order_by(SavedPointPhoto.position)
        )
        return await self._records(list(rows))

    async def get_photo(self, point_id: int, photo_id: int) -> PhotoRecord | None:
        row = await self.db.scalar(
            select(SavedPointPhoto).where(
                SavedPointPhoto.id == photo_id, SavedPointPhoto.saved_point_id == point_id
            )
        )
        return (await self._records([row]))[0] if row else None

    async def _write_species(self, photo_id: int, species_ids: Iterable[str]) -> None:
        await self.db.execute(
            delete(SavedPointPhotoSpecies).where(SavedPointPhotoSpecies.photo_id == photo_id)
        )
        ids = list(dict.fromkeys(species_ids))
        if ids:
            await self.db.execute(
                insert(SavedPointPhotoSpecies),
                [{"photo_id": photo_id, "species_id": sid} for sid in ids],
            )

    async def add_photo(
        self, point_id: int, thumb_key: str, large_key: str, species_ids: Iterable[str],
        *, max_photos: int,
    ) -> PhotoRecord:
        used = set(
            await self.db.scalars(
                select(SavedPointPhoto.position).where(SavedPointPhoto.saved_point_id == point_id)
            )
        )
        free = [p for p in range(max_photos) if p not in used]
        if not free:
            raise PhotoLimitReached(max_photos)
        row = SavedPointPhoto(
            saved_point_id=point_id, position=free[0], thumb_key=thumb_key, large_key=large_key
        )
        self.db.add(row)
        try:
            await self.db.flush()
            await self._write_species(row.id, species_ids)
            await self.db.commit()
        except IntegrityError as exc:  # two uploads took the same slot at once
            await self.db.rollback()
            raise PhotoLimitReached(max_photos) from exc
        await self.db.refresh(row)
        return (await self._records([row]))[0]

    async def delete_photo(self, point_id: int, photo_id: int) -> bool:
        row = await self.db.scalar(
            select(SavedPointPhoto).where(
                SavedPointPhoto.id == photo_id, SavedPointPhoto.saved_point_id == point_id
            )
        )
        if row is None:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True

    async def set_photo_species(
        self, point_id: int, photo_id: int, species_ids: Iterable[str]
    ) -> PhotoRecord | None:
        row = await self.db.scalar(
            select(SavedPointPhoto).where(
                SavedPointPhoto.id == photo_id, SavedPointPhoto.saved_point_id == point_id
            )
        )
        if row is None:
            return None
        await self._write_species(photo_id, species_ids)
        await self.db.commit()
        return (await self._records([row]))[0]

    async def remove_species(self, point_id: int, species_ids: Iterable[str]) -> None:
        ids = list(dict.fromkeys(species_ids))
        if not ids:
            return
        photo_ids = select(SavedPointPhoto.id).where(SavedPointPhoto.saved_point_id == point_id)
        await self.db.execute(
            delete(SavedPointPhotoSpecies).where(
                SavedPointPhotoSpecies.photo_id.in_(photo_ids),
                SavedPointPhotoSpecies.species_id.in_(ids),
            )
        )
        await self.db.commit()

    async def keys_for_point(self, point_id: int) -> list[str]:
        rows = await self.db.execute(
            select(SavedPointPhoto.thumb_key, SavedPointPhoto.large_key).where(
                SavedPointPhoto.saved_point_id == point_id
            )
        )
        return [key for pair in rows for key in pair]

    async def keys_for_user(self, user_id: int) -> list[str]:
        rows = await self.db.execute(
            select(SavedPointPhoto.thumb_key, SavedPointPhoto.large_key)
            .join(SavedPoint, SavedPoint.id == SavedPointPhoto.saved_point_id)
            .where(SavedPoint.user_id == user_id)
        )
        return [key for pair in rows for key in pair]
