const express = require('express');
const cors = require('cors');
const path = require('path');
const ScriptGenerationAgent = require('./scriptGenerationAgent');

const app = express();
const PORT = process.env.PORT || 3013;

// Initialize script generation agent
const scriptAgent = new ScriptGenerationAgent();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'Script Generation Agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Agent Status
app.get('/status', (req, res) => {
  res.json(scriptAgent.getStatus());
});

// API Endpoints

// Generate script
app.post('/api/script/generate', async (req, res) => {
  try {
    const { topic, options } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Topic is required'
      });
    }

    const result = await scriptAgent.generateScript(topic, options);

    res.json(result);
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({
      error: 'Script generation failed',
      message: error.message
    });
  }
});

// Generate script from template
app.post('/api/script/generate-from-template', async (req, res) => {
  try {
    const { templateId, data } = req.body;

    if (!templateId) {
      return res.status(400).json({
        error: 'Template ID is required'
      });
    }

    const result = await scriptAgent.generateScriptFromTemplate(templateId, data);

    res.json(result);
  } catch (error) {
    console.error('Template-based script generation error:', error);
    res.status(500).json({
      error: 'Template-based script generation failed',
      message: error.message
    });
  }
});

// List scripts
app.get('/api/script/list', async (req, res) => {
  try {
    const scripts = await scriptAgent.listScripts();

    res.json({
      success: true,
      scripts: scripts,
      count: scripts.length
    });
  } catch (error) {
    console.error('List scripts error:', error);
    res.status(500).json({
      error: 'Failed to list scripts',
      message: error.message
    });
  }
});

// Get script by ID
app.get('/api/script/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const script = await scriptAgent.getScript(id);

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    res.json({
      success: true,
      script: script
    });
  } catch (error) {
    console.error('Get script error:', error);
    res.status(500).json({
      error: 'Failed to get script',
      message: error.message
    });
  }
});

// Delete script
app.delete('/api/script/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await scriptAgent.deleteScript(id);

    if (!success) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    res.json({
      success: true,
      message: 'Script deleted successfully'
    });
  } catch (error) {
    console.error('Delete script error:', error);
    res.status(500).json({
      error: 'Failed to delete script',
      message: error.message
    });
  }
});

// List templates
app.get('/api/script/templates/list', async (req, res) => {
  try {
    const templates = await scriptAgent.listTemplates();

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
app.get('/api/script/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await scriptAgent.getTemplate(id);

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

// Get job status
app.get('/api/script/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await scriptAgent.getJobStatus(id);

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
app.get('/api/script/jobs', async (req, res) => {
  try {
    const jobsDir = path.join(__dirname, '../../../data/script-jobs');
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
      'POST /api/script/generate',
      'POST /api/script/generate-from-template',
      'GET /api/script/list',
      'GET /api/script/:id',
      'DELETE /api/script/:id',
      'GET /api/script/templates/list',
      'GET /api/script/templates/:id',
      'GET /api/script/jobs/:id',
      'GET /api/script/jobs'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Script Generation Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, scriptAgent };