"""SQL implementation of the SavedPointStore protocol of app.services.saved_points."""
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_point import SavedPoint
from app.services.saved_points import DuplicatePoint, SavedPointRecord

_FIELDS = (
    "user_id", "lat", "lon", "name", "notes", "forest_types", "elevation_m", "cell_id",
    "land_cover_layer", "land_cover_code", "land_cover_name", "land_cover_retrieved_at",
    "toponym_name", "toponym_label", "composition", "id", "created_at", "updated_at",
)


def _record(row: SavedPoint) -> SavedPointRecord:
    data = {f: getattr(row, f) for f in _FIELDS}
    if data["forest_types"] is not None:
        data["forest_types"] = list(data["forest_types"])
    return SavedPointRecord(**data)


class SqlSavedPointStore:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

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
        return [_record(r) for r in rows]

    async def _row(self, user_id: int, point_id: int) -> SavedPoint | None:
        return await self.db.scalar(
            select(SavedPoint).where(SavedPoint.id == point_id, SavedPoint.user_id == user_id)
        )

    async def get(self, user_id: int, point_id: int) -> SavedPointRecord | None:
        row = await self._row(user_id, point_id)
        return _record(row) if row else None

    async def find_at(self, user_id: int, lat: float, lon: float) -> SavedPointRecord | None:
        row = await self.db.scalar(
            select(SavedPoint).where(
                SavedPoint.user_id == user_id, SavedPoint.lat == lat, SavedPoint.lon == lon
            )
        )
        return _record(row) if row else None

    async def add(self, record: SavedPointRecord) -> SavedPointRecord:
        generated = ("id", "created_at", "updated_at")
        values = {f: getattr(record, f) for f in _FIELDS if f not in generated}
        row = SavedPoint(**values)
        self.db.add(row)
        try:
            await self.db.commit()
        except IntegrityError as exc:
            await self.db.rollback()
            if "uq_saved_points_user_place" in str(exc.orig):  # two saves at once
                raise DuplicatePoint(0) from exc
            raise
        await self.db.refresh(row)
        return _record(row)

    async def update(
        self, user_id: int, point_id: int, changes: dict
    ) -> SavedPointRecord | None:
        row = await self._row(user_id, point_id)
        if row is None:
            return None
        for field, value in changes.items():
            setattr(row, field, value)
        await self.db.commit()
        await self.db.refresh(row)
        return _record(row)

    async def delete(self, user_id: int, point_id: int) -> bool:
        row = await self._row(user_id, point_id)
        if row is None:
            return False
        await self.db.delete(row)
        await self.db.commit()
        return True
