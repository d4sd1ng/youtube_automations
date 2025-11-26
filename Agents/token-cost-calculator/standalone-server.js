const express = require('express');
const cors = require('cors');
const path = require('path');
const TokenCostCalculator = require('./tokenCostCalculator');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;
const tokenCalculator = new TokenCostCalculator();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Token Cost Calculator API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Token Cost Calculator API Endpoints

// Get available content types
app.get('/api/tokens/content-types', (req, res) => {
  try {
    const contentTypes = tokenCalculator.getAvailableContentTypes();
    res.json({
      success: true,
      contentTypes
    });
  } catch (error) {
    console.error('❌ Failed to get content types:', error);
    res.status(500).json({
      error: 'Failed to get content types',
      message: error.message
    });
  }
});

// Get cost estimate for specific content type
app.get('/api/tokens/estimate', (req, res) => {
  try {
    const { contentType, provider = 'ollama', model = 'llama2:7b', audioDuration } = req.query;

    if (!contentType) {
      return res.status(400).json({
        error: 'Content type is required',
        availableTypes: Object.keys(tokenCalculator.getAvailableContentTypes())
      });
    }

    const options = {};
    if (audioDuration) {
      options.audioDuration = parseFloat(audioDuration);
    }

    const estimate = tokenCalculator.calculateEstimatedCost(
      contentType,
      provider,
      model,
      options
    );

    res.json(estimate);
  } catch (error) {
    console.error('❌ Failed to calculate cost estimate:', error);
    res.status(500).json({
      error: 'Failed to calculate cost estimate',
      message: error.message
    });
  }
});

// Get provider comparison for content type
app.get('/api/tokens/comparison', (req, res) => {
  try {
    const { contentType, audioDuration } = req.query;

    if (!contentType) {
      return res.status(400).json({
        error: 'Content type is required'
      });
    }

    const options = {};
    if (audioDuration) {
      options.audioDuration = parseFloat(audioDuration);
    }

    const comparison = tokenCalculator.getProviderComparison(contentType, options);
    res.json(comparison);
  } catch (error) {
    console.error('❌ Failed to get provider comparison:', error);
    res.status(500).json({
      error: 'Failed to get provider comparison',
      message: error.message
    });
  }
});

// Get monthly projection
app.get('/api/tokens/projection', (req, res) => {
  try {
    const { contentType, videosPerWeek, provider = 'ollama', model = 'llama2:7b' } = req.query;

    if (!contentType || !videosPerWeek) {
      return res.status(400).json({
        error: 'Content type and videos per week are required'
      });
    }

    const projection = tokenCalculator.getMonthlyProjection(
      contentType,
      parseInt(videosPerWeek),
      provider,
      model
    );

    res.json(projection);
  } catch (error) {
    console.error('❌ Failed to get monthly projection:', error);
    res.status(500).json({
      error: 'Failed to get monthly projection',
      message: error.message
    });
  }
});

// Get current provider costs
app.get('/api/tokens/providers', (req, res) => {
  try {
    const providerCosts = tokenCalculator.getProviderCosts();
    res.json({
      success: true,
      providers: providerCosts
    });
  } catch (error) {
    console.error('❌ Failed to get provider costs:', error);
    res.status(500).json({
      error: 'Failed to get provider costs',
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
      'GET /api/tokens/content-types',
      'GET /api/tokens/estimate',
      'GET /api/tokens/comparison',
      'GET /api/tokens/projection',
      'GET /api/tokens/providers'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Token Cost Calculator API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, tokenCalculator };