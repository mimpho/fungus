"""Alembic migration for WeatherCache table (Phase 1)"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'weather_cache',
        sa.Column('zone_id', sa.String(), nullable=False),
        sa.Column('provider_id', sa.String(), nullable=False),
        sa.Column('temperature', sa.Float(), nullable=True),
        sa.Column('humidity', sa.Float(), nullable=True),
        sa.Column('rainfall14d', sa.Float(), nullable=True),
        sa.Column('wind', sa.Float(), nullable=True),
        sa.Column('collected_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['zone_id'], ['zones.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('zone_id', 'provider_id')
    )


def downgrade():
    op.drop_table('weather_cache')
