# @agents/seo-optimization-agent

Agent for comprehensive SEO optimization of YouTube channels, videos, and LinkedIn posts with AI-powered content generation.

## Important Notice

This package has been refactored into three separate modules for better modularity and individual usage:

1. [@agents/seo-channel-optimization](../seo-channel-optimization) - For YouTube channel SEO
2. [@agents/seo-video-optimization](../seo-video-optimization) - For YouTube video SEO
3. [@agents/seo-linkedin-optimization](../seo-linkedin-optimization) - For LinkedIn post SEO

Please use the individual packages for better performance and smaller bundle size.

## Installation

```bash
npm install @agents/seo-optimization-agent
```

## Usage

### As a Library

```javascript
const SEOOptimizationAgent = require('@agents/seo-optimization-agent');

const seoAgent = new SEOOptimizationAgent({
  language: 'de',
  maxDescriptionLength: 5000,
  maxTitleLength: 100,
  maxTags: 30
});

// Execute a task
const taskData = {
  type: 'channel-description',
  channelData: {
    channelName: 'Tech Insights',
    description: 'Technology tutorials and insights',
    niche: 'Software Development',
    targetAudience: 'Developers and tech enthusiasts'
  }
};

const result = await seoAgent.execute(taskData);
console.log(result);
```

### As a Standalone Agent

```bash
npm start
```

The agent will start on port 3010.

## API Endpoints

- `GET /health` - Health check
- `GET /status` - Agent status
- `POST /api/seo/execute` - Execute SEO task
- `POST /api/seo/channel-description` - Generate channel description
- `POST /api/seo/channel-keywords` - Generate channel keywords
- `POST /api/seo/analysis` - Perform SEO analysis
- `POST /api/seo/video-description/long-form` - Generate long-form video description
- `POST /api/seo/video-description/shorts` - Generate shorts video description
- `POST /api/seo/linkedin-post` - Generate LinkedIn post description

## Supported Task Types

- `channel-description` - Generate YouTube channel description
- `channel-keywords` - Generate YouTube channel keywords
- `comprehensive-analysis` - Perform comprehensive SEO analysis
- `long-form-video` - Generate long-form YouTube video description
- `shorts-video` - Generate YouTube Shorts description
- `linkedin-post` - Generate LinkedIn post description