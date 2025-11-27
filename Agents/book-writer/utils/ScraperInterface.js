const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Scraper Interface for Book Writer Agent
 * Provides unified interface for content scraping and data extraction
 */
class ScraperInterface {
  constructor(config = {}) {
    this.config = {
      dataDir: path.join(__dirname, '../../../data/scraping'),
      cacheDir: path.join(__dirname, '../../../data/scraping/cache'),
      userAgent: 'BookWriterAgent/1.0 (https://example.com)',
      timeout: 10000,
      maxRetries: 3,
      ...config
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.config.dataDir, this.config.cacheDir];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Scrape content from URL
   * @param {string} url - URL to scrape
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Scraped content
   */
  async scrapeUrl(url, options = {}) {
    console.log(`🔍 Scraping URL: ${url}`);

    try {
      // Check cache first
      const cachedResult = await this.checkCache(url);
      if (cachedResult && !options.forceRefresh) {
        console.log(`✅ Returning cached result for: ${url}`);
        return cachedResult;
      }

      // Scrape content with retries
      const scrapedData = await this.scrapeWithRetries(url, options);

      // Save to cache
      await this.saveToCache(url, scrapedData);

      console.log(`✅ Successfully scraped: ${url}`);
      return scrapedData;
    } catch (error) {
      console.error(`❌ Failed to scrape ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Scrape content with retry logic
   */
  async scrapeWithRetries(url, options, attempt = 1) {
    try {
      const scrapedData = await this.performScraping(url, options);
      return scrapedData;
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        console.log(`⚠️ Scrape attempt ${attempt} failed for ${url}, retrying...`);
        await this.delay(1000 * attempt); // Exponential backoff
        return await this.scrapeWithRetries(url, options, attempt + 1);
      } else {
        throw error;
      }
    }
  }

  /**
   * Perform actual scraping
   */
  async performScraping(url, options = {}) {
    // In a real implementation, this would integrate with Firecrawl or similar services
    // For now, we'll simulate the scraping process

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock scraped content
    const scrapedData = {
      url: url,
      title: `Scraped Content from ${new URL(url).hostname}`,
      content: `This is mock scraped content from ${url}. In a real implementation, this would be actual content extracted from the webpage.`,
      metadata: {
        scrapedAt: new Date().toISOString(),
        wordCount: Math.floor(Math.random() * 1000) + 500,
        qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        sourceType: this.determineSourceType(url)
      },
      links: [
        `${url}/related-1`,
        `${url}/related-2`,
        `${url}/related-3`
      ]
    };

    return scrapedData;
  }

  /**
   * Determine source type from URL
   */
  determineSourceType(url) {
    const hostname = new URL(url).hostname;

    if (hostname.includes('wikipedia')) {
      return 'encyclopedia';
    } else if (hostname.includes('news') || hostname.includes('zeitung')) {
      return 'news';
    } else if (hostname.includes('blog')) {
      return 'blog';
    } else if (hostname.includes('academic') || hostname.includes('research')) {
      return 'academic';
    } else {
      return 'general';
    }
  }

  /**
   * Scrape multiple URLs
   * @param {Array} urls - URLs to scrape
   * @param {Object} options - Scraping options
   * @returns {Promise<Array>} Scraped content results
   */
  async scrapeMultipleUrls(urls, options = {}) {
    console.log(`🔍 Scraping ${urls.length} URLs`);

    const results = [];

    for (const url of urls) {
      try {
        const scrapedData = await this.scrapeUrl(url, options);
        results.push({
          url: url,
          data: scrapedData,
          success: true
        });
      } catch (error) {
        console.error(`❌ Failed to scrape ${url}:`, error.message);
        results.push({
          url: url,
          error: error.message,
          success: false
        });
      }
    }

    console.log(`✅ Completed scraping ${urls.length} URLs: ${results.filter(r => r.success).length} successful`);
    return results;
  }

  /**
   * Scrape by topic using multiple sources
   * @param {string} topic - Topic to research
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Organized research data
   */
  async scrapeByTopic(topic, options = {}) {
    console.log(`🔍 Scraping content for topic: ${topic}`);

    try {
      // Generate relevant URLs for the topic
      const urls = this.generateTopicUrls(topic, options);

      // Scrape URLs
      const scrapeResults = await this.scrapeMultipleUrls(urls, options);

      // Organize results
      const organizedData = this.organizeScrapedData(scrapeResults, topic);

      // Save organized data
      await this.saveResearchData(topic, organizedData);

      console.log(`✅ Completed topic scraping for: ${topic}`);
      return organizedData;
    } catch (error) {
      console.error(`❌ Failed to scrape by topic ${topic}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate relevant URLs for a topic
   */
  generateTopicUrls(topic, options = {}) {
    // In a real implementation, this would be more sophisticated
    // For now, we'll generate mock URLs

    const baseUrl = options.baseUrl || 'https://example.com';
    const encodedTopic = encodeURIComponent(topic);

    return [
      `${baseUrl}/search?q=${encodedTopic}`,
      `${baseUrl}/topic/${encodedTopic}/overview`,
      `${baseUrl}/topic/${encodedTopic}/research`,
      `${baseUrl}/topic/${encodedTopic}/news`,
      `${baseUrl}/topic/${encodedTopic}/analysis`
    ];
  }

  /**
   * Organize scraped data
   */
  organizeScrapedData(scrapeResults, topic) {
    const successfulResults = scrapeResults.filter(r => r.success);

    // Extract key information
    const organizedData = {
      topic: topic,
      sources: successfulResults.length,
      items: successfulResults.map(result => ({
        id: this.generateItemId(result.url),
        url: result.url,
        title: result.data.title,
        content: result.data.content,
        metadata: result.data.metadata,
        qualityScore: result.data.metadata.qualityScore,
        relevanceScore: this.calculateRelevanceScore(result.data, topic)
      })),
      statistics: {
        totalItems: successfulResults.length,
        averageQuality: successfulResults.reduce((sum, item) => sum + item.data.metadata.qualityScore, 0) / successfulResults.length,
        averageRelevance: successfulResults.reduce((sum, item) => sum + this.calculateRelevanceScore(item.data, topic), 0) / successfulResults.length
      },
      scrapedAt: new Date().toISOString()
    };

    // Sort by quality and relevance
    organizedData.items.sort((a, b) => {
      const scoreA = (a.qualityScore || 0) * 0.6 + (a.relevanceScore || 0) * 0.4;
      const scoreB = (b.qualityScore || 0) * 0.6 + (b.relevanceScore || 0) * 0.4;
      return scoreB - scoreA;
    });

    return organizedData;
  }

  /**
   * Calculate relevance score
   */
  calculateRelevanceScore(scrapedData, topic) {
    // Simple relevance calculation based on topic matches
    const content = (scrapedData.title + ' ' + scrapedData.content).toLowerCase();
    const topicWords = topic.toLowerCase().split(' ');

    let matches = 0;
    for (const word of topicWords) {
      if (content.includes(word)) {
        matches++;
      }
    }

    return Math.min(100, (matches / topicWords.length) * 100);
  }

  /**
   * Generate item ID from URL
   */
  generateItemId(url) {
    return require('crypto').createHash('md5').update(url).digest('hex');
  }

  /**
   * Check cache for URL
   */
  async checkCache(url) {
    try {
      const cacheFile = path.join(this.config.cacheDir, `${this.generateItemId(url)}.json`);

      if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const now = new Date().getTime();
        const cacheAge = now - stats.mtime.getTime();

        // Cache is valid for 24 hours
        if (cacheAge < 24 * 60 * 60 * 1000) {
          const content = fs.readFileSync(cacheFile, 'utf8');
          return JSON.parse(content);
        }
      }

      return null;
    } catch (error) {
      console.warn(`⚠️ Cache check failed for ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Save data to cache
   */
  async saveToCache(url, data) {
    try {
      const cacheFile = path.join(this.config.cacheDir, `${this.generateItemId(url)}.json`);
      fs.writeFileSync(cacheFile, JSON.stringify({ ...data, cachedAt: new Date().toISOString() }, null, 2));
    } catch (error) {
      console.warn(`⚠️ Failed to save to cache for ${url}:`, error.message);
    }
  }

  /**
   * Save research data
   */
  async saveResearchData(topic, data) {
    try {
      const filename = `research-${this.sanitizeFilename(topic)}.json`;
      const filepath = path.join(this.config.dataDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Research data saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save research data:', error.message);
    }
  }

  /**
   * Load research data
   */
  async loadResearchData(topic) {
    try {
      const filename = `research-${this.sanitizeFilename(topic)}.json`;
      const filepath = path.join(this.config.dataDir, filename);

      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load research data:', error.message);
      return null;
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Delay helper
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get scraper statistics
   */
  getStats() {
    try {
      const cacheFiles = fs.readdirSync(this.config.cacheDir)
        .filter(f => f.endsWith('.json'));

      const researchFiles = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith('research-') && f.endsWith('.json'));

      return {
        cacheItems: cacheFiles.length,
        researchTopics: researchFiles.length,
        dataDir: this.config.dataDir,
        cacheDir: this.config.cacheDir
      };
    } catch (error) {
      console.error('❌ Failed to get scraper stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = ScraperInterface;