const express = require('express');
const cors = require('cors');
const VideoDiscoveryService = require('./videoDiscoveryService');
const AudioExtractionService = require('./audioExtractionService');

const app = express();
const PORT = 3005;

// Initialize Video Discovery Service
const videoDiscovery = new VideoDiscoveryService();
const audioExtraction = new AudioExtractionService();

// Middleware
app.use(cors());
app.use(express.json());

// Mock Token Cost Calculator für Demo
const mockContentTypes = {
  political_content: {
    description: 'Political analysis and commentary videos',
    steps: 9,
    avgTokens: 9450
  },
  ai_content: {
    description: 'AI and technology focused content', 
    steps: 9,
    avgTokens: 11850
  },
  viral_shorts: {
    description: 'Short-form viral content',
    steps: 8, 
    avgTokens: 3450
  },
  educational: {
    description: 'Educational and instructional content',
    steps: 9,
    avgTokens: 8650
  },
  audio_analysis: {
    description: 'Audio transcription and analysis',
    steps: 7,
    avgTokens: 7300
  },
  multimedia_analysis: {
    description: 'Multi-media content analysis', 
    steps: 6,
    avgTokens: 6500
  }
};

const mockProviderCosts = {
  'ollama/llama2:7b': { totalCost: 0.0000, totalTokens: 8650, costPerToken: 0.0000 },
  'anthropic/claude-3-haiku': { totalCost: 0.0059, totalTokens: 8650, costPerToken: 0.0000007 },
  'openai/gpt-3.5-turbo': { totalCost: 0.0237, totalTokens: 8650, costPerToken: 0.0000027 },
  'openai/gpt-4-turbo': { totalCost: 0.1298, totalTokens: 8650, costPerToken: 0.0000150 }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Token Cost Calculator API (Demo)',
    timestamp: new Date().toISOString(),
    version: '1.0.0-demo'
  });
});

// Get available content types
app.get('/api/tokens/content-types', (req, res) => {
  res.json({
    success: true,
    contentTypes: mockContentTypes
  });
});

// Get cost estimate for specific content type
app.get('/api/tokens/estimate', (req, res) => {
  const { contentType, provider = 'ollama', model = 'llama2:7b' } = req.query;
  
  if (!contentType || !mockContentTypes[contentType]) {
    return res.status(400).json({
      error: 'Content type is required',
      availableTypes: Object.keys(mockContentTypes)
    });
  }

  const content = mockContentTypes[contentType];
  const totalTokens = content.avgTokens;
  
  // Mock breakdown
  const breakdown = {};
  const stepsPerType = {
    political_content: ['research', 'outline', 'script_generation', 'fact_checking', 'tone_adjustment', 'verification', 'thumbnail', 'description', 'tags'],
    ai_content: ['research', 'technical_analysis', 'script_generation', 'code_examples', 'explanation', 'verification', 'thumbnail', 'description', 'tags'],
    viral_shorts: ['trend_analysis', 'hook_generation', 'script_generation', 'viral_optimization', 'verification', 'thumbnail', 'description', 'hashtags'],
    educational: ['curriculum_planning', 'content_structuring', 'script_generation', 'examples_generation', 'quiz_creation', 'verification', 'thumbnail', 'description', 'tags'],
    audio_analysis: ['transcription', 'text_analysis', 'key_points', 'summarization', 'categorization', 'action_items', 'verification'],
    multimedia_analysis: ['image_ocr', 'image_analysis', 'video_analysis', 'content_extraction', 'cross_media_synthesis', 'verification']
  };

  const steps = stepsPerType[contentType] || [];
  const tokensPerStep = Math.floor(totalTokens / steps.length);
  
  steps.forEach((step, index) => {
    const inputTokens = Math.floor(tokensPerStep * 0.4);
    const outputTokens = Math.floor(tokensPerStep * 0.6);
    const aiRequired = step !== 'verification';
    
    breakdown[step] = {
      step: step,
      aiRequired: aiRequired,
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      audioMinutes: step === 'transcription' ? 10 : 0,
      inputCost: provider === 'ollama' ? 0 : inputTokens * 0.0000005,
      outputCost: provider === 'ollama' ? 0 : outputTokens * 0.0000015,
      audioCost: 0,
      totalCost: provider === 'ollama' ? 0 : (inputTokens * 0.0000005 + outputTokens * 0.0000015)
    };
  });

  const totalCost = Object.values(breakdown).reduce((sum, step) => sum + step.totalCost, 0);

  res.json({
    contentType: contentType,
    provider: provider,
    model: model,
    summary: {
      totalSteps: steps.length,
      aiRequiredSteps: steps.filter(s => s !== 'verification').length,
      totalInputTokens: Math.floor(totalTokens * 0.4),
      totalOutputTokens: Math.floor(totalTokens * 0.6),
      totalTokens: totalTokens,
      totalAudioMinutes: contentType === 'audio_analysis' ? 10 : 0,
      totalInputCost: Math.round((provider === 'ollama' ? 0 : totalTokens * 0.4 * 0.0000005) * 10000) / 10000,
      totalOutputCost: Math.round((provider === 'ollama' ? 0 : totalTokens * 0.6 * 0.0000015) * 10000) / 10000,
      totalAudioCost: 0,
      totalCost: Math.round(totalCost * 10000) / 10000
    },
    breakdown: breakdown,
    timestamp: new Date().toISOString()
  });
});

