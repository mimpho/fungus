"""
ScoresCache model — cached Outbreak Index per zone.
Recomputed after each daily ingestion run.
Avoids recalculating the OI on every frontend request.
"""
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ScoresCache(Base):
    __tablename__ = "scores_cache"

    zone_id: Mapped[str] = mapped_column(
        String, ForeignKey("zones.id", ondelete="CASCADE"), primary_key=True
    )
    score_oi: Mapped[int] = mapped_column(Integer, nullable=False)  # Outbreak Index 0-100
    score_detail: Mapped[dict] = mapped_column(
        JSONB, nullable=False
    )  # {pa21, thermal, ripening, seasonal, humidity}
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )  # calculated_at + 24h

    # Relationship
    zone: Mapped["Zone"] = relationship("Zone", back_populates="score_cache")  # type: ignore[name-defined]  # noqa: F821

    @property
    def is_valid(self) -> bool:
        return datetime.now(UTC) < self.valid_until

    def __repr__(self) -> str:
        return f"<ScoresCache zone={self.zone_id!r} score={self.score_oi} valid={self.is_valid}>"
