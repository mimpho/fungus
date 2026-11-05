"""Add cells.created_by

Revision ID: 018
Revises: 017
Create Date: 2026-10-16

User whose click created each cell, for the per-user daily limit of new cells
(OBSERVATORY_MAX_NEW_CELLS_PER_USER_PER_DAY). Nullable: cells that already exist have no
creator, and deleting a user keeps the cell (it is shared climate data) with created_by NULL.
The index serves "cells created by this user since midnight UTC".
"""

import sqlalchemy as sa
from alembic import op

revision = "018"
down_revision = "017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cells",
        sa.Column(
            "created_by",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_cells_created_by_created_at", "cells", ["created_by", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_cells_created_by_created_at", table_name="cells")
    op.drop_column("cells", "created_by")
