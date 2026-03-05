"""Zone model — equivalent to mockZones in src/data/zones.js."""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Zone(Base):
    __tablename__ = "zones"

    # Same ID format as the current mock ('zone-001', 'zone-002', …)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    province: Mapped[str] = mapped_column(Text, nullable=False)
    region: Mapped[str] = mapped_column(Text, nullable=False)  # autonomous community

    # Coordinates stored as plain floats.
    # PostGIS GEOMETRY column (geom) is added via raw DDL in the migration,
    # as a GENERATED ALWAYS AS column so it stays in sync automatically.
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)
    elevation_m: Mapped[int | None] = mapped_column(Integer, nullable=True)
    forest_type: Mapped[str | None] = mapped_column(Text, nullable=True)  # pinar | hayedo | …
    soil_type: Mapped[str | None] = mapped_column(Text, nullable=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    climate_history: Mapped[list["ClimateHistory"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "ClimateHistory", back_populates="zone", cascade="all, delete-orphan"
    )
    score_cache: Mapped["ScoresCache | None"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "ScoresCache", back_populates="zone", uselist=False
    )
    weather_cache: Mapped["WeatherCache | None"] = relationship("WeatherCache", back_populates="zone", uselist=False)

    def __repr__(self) -> str:
        return f"<Zone id={self.id!r} name={self.name!r}>"
