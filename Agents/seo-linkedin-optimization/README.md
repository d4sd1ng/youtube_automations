# @agents/seo-linkedin-optimization

Service for SEO optimization of LinkedIn posts with AI-powered content generation.

## Installation

```bash
npm install @agents/seo-linkedin-optimization
```

## Usage

### As a Library

```javascript
const SEOLinkedInOptimizationService = require('@agents/seo-linkedin-optimization');

const seoService = new SEOLinkedInOptimizationService({
  language: 'de',
  maxDescriptionLength: 3000,
  maxTitleLength: 200,
  maxTags: 15
});

// Generate LinkedIn post description
const postData = {
  title: 'Best Practices for LinkedIn Content',
  content: 'Detailed content about creating engaging LinkedIn posts...',
  keyPoints: [
    'Use professional language',
    'Include industry insights',
    'Engage with your network'
  ],
  callToAction: 'Follow us for more professional insights!',
  industry: 'Technology',
  profession: 'Software Engineering'
};

const result = await seoService.generateLinkedInPostDescription(postData);
console.log(result);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3008.

## API Endpoints

- `GET /health` - Health check
- `POST /api/seo/linkedin/post` - Generate LinkedIn post description

## Configuration

The service can be configured with the following options:

- `language` - Language for content generation (default: 'de')
- `maxDescriptionLength` - Maximum description length (default: 3000)
- `maxTitleLength` - Maximum title length (default: 200)
- `maxTags` - Maximum number of tags (default: 15)
- `targetKeywords` - Target keywords to include
- `excludeWords` - Words to exclude from content

## License

ISC