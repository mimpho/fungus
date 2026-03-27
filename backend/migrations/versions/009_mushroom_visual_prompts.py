"""Add mushroom_visual_prompts table for structured image-model prompt data.

Revision ID: 009
Revises: 008
Create Date: 2026-03-27

Each row stores the per-species visual DNA used by the Myco-Engine to assemble
deterministic, botanically-accurate prompts for text-to-image models.
Fields use positive visual language anchored to reference specimens — never
negative prohibitions, which reinforce the concept being avoided in image models.
"""
from alembic import op
import sqlalchemy as sa


revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "mushroom_visual_prompts",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "species_id",
            sa.String,
            sa.ForeignKey("species.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        # ── Image-model layers (positive visual language only) ─────────────────
        sa.Column("cap_description", sa.Text, nullable=True),
        sa.Column("stipe_description", sa.Text, nullable=True),
        # Must be visual + anchored to reference species (e.g. "as in porcini field photo")
        # NOT raw botanical terminology (e.g. "crowded white lamellae" → generates gills)
        sa.Column("hymenium_description", sa.Text, nullable=True),
        # Safe for image model: external features only, no bruising reactions
        sa.Column("extra_morphology_visual", sa.Text, nullable=True),
        # Gemini context only: internal features, reactions, edibility cues
        sa.Column("extra_morphology_gemini", sa.Text, nullable=True),
        # ── 16:9 fill / environment context ───────────────────────────────────
        sa.Column("preferred_substrate", sa.Text, nullable=True),
        sa.Column("habitat_context", sa.Text, nullable=True),
        sa.Column("associated_fauna", sa.Text, nullable=True),
        # ── Quality control ────────────────────────────────────────────────────
        sa.Column("is_validated", sa.Boolean, nullable=False, server_default="false"),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_mushroom_visual_prompts_species_id",
        "mushroom_visual_prompts",
        ["species_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_mushroom_visual_prompts_species_id", "mushroom_visual_prompts")
    op.drop_table("mushroom_visual_prompts")
