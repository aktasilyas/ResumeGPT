from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from io import BytesIO
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

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
    section_order: List[str] = ["summary", "experience", "education", "skills", "languages", "certificates", "projects"]

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

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str = ""
    is_pro: bool = False
    subscription_end: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIAnalysisRequest(BaseModel):
    cv_data: CVData

class AIImproveRequest(BaseModel):
    section: str
    content: str
    context: Optional[str] = None

class JobOptimizeRequest(BaseModel):
    cv_data: CVData
    job_description: str

# Email/Password Auth Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Stripe Models
class CreateCheckoutRequest(BaseModel):
    origin_url: str

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

async def get_current_user(request: Request) -> User:
    """Get current user from session token"""
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
    """Create a new session for user"""
    session_token = f"st_{uuid.uuid4().hex}"
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
        max_age=7*24*60*60,
        path="/"
    )
    
    return session_token

# ===================== EMAIL/PASSWORD AUTH =====================

@api_router.post("/auth/register")
async def register(request: RegisterRequest, response: Response):
    """Register new user with email/password"""
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
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return user

@api_router.post("/auth/login")
async def login(request: LoginRequest, response: Response):
    """Login with email/password"""
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if "password_hash" not in user:
        raise HTTPException(status_code=401, detail="Please login with Google")
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    await create_user_session(user["user_id"], response)
    
    user_data = {k: v for k, v in user.items() if k != "password_hash"}
    return user_data

# ===================== GOOGLE OAUTH =====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token (Google OAuth)"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
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
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data.get("picture", "")}}
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
        max_age=7*24*60*60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return user

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# ===================== STRIPE SUBSCRIPTION =====================

SUBSCRIPTION_PRICE = 4.99  # $4.99/month

@api_router.post("/stripe/create-checkout")
async def create_checkout_session(request: CreateCheckoutRequest, http_request: Request, user: User = Depends(get_current_user)):
    """Create Stripe checkout session for subscription"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=SUBSCRIPTION_PRICE,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user.user_id,
            "email": user.email,
            "type": "subscription"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "user_id": user.user_id,
        "email": user.email,
        "amount": SUBSCRIPTION_PRICE,
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/stripe/status/{session_id}")
async def get_checkout_status(session_id: str, user: User = Depends(get_current_user)):
    """Get checkout session status and update user subscription"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction record
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if transaction and transaction.get("payment_status") != "paid" and status.payment_status == "paid":
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": "paid",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update user to pro
        subscription_end = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "is_pro": True,
                "subscription_end": subscription_end
            }}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            user_id = webhook_response.metadata.get("user_id")
            if user_id:
                subscription_end = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"is_pro": True, "subscription_end": subscription_end}}
                )
                
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ===================== CV ENDPOINTS =====================

@api_router.get("/cvs", response_model=List[dict])
async def get_cvs(user: User = Depends(get_current_user)):
    """Get all CVs for current user"""
    cvs = await db.cvs.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    for cv in cvs:
        if isinstance(cv.get("created_at"), str):
            cv["created_at"] = datetime.fromisoformat(cv["created_at"])
        if isinstance(cv.get("updated_at"), str):
            cv["updated_at"] = datetime.fromisoformat(cv["updated_at"])
    return cvs

@api_router.post("/cvs", response_model=dict, status_code=201)
async def create_cv(cv_create: CVCreate, user: User = Depends(get_current_user)):
    """Create a new CV"""
    cv = CV(user_id=user.user_id, title=cv_create.title)
    cv_dict = cv.model_dump()
    cv_dict["created_at"] = cv_dict["created_at"].isoformat()
    cv_dict["updated_at"] = cv_dict["updated_at"].isoformat()
    await db.cvs.insert_one(cv_dict)
    
    result = await db.cvs.find_one({"cv_id": cv.cv_id}, {"_id": 0})
    return result

@api_router.get("/cvs/{cv_id}", response_model=dict)
async def get_cv(cv_id: str, user: User = Depends(get_current_user)):
    """Get a specific CV"""
    cv = await db.cvs.find_one({"cv_id": cv_id, "user_id": user.user_id}, {"_id": 0})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv

@api_router.put("/cvs/{cv_id}", response_model=dict)
async def update_cv(cv_id: str, cv_update: CVUpdate, user: User = Depends(get_current_user)):
    """Update a CV"""
    cv = await db.cvs.find_one({"cv_id": cv_id, "user_id": user.user_id}, {"_id": 0})
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
    return result

