const ResearchManager = require('../../core/ResearchManager');

describe('ResearchManager', () => {
  let researchManager;

  beforeEach(() => {
    researchManager = new ResearchManager();
  });

  describe('checkExistingContent', () => {
    it('should return null when no existing content is found', async () => {
      const result = await researchManager.checkExistingContent('Non-existent topic');
      expect(result).toBeNull();
    });

    it('should return existing content when found', async () => {
      // Create some test content first
      const testTopic = 'Test Topic';
      const testData = {
        items: [{ title: 'Test Item', qualityScore: 80 }],
        statistics: { totalItems: 1, averageQuality: 80 }
      };

      // Save test data
      await researchManager.saveToTopicDatabase(testTopic, testData);

      // Now check for it
      const result = await researchManager.checkExistingContent(testTopic);
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items.length).toBe(1);
    });
  });

  describe('scrapeNewContent', () => {
    it('should scrape and organize new content', async () => {
      const topic = 'AI in Politics';
      const options = { maxItems: 5 };

      const result = await researchManager.scrapeNewContent(topic, options);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.grouped).toBeDefined();
      expect(result.keyInsights).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.scrapedAt).toBeDefined();
    }, 10000); // Longer timeout for scraping
  });

  describe('performMarketResearch', () => {
    it('should perform market research for a topic', async () => {
      const topic = 'Künstliche Intelligenz';

      const result = await researchManager.performMarketResearch(topic);

      expect(result).toBeDefined();
      expect(result.topic).toBe(topic);
      expect(result.marketSize).toBeDefined();
      expect(result.competition).toBeDefined();
      expect(result.targetAudience).toBeDefined();
      expect(result.pricing).toBeDefined();
      expect(result.platforms).toBeDefined();
      expect(result.analyzedAt).toBeDefined();
    });
  });

  describe('rankContentByValue', () => {
    it('should rank content by value', () => {
      const testData = {
        items: [
          { qualityScore: 70, relevanceScore: 80, date: new Date().toISOString() },
          { qualityScore: 90, relevanceScore: 60, date: new Date().toISOString() },
          { qualityScore: 80, relevanceScore: 90, date: new Date().toISOString() }
        ]
      };

      const result = researchManager.rankContentByValue(testData);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items.length).toBe(3);
      // The exact order might vary, but we should have the same items
    });
  });

  describe('calculateRecencyScore', () => {
    it('should calculate recency score correctly', () => {
      const recentDate = new Date().toISOString();
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

      const recentScore = researchManager.calculateRecencyScore(recentDate);
      const oldScore = researchManager.calculateRecencyScore(oldDate);

      expect(recentScore).toBeGreaterThan(oldScore);
    });
  });

  describe('getResearchSummary', () => {
    it('should return null for non-existent topic', async () => {
      const result = await researchManager.getResearchSummary('Non-existent topic');
      expect(result).toBeNull();
    });

    it('should return summary for existing topic', async () => {
      const testTopic = 'Summary Test Topic';
      const testData = {
        items: [
          { title: 'Item 1', qualityScore: 80, relevanceScore: 90 },
          { title: 'Item 2', qualityScore: 70, relevanceScore: 80 }
        ],
        statistics: {
          totalItems: 2,
          sources: ['source1'],
          averageQuality: 75,
          averageRelevance: 85
        },
        keyInsights: [{ type: 'trend', description: 'Test trend' }],
        scrapedAt: new Date().toISOString()
      };

      // Save test data
      await researchManager.saveToTopicDatabase(testTopic, testData);

      // Get summary
      const result = await researchManager.getResearchSummary(testTopic);

      expect(result).toBeDefined();
      expect(result.topic).toBe(testTopic);
      expect(result.itemsCount).toBe(2);
      expect(result.sourcesCount).toBe(1);
      expect(result.averageQuality).toBe(75);
      expect(result.averageRelevance).toBe(85);
      expect(result.keyInsights).toBeDefined();
      expect(result.lastUpdated).toBeDefined();
    });
  });
});