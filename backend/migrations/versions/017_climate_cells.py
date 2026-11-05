"""Add cells, cell_lookup and climate_cell_history

Revision ID: 017
Revises: 016
Create Date: 2026-10-14

Open-Meteo grid cells (base unit of the free-map Observatory), the lookup from a clicked
point's ~500 m bucket to its cell, and the cells' daily climate.
A rebuildable cache loaded on demand on the first click in a cell; kept apart from
climate_history, which is keyed by zone. source is 'archive' (final) or 'forecast'
(provisional, overwritten by the archive when it catches up).
"""

import sqlalchemy as sa
from alembic import op

revision = "017"
down_revision = "016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cells",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("elevation_m", sa.Float(), nullable=False),
        sa.Column("loaded_from", sa.Date(), nullable=True),
        sa.Column("loaded_to", sa.Date(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("refreshed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "cell_lookup",
        sa.Column("lat_key", sa.Integer(), nullable=False),
        sa.Column("lon_key", sa.Integer(), nullable=False),
        sa.Column(
            "cell_id", sa.String(), sa.ForeignKey("cells.id", ondelete="CASCADE"), nullable=False
        ),
        sa.PrimaryKeyConstraint("lat_key", "lon_key"),
    )
    op.create_index("ix_cell_lookup_cell_id", "cell_lookup", ["cell_id"])
    op.create_table(
        "climate_cell_history",
        sa.Column(
            "cell_id", sa.String(), sa.ForeignKey("cells.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("temp_max_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_min_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_avg_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("soil_temp_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("precipitation_mm", sa.Numeric(6, 2), nullable=False, server_default="0"),
        sa.Column("humidity_pct", sa.Integer(), nullable=True),
        sa.Column("wind_kmh", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(), nullable=False),
        sa.Column(
            "fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("cell_id", "date"),
        sa.CheckConstraint("source IN ('archive', 'forecast')", name="ck_climate_cell_source"),
    )
    # Same policy as the other tables (migration 012): RLS on, no public policies.
    op.execute("ALTER TABLE cells ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE cell_lookup ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE climate_cell_history ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("climate_cell_history")
    op.drop_table("cell_lookup")
    op.drop_table("cells")
