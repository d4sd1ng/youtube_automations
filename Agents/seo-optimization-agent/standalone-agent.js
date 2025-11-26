const express = require('express');
const cors = require('cors');
const path = require('path');
const SEOOptimizationAgent = require('./seoOptimizationAgent');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3010;

// Initialize SEO optimization agent
const seoAgent = new SEOOptimizationAgent();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'SEO Optimization Agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Agent Status
app.get('/status', (req, res) => {
  res.json(seoAgent.getStatus());
});

// API Endpoints

// Execute SEO task
app.post('/api/seo/execute', async (req, res) => {
  try {
    const { taskData } = req.body;

    if (!taskData) {
      return res.status(400).json({
        error: 'Task data is required'
      });
    }

    const result = await seoAgent.execute(taskData);

    res.json(result);
  } catch (error) {
    console.error('SEO agent execution error:', error);
    res.status(500).json({
      error: 'SEO agent execution failed',
      message: error.message
    });
  }
});

// Generate channel description
app.post('/api/seo/channel-description', async (req, res) => {
  try {
    const { channelData, config } = req.body;

    if (!channelData) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await seoAgent.generateChannelDescription(channelData, config);

    res.json({
      agent: 'SEOOptimizationAgent',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Channel description generation error:', error);
    res.status(500).json({
      error: 'Channel description generation failed',
      message: error.message
    });
  }
});

// Generate channel keywords
app.post('/api/seo/channel-keywords', async (req, res) => {
  try {
    const { channelData, config } = req.body;

    if (!channelData) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await seoAgent.generateChannelKeywords(channelData, config);

    res.json({
      agent: 'SEOOptimizationAgent',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Channel keywords generation error:', error);
    res.status(500).json({
      error: 'Channel keywords generation failed',
      message: error.message
    });
  }
});

// Perform comprehensive SEO analysis
app.post('/api/seo/analysis', async (req, res) => {
  try {
    const { topic, options } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Topic is required'
      });
    }

    const result = await seoAgent.performComprehensiveSEOAnalysis(topic, options);

    res.json({
      agent: 'SEOOptimizationAgent',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('SEO analysis error:', error);
    res.status(500).json({
      error: 'SEO analysis failed',
      message: error.message
    });
  }
});

// Generate long-form video description
app.post('/api/seo/video-description/long-form', async (req, res) => {
  try {
    const { videoData, config } = req.body;

    if (!videoData) {
      return res.status(400).json({
        error: 'Video data is required'
      });
    }

    const result = await seoAgent.generateLongFormVideoDescription(videoData, config);

    res.json({
      agent: 'SEOOptimizationAgent',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Long-form video description generation error:', error);
    res.status(500).json({
      error: 'Long-form video description generation failed',
      message: error.message
    });
  }
});

// Generate shorts video description
app.post('/api/seo/video-description/shorts', async (req, res) => {
  try {
    const { videoData, config } = req.body;

    if (!videoData) {
      return res.status(400).json({
        error: 'Video data is required'
      });
    }

    const result = await seoAgent.generateShortsVideoDescription(videoData, config);

    res.json({
      agent: 'SEOOptimizationAgent',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Shorts video description generation error:', error);
    res.status(500).json({
      error: 'Shorts video description generation failed',
      message: error.message
    });
  }
});

// Generate LinkedIn post description
app.post('/api/seo/linkedin-post', async (req, res) => {
  try {
    const { postData, config } = req.body;

    if (!postData) {
      return res.status(400).json({
        error: 'Post data is required'
      });
    }

    const result = await seoAgent.generateLinkedInPostDescription(postData, config);

    res.json({
      agent: 'SEOOptimizationAgent',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('LinkedIn post description generation error:', error);
    res.status(500).json({
      error: 'LinkedIn post description generation failed',
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
      'POST /api/seo/execute',
      'POST /api/seo/channel-description',
      'POST /api/seo/channel-keywords',
      'POST /api/seo/analysis',
      'POST /api/seo/video-description/long-form',
      'POST /api/seo/video-description/shorts',
      'POST /api/seo/linkedin-post'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SEO Optimization Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, seoAgent };