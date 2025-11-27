const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const SEOOptimizationService = require('./seoOptimizationService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SEO service
const seoService = new SEOOptimizationService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Channel SEO endpoints
app.post('/channel/description', async (req, res) => {
  try {
    const { channelData, config } = req.body;
    const result = await seoService.generateChannelDescription(channelData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/channel/keywords', async (req, res) => {
  try {
    const { channelData, config } = req.body;
    const result = await seoService.generateChannelKeywords(channelData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video SEO endpoints
app.post('/video/long-form', async (req, res) => {
  try {
    const { videoData, config } = req.body;
    const result = await seoService.generateLongFormVideoDescription(videoData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/video/shorts', async (req, res) => {
  try {
    const { videoData, config } = req.body;
    const result = await seoService.generateShortsVideoDescription(videoData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn SEO endpoints
app.post('/linkedin/post', async (req, res) => {
  try {
    const { postData, config } = req.body;
    const result = await seoService.generateLinkedInPostDescription(postData, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comprehensive SEO analysis endpoint
app.post('/analysis/comprehensive', async (req, res) => {
  try {
    const { topic, options } = req.body;
    const result = await seoService.performComprehensiveSEOAnalysis(topic, options);
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
  console.log(`🚀 SEO Optimization API Server running on port ${PORT}`);
});

module.exports = app;