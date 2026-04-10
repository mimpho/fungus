"""Add Google OAuth2 fields to users table.

Revision ID: 010
Revises: 009
Create Date: 2026-04-11

Changes:
  - password_hash: NOT NULL → nullable (Google users have no password)
  - auth_provider: new VARCHAR(20) NOT NULL DEFAULT 'local'
  - provider_id: new TEXT nullable (Google's stable `sub` claim)
  - unique index on (auth_provider, provider_id) for fast Google lookups
"""
from alembic import op
import sqlalchemy as sa


revision = "010"
down_revision = "009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Make password_hash nullable — Google users won't have one
    op.alter_column("users", "password_hash", existing_type=sa.Text(), nullable=True)

    # 2. Add auth_provider — 'local' | 'google'
    op.add_column(
        "users",
        sa.Column(
            "auth_provider",
            sa.String(length=20),
            nullable=False,
            server_default="local",
        ),
    )

    # 3. Add provider_id — Google's stable `sub` claim
    op.add_column(
        "users",
        sa.Column("provider_id", sa.Text(), nullable=True),
    )

    # 4. Unique index: one provider_id per provider (partial — only when not NULL)
    op.create_index(
        "uq_users_provider",
        "users",
        ["auth_provider", "provider_id"],
        unique=True,
        postgresql_where=sa.text("provider_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_users_provider", table_name="users")
    op.drop_column("users", "provider_id")
    op.drop_column("users", "auth_provider")
    op.alter_column("users", "password_hash", existing_type=sa.Text(), nullable=False)
