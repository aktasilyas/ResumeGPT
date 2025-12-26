"""CV sharing routes (Premium feature)."""
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from app.models.user import User
from app.core.database import db
from app.core.security import get_current_user, generate_secure_token
from app.core.logging import logger

router = APIRouter(tags=["CV Sharing"])


@router.post("/cvs/{cv_id}/share")
async def create_share_link(cv_id: str, user: User = Depends(get_current_user)):
    """Create a public share link for CV (Premium only)."""
    try:
        if not user.is_pro:
            raise HTTPException(
                status_code=403,
                detail="Premium subscription required"
            )

        cv = await db.cvs.find_one(
            {"cv_id": cv_id, "user_id": user.user_id},
            {"_id": 0}
        )
        if not cv:
            raise HTTPException(status_code=404, detail="CV not found")

        # Generate secure share token
        share_token = generate_secure_token("share")[:24]  # 24 chars for share tokens
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)

        # Save share link
        await db.share_links.update_one(
            {"cv_id": cv_id},
            {"$set": {
                "cv_id": cv_id,
                "user_id": user.user_id,
                "share_token": share_token,
                "expires_at": expires_at.isoformat(),
                "views": 0,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )

        logger.info(f"Share link created: {cv_id}", extra={"user_id": user.user_id})
        return {
            "share_token": share_token,
            "expires_at": expires_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create share link error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to create share link")


@router.delete("/cvs/{cv_id}/share")
async def delete_share_link(cv_id: str, user: User = Depends(get_current_user)):
    """Delete/deactivate share link."""
    try:
        result = await db.share_links.update_one(
            {"cv_id": cv_id, "user_id": user.user_id},
            {"$set": {"is_active": False}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Share link not found")

        logger.info(f"Share link deleted: {cv_id}", extra={"user_id": user.user_id})
        return {"message": "Share link deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete share link error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to delete share link")


@router.get("/cvs/{cv_id}/share")
async def get_share_link(cv_id: str, user: User = Depends(get_current_user)):
    """Get existing share link for CV."""
    try:
        share_link = await db.share_links.find_one(
            {"cv_id": cv_id, "user_id": user.user_id, "is_active": True},
            {"_id": 0}
        )
        if not share_link:
            return {"share_token": None}

        # Check if expired
        expires_at = datetime.fromisoformat(share_link["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return {"share_token": None, "expired": True}

        return share_link

    except Exception as e:
        logger.error(f"Get share link error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to retrieve share link")


@router.get("/public/cv/{share_token}")
async def get_public_cv(share_token: str):
    """Get public CV by share token (no auth required)."""
    try:
        share_link = await db.share_links.find_one(
            {"share_token": share_token, "is_active": True},
            {"_id": 0}
        )

        if not share_link:
            raise HTTPException(status_code=404, detail="CV not found or link expired")

        # Check expiry
        expires_at = datetime.fromisoformat(share_link["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=404, detail="Share link expired")

        # Get CV
        cv = await db.cvs.find_one({"cv_id": share_link["cv_id"]}, {"_id": 0})
        if not cv:
            raise HTTPException(status_code=404, detail="CV not found")

        # Get user name
        user = await db.users.find_one(
            {"user_id": share_link["user_id"]},
            {"_id": 0, "name": 1, "picture": 1}
        )

        # Increment view count
        await db.share_links.update_one(
            {"share_token": share_token},
            {"$inc": {"views": 1}}
        )

        logger.info(f"Public CV viewed: {share_link['cv_id']}")
        return {
            "cv": cv,
            "owner": user,
            "views": share_link.get("views", 0) + 1
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get public CV error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve public CV")
