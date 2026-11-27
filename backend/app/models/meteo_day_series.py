"""
The stored daily series of Condiciones for all of Catalonia (app.services.day_series): one row
per day and series. A cache: it is rebuilt from the cells' climate and the species catalogue.
"""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class MeteoDaySeries(Base):
    __tablename__ = "meteo_day_series"

    day: Mapped[date] = mapped_column(Date, primary_key=True)
    # 'excellent' (the excellent edibles together) or a species id
    series: Mapped[str] = mapped_column(String, primary_key=True)
    mean: Mapped[float | None] = mapped_column(Float, nullable=True)  # null: no cell had a figure
    p90: Mapped[float | None] = mapped_column(Float, nullable=True)
    cells: Mapped[int] = mapped_column(Integer, nullable=False)
    # hash of the model version and the species records it was computed from
    inputs: Mapped[str] = mapped_column(String, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
