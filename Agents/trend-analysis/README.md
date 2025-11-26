# Trend Analysis Service Module

A standalone trend analysis module for identifying viral trends and hot topics from scraped content.

## Features

- Analyze scraped content to identify viral trends and hot topics
- Extract and categorize keywords from text content
- Calculate trending scores based on multiple factors
- Support for multiple content categories (AI/Tech, Programming, Startup, etc.)
- Configurable trend analysis parameters
- Trend data storage and retrieval
- RESTful API for easy integration
- Standalone server mode

## Installation

```bash
npm install @agents/trend-analysis
```

## Usage

### As a Library

```javascript
const TrendAnalysisService = require('@agents/trend-analysis');

// Initialize service
const trendService = new TrendAnalysisService({
  dataDir: './data/scraped-content', // Optional custom directory
  trendsDir: './data/trends',
  cacheDir: './data/trend-cache'
});

// Analyze trends
const result = await trendService.analyzeTrends();

console.log('Top trending keyword:', result.trends[0].keyword);
```

### As a Standalone API Service

```bash
npm start
```

The service will start on port 3004 by default.

## API Endpoints

- `GET /health` - Health check
- `POST /api/trends/analyze` - Analyze trends from scraped content
- `GET /api/trends/latest` - Get latest trend analysis
- `GET /api/trends/config` - Get current configuration
- `POST /api/trends/config` - Update configuration

## Trend Analysis Features

1. **Keyword Extraction**: Extract relevant keywords from text content
2. **Trend Scoring**: Calculate trending scores based on engagement, viral potential, recency, and cross-platform mentions
3. **Content Categorization**: Automatically categorize content into predefined categories
4. **Time-based Analysis**: Analyze content within configurable time windows
5. **Top Trend Identification**: Identify and rank the most trending topics

## Configuration

The service can be configured through the configuration object. Key configuration options include:

- **minEngagement**: Minimum engagement for trend consideration
- **trendingThreshold**: Minimum mentions across sources
- **viralThreshold**: Minimum viral potential score
- **timeWindow**: Hours to look back for trending analysis
- **maxTrends**: Maximum trends to track

## Scoring Algorithm

The trend scoring algorithm considers multiple factors:

- **Engagement** (30% weight): Based on likes, shares, comments
- **Viral Potential** (25% weight): Estimated potential for going viral
- **Recency** (20% weight): How recent the mentions are
- **Cross-Platform** (15% weight): Mentions across different platforms
- **Keyword Relevance** (10% weight): Relevance to trending topics

## Supported Categories

- AI/Tech: Artificial intelligence, machine learning, robotics
- Programming: Code, software development, GitHub
- Startup: Funding, venture capital, IPOs
- Crypto: Bitcoin, blockchain, NFTs
- Science: Research, discoveries, breakthroughs
- Business: Companies, markets, revenue
- Politics: Government, policy, regulation

## Environment Variables

- `PORT` - Port to run the server on (default: 3004)
- `NODE_ENV` - Environment (development/production)

## Monetization Focus

This service is designed with monetization in mind:
- Identifies high-potential content topics for maximum engagement
- Supports content strategy optimization
- Enables proactive content creation for trending topics
- Provides data-driven insights for content planning