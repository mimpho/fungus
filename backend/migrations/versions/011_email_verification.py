"""Add email verification fields to users table.

Revision ID: 011
Revises: 010
Create Date: 2026-04-16

Changes:
  - email_verified: BOOLEAN NOT NULL DEFAULT FALSE
      False for all existing users; True once they click the link.
      Google users are set to True on creation (Google already verified it).
  - email_verification_token: TEXT nullable
      Single-use URL-safe random token (secrets.token_urlsafe(32)).
      Cleared to NULL after successful verification.
  - email_verification_expires_at: TIMESTAMPTZ nullable
      24-hour expiry. Cleared after verification.
"""
from alembic import op
import sqlalchemy as sa


revision = "011"
down_revision = "010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. email_verified — default False for all existing users
    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # 2. email_verification_token — single-use, cleared after use
    op.add_column(
        "users",
        sa.Column("email_verification_token", sa.Text(), nullable=True),
    )

    # 3. email_verification_expires_at — 24h window
    op.add_column(
        "users",
        sa.Column(
            "email_verification_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Index for fast token lookups (verify-email endpoint)
    op.create_index(
        "ix_users_email_verification_token",
        "users",
        ["email_verification_token"],
        unique=True,
        postgresql_where=sa.text("email_verification_token IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_users_email_verification_token", table_name="users")
    op.drop_column("users", "email_verification_expires_at")
    op.drop_column("users", "email_verification_token")
    op.drop_column("users", "email_verified")
