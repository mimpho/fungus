"""Add saved_points

Revision ID: 019
Revises: 018
Create Date: 2026-10-16

Points a user named and keeps in the free-map Observatory. Stores the user's choices and the
provenance of the derived data (land cover layer/code/name/date, toponym name/label, MCSC-4
codes with their share), not the services' raw answers. cell_id has no foreign key: cells are
a rebuildable cache. Deleting a user deletes their points.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "019"
down_revision = "018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "saved_points",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("forest_types", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("elevation_m", sa.Float(), nullable=True),
        sa.Column("cell_id", sa.String(), nullable=True),
        sa.Column("land_cover_layer", sa.Text(), nullable=True),
        sa.Column("land_cover_code", sa.Integer(), nullable=True),
        sa.Column("land_cover_name", sa.Text(), nullable=True),
        sa.Column("land_cover_retrieved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("toponym_name", sa.Text(), nullable=True),
        sa.Column("toponym_label", sa.Text(), nullable=True),
        sa.Column("composition", postgresql.JSONB(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "lat", "lon", name="uq_saved_points_user_place"),
    )
    op.create_index(
        "ix_saved_points_user_id_created_at", "saved_points", ["user_id", "created_at"]
    )
    # Same policy as the other tables (migration 012): RLS on, no public policies.
    op.execute("ALTER TABLE saved_points ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("saved_points")
