const ScraperInterface = require('../../utils/ScraperInterface');

describe('ScraperInterface', () => {
  let scraperInterface;

  beforeEach(() => {
    scraperInterface = new ScraperInterface();
  });

  describe('scrapeUrl', () => {
    it('should scrape content from URL', async () => {
      const url = 'https://example.com/test';

      const result = await scraperInterface.scrapeUrl(url);

      expect(result).toBeDefined();
      expect(result.url).toBe(url);
      expect(result.title).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.links).toBeDefined();
    }, 10000); // Longer timeout for scraping

    it('should use cache for subsequent requests', async () => {
      const url = 'https://example.com/cached-test';

      // First request
      const result1 = await scraperInterface.scrapeUrl(url);
      expect(result1).toBeDefined();

      // Second request should use cache
      const result2 = await scraperInterface.scrapeUrl(url);
      expect(result2).toBeDefined();

      // Both results should be the same
      expect(result1.url).toBe(result2.url);
    }, 10000);
  });

  describe('scrapeMultipleUrls', () => {
    it('should scrape multiple URLs', async () => {
      const urls = [
        'https://example.com/test1',
        'https://example.com/test2'
      ];

      const results = await scraperInterface.scrapeMultipleUrls(urls);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);

      // Check structure of results
      results.forEach(result => {
        expect(result.url).toBeDefined();
        expect(result.success).toBeDefined();
        if (result.success) {
          expect(result.data).toBeDefined();
        }
      });
    }, 15000); // Longer timeout for multiple scraping
  });

  describe('scrapeByTopic', () => {
    it('should scrape content by topic', async () => {
      const topic = 'Künstliche Intelligenz';

      const result = await scraperInterface.scrapeByTopic(topic);

      expect(result).toBeDefined();
      expect(result.topic).toBe(topic);
      expect(result.sources).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.statistics).toBeDefined();
      expect(result.scrapedAt).toBeDefined();
    }, 15000); // Longer timeout for topic scraping
  });

  describe('organizeScrapedData', () => {
    it('should organize scraped data', () => {
      const scrapeResults = [
        {
          success: true,
          url: 'https://example.com/1',
          data: {
            title: 'Article 1',
            content: 'Content 1',
            metadata: { qualityScore: 80 }
          }
        },
        {
          success: true,
          url: 'https://example.com/2',
          data: {
            title: 'Article 2',
            content: 'Content 2',
            metadata: { qualityScore: 90 }
          }
        }
      ];

      const topic = 'Test Topic';
      const organizedData = scraperInterface.organizeScrapedData(scrapeResults, topic);

      expect(organizedData).toBeDefined();
      expect(organizedData.topic).toBe(topic);
      expect(organizedData.sources).toBe(2);
      expect(organizedData.items).toBeDefined();
      expect(Array.isArray(organizedData.items)).toBe(true);
      expect(organizedData.items.length).toBe(2);
      expect(organizedData.statistics).toBeDefined();
      expect(organizedData.scrapedAt).toBeDefined();

      // Items should be sorted by quality and relevance
      // First item should have higher score than second
      if (organizedData.items.length >= 2) {
        const score1 = (organizedData.items[0].qualityScore || 0) * 0.6 + (organizedData.items[0].relevanceScore || 0) * 0.4;
        const score2 = (organizedData.items[1].qualityScore || 0) * 0.6 + (organizedData.items[1].relevanceScore || 0) * 0.4;
        expect(score1).toBeGreaterThanOrEqual(score2);
      }
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should calculate relevance score based on topic matches', () => {
      const scrapedData = {
        title: 'Künstliche Intelligenz in der Politik',
        content: 'This article discusses AI and its impact on politics'
      };

      const topic = 'Künstliche Intelligenz Politik';
      const score = scraperInterface.calculateRelevanceScore(scrapedData, topic);

      expect(score).toBeDefined();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return low score for unrelated content', () => {
      const scrapedData = {
        title: 'Cooking Recipes',
        content: 'How to cook delicious meals'
      };

      const topic = 'Künstliche Intelligenz';
      const score = scraperInterface.calculateRelevanceScore(scrapedData, topic);

      expect(score).toBeLessThan(50); // Should be low for unrelated content
    });
  });

  describe('getStats', () => {
    it('should return scraper statistics', () => {
      const stats = scraperInterface.getStats();

      expect(stats).toBeDefined();
      expect(stats.cacheItems).toBeDefined();
      expect(stats.researchTopics).toBeDefined();
      expect(stats.dataDir).toBeDefined();
      expect(stats.cacheDir).toBeDefined();
    });
  });
});