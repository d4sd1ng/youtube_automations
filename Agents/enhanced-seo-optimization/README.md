# @agents/enhanced-seo-optimization

Enhanced SEO Optimization Service with AI-powered content generation and comprehensive SEO tools.

## Installation

```bash
npm install @agents/enhanced-seo-optimization
```

## Usage

### As a Library

```javascript
const EnhancedSEOOptimizationService = require('@agents/enhanced-seo-optimization');

const seoService = new EnhancedSEOOptimizationService({
  language: 'de',
  maxDescriptionLength: 5000,
  maxTitleLength: 100,
  maxTags: 30
});

// Perform SEO keyword research
const result = await seoService.performSEOKeywordResearch('AI Content Creation');
console.log(result);

// Generate channel description
const channelData = {
  channelName: 'Tech Insights',
  description: 'Technology tutorials and insights',
  niche: 'Software Development',
  targetAudience: 'Developers and tech enthusiasts'
};

const channelResult = await seoService.generateChannelDescription(channelData);
console.log(channelResult);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3009.

## API Endpoints

- `GET /health` - Health check
- `POST /api/seo/prompt` - Generate SEO prompt
- `POST /api/seo/keyword-research` - Perform SEO keyword research
- `POST /api/seo/image` - Generate image SEO data
- `POST /api/seo/content` - Generate automated content
- `POST /api/seo/ai-optimization` - Optimize for AI search
- `POST /api/seo/content-cluster` - Create content cluster
- `POST /api/seo/batch` - Batch SEO optimization
- `POST /api/seo/channel/description` - Generate channel description
- `POST /api/seo/channel/keywords` - Generate channel keywords
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
- `dataDir` - Directory for storing SEO data (default: 'data/seo')

## License

ISC