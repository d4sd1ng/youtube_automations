const fs = require('fs');
const path = require('path');
const AudioToTextService = require('./audioToTextService');

async function testAudioTranscription() {
  console.log('🚀 Testing Audio-to-Text Service...');
  
  // Create audio service instance
  const audioService = new AudioToTextService();
  
  // Create a mock audio file for testing
  const mockAudioPath = path.join(__dirname, 'temp', 'test-audio.mp3');
  
  // Ensure temp directory exists
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Create a mock audio file (just a text file for this test)
  const mockContent = 'This is a test audio file content for transcription testing purposes.';
  fs.writeFileSync(mockAudioPath, mockContent);
  
  try {
    console.log('🎵 Starting audio transcription test...');
    
    // Test audio validation
    const validation = await audioService.validateAudioFile(mockAudioPath);
    console.log('✅ Audio validation result:', validation);
    
    // Test audio-to-text conversion
    const transcriptionResult = await audioService.convertAudioToText(mockAudioPath, {
      language: 'en'
    });
    
    console.log('✅ Transcription result:', transcriptionResult);
    
    // Clean up
    if (fs.existsSync(mockAudioPath)) {
      fs.unlinkSync(mockAudioPath);
    }
    
    console.log('🎉 Audio transcription test completed successfully!');
    
  } catch (error) {
    console.error('❌ Audio transcription test failed:', error);
    
    // Clean up
    if (fs.existsSync(mockAudioPath)) {
      fs.unlinkSync(mockAudioPath);
    }
  }
}

// Run the test
testAudioTranscription();