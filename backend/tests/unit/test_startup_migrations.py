"""Startup migrations gate (RUN_MIGRATIONS_ON_STARTUP). No DB."""
import pytest
from alembic.util import CommandError

from app import main
from app.config import Settings


@pytest.mark.parametrize(
    ("environment", "flag", "expected"),
    [
        ("development", None, False),   # local default: never touch the shared DB
        ("production", None, True),     # Render default
        ("development", True, True),    # explicit opt-in (e.g. a local Docker DB)
        ("production", False, False),   # explicit opt-out
    ],
)
def test_should_run_migrations_on_startup(environment, flag, expected):
    s = Settings(_env_file=None, environment=environment, run_migrations_on_startup=flag)
    assert s.should_run_migrations_on_startup is expected


def _patch(monkeypatch, enabled, migrate):
    monkeypatch.setattr(main.settings, "environment", "development")
    monkeypatch.setattr(main.settings, "run_migrations_on_startup", enabled)
    monkeypatch.setattr(main, "_run_db_migrations", migrate)


async def test_skips_when_disabled(monkeypatch):
    calls = []
    _patch(monkeypatch, False, lambda: calls.append(1))
    await main._startup_migrations()
    assert calls == []


async def test_runs_when_enabled(monkeypatch):
    calls = []
    _patch(monkeypatch, True, lambda: calls.append(1))
    await main._startup_migrations()
    assert calls == [1]


async def test_unknown_revision_warns_and_continues(monkeypatch, caplog):
    def migrate():
        raise CommandError("Can't locate revision identified by '012'")

    _patch(monkeypatch, True, migrate)
    await main._startup_migrations()  # does not raise
    assert "revision this code does not know" in caplog.text


async def test_other_migration_errors_abort(monkeypatch):
    def migrate():
        raise CommandError("Multiple head revisions are present")

    _patch(monkeypatch, True, migrate)
    with pytest.raises(CommandError):
        await main._startup_migrations()
