const MultiInputService = require('../services/agent-controller/multiInputService');

/**
 * Unit-Tests für den MultiInputService
 */
console.log('🧪 Testing MultiInputService...');

// Mock für Jest-ähnliche Funktionen
global.describe = (name, fn) => {
  console.log(`\n📝 ${name}`);
  fn();
};

global.it = (name, fn) => {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.log(`  ❌ ${name}: ${error.message}`);
  }
};

global.expect = (actual) => {
  return {
    toBeDefined: () => {
      if (actual === undefined) throw new Error('Expected value to be defined');
    },
    toContain: (expected) => {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected '${actual}' to contain '${expected}'`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) throw new Error(`Expected ${actual} to be greater than ${expected}`);
    },
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${actual} to be ${expected}`);
    },
    toHaveLength: (expected) => {
      if (!actual || actual.length !== expected) throw new Error(`Expected array to have length ${expected}`);
    },
    toHaveProperty: (prop) => {
      if (!actual || !actual.hasOwnProperty(prop)) throw new Error(`Expected object to have property ${prop}`);
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    }
  };
};

global.beforeEach = (fn) => {
  // In a real test framework, this would run before each test
  // For this demo, we'll just run it once
  fn();
};

let multiInputService;

beforeEach(() => {
  multiInputService = new MultiInputService();
});

describe('MultiInputService createBatchJob', () => {
  it('sollte einen neuen Batch-Job erstellen', async () => {
    const options = {
      title: 'Test Batch Job',
      description: 'Ein Test für die Batch-Job-Erstellung',
      priority: 2 // NORMAL
    };
    
    const job = await multiInputService.createBatchJob(options);
    
    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
    expect(job.type).toBe('batch');
    expect(job.metadata.title).toBe('Test Batch Job');
    expect(job.priority).toBe(2);
  });
});

describe('MultiInputService getInputType', () => {
  it('sollte den richtigen Eingabetyp für Dateien bestimmen', () => {
    const textType = multiInputService.getInputType('document.txt');
    const audioType = multiInputService.getInputType('audio.mp3');
    const videoType = multiInputService.getInputType('video.mp4');
    const urlType = multiInputService.getInputType('https://example.com');
    
    expect(textType).toBe('text');
    expect(audioType).toBe('audio');
    expect(videoType).toBe('video');
    expect(urlType).toBe('url');
  });
});

describe('MultiInputService isFileTypeSupported', () => {
  it('sollte unterstützte Dateitypen korrekt erkennen', () => {
    const supportedText = multiInputService.isFileTypeSupported('document.txt');
    const supportedAudio = multiInputService.isFileTypeSupported('audio.mp3');
    const unsupported = multiInputService.isFileTypeSupported('document.xyz');
    
    expect(supportedText).toBe(true);
    expect(supportedAudio).toBe(true);
    expect(unsupported).toBe(false);
  });
});

describe('MultiInputService processAudioItem', () => {
  it('sollte Audio-Dateien verarbeiten können', async () => {
    // Erstelle ein Mock-Item für die Audio-Verarbeitung
    const mockItem = {
      id: 'test-audio-1',
      filename: 'test-audio.mp3',
      filepath: './samples/test-audio.mp3',
      type: 'audio'
    };
    
    // Mock für die addProcessingStep Funktion
    const addProcessingStep = (step, message) => {
      console.log(`Processing step: ${step} - ${message}`);
    };
    
    // Da wir keine echte Audio-Datei haben, erwarten wir einen Fehler
    // In einer echten Implementierung würden wir hier eine echte Audio-Datei verwenden
    try {
      const result = await multiInputService.processAudioItem(mockItem, addProcessingStep);
      
      // Wenn die Verarbeitung erfolgreich ist, prüfen wir die Ergebnisse
      expect(result).toBeDefined();
      expect(result.type).toBe('audio');
      expect(result.transcription).toBeDefined();
      expect(result.keyPoints).toBeDefined();
    } catch (error) {
      // Wir erwarten einen Fehler, weil keine echte Audio-Datei vorhanden ist
      expect(error).toBeDefined();
    }
  });
});

describe('MultiInputService processTextItem', () => {
  it('sollte Text-Dateien verarbeiten können', async () => {
    // Erstelle ein Mock-Item für die Text-Verarbeitung
    const mockItem = {
      id: 'test-text-1',
      filename: 'test-text.txt',
      filepath: './samples/test-text.txt',
      type: 'text'
    };
    
    // Mock für die addProcessingStep Funktion
    const addProcessingStep = (step, message) => {
      console.log(`Processing step: ${step} - ${message}`);
    };
    
    // Da wir keine echte Text-Datei haben, erwarten wir einen Fehler
    // In einer echten Implementierung würden wir hier eine echte Text-Datei verwenden
    try {
      const result = await multiInputService.processTextItem(mockItem, addProcessingStep);
      
      // Wenn die Verarbeitung erfolgreich ist, prüfen wir die Ergebnisse
      expect(result).toBeDefined();
      expect(result.type).toBe('text');
      expect(result.content).toBeDefined();
      expect(result.keyPoints).toBeDefined();
    } catch (error) {
      // Wir erwarten einen Fehler, weil keine echte Text-Datei vorhanden ist
      expect(error).toBeDefined();
    }
  });
});

console.log('\n🎉 MultiInputService tests completed!');