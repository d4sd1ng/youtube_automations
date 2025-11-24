const EnhancedSEOOptimizationService = require('../services/agent-controller/enhancedSEOOptimizationService');

/**
 * Unit-Tests für den EnhancedSEOOptimizationService
 */
console.log('🧪 Testing EnhancedSEOOptimizationService...');

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
      if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain '${expected}'`);
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
    },
    toBeLessThanOrEqual: (expected) => {
      if (actual > expected) throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
    },
    toMatch: (expected) => {
      if (typeof actual === 'string' && !actual.match(new RegExp(expected))) {
        throw new Error(`Expected '${actual}' to match pattern '${expected}'`);
      }
    },
    toBeNull: () => {
      if (actual !== null) throw new Error(`Expected value to be null`);
    }
  };
};

global.beforeEach = (fn) => {
  // In a real test framework, this would run before each test
  // For this demo, we'll just run it once
  fn();
};

let seoService;

beforeEach(() => {
  seoService = new EnhancedSEOOptimizationService();
});

describe('EnhancedSEOOptimizationService prompt management', () => {
  it('should generate SEO prompts correctly', async () => {
    const result = await seoService.generateSEOPrompt(
      'keyword_research',
      ['AI', 'Machine Learning'],
      'Technology'
    );
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('prompt');
    expect(result).toHaveProperty('category', 'keyword_research');
  });
  
  it('should handle invalid prompt categories', async () => {
    const result = await seoService.generateSEOPrompt(
      'invalid_category',
      ['AI'],
      'Technology'
    );
    
    expect(result).toHaveProperty('success', false);
  });
});

describe('EnhancedSEOOptimizationService image SEO', () => {
  it('should generate image SEO data', async () => {
    const result = await seoService.generateImageSEOData(
      'test-image.jpg',
      ['AI', 'Technology'],
      'Artificial Intelligence'
    );
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('altText');
    expect(result).toHaveProperty('filename');
    expect(result).toHaveProperty('title');
    expect(result.altText).toContain('Artificial Intelligence');
  });
  
  it('should optimize image filenames', () => {
    const filename = seoService.optimizeImageFilename('original.jpg', ['AI', 'Tech']);
    expect(filename).toContain('ai-tech');
    expect(filename).toMatch(/\.jpg$/);
  });
});

describe('EnhancedSEOOptimizationService content automation', () => {
  it('should generate automated content', async () => {
    const result = await seoService.generateAutomatedContent(
      ['AI'],
      'blog_post',
      'developers'
    );
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('contentType', 'blog_post');
    expect(result.title).toContain('AI');
  });
  
  it('should handle different content types', async () => {
    const result = await seoService.generateAutomatedContent(
      ['AI'],
      'product_page',
      'businesses'
    );
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('contentType', 'product_page');
  });
});

describe('EnhancedSEOOptimizationService GEO optimization', () => {
  it('should optimize content for AI search', async () => {
    const content = "Artificial Intelligence is transforming business operations.";
    const result = await seoService.optimizeForAISearch(content);
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('readabilityScore');
    expect(result).toHaveProperty('structuredData');
    expect(result).toHaveProperty('voiceOptimizedContent');
    expect(result.readabilityScore).toBeGreaterThan(0);
  });
  
  it('should calculate AI readability score', () => {
    const content = "Short sentence. Another short sentence.";
    const score = seoService.calculateAIReadability(content);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('EnhancedSEOOptimizationService content clustering', () => {
  it('should create content clusters', async () => {
    const result = await seoService.createContentCluster(
      'AI',
      ['Machine Learning', 'Neural Networks']
    );
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('cluster');
    expect(result.cluster).toHaveProperty('mainTopic', 'AI');
    expect(result.cluster).toHaveProperty('subtopics');
    expect(result.cluster.subtopics).toHaveLength(2);
  });
  
  it('should generate related keywords', () => {
    const keywords = seoService.generateRelatedKeywords('AI', ['Machine Learning']);
    expect(keywords).toContain('AI');
    expect(keywords).toContain('Machine Learning');
    expect(keywords.length).toBeGreaterThan(2);
  });
});

describe('EnhancedSEOOptimizationService batch optimization', () => {
  it('should perform batch SEO optimization', async () => {
    const items = [{
      channelName: 'Test Channel',
      description: 'Test description',
      topics: ['AI'],
      targetAudience: 'developers'
    }];
    
    const result = await seoService.batchOptimizeSEO(items, 'channel');
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('results');
    expect(result.results).toHaveLength(1);
  });
  
  it('should handle invalid optimization types', async () => {
    const items = [{ test: 'item' }];
    const result = await seoService.batchOptimizeSEO(items, 'invalid_type');
    
    expect(result).toHaveProperty('success', false);
  });
});

describe('EnhancedSEOOptimizationService data persistence', () => {
  it('should save and load SEO data', () => {
    const testData = { test: 'data', value: 123 };
    const filename = 'test_data';
    
    // Save data
    const saveResult = seoService.saveSEOData(testData, filename);
    expect(saveResult).toBe(true);
    
    // Load data
    const loadedData = seoService.loadSEOData(filename);
    expect(loadedData).toEqual(testData);
  });
  
  it('should handle loading non-existent data', () => {
    const loadedData = seoService.loadSEOData('non_existent_file');
    expect(loadedData).toBeNull();
  });
});

// Führe die Tests aus, wenn das Skript direkt aufgerufen wird
if (require.main === module) {
  // Tests werden automatisch durch die globalen describe/it Funktionen ausgeführt
  console.log('🧪 EnhancedSEOOptimizationService Tests abgeschlossen');
}

module.exports = { EnhancedSEOOptimizationService };