"""Add weather_cache table for caching real-time weather per zone

Revision ID: 003
Revises: 002
Create Date: 2026-03-06
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "weather_cache",
        sa.Column("zone_id", sa.String(), nullable=False),
        sa.Column("provider_id", sa.String(), nullable=False),
        # Daily temperature range from today's forecast — shown as "5–12°C"
        sa.Column("temp_min", sa.Float(), nullable=True),
        sa.Column("temp_max", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("rainfall14d", sa.Float(), nullable=True),
        sa.Column("wind", sa.Float(), nullable=True),
        # Timestamp of the actual Open-Meteo API call (not cache-read time)
        sa.Column("collected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("zone_id", "provider_id"),
    )
    op.create_index("ix_weather_cache_zone_id", "weather_cache", ["zone_id"])


def downgrade() -> None:
    op.drop_index("ix_weather_cache_zone_id", table_name="weather_cache")
    op.drop_table("weather_cache")
