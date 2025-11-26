# Web Scraping Service Module

A standalone web scraping module for collecting trending content from multiple sources including social media platforms, news sites, and research publications.

## Features

- Comprehensive web scraping from multiple sources
- Social media platform scraping (Reddit, Hacker News, Twitter, YouTube, TikTok, Instagram)
- News and technology content scraping
- AI research and academic paper scraping
- Political content scraping (Bundestag, Landtags, Talk Shows)
- Rate limiting and compliance features
- Weekend pause compliance for ethical scraping
- Content storage and retrieval
- RESTful API for easy integration
- Standalone server mode

## Installation

```bash
npm install @agents/web-scraping
```

## Usage

### As a Library

```javascript
const WebScrapingService = require('@agents/web-scraping');

// Initialize service
const scrapingService = new WebScrapingService({
  dataDir: './data/scraped-content', // Optional custom directory
  cacheDir: './data/scraping-cache'
});

// Scrape all sources
const result = await scrapingService.scrapeAllSources();

console.log(`Scraped ${result.totalItems} items from ${Object.keys(result.sources).length} sources`);
```

### As a Standalone API Service

```bash
npm start
```

The service will start on port 3006 by default.

## API Endpoints

- `GET /health` - Health check
- `POST /api/scraping/scrape-all` - Scrape content from all enabled sources
- `GET /api/scraping/latest` - Get latest scraped content
- `GET /api/scraping/status` - Get scraping status
- `POST /api/scraping/scrape-reddit` - Scrape Reddit content
- `POST /api/scraping/scrape-hackernews` - Scrape Hacker News content
- `POST /api/scraping/scrape-technews` - Scrape tech news
- `POST /api/scraping/scrape-ai-research` - Scrape AI research blogs
- `POST /api/scraping/scrape-ai-papers` - Scrape AI papers from arXiv

## Supported Sources

1. **Social Media Platforms**:
   - Reddit (multiple subreddits)
   - Hacker News
   - Twitter (requires API key)
   - YouTube (requires API key)
   - TikTok
   - Instagram

2. **News and Technology**:
   - TechCrunch
   - Ars Technica
   - The Verge
   - Other tech news RSS feeds

3. **AI and Research**:
   - Google AI Blog
   - DeepMind Blog
   - OpenAI Blog
   - Microsoft AI Blog
   - IBM Research
   - NVIDIA Research
   - arXiv AI papers

4. **Political Content**:
   - Bundestag (German Parliament)
   - Landtags (State Parliaments)
   - Political Talk Shows (Lanz, Illner, Maischberger, etc.)

## Rate Limiting

The service implements rate limiting for all sources to ensure ethical scraping:

- Reddit: 2 seconds between requests
- Twitter: 3 seconds between requests
- News sites: 1.5 seconds between requests
- YouTube: 1 second between requests
- TikTok: 2.5 seconds between requests
- Instagram: 3 seconds between requests
- General web: 1 second between requests

## Compliance Features

- **Weekend Pause**: Automatically pauses scraping on weekends (Friday 18:00 - Monday 06:00)
- **Rate Limiting**: Respects rate limits for all sources
- **User-Agent Rotation**: Uses appropriate user agents for different sources
- **Timeout Handling**: Implements timeouts to prevent hanging requests

## Configuration

The service can be configured through the configuration object. Key configuration options include:

- **Source Enable/Disable**: Enable or disable specific sources
- **Rate Limits**: Adjust rate limiting for different sources
- **Weekend Pause**: Enable or disable weekend pause compliance
- **Translation Service**: Configure translation for multilingual content

## Environment Variables

- `PORT` - Port to run the server on (default: 3006)
- `FIRECRAWL_API_KEY` - API key for Firecrawl integration (optional)
- `NODE_ENV` - Environment (development/production)

## Monetization Focus

This service is designed with monetization in mind:
- Collects trending content for high-engagement content creation
- Supports multiple content categories for diverse monetization strategies
- Provides data for trend analysis and content planning
- Enables proactive content creation based on current trends