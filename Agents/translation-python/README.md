# Translation Agent

Python-based agent for translation tasks.

## Features
- Text translation between languages
- Script translation with formatting preservation
- Language detection

## API Endpoints
- GET /health - Health check
- POST /translate - Translation tasks

## Installation
1. Build Docker image: docker build -t translation-agent .`n2. Run container: docker run -p 5008:5008 translation-agent`n
## Usage
Send POST requests to /translate with JSON payload containing:
- task: Translation task (translate_text, translate_script, detect_language)
- Other task-specific parameters
