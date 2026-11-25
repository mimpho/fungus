"""Add password recovery fields to users

Revision ID: 022
Revises: 021
Create Date: 2026-11-25

Password recovery by email (feat/password-reset):
  - password_reset_token_hash: TEXT nullable, indexed. SHA-256 of the single-use token that is
      emailed; the token itself is never stored. Cleared once the password is changed.
  - password_reset_expires_at: TIMESTAMPTZ nullable. The token is valid for one hour.
"""

import sqlalchemy as sa
from alembic import op

revision = "022"
down_revision = "021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_reset_token_hash", sa.Text(), nullable=True))
    op.add_column(
        "users", sa.Column("password_reset_expires_at", sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index("ix_users_password_reset_token_hash", "users", ["password_reset_token_hash"])


def downgrade() -> None:
    op.drop_index("ix_users_password_reset_token_hash", table_name="users")
    op.drop_column("users", "password_reset_expires_at")
    op.drop_column("users", "password_reset_token_hash")
