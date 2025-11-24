const express = require('express');
const cors = require('cors');
const path = require('path');
const AvatarGenerationAgent = require('./avatarGenerationAgent');

const app = express();
const PORT = process.env.PORT || 3011;

// Initialize avatar generation agent
const avatarAgent = new AvatarGenerationAgent();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'Avatar Generation Agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Agent Status
app.get('/status', (req, res) => {
  res.json(avatarAgent.getStatus());
});

// API Endpoints

// Create avatar
app.post('/api/avatar/create', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({
        error: 'Configuration is required'
      });
    }

    const result = await avatarAgent.createAvatar(config);

    res.json(result);
  } catch (error) {
    console.error('Avatar creation error:', error);
    res.status(500).json({
      error: 'Avatar creation failed',
      message: error.message
    });
  }
});

// List avatars
app.get('/api/avatar/list', async (req, res) => {
  try {
    const avatars = await avatarAgent.listAvatars();

    res.json({
      success: true,
      avatars: avatars,
      count: avatars.length
    });
  } catch (error) {
    console.error('List avatars error:', error);
    res.status(500).json({
      error: 'Failed to list avatars',
      message: error.message
    });
  }
});

// Get avatar by ID
app.get('/api/avatar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const avatar = await avatarAgent.getAvatar(id);

    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found'
      });
    }

    res.json({
      success: true,
      avatar: avatar
    });
  } catch (error) {
    console.error('Get avatar error:', error);
    res.status(500).json({
      error: 'Failed to get avatar',
      message: error.message
    });
  }
});

// Delete avatar
app.delete('/api/avatar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await avatarAgent.deleteAvatar(id);

    if (!success) {
      return res.status(404).json({
        error: 'Avatar not found'
      });
    }

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      error: 'Failed to delete avatar',
      message: error.message
    });
  }
});

// List templates
app.get('/api/avatar/templates/list', async (req, res) => {
  try {
    const templates = await avatarAgent.listTemplates();

    res.json({
      success: true,
      templates: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({
      error: 'Failed to list templates',
      message: error.message
    });
  }
});

// Get template by ID
app.get('/api/avatar/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await avatarAgent.getTemplate(id);

    if (!template) {
      return res.status(404).json({
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      template: template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      error: 'Failed to get template',
      message: error.message
    });
  }
});

// List voice templates
app.get('/api/avatar/voices/list', async (req, res) => {
  try {
    const templates = await avatarAgent.listVoiceTemplates();

    res.json({
      success: true,
      templates: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('List voice templates error:', error);
    res.status(500).json({
      error: 'Failed to list voice templates',
      message: error.message
    });
  }
});

// Get voice template by ID
app.get('/api/avatar/voices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await avatarAgent.getVoiceTemplate(id);

    if (!template) {
      return res.status(404).json({
        error: 'Voice template not found'
      });
    }

    res.json({
      success: true,
      template: template
    });
  } catch (error) {
    console.error('Get voice template error:', error);
    res.status(500).json({
      error: 'Failed to get voice template',
      message: error.message
    });
  }
});

// List text templates
app.get('/api/avatar/text-templates', async (req, res) => {
  try {
    const templates = await avatarAgent.listTextTemplates();

    res.json({
      success: true,
      templates: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('List text templates error:', error);
    res.status(500).json({
      error: 'Failed to list text templates',
      message: error.message
    });
  }
});

// Train avatar
app.post('/api/avatar/:id/train', async (req, res) => {
  try {
    const { id } = req.params;
    const { trainingData } = req.body;

    // Check if avatar exists
    const avatar = await avatarAgent.getAvatar(id);
    if (!avatar) {
      return res.status(404).json({
        error: 'Avatar not found'
      });
    }

    const result = await avatarAgent.trainAvatar(id, trainingData);

    res.json(result);
  } catch (error) {
    console.error('Avatar training error:', error);
    res.status(500).json({
      error: 'Avatar training failed',
      message: error.message
    });
  }
});

// Get job status
app.get('/api/avatar/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await avatarAgent.getJobStatus(id);

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
app.get('/api/avatar/jobs', async (req, res) => {
  try {
    const jobsDir = path.join(__dirname, '../../../data/avatar-jobs');
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
      'POST /api/avatar/create',
      'GET /api/avatar/list',
      'GET /api/avatar/:id',
      'DELETE /api/avatar/:id',
      'GET /api/avatar/templates/list',
      'GET /api/avatar/templates/:id',
      'GET /api/avatar/voices/list',
      'GET /api/avatar/voices/:id',
      'GET /api/avatar/text-templates',
      'POST /api/avatar/:id/train',
      'GET /api/avatar/jobs/:id',
      'GET /api/avatar/jobs'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Avatar Generation Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, avatarAgent };