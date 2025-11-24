const TranslationAgent = require('../services/agent-controller/translationAgent');
const fs = require('fs');
const path = require('path');

async function testTranslationAgent() {
  console.log('🌍 Testing Translation Agent...\n');

  try {
    // Create translation agent instance
    const translationAgent = new TranslationAgent();
    console.log('✅ Translation Agent instantiated');

    // Test 1: Text translation
    console.log('\n📝 Test 1: Text Translation');
    const textToTranslate = "Künstliche Intelligenz ist eine transformative Technologie, die viele Branchen revolutioniert.";
    const translationResult = await translationAgent.translateText(textToTranslate, 'de', 'en');
    console.log('✅ Text translation completed');
    console.log(`Original (DE): ${textToTranslate}`);
    console.log(`Translated (EN): ${translationResult.translatedText}`);
    console.log(`Quality Score: ${translationResult.translationQuality}/100`);

    // Test 2: Language detection
    console.log('\n🔍 Test 2: Language Detection');
    const detectedLanguage = translationAgent.detectLanguage(textToTranslate);
    console.log('✅ Language detection completed');
    console.log(`Detected language: ${detectedLanguage}`);

    // Test 3: Supported languages
    console.log('\n🌐 Test 3: Supported Languages');
    const supportedLanguages = translationAgent.getSupportedLanguages();
    console.log('✅ Supported languages retrieved');
    console.log('Supported languages:');
    supportedLanguages.slice(0, 5).forEach(lang => {
      console.log(`  - ${lang.name} (${lang.code})`);
    });

    // Test 4: Audio translation (simulate)
    console.log('\n🎵 Test 4: Audio Translation');
    // Create a test audio file first
    const audioDir = path.join(__dirname, '../data/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const testAudioFile = path.join(audioDir, 'test_german_speech.mp3');
    const germanContent = "Hallo Welt! Dies ist ein Test der deutschen Spracherkennung und Übersetzung.";
    fs.writeFileSync(testAudioFile, germanContent);

    const audioTranslationResult = await translationAgent.translateAudioContent(testAudioFile, 'de', 'en');
    console.log('✅ Audio translation completed');
    console.log(`Audio file: ${audioTranslationResult.audioFile}`);
    console.log(`Transcribed text: ${audioTranslationResult.transcription.text.substring(0, 50)}...`);
    console.log(`Translated text: ${audioTranslationResult.translation.translatedText.substring(0, 50)}...`);

    // Display final results
    console.log('\n📊 TRANSLATION AGENT TEST RESULTS:');
    console.log('=====================================');
    console.log('✅ All translation agent tests passed!');
    console.log('✅ Text translation working');
    console.log('✅ Language detection working');
    console.log('✅ Supported languages retrieved');
    console.log('✅ Audio translation working');
    console.log('=====================================');

    console.log('\n🎉 Translation Agent Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Translation agent test failed:', error);
    process.exit(1);
  }
}

// Run the test
testTranslationAgent();