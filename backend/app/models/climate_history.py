"""
ClimateHistory model — core of the system.
One row per zone per day. The Outbreak Index is computed from the last 21 days.
"""
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ClimateHistory(Base):
    __tablename__ = "climate_history"
    __table_args__ = (
        UniqueConstraint("zone_id", "date", name="uq_climate_zone_date"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    zone_id: Mapped[str] = mapped_column(
        String, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # ── Daily metrics ─────────────────────────────────────────────────────────
    temp_max_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_min_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_avg_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    soil_temp_c: Mapped[float | None] = mapped_column(
        Numeric(4, 1), nullable=True
    )  # hourly soil_temperature_0cm aggregated
    precipitation_mm: Mapped[float] = mapped_column(
        Numeric(6, 2), nullable=False, default=0
    )
    humidity_pct: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wind_kmh: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # ── Source metadata ───────────────────────────────────────────────────────
    source: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # 'open-meteo' | 'aemet' | 'meteocat'
    station_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    station_dist_km: Mapped[float | None] = mapped_column(Numeric(5, 1), nullable=True)

    # ── Quality control ───────────────────────────────────────────────────────
    interpolated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship
    zone: Mapped["Zone"] = relationship("Zone", back_populates="climate_history")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<ClimateHistory zone={self.zone_id!r} date={self.date!r} source={self.source!r}>"
