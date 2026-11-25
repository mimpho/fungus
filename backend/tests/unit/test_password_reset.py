"""Password recovery (feat/password-reset): forgot-password and reset-password.

No DB, no network. The users live in a fake session that answers the one query the service
makes (a user by the SHA-256 of the token); the router tests replace the lookup by email and the
email sender. Scenarios: the token is stored hashed, is single-use, expires after an hour, a
second request within a minute does not replace the link, a Google-only account can set a
password and keeps Google, and the answer never says whether an email is registered.
"""
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import bcrypt
import httpx
from fastapi import FastAPI

from app.database import get_db
from app.routers import auth as auth_router
from app.services import auth as auth_service
from app.services.auth import (
    PASSWORD_RESET_COOLDOWN,
    PASSWORD_RESET_EXPIRY,
    create_password_reset_token,
    reset_password_with_token,
)

NOW = datetime(2026, 11, 25, 12, 0, tzinfo=UTC)


def _user(**over):
    base = dict(
        id=1, email="marcos@example.com", first_name="Marcos",
        password_hash=auth_service.hash_password("old-password"),
        password_reset_token_hash=None, password_reset_expires_at=None,
        email_verified=False, email_verification_token="pending",
        email_verification_expires_at=NOW,
    )
    base.update(over)
    return SimpleNamespace(**base)


class FakeDb:
    """Answers `select(User).where(User.password_reset_token_hash == <hash>)` from a list."""

    def __init__(self, *users):
        self.users = list(users)
        self.commits = 0

    async def execute(self, stmt):
        wanted = list(stmt.compile().params.values())[0]
        found = next((u for u in self.users if u.password_reset_token_hash == wanted), None)
        return SimpleNamespace(scalar_one_or_none=lambda: found)

    async def commit(self):
        self.commits += 1

    async def refresh(self, _obj):
        pass


# ── Service ────────────────────────────────────────────────────────────────────

async def test_token_is_stored_hashed_and_expires_in_an_hour():
    user = _user()
    token = await create_password_reset_token(FakeDb(user), user)
    assert token and token not in (user.password_reset_token_hash or "")
    assert user.password_reset_token_hash == auth_service._hash_reset_token(token)
    assert len(user.password_reset_token_hash) == 64  # SHA-256, hex
    left = user.password_reset_expires_at - datetime.now(UTC)
    assert timedelta(minutes=59) < left <= PASSWORD_RESET_EXPIRY


async def test_a_google_only_account_can_set_a_password_and_keeps_google():
    user = _user(password_hash=None, auth_provider="google", provider_id="g-123")
    db = FakeDb(user)
    token = await create_password_reset_token(db, user)
    assert token and user.password_reset_token_hash
    assert await reset_password_with_token(db, token, "a-new-password") is user
    assert bcrypt.checkpw(b"a-new-password", user.password_hash.encode())
    assert user.auth_provider == "google" and user.provider_id == "g-123"  # Google still works


async def test_a_second_request_within_the_cooldown_keeps_the_first_link():
    user = _user()
    db = FakeDb(user)
    first = await create_password_reset_token(db, user)
    kept = user.password_reset_token_hash
    assert await create_password_reset_token(db, user) is None
    assert user.password_reset_token_hash == kept
    assert await reset_password_with_token(db, first, "a-new-password") is user


async def test_after_the_cooldown_a_new_request_replaces_the_link():
    user = _user()
    db = FakeDb(user)
    old = await create_password_reset_token(db, user)
    # the first link was issued two minutes ago
    issued = datetime.now(UTC) - PASSWORD_RESET_COOLDOWN * 2
    user.password_reset_expires_at = issued + PASSWORD_RESET_EXPIRY
    new = await create_password_reset_token(db, user)
    assert new and new != old
    assert await reset_password_with_token(db, old, "a-new-password") is None
    assert await reset_password_with_token(db, new, "a-new-password") is user


async def test_reset_changes_the_password_consumes_the_token_and_verifies_the_email():
    user = _user()
    db = FakeDb(user)
    token = await create_password_reset_token(db, user)
    result = await reset_password_with_token(db, token, "a-new-password")
    assert result is user
    assert bcrypt.checkpw(b"a-new-password", user.password_hash.encode())
    assert not bcrypt.checkpw(b"old-password", user.password_hash.encode())
    assert user.password_reset_token_hash is None and user.password_reset_expires_at is None
    assert user.email_verified is True and user.email_verification_token is None


async def test_the_token_works_once():
    user = _user()
    db = FakeDb(user)
    token = await create_password_reset_token(db, user)
    assert await reset_password_with_token(db, token, "a-new-password") is user
    assert await reset_password_with_token(db, token, "another-password") is None


