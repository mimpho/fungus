"""
ZoneForecast model — Open-Meteo forecast per zone and target day.
Replaced by the daily ingest (same Open-Meteo call as the recent days); never mixed
with climate_history, which only holds observed days.
"""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ZoneForecast(Base):
    __tablename__ = "zone_forecast"

    zone_id: Mapped[str] = mapped_column(
        String, ForeignKey("zones.id", ondelete="CASCADE"), primary_key=True
    )
    date: Mapped[date] = mapped_column(Date, primary_key=True)

    temp_max_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_min_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_avg_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    soil_temp_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    precipitation_mm: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False, default=0)
    precip_prob_pct: Mapped[int | None] = mapped_column(Integer, nullable=True)
    humidity_pct: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wind_kmh: Mapped[int | None] = mapped_column(Integer, nullable=True)

    source: Mapped[str] = mapped_column(String, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ZoneForecast zone={self.zone_id!r} date={self.date!r}>"
