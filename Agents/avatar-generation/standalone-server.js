const express = require('express');
const cors = require('cors');
const path = require('path');
const AvatarGenerationService = require('./avatarGenerationService');

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
const PORT = 3010;

// Middleware
app.use(cors());
app.use(express.json());

// Create service instance
const avatarService = new AvatarGenerationService();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Avatar Generation API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Create avatar job
app.post('/api/avatar/create', async (req, res) => {
  try {
    const options = req.body;

    const job = await avatarService.createAvatarJob(options);
    res.json(job);
  } catch (error) {
    console.error('❌ Failed to create avatar job:', error);
    res.status(500).json({
      error: 'Failed to create avatar job',
      message: error.message
    });
  }
});

// Get job status
app.get('/api/avatar/job/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;

    const job = avatarService.getJobStatus(jobId);
    if (!job) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }

    res.json(job);
  } catch (error) {
    console.error('❌ Failed to get job status:', error);
    res.status(500).json({
      error: 'Failed to get job status',
      message: error.message
    });
  }
});

// Get all jobs
app.get('/api/avatar/jobs', (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const jobs = avatarService.getAllJobs(filter);
    res.json(jobs);
  } catch (error) {
    console.error('❌ Failed to get avatar jobs:', error);
    res.status(500).json({
      error: 'Failed to get avatar jobs',
      message: error.message
    });
  }
});

// Get stats
app.get('/api/avatar/stats', (req, res) => {
  try {
    const stats = avatarService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Failed to get avatar stats:', error);
    res.status(500).json({
      error: 'Failed to get avatar stats',
      message: error.message
    });
  }
});

// Generate avatar video
app.post('/api/avatar/generate', async (req, res) => {
  try {
    const { avatarId, options } = req.body;

    if (!avatarId) {
      return res.status(400).json({
        error: 'Avatar ID is required'
      });
    }

    const result = await avatarService.generateAvatarVideo(avatarId, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate avatar video:', error);
    res.status(500).json({
      error: 'Failed to generate avatar video',
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
      'POST /api/avatar/create',
      'GET /api/avatar/job/:jobId',
      'GET /api/avatar/jobs',
      'GET /api/avatar/stats',
      'POST /api/avatar/generate'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Avatar Generation API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});