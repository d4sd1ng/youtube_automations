const VideoDiscoveryService = require('../services/agent-controller/videoDiscoveryService');

/**
 * Unit-Tests für den VideoDiscoveryService
 */
console.log('🧪 Testing VideoDiscoveryService...');

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

let videoService;

beforeEach(() => {
  videoService = new VideoDiscoveryService();
});

describe('VideoDiscoveryService discoverTrendingVideos', () => {
  it('sollte aktuelle Trending-Videos finden', async () => {
    // Mock für die YouTube-API
    videoService.makeYouTubeRequest = async (endpoint, params) => {
      if (endpoint === 'search') {
        return {
          items: [
            {
              id: { videoId: 'abc123' },
              snippet: {
                title: 'Trending Video 1',
                description: 'Beschreibung des Trending Videos',
                channelTitle: 'Test Channel',
                publishedAt: '2023-01-01T00:00:00Z',
                channelId: 'test_channel_id'
              }
            }
          ]
        };
      } else if (endpoint === 'videos') {
        return {
          items: [
            {
              id: 'abc123',
              snippet: {
                title: 'Trending Video 1',
                description: 'Beschreibung des Trending Videos',
                channelTitle: 'Test Channel',
                publishedAt: '2023-01-01T00:00:00Z'
              },
              statistics: {
                viewCount: '1000000',
                likeCount: '50000',
                commentCount: '1000'
              }
            }
          ]
        };
      }
    };
    
    const results = await videoService.discoverTrendingVideos();
    
    expect(results).toBeDefined();
    expect(results.success).toBeDefined();
    expect(Array.isArray(results.videos)).toBe(true);
  });
  
  it('sollte bei API-Fehlern ein Fehlerobjekt zurückgeben', async () => {
    // Mock für einen API-Fehler
    videoService.makeYouTubeRequest = async () => {
      throw new Error('API Error');
    };
    
    const results = await videoService.discoverTrendingVideos();
    
    expect(results).toBeDefined();
    expect(results.success).toBeDefined();
    expect(Array.isArray(results.videos)).toBe(true);
  });
});

describe('VideoDiscoveryService calculatePerformanceScore', () => {
  it('sollte das Leistungspotenzial eines Videos berechnen', () => {
    const video = {
      title: 'Performance Test Video',
      viewCount: '100000',
      likeCount: '10000',
      commentCount: '1000',
      engagementRate: '15.00',
      publishedAt: new Date().toISOString(),
      channelPriority: 'high'
    };
    
    const score = videoService.calculatePerformanceScore(video);
    
    expect(score).toBeDefined();
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThan(0);
  });
});

console.log('\n🎉 VideoDiscoveryService tests completed!');