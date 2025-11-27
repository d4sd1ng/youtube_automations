# Content Approval Agent

Python-based agent for automatic content quality checking and approval workflows.

## Features
- Script quality analysis
- Video quality assessment
- Thumbnail evaluation
- Human approval request creation

## API Endpoints
- GET /health - Health check
- POST /approve - Content approval requests

## Installation
1. Build Docker image: docker build -t content-approval-agent .`n2. Run container: docker run -p 5000:5000 content-approval-agent`n
## Usage
Send POST requests to /approve with JSON payload containing:
- type: Content type (script, video, thumbnail, approval_request)
- content: Content to be checked
- channelId: Target channel ID
- approvalType: automatic or manual (optional)
- Other type-specific parameters
