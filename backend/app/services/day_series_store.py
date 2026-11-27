"""SQL side of app.services.day_series: the table of daily figures."""
from collections.abc import Mapping
from dataclasses import asdict
from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.climate_cell import ClimateCellHistory
from app.models.meteo_day_series import MeteoDaySeries
from app.models.species import Species
from app.services.day_series import EXCELLENT_SERIES, DayFigure
from app.services.point_ensemble import counts_in_ensemble
from app.services.point_species import EXCELLENT, SpeciesRecord

_VALUES = ("mean", "p90", "cells", "inputs", "computed_at")


def save_day_statement(
    day: date, figures: Mapping[str, DayFigure], inputs: str, computed_at: datetime
):
    stmt = pg_insert(MeteoDaySeries).values([
        {"day": day, "series": series, "inputs": inputs, "computed_at": computed_at,
         **asdict(figure)}
        for series, figure in figures.items()
    ])
    return stmt.on_conflict_do_update(
        index_elements=["day", "series"],
        set_={col: stmt.excluded[col] for col in _VALUES},
    )


async def excellent_species(db: AsyncSession) -> list[SpeciesRecord]:
    """The excellent edibles that make the mean (those the forest can judge), by id: the same
    ones for the map and for the stored series."""
    rows = (await db.scalars(
        select(Species).where(Species.edibility.in_(sorted(EXCELLENT))).order_by(Species.id)
    )).all()
    records = (SpeciesRecord.from_row(r) for r in rows)
    return [sp for sp in records if counts_in_ensemble(sp.forest_types, sp.forest_affinity)]


class SqlDaySeriesStore:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def stored_state(self) -> dict[date, tuple[str, datetime]]:
        """{day: (inputs, computed_at)}. The series of a day are written together, so the one of
        the excellent edibles speaks for all of them."""
        rows = await self.db.execute(
            select(MeteoDaySeries.day, MeteoDaySeries.inputs, MeteoDaySeries.computed_at)
            .where(MeteoDaySeries.series == EXCELLENT_SERIES)
        )
        return {r.day: (r.inputs, r.computed_at) for r in rows}

    async def data_changed_at(self) -> datetime | None:
        """Last time any climate row was downloaded."""
        return await self.db.scalar(select(func.max(ClimateCellHistory.fetched_at)))

    async def save_day(
        self, day: date, figures: Mapping[str, DayFigure], inputs: str, computed_at: datetime
    ) -> None:
        await self.db.execute(save_day_statement(day, figures, inputs, computed_at))
        await self.db.commit()

    async def series_rows(self, series: str, first: date, last: date) -> list[MeteoDaySeries]:
        rows = await self.db.scalars(
            select(MeteoDaySeries)
            .where(
                MeteoDaySeries.series == series,
                MeteoDaySeries.day >= first,
                MeteoDaySeries.day <= last,
            )
            .order_by(MeteoDaySeries.day)
        )
        return list(rows)
