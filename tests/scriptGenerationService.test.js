const ScriptGenerationService = require('../services/agent-controller/scriptGenerationService');

/**
 * Unit-Tests für den ScriptGenerationService
 */
console.log('🧪 Testing ScriptGenerationService...');

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

let scriptService;

beforeEach(() => {
  scriptService = new ScriptGenerationService();
});

describe('ScriptGenerationService generateScript', () => {
  it('sollte ein Skript mit erweitertem Prompting generieren', async () => {
    const input = {
      topic: 'Künstliche Intelligenz in der Zukunft',
      contentType: 'news',
      targetLength: '5min',
      tone: 'informative',
      audience: 'tech_enthusiasts'
    };
    
    // Mock für die LLM-Integration
    scriptService.llmService = {
      generateContent: async () => ({
        content: 'Dies ist ein generiertes Skript über KI und Zukunft',
        model: 'test-model'
      })
    };
    
    // Mock für das AdvancedPromptingService
    scriptService.advancedPromptingService = {
      generateEnhancedPrompt: () => ({
        prompt: 'Erstelle ein Skript über KI',
        metadata: { qualityScore: 85 }
      })
    };
    
    const result = await scriptService.generateScript(input);
    
    expect(result).toBeDefined();
    expect(result.scriptId).toBeDefined();
    expect(result.content).toContain('generiertes Skript');
    expect(result.metadata).toBeDefined();
  });
});

describe('ScriptGenerationService assessScriptQuality', () => {
  it('sollte die Skriptqualität bewerten', () => {
    const script = 'Dies ist ein Beispiel-Skript für die Bewertung mit ausreichend Inhalt, um eine gute Bewertung zu erhalten.';
    const scriptData = {
      contentType: 'news',
      targetLength: '5min',
      tone: 'informative',
      audience: 'general'
    };
    
    const assessment = scriptService.assessScriptQuality(script, scriptData);
    
    expect(assessment).toBeDefined();
    expect(assessment.overallScore).toBeGreaterThan(0);
    expect(assessment.details).toBeDefined();
    expect(assessment.meetsThreshold).toBeDefined();
  });
});

console.log('\n🎉 ScriptGenerationService tests completed!');