"""Auth service — password hashing, JWT creation and verification."""
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token types
_ACCESS_TYPE = "access"
_REFRESH_TYPE = "refresh"


# ── Password helpers ───────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


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


async def create_user(db: AsyncSession, email: str, password: str) -> User:
    user = User(email=email, password_hash=hash_password(password))
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
    candidate_hash = user.password_hash if user is not None else dummy
    if not verify_password(password, candidate_hash):
        return None
    return user
