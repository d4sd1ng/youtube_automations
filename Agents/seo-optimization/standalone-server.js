const express = require('express');
const cors = require('cors');
const path = require('path');
const SEOOptimizationService = require('./seoOptimizationService');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;

// Initialize SEO optimization service
const seoService = new SEOOptimizationService();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SEO Optimization Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Endpoints

// Generate channel description
app.post('/api/seo/channel-description', async (req, res) => {
  try {
    const { channelData, config } = req.body;

    if (!channelData) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await seoService.generateChannelDescription(channelData, config);

    res.json(result);
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

    const result = await seoService.generateChannelKeywords(channelData, config);

    res.json(result);
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

    const result = await seoService.performComprehensiveSEOAnalysis(topic, options);

    res.json(result);
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

    const result = await seoService.generateLongFormVideoDescription(videoData, config);

    res.json(result);
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

    const result = await seoService.generateShortsVideoDescription(videoData, config);

    res.json(result);
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

    const result = await seoService.generateLinkedInPostDescription(postData, config);

    res.json(result);
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
  console.log(`🚀 SEO Optimization Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, seoService };