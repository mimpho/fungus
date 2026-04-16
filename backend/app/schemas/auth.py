"""Pydantic schemas for auth endpoints."""
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    birth_date: date | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("first_name", "last_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    first_name: str | None = None
    last_name: str | None = None
    birth_date: date | None = None
    plan: str
    plan_expires_at: datetime | None
    role: str
    email_verified: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Returned on register and login — token + user info."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleLoginRequest(BaseModel):
    """ID token issued by Google Identity Services on the frontend."""
    id_token: str
