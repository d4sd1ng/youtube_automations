const PipelineOrchestrator = require('./pipelineOrchestrator');

async function testPipelineOrchestrator() {
  console.log('🚀 Testing PipelineOrchestrator...');

  try {
    // Create orchestrator instance
    const orchestrator = new PipelineOrchestrator();

    // Test creating a simple pipeline
    const config = {
      channelId: 'test-channel-001',
      topic: 'Künstliche Intelligenz in der Softwareentwicklung',
      scrapeContent: true,
      generateScripts: true,
      createThumbnails: true,
      contentType: 'tutorial',
      targetLength: '10min',
      tone: 'educational',
      audience: 'developers',
      trendingKeywords: ['AI', 'Machine Learning', 'Neural Networks']
    };

    console.log('🔧 Creating pipeline...');
    const result = await orchestrator.createPipeline(config);

    console.log('✅ Pipeline completed successfully!');
    console.log('Pipeline ID:', result.pipelineId);
    console.log('Status:', result.status);

    // List all pipelines
    const pipelines = orchestrator.listPipelines();
    console.log('📋 All pipelines:', pipelines);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPipelineOrchestrator();