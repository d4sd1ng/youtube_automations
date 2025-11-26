# SEO Optimization Agent

Python-based agent for SEO optimization tasks.

## Features
- Video SEO optimization
- Script SEO optimization
- Keyword analysis and suggestions

## API Endpoints
- GET /health - Health check
- POST /optimize - SEO optimization tasks

## Installation
1. Build Docker image: docker build -t seo-optimization-agent .`n2. Run container: docker run -p 5007:5007 seo-optimization-agent`n
## Usage
Send POST requests to /optimize with JSON payload containing:
- task: Optimization task (optimize_video, optimize_script, analyze_keywords)
- Other task-specific parameters
