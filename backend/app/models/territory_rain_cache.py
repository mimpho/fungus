"""Cached answer of the territory rain map (one row, rebuilt from Open-Meteo)."""

from datetime import datetime

from sqlalchemy import DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TerritoryRainCache(Base):
    __tablename__ = "territory_rain_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # always 1
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
