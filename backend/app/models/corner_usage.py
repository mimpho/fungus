"""Usage log behind the daily limits of corners (photo uploads, new corners)."""
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

EVENT_KINDS = ("photo_upload", "corner_create")


class CornerUsageEvent(Base):
    __tablename__ = "corner_usage_events"
    __table_args__ = (
        Index("ix_corner_usage_events_user_kind_created", "user_id", "kind", "created_at"),
        CheckConstraint(
            "kind IN (" + ", ".join(f"'{k}'" for k in EVENT_KINDS) + ")",
            name="ck_corner_usage_events_kind",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
