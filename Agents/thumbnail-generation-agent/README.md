# Thumbnail Generation Python Agent

## Description
The Thumbnail Generation Python Agent is responsible for creating professional, brand-compliant thumbnails for maximum click-through rates and monetization. It generates high-quality thumbnails for YouTube videos, Shorts, and other social media platforms.

## Features
- Professional thumbnail generation with customizable templates
- Support for multiple platforms (YouTube, Shorts, banners)
- Multiple template styles (Premium Clickbait, Cinematic, Bold Minimal, etc.)
- Customizable colors, fonts, and text overlays
- Batch thumbnail generation
- Thumbnail metadata management

## Endpoints

### Health Check
```
GET /health
```

### Generate Thumbnail
```
POST /generate-thumbnail
```
Payload:
```json
{
  "title": "Your Title",
  "subtitle": "Your Subtitle",
  "template": "boldMinimal",
  "platform": "youtube",
  "backgroundColor": "#000000",
  "textColor": "#FFFFFF",
  "accentColor": "#FF0000"
}
```

### Generate Multiple Thumbnails
```
POST /generate-multiple-thumbnails
```
Payload:
```json
{
  "title": "Your Title",
  "subtitle": "Your Subtitle",
  "templates": ["boldMinimal", "cinematic", "gradientImpact"],
  "platform": "youtube"
}
```

### Get Thumbnail
```
GET /get-thumbnail/<thumbnail_id>
```

### List Thumbnails
```
GET /list-thumbnails
```

### Get Available Templates
```
GET /get-available-templates
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