"""Database connection and initialization."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.db_name]


async def close_db_connection():
    """Close database connection on shutdown."""
    client.close()
