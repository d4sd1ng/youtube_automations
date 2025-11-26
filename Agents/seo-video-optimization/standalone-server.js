const express = require('express');
const cors = require('cors');
const path = require('path');
const SEOVideoOptimizationService = require('./seoVideoOptimizationService');

// Load environment variables manually for Node 12 compatibility
const fs = require('fs');
const envPath = path.join(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const app = express();
const PORT = 3007;

// Middleware
app.use(cors());
app.use(express.json());

// Create service instance
const seoService = new SEOVideoOptimizationService();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SEO Video Optimization API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Generate long-form video description
app.post('/api/seo/video/long-form', async (req, res) => {
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
    console.error('❌ Failed to generate long-form video description:', error);
    res.status(500).json({
      error: 'Failed to generate long-form video description',
      message: error.message
    });
  }
});

// Generate shorts video description
app.post('/api/seo/video/shorts', async (req, res) => {
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
    console.error('❌ Failed to generate shorts video description:', error);
    res.status(500).json({
      error: 'Failed to generate shorts video description',
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
      'POST /api/seo/video/long-form',
      'POST /api/seo/video/shorts'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SEO Video Optimization API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});