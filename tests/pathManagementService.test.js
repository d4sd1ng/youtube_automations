const PathManagementService = require('../services/agent-controller/pathManagementService');
const fs = require('fs');
const path = require('path');

/**
 * Unit Tests for Path Management Service
 */
console.log('🧪 Testing PathManagementService...');

// Mock testing framework functions
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
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected ${actual} to be truthy`);
    },
    toBeFalsy: () => {
      if (actual) throw new Error(`Expected ${actual} to be falsy`);
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
    },
    toThrow: () => {
      // This is a simplified version for our testing purposes
      // In a real test framework, this would check if a function throws
      return {
        // We'll just return an object with the same interface
      };
    }
  };
};

global.beforeEach = (fn) => {
  fn();
};

let pathService;

beforeEach(() => {
  pathService = new PathManagementService();
});

describe('PathManagementService initialization', () => {
  it('should create all required directories', () => {
    // Check that main directories exist
    expect(fs.existsSync(pathService.paths.data)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.channels)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.content)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.templates)).toBeTruthy();
    
    // Check that channel directories exist
    expect(fs.existsSync(pathService.paths.autonova.base)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.politara.base)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.shared.base)).toBeTruthy();
    
    // Check that content type directories exist
    expect(fs.existsSync(pathService.paths.autonova.scripts)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.politara.videos)).toBeTruthy();
    expect(fs.existsSync(pathService.paths.shared.thumbnails)).toBeTruthy();
  });
  
  it('should have correct path structure', () => {
    // Check that paths are properly defined
    expect(pathService.paths).toHaveProperty('data');
    expect(pathService.paths).toHaveProperty('channels');
    expect(pathService.paths).toHaveProperty('content');
    expect(pathService.paths).toHaveProperty('templates');
    
    // Check channel structure
    expect(pathService.paths).toHaveProperty('autonova');
    expect(pathService.paths.autonova).toHaveProperty('base');
    expect(pathService.paths.autonova).toHaveProperty('scripts');
    expect(pathService.paths.autonova).toHaveProperty('videos');
  });
});

describe('PathManagementService path retrieval', () => {
  it('should get content paths correctly', () => {
    const autonovaScriptPath = pathService.getContentPath('autonova', 'scripts');
    expect(autonovaScriptPath).toContain('content');
    expect(autonovaScriptPath).toContain('autonova');
    expect(autonovaScriptPath).toContain('scripts');
    
    const politaraVideoPath = pathService.getContentPath('politara', 'videos');
    expect(politaraVideoPath).toContain('content');
    expect(politaraVideoPath).toContain('politara');
    expect(politaraVideoPath).toContain('videos');
  });
  
  it('should get template paths correctly', () => {
    const scriptTemplatePath = pathService.getTemplatePath('scripts');
    expect(scriptTemplatePath).toContain('templates');
    expect(scriptTemplatePath).toContain('scripts');
    
    const workflowTemplatePath = pathService.getTemplatePath('workflows');
    expect(workflowTemplatePath).toContain('templates');
    expect(workflowTemplatePath).toContain('workflows');
  });
  
  it('should get specialized paths correctly', () => {
    const seoPath = pathService.getSEOPath();
    expect(seoPath).toContain('seo');
    
    const monetizationPath = pathService.getMonetizationPath();
    expect(monetizationPath).toContain('monetization');
    
    const analyticsPath = pathService.getAnalyticsPath();
    expect(analyticsPath).toContain('analytics');
  });
  
  it('should handle invalid paths gracefully', () => {
    let errorThrown = false;
    try {
      pathService.getContentPath('invalid_channel', 'scripts');
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
    
    errorThrown = false;
    try {
      pathService.getContentPath('autonova', 'invalid_type');
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
    
    errorThrown = false;
    try {
      pathService.getTemplatePath('invalid_template');
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });
});

describe('PathManagementService file operations', () => {
  it('should get file paths correctly', () => {
    const filePath = pathService.getFilePath('autonova', 'scripts', 'test.txt');
    expect(filePath).toContain('autonova');
    expect(filePath).toContain('scripts');
    expect(filePath).toContain('test.txt');
  });
  
  it('should check file existence', () => {
    // Non-existent file should return false
    const exists = pathService.fileExists('autonova', 'scripts', 'nonexistent.txt');
    expect(exists).toBeFalsy();
  });
  
  it('should list files in directories', () => {
    const files = pathService.listFiles('autonova', 'scripts');
    expect(Array.isArray(files)).toBeTruthy();
    // Should be an array, even if empty
  });
});

describe('PathManagementService statistics', () => {
  it('should provide directory statistics', () => {
    const stats = pathService.getStats();
    
    expect(stats).toHaveProperty('totalDirectories');
    expect(stats).toHaveProperty('totalFiles');
    expect(stats).toHaveProperty('channels');
    expect(stats).toHaveProperty('templates');
    
    expect(stats.totalDirectories).toBeGreaterThan(0);
    expect(stats.totalFiles).toBeGreaterThanOrEqual(0);
  });
});

// Run tests if this script is executed directly
if (require.main === module) {
  console.log('🧪 PathManagementService Tests Completed');
}

module.exports = { PathManagementService };