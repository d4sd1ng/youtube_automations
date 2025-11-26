# @agents/seo-optimization

Service for comprehensive SEO optimization of YouTube channels, videos, and LinkedIn posts with AI-powered content generation.

## Important Notice

This package has been refactored into three separate modules for better modularity and individual usage:

1. [@agents/seo-channel-optimization](../seo-channel-optimization) - For YouTube channel SEO
2. [@agents/seo-video-optimization](../seo-video-optimization) - For YouTube video SEO
3. [@agents/seo-linkedin-optimization](../seo-linkedin-optimization) - For LinkedIn post SEO

Please use the individual packages for better performance and smaller bundle size.

## Installation

```bash
npm install @agents/seo-optimization
```

## Usage

### As a Library

```javascript
const SEOOptimizationService = require('@agents/seo-optimization');

const seoService = new SEOOptimizationService({
  language: 'de',
  maxDescriptionLength: 5000,
  maxTitleLength: 100,
  maxTags: 30
});

// Generate channel description
const channelData = {
  channelName: 'Tech Insights',
  description: 'Technology tutorials and insights',
  niche: 'Software Development',
  targetAudience: 'Developers and tech enthusiasts'
};

const result = await seoService.generateChannelDescription(channelData);
console.log(result);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3006.

## API Endpoints

- `GET /health` - Health check
- `POST /api/seo/channel/description` - Generate channel description
- `POST /api/seo/channel/keywords` - Generate channel keywords
- `POST /api/seo/video/long-form` - Generate long-form video description
- `POST /api/seo/video/shorts` - Generate Shorts video description
- `POST /api/seo/linkedin/post` - Generate LinkedIn post description
- `GET /api/seo/analysis/:topic` - Perform comprehensive SEO keyword analysis

## Configuration

The service can be configured with the following options:

- `language` - Language for content generation (default: 'de')
- `maxDescriptionLength` - Maximum description length (default: 5000)
- `maxTitleLength` - Maximum title length (default: 100)
- `maxTags` - Maximum number of tags (default: 30)
- `targetKeywords` - Target keywords to include
- `excludeWords` - Words to exclude from content

## License

ISC
