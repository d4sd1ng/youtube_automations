const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');

async function testExtendedPipeline() {
  const orchestrator = new PipelineOrchestrator();

  // Test mit benutzerdefinierten Parametern
  const config = {
    channelId: 'test-channel-001',
    topic: 'Künstliche Intelligenz in der Softwareentwicklung',
    scrapeContent: true,
    generateScripts: true,
    createThumbnails: true,
    contentType: 'tutorial',
    targetLength: '15min',
    tone: 'educational',
    audience: 'developers',
    trendingKeywords: ['AI', 'Machine Learning', 'Neural Networks'],
    maxScripts: 5
  };

  try {
    console.log('🧪 Starte erweiterten Pipeline-Test...');
    const result = await orchestrator.createPipeline(config);

    console.log('✅ Pipeline erfolgreich abgeschlossen!');
    console.log('Pipeline ID:', result.pipelineId);
    console.log('Status:', result.status);

    // Überprüfe die einzelnen Schritte
    Object.keys(result.steps).forEach(stepId => {
      const step = result.steps[stepId];
      console.log(`  ${step.status === 'completed' ? '✅' : '❌'} ${stepId}: ${step.status}`);
    });

    // Zeige einige Ergebnisse
    if (result.steps.scriptGeneration && result.steps.scriptGeneration.result) {
      console.log('\\n📝 Script Vorschau:');
      console.log(result.steps.scriptGeneration.result.content.substring(0, 200) + '...');
    }

    if (result.steps.thumbnailGeneration && result.steps.thumbnailGeneration.result) {
      console.log('\\n🖼️ Thumbnail Design:');
      console.log(JSON.stringify(result.steps.thumbnailGeneration.result.design, null, 2));
    }

    console.log('\\n📊 Konfiguration:');
    console.log(JSON.stringify(result.config, null, 2));

  } catch (error) {
    console.error('❌ Fehler im erweiterten Test:', error);
  }
}

testExtendedPipeline();