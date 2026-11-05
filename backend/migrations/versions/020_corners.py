"""Corners: kind, tagged species and photos for saved points

Revision ID: 020
Revises: 019
Create Date: 2026-10-22

"Mis rincones": a saved point gets a manual kind (unspecified, mushroom_site, prospect,
parking), species tagged from the catalogue (directly, or through its photos) and up to five
photos of its own (the files live in a private Supabase Storage bucket; here only their keys).

Only what the user writes and the coordinates are stored. Everything a service or a model
derives is computed when the corner is opened, so a change in the algorithm or the source
never leaves stale data behind. The columns that kept that provenance are dropped (land cover,
author's forest types, composition, toponym, climate cell); `elevation_m` stays until the cards
can read the elevation model. Dropping them is not reversible: the downgrade brings the columns
back empty.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "020"
down_revision = "019"
branch_labels = None
depends_on = None

KINDS = ("unspecified", "mushroom_site", "prospect", "parking")

# Dropped from saved_points, with the type they come back with on downgrade
DROPPED = (
    ("forest_types", postgresql.ARRAY(sa.Text())),
    ("cell_id", sa.String()),
    ("land_cover_layer", sa.Text()),
    ("land_cover_code", sa.Integer()),
    ("land_cover_name", sa.Text()),
    ("land_cover_retrieved_at", sa.DateTime(timezone=True)),
    ("toponym_name", sa.Text()),
    ("toponym_label", sa.Text()),
    ("composition", postgresql.JSONB()),
)


def upgrade() -> None:
    op.add_column(
        "saved_points",
        sa.Column("kind", sa.Text(), nullable=False, server_default="unspecified"),
    )
    op.create_check_constraint(
        "ck_saved_points_kind",
        "saved_points",
        "kind IN (" + ", ".join(f"'{k}'" for k in KINDS) + ")",
    )

    op.create_table(
        "saved_point_species",
        sa.Column(
            "saved_point_id",
            sa.Integer(),
            sa.ForeignKey("saved_points.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "species_id",
            sa.String(),
            sa.ForeignKey("species.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("saved_point_id", "species_id"),
    )
    op.create_index("ix_saved_point_species_species_id", "saved_point_species", ["species_id"])

    op.create_table(
        "saved_point_photos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "saved_point_id",
            sa.Integer(),
            sa.ForeignKey("saved_points.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.Column("thumb_key", sa.Text(), nullable=False),
        sa.Column("large_key", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("saved_point_id", "position", name="uq_saved_point_photos_position"),
    )

    op.create_table(
        "saved_point_photo_species",
        sa.Column(
            "photo_id",
            sa.Integer(),
            sa.ForeignKey("saved_point_photos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "species_id",
            sa.String(),
            sa.ForeignKey("species.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("photo_id", "species_id"),
    )
    op.create_index(
        "ix_saved_point_photo_species_species_id", "saved_point_photo_species", ["species_id"]
    )

    # Same policy as the other tables (migrations 012, 019): RLS on, no public policies.
    for table in ("saved_point_species", "saved_point_photos", "saved_point_photo_species"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")

    for name, _type in DROPPED:
        op.drop_column("saved_points", name)


def downgrade() -> None:
    # The dropped data is gone: the columns come back empty.
    for name, column_type in DROPPED:
        op.add_column("saved_points", sa.Column(name, column_type, nullable=True))

    op.drop_table("saved_point_photo_species")
    op.drop_table("saved_point_photos")
    op.drop_table("saved_point_species")
    op.drop_constraint("ck_saved_points_kind", "saved_points", type_="check")
    op.drop_column("saved_points", "kind")
