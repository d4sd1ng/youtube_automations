# SEO Optimization API Reference

## Base URL
```
http://localhost:3006
```

## Authentication
All API endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check
```
GET /health
```
Returns the health status of the service.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Channel SEO

#### Generate Channel Description
```
POST /api/seo/channel/description
```
Generates an SEO-optimized channel description.

**Request Body:**
```json
{
  "channelData": {
    "channelName": "string",
    "description": "string",
    "niche": "string",
    "targetAudience": "string"
  },
  "config": {
    "language": "string",
    "maxDescriptionLength": "number",
    "maxTitleLength": "number",
    "maxTags": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "description": "string",
  "keywords": ["string"],
  "tags": ["string"],
  "title": "string"
}
```

#### Generate Channel Keywords
```
POST /api/seo/channel/keywords
```
Generates SEO-optimized keywords for a channel.

**Request Body:**
```json
{
  "channelData": {
    "channelName": "string",
    "description": "string",
    "niche": "string",
    "targetAudience": "string"
  },
  "config": {
    "language": "string",
    "maxKeywords": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "keywords": ["string"],
  "primaryKeywords": ["string"],
  "longTailKeywords": ["string"]
}
```

### Video SEO

#### Generate Long-Form Video Description
```
POST /api/seo/video/long-form
```
Generates an SEO-optimized description for long-form videos.

**Request Body:**
```json
{
  "videoData": {
    "title": "string",
    "description": "string",
    "contentType": "string",
    "keywords": ["string"]
  },
  "config": {
    "language": "string",
    "maxDescriptionLength": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "description": "string",
  "tags": ["string"],
  "title": "string"
}
```

#### Generate Shorts Video Description
```
POST /api/seo/video/shorts
```
Generates an SEO-optimized description for YouTube Shorts.

**Request Body:**
```json
{
  "videoData": {
    "title": "string",
    "description": "string",
    "contentType": "string",
    "keywords": ["string"]
  },
  "config": {
    "language": "string",
    "maxDescriptionLength": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "description": "string",
  "tags": ["string"],
  "title": "string"
}
```

### LinkedIn SEO

#### Generate LinkedIn Post Description
```
POST /api/seo/linkedin/post
```
Generates an SEO-optimized description for LinkedIn posts.

**Request Body:**
```json
{
  "postData": {
    "topic": "string",
    "tone": "string",
    "keywords": ["string"]
  },
  "config": {
    "language": "string",
    "maxDescriptionLength": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "description": "string",
  "tags": ["string"],
  "title": "string"
}
```

### Comprehensive SEO Analysis

#### Perform Comprehensive SEO Analysis
```
POST /api/seo/analysis/comprehensive
```
Performs a comprehensive SEO keyword analysis.

**Request Body:**
```json
{
  "topic": "string",
  "options": {
    "language": "string",
    "maxKeywords": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "primaryKeywords": ["string"],
  "relatedKeywords": ["string"],
  "longTailKeywords": ["string"],
  "allKeywords": ["string"]
}
```