// Get provider comparison
app.get('/api/tokens/comparison', (req, res) => {
  const { contentType } = req.query;
  
  if (!contentType || !mockContentTypes[contentType]) {
    return res.status(400).json({
      error: 'Content type is required'
    });
  }

  res.json({
    contentType: contentType,
    comparison: mockProviderCosts,
    cheapest: 'ollama/llama2:7b',
    timestamp: new Date().toISOString()
  });
});

// Get monthly projection
app.get('/api/tokens/projection', (req, res) => {
  const { contentType, videosPerWeek, provider = 'ollama', model = 'llama2:7b' } = req.query;
  
  if (!contentType || !videosPerWeek) {
    return res.status(400).json({
      error: 'Content type and videos per week are required'
    });
  }

  const content = mockContentTypes[contentType];
  const costPerVideo = provider === 'ollama' ? 0 : 0.05;
  const videosPerMonth = parseFloat(videosPerWeek) * 4.33;

  res.json({
    contentType: contentType,
    provider: provider,
    model: model,
    videosPerWeek: parseInt(videosPerWeek),
    videosPerMonth: Math.round(videosPerMonth * 100) / 100,
    costPerVideo: costPerVideo,
    monthlyTotal: Math.round(costPerVideo * videosPerMonth * 100) / 100,
    breakdown: {
      inputTokensPerMonth: content.avgTokens * 0.4 * videosPerMonth,
      outputTokensPerMonth: content.avgTokens * 0.6 * videosPerMonth,
      totalTokensPerMonth: content.avgTokens * videosPerMonth
    },
    timestamp: new Date().toISOString()
  });
});

// NEW: Add quota endpoint for demo
app.get('/api/tokens/quota', (req, res) => {
  // Mock quota information for demo purposes
  const mockQuota = {
    dailyLimit: 50.0,
    monthlyLimit: 1000.0,
    emergencyLimit: 100.0,
    dailyUsed: 12.50,
    monthlyUsed: 245.75,
    emergencyUsed: 12.50,
    dailyRemaining: 37.50,
    monthlyRemaining: 754.25,
    emergencyRemaining: 87.50,
    lastReset: new Date().toISOString()
  };
  
  res.json(mockQuota);
});

// Video Discovery API Endpoints

// Discover top videos
app.get('/api/discovery/videos', async (req, res) => {
  try {
    const { category = 'all', timeframe = '7d', limit = 50 } = req.query;
    console.log(`🔍 Video discovery request: ${category}, ${timeframe}, ${limit}`);
    
    const results = await videoDiscovery.discoverTopVideos(category, timeframe, parseInt(limit));
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('❌ Video discovery failed:', error);
    res.status(500).json({
      error: 'Video discovery failed',
      message: error.message
    });
  }
});

