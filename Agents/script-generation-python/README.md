# Script Generation Agent

Python-based agent for script generation and optimization.

## Features
- Script creation from topics and keywords
- Script optimization for various factors
- Script analysis for quality metrics

## API Endpoints
- GET /health - Health check
- POST /generate - Script generation tasks

## Installation
1. Build Docker image: docker build -t script-generation-agent .`n2. Run container: docker run -p 5005:5005 script-generation-agent`n
## Usage
Send POST requests to /generate with JSON payload containing:
- task: Generation task (create_script, optimize_script, analyze_script)
- Other task-specific parameters
