"""Pydantic schemas for auth endpoints."""
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    plan: str
    plan_expires_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Returned on register and login — token + user info."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut
