"""Add soil_temp to weather_cache

Revision ID: 013
Revises: 012
Create Date: 2026-10-07

The zone card showed "–" for soil temperature since the frontend moved from
calling Open-Meteo directly to the backend cache: the cache requested
soil_temperature_0cm but never stored it. This adds the column; the service
now saves the current hour's value.
"""
import sqlalchemy as sa
from alembic import op

revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("weather_cache", sa.Column("soil_temp", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("weather_cache", "soil_temp")
