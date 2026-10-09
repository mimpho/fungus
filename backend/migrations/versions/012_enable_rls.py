"""Enable Row Level Security on all public tables

Revision ID: 012
Revises: 011
Create Date: 2026-06-17

Context
-------
Supabase reported that all tables in the public schema had RLS disabled,
making them fully readable/writable by anyone with the project URL and the
anon key.

The Fungus backend accesses the database exclusively through FastAPI using
the Supabase service_role key (set in SUPABASE_SERVICE_KEY env var).
The service_role key bypasses RLS by design, so enabling RLS with NO
additional anon policies is enough to close the exposure without any
application code changes.

Tables covered
--------------
  alembic_version       – internal Alembic tracking, no public access needed
  climate_history       – write-heavy backend table, no public access needed
  mushroom_visual_prompts – admin-only content table
  scores_cache          – backend-written cache
  species               – served via FastAPI /api/v1/species, not direct Supabase
  user_fav_species      – user data, served via FastAPI
  user_followed_zones   – user data, served via FastAPI
  users                 – user data, served via FastAPI
  weather_cache         – backend-written cache
  weather_stations      – reference data, served via FastAPI
  zones                 – reference data, served via FastAPI /api/v1/zones
"""

from alembic import op

# revision identifiers
revision = "012"
down_revision = "011"
branch_labels = None
depends_on = None

_TABLES = [
    "alembic_version",
    "climate_history",
    "mushroom_visual_prompts",
    "scores_cache",
    "species",
    "user_fav_species",
    "user_followed_zones",
    "users",
    "weather_cache",
    "weather_stations",
    "zones",
]


def upgrade() -> None:
    for table in _TABLES:
        op.execute(f'ALTER TABLE public."{table}" ENABLE ROW LEVEL SECURITY;')


def downgrade() -> None:
    for table in _TABLES:
        op.execute(f'ALTER TABLE public."{table}" DISABLE ROW LEVEL SECURITY;')
