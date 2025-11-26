const express = require('express');
const cors = require('cors');
const path = require('path');
const WebScrapingService = require('./webScrapingService');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

// Initialize web scraping service
const scrapingService = new WebScrapingService({
  dataDir: path.join(__dirname, 'data/scraped-content'),
  cacheDir: path.join(__dirname, 'data/scraping-cache')
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Web Scraping Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Endpoints

// Scrape all sources
app.post('/api/scraping/scrape-all', async (req, res) => {
  try {
    const result = await scrapingService.scrapeAllSources();

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message
    });
  }
});

// Get latest scraped content
app.get('/api/scraping/latest', (req, res) => {
  try {
    const hoursBack = parseInt(req.query.hours) || 72;
    const content = scrapingService.getLatestScrapedContent(hoursBack);

    res.json({
      success: true,
      content,
      count: content.length
    });
  } catch (error) {
    console.error('Failed to get latest content:', error);
    res.status(500).json({
      error: 'Failed to get latest content',
      message: error.message
    });
  }
});

// Get scraping status
app.get('/api/scraping/status', (req, res) => {
  try {
    const status = scrapingService.getScrapingStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to get scraping status:', error);
    res.status(500).json({
      error: 'Failed to get scraping status',
      message: error.message
    });
  }
});

// Scrape specific sources
app.post('/api/scraping/scrape-reddit', async (req, res) => {
  try {
    const result = await scrapingService.scrapeReddit();

    res.json({
      success: true,
      items: result,
      count: result.length
    });
  } catch (error) {
    console.error('Reddit scraping error:', error);
    res.status(500).json({
      error: 'Reddit scraping failed',
      message: error.message
    });
  }
});

app.post('/api/scraping/scrape-hackernews', async (req, res) => {
  try {
    const result = await scrapingService.scrapeHackerNews();

    res.json({
      success: true,
      items: result,
      count: result.length
    });
  } catch (error) {
    console.error('Hacker News scraping error:', error);
    res.status(500).json({
      error: 'Hacker News scraping failed',
      message: error.message
    });
  }
});

app.post('/api/scraping/scrape-technews', async (req, res) => {
  try {
    const result = await scrapingService.scrapeTechNews();

    res.json({
      success: true,
      items: result,
      count: result.length
    });
  } catch (error) {
    console.error('Tech news scraping error:', error);
    res.status(500).json({
      error: 'Tech news scraping failed',
      message: error.message
    });
  }
});

app.post('/api/scraping/scrape-ai-research', async (req, res) => {
  try {
    const result = await scrapingService.scrapeAIResearch();

    res.json({
      success: true,
      items: result,
      count: result.length
    });
  } catch (error) {
    console.error('AI research scraping error:', error);
    res.status(500).json({
      error: 'AI research scraping failed',
      message: error.message
    });
  }
});

app.post('/api/scraping/scrape-ai-papers', async (req, res) => {
  try {
    const result = await scrapingService.scrapeAIPapers();

    res.json({
      success: true,
      items: result,
      count: result.length
    });
  } catch (error) {
    console.error('AI papers scraping error:', error);
    res.status(500).json({
      error: 'AI papers scraping failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'POST /api/scraping/scrape-all',
      'GET /api/scraping/latest',
      'GET /api/scraping/status',
      'POST /api/scraping/scrape-reddit',
      'POST /api/scraping/scrape-hackernews',
      'POST /api/scraping/scrape-technews',
      'POST /api/scraping/scrape-ai-research',
      'POST /api/scraping/scrape-ai-papers'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Web Scraping Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, scrapingService };