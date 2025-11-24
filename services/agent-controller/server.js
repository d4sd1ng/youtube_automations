const express = require('express');
const cors = require('cors');
const AgentPool = require('./agentPool');
const AvatarGenerationAgent = require('./modules/avatar-generation/avatarGenerationAgent');
const VideoProcessingAgent = require('./modules/video-processing/videoProcessingAgent');
const ScriptGenerationAgent = require('./modules/script-generation/scriptGenerationAgent');
const SEOOptimizationAgent = require('./modules/seo-optimization/seoOptimizationAgent');
const WebScrapingAgent = require('./modules/web-scraping/webScrapingAgent');
const ContentApprovalAgent = require('./modules/content-approval/contentApprovalAgent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize agent pool
const agentPool = new AgentPool();

// Register agents
const avatarAgent = new AvatarGenerationAgent();
const videoAgent = new VideoProcessingAgent();
const scriptAgent = new ScriptGenerationAgent();
const seoAgent = new SEOOptimizationAgent();
const scrapingAgent = new WebScrapingAgent();
const contentApprovalAgent = new ContentApprovalAgent();
agentPool.registerAgent(avatarAgent);
agentPool.registerAgent(videoAgent);
agentPool.registerAgent(scriptAgent);
agentPool.registerAgent(seoAgent);
agentPool.registerAgent(scrapingAgent);
agentPool.registerAgent(contentApprovalAgent);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Agent Controller running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base: http://localhost:${PORT}`);
});