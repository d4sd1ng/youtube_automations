const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');

/**
 * Unit-Tests für den PipelineOrchestrator
 */
console.log('🧪 Testing PipelineOrchestrator...');

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
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
    }
  };
};

global.beforeEach = (fn) => {
  // In a real test framework, this would run before each test
  // For this demo, we'll just run it once
  fn();
};

let orchestrator;

beforeEach(() => {
  orchestrator = new PipelineOrchestrator();
});

describe('PipelineOrchestrator createPipeline', () => {
  it('should create a pipeline with default configuration', async () => {
    const config = {};
    const result = await orchestrator.createPipeline(config);

    expect(result).toHaveProperty('pipelineId');
    expect(result).toHaveProperty('config');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('data');
  });

  it('should create a pipeline with custom configuration', async () => {
    const config = {
      scrapeContent: true,
      generateScripts: false,
      createThumbnails: true,
      contentType: 'tutorial',
      targetLength: '10min',
      tone: 'educational',
      audience: 'developers',
      maxScripts: 3
    };

    const result = await orchestrator.createPipeline(config);

    expect(result.config).toEqual(config);
  });
});

describe('PipelineOrchestrator estimateMonetizationPotential', () => {
  it('should estimate monetization potential for content', () => {
    const contentData = {
      contentType: 'tutorial',
      targetLength: '10min',
      qualityScore: 85,
      audience: 'developers',
      trendingKeywords: ['AI', 'programming']
    };

    const monetization = orchestrator.estimateMonetizationPotential(contentData);

    expect(monetization).toHaveProperty('estimatedViews');
    expect(monetization).toHaveProperty('estimatedRevenue');
    expect(monetization).toHaveProperty('creatorRevenue');
    expect(monetization).toHaveProperty('revenueBreakdown');
  });

  it('should give higher estimates for high quality content', () => {
    const lowQualityContent = {
      contentType: 'tutorial',
      targetLength: '5min',
      qualityScore: 40,
      audience: 'general'
    };

    const highQualityContent = {
      contentType: 'tutorial',
      targetLength: '15min',
      qualityScore: 90,
      audience: 'developers',
      trendingKeywords: ['AI', 'machine learning']
    };

    const lowEstimate = orchestrator.estimateMonetizationPotential(lowQualityContent);
    const highEstimate = orchestrator.estimateMonetizationPotential(highQualityContent);

    expect(highEstimate.estimatedViews).toBeGreaterThanOrEqual(lowEstimate.estimatedViews);
    expect(highEstimate.estimatedRevenue).toBeGreaterThanOrEqual(lowEstimate.estimatedRevenue);
  });
});

console.log('\n🎉 PipelineOrchestrator tests completed!');