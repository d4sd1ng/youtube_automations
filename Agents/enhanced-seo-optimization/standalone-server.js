const express = require('express');
const cors = require('cors');
const path = require('path');
const EnhancedSEOOptimizationService = require('./enhancedSEOOptimizationService');

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
const PORT = 3009;

// Middleware
app.use(cors());
app.use(express.json());

// Create service instance
const seoService = new EnhancedSEOOptimizationService();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Enhanced SEO Optimization API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Generate SEO prompt
app.post('/api/seo/prompt', async (req, res) => {
  try {
    const { category, keywords, topic } = req.body;

    if (!category || !keywords || !topic) {
      return res.status(400).json({
        error: 'Category, keywords, and topic are required'
      });
    }

    const result = await seoService.generateSEOPrompt(category, keywords, topic);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate SEO prompt:', error);
    res.status(500).json({
      error: 'Failed to generate SEO prompt',
      message: error.message
    });
  }
});

// Perform SEO keyword research
app.post('/api/seo/keyword-research', async (req, res) => {
  try {
    const { topic, options } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Topic is required'
      });
    }

    const result = await seoService.performSEOKeywordResearch(topic, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to perform SEO keyword research:', error);
    res.status(500).json({
      error: 'Failed to perform SEO keyword research',
      message: error.message
    });
  }
});

// Generate image SEO data
app.post('/api/seo/image', async (req, res) => {
  try {
    const { imagePath, keywords, context } = req.body;

    if (!imagePath || !keywords || !context) {
      return res.status(400).json({
        error: 'Image path, keywords, and context are required'
      });
    }

    const result = await seoService.generateImageSEOData(imagePath, keywords, context);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate image SEO data:', error);
    res.status(500).json({
      error: 'Failed to generate image SEO data',
      message: error.message
    });
  }
});

// Generate automated content
app.post('/api/seo/content', async (req, res) => {
  try {
    const { keywords, contentType, targetAudience } = req.body;

    if (!keywords || !contentType || !targetAudience) {
      return res.status(400).json({
        error: 'Keywords, content type, and target audience are required'
      });
    }

    const result = await seoService.generateAutomatedContent(keywords, contentType, targetAudience);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate automated content:', error);
    res.status(500).json({
      error: 'Failed to generate automated content',
      message: error.message
    });
  }
});

// Optimize for AI search
app.post('/api/seo/ai-optimization', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    const result = await seoService.optimizeForAISearch(content);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to optimize for AI search:', error);
    res.status(500).json({
      error: 'Failed to optimize for AI search',
      message: error.message
    });
  }
});

// Create content cluster
app.post('/api/seo/content-cluster', async (req, res) => {
  try {
    const { mainTopic, subtopics } = req.body;

    if (!mainTopic || !subtopics) {
      return res.status(400).json({
        error: 'Main topic and subtopics are required'
      });
    }

    const result = await seoService.createContentCluster(mainTopic, subtopics);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to create content cluster:', error);
    res.status(500).json({
      error: 'Failed to create content cluster',
      message: error.message
    });
  }
});

// Batch SEO optimization
app.post('/api/seo/batch', async (req, res) => {
  try {
    const { items, optimizationType } = req.body;

    if (!items || !optimizationType) {
      return res.status(400).json({
        error: 'Items and optimization type are required'
      });
    }

    const result = await seoService.batchOptimizeSEO(items, optimizationType);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to perform batch SEO optimization:', error);
    res.status(500).json({
      error: 'Failed to perform batch SEO optimization',
      message: error.message
    });
  }
});

// Generate channel description
app.post('/api/seo/channel/description', async (req, res) => {
  try {
    const { channelData, config } = req.body;

    if (!channelData) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await seoService.generateChannelDescription(channelData, config);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate channel description:', error);
    res.status(500).json({
      error: 'Failed to generate channel description',
      message: error.message
    });
  }
});

// Generate channel keywords
app.post('/api/seo/channel/keywords', async (req, res) => {
  try {
    const { channelData, config } = req.body;

    if (!channelData) {
      return res.status(400).json({
        error: 'Channel data is required'
      });
    }

    const result = await seoService.generateChannelKeywords(channelData, config);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate channel keywords:', error);
    res.status(500).json({
      error: 'Failed to generate channel keywords',
      message: error.message
    });
  }
});

// Generate long-form video description
app.post('/api/seo/video/long-form', async (req, res) => {
  try {
    const { videoData, config } = req.body;

    if (!videoData) {
      return res.status(400).json({
        error: 'Video data is required'
      });
    }

    const result = await seoService.generateLongFormVideoDescription(videoData, config);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate long-form video description:', error);
    res.status(500).json({
      error: 'Failed to generate long-form video description',
      message: error.message
    });
  }
});

// Generate shorts video description
app.post('/api/seo/video/shorts', async (req, res) => {
  try {
    const { videoData, config } = req.body;

    if (!videoData) {
      return res.status(400).json({
        error: 'Video data is required'
      });
    }

    const result = await seoService.generateShortVideoDescription(videoData, config);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to generate shorts video description:', error);
    res.status(500).json({
      error: 'Failed to generate shorts video description',
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
      'POST /api/seo/prompt',
      'POST /api/seo/keyword-research',
      'POST /api/seo/image',
      'POST /api/seo/content',
      'POST /api/seo/ai-optimization',
      'POST /api/seo/content-cluster',
      'POST /api/seo/batch',
      'POST /api/seo/channel/description',
      'POST /api/seo/channel/keywords',
      'POST /api/seo/video/long-form',
      'POST /api/seo/video/shorts'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced SEO Optimization API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});