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

from app import SEOChannelOptimizationService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="SEO Channel Optimization API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create service instance
seo_channel_service = SEOChannelOptimizationService()

# Pydantic models for request validation
class ChannelData(BaseModel):
    channelName: Optional[str] = None
    description: Optional[str] = None
    niche: Optional[str] = None
    targetAudience: Optional[str] = None

class ConfigData(BaseModel):
    language: Optional[str] = None
    maxDescriptionLength: Optional[int] = None
    maxTitleLength: Optional[int] = None
    maxTags: Optional[int] = None
    targetKeywords: Optional[List[str]] = None
    excludeWords: Optional[List[str]] = None

class GenerateDescriptionRequest(BaseModel):
    channelData: ChannelData
    config: Optional[ConfigData] = None

class GenerateKeywordsRequest(BaseModel):
    channelData: ChannelData
    config: Optional[ConfigData] = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "SEO Channel Optimization API",
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Generate channel description endpoint
@app.post("/generate-description")
async def generate_channel_description(request: GenerateDescriptionRequest):
    try:
        config_dict = request.config.dict() if request.config else {}
        result = await seo_channel_service.generate_channel_description(
            request.channelData.dict(),
            config_dict
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])

        return result
    except Exception as error:
        logger.error(f"❌ Failed to generate channel description: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to generate channel description: {str(error)}")

# Generate channel keywords endpoint
@app.post("/generate-keywords")
async def generate_channel_keywords(request: GenerateKeywordsRequest):
    try:
        config_dict = request.config.dict() if request.config else {}
        result = await seo_channel_service.generate_channel_keywords(
            request.channelData.dict(),
            config_dict
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])

        return result
    except Exception as error:
        logger.error(f"❌ Failed to generate channel keywords: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to generate channel keywords: {str(error)}")

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
                "POST /generate-description",
                "POST /generate-keywords"
            ]
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3003))
    logger.info(f"🚀 SEO Channel Optimization Service running on port {port}")
    logger.info(f"📊 Health check: http://localhost:{port}/health")
    logger.info(f"🔧 API Base: http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)