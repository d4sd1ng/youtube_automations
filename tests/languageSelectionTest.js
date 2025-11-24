const fs = require('fs');
const path = require('path');

// Language Selection Test
async function languageSelectionTest() {
  console.log('🌍 Language Selection Test\n');

  try {
    // Test different language combinations
    const testCases = [
      {
        name: "English to English (No Translation)",
        inputFile: "english_discussion.mp3",
        inputLanguage: "en",
        outputLanguage: "en",
        shouldTranslate: false
      },
      {
        name: "English to German (With Translation)",
        inputFile: "english_discussion.mp3",
        inputLanguage: "en",
        outputLanguage: "de",
        shouldTranslate: true
      },
      {
        name: "German to German (No Translation)",
        inputFile: "german_discussion.mp3",
        inputLanguage: "de",
        outputLanguage: "de",
        shouldTranslate: false
      },
      {
        name: "German to English (With Translation)",
        inputFile: "german_discussion.mp3",
        inputLanguage: "de",
        outputLanguage: "en",
        shouldTranslate: true
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Running Test: ${testCase.name}`);
      console.log('=====================================');
      
      await runLanguageTest(testCase);
    }
    
    console.log('\n🎉 All Language Selection Tests Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run a single language test
async function runLanguageTest(testCase) {
  console.log(`⚙️  Test Configuration:`);
  console.log(`   Input File: ${testCase.inputFile}`);
  console.log(`   Input Language: ${getLanguageName(testCase.inputLanguage)}`);
  console.log(`   Output Language: ${getLanguageName(testCase.outputLanguage)}`);
  console.log(`   Translation: ${testCase.shouldTranslate ? 'Yes' : 'No'}`);
  
  // 1. Create test audio directory if it doesn't exist
  const audioDir = path.join(__dirname, '../data/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log('✅ Created audio directory');
  }
  
  // 2. Create or get audio file
  const audioFile = await createTestAudioFile(testCase.inputFile, testCase.inputLanguage, audioDir);
  
  // 3. Simulate audio transcription
  console.log('\n🔍 Transcribing audio file...');
  const transcriptionResult = await simulateAudioTranscription(audioFile, testCase.inputLanguage);
  console.log('✅ Audio transcription completed');
  
  // 4. Translate if needed
  let processedText = transcriptionResult.text;
  if (testCase.shouldTranslate) {
    console.log(`\n🔄 Translating from ${getLanguageName(testCase.inputLanguage)} to ${getLanguageName(testCase.outputLanguage)}...`);
    processedText = await translateText(transcriptionResult.text, testCase.inputLanguage, testCase.outputLanguage);
    console.log('✅ Translation completed');
  }
  
  // 5. Generate summary in output language
  console.log(`\n📝 Generating summary in ${getLanguageName(testCase.outputLanguage)}...`);
  const summary = await generateSummary(processedText, testCase.outputLanguage);
  console.log('✅ Summary generated');
  
  // 6. Save results
  const outputDir = path.join(__dirname, '../data/outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testCaseName = testCase.name.replace(/\s+/g, '_').toLowerCase();
  const resultsFile = path.join(outputDir, `language_test_${testCaseName}_${timestamp}.json`);
  
  const results = {
    testName: testCase.name,
    originalFile: audioFile,
    transcription: transcriptionResult,
    translatedText: testCase.shouldTranslate ? processedText : null,
    summary: summary,
    configuration: testCase,
    processedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to: ${resultsFile}`);
  
  // 7. Display results
  console.log('\n📊 TEST RESULTS:');
  console.log('=====================================');
  console.log(`Original file: ${audioFile}`);
  console.log(`Input language: ${getLanguageName(testCase.inputLanguage)}`);
  console.log(`Output language: ${getLanguageName(testCase.outputLanguage)}`);
  console.log(`Transcribed text (${transcriptionResult.wordCount} words)`);
  console.log('Generated summary:');
  console.log(summary);
  console.log('=====================================');
}

// Helper functions
function getLanguageName(langCode) {
  const languages = {
    'en': 'English',
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French'
  };
  return languages[langCode] || 'Unknown';
}

async function createTestAudioFile(filename, language, audioDir) {
  const filePath = path.join(audioDir, filename);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`✅ Using existing audio file: ${filename}`);
    return filePath;
  }
  
  // Create content based on language
  let content = '';
  if (language === 'en') {
    content = `
    Today we're discussing the future of artificial intelligence in software development.
    Artificial intelligence is transforming how we write code, with tools like GitHub Copilot
    and other AI assistants becoming increasingly sophisticated.
    
    Key points from today's discussion:
    1. AI is automating repetitive coding tasks
    2. Machine learning models are getting better at understanding context
    3. Natural language processing is enabling more intuitive developer interfaces
    4. The future holds promise for fully autonomous code generation
    
    In conclusion, AI will continue to reshape the software development landscape,
    making developers more productive while also raising new questions about code quality
    and the role of human developers in the process.
    `;
  } else if (language === 'de') {
    content = `
    Heute diskutieren wir über die Zukunft der künstlichen Intelligenz in der Softwareentwicklung.
    Künstliche Intelligenz verändert grundlegend, wie wir Code schreiben, mit Tools wie GitHub Copilot
    und anderen KI-Assistenten, die immer ausgefeilter werden.
    
    Wichtige Punkte aus der heutigen Diskussion:
    1. KI automatisiert repetitive Codieraufgaben
    2. Machine-Learning-Modelle verstehen immer besser den Kontext
    3. Natural-Language-Processing ermöglicht intuitivere Entwicklerschnittstellen
    4. Die Zukunft verspricht vollständig autonome Code-Generierung
    
    Zusammenfassend wird KI weiterhin die Landschaft der Softwareentwicklung prägen,
    Entwickler produktiver machen und gleichzeitig neue Fragen zu Codequalität
    und der Rolle menschlicher Entwickler aufwerfen.
    `;
  } else {
    content = `This is a test audio file in ${getLanguageName(language)}.`;
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created test audio file: ${filename}`);
  return filePath;
}

// Simulate audio transcription
async function simulateAudioTranscription(audioFilePath, language = 'en') {
  // In a real implementation, this would use a speech-to-text service
  const fileContent = fs.readFileSync(audioFilePath, 'utf8');
  
  // Simple processing to simulate transcription
  const fileName = path.basename(audioFilePath);
  const transcription = `Transcribed text from ${fileName}: ${fileContent.trim()}`;
  
  return {
    text: transcription,
    language: language,
    confidence: 0.92,
    duration: Math.round(transcription.length / 10), // Mock duration in seconds
    wordCount: transcription.split(' ').length,
    estimatedReadingTime: Math.ceil(transcription.split(' ').length / 200) // Avg reading speed
  };
}

// Simulate text translation
async function translateText(text, sourceLanguage, targetLanguage) {
  // In a real implementation, this would use a translation service
  // For now, we'll just prefix the text to indicate translation
  const translations = {
    'en-de': {
      'Today we': 'Heute',
      'Artificial intelligence': 'Künstliche Intelligenz',
      'software development': 'Softwareentwicklung',
      'AI is': 'KI ist',
      'Machine learning': 'Maschinelles Lernen',
      'Natural language processing': 'Natural-Language-Processing',
      'future holds promise': 'Zukunft verspricht',
      'In conclusion': 'Zusammenfassend',
      'AI will continue': 'KI wird weiterhin'
    },
    'de-en': {
      'Heute': 'Today',
      'Künstliche Intelligenz': 'Artificial Intelligence',
      'Softwareentwicklung': 'Software Development',
      'KI ist': 'AI is',
      'Maschinelles Lernen': 'Machine Learning',
      'Natural-Language-Processing': 'Natural Language Processing',
      'Zukunft verspricht': 'future holds promise',
      'Zusammenfassend': 'In conclusion',
      'KI wird weiterhin': 'AI will continue'
    }
  };
  
  // Simple word replacement for demonstration
  let translatedText = text;
  const langKey = `${sourceLanguage}-${targetLanguage}`;
  if (translations[langKey]) {
    for (const [original, translation] of Object.entries(translations[langKey])) {
      translatedText = translatedText.replace(new RegExp(original, 'gi'), translation);
    }
  }
  
  return `[${targetLanguage.toUpperCase()} TRANSLATED] ${translatedText}`;
}

// Generate summary in specified language
async function generateSummary(text, language) {
  // In a real implementation, this would use an LLM service
  // For now, we'll create language-specific summaries
  
  const summaries = {
    'en': `Summary: This audio content discusses artificial intelligence and software development. 
    The main topics include AI automation, machine learning models, natural language processing, and the future of coding.`,
    'de': `Zusammenfassung: Dieser Audioinhalt behandelt künstliche Intelligenz und Softwareentwicklung. 
    Die Hauptthemen sind KI-Automatisierung, Machine-Learning-Modelle, Natural-Language-Processing und die Zukunft des Codings.`,
    'es': `Resumen: Este contenido de audio trata sobre inteligencia artificial y desarrollo de software. 
    Los temas principales incluyen automatización de IA, modelos de aprendizaje automático, procesamiento de lenguaje natural y el futuro de la codificación.`,
    'fr': `Résumé: Ce contenu audio traite de l'intelligence artificielle et du développement logiciel. 
    Les sujets principaux incluent l'automatisation par IA, les modèles d'apprentissage automatique, le traitement du langage naturel et l'avenir du codage.`
  };
  
  return summaries[language] || summaries['en'];
}

// Run the test
languageSelectionTest();