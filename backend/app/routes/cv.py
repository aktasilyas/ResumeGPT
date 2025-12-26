"""CV management routes."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.cv import CV, CVCreate, CVUpdate
from app.models.user import User
from app.core.database import db
from app.core.security import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/cvs", tags=["CV Management"])


@router.get("", response_model=List[dict])
async def get_cvs(user: User = Depends(get_current_user)):
    """Get all CVs for current user."""
    try:
        cvs = await db.cvs.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
        for cv in cvs:
            if isinstance(cv.get("created_at"), str):
                cv["created_at"] = datetime.fromisoformat(cv["created_at"])
            if isinstance(cv.get("updated_at"), str):
                cv["updated_at"] = datetime.fromisoformat(cv["updated_at"])
        return cvs

    except Exception as e:
        logger.error(f"Get CVs error: {str(e)}", extra={"user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to retrieve CVs")


@router.post("", response_model=dict, status_code=201)
async def create_cv(cv_create: CVCreate, user: User = Depends(get_current_user)):
    """Create a new CV."""
    try:
        cv = CV(user_id=user.user_id, title=cv_create.title)
        cv_dict = cv.model_dump()
        cv_dict["created_at"] = cv_dict["created_at"].isoformat()
        cv_dict["updated_at"] = cv_dict["updated_at"].isoformat()
        await db.cvs.insert_one(cv_dict)

        result = await db.cvs.find_one({"cv_id": cv.cv_id}, {"_id": 0})
        logger.info(f"CV created: {cv.cv_id}", extra={"user_id": user.user_id})
        return result

    except Exception as e:
        logger.error(f"Create CV error: {str(e)}", extra={"user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to create CV")


@router.get("/{cv_id}", response_model=dict)
async def get_cv(cv_id: str, user: User = Depends(get_current_user)):
    """Get a specific CV."""
    try:
        cv = await db.cvs.find_one(
            {"cv_id": cv_id, "user_id": user.user_id},
            {"_id": 0}
        )
        if not cv:
            raise HTTPException(status_code=404, detail="CV not found")
        return cv

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get CV error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to retrieve CV")


@router.put("/{cv_id}", response_model=dict)
async def update_cv(
    cv_id: str,
    cv_update: CVUpdate,
    user: User = Depends(get_current_user)
):
    """Update a CV."""
    try:
        cv = await db.cvs.find_one(
            {"cv_id": cv_id, "user_id": user.user_id},
            {"_id": 0}
        )
        if not cv:
            raise HTTPException(status_code=404, detail="CV not found")

        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if cv_update.title is not None:
            update_data["title"] = cv_update.title
        if cv_update.data is not None:
            update_data["data"] = cv_update.data.model_dump()
        if cv_update.settings is not None:
            update_data["settings"] = cv_update.settings.model_dump()

        await db.cvs.update_one({"cv_id": cv_id}, {"$set": update_data})
        result = await db.cvs.find_one({"cv_id": cv_id}, {"_id": 0})
        logger.info(f"CV updated: {cv_id}", extra={"user_id": user.user_id})
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update CV error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to update CV")


@router.delete("/{cv_id}")
async def delete_cv(cv_id: str, user: User = Depends(get_current_user)):
    """Delete a CV."""
    try:
        result = await db.cvs.delete_one({"cv_id": cv_id, "user_id": user.user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="CV not found")

        logger.info(f"CV deleted: {cv_id}", extra={"user_id": user.user_id})
        return {"message": "CV deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete CV error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id})
        raise HTTPException(status_code=500, detail="Failed to delete CV")
