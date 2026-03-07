"""Species model — biological parameters feed the Outbreak Index (OI) per species."""
from typing import Any

from sqlalchemy import ARRAY, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Species(Base):
    __tablename__ = "species"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # 'esp-001'
    scientific_name: Mapped[str] = mapped_column(Text, nullable=False)
    family: Mapped[str] = mapped_column(Text, nullable=False)
    edibility: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # excellent | good | edible | caution | toxic | deadly

    # ── Biological parameters for the Outbreak Index ─────────────────────────
    temp_min_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_opt_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    temp_max_c: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)
    rain_min_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rain_opt_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cycle_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # days from rain event to fruiting

    # ── PostgreSQL arrays ─────────────────────────────────────────────────────
    forest_types: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text), nullable=True
    )  # ['pinar', 'hayedo']
    fruiting_months: Mapped[list[int] | None] = mapped_column(
        ARRAY(Integer), nullable=True
    )  # [9, 10, 11] — 1-based
    elevation_min_m: Mapped[int | None] = mapped_column(Integer, nullable=True)
    elevation_max_m: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Extra data: morphology, confusions, photos, common names, synonyms, etc.
    extra_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    @property
    def synonyms(self) -> list[str]:
        """Get synonyms from extra_data JSONB field."""
        if not self.extra_data:
            return []
        return self.extra_data.get("synonyms", [])

    def __repr__(self) -> str:
        return f"<Species id={self.id!r} name={self.scientific_name!r}>"
