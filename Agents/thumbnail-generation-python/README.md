# Thumbnail Generation Agent

Python-based agent for thumbnail generation and analysis.

## Features
- Thumbnail creation from images
- Thumbnail creation from text
- Overlay addition to thumbnails
- Thumbnail quality analysis

## API Endpoints
- GET /health - Health check
- POST /generate - Thumbnail generation tasks

## Installation
1. Build Docker image: docker build -t thumbnail-generation-agent .`n2. Run container: docker run -p 5002:5002 thumbnail-generation-agent`n
## Usage
Send POST requests to /generate with JSON payload containing:
- task: Generation task (create_from_image, create_from_text, add_overlay, analyze_quality)
- Other task-specific parameters
