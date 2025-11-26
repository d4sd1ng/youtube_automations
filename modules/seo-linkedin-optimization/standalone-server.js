const express = require('express');
const cors = require('cors');
const path = require('path');
const SEOLinkedInOptimizationService = require('./seoLinkedInOptimizationService');

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
const PORT = 3008;

// Middleware
app.use(cors());
app.use(express.json());

// Create service instance
const seoService = new SEOLinkedInOptimizationService();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SEO LinkedIn Optimization API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Generate LinkedIn post description
app.post('/api/seo/linkedin/post', async (req, res) => {
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
    console.error('❌ Failed to generate LinkedIn post description:', error);
    res.status(500).json({
      error: 'Failed to generate LinkedIn post description',
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
      'POST /api/seo/linkedin/post'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SEO LinkedIn Optimization API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});