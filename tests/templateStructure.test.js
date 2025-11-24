const fs = require('fs');
const path = require('path');

/**
 * Test to verify the new template structure
 */
console.log('🧪 Testing Template Structure V2...');

// Mock for Jest-like functions
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
    toBeTruthy: () => {
      if (!actual) throw new Error('Expected value to be truthy');
    },
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected ${actual} to be ${expected}`);
    },
    toContain: (expected) => {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected '${actual}' to contain '${expected}'`);
      }
      if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain '${expected}'`);
      }
    },
    toHaveLength: (expected) => {
      if (!actual || actual.length !== expected) throw new Error(`Expected array to have length ${expected}`);
    }
  };
};

// Test the new template structure
describe('Template Structure V2', () => {
  it('should have the correct directory structure', () => {
    const baseTemplatePath = path.join(__dirname, '..', 'data', 'templates');
    
    // Check that main directories exist
    const mainDirs = ['channels', 'content-types', 'prompt-templates', 'workflows'];
    mainDirs.forEach(dir => {
      const dirPath = path.join(baseTemplatePath, dir);
      expect(fs.existsSync(dirPath)).toBeTruthy();
    });
  });
  
  it('should have Autonova LinkedIn templates', () => {
    const linkedinPath = path.join(__dirname, '..', 'data', 'templates', 'channels', 'autonova', 'linkedin');
    expect(fs.existsSync(linkedinPath)).toBeTruthy();
    
    const linkedinTemplates = fs.readdirSync(linkedinPath);
    expect(linkedinTemplates).toContain('article-template.json');
    expect(linkedinTemplates).toContain('post-template.json');
    expect(linkedinTemplates).toContain('carousel-post-template.json');
    expect(linkedinTemplates).toContain('company-page-template.json');
  });
  
  it('should have Politara YouTube templates', () => {
    const youtubePath = path.join(__dirname, '..', 'data', 'templates', 'channels', 'politara', 'youtube');
    expect(fs.existsSync(youtubePath)).toBeTruthy();
    
    const youtubeTemplates = fs.readdirSync(youtubePath);
    expect(youtubeTemplates).toContain('trailer-template.json');
    expect(youtubeTemplates).toContain('long-format-template.json');
    expect(youtubeTemplates).toContain('short-format-template.json');
  });
  
  it('should have content type templates', () => {
    const contentTypesPath = path.join(__dirname, '..', 'data', 'templates', 'content-types');
    expect(fs.existsSync(contentTypesPath)).toBeTruthy();
    
    // Check tutorials
    const tutorialsPath = path.join(contentTypesPath, 'tutorials');
    expect(fs.existsSync(tutorialsPath)).toBeTruthy();
    const tutorialTemplates = fs.readdirSync(tutorialsPath);
    expect(tutorialTemplates).toContain('basic-tutorial-template.json');
    expect(tutorialTemplates).toContain('advanced-tutorial-template.json');
    expect(tutorialTemplates).toContain('troubleshooting-template.json');
    
    // Check news analysis
    const newsPath = path.join(contentTypesPath, 'news-analysis');
    expect(fs.existsSync(newsPath)).toBeTruthy();
    const newsTemplates = fs.readdirSync(newsPath);
    expect(newsTemplates).toContain('breaking-news-template.json');
    expect(newsTemplates).toContain('deep-dive-template.json');
    expect(newsTemplates).toContain('opinion-piece-template.json');
  });
  
  it('should have prompt templates organized by methodology', () => {
    const promptTemplatesPath = path.join(__dirname, '..', 'data', 'templates', 'prompt-templates');
    expect(fs.existsSync(promptTemplatesPath)).toBeTruthy();
    
    // Check chain of thought
    const cotPath = path.join(promptTemplatesPath, 'chain-of-thought');
    expect(fs.existsSync(cotPath)).toBeTruthy();
    const cotTemplates = fs.readdirSync(cotPath);
    expect(cotTemplates).toContain('analytical-reasoning-template.json');
    expect(cotTemplates).toContain('creative-thinking-template.json');
    expect(cotTemplates).toContain('problem-solving-template.json');
    
    // Check few-shot
    const fewShotPath = path.join(promptTemplatesPath, 'few-shot');
    expect(fs.existsSync(fewShotPath)).toBeTruthy();
    const fewShotTemplates = fs.readdirSync(fewShotPath);
    expect(fewShotTemplates).toContain('example-based-template.json');
    expect(fewShotTemplates).toContain('analogy-template.json');
  });
  
  it('should have workflow templates', () => {
    const workflowsPath = path.join(__dirname, '..', 'data', 'templates', 'workflows');
    expect(fs.existsSync(workflowsPath)).toBeTruthy();
    
    const workflowTemplates = fs.readdirSync(workflowsPath);
    expect(workflowTemplates).toContain('content-creation-workflow.json');
    expect(workflowTemplates).toContain('cross-platform-publishing-workflow.json');
    expect(workflowTemplates).toContain('monetization-workflow.json');
    expect(workflowTemplates).toContain('quality-assurance-workflow.json');
  });
  
  it('should have updated template configuration', () => {
    const configPath = path.join(__dirname, '..', 'data', 'templates', 'template-config.json');
    expect(fs.existsSync(configPath)).toBeTruthy();
    
    const configContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(configContent.templateStructureVersion).toBe('2.0.0');
    expect(configContent.templateCategories).toBeTruthy();
    
    // Check that channels category exists
    expect(configContent.templateCategories.channels).toBeTruthy();
    
    // Check that Autonova has LinkedIn templates
    expect(configContent.templateCategories.channels.autonova.linkedin).toBeTruthy();
    expect(configContent.templateCategories.channels.autonova.linkedin).toContain('article-template');
    expect(configContent.templateCategories.channels.autonova.linkedin).toContain('post-template');
  });
});

console.log('\n🎉 Template Structure V2 tests completed!');