"""Add zone_forecast

Revision ID: 016
Revises: 015
Create Date: 2026-10-11

16-day Open-Meteo forecast per zone and target day, written by the daily ingest in the same
call that fetches the recent days. Kept apart from climate_history (observed days only).
Each run replaces the zone's rows; days before today are deleted.
"""

import sqlalchemy as sa
from alembic import op

revision = "016"
down_revision = "015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "zone_forecast",
        sa.Column("zone_id", sa.String(), sa.ForeignKey("zones.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("temp_max_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_min_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_avg_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("soil_temp_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("precipitation_mm", sa.Numeric(6, 2), nullable=False, server_default="0"),
        sa.Column("precip_prob_pct", sa.Integer(), nullable=True),
        sa.Column("humidity_pct", sa.Integer(), nullable=True),
        sa.Column("wind_kmh", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("zone_id", "date"),
    )
    # Same policy as the other tables (migration 012): RLS on, no public policies.
    op.execute("ALTER TABLE zone_forecast ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("zone_forecast")
