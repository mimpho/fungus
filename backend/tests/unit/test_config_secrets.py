"""Production refuses to start with a public or weak JWT signing key. No DB."""
import pytest

from app import main
from app.config import DEFAULT_JWT_SECRET, Settings

GOOD_KEY = "k" * 64  # what `openssl rand -hex 32` gives, in length


def _settings(environment: str, key: str) -> Settings:
    return Settings(_env_file=None, environment=environment, jwt_secret_key=key)


@pytest.mark.parametrize(
    "key",
    [
        DEFAULT_JWT_SECRET,           # forgot to set it: the public default
        "cambia-esto-en-produccion",  # the placeholder of .env.example
        "too-short",
        "",
    ],
)
def test_production_refuses_a_public_or_short_key(key):
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        _settings("production", key).check_production_secrets()


def test_production_refuses_when_the_variable_is_missing(monkeypatch):
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        Settings(_env_file=None, environment="production").check_production_secrets()


def test_production_accepts_a_long_key():
    _settings("production", GOOD_KEY).check_production_secrets()


def test_the_minimum_length_is_inclusive():
    _settings("production", "k" * 32).check_production_secrets()
    with pytest.raises(RuntimeError):
        _settings("production", "k" * 31).check_production_secrets()


@pytest.mark.parametrize("key", [DEFAULT_JWT_SECRET, "too-short", GOOD_KEY])
def test_development_is_never_blocked(key):
    _settings("development", key).check_production_secrets()


def test_the_error_does_not_leak_the_key():
    secret = "hunter2-do-not-print"
    with pytest.raises(RuntimeError) as exc:
        _settings("production", secret).check_production_secrets()
    assert secret not in str(exc.value)


async def test_the_app_does_not_start_in_production_with_the_default_key(monkeypatch):
    monkeypatch.setattr(main.settings, "environment", "production")
    monkeypatch.setattr(main.settings, "jwt_secret_key", DEFAULT_JWT_SECRET)
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        async with main.lifespan(main.app):
            pass
