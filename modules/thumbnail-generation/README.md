# Thumbnail Generation Service Module

A standalone thumbnail generation module for creating professional, brand-consistent thumbnails with high click-through rates.

## Features

- Generate professional thumbnails for YouTube, Shorts, and other platforms
- Multiple premium templates (Clickbait, Cinematic, Bold Minimal, etc.)
- Customizable text overlay with styling options
- Branding integration (logos, watermarks)
- Configurable dimensions and color schemes
- RESTful API for easy integration
- Standalone server mode

## Installation

```bash
npm install @agents/thumbnail-generation
```

## Usage

### As a Library

```javascript
const ThumbnailGenerationService = require('@agents/thumbnail-generation');

// Initialize service
const thumbnailService = new ThumbnailGenerationService({
  thumbnailsDir: './data/thumbnails' // Optional custom directory
});

// Generate a thumbnail
const result = await thumbnailService.generateThumbnail({
  title: 'Amazing Video Title',
  subtitle: 'Engaging subtitle here',
  template: 'boldMinimal',
  platform: 'youtube'
});

console.log('Thumbnail generated at:', result.path);
```

### As a Standalone API Service

```bash
npm start
```

The service will start on port 3002 by default.

## API Endpoints

- `GET /health` - Health check
- `POST /api/thumbnails/generate` - Generate a new thumbnail
- `GET /api/thumbnails/templates` - Get available templates
- `GET /api/thumbnails/config` - Get current configuration
- `POST /api/thumbnails/config` - Update configuration

## Configuration

The service can be configured through the configuration object. Key configuration options include:

- **Dimensions**: Standard sizes for different platforms
- **Templates**: Predefined design templates
- **Fonts**: Font families and sizes
- **Colors**: Color palette for consistent branding
- **Effects**: Visual effects like shadows and glows
- **Branding**: Logo and watermark settings

## Environment Variables

- `PORT` - Port to run the server on (default: 3002)
- `NODE_ENV` - Environment (development/production)

## Template Types

1. **Premium Clickbait** - High-impact design for maximum click-through rates
2. **Cinematic Design** - Film-style design for professional content
3. **Bold Minimal** - Clean, minimal design with strong visual impact
4. **Dynamic Split** - Dynamic split-screen design with motion
5. **Gradient Impact** - Strong gradient with maximum visual impact

## Monetization Focus

This service is designed with monetization in mind:
- Templates optimized for high click-through rates
- Branding integration for consistent channel identity
- Professional quality that increases viewer engagement
- Configurable for different content categories and priorities