// Get trending topics
app.get('/api/discovery/trends', async (req, res) => {
  try {
    const { category = 'all', limit = 20 } = req.query;
    console.log(`📈 Trends request: ${category}, ${limit}`);
    
    const trends = await videoDiscovery.getTrendingTopics(category, parseInt(limit));
    res.json({
      success: true,
      trends,
      category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Trend analysis failed:', error);
    res.status(500).json({
      error: 'Trend analysis failed',
      message: error.message
    });
  }
});

// Audio Extraction API Endpoints

// Extract audio from discovered videos
app.post('/api/extraction/extract', async (req, res) => {
  try {
    const { videos, quality = 'medium', maxConcurrent = 2 } = req.body;
    
    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({
        error: 'Videos array is required',
        example: { videos: [{ videoId: 'abc123', title: 'Video Title', channelTitle: 'Channel' }] }
      });
    }
    
    console.log(`🎵 Audio extraction request for ${videos.length} videos`);
    
    const results = await audioExtraction.extractAudioFromVideos(videos, {
      quality,
      maxConcurrent
    });
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('❌ Audio extraction failed:', error);
    res.status(500).json({
      error: 'Audio extraction failed',
      message: error.message
    });
  }
});

// Extract audio from single video
app.post('/api/extraction/extract-single', async (req, res) => {
  try {
    const { video, quality = 'medium' } = req.body;
    
    if (!video || !video.videoId) {
      return res.status(400).json({
        error: 'Video object with videoId is required'
      });
    }
    
    console.log(`🎵 Single audio extraction: ${video.videoId}`);
    
    const result = await audioExtraction.extractAudioFromVideo(video, { quality });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('❌ Single audio extraction failed:', error);
    res.status(500).json({
      error: 'Single audio extraction failed',
      message: error.message
    });
  }
});

// Get extraction service stats
app.get('/api/extraction/stats', (req, res) => {
  try {
    const stats = audioExtraction.getStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to get extraction stats:', error);
    res.status(500).json({
      error: 'Failed to get extraction statistics',
      message: error.message
    });
  }
});

// Cleanup old audio files
app.post('/api/extraction/cleanup', async (req, res) => {
  try {
    const { maxAgeHours = 24 } = req.body;
    
    console.log(`🧹 Cleanup request: max age ${maxAgeHours} hours`);
    
    const result = await audioExtraction.cleanupOldFiles(maxAgeHours);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      message: error.message
    });
  }
});

// YouTube API Configuration Check
app.get('/api/youtube/config-check', (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const isConfigured = !!(apiKey && apiKey !== 'your_youtube_api_key_here');
    
    res.json({
      success: true,
      youtube_api: {
        configured: isConfigured,
        key_length: isConfigured ? apiKey.length : 0,
        key_prefix: isConfigured ? apiKey.substring(0, 8) + '...' : 'Not set',
        mock_mode: !isConfigured,
        setup_instructions: !isConfigured ? {
          step1: 'Visit https://console.cloud.google.com/apis/credentials',
          step2: 'Create API key and enable YouTube Data API v3',
          step3: 'Set YOUTUBE_API_KEY in .env file',
          step4: 'Restart the service'
        } : null
      },
      quota_info: {
        daily_limit: 10000,
        cost_per_request: 'varies by endpoint',
        monitor_at: 'https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check YouTube API configuration',
      message: error.message
    });
  }
});

app.post('/api/pipeline/discover-and-extract', async (req, res) => {
  try {
    const { 
      category = 'all', 
      timeframe = '7d', 
      limit = 10,
      audioQuality = 'medium',
      maxConcurrent = 2
    } = req.body;
    
    console.log(`🔄 Starting combined discovery + extraction pipeline`);
    
    // Step 1: Discover videos
    const discovery = await videoDiscovery.discoverTopVideos(category, timeframe, limit);
    
    if (!discovery.videos || discovery.videos.length === 0) {
      return res.json({
        success: true,
        message: 'No videos found for extraction',
        discovery,
        extraction: { summary: { total: 0, successful: 0, failed: 0 }, results: [] }
      });
    }
    
    // Step 2: Extract audio from discovered videos
    const extraction = await audioExtraction.extractAudioFromVideos(
      discovery.videos.slice(0, Math.min(limit, 5)), // Limit for demo
      { quality: audioQuality, maxConcurrent }
    );
    
    res.json({
      success: true,
      pipeline: {
        discovery,
        extraction
      },
      summary: {
        videosDiscovered: discovery.videos.length,
        audioFilesExtracted: extraction.summary.successful,
        totalPipelineTime: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    res.status(500).json({
      error: 'Discovery + Extraction pipeline failed',
      message: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
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
      'GET /api/tokens/content-types',
      'GET /api/tokens/estimate',
      'GET /api/tokens/comparison',
      'GET /api/tokens/projection',
      'GET /api/discovery/videos',
      'GET /api/discovery/trends',
      'GET /api/discovery/stats',
      'GET /api/youtube/config-check',
      'POST /api/extraction/extract',
      'POST /api/extraction/extract-single',
      'GET /api/extraction/stats',
      'POST /api/extraction/cleanup',
      'POST /api/pipeline/discover-and-extract'
    ]
  });
});

app.listen(PORT, () => {
  console.log('🚀 Token Cost Calculator API (Demo) running on port ' + PORT);
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  console.log('🔧 API Base: http://localhost:' + PORT);
});