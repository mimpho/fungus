"""
Open-Meteo grid cells and their daily climate.

The cell is the base unit of the free-map Observatory: Open-Meteo is the source of truth
and these tables are a rebuildable cache, loaded on demand on the first click in a cell.
Kept apart from climate_history (zones, observed days from several sources).
"""
from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

# 'archive' = reanalysis (final); 'forecast' = provisional, replaced by the archive later.
CELL_SOURCES = ("archive", "forecast")


def cell_id(grid_lat: float, grid_lon: float) -> str:
    """Stable id from the grid coordinates Open-Meteo returns for a request (4 decimals)."""
    return f"{grid_lat:.4f}_{grid_lon:.4f}"


class Cell(Base):
    __tablename__ = "cells"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)
    # Mean elevation of the cell as reported by Open-Meteo (elevation=nan request).
    elevation_m: Mapped[float] = mapped_column(Float, nullable=False)
    # Window of days stored for this cell (null until the first load finishes).
    loaded_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    loaded_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    refreshed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<Cell id={self.id!r} elevation={self.elevation_m!r}>"


class ClimateCellHistory(Base):
    __tablename__ = "climate_cell_history"
    __table_args__ = (
        CheckConstraint("source IN ('archive', 'forecast')", name="ck_climate_cell_source"),
    )

    cell_id: Mapped[str] = mapped_column(
        String, ForeignKey("cells.id", ondelete="CASCADE"), primary_key=True
    )
    date: Mapped[date] = mapped_column(Date, primary_key=True)

    temp_max_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_min_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_avg_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    soil_temp_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    precipitation_mm: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    humidity_pct: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wind_kmh: Mapped[int | None] = mapped_column(Integer, nullable=True)

    source: Mapped[str] = mapped_column(String, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return (
            f"<ClimateCellHistory cell={self.cell_id!r} date={self.date!r} "
            f"source={self.source!r}>"
        )
