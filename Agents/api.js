const express = require('express');
const cors = require('cors');
const AgentPool = require('./agentPool');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the gui build directory
app.use(express.static(path.join(__dirname, '../gui/build')));

// Initialize agent pool
const agentPool = new AgentPool();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    agents: Array.from(agentPool.activeAgents.keys())
  });
});

// Web Scraping endpoints
app.post('/api/scraping/scrape-all', async (req, res) => {
  try {
    const result = await agentPool.getWebScrapingService().scrapeAllSources();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Script Generation endpoints
app.post('/api/script/generate', async (req, res) => {
  try {
    const { topic, platform, language } = req.body;
    const result = await agentPool.getScriptGenerationService().generateScript(topic, platform, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Production endpoints
app.post('/api/video/produce', async (req, res) => {
  try {
    const { script, format } = req.body;
    const result = await agentPool.getVideoProductionService().produceVideo(script, format);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token Monitor endpoints
app.get('/api/tokens/stats', async (req, res) => {
  try {
    const stats = agentPool.getTokenMonitor().getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEO Optimization endpoints
app.post('/api/seo/optimize', async (req, res) => {
  try {
    const { content, keywords } = req.body;
    const result = await agentPool.getSEOOptimizationService().optimizeContent(content, keywords);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Avatar Generation endpoints
app.post('/api/avatar/generate', async (req, res) => {
  try {
    const { description, style } = req.body;
    const result = await agentPool.getAvatarGenerationService().generateAvatar(description, style);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audio Extraction endpoints
app.post('/api/audio/extract', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const result = await agentPool.getAudioExtractionService().extractAudio(videoUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Document Export endpoints
app.post('/api/document/export', async (req, res) => {
  try {
    const { content, format } = req.body;
    const result = await agentPool.getDocumentExportService().exportDocument(content, format);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced SEO Optimization endpoints
app.post('/api/seo/enhanced-optimize', async (req, res) => {
  try {
    const { content, targetPlatforms } = req.body;
    const result = await agentPool.getEnhancedSEOOptimizationService().optimizeForPlatforms(content, targetPlatforms);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LLM Service endpoints
app.post('/api/llm/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const result = await agentPool.getLLMService().generateContent(prompt, model);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monetization Service endpoints
app.post('/api/monetization/calculate', async (req, res) => {
  try {
    const { content, platform } = req.body;
    const result = await agentPool.getMonetizationService().calculatePotential(content, platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multi Input Service endpoints
app.post('/api/multi-input/process', async (req, res) => {
  try {
    const { inputs } = req.body;
    const result = await agentPool.getMultiInputService().processInputs(inputs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pipeline Orchestrator endpoints
app.post('/api/pipeline/execute', async (req, res) => {
  try {
    const { workflow } = req.body;
    const result = await agentPool.getPipelineOrchestrator().executeWorkflow(workflow);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quality Assurance Service endpoints
app.post('/api/quality/check', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await agentPool.getQualityAssuranceService().checkQuality(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Template Management Service endpoints
app.get('/api/templates/list', async (req, res) => {
  try {
    const templates = await agentPool.getTemplateManagementService().listTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Text Analysis Service endpoints
app.post('/api/text/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await agentPool.getTextAnalysisService().analyzeText(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thumbnail Generation Service endpoints
app.post('/api/thumbnail/generate', async (req, res) => {
  try {
    const { content, style } = req.body;
    const result = await agentPool.getThumbnailGenerationService().generateThumbnail(content, style);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token Cost Calculator endpoints
app.post('/api/token-cost/calculate', async (req, res) => {
  try {
    const { content, model } = req.body;
    const result = await agentPool.getTokenCostCalculator().calculateCost(content, model);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trend Analysis Service endpoints
app.get('/api/trends/analyze', async (req, res) => {
  try {
    const result = await agentPool.getTrendAnalysisService().analyzeTrends();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Repurposing Service endpoints
app.post('/api/video/repurpose', async (req, res) => {
  try {
    const { videoUrl, targetFormat } = req.body;
    const result = await agentPool.getVideoRepurposingService().repurposeVideo(videoUrl, targetFormat);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book Writer Agent endpoints
app.post('/api/book/create', async (req, res) => {
  try {
    const { topic, format, useScraper } = req.body;
    const result = await agentPool.getBookWriterAgent().createBook({
      topic,
      format: format || 'novel',
      useScraper: useScraper !== false
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/book/formats', async (req, res) => {
  try {
    const formats = [
      'paperback',     // Taschenbuch
      'novel',         // Roman
      'biography',     // Biographie
      'non-fiction',   // Fachbuch
      'ebook',         // E-Book
      'audiobook'      // Hörbuch
    ];
    res.json({ formats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the frontend app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../gui/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🎬 YouTube Automations API listening on port ${PORT}`);
});

module.exports = app;