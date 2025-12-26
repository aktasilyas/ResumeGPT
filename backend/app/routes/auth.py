"""Authentication routes: login, register, OAuth."""
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from app.models.user import User, RegisterRequest, LoginRequest
from app.core.database import db
from app.core.security import (
    hash_password,
    verify_password,
    create_user_session,
    get_current_user
)
from app.core.logging import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(request: RegisterRequest, response: Response):
    """Register new user with email/password."""
    try:
        existing = await db.users.find_one({"email": request.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = f"user_{uuid.uuid4().hex[:12]}"
        password_hash = hash_password(request.password)

        await db.users.insert_one({
            "user_id": user_id,
            "email": request.email,
            "name": request.name,
            "picture": "",
            "password_hash": password_hash,
            "is_pro": False,
            "subscription_end": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        await create_user_session(user_id, response)

        user = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0, "password_hash": 0}
        )
        logger.info(f"New user registered: {user_id}")
        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", extra={"error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login")
async def login(request: LoginRequest, response: Response):
    """Login with email/password."""
    try:
        user = await db.users.find_one({"email": request.email}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if "password_hash" not in user:
            raise HTTPException(status_code=401, detail="Please login with Google")

        if not verify_password(request.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        await create_user_session(user["user_id"], response)

        user_data = {k: v for k, v in user.items() if k != "password_hash"}
        logger.info(f"User logged in: {user['user_id']}")
        return user_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", extra={"error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token (Google OAuth)."""
    try:
        body = await request.json()
        session_id = body.get("session_id")

        if not session_id:
            raise HTTPException(status_code=400, detail="session_id required")

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            user_data = resp.json()

        user_id = f"user_{uuid.uuid4().hex[:12]}"
        existing_user = await db.users.find_one(
            {"email": user_data["email"]},
            {"_id": 0}
        )

        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data["name"],
                    "picture": user_data.get("picture", "")
                }}
            )
        else:
            await db.users.insert_one({
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture", ""),
                "is_pro": False,
                "subscription_end": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            logger.info(f"New OAuth user created: {user_id}")

        session_token = user_data.get("session_token", f"st_{uuid.uuid4().hex}")
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        await db.user_sessions.delete_many({"user_id": user_id})
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )

        user = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0, "password_hash": 0}
        )
        return user

    except HTTPException:
        raise
    except httpx.HTTPError as e:
        logger.error(f"OAuth HTTP error: {str(e)}")
        raise HTTPException(status_code=502, detail="OAuth service unavailable")
    except Exception as e:
        logger.error(f"Session creation error: {str(e)}", extra={"error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="Session creation failed")


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return user.model_dump()


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user."""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
        logger.info("User logged out")

    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}