async def test_an_expired_token_is_refused_and_cleared():
    user = _user()
    db = FakeDb(user)
    token = await create_password_reset_token(db, user)
    user.password_reset_expires_at = datetime.now(UTC) - timedelta(seconds=1)
    assert await reset_password_with_token(db, token, "a-new-password") is None
    assert bcrypt.checkpw(b"old-password", user.password_hash.encode())
    assert user.password_reset_token_hash is None


async def test_an_unknown_token_is_refused():
    assert await reset_password_with_token(FakeDb(_user()), "nope", "a-new-password") is None


# ── Router ─────────────────────────────────────────────────────────────────────

def _client(db, monkeypatch, *, users_by_email=(), sent=None):
    app = FastAPI()
    app.include_router(auth_router.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: db
    by_email = {u.email: u for u in users_by_email}

    async def get_user_by_email(_db, email):
        return by_email.get(email)

    async def send(email, token, first_name=None):
        if sent is not None:
            sent.append((email, token, first_name))
        return True

    monkeypatch.setattr(auth_router, "get_user_by_email", get_user_by_email)
    monkeypatch.setattr(auth_router, "send_password_reset_email", send)
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t/api/v1")


async def test_forgot_password_sends_the_link_to_a_registered_email(monkeypatch):
    user, sent = _user(), []
    async with _client(FakeDb(user), monkeypatch, users_by_email=[user], sent=sent) as c:
        r = await c.post("/auth/forgot-password", json={"email": user.email})
    assert r.status_code == 202
    assert len(sent) == 1 and sent[0][0] == user.email and sent[0][2] == "Marcos"
    assert auth_service._hash_reset_token(sent[0][1]) == user.password_reset_token_hash


async def test_forgot_password_answers_the_same_for_an_unknown_email(monkeypatch):
    user, sent = _user(), []
    async with _client(FakeDb(user), monkeypatch, users_by_email=[user], sent=sent) as c:
        known = await c.post("/auth/forgot-password", json={"email": user.email})
        unknown = await c.post("/auth/forgot-password", json={"email": "nobody@example.com"})
    assert (known.status_code, known.json()) == (unknown.status_code, unknown.json())
    assert [s[0] for s in sent] == [user.email]  # nothing went to the unknown one


async def test_forgot_password_sends_the_link_to_a_google_only_account(monkeypatch):
    user, sent = _user(password_hash=None, auth_provider="google"), []
    async with _client(FakeDb(user), monkeypatch, users_by_email=[user], sent=sent) as c:
        r = await c.post("/auth/forgot-password", json={"email": user.email})
    assert r.status_code == 202 and [s[0] for s in sent] == [user.email]


async def test_forgot_password_twice_in_a_row_sends_once(monkeypatch):
    user, sent = _user(), []
    async with _client(FakeDb(user), monkeypatch, users_by_email=[user], sent=sent) as c:
        await c.post("/auth/forgot-password", json={"email": user.email})
        r = await c.post("/auth/forgot-password", json={"email": user.email})
    assert r.status_code == 202 and len(sent) == 1


async def test_forgot_password_rejects_a_malformed_email(monkeypatch):
    async with _client(FakeDb(), monkeypatch) as c:
        r = await c.post("/auth/forgot-password", json={"email": "not-an-email"})
    assert r.status_code == 422


async def test_reset_password_with_a_good_token(monkeypatch):
    user = _user()
    db = FakeDb(user)
    token = await create_password_reset_token(db, user)
    async with _client(db, monkeypatch) as c:
        r = await c.post(
            "/auth/reset-password", json={"token": token, "password": "a-new-password"}
        )
    assert r.status_code == 200
    assert bcrypt.checkpw(b"a-new-password", user.password_hash.encode())
    assert "refresh_token" in r.headers.get("set-cookie", "")  # the old cookie is cleared


async def test_reset_password_with_a_bad_token_is_400(monkeypatch):
    async with _client(FakeDb(_user()), monkeypatch) as c:
        r = await c.post(
            "/auth/reset-password", json={"token": "nope", "password": "a-new-password"}
        )
    assert r.status_code == 400


async def test_reset_password_rejects_a_short_password(monkeypatch):
    user = _user()
    db = FakeDb(user)
    token = await create_password_reset_token(db, user)
    async with _client(db, monkeypatch) as c:
        r = await c.post("/auth/reset-password", json={"token": token, "password": "short"})
    assert r.status_code == 422
    assert bcrypt.checkpw(b"old-password", user.password_hash.encode())
