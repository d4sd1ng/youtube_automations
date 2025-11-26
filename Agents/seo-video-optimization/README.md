# @agents/seo-video-optimization

Service for SEO optimization of YouTube videos with AI-powered content generation.

## Installation

```bash
npm install @agents/seo-video-optimization
```

## Usage

### As a Library

```javascript
const SEOVideoOptimizationService = require('@agents/seo-video-optimization');

const seoService = new SEOVideoOptimizationService({
  language: 'de',
  maxDescriptionLength: 5000,
  maxTitleLength: 100,
  maxTags: 30
});

// Generate long-form video description
const videoData = {
  title: 'How to Optimize YouTube Videos for SEO',
  content: 'Detailed content about SEO optimization...',
  keyPoints: [
    'Use relevant keywords',
    'Create engaging titles',
    'Add compelling descriptions'
  ],
  callToAction: 'Subscribe for more SEO tips!'
};

const result = await seoService.generateLongFormVideoDescription(videoData);
console.log(result);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3007.

## API Endpoints

- `GET /health` - Health check
- `POST /api/seo/video/long-form` - Generate long-form video description
- `POST /api/seo/video/shorts` - Generate shorts video description

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