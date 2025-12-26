"""User models and schemas."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
from typing import Optional


class User(BaseModel):
    """User model."""
    user_id: str
    email: str
    name: str
    picture: str = ""
    is_pro: bool = False
    subscription_end: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=1, max_length=100)


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str
