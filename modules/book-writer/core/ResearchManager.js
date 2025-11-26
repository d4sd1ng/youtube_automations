const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Research Manager for Book Writer Agent
 * Manages research and content gathering for book writing
 */
class ResearchManager {
  constructor(config = {}) {
    this.config = {
      researchDepth: 3,
      maxSources: 50,
      ...config
    };

    this.researchDir = path.join(__dirname, '../../../data/research');
    this.scraper = null; // Will be initialized with actual scraper service
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      this.researchDir,
      path.join(this.researchDir, 'scraped-content'),
      path.join(this.researchDir, 'topic-database'),
      path.join(this.researchDir, 'content-plans')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Check for existing content on a topic
   * @param {string} topic - The topic to research
   * @returns {Promise<Object|null>} Existing content or null if none found
   */
  async checkExistingContent(topic) {
    console.log(`🔍 Checking for existing content on topic: ${topic}`);

    try {
      // Check topic database
      const topicFile = path.join(this.researchDir, 'topic-database', `${this.sanitizeFilename(topic)}.json`);

      if (fs.existsSync(topicFile)) {
        const existingData = JSON.parse(fs.readFileSync(topicFile, 'utf8'));
        console.log(`✅ Found existing research data for topic: ${topic}`);
        return this.rankContentByValue(existingData);
      }

      console.log(`ℹ️ No existing content found for topic: ${topic}`);
      return null;
    } catch (error) {
      console.warn(`⚠️ Error checking existing content: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrape new content for a topic
   * @param {string} topic - The topic to research
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Scraped and organized content
   */
  async scrapeNewContent(topic, options = {}) {
    console.log(`🔍 Scraping new content for topic: ${topic}`);

    try {
      // In a real implementation, this would integrate with Firecrawl or similar services
      // For now, we'll simulate the scraping process
      const scrapedContent = await this.simulateScraping(topic, options);

      // Organize and save content
      const organizedContent = this.organizeContent(scrapedContent);

      // Save to topic database
      await this.saveToTopicDatabase(topic, organizedContent);

      console.log(`✅ Scraped and organized content for topic: ${topic}`);
      return organizedContent;
    } catch (error) {
      console.error(`❌ Failed to scrape content for topic: ${topic}`, error);
      throw error;
    }
  }

  /**
   * Simulate scraping process (would be replaced with actual Firecrawl integration)
   */
  async simulateScraping(topic, options = {}) {
    // Simulate delay for scraping
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock scraped content
    const sources = options.sources || ['bundestag.de', 'landtage.de', 'politik-talkshows'];
    const contentItems = [];

    for (let i = 0; i < Math.min(options.maxItems || 10, 20); i++) {
      const source = sources[Math.floor(Math.random() * sources.length)];
      contentItems.push({
        id: `item_${i}`,
        title: `${topic} - Research Item ${i + 1}`,
        content: `This is sample content about ${topic}. In a real implementation, this would be actual scraped content from ${source}.`,
        source: source,
        url: `https://${source}/article/${i}`,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        relevanceScore: Math.floor(Math.random() * 30) + 70, // 70-100
        wordCount: Math.floor(Math.random() * 1000) + 500 // 500-1500 words
      });
    }

    return {
      items: contentItems,
      totalCount: contentItems.length,
      sources: sources,
      scrapedAt: new Date().toISOString()
    };
  }

  /**
   * Organize scraped content
   */
  organizeContent(scrapedData) {
    // Sort by quality and relevance
    const sortedItems = scrapedData.items.sort((a, b) => {
      const scoreA = (a.qualityScore || 0) * 0.6 + (a.relevanceScore || 0) * 0.4;
      const scoreB = (b.qualityScore || 0) * 0.6 + (b.relevanceScore || 0) * 0.4;
      return scoreB - scoreA;
    });

    // Group by source
    const groupedContent = {};
    sortedItems.forEach(item => {
      if (!groupedContent[item.source]) {
        groupedContent[item.source] = [];
      }
      groupedContent[item.source].push(item);
    });

    // Extract key information
    const keyInsights = this.extractKeyInsights(sortedItems);

    return {
      items: sortedItems,
      grouped: groupedContent,
      keyInsights: keyInsights,
      statistics: {
        totalItems: sortedItems.length,
        sources: Object.keys(groupedContent),
        averageQuality: sortedItems.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / sortedItems.length,
        averageRelevance: sortedItems.reduce((sum, item) => sum + (item.relevanceScore || 0), 0) / sortedItems.length
      },
      scrapedAt: scrapedData.scrapedAt
    };
  }

