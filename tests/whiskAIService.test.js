const WhiskAIService = require('../services/agent-controller/whiskAIService');

/**
 * Unit tests for Whisk AI Service
 */
describe('WhiskAIService', () => {
  let whiskAIService;

  beforeEach(() => {
    whiskAIService = new WhiskAIService();
  });

  afterEach(() => {
    // Reset usage counter after each test
    if (whiskAIService.config && whiskAIService.config.whiskAI) {
      whiskAIService.config.whiskAI.currentUsage = 0;
      whiskAIService.saveConfiguration();
    }
  });

  it('should initialize with default configuration', () => {
    expect(whiskAIService).toBeDefined();
    expect(whiskAIService.config).toBeDefined();
    expect(whiskAIService.config.whiskAI).toBeDefined();
    expect(whiskAIService.config.whiskAI.enabled).toBe(true);
    expect(whiskAIService.config.whiskAI.features).toBeDefined();
    expect(whiskAIService.config.whiskAI.limits).toBeDefined();
  });

  it('should optimize prompt with enhancements', async () => {
    const originalPrompt = "Test thumbnail";
    const optimizedPrompt = await whiskAIService.optimizePrompt(originalPrompt, {
      contentType: 'short',
      platform: 'youtube_shorts'
    });

    expect(optimizedPrompt).toContain(originalPrompt);
    expect(optimizedPrompt).toContain('high quality');
    expect(optimizedPrompt).toContain('professional');
  });

  it('should generate visual concept', async () => {
    const thumbnailData = {
      title: "Test Video",
      contentType: 'political'
    };

    const visualConcept = await whiskAIService.generateVisualConcept(thumbnailData, {
      platform: 'youtube_shorts'
    });

    expect(visualConcept).toBeDefined();
    expect(visualConcept.subject).toBe(thumbnailData.title);
    expect(visualConcept.scene).toContain('newsroom');
    expect(visualConcept.elements).toContain('text overlay');
  });

  it('should track usage statistics', () => {
    const stats = whiskAIService.getUsageStats();

    expect(stats).toBeDefined();
    expect(stats.enabled).toBe(true);
    expect(stats.dailyLimit).toBe(100);
    expect(stats.currentUsage).toBe(0);
    expect(stats.remainingUsage).toBe(100);
    expect(stats.features).toBeDefined();
    expect(stats.limits).toBeDefined();
  });

  it('should respect daily usage limits for prompt optimization', async () => {
    // Set usage to limit
    whiskAIService.config.whiskAI.currentUsage = 50;

    const originalPrompt = "Test thumbnail";
    const result = await whiskAIService.optimizePrompt(originalPrompt);

    // Should return original prompt when limit is reached
    expect(result).toBe(originalPrompt);
  });

  it('should respect daily usage limits for visual concept generation', async () => {
    // Set usage to limit
    whiskAIService.config.whiskAI.currentUsage = 50;

    const thumbnailData = {
      title: "Test Video",
      contentType: 'political'
    };

    const result = await whiskAIService.generateVisualConcept(thumbnailData);

    // Should return basic concept when limit is reached
    expect(result).toBeDefined();
    expect(result.subject).toBe(thumbnailData.title);
    expect(result.scene).toBe("professional studio setting");
  });

  it('should handle LinkedIn platform specific enhancements', async () => {
    const originalPrompt = "Professional business content";
    const optimizedPrompt = await whiskAIService.optimizePrompt(originalPrompt, {
      platform: 'linkedin'
    });

    expect(optimizedPrompt).toContain('professional');
    expect(optimizedPrompt).toContain('business-oriented');
    expect(optimizedPrompt).toContain('clean design');
  });

  it('should return original prompt when feature is disabled', async () => {
    // Disable prompt optimization feature
    whiskAIService.config.whiskAI.features.promptOptimization = false;
    whiskAIService.saveConfiguration();

    const originalPrompt = "Test thumbnail";
    const result = await whiskAIService.optimizePrompt(originalPrompt);

    // Should return original prompt when feature is disabled
    expect(result).toBe(originalPrompt);
  });

  it('should return basic concept when feature is disabled', async () => {
    // Disable visual concept generation feature
    whiskAIService.config.whiskAI.features.visualConceptGeneration = false;
    whiskAIService.saveConfiguration();

    const thumbnailData = {
      title: "Test Video",
      contentType: 'political'
    };

    const result = await whiskAIService.generateVisualConcept(thumbnailData);

    // Should return basic concept when feature is disabled
    expect(result).toBeDefined();
    expect(result.subject).toBe(thumbnailData.title);
    expect(result.scene).toBe("professional studio setting");
  });

  it('should check availability correctly', () => {
    // Should be available by default
    expect(whiskAIService.isAvailable()).toBe(true);

    // Should not be available when disabled
    whiskAIService.config.whiskAI.enabled = false;
    whiskAIService.saveConfiguration();
    expect(whiskAIService.isAvailable()).toBe(false);

    // Reset for other tests
    whiskAIService.config.whiskAI.enabled = true;
    whiskAIService.saveConfiguration();
  });

  it('should reset daily usage', () => {
    // Set usage to non-zero value
    whiskAIService.config.whiskAI.currentUsage = 25;
    whiskAIService.saveConfiguration();

    // Reset daily usage
    whiskAIService.resetDailyUsage();

    // Check that usage was reset
    expect(whiskAIService.config.whiskAI.currentUsage).toBe(0);
  });
});