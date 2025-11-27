const express = require('express');
const cors = require('cors');
const path = require('path');
const ScriptGenerationService = require('./scriptGenerationService');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize script generation service
const scriptService = new ScriptGenerationService({
  scriptsDir: path.join(__dirname, 'data/scripts'),
  templatesDir: path.join(__dirname, 'data/templates/scripts'),
  promptTemplatesDir: path.join(__dirname, 'data/prompt-templates')
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Script Generation Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Endpoints

// Generate script
app.post('/api/scripts/generate', async (req, res) => {
  try {
    const scriptData = req.body;

    // Validate required parameters
    if (!scriptData.topic) {
      return res.status(400).json({
        error: 'Topic is required'
      });
    }

    const result = await scriptService.generateScript(scriptData);

    res.json({
      success: true,
      script: result
    });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({
      error: 'Script generation failed',
      message: error.message
    });
  }
});

// Generate scripts for multiple channels
app.post('/api/scripts/generate-multi', async (req, res) => {
  try {
    const channelsData = req.body;

    if (!channelsData || Object.keys(channelsData).length === 0) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await scriptService.generateScriptsForChannels(channelsData);

    res.json(result);
  } catch (error) {
    console.error('Multi-script generation error:', error);
    res.status(500).json({
      error: 'Multi-script generation failed',
      message: error.message
    });
  }
});

// Get script by ID
app.get('/api/scripts/:scriptId', (req, res) => {
  try {
    const { scriptId } = req.params;
    const script = scriptService.loadScript(scriptId);

    res.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('Failed to load script:', error);
    res.status(404).json({
      error: 'Script not found',
      message: error.message
    });
  }
});

// List all scripts
app.get('/api/scripts', (req, res) => {
  try {
    const scripts = scriptService.listScripts();

    res.json({
      success: true,
      scripts
    });
  } catch (error) {
    console.error('Failed to list scripts:', error);
    res.status(500).json({
      error: 'Failed to list scripts',
      message: error.message
    });
  }
});

// Delete script
app.delete('/api/scripts/:scriptId', (req, res) => {
  try {
    const { scriptId } = req.params;
    scriptService.deleteScript(scriptId);

    res.json({
      success: true,
      message: 'Script deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete script:', error);
    res.status(500).json({
      error: 'Failed to delete script',
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
      'POST /api/scripts/generate',
      'POST /api/scripts/generate-multi',
      'GET /api/scripts/:scriptId',
      'GET /api/scripts',
      'DELETE /api/scripts/:scriptId'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Script Generation Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, scriptService };