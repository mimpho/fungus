"""Add species taxonomy synonyms to extra_data JSONB

Revision ID: 004
Revises: 003
Create Date: 2026-03-07
"""
from typing import Sequence, Union

from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This is a data migration — schema unchanged (extra_data already exists).
    # Run the SQL script migrations/004_synonyms_data.sql manually
    # to populate synonyms in extra_data.
    pass


def downgrade() -> None:
    pass
