"""Add species confusions to extra_data JSONB

Revision ID: 005
Revises: 004
Create Date: 2026-03-07
"""
from typing import Sequence, Union

from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This is a data migration — schema unchanged (extra_data already exists).
    # Run the SQL script migrations/005_confusions_data.sql manually
    pass


def downgrade() -> None:
    pass
