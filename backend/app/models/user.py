"""User model — auth + favorites + followed zones."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)

    # OAuth provider — 'local' | 'google'
    auth_provider: Mapped[str] = mapped_column(String(20), nullable=False, default="local")
    provider_id: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Profile fields
    first_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Monetization tier — "free" | "premium"
    plan: Mapped[str] = mapped_column(String(20), nullable=False, default="free")
    plan_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # User role — "user" | "admin"
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    followed_zones: Mapped[list["UserFollowedZone"]] = relationship(
        "UserFollowedZone", back_populates="user", cascade="all, delete-orphan"
    )
    fav_species: Mapped[list["UserFavSpecies"]] = relationship(
        "UserFavSpecies", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} plan={self.plan!r}>"


class UserFollowedZone(Base):
    __tablename__ = "user_followed_zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    zone_id: Mapped[str] = mapped_column(
        Text, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="followed_zones")

    def __repr__(self) -> str:
        return f"<UserFollowedZone user_id={self.user_id} zone_id={self.zone_id!r}>"


class UserFavSpecies(Base):
    __tablename__ = "user_fav_species"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    species_id: Mapped[str] = mapped_column(
        Text, ForeignKey("species.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="fav_species")

    def __repr__(self) -> str:
        return f"<UserFavSpecies user_id={self.user_id} species_id={self.species_id!r}>"
