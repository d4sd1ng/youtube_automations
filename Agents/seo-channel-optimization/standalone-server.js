const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const SEOChannelOptimizationService = require('./seoChannelOptimizationService');
const RateLimitingMiddleware = require('../rate-limiter/middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SEO_CHANNEL_PORT || 3003;

// Initialize Rate Limiting Middleware
const rateLimitingMiddleware = new RateLimitingMiddleware();
const securityHeaders = rateLimitingMiddleware.securityHeaders();
const generalLimiter = rateLimitingMiddleware.generalLimiter();
const strictLimiter = rateLimitingMiddleware.strictLimiter();

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityHeaders);

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Initialize SEO Channel service
const seoChannelService = new SEOChannelOptimizationService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Generate channel description endpoint (mit striktem Rate Limiting)
app.post('/generate-description', strictLimiter, async (req, res) => {
  try {
    const { channelData, config } = req.body;
    const result = await seoChannelService.generateChannelDescription(channelData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate channel keywords endpoint (mit striktem Rate Limiting)
app.post('/generate-keywords', strictLimiter, async (req, res) => {
  try {
    const { channelData, config } = req.body;
    const result = await seoChannelService.generateChannelKeywords(channelData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 SEO Channel Optimization Service running on port ${PORT}`);
});

module.exports = app;