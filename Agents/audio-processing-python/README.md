# Audio Processing Agent

Python-based agent for audio processing tasks.

## Features
- Audio format conversion
- Audio extraction from video
- Audio quality analysis
- Audio effects addition

## API Endpoints
- GET /health - Health check
- POST /process - Audio processing tasks

## Installation
1. Build Docker image: docker build -t audio-processing-agent .`n2. Run container: docker run -p 5003:5003 audio-processing-agent`n
## Usage
Send POST requests to /process with JSON payload containing:
- task: Processing task (convert_format, extract_audio, analyze_quality, add_effects)
- audioPath: Path to input audio file
- Other task-specific parameters
