# SEO Optimization Python Agent

## Description
The SEO Optimization Python Agent is responsible for optimizing YouTube channels and videos for better search engine visibility. It generates SEO-friendly descriptions, tags, and titles for both long-form content and YouTube Shorts.

## Features
- Channel description generation
- Video description generation (long-form and Shorts)
- Tag generation with comprehensive keyword research
- Title optimization
- Competitor analysis
- Job status tracking
- Optimization history management

## Endpoints

### Health Check
```
GET /health
```

### Execute Task
```
POST /execute-task
```
Payload:
```json
{
  "type": "optimize-channel|optimize-video|generate-tags|optimize-title|analyze-competitors",
  "payload": {}
}
```

### List Optimizations
```
GET /list-optimizations
```

### Get Optimization
```
GET /get-optimization/<optimization_id>
```

### Delete Optimization
```
DELETE /delete-optimization/<optimization_id>
```

### Get Job Status
```
GET /get-job-status/<job_id>
```

### Get Agent Status
```
GET /get-status
```

## Installation
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the agent:
   ```
   python app.py
   ```

## Usage
The agent runs on port 5000 by default.