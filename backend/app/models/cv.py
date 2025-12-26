"""CV models and schemas."""
import uuid
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional, Dict


class PersonalInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    website: str = ""
    photo_url: str = ""


class Experience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str = ""
    position: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    current: bool = False
    description: str = ""


class Education(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    institution: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""
    description: str = ""


class Skill(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    level: str = "intermediate"
    category: str = "technical"


class Language(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    proficiency: str = "professional"


class Certificate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    issuer: str = ""
    date: str = ""
    url: str = ""


class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    url: str = ""
    technologies: List[str] = []


class CVData(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    experiences: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    languages: List[Language] = []
    certificates: List[Certificate] = []
    projects: List[Project] = []
    section_order: List[str] = [
        "summary", "experience", "education", "skills",
        "languages", "certificates", "projects"
    ]


class CVSettings(BaseModel):
    template: str = "minimal"
    primary_color: str = "#064E3B"
    font_family: str = "Plus Jakarta Sans"
    show_photo: bool = True
    visible_sections: Dict[str, bool] = {
        "summary": True, "experience": True, "education": True,
        "skills": True, "languages": True, "certificates": True, "projects": True
    }


class CV(BaseModel):
    cv_id: str = Field(default_factory=lambda: f"cv_{uuid.uuid4().hex[:12]}")
    user_id: str
    title: str = "Untitled CV"
    data: CVData = Field(default_factory=CVData)
    settings: CVSettings = Field(default_factory=CVSettings)
    is_pro: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CVCreate(BaseModel):
    title: str = "Untitled CV"


class CVUpdate(BaseModel):
    title: Optional[str] = None
    data: Optional[CVData] = None
    settings: Optional[CVSettings] = None
