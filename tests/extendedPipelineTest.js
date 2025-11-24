const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');
const fs = require('fs');
const path = require('path');

async function extendedPipelineTest() {
  console.log('🔄 Extended Pipeline Test with SEO and Monetization...\n');

  try {
    // Create pipeline orchestrator instance
    const orchestrator = new PipelineOrchestrator();
    console.log('✅ Pipeline Orchestrator instantiated');

    // Test extended pipeline with SEO and monetization
    console.log('\n🚀 Test: Extended Content Pipeline with SEO and Monetization');
    const config = {
      channelId: 'extended-test-001',
      topic: 'Künstliche Intelligenz und Machine Learning',
      scrapeContent: true,
      generateScripts: true,
      createThumbnails: true,
      contentType: 'tutorial',
      targetLength: '12min',
      tone: 'educational',
      audience: 'developers',
      trendingKeywords: ['AI', 'Machine Learning', 'Neural Networks', 'Deep Learning'],
      maxScripts: 3,
      // SEO parameters
      optimizeForSEO: true,
      targetPlatforms: ['youtube', 'linkedin', 'medium'],
      // Monetization parameters
      analyzeMonetization: true,
      estimatedViews: 10000,
      // Translation parameters
      translateTo: ['en', 'fr', 'es'],
      enableTranslation: true
    };

    console.log('🔧 Creating extended pipeline...');
    const pipelineResult = await orchestrator.createPipeline(config);
    console.log('✅ Extended pipeline completed');

    // Display detailed results
    console.log('\n📊 EXTENDED PIPELINE RESULTS:');
    console.log('=====================================');
    console.log(`Pipeline ID: ${pipelineResult.pipelineId}`);
    console.log(`Channel ID: ${pipelineResult.channelId}`);
    console.log(`Topic: ${pipelineResult.topic}`);
    console.log(`Status: ${pipelineResult.status}`);
    console.log(`Steps completed: ${Object.keys(pipelineResult.steps).length}`);

    Object.keys(pipelineResult.steps).forEach(stepId => {
      const step = pipelineResult.steps[stepId];
      console.log(`  ${step.status === 'completed' ? '✅' : '❌'} ${stepId}: ${step.status}`);
    });

    // Show SEO results if available
    if (pipelineResult.seoOptimization) {
      console.log('\n🔍 SEO OPTIMIZATION RESULTS:');
      console.log(`  SEO Score: ${pipelineResult.seoOptimization.seoScore}/100`);
      console.log(`  Recommended Keywords: ${pipelineResult.seoOptimization.recommendedKeywords.join(', ')}`);
      console.log(`  Content Suggestions: ${pipelineResult.seoOptimization.contentSuggestions.length}`);
    }

    // Show monetization results if available
    if (pipelineResult.monetization) {
      console.log('\n💰 MONETIZATION ANALYSIS:');
      console.log(`  Estimated Views: ${pipelineResult.monetization.estimatedViews}`);
      console.log(`  Potential Earnings: $${pipelineResult.monetization.potentialEarnings.toFixed(2)}`);
      console.log(`  Revenue Breakdown: ${Object.keys(pipelineResult.monetization.revenueBreakdown).length} sources`);
    }

    // Show translation results if available
    if (pipelineResult.translations) {
      console.log('\n🌍 TRANSLATION RESULTS:');
      console.log(`  Translations completed: ${pipelineResult.translations.length}`);
      pipelineResult.translations.forEach((translation, index) => {
        console.log(`    ${index + 1}. ${translation.sourceLanguage} → ${translation.targetLanguage}`);
      });
    }

    console.log('=====================================');

    // Save detailed results
    const outputDir = path.join(__dirname, '../data/outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = path.join(outputDir, `extended_pipeline_${timestamp}.json`);

    fs.writeFileSync(resultsFile, JSON.stringify(pipelineResult, null, 2));
    console.log(`\n✅ Detailed results saved to: ${resultsFile}`);

    console.log('\n🎉 Extended Pipeline Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Extended pipeline test failed:', error);
    process.exit(1);
  }
}

// Run the test
extendedPipelineTest();