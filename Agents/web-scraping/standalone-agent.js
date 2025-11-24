const express = require('express');
const cors = require('cors');
const path = require('path');
const WebScrapingAgent = require('./webScrapingAgent');

const app = express();
const PORT = process.env.PORT || 3015;

// Initialize web scraping agent
const scrapingAgent = new WebScrapingAgent();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'Web Scraping Agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Agent Status
app.get('/status', (req, res) => {
  res.json(scrapingAgent.getStatus());
});

// API Endpoints

// Scrape Reddit
app.post('/api/scraping/scrape-reddit', async (req, res) => {
  try {
    const { options } = req.body;

    const result = await scrapingAgent.scrapeReddit(options);

    res.json(result);
  } catch (error) {
    console.error('Reddit scraping error:', error);
    res.status(500).json({
      error: 'Reddit scraping failed',
      message: error.message
    });
  }
});

// Scrape YouTube
app.post('/api/scraping/scrape-youtube', async (req, res) => {
  try {
    const { keywords, options } = req.body;

    const result = await scrapingAgent.scrapeYouTube(keywords, options);

    res.json(result);
  } catch (error) {
    console.error('YouTube scraping error:', error);
    res.status(500).json({
      error: 'YouTube scraping failed',
      message: error.message
    });
  }
});

// Scrape Twitter
app.post('/api/scraping/scrape-twitter', async (req, res) => {
  try {
    const { keywords, options } = req.body;

    const result = await scrapingAgent.scrapeTwitter(keywords, options);

    res.json(result);
  } catch (error) {
    console.error('Twitter scraping error:', error);
    res.status(500).json({
      error: 'Twitter scraping failed',
      message: error.message
    });
  }
});

// Scrape political content
app.post('/api/scraping/scrape-political', async (req, res) => {
  try {
    const { keywords, options } = req.body;

    const result = await scrapingAgent.scrapePoliticalContent(keywords, options);

    res.json(result);
  } catch (error) {
    console.error('Political content scraping error:', error);
    res.status(500).json({
      error: 'Political content scraping failed',
      message: error.message
    });
  }
});

// Scrape business content
app.post('/api/scraping/scrape-business', async (req, res) => {
  try {
    const { keywords, options } = req.body;

    const result = await scrapingAgent.scrapeBusinessContent(keywords, options);

    res.json(result);
  } catch (error) {
    console.error('Business content scraping error:', error);
    res.status(500).json({
      error: 'Business content scraping failed',
      message: error.message
    });
  }
});

// Scrape for keywords
app.post('/api/scraping/scrape-keywords', async (req, res) => {
  try {
    const { keywords, sources, options } = req.body;

    const result = await scrapingAgent.scrapeForKeywords(keywords, sources, options);

    res.json(result);
  } catch (error) {
    console.error('Keyword scraping error:', error);
    res.status(500).json({
      error: 'Keyword scraping failed',
      message: error.message
    });
  }
});

// Search web
app.post('/api/scraping/search-web', async (req, res) => {
  try {
    const { query, options } = req.body;

    const result = await scrapingAgent.searchWeb(query, options);

    res.json(result);
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({
      error: 'Web search failed',
      message: error.message
    });
  }
});

// Get scraping result
app.get('/api/scraping/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await scrapingAgent.getScrapingResult(id);

    if (!result) {
      return res.status(404).json({
        error: 'Scraping result not found'
      });
    }

    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Get scraping result error:', error);
    res.status(500).json({
      error: 'Failed to get scraping result',
      message: error.message
    });
  }
});

// List scraping results
app.get('/api/scraping/results', async (req, res) => {
  try {
    const results = await scrapingAgent.listScrapingResults();

    res.json({
      success: true,
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('List scraping results error:', error);
    res.status(500).json({
      error: 'Failed to list scraping results',
      message: error.message
    });
  }
});

// Delete scraping result
app.delete('/api/scraping/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await scrapingAgent.deleteScrapingResult(id);

    if (!success) {
      return res.status(404).json({
        error: 'Scraping result not found'
      });
    }

    res.json({
      success: true,
      message: 'Scraping result deleted successfully'
    });
  } catch (error) {
    console.error('Delete scraping result error:', error);
    res.status(500).json({
      error: 'Failed to delete scraping result',
      message: error.message
    });
  }
});

// Get job status
app.get('/api/scraping/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await scrapingAgent.getJobStatus(id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      error: 'Failed to get job status',
      message: error.message
    });
  }
});

// List jobs
app.get('/api/scraping/jobs', async (req, res) => {
  try {
    const jobsDir = path.join(__dirname, '../../../data/scraping-jobs');
    const jobs = [];

    if (require('fs').existsSync(jobsDir)) {
      const files = require('fs').readdirSync(jobsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const jobData = JSON.parse(require('fs').readFileSync(path.join(jobsDir, file), 'utf8'));
          jobs.push(jobData);
        }
      }
    }

    res.json({
      success: true,
      jobs: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({
      error: 'Failed to list jobs',
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
      'GET /status',
      'POST /api/scraping/scrape-reddit',
      'POST /api/scraping/scrape-youtube',
      'POST /api/scraping/scrape-twitter',
      'POST /api/scraping/scrape-political',
      'POST /api/scraping/scrape-business',
      'POST /api/scraping/scrape-keywords',
      'POST /api/scraping/search-web',
      'GET /api/scraping/results/:id',
      'GET /api/scraping/results',
      'DELETE /api/scraping/results/:id',
      'GET /api/scraping/jobs/:id',
      'GET /api/scraping/jobs'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Web Scraping Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, scrapingAgent };