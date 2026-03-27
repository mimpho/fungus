"""MushroomVisualPrompt model — structured visual DNA for image-model prompt assembly.

Each row encodes the per-species visual descriptors used by the Myco-Engine to build
deterministic, botanically-accurate prompts for text-to-image models (Imagen 4, etc.).

Design constraints:
- All text fields use positive visual language anchored to well-known reference specimens.
  Negative prohibitions (e.g. "no gills") reinforce the concept in image models and
  must be avoided — they belong in HYMENIUM_VISUAL_FOR_IMAGE_MODEL overrides only.
- hymenium_description must describe what IS visible, not what is absent.
- extra_morphology_visual: external features safe for image model (no colour reactions).
- extra_morphology_gemini: internal/chemical context for LLM scene generation only.
"""
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class MushroomVisualPrompt(Base):
    __tablename__ = "mushroom_visual_prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    species_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("species.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # ── Image-model layers ────────────────────────────────────────────────────
    cap_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    stipe_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hymenium_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_morphology_visual: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_morphology_gemini: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Environment / 16:9 fill context ──────────────────────────────────────
    preferred_substrate: Mapped[str | None] = mapped_column(Text, nullable=True)
    habitat_context: Mapped[str | None] = mapped_column(Text, nullable=True)
    associated_fauna: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Quality control ───────────────────────────────────────────────────────
    is_validated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        validated = "✓" if self.is_validated else "draft"
        return f"<MushroomVisualPrompt species_id={self.species_id!r} [{validated}]>"
