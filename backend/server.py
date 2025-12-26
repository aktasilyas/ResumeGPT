"""
Smart Resume Builder API - Modular FastAPI Application

This is the refactored main application file with improved:
- Security (XSS protection, rate limiting, secure tokens)
- Code organization (modular structure)
- Error handling (specific exceptions, structured logging)
- Best practices (separation of concerns)
"""
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import close_db_connection
from app.core.logging import logger
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import auth, cv, share, ai, pdf, payment

# Create FastAPI app with documentation
app = FastAPI(
    title="Smart Resume Builder API",
    description="Professional CV/Resume builder with AI-powered features",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=settings.rate_limit_per_minute
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(cv.router, prefix="/api")
app.include_router(share.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(pdf.router, prefix="/api")
app.include_router(payment.router, prefix="/api")


@app.get("/api")
async def root():
    """API root endpoint."""
    return {
        "message": "Smart Resume Builder API",
        "version": "2.0.0",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "environment": settings.environment}


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    await close_db_connection()
    logger.info("Application shutdown complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server_new:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    )
