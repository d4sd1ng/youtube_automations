const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Interactive Audio Processing Test
async function interactiveAudioTest() {
  console.log('🎙️  Interactive Audio Processing Test\n');

  try {
    // Get user preferences
    const preferences = await getUserPreferences();
    
    // Process audio based on preferences
    await processAudioWithPreferences(preferences);
    
    console.log('\n🎉 Interactive Audio Processing Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Get user preferences through interactive prompts
function getUserPreferences() {
  return new Promise((resolve) => {
    const preferences = {};
    
    // Store previous answers for back navigation
    const answers = {};
    
    // Function to ask questions with back navigation
    function askQuestion(prompt, validator, onAnswer, onBack = null) {
      rl.question(prompt, (answer) => {
        if (answer.toLowerCase() === 'b' || answer.toLowerCase() === 'back') {
          if (onBack) {
            onBack();
          } else {
            console.log('Cannot go back from this step.');
            askQuestion(prompt, validator, onAnswer, onBack);
          }
        } else if (validator(answer)) {
          answers[prompt] = answer;
          onAnswer(answer);
        } else {
          console.log('Invalid input. Please try again.');
          askQuestion(prompt, validator, onAnswer, onBack);
        }
      });
    }
    
    // Ask for audio file selection
    console.log('📂 Available Audio Files:');
    console.log('1. English Technical Discussion (test_meeting_recording.mp3)');
    console.log('2. German Technical Discussion (german_meeting_recording.mp3)');
    console.log('3. Custom Audio File');
    console.log('(Type "b" or "back" to go back to previous step)');
    
    askQuestion('\n? Select audio file (1-3): ', 
      (answer) => {
        const choice = parseInt(answer);
        return choice >= 1 && choice <= 3;
      },
      (answer) => {
        preferences.fileChoice = parseInt(answer);
        
        // Ask for output language
        console.log('\n🌍 Output Language:');
        console.log('1. English');
        console.log('2. German');
        console.log('3. Spanish');
        console.log('4. French');
        console.log('(Type "b" or "back" to go back to previous step)');
        
        askQuestion('? Select output language (1-4): ',
          (answer) => {
            const choice = parseInt(answer);
            return choice >= 1 && choice <= 4;
          },
          (answer) => {
            const languageMap = {
              1: 'en',
              2: 'de',
              3: 'es',
              4: 'fr'
            };
            preferences.outputLanguage = languageMap[parseInt(answer)] || 'en';
            
            // Ask for output format
            console.log('\n📄 Output Format:');
            console.log('1. Text Summary');
            console.log('2. Bullet Points');
            console.log('3. Detailed Report');
            console.log('4. Key Takeaways');
            console.log('(Type "b" or "back" to go back to previous step)');
            
            askQuestion('? Select output format (1-4): ',
              (answer) => {
                const choice = parseInt(answer);
                return choice >= 1 && choice <= 4;
              },
              (answer) => {
                const formatMap = {
                  1: 'summary',
                  2: 'bullet',
                  3: 'report',
                  4: 'takeaways'
                };
                preferences.outputFormat = formatMap[parseInt(answer)] || 'summary';
                
                // Ask for translation if input and output languages differ
                if ((preferences.fileChoice === 1 && preferences.outputLanguage !== 'en') ||
                    (preferences.fileChoice === 2 && preferences.outputLanguage !== 'de')) {
                  console.log('\n🔄 Translation needed:');
                  console.log('(Type "b" or "back" to go back to previous step)');
                  askQuestion('? Translate content? (y/n): ',
                    (answer) => {
                      return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'n';
                    },
                    (answer) => {
                      preferences.translate = answer.toLowerCase() === 'y';
                      resolve(preferences);
                    },
                    () => {
                      // Back to output format
                      console.log('\n📄 Output Format:');
                      console.log('1. Text Summary');
                      console.log('2. Bullet Points');
                      console.log('3. Detailed Report');
                      console.log('4. Key Takeaways');
                      console.log('(Type "b" or "back" to go back to previous step)');
                      
                      askQuestion('? Select output format (1-4): ',
                        (answer) => {
                          const choice = parseInt(answer);
                          return choice >= 1 && choice <= 4;
                        },
                        (answer) => {
                          const formatMap = {
                            1: 'summary',
                            2: 'bullet',
                            3: 'report',
                            4: 'takeaways'
                          };
                          preferences.outputFormat = formatMap[parseInt(answer)] || 'summary';
                          preferences.translate = false;
                          resolve(preferences);
                        }
                      );
                    }
                  );
                } else {
                  preferences.translate = false;
                  resolve(preferences);
                }
              },
              () => {
                // Back to output language
                console.log('\n🌍 Output Language:');
                console.log('1. English');
                console.log('2. German');
                console.log('3. Spanish');
                console.log('4. French');
                console.log('(Type "b" or "back" to go back to previous step)');
                
                askQuestion('? Select output language (1-4): ',
                  (answer) => {
                    const choice = parseInt(answer);
                    return choice >= 1 && choice <= 4;
                  },
                  (answer) => {
                    const languageMap = {
                      1: 'en',
                      2: 'de',
                      3: 'es',
                      4: 'fr'
                    };
                    preferences.outputLanguage = languageMap[parseInt(answer)] || 'en';
                    
                    preferences.outputFormat = 'summary';
                    preferences.translate = false;
                    resolve(preferences);
                  }
                );
              }
            );
          },
          () => {
            // Back to audio file selection
            console.log('📂 Available Audio Files:');
            console.log('1. English Technical Discussion (test_meeting_recording.mp3)');
            console.log('2. German Technical Discussion (german_meeting_recording.mp3)');
            console.log('3. Custom Audio File');
            console.log('(Type "b" or "back" to go back to previous step)');
            
            askQuestion('\n? Select audio file (1-3): ', 
              (answer) => {
                const choice = parseInt(answer);
                return choice >= 1 && choice <= 3;
              },
              (answer) => {
                preferences.fileChoice = parseInt(answer);
                preferences.outputLanguage = 'en';
                preferences.outputFormat = 'summary';
                preferences.translate = false;
                resolve(preferences);
              }
            );
          }
        );
      }
    );
  });
}

// Process audio based on user preferences
async function processAudioWithPreferences(preferences) {
  console.log('\n⚙️  Processing with the following preferences:');
  console.log(`   Audio File: ${getFileDescription(preferences.fileChoice)}`);
  console.log(`   Output Language: ${getLanguageDescription(preferences.outputLanguage)}`);
  console.log(`   Output Format: ${getFormatDescription(preferences.outputFormat)}`);
  console.log(`   Translation: ${preferences.translate ? 'Yes' : 'No'}`);
  
  // 1. Create test audio directory if it doesn't exist
  const audioDir = path.join(__dirname, '../data/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log('✅ Created audio directory');
  }
  
  // 2. Get or create audio file based on selection
  const audioFile = await getOrCreateAudioFile(preferences.fileChoice, audioDir);
  
  // 3. Simulate audio transcription
  console.log('\n🔍 Transcribing audio file...');
  const transcriptionResult = await simulateAudioTranscription(audioFile, getSourceLanguage(preferences.fileChoice));
  console.log('✅ Audio transcription completed');
  
  // 4. Translate if needed
  let processedText = transcriptionResult.text;
  if (preferences.translate) {
    console.log(`\n🔄 Translating from ${getSourceLanguage(preferences.fileChoice)} to ${preferences.outputLanguage}...`);
    processedText = await translateText(transcriptionResult.text, getSourceLanguage(preferences.fileChoice), preferences.outputLanguage);
    console.log('✅ Translation completed');
  }
  
  // 5. Generate output in selected format
  console.log(`\n📝 Generating ${getFormatDescription(preferences.outputFormat)}...`);
  const output = await generateOutput(processedText, preferences.outputLanguage, preferences.outputFormat);
  console.log('✅ Output generated');
  
  // 6. Save results
  const outputDir = path.join(__dirname, '../data/outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(outputDir, `interactive_audio_${timestamp}.${getFileExtension(preferences.outputFormat)}`);
  
  // Save in appropriate format
  if (preferences.outputFormat === 'bullet' || preferences.outputFormat === 'takeaways') {
    fs.writeFileSync(resultsFile, output);
  } else {
    const results = {
      originalFile: audioFile,
      transcription: transcriptionResult,
      translatedText: preferences.translate ? processedText : null,
      output: output,
      preferences: preferences,
      processedAt: new Date().toISOString()
    };
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  }
  
  console.log(`✅ Results saved to: ${resultsFile}`);
  
  // 7. Display results
  console.log('\n📊 PROCESSING RESULTS:');
  console.log('=====================================');
  console.log(`Original file: ${audioFile}`);
  console.log(`Transcribed text (${transcriptionResult.wordCount} words)`);
  console.log(`Output language: ${getLanguageDescription(preferences.outputLanguage)}`);
  console.log(`Output format: ${getFormatDescription(preferences.outputFormat)}`);
  console.log('\nGenerated output:');
  console.log(output);
  console.log('=====================================');
}

// Helper functions
function getFileDescription(choice) {
  const descriptions = {
    1: 'English Technical Discussion',
    2: 'German Technical Discussion',
    3: 'Custom Audio File'
  };
  return descriptions[choice] || 'Unknown';
}

function getLanguageDescription(langCode) {
  const descriptions = {
    'en': 'English',
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French'
  };
  return descriptions[langCode] || 'Unknown';
}

function getFormatDescription(format) {
  const descriptions = {
    'summary': 'Text Summary',
    'bullet': 'Bullet Points',
    'report': 'Detailed Report',
    'takeaways': 'Key Takeaways'
  };
  return descriptions[format] || 'Unknown';
}

function getSourceLanguage(fileChoice) {
  const languages = {
    1: 'en',
    2: 'de'
  };
  return languages[fileChoice] || 'en';
}

function getFileExtension(format) {
  const extensions = {
    'summary': 'json',
    'bullet': 'txt',
    'report': 'json',
    'takeaways': 'txt'
  };
  return extensions[format] || 'json';
}

async function getOrCreateAudioFile(choice, audioDir) {
  switch(choice) {
    case 1: // English file
      const englishFile = path.join(audioDir, 'test_meeting_recording.mp3');
      if (!fs.existsSync(englishFile)) {
        const englishContent = `
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
        fs.writeFileSync(englishFile, englishContent);
        console.log('✅ Created English test audio file');
      }
      return englishFile;
      
    case 2: // German file
      const germanFile = path.join(audioDir, 'german_meeting_recording.mp3');
      if (!fs.existsSync(germanFile)) {
        const germanContent = `
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
        fs.writeFileSync(germanFile, germanContent);
        console.log('✅ Created German test audio file');
      }
      return germanFile;
      
    case 3: // Custom file - for now we'll create a placeholder
      const customFile = path.join(audioDir, 'custom_audio.mp3');
      if (!fs.existsSync(customFile)) {
        const customContent = `
        This is a custom audio file placeholder.
        In a real implementation, this would be an actual audio file uploaded by the user.
        `;
        fs.writeFileSync(customFile, customContent);
        console.log('✅ Created custom audio file placeholder');
      }
      return customFile;
      
    default:
      throw new Error('Invalid file choice');
  }
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
  return `[${targetLanguage.toUpperCase()} TRANSLATION] ${text}`;
}

// Generate output in selected format
async function generateOutput(text, language, format) {
  // In a real implementation, this would use an LLM service
  // For now, we'll create mock outputs based on format
  
  switch(format) {
    case 'summary':
      return `Summary: This content discusses key points about artificial intelligence and software development. 
      The main topics include AI automation, machine learning models, natural language processing, and the future of coding.`;
      
    case 'bullet':
      return `• Key Point 1: AI is automating repetitive coding tasks
• Key Point 2: Machine learning models are improving context understanding
• Key Point 3: Natural language processing enables intuitive developer interfaces
• Key Point 4: Future holds promise for autonomous code generation`;
      
    case 'report':
      return `Detailed Report: Comprehensive analysis of AI in software development with technical insights and future projections.`;
      
    case 'takeaways':
      return `Key Takeaways:
1. AI transforms software development workflows
2. Context-aware ML models are critical
3. NLP enhances developer experience
4. Autonomous coding is on the horizon`;
      
    default:
      return `Default summary of the content in ${language}.`;
  }
}

// Run the test
interactiveAudioTest();