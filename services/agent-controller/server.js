const express = require('express');
const cors = require('cors');
const AgentPool = require('./agentPool');
const PipelineOrchestrator = require('./pipelineOrchestrator');

// Core agents (existing)
const AvatarGenerationAgent = require('./modules/avatar-generation/avatarGenerationAgent');
const VideoProcessingAgent = require('./modules/video-processing/videoProcessingAgent');
const ScriptGenerationAgent = require('./modules/script-generation/scriptGenerationAgent');
const SEOOptimizationAgent = require('./modules/seo-optimization/seoOptimizationAgent');
const WebScrapingAgent = require('./modules/web-scraping/webScrapingAgent');
const ContentApprovalAgent = require('./modules/content-approval/contentApprovalAgent');

// New agents from agents-orchestrator
const AudioToTextAgent = require('../../Agents/audio-to-text/audioToTextService');
const AuthService = require('../../Agents/auth-service/authService');
const BillingServiceAgent = require('../../Agents/billing-service/billingServiceAgent');
const BookWriterAgent = require('../../Agents/book-writer/bookWriterAgent');
const DatabaseAgent = require('../../Agents/database/dbService');
const DocumentExportAgent = require('../../Agents/document-export/documentExportService');
const EmailAgent = require('../../Agents/email-agent/emailAgentService');
const EnhancedSEOOptimizationAgent = require('../../Agents/enhanced-seo-optimization/enhancedSEOOptimizationService');
const RateLimiterAgent = require('../../Agents/rate-limiter/rateLimiter');
const ScriptGenerationAgent2 = require('../../Agents/script-generation/scriptGenerationAgent');
const SEOChannelOptimizationAgent = require('../../Agents/seo-channel-optimization/seoChannelOptimizationService');
const SEOLinkedInOptimizationAgent = require('../../Agents/seo-linkedin-optimization/seoLinkedInOptimizationService');
const SEOOptimizationAgent2 = require('../../Agents/seo-optimization/seoOptimizationAgent');
const SEOOptimizationAgent3 = require('../../Agents/seo-optimization-agent/seoOptimizationAgent');
const SEOVideoOptimizationAgent = require('../../Agents/seo-video-optimization/seoVideoOptimizationService');
const ThumbnailGenerationAgent = require('../../Agents/thumbnail-generation/thumbnailGenerationService');
const TokenCostCalculatorAgent = require('../../Agents/token-cost-calculator/tokenCostCalculator');
const TrendAnalysisAgent = require('../../Agents/trend-analysis/trendAnalysisService');
const VideoProcessingAgent2 = require('../../Agents/video-processing/videoProcessingAgent');
const WebScrapingAgent2 = require('../../Agents/web-scraping/webScrapingAgent');
const ContentApprovalAgent2 = require('../../Agents/content-approval/contentApprovalAgent');

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001

// Middleware
app.use(cors());
app.use(express.json());

// Initialize agent pool
const agentPool = new AgentPool();

// Register core agents
const avatarAgent = new AvatarGenerationAgent();
const videoAgent = new VideoProcessingAgent();
const scriptAgent = new ScriptGenerationAgent();
const seoAgent = new SEOOptimizationAgent();
const scrapingAgent = new WebScrapingAgent();
const contentApprovalAgent = new ContentApprovalAgent();

// Register new agents
const audioToTextAgent = new AudioToTextAgent();
const authAgent = new AuthService();
const billingAgent = new BillingServiceAgent();
const bookWriterAgent = new BookWriterAgent();
const databaseAgent = new DatabaseAgent();
const documentExportAgent = new DocumentExportAgent();
const emailAgent = new EmailAgent();
const enhancedSEOOptimizationAgent = new EnhancedSEOOptimizationAgent();
const rateLimiterAgent = new RateLimiterAgent();
const scriptGenerationAgent2 = new ScriptGenerationAgent2();
const seoChannelOptimizationAgent = new SEOChannelOptimizationAgent();
const seoLinkedInOptimizationAgent = new SEOLinkedInOptimizationAgent();
const seoOptimizationAgent2 = new SEOOptimizationAgent2();
const seoOptimizationAgent3 = new SEOOptimizationAgent3();
const seoVideoOptimizationAgent = new SEOVideoOptimizationAgent();
const thumbnailGenerationAgent = new ThumbnailGenerationAgent();
const tokenCostCalculatorAgent = new TokenCostCalculatorAgent();
const trendAnalysisAgent = new TrendAnalysisAgent();
const videoProcessingAgent2 = new VideoProcessingAgent2();
const webScrapingAgent2 = new WebScrapingAgent2();
const contentApprovalAgent2 = new ContentApprovalAgent2();

agentPool.registerAgent(avatarAgent);
agentPool.registerAgent(videoAgent);
agentPool.registerAgent(scriptAgent);
agentPool.registerAgent(seoAgent);
agentPool.registerAgent(scrapingAgent);
agentPool.registerAgent(contentApprovalAgent);

