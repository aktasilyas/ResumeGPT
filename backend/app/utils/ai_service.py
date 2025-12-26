"""AI service integration utilities."""
import os
import uuid
from fastapi import HTTPException
from app.core.logging import logger

# Try importing emergent integrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    class UserMessage:
        def __init__(self, text):
            self.text = text


async def get_ai_response(system_message: str, user_message: str) -> str:
    """Get AI response using Gemini via emergent integrations."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")

    if not api_key:
        logger.error("AI service not configured: EMERGENT_LLM_KEY missing")
        raise HTTPException(status_code=500, detail="AI service not configured")

    if LlmChat is None:
        logger.error("AI integration not available in this environment")
        raise HTTPException(
            status_code=501,
            detail="AI integration not available in this environment"
        )

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"cv_{uuid.uuid4().hex[:8]}",
            system_message=system_message
        )
        chat.with_model("gemini", "gemini-3-flash-preview")

        response = await chat.send_message(UserMessage(text=user_message))
        return response

    except Exception as e:
        logger.error(f"AI service error: {str(e)}", extra={"error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
