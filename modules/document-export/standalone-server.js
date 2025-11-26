const express = require('express');
const cors = require('cors');
const path = require('path');
const DocumentExportService = require('./documentExportService');

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
const PORT = 3011;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Create service instance
const exportService = new DocumentExportService();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Document Export API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Export to Word
app.post('/api/export/word', async (req, res) => {
  try {
    const { analysisData, options } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        error: 'Analysis data is required'
      });
    }

    const result = await exportService.exportToWord(analysisData, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to export to Word:', error);
    res.status(500).json({
      error: 'Failed to export to Word',
      message: error.message
    });
  }
});

// Export to PDF
app.post('/api/export/pdf', async (req, res) => {
  try {
    const { analysisData, options } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        error: 'Analysis data is required'
      });
    }

    const result = await exportService.exportToPDF(analysisData, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to export to PDF:', error);
    res.status(500).json({
      error: 'Failed to export to PDF',
      message: error.message
    });
  }
});

// Export to both formats
app.post('/api/export/both', async (req, res) => {
  try {
    const { analysisData, options } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        error: 'Analysis data is required'
      });
    }

    const result = await exportService.exportBoth(analysisData, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to export to both formats:', error);
    res.status(500).json({
      error: 'Failed to export to both formats',
      message: error.message
    });
  }
});

// Get exported files
app.get('/api/export/files', (req, res) => {
  try {
    const files = exportService.getExportedFiles();
    res.json(files);
  } catch (error) {
    console.error('❌ Failed to get exported files:', error);
    res.status(500).json({
      error: 'Failed to get exported files',
      message: error.message
    });
  }
});

// Cleanup old files
app.post('/api/export/cleanup', (req, res) => {
  try {
    const { maxAgeDays } = req.body;
    const deletedCount = exportService.cleanupOldFiles(maxAgeDays);
    res.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} old files`
    });
  } catch (error) {
    console.error('❌ Failed to cleanup old files:', error);
    res.status(500).json({
      error: 'Failed to cleanup old files',
      message: error.message
    });
  }
});

// Serve exported files
app.use('/exports', express.static(path.join(__dirname, 'exports')));

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
      'POST /api/export/word',
      'POST /api/export/pdf',
      'POST /api/export/both',
      'GET /api/export/files',
      'POST /api/export/cleanup',
      'GET /exports/*'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Document Export API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});