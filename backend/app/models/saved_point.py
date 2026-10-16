"""
Saved points of the free-map Observatory: coordinates a user named and keeps.

The climate is never stored here: it comes from the point's cell, which is a rebuildable
cache, so `cell_id` has no foreign key (purging or rebuilding cells must not delete points).
What is stored is what cannot be regenerated: the user's choices (name, notes, forest types)
and where the derived data came from (land cover layer, class code and name, retrieval date;
toponym name and label; MCSC-4 codes with their share). Never the services' raw texts, nor
the macrotype derived from the class: that is derived again, so a change in the mapping
applies to old points without asking the services again.
"""
from datetime import datetime
from typing import Any

from sqlalchemy import (
    ARRAY,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SavedPoint(Base):
    __tablename__ = "saved_points"
    __table_args__ = (
        UniqueConstraint("user_id", "lat", "lon", name="uq_saved_points_user_place"),
        Index("ix_saved_points_user_id_created_at", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # Rounded to 5 decimals (~1 m) before saving.
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    # The author's forest types (one or several); null = use the ones derived from the land cover.
    forest_types: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    elevation_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    cell_id: Mapped[str | None] = mapped_column(String, nullable=True)

    land_cover_layer: Mapped[str | None] = mapped_column(Text, nullable=True)
    land_cover_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    land_cover_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    land_cover_retrieved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    toponym_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    toponym_label: Mapped[str | None] = mapped_column(Text, nullable=True)
    # {"radius_m": 300, "items": [{"code": "bfs20", "pct": 95.0}]}; null until the MCSC-4
    # grid exists.
    composition: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<SavedPoint id={self.id} user_id={self.user_id} name={self.name!r}>"
