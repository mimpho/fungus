"""Add role to users table.

Revision ID: 008
Revises: 007
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa


revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use String(20) to match the plan and current SQLAlchemy model
    op.add_column("users", sa.Column("role", sa.String(length=20), nullable=False, server_default="user"))


def downgrade() -> None:
    op.drop_column("users", "role")
