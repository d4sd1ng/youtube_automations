# Video Processing Agent

Python-based agent for video processing tasks.

## Features
- Frame extraction
- Thumbnail creation
- Video format conversion
- Watermark addition

## API Endpoints
- GET /health - Health check
- POST /process - Video processing tasks

## Installation
1. Build Docker image: docker build -t video-processing-agent .`n2. Run container: docker run -p 5001:5001 video-processing-agent`n
## Usage
Send POST requests to /process with JSON payload containing:
- task: Processing task (extract_frames, create_thumbnail, convert_format, add_watermark)
- videoPath: Path to input video
- Other task-specific parameters
