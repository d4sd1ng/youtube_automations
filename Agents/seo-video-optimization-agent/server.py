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

from app import SEOVideoOptimizationService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="SEO Video Optimization API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create service instance
seo_service = SEOVideoOptimizationService()

# Pydantic models for request validation
class VideoData(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    keyPoints: Optional[List[str]] = None
    callToAction: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    contentType: Optional[str] = None

class ConfigData(BaseModel):
    language: Optional[str] = None
    maxDescriptionLength: Optional[int] = None
    maxTitleLength: Optional[int] = None
    maxTags: Optional[int] = None
    targetKeywords: Optional[List[str]] = None
    excludeWords: Optional[List[str]] = None

class GenerateLongFormDescriptionRequest(BaseModel):
    videoData: VideoData
    config: Optional[ConfigData] = None

class GenerateShortsDescriptionRequest(BaseModel):
    videoData: VideoData
    config: Optional[ConfigData] = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "SEO Video Optimization API",
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Generate long-form video description endpoint
@app.post("/generate-long-form-description")
async def generate_long_form_video_description(request: GenerateLongFormDescriptionRequest):
    try:
        config_dict = request.config.dict() if request.config else {}
        result = await seo_service.generate_long_form_video_description(
            request.videoData.dict(),
            config_dict
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])

        return result
    except Exception as error:
        logger.error(f"❌ Failed to generate long-form video description: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to generate long-form video description: {str(error)}")

# Generate shorts video description endpoint
@app.post("/generate-shorts-description")
async def generate_shorts_video_description(request: GenerateShortsDescriptionRequest):
    try:
        config_dict = request.config.dict() if request.config else {}
        result = await seo_service.generate_shorts_video_description(
            request.videoData.dict(),
            config_dict
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])

        return result
    except Exception as error:
        logger.error(f"❌ Failed to generate shorts video description: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to generate shorts video description: {str(error)}")

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
                "POST /generate-long-form-description",
                "POST /generate-shorts-description"
            ]
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3009))
    logger.info(f"🚀 SEO Video Optimization Service running on port {port}")
    logger.info(f"📊 Health check: http://localhost:{port}/health")
    logger.info(f"🔧 API Base: http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)