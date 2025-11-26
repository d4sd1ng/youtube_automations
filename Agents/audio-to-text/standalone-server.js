const express = require('express');
const cors = require('cors');
const path = require('path');
const AudioToTextService = require('./audioToTextService');

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
const PORT = 3012;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create service instance
const audioService = new AudioToTextService();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Audio to Text API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    openaiAvailable: audioService.hasOpenAI
  });
});

// Convert audio to text
app.post('/api/audio/transcribe', async (req, res) => {
  try {
    const { audioPath, options } = req.body;

    if (!audioPath) {
      return res.status(400).json({
        error: 'Audio path is required'
      });
    }

    // Validate audio file
    const validation = await audioService.validateAudioFile(audioPath);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid audio file',
        details: validation.errors
      });
    }

    const result = await audioService.convertAudioToText(audioPath, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to transcribe audio:', error);
    res.status(500).json({
      error: 'Failed to transcribe audio',
      message: error.message
    });
  }
});

// Validate audio file
app.post('/api/audio/validate', async (req, res) => {
  try {
    const { audioPath } = req.body;

    if (!audioPath) {
      return res.status(400).json({
        error: 'Audio path is required'
      });
    }

    const validation = await audioService.validateAudioFile(audioPath);
    res.json(validation);
  } catch (error) {
    console.error('❌ Failed to validate audio file:', error);
    res.status(500).json({
      error: 'Failed to validate audio file',
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
      'POST /api/audio/transcribe',
      'POST /api/audio/validate'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Audio to Text API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});