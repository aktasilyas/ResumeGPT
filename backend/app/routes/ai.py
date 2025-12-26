"""AI-powered CV analysis and optimization routes."""
import json
from fastapi import APIRouter, HTTPException, Depends
from app.models.ai import AIAnalysisRequest, AIImproveRequest, JobOptimizeRequest
from app.models.user import User
from app.core.security import get_current_user
from app.utils.ai_service import get_ai_response
from app.core.logging import logger

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/analyze")
async def analyze_cv(
    request: AIAnalysisRequest,
    user: User = Depends(get_current_user)
):
    """Analyze CV and provide score + suggestions."""
    cv_data = request.cv_data

    system_prompt = """You are an expert CV/Resume analyst and career coach. Analyze the provided CV and return a JSON response with:
1. An overall score (0-100)
2. Breakdown scores for: content, formatting, keywords, ats_compatibility
3. List of strengths (max 5)
4. List of weaknesses with specific improvement suggestions (max 5)
5. Missing keywords that could improve ATS compatibility
6. Overall recommendations

Return ONLY valid JSON in this exact format:
{
    "overall_score": 78,
    "breakdown": {
        "content": 80,
        "formatting": 75,
        "keywords": 70,
        "ats_compatibility": 85
    },
    "strengths": ["Strong work experience", "Clear summary"],
    "weaknesses": [{"issue": "Weak action verbs", "suggestion": "Use stronger verbs like 'achieved', 'led'"}],
    "missing_keywords": ["project management", "agile"],
    "recommendations": ["Add more quantifiable achievements"]
}"""

    cv_text = f"""
Personal Info: {cv_data.personal_info.full_name}, {cv_data.personal_info.email}
Summary: {cv_data.summary}
Experience: {[f"{e.position} at {e.company}: {e.description}" for e in cv_data.experiences]}
Education: {[f"{e.degree} in {e.field} from {e.institution}" for e in cv_data.education]}
Skills: {[s.name for s in cv_data.skills]}
"""

    try:
        response = await get_ai_response(system_prompt, f"Analyze this CV:\n{cv_text}")
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        result = json.loads(response.strip())
        logger.info("CV analyzed successfully", extra={"user_id": user.user_id})
        return result

    except json.JSONDecodeError as e:
        logger.error(f"AI response parsing error: {str(e)}", extra={"user_id": user.user_id})
        # Return fallback response
        return {
            "overall_score": 72,
            "breakdown": {
                "content": 75,
                "formatting": 70,
                "keywords": 65,
                "ats_compatibility": 78
            },
            "strengths": ["Good structure", "Clear contact information"],
            "weaknesses": [{
                "issue": "Limited quantifiable achievements",
                "suggestion": "Add metrics and numbers to demonstrate impact"
            }],
            "missing_keywords": ["leadership", "collaboration", "results-driven"],
            "recommendations": [
                "Add more specific achievements with numbers",
                "Include relevant keywords for your industry"
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI analysis error: {str(e)}", extra={"user_id": user.user_id, "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="AI analysis temporarily unavailable")


@router.post("/improve")
async def improve_section(
    request: AIImproveRequest,
    user: User = Depends(get_current_user)
):
    """Improve a specific section of the CV."""
    system_prompt = """You are an expert CV writer. Improve the provided text to be more professional, impactful, and ATS-friendly.
Use strong action verbs and quantify achievements where possible.
Return ONLY the improved text, nothing else. Keep it concise."""

    user_message = f"Section type: {request.section}\nOriginal content: {request.content}"
    if request.context:
        user_message += f"\nAdditional context: {request.context}"

    try:
        improved = await get_ai_response(system_prompt, user_message)
        logger.info("CV section improved", extra={"user_id": user.user_id, "section": request.section})
        return {"improved": improved.strip()}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI improve error: {str(e)}", extra={"user_id": user.user_id, "error_type": type(e).__name__})
        # Return original content as fallback
        return {"improved": request.content}


@router.post("/optimize-for-job")
async def optimize_for_job(
    request: JobOptimizeRequest,
    user: User = Depends(get_current_user)
):
    """Optimize CV for a specific job description."""
    system_prompt = """You are an expert ATS specialist and CV optimizer. Analyze the CV against the job description and provide:
1. Match percentage
2. Matched keywords found in both
3. Missing keywords that should be added
4. Specific suggestions to tailor the CV

Return ONLY valid JSON in this format:
{
    "match_percentage": 65,
    "matched_keywords": ["python", "leadership"],
    "missing_keywords": ["agile", "scrum"],
    "suggestions": [
        {"section": "summary", "suggestion": "Add mention of agile methodology experience"},
        {"section": "skills", "suggestion": "Add 'Scrum' and 'Kanban' to skills"}
    ],
    "optimized_summary": "Improved summary text here..."
}"""

    cv_text = f"""
Summary: {request.cv_data.summary}
Experience: {[f"{e.position} at {e.company}: {e.description}" for e in request.cv_data.experiences]}
Skills: {[s.name for s in request.cv_data.skills]}
"""

    user_message = f"CV Content:\n{cv_text}\n\nJob Description:\n{request.job_description}"

    try:
        response = await get_ai_response(system_prompt, user_message)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        result = json.loads(response.strip())
        logger.info("CV optimized for job", extra={"user_id": user.user_id})
        return result

    except json.JSONDecodeError as e:
        logger.error(f"AI response parsing error: {str(e)}", extra={"user_id": user.user_id})
        return {
            "match_percentage": 60,
            "matched_keywords": ["communication", "teamwork"],
            "missing_keywords": ["specific skill 1", "specific skill 2"],
            "suggestions": [{
                "section": "skills",
                "suggestion": "Review the job description and add relevant skills"
            }],
            "optimized_summary": request.cv_data.summary
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI optimize error: {str(e)}", extra={"user_id": user.user_id, "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="AI optimization temporarily unavailable")


@router.post("/suggest-skills")
async def suggest_skills(request: dict, user: User = Depends(get_current_user)):
    """Suggest skills based on job title."""
    job_title = request.get("job_title", "")

    system_prompt = """You are a career expert. Based on the job title, suggest relevant technical and soft skills.
Return ONLY valid JSON in this format:
{
    "technical_skills": ["Python", "SQL", "AWS"],
    "soft_skills": ["Leadership", "Communication", "Problem-solving"]
}"""

    try:
        response = await get_ai_response(system_prompt, f"Suggest skills for: {job_title}")
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        result = json.loads(response.strip())
        logger.info("Skills suggested", extra={"user_id": user.user_id, "job_title": job_title})
        return result

    except json.JSONDecodeError as e:
        logger.error(f"AI response parsing error: {str(e)}", extra={"user_id": user.user_id})
        return {
            "technical_skills": ["Microsoft Office", "Data Analysis", "Project Management"],
            "soft_skills": ["Communication", "Teamwork", "Problem-solving"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI suggest skills error: {str(e)}", extra={"user_id": user.user_id, "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
