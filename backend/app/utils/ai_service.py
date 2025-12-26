"""AI service integration utilities using Google Gemini."""
import google.generativeai as genai
from app.core.config import settings
from app.core.logging import logger
from fastapi import HTTPException


# Configure Google Gemini API
if settings.google_api_key:
    genai.configure(api_key=settings.google_api_key)


async def get_ai_response(system_message: str, user_message: str) -> str:
    """Get AI response using Google Gemini API."""
    if not settings.google_api_key:
        logger.error("AI service not configured: GOOGLE_API_KEY missing")
        raise HTTPException(status_code=500, detail="AI service not configured")

    try:
        logger.info("Initializing Gemini model: gemini-pro")

        # Use Gemini Pro for responses
        model = genai.GenerativeModel(
            model_name='gemini-pro',
            system_instruction=system_message
        )

        logger.info("Sending request to Gemini API")
        # Generate response
        response = model.generate_content(user_message)

        if not response or not response.text:
            logger.error("Empty response from Gemini API")
            raise Exception("Empty response from AI service")

        logger.info(f"Received response from Gemini API, length: {len(response.text)}")
        return response.text

    except Exception as e:
        logger.error(f"AI service error: {str(e)}", extra={"error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
