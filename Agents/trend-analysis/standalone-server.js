const express = require('express');
const cors = require('cors');
const path = require('path');
const TrendAnalysisService = require('./trendAnalysisService');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Initialize trend analysis service
const trendService = new TrendAnalysisService({
  dataDir: path.join(__dirname, 'data/scraped-content'),
  trendsDir: path.join(__dirname, 'data/trends'),
  cacheDir: path.join(__dirname, 'data/trend-cache')
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Trend Analysis Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Endpoints

// Analyze trends
app.post('/api/trends/analyze', async (req, res) => {
  try {
    const result = await trendService.analyzeTrends();

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      error: 'Trend analysis failed',
      message: error.message
    });
  }
});

// Get latest trend analysis
app.get('/api/trends/latest', (req, res) => {
  try {
    const latest = trendService.getLatestTrendAnalysis();

    if (!latest) {
      return res.status(404).json({
        error: 'No trend analysis found'
      });
    }

    res.json({
      success: true,
      ...latest
    });
  } catch (error) {
    console.error('Failed to get latest trend analysis:', error);
    res.status(500).json({
      error: 'Failed to get latest trend analysis',
      message: error.message
    });
  }
});

// Get configuration
app.get('/api/trends/config', (req, res) => {
  try {
    const config = trendService.getConfig();

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Failed to get config:', error);
    res.status(500).json({
      error: 'Failed to get config',
      message: error.message
    });
  }
});

// Update configuration
app.post('/api/trends/config', (req, res) => {
  try {
    const newConfig = req.body;
    trendService.updateConfig(newConfig);

    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('Failed to update config:', error);
    res.status(500).json({
      error: 'Failed to update config',
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
      'POST /api/trends/analyze',
      'GET /api/trends/latest',
      'GET /api/trends/config',
      'POST /api/trends/config'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Trend Analysis Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, trendService };