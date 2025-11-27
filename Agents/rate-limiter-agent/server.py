import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import logging

# Add parent directory to path to import app module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import RateLimitingMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Rate Limiter API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create middleware instance
rate_limiting_middleware = RateLimitingMiddleware()

# Pydantic models for request validation
class CustomLimitRequest(BaseModel):
    window_ms: int
    max_requests: int
    message: Optional[str] = "Rate limit überschritten"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Rate Limiter API",
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Test general limiter endpoint
@app.get("/test/general")
async def test_general_limiter(request: Request):
    limiter = rate_limiting_middleware.general_limiter()
    result = limiter(request)

    if result["limited"]:
        return JSONResponse(
            status_code=429,
            content={
                "error": result["message"],
                "retry_after": result["retry_after"]
            }
        )

    return {"success": True, "limit_info": result}

# Test strict limiter endpoint
@app.get("/test/strict")
async def test_strict_limiter(request: Request):
    limiter = rate_limiting_middleware.strict_limiter()
    result = limiter(request)

    if result["limited"]:
        return JSONResponse(
            status_code=429,
            content={
                "error": result["message"],
                "retry_after": result["retry_after"]
            }
        )

    return {"success": True, "limit_info": result}

# Test auth limiter endpoint
@app.get("/test/auth")
async def test_auth_limiter(request: Request):
    limiter = rate_limiting_middleware.auth_limiter()
    result = limiter(request)

    if result["limited"]:
        return JSONResponse(
            status_code=429,
            content={
                "error": result["message"],
                "retry_after": result["retry_after"]
            }
        )

    return {"success": True, "limit_info": result}

# Test API limiter endpoint
@app.get("/test/api")
async def test_api_limiter(request: Request):
    limiter = rate_limiting_middleware.api_limiter()
    result = limiter(request)

    if result["limited"]:
        return JSONResponse(
            status_code=429,
            content={
                "error": result["message"],
                "retry_after": result["retry_after"]
            }
        )

    return {"success": True, "limit_info": result}

# Create custom limiter endpoint
@app.post("/custom")
async def create_custom_limiter(custom_limit: CustomLimitRequest, request: Request):
    try:
        limiter = rate_limiting_middleware.custom_limiter(
            custom_limit.window_ms,
            custom_limit.max_requests,
            custom_limit.message
        )
        result = limiter(request)

        if result["limited"]:
            return JSONResponse(
                status_code=429,
                content={
                    "error": result["message"],
                    "retry_after": result["retry_after"]
                }
            )

        return {"success": True, "limit_info": result}
    except Exception as error:
        logger.error(f"❌ Failed to create custom limiter: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to create custom limiter: {str(error)}")

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # Apply security headers
    security_middleware = rate_limiting_middleware.security_headers()
    # In a real implementation, we would pass the request and response objects
    # For now, we'll just add the headers directly
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"

    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": str(exc)}
    )

# 404 handler
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "path": request.url.path,
            "method": request.method,
            "availableEndpoints": [
                "GET /health",
                "GET /test/general",
                "GET /test/strict",
                "GET /test/auth",
                "GET /test/api",
                "POST /custom"
            ]
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3008))
    logger.info(f"🚀 Rate Limiter Service running on port {port}")
    logger.info(f"📊 Health check: http://localhost:{port}/health")
    logger.info(f"🔧 API Base: http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)