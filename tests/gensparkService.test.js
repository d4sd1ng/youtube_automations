const GensparkService = require('../services/agent-controller/gensparkService');
const fs = require('fs');
const path = require('path');

/**
 * Unit tests for GensparkService
 */
describe('GensparkService', () => {
  let gensparkService;
  let originalConfig;

  beforeEach(() => {
    gensparkService = new GensparkService();

    // Save original config
    originalConfig = JSON.parse(JSON.stringify(gensparkService.config));
  });

  afterEach(() => {
    // Restore original config
    gensparkService.config = originalConfig;
    gensparkService.saveConfiguration();
  });

  test('should load configuration correctly', () => {
    expect(gensparkService.config).toBeDefined();
    expect(gensparkService.config.genspark).toBeDefined();
    expect(gensparkService.config.genspark.enabled).toBe(true);
    expect(gensparkService.config.genspark.baseUrl).toBe('https://api.genspark.ai');
  });

  test('should check if service is available', () => {
    // Test when service is enabled and within limits
    gensparkService.config.genspark.enabled = true;
    gensparkService.config.genspark.currentUsage = 0;
    gensparkService.config.genspark.dailyLimit = 50;
    gensparkService.config.genspark.apiKey = 'test-key';

    if (gensparkService.config.budget) {
      gensparkService.config.budget.currentSpent = 0;
      gensparkService.config.budget.monthlyLimit = 100;
    }

    expect(gensparkService.isAvailable()).toBe(true);

    // Test when service is disabled
    gensparkService.config.genspark.enabled = false;
    expect(gensparkService.isAvailable()).toBe(false);
  });

  test('should get usage statistics', () => {
    const stats = gensparkService.getUsageStats();

    expect(stats).toBeDefined();
    expect(stats.enabled).toBe(gensparkService.config.genspark.enabled);
    expect(stats.tier).toBe(gensparkService.config.genspark.tier);
    expect(stats.dailyLimit).toBe(gensparkService.config.genspark.dailyLimit);
    expect(stats.currentUsage).toBe(gensparkService.config.genspark.currentUsage);
  });

  test('should create fallback thumbnail', () => {
    const prompt = 'Test thumbnail prompt';
    const fallback = gensparkService.createFallbackThumbnail(prompt);

    expect(fallback).toBeDefined();
    expect(fallback.success).toBe(false);
    expect(fallback.prompt).toBe(prompt);
    expect(fallback.fallback).toBe(true);
  });

  test('should reset daily usage', () => {
    // Set some usage
    gensparkService.config.genspark.currentUsage = 10;
    const previousReset = gensparkService.config.genspark.lastReset;

    // Reset usage
    gensparkService.resetDailyUsage();

    expect(gensparkService.config.genspark.currentUsage).toBe(0);
    expect(gensparkService.config.genspark.lastReset).not.toBe(previousReset);
  });

  // Note: The following tests would require mocking HTTP requests
  // In a real implementation, you would use nock or similar to mock the Genspark API

  test('should handle thumbnail generation when service is disabled', async () => {
    gensparkService.config.genspark.enabled = false;

    const result = await gensparkService.generateThumbnail('Test prompt');
    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
  });

  test('should handle image enhancement when service is disabled', async () => {
    gensparkService.config.genspark.enabled = false;

    const result = await gensparkService.enhanceImage('http://example.com/image.jpg');
    expect(result.enhanced).toBe(false);
    expect(result.imageUrl).toBe('http://example.com/image.jpg');
  });
});

console.log('✅ All GensparkService tests completed');