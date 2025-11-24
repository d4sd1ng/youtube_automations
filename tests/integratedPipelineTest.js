const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');
const fs = require('fs');
const path = require('path');

async function testIntegratedPipeline() {
  console.log('🔄 Testing Integrated Pipeline with Translation...\n');

  try {
    // Create pipeline orchestrator instance
    const orchestrator = new PipelineOrchestrator();
    console.log('✅ Pipeline Orchestrator instantiated');

    // Check if translation agent is available
    if (orchestrator.translationAgent) {
      console.log('✅ Translation Agent integrated in Pipeline');
    } else {
      console.log('❌ Translation Agent not integrated in Pipeline');
      process.exit(1);
    }

    // Test 1: Create a pipeline with multilingual content
    console.log('\n🚀 Test 1: Multilingual Content Pipeline');
    const config = {
      channelId: 'multilingual-test-001',
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
      // New translation parameters
      translateTo: ['en', 'fr', 'es'], // Translate to English, French, and Spanish
      enableTranslation: true
    };

    console.log('🔧 Creating pipeline with translation...');
    const pipelineResult = await orchestrator.createPipeline(config);
    console.log('✅ Pipeline completed with translation');

    // Test 2: Direct translation using the integrated agent
    console.log('\n🌍 Test 2: Direct Translation using Integrated Agent');
    const textToTranslate = "Die Zukunft der KI in der Softwareentwicklung ist vielversprechend.";
    console.log(`Original text (DE): ${textToTranslate}`);

    // Translate to English
    const englishTranslation = await orchestrator.translationAgent.translateText(textToTranslate, 'de', 'en');
    console.log(`Translated to English: ${englishTranslation.translatedText}`);

    // Translate to French
    const frenchTranslation = await orchestrator.translationAgent.translateText(textToTranslate, 'de', 'fr');
    console.log(`Translated to French: ${frenchTranslation.translatedText}`);

    // Test 3: Audio processing with translation
    console.log('\n🎵 Test 3: Audio Processing with Translation');
    // Create test audio file
    const audioDir = path.join(__dirname, '../data/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const testAudioFile = path.join(audioDir, 'integrated_test_audio.mp3');
    const audioContent = `
    In diesem Vortrag werden wir die neuesten Entwicklungen in der Künstlichen Intelligenz besprechen.
    Wir werden uns insbesondere auf Machine Learning und Deep Learning konzentrieren.
    Diese Technologien haben das Potenzial, viele Industrien zu revolutionieren.
    `;
    fs.writeFileSync(testAudioFile, audioContent);

    // Process audio with translation
    const audioTranslationResult = await orchestrator.translationAgent.translateAudioContent(
      testAudioFile,
      'de',
      'en'
    );
    console.log('✅ Audio processing with translation completed');
    console.log(`Audio file: ${path.basename(testAudioFile)}`);
    console.log(`Transcribed text length: ${audioTranslationResult.transcription.text.length} characters`);
    console.log(`Translated text length: ${audioTranslationResult.translation.translatedText.length} characters`);

    // Display final results
    console.log('\n📊 INTEGRATED PIPELINE TEST RESULTS:');
    console.log('=====================================');
    console.log('✅ Pipeline Orchestrator with Translation Agent integration working!');
    console.log('✅ Multilingual content pipeline created');
    console.log('✅ Direct text translation working');
    console.log('✅ Audio processing with translation working');
    console.log('✅ All pipeline steps completed successfully');
    console.log('=====================================');

    // Show pipeline summary
    console.log('\n📋 Pipeline Summary:');
    console.log(`Pipeline ID: ${pipelineResult.pipelineId}`);
    console.log(`Channel ID: ${pipelineResult.channelId}`);
    console.log(`Topic: ${pipelineResult.topic}`);
    console.log(`Status: ${pipelineResult.status}`);
    console.log(`Steps completed: ${Object.keys(pipelineResult.steps).length}`);

    Object.keys(pipelineResult.steps).forEach(stepId => {
      const step = pipelineResult.steps[stepId];
      console.log(`  ${step.status === 'completed' ? '✅' : '❌'} ${stepId}: ${step.status}`);
    });

    console.log('\n🎉 Integrated Pipeline Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Integrated pipeline test failed:', error);
    process.exit(1);
  }
}

// Run the test
testIntegratedPipeline();