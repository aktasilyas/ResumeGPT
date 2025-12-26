"""AI request and response models."""
from pydantic import BaseModel
from typing import Optional
from app.models.cv import CVData


class AIAnalysisRequest(BaseModel):
    cv_data: CVData


class AIImproveRequest(BaseModel):
    section: str
    content: str
    context: Optional[str] = None


class JobOptimizeRequest(BaseModel):
    cv_data: CVData
    job_description: str
