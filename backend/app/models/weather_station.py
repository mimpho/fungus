"""
WeatherStation model — registry of meteorological stations per provider.
Used with PostGIS to find the nearest station to each zone.
"""
from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WeatherStation(Base):
    __tablename__ = "weather_stations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    source: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # 'meteocat' | 'aemet' | 'open-meteo'
    name: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Coordinates as plain floats; PostGIS geom column added via DDL in migration
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)
    elevation_m: Mapped[int | None] = mapped_column(Integer, nullable=True)

    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )  # extra provider data

    def __repr__(self) -> str:
        return f"<WeatherStation id={self.id!r} source={self.source!r}>"