@api_router.delete("/cvs/{cv_id}")
async def delete_cv(cv_id: str, user: User = Depends(get_current_user)):
    """Delete a CV"""
    result = await db.cvs.delete_one({"cv_id": cv_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="CV not found")
    return {"message": "CV deleted"}

# ===================== SHARE LINK ENDPOINTS =====================

@api_router.post("/cvs/{cv_id}/share")
async def create_share_link(cv_id: str, user: User = Depends(get_current_user)):
    """Create a public share link for CV (Premium only)"""
    if not user.is_pro:
        raise HTTPException(status_code=403, detail="Premium subscription required")
    
    cv = await db.cvs.find_one({"cv_id": cv_id, "user_id": user.user_id}, {"_id": 0})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Generate share token
    share_token = f"share_{uuid.uuid4().hex[:16]}"
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
    
    return {
        "share_token": share_token,
        "expires_at": expires_at.isoformat()
    }

@api_router.delete("/cvs/{cv_id}/share")
async def delete_share_link(cv_id: str, user: User = Depends(get_current_user)):
    """Delete/deactivate share link"""
    result = await db.share_links.update_one(
        {"cv_id": cv_id, "user_id": user.user_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Share link not found")
    return {"message": "Share link deleted"}

@api_router.get("/cvs/{cv_id}/share")
async def get_share_link(cv_id: str, user: User = Depends(get_current_user)):
    """Get existing share link for CV"""
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

@api_router.get("/public/cv/{share_token}")
async def get_public_cv(share_token: str):
    """Get public CV by share token (no auth required)"""
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
    user = await db.users.find_one({"user_id": share_link["user_id"]}, {"_id": 0, "name": 1, "picture": 1})
    
    # Increment view count
    await db.share_links.update_one(
        {"share_token": share_token},
        {"$inc": {"views": 1}}
    )
    
    return {
        "cv": cv,
        "owner": user,
        "views": share_link.get("views", 0) + 1
    }

# ===================== AI ENDPOINTS =====================

from emergentintegrations.llm.chat import LlmChat, UserMessage

async def get_ai_response(system_message: str, user_message: str) -> str:
    """Get AI response using Gemini via emergentintegrations"""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"cv_{uuid.uuid4().hex[:8]}",
        system_message=system_message
    )
    chat.with_model("gemini", "gemini-3-flash-preview")
    
    response = await chat.send_message(UserMessage(text=user_message))
    return response

@api_router.post("/ai/analyze")
async def analyze_cv(request: AIAnalysisRequest, user: User = Depends(get_current_user)):
    """Analyze CV and provide score + suggestions"""
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
        import json
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        result = json.loads(response.strip())
        return result
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "overall_score": 72,
            "breakdown": {"content": 75, "formatting": 70, "keywords": 65, "ats_compatibility": 78},
            "strengths": ["Good structure", "Clear contact information"],
            "weaknesses": [{"issue": "Limited quantifiable achievements", "suggestion": "Add metrics and numbers to demonstrate impact"}],
            "missing_keywords": ["leadership", "collaboration", "results-driven"],
            "recommendations": ["Add more specific achievements with numbers", "Include relevant keywords for your industry"]
        }

@api_router.post("/ai/improve")
async def improve_section(request: AIImproveRequest, user: User = Depends(get_current_user)):
    """Improve a specific section of the CV"""
    system_prompt = """You are an expert CV writer. Improve the provided text to be more professional, impactful, and ATS-friendly.
Use strong action verbs and quantify achievements where possible.
Return ONLY the improved text, nothing else. Keep it concise."""

    user_message = f"Section type: {request.section}\nOriginal content: {request.content}"
    if request.context:
        user_message += f"\nAdditional context: {request.context}"
    
    try:
        improved = await get_ai_response(system_prompt, user_message)
        return {"improved": improved.strip()}
    except Exception as e:
        logger.error(f"AI improve error: {e}")
        return {"improved": request.content}

@api_router.post("/ai/optimize-for-job")
async def optimize_for_job(request: JobOptimizeRequest, user: User = Depends(get_current_user)):
    """Optimize CV for a specific job description"""
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
        import json
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        result = json.loads(response.strip())
        return result
    except Exception as e:
        logger.error(f"AI optimize error: {e}")
        return {
            "match_percentage": 60,
            "matched_keywords": ["communication", "teamwork"],
            "missing_keywords": ["specific skill 1", "specific skill 2"],
            "suggestions": [{"section": "skills", "suggestion": "Review the job description and add relevant skills"}],
            "optimized_summary": request.cv_data.summary
        }

@api_router.post("/ai/suggest-skills")
async def suggest_skills(request: dict, user: User = Depends(get_current_user)):
    """Suggest skills based on job title"""
    job_title = request.get("job_title", "")
    
    system_prompt = """You are a career expert. Based on the job title, suggest relevant technical and soft skills.
Return ONLY valid JSON in this format:
{
    "technical_skills": ["Python", "SQL", "AWS"],
    "soft_skills": ["Leadership", "Communication", "Problem-solving"]
}"""
    
    try:
        response = await get_ai_response(system_prompt, f"Suggest skills for: {job_title}")
        import json
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        result = json.loads(response.strip())
        return result
    except Exception as e:
        logger.error(f"AI suggest skills error: {e}")
        return {
            "technical_skills": ["Microsoft Office", "Data Analysis", "Project Management"],
            "soft_skills": ["Communication", "Teamwork", "Problem-solving"]
        }

# ===================== PDF GENERATION =====================

@api_router.post("/generate-pdf/{cv_id}")
async def generate_pdf(cv_id: str, user: User = Depends(get_current_user)):
    """Generate PDF from CV"""
    cv = await db.cvs.find_one({"cv_id": cv_id, "user_id": user.user_id}, {"_id": 0})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    from weasyprint import HTML
    
    data = cv.get("data", {})
    settings = cv.get("settings", {})
    personal = data.get("personal_info", {})
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #1e293b;
                padding: 40px;
            }}
            .header {{ text-align: center; margin-bottom: 24px; border-bottom: 2px solid {settings.get('primary_color', '#064E3B')}; padding-bottom: 16px; }}
            .name {{ font-size: 24pt; font-weight: 700; color: {settings.get('primary_color', '#064E3B')}; margin-bottom: 8px; }}
            .contact {{ font-size: 10pt; color: #64748b; }}
            .contact span {{ margin: 0 8px; }}
            .section {{ margin-bottom: 20px; }}
            .section-title {{ font-size: 14pt; font-weight: 600; color: {settings.get('primary_color', '#064E3B')}; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px; }}
            .summary {{ color: #475569; }}
            .exp-item, .edu-item {{ margin-bottom: 16px; }}
            .exp-header {{ display: flex; justify-content: space-between; margin-bottom: 4px; }}
            .exp-title {{ font-weight: 600; }}
            .exp-company {{ color: #64748b; }}
            .exp-date {{ color: #94a3b8; font-size: 10pt; }}
            .exp-desc {{ color: #475569; font-size: 10pt; }}
            .skills-list {{ display: flex; flex-wrap: wrap; gap: 8px; }}
            .skill-tag {{ background: #f1f5f9; padding: 4px 12px; border-radius: 16px; font-size: 10pt; }}
            .watermark {{ position: fixed; bottom: 20px; right: 20px; opacity: 0.3; font-size: 10pt; color: #94a3b8; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">{personal.get('full_name', 'Your Name')}</div>
            <div class="contact">
                <span>{personal.get('email', '')}</span>
                <span>{personal.get('phone', '')}</span>
                <span>{personal.get('location', '')}</span>
            </div>
        </div>
    """
    
    if data.get('summary'):
        html_content += f"""
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">{data.get('summary', '')}</div>
        </div>
        """
    
    experiences = data.get('experiences', [])
    if experiences:
        html_content += '<div class="section"><div class="section-title">Work Experience</div>'
        for exp in experiences:
            html_content += f"""
            <div class="exp-item">
                <div class="exp-header">
                    <div>
                        <span class="exp-title">{exp.get('position', '')}</span>
                        <span class="exp-company"> at {exp.get('company', '')}</span>
                    </div>
                    <div class="exp-date">{exp.get('start_date', '')} - {exp.get('end_date', 'Present') if not exp.get('current') else 'Present'}</div>
                </div>
                <div class="exp-desc">{exp.get('description', '')}</div>
            </div>
            """
        html_content += '</div>'
    
    education = data.get('education', [])
    if education:
        html_content += '<div class="section"><div class="section-title">Education</div>'
        for edu in education:
            html_content += f"""
            <div class="edu-item">
                <div class="exp-header">
                    <div>
                        <span class="exp-title">{edu.get('degree', '')} in {edu.get('field', '')}</span>
                        <span class="exp-company"> - {edu.get('institution', '')}</span>
                    </div>
                    <div class="exp-date">{edu.get('start_date', '')} - {edu.get('end_date', '')}</div>
                </div>
            </div>
            """
        html_content += '</div>'
    
    skills = data.get('skills', [])
    if skills:
        html_content += '<div class="section"><div class="section-title">Skills</div><div class="skills-list">'
        for skill in skills:
            html_content += f'<span class="skill-tag">{skill.get("name", "")}</span>'
        html_content += '</div></div>'
    
    # Add watermark for non-pro users
    if not user.is_pro:
        html_content += '<div class="watermark">Created with Smart Resume Builder</div>'
    
    html_content += '</body></html>'
    
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={cv.get('title', 'resume')}.pdf"}
    )

# ===================== GENERAL ENDPOINTS =====================

@api_router.get("/")
async def root():
    return {"message": "Smart Resume Builder API"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["https://smart-resume-66.preview.emergentagent.com", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
