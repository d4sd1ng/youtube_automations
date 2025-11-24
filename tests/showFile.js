const fs = require('fs');
const path = require('path');

// Function to show file content
function showFile(filePath) {
  console.log(`📂 Showing content of: ${filePath}\n`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Try with relative path from project root
      const fullPath = path.join(__dirname, '..', filePath);
      if (!fs.existsSync(fullPath)) {
        console.error('❌ File not found:', filePath);
        return;
      }
      filePath = fullPath;
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📄 File Content:');
    console.log('=====================================');
    
    // For JSON files, parse and display formatted
    if (filePath.endsWith('.json')) {
      try {
        const parsed = JSON.parse(content);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        // If JSON parsing fails, display as plain text
        console.log(content);
      }
    } 
    // For other files, display as is
    else {
      console.log(content);
    }
    
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log('📝 Usage: node showFile.js <file-path>');
  console.log('\n📁 Some example files you can view:');
  console.log('  node showFile.js data/outputs/german_audio_summary_2025-09-10T10-06-56-057Z.json');
  console.log('  node showFile.js data/audio/german_meeting_recording.mp3');
  console.log('  node showFile.js data/scripts/script_1757475019849.json');
  console.log('  node showFile.js data/translations/translation_2025-09-10T03-30-19-864Z_de_to_en.json');
  console.log('  node showFile.js data/thumbnails/undefined_thumbnails.json');
  process.exit(1);
}

showFile(filePath);