// Register new agents
agentPool.registerAgent(audioToTextAgent);
agentPool.registerAgent(authAgent);
agentPool.registerAgent(billingAgent);
agentPool.registerAgent(bookWriterAgent);
agentPool.registerAgent(databaseAgent);
agentPool.registerAgent(documentExportAgent);
agentPool.registerAgent(emailAgent);
agentPool.registerAgent(enhancedSEOOptimizationAgent);
agentPool.registerAgent(rateLimiterAgent);
agentPool.registerAgent(scriptGenerationAgent2);
agentPool.registerAgent(seoChannelOptimizationAgent);
agentPool.registerAgent(seoLinkedInOptimizationAgent);
agentPool.registerAgent(seoOptimizationAgent2);
agentPool.registerAgent(seoOptimizationAgent3);
agentPool.registerAgent(seoVideoOptimizationAgent);
agentPool.registerAgent(thumbnailGenerationAgent);
agentPool.registerAgent(tokenCostCalculatorAgent);
agentPool.registerAgent(trendAnalysisAgent);
agentPool.registerAgent(videoProcessingAgent2);
agentPool.registerAgent(webScrapingAgent2);
agentPool.registerAgent(contentApprovalAgent2);

// Initialize pipeline orchestrator
const pipelineOrchestrator = new PipelineOrchestrator({
  agentPool: agentPool,
  webScrapingService: scrapingAgent
});

// Channel configurations
const CHANNELS = {
  senara: {
    id: 'senara',
    name: 'Senara',
    description: 'Politik und Gesellschaft',
    keywords: ['Politik', 'Regierung', 'Demokratie', 'Bundestag'],
    sources: ['bundestag', 'news', 'talkshows']
  },
  neurova: {
    id: 'neurova',
    name: 'Neurova',
    description: 'Technologie und Innovation',
    keywords: ['KI', 'Technologie', 'Innovation', 'Software'],
    sources: ['tech-news', 'ai-research', 'business-platforms']
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    agents: agentPool.listAgents()
  });
});

// Agent status endpoint
app.get('/status', (req, res) => {
  res.json(agentPool.getStatus());
});

// Endpoint to trigger daily automation for a specific channel
app.post('/automate/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Validate channel
    if (!CHANNELS[channelId]) {
      return res.status(400).json({ error: `Invalid channel ID: ${channelId}` });
    }
    
    const channelConfig = CHANNELS[channelId];
    
    // Create pipeline configuration
    const pipelineConfig = {
      channelId: channelConfig.id,
      channelName: channelConfig.name,
      topic: `Daily Automation for ${channelConfig.name}`,
      keywords: channelConfig.keywords,
      sources: channelConfig.sources,
      generateScripts: true,
      createVideo: true,
      generateThumbnails: true,
      optimizeSEO: true,
      translateContent: false
    };
    
    // Create and execute pipeline
    const pipelineId = await pipelineOrchestrator.createPipeline(pipelineConfig);
    const results = await pipelineOrchestrator.executePipeline(pipelineId);
    
    res.json({
      success: true,
      pipelineId,
      channelId,
      results
    });
  } catch (error) {
    console.error(`❌ Automation failed for channel ${req.params.channelId}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint to trigger daily automation for all channels
app.post('/automate-all', async (req, res) => {
  try {
    const results = [];
    
    // Run automation for each channel
    for (const [channelId, channelConfig] of Object.entries(CHANNELS)) {
      try {
        // Create pipeline configuration
        const pipelineConfig = {
          channelId: channelConfig.id,
          channelName: channelConfig.name,
          topic: `Daily Automation for ${channelConfig.name}`,
          keywords: channelConfig.keywords,
          sources: channelConfig.sources,
          generateScripts: true,
          createVideo: true,
          generateThumbnails: true,
          optimizeSEO: true,
          translateContent: false
        };
        
        // Create and execute pipeline
        const pipelineId = await pipelineOrchestrator.createPipeline(pipelineConfig);
        const pipelineResults = await pipelineOrchestrator.executePipeline(pipelineId);
        
        results.push({
          channelId,
          success: true,
          pipelineId,
          results: pipelineResults
        });
      } catch (error) {
        console.error(`❌ Automation failed for channel ${channelId}:`, error);
        results.push({
          channelId,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('❌ Automation failed for all channels:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get pipeline status
app.get('/pipeline/:pipelineId', (req, res) => {
  const { pipelineId } = req.params;
  const status = pipelineOrchestrator.getPipelineStatus(pipelineId);
  
  if (!status) {
    return res.status(404).json({ error: `Pipeline ${pipelineId} not found` });
  }
  
  res.json(status);
});

// Get pipeline results
app.get('/pipeline/:pipelineId/results', (req, res) => {
  const { pipelineId } = req.params;
  const results = pipelineOrchestrator.getPipelineResults(pipelineId);
  
  if (!results) {
    return res.status(404).json({ error: `Pipeline ${pipelineId} results not found` });
  }
  
  res.json(results);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Agent Controller running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
  console.log(`🤖 Automation endpoints:`);
  console.log(`   - Single channel: POST http://localhost:${PORT}/automate/:channelId`);
  console.log(`   - All channels: POST http://localhost:${PORT}/automate-all`);
});