import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn
import logging

# Add parent directory to path to import app module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import SEOLinkedInOptimizationService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="SEO LinkedIn Optimization API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create service instance
seo_service = SEOLinkedInOptimizationService()

# Pydantic models for request validation
class PostData(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    keyPoints: Optional[List[str]] = None
    callToAction: Optional[str] = None
    industry: Optional[str] = None
    profession: Optional[str] = None

class ConfigData(BaseModel):
    language: Optional[str] = None
    maxDescriptionLength: Optional[int] = None
    maxTitleLength: Optional[int] = None
    maxTags: Optional[int] = None
    targetKeywords: Optional[List[str]] = None
    excludeWords: Optional[List[str]] = None

class GeneratePostDescriptionRequest(BaseModel):
    postData: PostData
    config: Optional[ConfigData] = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "SEO LinkedIn Optimization API",
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Generate LinkedIn post description endpoint
@app.post("/api/seo/linkedin/post")
async def generate_linkedin_post_description(request: GeneratePostDescriptionRequest):
    try:
        if not request.postData:
            raise HTTPException(status_code=400, detail="Post data is required")

        config_dict = request.config.dict() if request.config else {}
        result = await seo_service.generate_linkedin_post_description(
            request.postData.dict(),
            config_dict
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"❌ Failed to generate LinkedIn post description: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to generate LinkedIn post description: {str(error)}")

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
                "POST /api/seo/linkedin/post"
            ]
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3008))
    logger.info(f"🚀 SEO LinkedIn Optimization API running on port {port}")
    logger.info(f"📊 Health check: http://localhost:{port}/health")
    logger.info(f"🔧 API Base: http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)