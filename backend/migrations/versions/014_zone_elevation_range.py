"""Add elevation range to zones

Revision ID: 014
Revises: 013
Create Date: 2026-10-10

A zone was a single point with one altitude (elevation_m), which leaves out species
that fruit in other parts of the same zone (Setcases: point at Vallter, 1,885 m, excluded
species whose top is 1,800 m). elevation_min_m / elevation_max_m hold the altitude band
of the zone, computed by scripts/zone_elevation_ranges.py. Nullable: when empty, the
range is the point (elevation_m – elevation_m).
"""

import sqlalchemy as sa
from alembic import op

revision = "014"
down_revision = "013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("zones", sa.Column("elevation_min_m", sa.Integer(), nullable=True))
    op.add_column("zones", sa.Column("elevation_max_m", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("zones", "elevation_max_m")
    op.drop_column("zones", "elevation_min_m")
