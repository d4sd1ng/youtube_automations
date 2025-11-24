const SEOOptimizationService = require('../services/agent-controller/seoOptimizationService');

/**
 * Unit-Tests für den SEOOptimizationService
 */
console.log('🧪 Testing SEOOptimizationService...');

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
  seoService = new SEOOptimizationService();
});

describe('SEOOptimizationService generateChannelDescription', () => {
  it('should generate a channel description with default configuration', async () => {
    const channelData = {
      channelName: 'Test Channel',
      description: 'This is a test channel',
      topics: ['technology', 'Artificial Intelligence', 'programming'],
      targetAudience: 'developers',
      contentType: 'tutorials',
      uploadSchedule: 'weekly'
    };
    
    const result = await seoService.generateChannelDescription(channelData);
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('description');
    expect(result.description).toContain('Test Channel');
    expect(result.description).toContain('This is a test channel');
    expect(result).toHaveProperty('keywords');
    expect(result).toHaveProperty('tags');
  });
  
  it('should generate channel keywords correctly', async () => {
    const channelData = {
      channelName: 'Tech Channel',
      topics: ['Artificial Intelligence', 'Machine Learning', 'Programming'],
      targetAudience: 'developers'
    };
    
    const result = await seoService.generateChannelKeywords(channelData);
    
    expect(result).toHaveProperty('success', true);
    expect(result.keywords).toContain('Tech');
    expect(result.keywords).toContain('Artificial');
  });
});

describe('SEOOptimizationService generateLongFormVideoDescription', () => {
  it('should generate a long-form video description', async () => {
    const videoData = {
      title: 'Understanding AI',
      summary: 'This video explains AI concepts',
      chapters: [
        { title: 'Introduction', timestamp: '0:00' },
        { title: 'Machine Learning', timestamp: '5:00' }
      ],
      keyPoints: ['AI is transformative', 'ML is a subset'],
      relatedTopics: ['Artificial Intelligence', 'Deep Learning'],
      category: 'technology',
      channelName: 'Tech Channel'
    };
    
    const result = await seoService.generateLongFormVideoDescription(videoData);
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result.description).toContain('Understanding AI');
    expect(result.description).toContain('Inhaltsverzeichnis');
    expect(result).toHaveProperty('tags');
    expect(result).toHaveProperty('keywords');
  });
  
  it('should optimize video title for SEO', async () => {
    const videoData = {
      title: 'AI Tutorial - Learn Artificial Intelligence Concepts #2023'
    };
    
    const result = await seoService.generateLongFormVideoDescription(videoData);
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('title');
    expect(result.title).not.toContain('#');
    expect(result.title).not.toContain('2023');
  });
});

describe('SEOOptimizationService generateShortVideoDescription', () => {
  it('should generate a short video description', async () => {
    const shortData = {
      title: 'Quick AI Tip',
      caption: 'Here is a quick tip about AI',
      hashtags: ['#AI', '#Tech', '#Shorts'],
      channelName: 'Tech Channel'
    };
    
    const result = await seoService.generateShortVideoDescription(shortData);
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result.description).toContain('Quick AI Tip');
    expect(result.description).toContain('#AI');
    expect(result).toHaveProperty('tags');
    expect(result).toHaveProperty('keywords');
  });
});

describe('SEOOptimizationService keyword extraction', () => {
  it('should extract keywords from text', () => {
    const channelData = {
      channelName: 'Artificial Intelligence Programming Channel',
      topics: ['Machine Learning', 'Deep Learning'],
      targetAudience: 'developers'
    };
    
    const keywords = seoService.extractChannelKeywords(channelData, seoService.defaultConfig);
    
    // Debug output to see what keywords are actually extracted
    console.log('Extracted keywords:', keywords);
    
    // Check if any of the expected words are in the keywords (case insensitive)
    const hasAI = keywords.some(k => k.toLowerCase().includes('intelligence'));
    const hasProgramming = keywords.some(k => k.toLowerCase() === 'programming');
    const hasMachine = keywords.some(k => k.toLowerCase() === 'machine');
    const hasLearning = keywords.some(k => k.toLowerCase() === 'learning');
    
    expect(hasAI).toBe(true);
    expect(hasProgramming).toBe(true);
    expect(hasMachine).toBe(true);
    expect(hasLearning).toBe(true);
  });
  
  it('should exclude inappropriate words from keywords', () => {
    const channelData = {
      channelName: 'Artificial Intelligence Sex Programming Channel'
    };
    
    const keywords = seoService.extractChannelKeywords(channelData, seoService.defaultConfig);
    
    const containsSex = keywords.includes('Sex') || keywords.includes('sex');
    expect(containsSex).toBe(false);
  });
});

describe('SEOOptimizationService tag generation', () => {
  it('should generate appropriate tags', () => {
    const channelData = {
      channelName: 'Tech Channel',
      topics: ['AI', 'Programming'],
      contentType: 'tutorials'
    };
    
    const tags = seoService.generateChannelTags(channelData, seoService.defaultConfig);
    
    expect(tags).toContain('YouTube');
    expect(tags).toContain('TechChannel');
    expect(tags).toContain('AI');
    expect(tags).toContain('tutorials');
  });
  
  it('should limit tags to maximum count', () => {
    const channelData = {
      channelName: 'Test Channel'
    };
    
    // Erstelle viele Topics, um das Limit zu testen
    const topics = [];
    for (let i = 0; i < 50; i++) {
      topics.push(`Topic${i}`);
    }
    channelData.topics = topics;
    
    const tags = seoService.generateChannelTags(channelData, {
      ...seoService.defaultConfig,
      maxTags: 10
    });
    
    expect(tags).toHaveLength(10);
  });
});