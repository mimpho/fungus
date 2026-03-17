"""Auth router — register, login, refresh, logout."""
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserOut
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
    decode_refresh_token,
    get_user_by_email,
    get_user_by_id,
)

log = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Refresh token cookie config
_REFRESH_COOKIE = "refresh_token"
_COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days in seconds


def _set_refresh_cookie(response: Response, token: str) -> None:
    # Production: SameSite=None + Secure so the browser sends the cookie in
    # cross-site fetch requests (Vercel frontend → Render backend).
    # Development: SameSite=Lax is fine because both run on localhost.
    is_prod = settings.is_production
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="none" if is_prod else "lax",
        max_age=_COOKIE_MAX_AGE,
        path="/api/v1/auth",  # scoped — only sent to auth endpoints
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_REFRESH_COOKIE, path="/api/v1/auth")


def _build_auth_response(user: User) -> tuple[str, str]:
    """Return (access_token, refresh_token) for a given user."""
    return create_access_token(user.id), create_refresh_token(user.id)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Create a new user account. Returns access token + sets refresh cookie."""
    if await get_user_by_email(db, body.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = await create_user(
        db, body.email, body.password,
        first_name=body.first_name,
        last_name=body.last_name,
        birth_date=body.birth_date,
    )
    access_token, refresh_token = _build_auth_response(user)
    _set_refresh_cookie(response, refresh_token)
    log.info("New user registered: id=%d email=%s", user.id, user.email)
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """Authenticate user. Returns access token + sets refresh cookie."""
    user = await authenticate_user(db, body.email, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    access_token, refresh_token = _build_auth_response(user)
    _set_refresh_cookie(response, refresh_token)
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/refresh", response_model=AuthResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """
    Issue a new access token using the refresh token httpOnly cookie.
    Rotates the refresh token on every call (sliding expiry).
    """
    token = request.cookies.get(_REFRESH_COOKIE)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token",
        )
    try:
        user_id = decode_refresh_token(token)
    except JWTError:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    user = await get_user_by_id(db, user_id)
    if user is None:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    access_token, new_refresh = _build_auth_response(user)
    _set_refresh_cookie(response, new_refresh)
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    _current_user: User = Depends(get_current_user),
) -> None:
    """Invalidate session by clearing the refresh token cookie."""
    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)) -> UserOut:
    """Return the currently authenticated user's profile."""
    return UserOut.model_validate(current_user)
