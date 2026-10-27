"""seed_catalog guard rails (added 2026-10-24, after a run from a terminal without DATABASE_URL
overwrote the production zones and wiped the extra_data of every species).

No DB, no network: the statements are only compiled, never run.
"""
import logging

import pytest
from sqlalchemy.dialects import postgresql

from scripts import seed_catalog as sc

REMOTE = "postgresql+asyncpg://postgres.abc:s3cr3t-pass@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
LOCAL = "postgresql+asyncpg://postgres:postgres@localhost:55433/fungus"


def _sql(stmt) -> str:
    return str(stmt.compile(dialect=postgresql.dialect()))


class TestTarget:
    @pytest.mark.parametrize(
        "url",
        [
            LOCAL,
            "postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/fungus",
            "postgresql+asyncpg://postgres:postgres@[::1]:5432/fungus",
            "postgresql+asyncpg:///fungus",  # unix socket: no host
        ],
    )
    def test_a_local_database_is_accepted(self, url):
        sc.check_target(url, allow_remote=False)

    def test_a_remote_database_is_refused_by_default(self):
        with pytest.raises(SystemExit) as exc:
            sc.check_target(REMOTE, allow_remote=False)
        assert exc.value.code not in (0, None)

    def test_the_refusal_never_shows_the_password_or_the_user(self, caplog):
        caplog.set_level(logging.DEBUG)
        with pytest.raises(SystemExit):
            sc.check_target(REMOTE, allow_remote=False)
        text = caplog.text
        assert "s3cr3t-pass" not in text and "postgres.abc" not in text
        assert "supabase.com" in text  # the host is what the person needs to recognise

    def test_the_flag_allows_a_remote_database(self):
        sc.check_target(REMOTE, allow_remote=True)

    def test_a_host_that_only_starts_with_localhost_is_not_local(self):
        with pytest.raises(SystemExit):
            sc.check_target("postgresql+asyncpg://u:p@localhost.evil.example.com/db", False)


class TestStatements:
    ZONE = dict(
        id="zone-001", name="N", province="P", region="R", lat=1.0, lon=2.0,
        elevation_m=10, forest_type="pinar", description="D", active=True,
    )

    def test_zones_are_insert_only_by_default(self):
        sql = _sql(sc.zone_statement(self.ZONE, overwrite=False))
        assert "ON CONFLICT (id) DO NOTHING" in sql and "DO UPDATE" not in sql

    def test_zones_are_overwritten_only_when_asked(self):
        sql = _sql(sc.zone_statement(self.ZONE, overwrite=True))
        assert "DO UPDATE" in sql and "name=" in sql.replace(" ", "")

    def test_species_extra_data_is_merged_not_replaced(self):
        values = dict(
            id="esp-001", scientific_name="X", family="F", edibility="edible",
            extra_data={"photo": "p"},
        )
        sql = _sql(sc.species_statement(values)).replace("\n", " ")
        update = sql.split("DO UPDATE SET", 1)[1]
        # existing keys not in the mock (synonyms, confusions, translations) survive
        assert "coalesce(species.extra_data" in update.lower() and "||" in update
