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


def forecast_signature_statement():
    """Latest download of forecast rows: the forecast changes the layers (future days) even when
    no cell is reloaded."""
    return select(func.max(ClimateCellHistory.fetched_at)).where(
        ClimateCellHistory.source == "forecast"
    )


def _info(cell: Cell) -> CellInfo:
    return CellInfo(
        cell.id, cell.lat, cell.lon, cell.elevation_m, cell.loaded_from, cell.loaded_to,
        cell.created_by, cell.refreshed_at,
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

    async def known_lookup_keys(self, keys: list[tuple[int, int]]) -> set[tuple[int, int]]:
        """Which of these 500 m buckets already point to a cell (so they are not probed again)."""
        if not keys:
            return set()
        lat_keys = [k[0] for k in keys]
        rows = await self.db.execute(
            select(CellLookup.lat_key, CellLookup.lon_key).where(
                CellLookup.lat_key.between(min(lat_keys), max(lat_keys))
            )
        )
        return set(keys) & {(r[0], r[1]) for r in rows}

    async def list_cells(self) -> list[CellInfo]:
        """Every cell, loaded or not."""
        rows = await self.db.scalars(select(Cell).order_by(Cell.id))
        return [_info(c) for c in rows]

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

    async def data_signature(self) -> tuple:
        """Cheap fingerprint of what the layers read: it changes when a cell is loaded or
        refreshed or climate rows are written (the last download of the forecast included, which
        the layers show up to a week ahead), so cached layer answers can be told apart."""
        cells = (
            await self.db.execute(
                select(func.count(), func.max(Cell.refreshed_at), func.max(Cell.loaded_to))
                .where(Cell.loaded_to.is_not(None))
            )
        ).one()
        fetched = await self.db.scalar(select(func.max(ClimateCellHistory.fetched_at)))
        forecast_fetched = await self.db.scalar(forecast_signature_statement())
        return (*cells, fetched, forecast_fetched)

    async def loaded_cells_climate(self, since: date) -> list[tuple[CellInfo, list]]:
        """Every loaded cell with its days from `since` on (oldest first, the stored forecast
        included, with its `source` and `fetched_at`): one query for the cells and one for all
        the rows, for the layers that read the whole map at once."""
        cells = [c for c in await self.list_cells() if c.loaded_to is not None]
        if not cells:
            return []
        rows = await self.db.execute(
            select(
                ClimateCellHistory.cell_id, ClimateCellHistory.date,
                *(getattr(ClimateCellHistory, m) for m in _METRICS if m != "source"),
                ClimateCellHistory.source, ClimateCellHistory.fetched_at,
            )
            .where(ClimateCellHistory.date >= since)
            .order_by(ClimateCellHistory.cell_id, ClimateCellHistory.date)
        )
        by_cell: dict[str, list] = {}
        for row in rows:
            by_cell.setdefault(row.cell_id, []).append(row)
        return [(c, by_cell.get(c.id, [])) for c in cells]

    async def mark_loaded(
        self, cell_id: str, loaded_from: date, loaded_to: date, at: datetime
    ) -> None:
        await self.db.execute(
            update(Cell)
            .where(Cell.id == cell_id)
            .values(loaded_from=loaded_from, loaded_to=loaded_to, refreshed_at=at)
        )
        await self.db.commit()
