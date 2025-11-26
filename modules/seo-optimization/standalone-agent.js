const express = require('express');
const cors = require('cors');
const path = require('path');
const SEOOptimizationAgent = require('./seoOptimizationAgent');

const app = express();
const PORT = process.env.PORT || 3014;

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

// Optimize channel
app.post('/api/seo/optimize-channel', async (req, res) => {
  try {
    const { channelData, options } = req.body;

    if (!channelData) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await seoAgent.optimizeChannel(channelData, options);

    res.json(result);
  } catch (error) {
    console.error('Channel optimization error:', error);
    res.status(500).json({
      error: 'Channel optimization failed',
      message: error.message
    });
  }
});

// Optimize video
app.post('/api/seo/optimize-video', async (req, res) => {
  try {
    const { videoData, options } = req.body;

    if (!videoData) {
      return res.status(400).json({
        error: 'Video data is required'
      });
    }

    const result = await seoAgent.optimizeVideo(videoData, options);

    res.json(result);
  } catch (error) {
    console.error('Video optimization error:', error);
    res.status(500).json({
      error: 'Video optimization failed',
      message: error.message
    });
  }
});

// Generate tags
app.post('/api/seo/generate-tags', async (req, res) => {
  try {
    const { keywords, options } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        error: 'Keywords array is required'
      });
    }

    const result = await seoAgent.generateTags(keywords, options);

    res.json(result);
  } catch (error) {
    console.error('Tag generation error:', error);
    res.status(500).json({
      error: 'Tag generation failed',
      message: error.message
    });
  }
});

// Optimize title
app.post('/api/seo/optimize-title', async (req, res) => {
  try {
    const { title, options } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    const result = await seoAgent.optimizeTitle(title, options);

    res.json(result);
  } catch (error) {
    console.error('Title optimization error:', error);
    res.status(500).json({
      error: 'Title optimization failed',
      message: error.message
    });
  }
});

// Analyze competitors
app.post('/api/seo/analyze-competitors', async (req, res) => {
  try {
    const { query, options } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    const result = await seoAgent.analyzeCompetitors(query, options);

    res.json(result);
  } catch (error) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({
      error: 'Competitor analysis failed',
      message: error.message
    });
  }
});

// List optimizations
app.get('/api/seo/list', async (req, res) => {
  try {
    const optimizations = await seoAgent.listOptimizations();

    res.json({
      success: true,
      optimizations: optimizations,
      count: optimizations.length
    });
  } catch (error) {
    console.error('List optimizations error:', error);
    res.status(500).json({
      error: 'Failed to list optimizations',
      message: error.message
    });
  }
});

// Get optimization by ID
app.get('/api/seo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const optimization = await seoAgent.getOptimization(id);

    if (!optimization) {
      return res.status(404).json({
        error: 'Optimization not found'
      });
    }

    res.json({
      success: true,
      optimization: optimization
    });
  } catch (error) {
    console.error('Get optimization error:', error);
    res.status(500).json({
      error: 'Failed to get optimization',
      message: error.message
    });
  }
});

// Delete optimization
app.delete('/api/seo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await seoAgent.deleteOptimization(id);

    if (!success) {
      return res.status(404).json({
        error: 'Optimization not found'
      });
    }

    res.json({
      success: true,
      message: 'Optimization deleted successfully'
    });
  } catch (error) {
    console.error('Delete optimization error:', error);
    res.status(500).json({
      error: 'Failed to delete optimization',
      message: error.message
    });
  }
});

// Get job status
app.get('/api/seo/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await seoAgent.getJobStatus(id);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      error: 'Failed to get job status',
      message: error.message
    });
  }
});

// List jobs
app.get('/api/seo/jobs', async (req, res) => {
  try {
    const jobsDir = path.join(__dirname, '../../../data/seo-jobs');
    const jobs = [];

    if (require('fs').existsSync(jobsDir)) {
      const files = require('fs').readdirSync(jobsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const jobData = JSON.parse(require('fs').readFileSync(path.join(jobsDir, file), 'utf8'));
          jobs.push(jobData);
        }
      }
    }

    res.json({
      success: true,
      jobs: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({
      error: 'Failed to list jobs',
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
      'POST /api/seo/optimize-channel',
      'POST /api/seo/optimize-video',
      'POST /api/seo/generate-tags',
      'POST /api/seo/optimize-title',
      'POST /api/seo/analyze-competitors',
      'GET /api/seo/list',
      'GET /api/seo/:id',
      'DELETE /api/seo/:id',
      'GET /api/seo/jobs/:id',
      'GET /api/seo/jobs'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SEO Optimization Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, seoAgent };