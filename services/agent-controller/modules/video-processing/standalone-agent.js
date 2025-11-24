const express = require('express');
const cors = require('cors');
const path = require('path');
const VideoProcessingAgent = require('./videoProcessingAgent');

const app = express();
const PORT = process.env.PORT || 3012;

// Initialize video processing agent
const videoAgent = new VideoProcessingAgent();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'Video Processing Agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Agent Status
app.get('/status', (req, res) => {
  res.json(videoAgent.getStatus());
});

// API Endpoints

// Discover videos
app.post('/api/video/discover', async (req, res) => {
  try {
    const { query, options } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    const result = await videoAgent.discoverVideos(query, options);

    res.json(result);
  } catch (error) {
    console.error('Video discovery error:', error);
    res.status(500).json({
      error: 'Video discovery failed',
      message: error.message
    });
  }
});

// Extract audio from video
app.post('/api/video/:id/extract-audio', async (req, res) => {
  try {
    const { id } = req.params;
    const { options } = req.body;

    const result = await videoAgent.extractAudio(id, options);

    res.json(result);
  } catch (error) {
    console.error('Audio extraction error:', error);
    res.status(500).json({
      error: 'Audio extraction failed',
      message: error.message
    });
  }
});

// Analyze video
app.post('/api/video/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const { options } = req.body;

    const result = await videoAgent.analyzeVideo(id, options);

    res.json(result);
  } catch (error) {
    console.error('Video analysis error:', error);
    res.status(500).json({
      error: 'Video analysis failed',
      message: error.message
    });
  }
});

// Process video
app.post('/api/video/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const { processingOptions } = req.body;

    const result = await videoAgent.processVideo(id, processingOptions);

    res.json(result);
  } catch (error) {
    console.error('Video processing error:', error);
    res.status(500).json({
      error: 'Video processing failed',
      message: error.message
    });
  }
});

// Create thumbnail
app.post('/api/video/:id/create-thumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnailOptions } = req.body;

    const result = await videoAgent.createThumbnail(id, thumbnailOptions);

    res.json(result);
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    res.status(500).json({
      error: 'Thumbnail creation failed',
      message: error.message
    });
  }
});

// Optimize video
app.post('/api/video/:id/optimize', async (req, res) => {
  try {
    const { id } = req.params;
    const { optimizationOptions } = req.body;

    const result = await videoAgent.optimizeVideo(id, optimizationOptions);

    res.json(result);
  } catch (error) {
    console.error('Video optimization error:', error);
    res.status(500).json({
      error: 'Video optimization failed',
      message: error.message
    });
  }
});

// Generate subtitles
app.post('/api/video/:id/generate-subtitles', async (req, res) => {
  try {
    const { id } = req.params;
    const { subtitleOptions } = req.body;

    const result = await videoAgent.generateSubtitles(id, subtitleOptions);

    res.json(result);
  } catch (error) {
    console.error('Subtitle generation error:', error);
    res.status(500).json({
      error: 'Subtitle generation failed',
      message: error.message
    });
  }
});

// Add watermark
app.post('/api/video/:id/add-watermark', async (req, res) => {
  try {
    const { id } = req.params;
    const { watermarkOptions } = req.body;

    const result = await videoAgent.addWatermark(id, watermarkOptions);

    res.json(result);
  } catch (error) {
    console.error('Watermark addition error:', error);
    res.status(500).json({
      error: 'Watermark addition failed',
      message: error.message
    });
  }
});

// Create video from script
app.post('/api/video/create-from-script', async (req, res) => {
  try {
    const { scriptId, videoOptions } = req.body;

    if (!scriptId) {
      return res.status(400).json({
        error: 'Script ID is required'
      });
    }

    const result = await videoAgent.createVideoFromScript(scriptId, videoOptions);

    res.json(result);
  } catch (error) {
    console.error('Video creation error:', error);
    res.status(500).json({
      error: 'Video creation failed',
      message: error.message
    });
  }
});

// Create shorts from source video
app.post('/api/video/:id/create-shorts', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, shortOptions } = req.body;

    if (!platform) {
      return res.status(400).json({
        error: 'Platform is required'
      });
    }

    const result = await videoAgent.createShorts(id, platform, shortOptions);

    res.json(result);
  } catch (error) {
    console.error('Shorts creation error:', error);
    res.status(500).json({
      error: 'Shorts creation failed',
      message: error.message
    });
  }
});

// Create shorts from top videos in category
app.post('/api/video/create-shorts-from-top', async (req, res) => {
  try {
    const { category, platform, count } = req.body;

    if (!category || !platform) {
      return res.status(400).json({
        error: 'Category and platform are required'
      });
    }

    const result = await videoAgent.createShortsFromTopVideos(category, platform, count);

    res.json(result);
  } catch (error) {
    console.error('Top shorts creation error:', error);
    res.status(500).json({
      error: 'Top shorts creation failed',
      message: error.message
    });
  }
});

// Integrate avatar into video
app.post('/api/video/:id/integrate-avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const { avatarId, integrationOptions } = req.body;

    if (!avatarId) {
      return res.status(400).json({
        error: 'Avatar ID is required'
      });
    }

    const result = await videoAgent.integrateAvatar(id, avatarId, integrationOptions);

    res.json(result);
  } catch (error) {
    console.error('Avatar integration error:', error);
    res.status(500).json({
      error: 'Avatar integration failed',
      message: error.message
    });
  }
});

// Get video info
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await videoAgent.getVideoInfo(id);

    if (!video) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      video: video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      error: 'Failed to get video',
      message: error.message
    });
  }
});

// List videos
app.get('/api/video/list', async (req, res) => {
  try {
    const videos = await videoAgent.listVideos();

    res.json({
      success: true,
      videos: videos,
      count: videos.length
    });
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({
      error: 'Failed to list videos',
      message: error.message
    });
  }
});

// Delete video
app.delete('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await videoAgent.deleteVideo(id);

    if (!success) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      error: 'Failed to delete video',
      message: error.message
    });
  }
});

// Get job status
app.get('/api/video/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await videoAgent.getJobStatus(id);

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
app.get('/api/video/jobs', async (req, res) => {
  try {
    const jobsDir = path.join(__dirname, '../../../data/video-jobs');
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
      'POST /api/video/discover',
      'POST /api/video/:id/extract-audio',
      'POST /api/video/:id/analyze',
      'POST /api/video/:id/process',
      'POST /api/video/:id/create-thumbnail',
      'POST /api/video/:id/optimize',
      'POST /api/video/:id/generate-subtitles',
      'POST /api/video/:id/add-watermark',
      'POST /api/video/create-from-script',
      'POST /api/video/:id/create-shorts',
      'POST /api/video/create-shorts-from-top',
      'POST /api/video/:id/integrate-avatar',
      'GET /api/video/:id',
      'GET /api/video/list',
      'DELETE /api/video/:id',
      'GET /api/video/jobs/:id',
      'GET /api/video/jobs'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Video Processing Agent running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});

module.exports = { app, videoAgent };