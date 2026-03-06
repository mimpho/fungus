"""WeatherCache model for weather cache integration."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WeatherCache(Base):
    __tablename__ = "weather_cache"

    zone_id: Mapped[str] = mapped_column(
        String, ForeignKey("zones.id", ondelete="CASCADE"), primary_key=True
    )
    provider_id: Mapped[str] = mapped_column(
        String, primary_key=True
    )  # e.g., 'open-meteo', 'meteocat', etc.

    # Daily temperature range (today's forecast min/max) — displayed as "5–12°C"
    temp_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp_max: Mapped[float | None] = mapped_column(Float, nullable=True)

    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    rainfall14d: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Timestamp of the actual Open-Meteo API call (not the time the cache is read)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    zone = relationship("Zone", back_populates="weather_cache")

    def __repr__(self) -> str:
        return f"<WeatherCache zone_id={self.zone_id!r} provider_id={self.provider_id!r}>"
