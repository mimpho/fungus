"""Add corner_usage_events (daily limits of photo uploads and new corners)

Revision ID: 021
Revises: 020
Create Date: 2026-10-24

One row per photo upload or corner creation, written when it succeeds. The daily limits count
these rows of the current UTC day, not the live photos or corners, so deleting a photo or a
corner does not give the slot back. Rows older than a week are pruned when a new one is written.
Deleting a user deletes their rows.
"""

import sqlalchemy as sa
from alembic import op

revision = "021"
down_revision = "020"
branch_labels = None
depends_on = None

KINDS = ("photo_upload", "corner_create")


def upgrade() -> None:
    op.create_table(
        "corner_usage_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("kind", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "kind IN (" + ", ".join(f"'{k}'" for k in KINDS) + ")",
            name="ck_corner_usage_events_kind",
        ),
    )
    op.create_index(
        "ix_corner_usage_events_user_kind_created",
        "corner_usage_events",
        ["user_id", "kind", "created_at"],
    )
    op.execute("ALTER TABLE corner_usage_events ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_index("ix_corner_usage_events_user_kind_created", table_name="corner_usage_events")
    op.drop_table("corner_usage_events")
