const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ThumbnailGenerationService = require('./thumbnailGenerationService');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize thumbnail generation service
const thumbnailService = new ThumbnailGenerationService({
  thumbnailsDir: path.join(__dirname, 'data/thumbnails')
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from generated directory
app.use('/thumbnails', express.static(thumbnailService.generatedDir));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Thumbnail Generation Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Endpoints

// Generate thumbnail
app.post('/api/thumbnails/generate', async (req, res) => {
  try {
    const options = req.body;

    // Validate required parameters
    if (!options.title) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    const result = await thumbnailService.generateThumbnail(options);

    // Return relative path for web access
    const relativePath = path.relative(thumbnailService.generatedDir, result.path);

    res.json({
      success: true,
      thumbnail: {
        ...result,
        relativePath: `/thumbnails/${relativePath}`,
        url: `http://localhost:${PORT}/thumbnails/${relativePath}`
      }
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json({
      error: 'Thumbnail generation failed',
      message: error.message
    });
  }
});

// Get available templates
app.get('/api/thumbnails/templates', (req, res) => {
  try {
    const templates = thumbnailService.getAvailableTemplates();
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({
      error: 'Failed to get templates',
      message: error.message
    });
  }
});

// Get configuration
app.get('/api/thumbnails/config', (req, res) => {
  try {
    const config = thumbnailService.getConfig();
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
app.post('/api/thumbnails/config', (req, res) => {
  try {
    const newConfig = req.body;
    thumbnailService.updateConfig(newConfig);

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
      'POST /api/thumbnails/generate',
      'GET /api/thumbnails/templates',
      'GET /api/thumbnails/config',
      'POST /api/thumbnails/config'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Thumbnail Generation Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
  console.log(`📁 Thumbnails will be served from: http://localhost:${PORT}/thumbnails/`);
});

module.exports = { app, thumbnailService };