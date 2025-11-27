import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import logging

# Add parent directory to path to import app module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DocumentExportService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Document Export API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create service instance
export_service = DocumentExportService()

# Pydantic models for request validation
class ExportRequest(BaseModel):
    analysisData: Dict[Any, Any]
    options: Optional[Dict[Any, Any]] = None

class CleanupRequest(BaseModel):
    maxAgeDays: Optional[int] = 7

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Document Export API",
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Export to Word endpoint
@app.post("/api/export/word")
async def export_to_word(request: ExportRequest):
    try:
        if not request.analysisData:
            raise HTTPException(status_code=400, detail="Analysis data is required")

        result = await export_service.export_to_word(request.analysisData, request.options)
        return result
    except Exception as error:
        logger.error(f"❌ Failed to export to Word: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to export to Word: {str(error)}")

# Export to PDF endpoint
@app.post("/api/export/pdf")
async def export_to_pdf(request: ExportRequest):
    try:
        if not request.analysisData:
            raise HTTPException(status_code=400, detail="Analysis data is required")

        result = await export_service.export_to_pdf(request.analysisData, request.options)
        return result
    except Exception as error:
        logger.error(f"❌ Failed to export to PDF: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to export to PDF: {str(error)}")

# Export to both formats endpoint
@app.post("/api/export/both")
async def export_to_both(request: ExportRequest):
    try:
        if not request.analysisData:
            raise HTTPException(status_code=400, detail="Analysis data is required")

        result = await export_service.export_both(request.analysisData, request.options)
        return result
    except Exception as error:
        logger.error(f"❌ Failed to export to both formats: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to export to both formats: {str(error)}")

# Get exported files endpoint
@app.get("/api/export/files")
async def get_exported_files():
    try:
        files = export_service.get_exported_files()
        return files
    except Exception as error:
        logger.error(f"❌ Failed to get exported files: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to get exported files: {str(error)}")

# Cleanup old files endpoint
@app.post("/api/export/cleanup")
async def cleanup_old_files(request: CleanupRequest):
    try:
        deleted_count = export_service.cleanup_old_files(request.maxAgeDays)
        return {
            "success": True,
            "deletedCount": deleted_count,
            "message": f"Deleted {deleted_count} old files"
        }
    except Exception as error:
        logger.error(f"❌ Failed to cleanup old files: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to cleanup old files: {str(error)}")

# Serve exported files
from fastapi.staticfiles import StaticFiles
app.mount("/exports", StaticFiles(directory=str(export_service.export_dir)), name="exports")

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
                "POST /api/export/word",
                "POST /api/export/pdf",
                "POST /api/export/both",
                "GET /api/export/files",
                "POST /api/export/cleanup",
                "GET /exports/*"
            ]
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3011))
    logger.info(f"🚀 Document Export API running on port {port}")
    logger.info(f"📊 Health check: http://localhost:{port}/health")
    logger.info(f"🔧 API Base: http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)