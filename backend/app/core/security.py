"""Security utilities: password hashing, session management, input sanitization."""
import secrets
import uuid
import bcrypt
from html import escape
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request, Response
from app.core.config import settings
from app.core.database import db
from app.models.user import User


def hash_password(password: str) -> str:
    """Hash password using bcrypt with secure salt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def generate_secure_token(prefix: str = "st") -> str:
    """Generate cryptographically secure session token."""
    random_part = secrets.token_urlsafe(32)
    return f"{prefix}_{random_part}"


def sanitize_html(text: str) -> str:
    """Escape HTML special characters to prevent XSS attacks."""
    if not text:
        return ""
    return escape(str(text))


async def get_current_user(request: Request) -> User:
    """Get current user from session token."""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return User(**user)


async def create_user_session(user_id: str, response: Response) -> str:
    """Create a new session for user with secure token."""
    session_token = generate_secure_token("st")
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.session_expire_days)

    # Delete old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})

    # Create new session
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # Set secure HTTP-only cookie (adjust for development vs production)
    is_production = settings.environment == "production"
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=settings.session_expire_days * 24 * 60 * 60,
        path="/"
    )

    return session_token
