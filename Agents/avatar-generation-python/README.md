# Avatar Generation Python Agent

## Description
The Avatar Generation Python Agent is a service for creating AI avatars with lip sync and background removal capabilities. It supports various avatar types, voice options, and cloud integration for fast delivery.

## Features
- AI avatar creation with customizable parameters
- Lip sync and background removal processing
- Multiple avatar types (head-only, upper body, full person)
- Voice customization options
- Job queue management and progress tracking
- Cloud storage integration (AWS S3)
- CDN support for fast delivery
- Statistics and monitoring

## Endpoints

### Health Check
```
GET /health
```

### Create Avatar
```
POST /create-avatar
```
Payload:
```json
{
  "type": "head_only|upper_body|full_person",
  "name": "Avatar Name",
  "voiceSettings": {
    "language": "de-DE",
    "gender": "male|female",
    "voice": "Hans|Anna"
  },
  "appearance": {
    "hairColor": "brown",
    "eyeColor": "blue"
  },
  "userId": "user123"
}
```

### Process Video
```
POST /process-video
```
Payload:
```json
{
  "avatarId": "avatar123",
  "text": "Hello, world!",
  "audioFile": "path/to/audio.wav",
  "outputPath": "path/to/output.mp4",
  "backgroundImage": "path/to/background.jpg"
}
```

### Get Job Status
```
GET /job-status/<job_id>
```

### List Jobs
```
GET /list-jobs?status=completed&type=head_only
```

### Get Statistics
```
GET /stats
```

### Get Avatar Types
```
GET /avatar-types
```

### Get Voice Options
```
GET /voice-options
```

### Get Model Status
```
GET /model-status
```

### Download Models
```
POST /download-models
```
Payload:
```json
{
  "models": ["lip_sync", "facial_expressions"],
  "priority": "normal|high"
}
```

### Get Download Status
```
GET /download-status/<job_id>
```

### Upload User Data
```
POST /upload-user-data
```
Payload:
```json
{
  "dataType": "images|videos",
  "files": ["file1.jpg", "file2.mp4"],
  "userId": "user123"
}
```

### Confirm Upload
```
POST /confirm-upload
```
Payload:
```json
{
  "sessionId": "upload123",
  "status": "completed"
}
```

## Installation
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set environment variables (optional):
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=eu-central-1
   AWS_S3_BUCKET=your_bucket_name
   CDN_BASE_URL=https://your-cdn.com
   ```

3. Run the agent:
   ```
   python app.py
   ```

## Usage
The agent runs on port 5000 by default.