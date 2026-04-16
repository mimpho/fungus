"""Auth router — register, login, refresh, logout."""
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    GoogleLoginRequest,
    LoginRequest,
    RegisterRequest,
    UserOut,
)
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
    create_verification_token,
    decode_refresh_token,
    get_or_create_google_user,
    get_user_by_email,
    get_user_by_id,
    verify_email_token,
    verify_google_id_token,
)
from app.services.email import send_verification_email

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

    # Send verification email — fire-and-forget: registration never fails because of this
    token = await create_verification_token(db, user)
    sent = await send_verification_email(user.email, token, user.first_name)
    if not sent:
        log.warning(
            "Verification email could not be sent to %s — user can request resend.", user.email
        )

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


@router.get("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Confirm an email address using the single-use token sent by email.

    Returns 200 on success, 400 if the token is invalid or expired.
    The frontend calls this endpoint when the user lands on /verificar-email?token=...
    """
    user = await verify_email_token(db, token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    log.info("Email verified: user_id=%d email=%s", user.id, user.email)
    return {"message": "Email verified successfully", "email": user.email}


@router.post("/resend-verification", status_code=status.HTTP_202_ACCEPTED)
async def resend_verification(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Re-send the verification email to the authenticated user.

    Returns 202 whether or not the email was actually sent (avoids leaking info).
    Returns 400 if the user is already verified.
    """
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified",
        )
    token = await create_verification_token(db, current_user)
    await send_verification_email(current_user.email, token, current_user.first_name)
    return {"message": "Verification email sent"}


@router.post("/google", response_model=AuthResponse)
async def google_login(
    body: GoogleLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    """
    Authenticate via Google Identity Services.

    Expects a Google ID token issued by the frontend (GIS One Tap or button).
    Verifies the token server-side, then finds or creates a local user account.
    Returns the same AuthResponse as /login — access token + refresh cookie.
    """
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google login not configured",
        )
    try:
        claims = verify_google_id_token(body.id_token)
    except ValueError as exc:
        log.warning("Invalid Google ID token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    google_id = claims["sub"]
    email = claims.get("email", "")
    first_name = claims.get("given_name", "")
    last_name = claims.get("family_name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account has no email address",
        )

    user = await get_or_create_google_user(db, google_id, email, first_name, last_name)
    access_token, refresh_token = _build_auth_response(user)
    _set_refresh_cookie(response, refresh_token)
    log.info("Google login: user_id=%d email=%s", user.id, user.email)
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))
