"""PDF generation route."""
from io import BytesIO
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.models.user import User
from app.models.cv import CV
from app.core.database import db
from app.core.security import get_current_user
from app.utils.pdf_generator import generate_cv_pdf
from app.core.logging import logger

router = APIRouter(tags=["PDF Generation"])


@router.post("/generate-pdf/{cv_id}")
async def generate_pdf(cv_id: str, user: User = Depends(get_current_user)):
    """Generate PDF from CV with XSS protection."""
    try:
        cv_data = await db.cvs.find_one(
            {"cv_id": cv_id, "user_id": user.user_id},
            {"_id": 0}
        )
        if not cv_data:
            raise HTTPException(status_code=404, detail="CV not found")

        # Convert to CV model
        cv = CV(**cv_data)

        # Generate PDF with sanitization
        pdf_bytes = generate_cv_pdf(cv, user)

        logger.info(f"PDF generated: {cv_id}", extra={"user_id": user.user_id})

        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={cv.title}.pdf"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation error: {str(e)}", extra={"cv_id": cv_id, "user_id": user.user_id, "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
