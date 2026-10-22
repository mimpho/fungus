"""
Saved points of the free-map Observatory ("corners"): coordinates a user named and keeps.

Only what the user writes and the coordinates are stored: name, notes, kind, tagged species
and photos. The climate, the forest, the soil and the toponym are never stored: they come from
the point's cell and from the map sources when the corner is opened, so a change in an
algorithm or a source applies to old corners without migrating anything. `elevation_m` is the
one derived value kept, until the cards can read the elevation model themselves.
"""
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

# What the corner is, chosen by the user (never computed). The first one is the default.
KINDS = ("unspecified", "mushroom_site", "prospect", "parking")
DEFAULT_KIND = KINDS[0]


class SavedPoint(Base):
    __tablename__ = "saved_points"
    __table_args__ = (
        UniqueConstraint("user_id", "lat", "lon", name="uq_saved_points_user_place"),
        Index("ix_saved_points_user_id_created_at", "user_id", "created_at"),
        CheckConstraint(
            "kind IN (" + ", ".join(f"'{k}'" for k in KINDS) + ")", name="ck_saved_points_kind"
        ),
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
    kind: Mapped[str] = mapped_column(
        Text, nullable=False, default=DEFAULT_KIND, server_default=DEFAULT_KIND
    )
    elevation_m: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<SavedPoint id={self.id} user_id={self.user_id} name={self.name!r}>"


class SavedPointSpecies(Base):
    """A catalogue species the user tagged on a corner directly."""

    __tablename__ = "saved_point_species"
    __table_args__ = (Index("ix_saved_point_species_species_id", "species_id"),)

    saved_point_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("saved_points.id", ondelete="CASCADE"), primary_key=True
    )
    species_id: Mapped[str] = mapped_column(
        String, ForeignKey("species.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class SavedPointPhoto(Base):
    """One of the (up to five) photos of a corner. The files live in private object storage;
    here only their keys, thumbnail and large version."""

    __tablename__ = "saved_point_photos"
    __table_args__ = (
        UniqueConstraint("saved_point_id", "position", name="uq_saved_point_photos_position"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    saved_point_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("saved_points.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    thumb_key: Mapped[str] = mapped_column(Text, nullable=False)
    large_key: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class SavedPointPhotoSpecies(Base):
    """A species tagged on a photo (zero, one or several per photo)."""

    __tablename__ = "saved_point_photo_species"
    __table_args__ = (Index("ix_saved_point_photo_species_species_id", "species_id"),)

    photo_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("saved_point_photos.id", ondelete="CASCADE"), primary_key=True
    )
    species_id: Mapped[str] = mapped_column(
        String, ForeignKey("species.id", ondelete="CASCADE"), primary_key=True
    )