  /**
   * Extract key insights from content
   */
  extractKeyInsights(contentItems) {
    // In a real implementation, this would use NLP to extract key insights
    // For now, we'll generate mock insights
    const insights = [];

    if (contentItems.length > 0) {
      insights.push({
        type: 'trend',
        description: 'Current trends in the field show significant growth',
        confidence: 0.85
      });

      insights.push({
        type: 'opportunity',
        description: 'There is an opportunity to address gaps in existing literature',
        confidence: 0.75
      });

      insights.push({
        type: 'challenge',
        description: 'Key challenges include regulatory complexity and public acceptance',
        confidence: 0.9
      });
    }

    return insights;
  }

  /**
   * Rank content by value
   */
  rankContentByValue(content) {
    if (!content || !content.items) return content;

    // Sort by a combination of quality, relevance, and recency
    content.items.sort((a, b) => {
      // Calculate value score (0-100)
      const getValueScore = (item) => {
        const quality = item.qualityScore || 50;
        const relevance = item.relevanceScore || 50;
        const recency = this.calculateRecencyScore(item.date);

        // Weighted score: 40% quality, 40% relevance, 20% recency
        return quality * 0.4 + relevance * 0.4 + recency * 0.2;
      };

      return getValueScore(b) - getValueScore(a);
    });

    return content;
  }

  /**
   * Calculate recency score
   */
  calculateRecencyScore(dateString) {
    if (!dateString) return 50;

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);

    // More recent = higher score
    // 0 days = 100, 30 days = 70, 90 days = 40, 365 days = 10
    if (diffDays <= 0) return 100;
    if (diffDays <= 30) return 100 - (diffDays * 1);
    if (diffDays <= 90) return 70 - ((diffDays - 30) * 0.5);
    if (diffDays <= 365) return 40 - ((diffDays - 90) * 0.1);
    return 10;
  }

  /**
   * Save content to topic database
   */
  async saveToTopicDatabase(topic, content) {
    try {
      const topicFile = path.join(this.researchDir, 'topic-database', `${this.sanitizeFilename(topic)}.json`);
      fs.writeFileSync(topicFile, JSON.stringify(content, null, 2));
      console.log(`💾 Saved research data to topic database: ${topicFile}`);
    } catch (error) {
      console.error(`❌ Failed to save to topic database: ${error.message}`);
    }
  }

  /**
   * Perform market research for a book topic
   */
  async performMarketResearch(topic) {
    console.log(`🔍 Performing market research for topic: ${topic}`);

    // In a real implementation, this would query publisher databases, Amazon APIs, etc.
    // For now, we'll generate mock market data
    const marketData = {
      topic: topic,
      marketSize: {
        estimatedBooks: Math.floor(Math.random() * 500) + 100,
        annualGrowth: (Math.random() * 10).toFixed(2) + '%',
        marketValue: '$' + (Math.random() * 10000000 + 1000000).toFixed(0)
      },
      competition: {
        directCompetitors: Math.floor(Math.random() * 20) + 5,
        indirectCompetitors: Math.floor(Math.random() * 50) + 20,
        bestSellers: Math.floor(Math.random() * 10) + 1
      },
      targetAudience: {
        primary: 'Professionals and researchers',
        secondary: 'Students and enthusiasts',
        estimatedReaders: Math.floor(Math.random() * 100000) + 10000
      },
      pricing: {
        averagePrice: '$' + (Math.random() * 30 + 15).toFixed(2),
        premiumSegment: '$' + (Math.random() * 50 + 30).toFixed(2),
        budgetSegment: '$' + (Math.random() * 15 + 5).toFixed(2)
      },
      platforms: {
        online: ['Amazon', 'Apple Books', 'Google Play'],
        physical: ['Bertelsmann', 'Springer', 'Elsevier'],
        specialty: ['Academic publishers', 'Professional associations']
      },
      analyzedAt: new Date().toISOString()
    };

    console.log(`✅ Market research completed for topic: ${topic}`);
    return marketData;
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get research summary
   */
  async getResearchSummary(topic) {
    try {
      const topicFile = path.join(this.researchDir, 'topic-database', `${this.sanitizeFilename(topic)}.json`);

      if (fs.existsSync(topicFile)) {
        const content = JSON.parse(fs.readFileSync(topicFile, 'utf8'));
        return {
          topic: topic,
          itemsCount: content.items ? content.items.length : 0,
          sourcesCount: content.statistics ? content.statistics.sources.length : 0,
          averageQuality: content.statistics ? content.statistics.averageQuality : 0,
          averageRelevance: content.statistics ? content.statistics.averageRelevance : 0,
          keyInsights: content.keyInsights ? content.keyInsights.slice(0, 3) : [],
          lastUpdated: content.scrapedAt
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get research summary: ${error.message}`);
      return null;
    }
  }
}

module.exports = ResearchManager;