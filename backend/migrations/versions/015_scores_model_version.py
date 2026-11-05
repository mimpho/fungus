"""Add model_version to scores_cache

Revision ID: 015
Revises: 014
Create Date: 2026-10-10

score_oi becomes the score of the current model (v2 from now on) and model_version says
which one. score_detail keeps every computed version under its own key ({"v1": …, "v2": …}),
so a future model never renames a column. Nullable: rows written before this are v1.
"""

import sqlalchemy as sa
from alembic import op

revision = "015"
down_revision = "014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("scores_cache", sa.Column("model_version", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("scores_cache", "model_version")
