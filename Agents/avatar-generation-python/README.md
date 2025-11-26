# Avatar Generation Agent

Python-based agent for avatar generation and management.

## Features
- Avatar creation from images/videos
- Avatar training with custom data
- Avatar status management

## API Endpoints
- GET /health - Health check
- POST /generate - Avatar generation tasks

## Installation
1. Build Docker image: docker build -t avatar-generation-agent .`n2. Run container: docker run -p 5004:5004 avatar-generation-agent`n
## Usage
Send POST requests to /generate with JSON payload containing:
- task: Generation task (create_avatar, train_avatar, get_avatar_status)
- Other task-specific parameters
