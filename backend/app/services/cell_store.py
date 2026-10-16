"""SQL implementation of the CellStore protocol used by app.services.cell_provider."""
from datetime import date, datetime

from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.climate_cell import Cell, CellLookup, ClimateCellHistory
from app.services.cell_provider import CellInfo

_METRICS = (
    "temp_max_c", "temp_min_c", "temp_avg_c", "soil_temp_c",
    "precipitation_mm", "humidity_pct", "wind_kmh", "source",
)
_BATCH = 500  # rows per INSERT (asyncpg caps bind parameters at 32,767)


def upsert_rows_statement(rows: list[dict]):
    """INSERT ... ON CONFLICT DO UPDATE that never replaces an archive day with a forecast one."""
    stmt = pg_insert(ClimateCellHistory).values(rows)
    table = ClimateCellHistory.__table__
    return stmt.on_conflict_do_update(
        index_elements=["cell_id", "date"],
        set_={col: stmt.excluded[col] for col in _METRICS} | {"fetched_at": func.now()},
        where=~((table.c.source == "archive") & (stmt.excluded.source == "forecast")),
    )


def _info(cell: Cell) -> CellInfo:
    return CellInfo(
        cell.id, cell.lat, cell.lon, cell.elevation_m, cell.loaded_from, cell.loaded_to,
        cell.created_by,
    )


class SqlCellStore:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_lookup(self, key: tuple[int, int]) -> str | None:
        return await self.db.scalar(
            select(CellLookup.cell_id).where(
                CellLookup.lat_key == key[0], CellLookup.lon_key == key[1]
            )
        )

    async def save_lookup(self, key: tuple[int, int], cell_id: str) -> None:
        await self.db.execute(
            pg_insert(CellLookup)
            .values(lat_key=key[0], lon_key=key[1], cell_id=cell_id)
            .on_conflict_do_nothing()
        )
        await self.db.commit()

    async def get_cell(self, cell_id: str) -> CellInfo | None:
        cell = await self.db.get(Cell, cell_id)
        if cell is not None:
            await self.db.refresh(cell)  # another request may have loaded it meanwhile
        return _info(cell) if cell else None

    async def create_cell(self, cell: CellInfo) -> None:
        await self.db.execute(
            pg_insert(Cell)
            .values(
                id=cell.id, lat=cell.lat, lon=cell.lon, elevation_m=cell.elevation_m,
                created_by=cell.created_by,
            )
            .on_conflict_do_nothing()
        )
        await self.db.commit()

    async def count_cells_created_since(self, since: datetime) -> int:
        return await self.db.scalar(
            select(func.count()).select_from(Cell).where(Cell.created_at >= since)
        )

    async def count_cells_created_by_since(self, user_id: int, since: datetime) -> int:
        return await self.db.scalar(
            select(func.count())
            .select_from(Cell)
            .where(Cell.created_by == user_id, Cell.created_at >= since)
        )

    async def upsert_rows(self, rows: list[dict]) -> None:
        for i in range(0, len(rows), _BATCH):
            await self.db.execute(upsert_rows_statement(rows[i : i + _BATCH]))

    async def history(self, cell_id: str) -> list[ClimateCellHistory]:
        """Every stored day of the cell, oldest first."""
        rows = await self.db.scalars(
            select(ClimateCellHistory)
            .where(ClimateCellHistory.cell_id == cell_id)
            .order_by(ClimateCellHistory.date)
        )
        return list(rows)

    async def mark_loaded(
        self, cell_id: str, loaded_from: date, loaded_to: date, at: datetime
    ) -> None:
        await self.db.execute(
            update(Cell)
            .where(Cell.id == cell_id)
            .values(loaded_from=loaded_from, loaded_to=loaded_to, refreshed_at=at)
        )
        await self.db.commit()
