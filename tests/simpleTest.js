const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');

async function testCreatePipeline() {
  const orchestrator = new PipelineOrchestrator();

  const config = {
    scrapeContent: true,
    generateScripts: false,
    createThumbnails: true,
    contentType: 'tutorial',
    targetLength: '10min',
    tone: 'educational',
    audience: 'developers',
    maxScripts: 3
  };

  try {
    const result = await orchestrator.createPipeline(config);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('Config in result:', JSON.stringify(result.config, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testCreatePipeline();