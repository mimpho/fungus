"""Add meteo_day_series (daily Condiciones figures of all Catalonia for the day selector)

Revision ID: 023
Revises: 022
Create Date: 2026-11-28

One row per day and series ('excellent' or a species id): the mean and the p90 over the stored
cells. A cache, filled by the API itself from the cells' climate (app.services.day_series): it
starts empty and can be dropped and rebuilt.
"""

import sqlalchemy as sa
from alembic import op

revision = "023"
down_revision = "022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meteo_day_series",
        sa.Column("day", sa.Date(), nullable=False),
        sa.Column("series", sa.Text(), nullable=False),
        sa.Column("mean", sa.Float(), nullable=True),
        sa.Column("p90", sa.Float(), nullable=True),
        sa.Column("cells", sa.Integer(), nullable=False),
        sa.Column("inputs", sa.Text(), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("day", "series"),
    )
    op.execute("ALTER TABLE meteo_day_series ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("meteo_day_series")
