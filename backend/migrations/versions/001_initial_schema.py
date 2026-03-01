"""Initial schema: zones, species, climate_history, scores_cache, weather_stations + PostGIS

Revision ID: 001
Revises:
Create Date: 2026-03-01
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostGIS extension — Supabase has it enabled by default
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # ── zones ─────────────────────────────────────────────────────────────────
    op.create_table(
        "zones",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("province", sa.Text(), nullable=False),
        sa.Column("region", sa.Text(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("elevation_m", sa.Integer(), nullable=True),
        sa.Column("forest_type", sa.Text(), nullable=True),
        sa.Column("soil_type", sa.Text(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # PostGIS geometry: auto-computed from lat/lon, always in sync
    op.execute(
        "ALTER TABLE zones ADD COLUMN geom GEOMETRY(Point, 4326) "
        "GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lon, lat), 4326)) STORED"
    )
    op.execute("CREATE INDEX zones_geom_idx ON zones USING GIST(geom)")
    op.create_index("zones_region_idx", "zones", ["region"])

    # ── species ───────────────────────────────────────────────────────────────
    op.create_table(
        "species",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("scientific_name", sa.Text(), nullable=False),
        sa.Column("family", sa.Text(), nullable=False),
        sa.Column("edibility", sa.Text(), nullable=False),
        sa.Column("temp_min_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_opt_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_max_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("rain_min_mm", sa.Integer(), nullable=True),
        sa.Column("rain_opt_mm", sa.Integer(), nullable=True),
        sa.Column("cycle_days", sa.Integer(), nullable=True),
        sa.Column("forest_types", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("fruiting_months", postgresql.ARRAY(sa.Integer()), nullable=True),
        sa.Column("elevation_min_m", sa.Integer(), nullable=True),
        sa.Column("elevation_max_m", sa.Integer(), nullable=True),
        sa.Column("extra_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── weather_stations ──────────────────────────────────────────────────────
    op.create_table(
        "weather_stations",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("source", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("elevation_m", sa.Integer(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        "ALTER TABLE weather_stations ADD COLUMN geom GEOMETRY(Point, 4326) "
        "GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lon, lat), 4326)) STORED"
    )
    op.execute("CREATE INDEX weather_stations_geom_idx ON weather_stations USING GIST(geom)")

    # ── climate_history ───────────────────────────────────────────────────────
    op.create_table(
        "climate_history",
        sa.Column("id", sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column("zone_id", sa.String(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("temp_max_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_min_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("temp_avg_c", sa.Numeric(4, 1), nullable=True),
        sa.Column("soil_temp_c", sa.Numeric(4, 1), nullable=True),
        sa.Column(
            "precipitation_mm",
            sa.Numeric(6, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column("humidity_pct", sa.Integer(), nullable=True),
        sa.Column("wind_kmh", sa.Integer(), nullable=True),
        sa.Column("source", sa.Text(), nullable=False),
        sa.Column("station_id", sa.Text(), nullable=True),
        sa.Column("station_dist_km", sa.Numeric(5, 1), nullable=True),
        sa.Column("interpolated", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("zone_id", "date", name="uq_climate_zone_date"),
    )
    op.create_index(
        "climate_zone_date_idx", "climate_history", ["zone_id", sa.text("date DESC")]
    )
    op.create_index("climate_date_idx", "climate_history", [sa.text("date DESC")])

    # ── scores_cache ──────────────────────────────────────────────────────────
    op.create_table(
        "scores_cache",
        sa.Column("zone_id", sa.String(), nullable=False),
        sa.Column("score_oi", sa.Integer(), nullable=False),
        sa.Column("score_detail", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("calculated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("zone_id"),
    )


def downgrade() -> None:
    op.drop_table("scores_cache")
    op.execute("DROP INDEX IF EXISTS climate_date_idx")
    op.execute("DROP INDEX IF EXISTS climate_zone_date_idx")
    op.drop_table("climate_history")
    op.execute("DROP INDEX IF EXISTS weather_stations_geom_idx")
    op.drop_table("weather_stations")
    op.drop_table("species")
    op.execute("DROP INDEX IF EXISTS zones_geom_idx")
    op.drop_index("zones_region_idx", table_name="zones")
    op.drop_table("zones")
