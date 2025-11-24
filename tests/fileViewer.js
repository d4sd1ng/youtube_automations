const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// File Viewer
async function fileViewer() {
  console.log('📂 File Viewer\n');

  try {
    // Show available directories
    showDirectories();

    // Get user choice
    const directory = await chooseDirectory();

    // Show files in selected directory
    const files = await showFiles(directory);

    // Get file choice
    const fileIndex = await chooseFile(files);

    // Show file content
    await showFileContent(path.join(directory, files[fileIndex]));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
  }
}

// Show available directories
function showDirectories() {
  console.log('📁 Available Directories:');
  console.log('1. data/outputs');
  console.log('2. data/audio');
  console.log('3. data/scripts');
  console.log('4. data/translations');
  console.log('5. data/thumbnails');
  console.log('6. services/data/books');
  console.log('7. Exit');
}

// Choose directory
function chooseDirectory() {
  return new Promise((resolve) => {
    rl.question('\n? Select directory (1-7): ', (choice) => {
      const directories = {
        1: 'data/outputs',
        2: 'data/audio',
        3: 'data/scripts',
        4: 'data/translations',
        5: 'data/thumbnails',
        6: 'services/data/books'
      };

      if (choice === '7') {
        console.log('👋 Goodbye!');
        process.exit(0);
      }

      const directory = directories[parseInt(choice)];
      if (directory) {
        resolve(directory);
      } else {
        console.log('❌ Invalid choice. Please try again.');
        showDirectories();
        resolve(chooseDirectory());
      }
    });
  });
}

// Show files in directory
function showFiles(directory) {
  return new Promise((resolve) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error('❌ Error reading directory:', err);
        process.exit(1);
      }

      console.log(`\n📄 Files in ${directory}:`);
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });

      resolve(files);
    });
  });
}

// Choose file
function chooseFile(files) {
  return new Promise((resolve) => {
    rl.question('\n? Select file (1-' + files.length + '): ', (choice) => {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < files.length) {
        resolve(index);
      } else {
        console.log('❌ Invalid choice. Please try again.');
        resolve(chooseFile(files));
      }
    });
  });
}

// Show file content
function showFileContent(filePath) {
  return new Promise((resolve) => {
    // Check if it's a directory
    if (fs.statSync(filePath).isDirectory()) {
      // For books directory, show the book files
      const bookFiles = fs.readdirSync(filePath);
      console.log(`\n📚 Files in book directory ${filePath}:`);
      bookFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });

      rl.question('\n? Select file (1-' + bookFiles.length + '): ', (choice) => {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < bookFiles.length) {
          const selectedFile = path.join(filePath, bookFiles[index]);
          displayFileContent(selectedFile);
          resolve();
        } else {
          console.log('❌ Invalid choice.');
          resolve();
        }
      });
    } else {
      displayFileContent(filePath);
      resolve();
    }
  });
}

// Display file content
function displayFileContent(filePath) {
  console.log(`\n📄 Content of ${filePath}:`);
  console.log('=====================================');

  try {
    // For JSON files, parse and display formatted
    if (filePath.endsWith('.json')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      console.log(JSON.stringify(parsed, null, 2));
    }
    // For text files, display as is
    else {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(content);
    }
  } catch (error) {
    console.error('❌ Error reading file:', error);
  }

  console.log('=====================================');
}

// Run the file viewer
fileViewer();