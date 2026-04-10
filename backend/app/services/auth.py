"""Auth service — password hashing, JWT creation and verification."""
from datetime import UTC, datetime, timedelta

import bcrypt
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User

# JWT token types
_ACCESS_TYPE = "access"
_REFRESH_TYPE = "refresh"


# ── Password helpers ───────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Token helpers ──────────────────────────────────────────────────────────────

def _create_token(user_id: int, token_type: str, expires_delta: timedelta) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: int) -> str:
    return _create_token(
        user_id,
        _ACCESS_TYPE,
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(user_id: int) -> str:
    return _create_token(
        user_id,
        _REFRESH_TYPE,
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str, expected_type: str) -> int:
    """
    Decode and validate a JWT. Returns the user_id (int) on success.
    Raises JWTError on any validation failure.
    """
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != expected_type:
        raise JWTError("Invalid token type")
    sub = payload.get("sub")
    if sub is None:
        raise JWTError("Missing subject")
    return int(sub)


def decode_access_token(token: str) -> int:
    return decode_token(token, _ACCESS_TYPE)


def decode_refresh_token(token: str) -> int:
    return decode_token(token, _REFRESH_TYPE)


# ── DB helpers ─────────────────────────────────────────────────────────────────

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    password: str,
    first_name: str = "",
    last_name: str = "",
    birth_date=None,
) -> User:
    user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name or None,
        last_name=last_name or None,
        birth_date=birth_date,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """
    Return the User if credentials are valid, None otherwise.
    Always runs verify_password to avoid timing attacks that could
    reveal whether an email address is registered.
    """
    user = await get_user_by_email(db, email)
    # Use a dummy hash when user not found so response time is consistent
    dummy = "$2b$12$KIXvDummyHashToPreventTimingAttacksOnEmailEnumeration"
    candidate_hash = user.password_hash if (user is not None and user.password_hash) else dummy
    if not verify_password(password, candidate_hash):
        return None
    return user


# ── Google OAuth ───────────────────────────────────────────────────────────────

def verify_google_id_token(token: str) -> dict:
    """
    Verify a Google ID token and return its claims.
    Raises ValueError if the token is invalid or the audience doesn't match.
    """
    request = google_requests.Request()
    claims = google_id_token.verify_oauth2_token(
        token,
        request,
        audience=settings.google_client_id,
    )
    return claims


async def get_user_by_provider(db: AsyncSession, provider: str, provider_id: str) -> User | None:
    result = await db.execute(
        select(User).where(User.auth_provider == provider, User.provider_id == provider_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_google_user(
    db: AsyncSession,
    google_id: str,
    email: str,
    first_name: str,
    last_name: str,
) -> User:
    """
    Find or create a user from a verified Google ID token.

    Lookup order:
    1. By provider_id — returning Google user, fastest path.
    2. By email — existing local account: link it to Google (add provider fields).
    3. Neither — create a new Google-only user (no password_hash).
    """
    # 1. Known Google user
    user = await get_user_by_provider(db, "google", google_id)
    if user:
        return user

    # 2. Existing local account with same email → link
    user = await get_user_by_email(db, email)
    if user:
        user.auth_provider = "google"
        user.provider_id = google_id
        await db.commit()
        await db.refresh(user)
        return user

    # 3. New user — no password
    user = User(
        email=email,
        password_hash=None,
        auth_provider="google",
        provider_id=google_id,
        first_name=first_name or None,
        last_name=last_name or None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
