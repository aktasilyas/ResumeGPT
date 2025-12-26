"""Rate limiting middleware to prevent API abuse."""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, DefaultDict


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using in-memory storage."""

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: DefaultDict[str, list] = defaultdict(list)
        self.ai_requests: DefaultDict[str, list] = defaultdict(list)

    def _clean_old_requests(self, request_list: list):
        """Remove requests older than 1 minute."""
        cutoff = datetime.now() - timedelta(minutes=1)
        return [req_time for req_time in request_list if req_time > cutoff]

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier from request."""
        # Use session token if available, otherwise IP
        session_token = request.cookies.get("session_token")
        if session_token:
            return f"session_{session_token}"
        return f"ip_{request.client.host if request.client else 'unknown'}"

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health check
        if request.url.path == "/api/health":
            return await call_next(request)

        client_id = self._get_client_id(request)
        current_time = datetime.now()

        # Check AI endpoints with stricter limits
        is_ai_endpoint = "/api/ai/" in request.url.path
        if is_ai_endpoint:
            self.ai_requests[client_id] = self._clean_old_requests(self.ai_requests[client_id])
            ai_limit = 10  # 10 AI requests per minute

            if len(self.ai_requests[client_id]) >= ai_limit:
                raise HTTPException(
                    status_code=429,
                    detail="AI rate limit exceeded. Please try again later."
                )
            self.ai_requests[client_id].append(current_time)

        # General rate limiting
        self.requests[client_id] = self._clean_old_requests(self.requests[client_id])

        if len(self.requests[client_id]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )

        self.requests[client_id].append(current_time)
        response = await call_next(request)
        return response
