"""Application configuration and settings."""
import os
import secrets
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')


class Settings(BaseModel):
    """Application settings."""

    # Database
    mongo_url: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name: str = os.getenv("DB_NAME", "resume_gpt_dev")

    # Environment
    environment: str = os.getenv("ENV", "development")

    # Security
    session_secret: str = os.getenv("SESSION_SECRET", secrets.token_urlsafe(32))
    session_expire_days: int = 7

    # External Services
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    google_client_id: str = os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "")
    stripe_api_key: str = os.getenv("STRIPE_API_KEY", "")
    emergent_llm_key: str = os.getenv("EMERGENT_LLM_KEY", "")

    # CORS
    cors_origins: list = [
        "https://smart-resume-66.preview.emergentagent.com",
        "http://localhost:3000"
    ]

    # Subscription
    subscription_price: float = 4.99
    subscription_currency: str = "usd"
    subscription_duration_days: int = 30

    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_ai_per_minute: int = 10

    class Config:
        case_sensitive = False


settings = Settings()
