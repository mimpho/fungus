"""Add territory_rain_cache

Revision ID: 020
Revises: 019
Create Date: 2026-10-18

One row with the last answer of the territory rain map (weekly rain over a regular grid of
Catalonia, from Open-Meteo). A rebuildable cache: it is recomputed once a day.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "020"
down_revision = "019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "territory_rain_cache",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # Same policy as the other tables (migration 012): RLS on, no public policies.
    op.execute("ALTER TABLE territory_rain_cache ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("territory_rain_cache")
