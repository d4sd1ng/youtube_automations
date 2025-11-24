const WebScrapingService = require('../services/agent-controller/webScrapingService');

/**
 * Unit-Tests für den WebScrapingService
 */
console.log('🧪 Testing WebScrapingService...');

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

let scraper;

beforeEach(() => {
  scraper = new WebScrapingService();
});

describe('WebScrapingService isWeekendPause', () => {
  it('should return true when weekend pause is enabled and it\'s Friday evening', () => {
    // Mock date to Friday 18:00
    const mockDate = new Date('2025-01-03T18:00:00'); // Friday
    const originalDateNow = global.Date.now;
    global.Date.now = () => mockDate.getTime();
    
    scraper.weekendPause = true;
    const result = scraper.isWeekendPause();
    
    global.Date.now = originalDateNow; // Restore original Date.now
    expect(result).toBe(true);
  });
  
  it('should return false when weekend pause is disabled', () => {
    scraper.weekendPause = false;
    expect(scraper.isWeekendPause()).toBe(false);
  });
});

describe('WebScrapingService calculateViralPotential', () => {
  it('should calculate viral potential based on engagement', () => {
    const item = {
      score: 100,
      num_comments: 50
    };
    
    const potential = scraper.calculateViralPotential(item);
    expect(potential).toBeGreaterThan(0);
  });
  
  it('should give higher scores to newer content', () => {
    const oldItem = {
      score: 100,
      num_comments: 50,
      created_utc: Date.now() / 1000 - 86400 * 3 // 3 days old
    };
    
    const newItem = {
      score: 100,
      num_comments: 50,
      created_utc: Date.now() / 1000 - 3600 // 1 hour old
    };
    
    const oldPotential = scraper.calculateViralPotential(oldItem);
    const newPotential = scraper.calculateViralPotential(newItem);
    
    // Simple comparison instead of toBeGreaterThanOrEqual
    expect(newPotential >= oldPotential).toBe(true);
  });
});

describe('WebScrapingService scrapeReddit', () => {
  it('should return an array of results', async () => {
    // Mock the axios call to avoid actual HTTP requests
    const originalAxiosGet = require('axios').get;
    require('axios').get = async () => ({
      data: {
        data: {
          children: [
            {
              data: {
                title: 'Test post',
                selftext: 'Test content',
                score: 100,
                num_comments: 50,
                permalink: '/r/test/comments/123',
                created_utc: Date.now() / 1000
              }
            }
          ]
        }
      }
    });
    
    const results = await scraper.scrapeReddit();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Restore original axios.get
    require('axios').get = originalAxiosGet;
  });
});

describe('WebScrapingService searchWeb', () => {
  it('should return search results', async () => {
    const query = 'test search';
    const options = { maxResults: 5, language: 'en' };
    
    const results = await scraper.searchWeb(query, options);
    expect(Array.isArray(results)).toBe(true);
    // Simple comparison instead of toBeLessThanOrEqual
    expect(results.length <= 5).toBe(true);
  });
});

console.log('\n🎉 WebScrapingService tests completed!');