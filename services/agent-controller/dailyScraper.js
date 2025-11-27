<<<<<<< HEAD
const WebScrapingAgent = require('./webScrapingAgent');
const fs = require('fs').promises;
const scrapingConfig = require('./scrapingConfig.json');

/**
 * Daily Scraper Service
 * Automatically scrapes content daily for specific keywords and themes for both channels
 */
class DailyScraper {
  constructor() {
    this.scrapingAgent = new WebScrapingAgent();
    // Load channel configurations
    this.channels = scrapingConfig.channels;
=======
const WebScrapingService = require('./webScrapingService');
const fs = require('fs').promises;

/**
 * Daily Scraper Service
 * Automatically scrapes content daily for specific keywords and themes
 */
class DailyScraper {
  constructor() {
    this.scrapingService = new WebScrapingService();
    this.keywords = ['ki', 'afd', 'politik'];
    this.sources = ['youtube', 'twitter', 'tiktok', 'instagram', 'bundestag', 'landtage', 'politische-talkshows'];
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
    this.resultsDirectory = './data/scraping-results';
  }

  /**
   * Initialize the daily scraper
   */
  async initialize() {
    try {
      // Create results directory if it doesn't exist
      await fs.mkdir(this.resultsDirectory, { recursive: true });
      console.log('✅ Daily scraper initialized');
    } catch (error) {
      console.error('❌ Failed to initialize daily scraper:', error);
    }
  }

  /**
<<<<<<< HEAD
   * Run daily scraping operation for a specific channel
   */
  async runDailyScrapingForChannel(channelId) {
    try {
      const channel = this.channels[channelId];
      if (!channel) {
        throw new Error(`Channel ${channelId} not found in configuration`);
      }

      console.log(`🚀 Starting daily scraping operation for channel: ${channel.name}...`);

      // Get current date for filename
      const currentDate = new Date().toISOString().split('T')[0];

      // Execute scraping with channel-specific keywords and sources
      const result = await this.scrapingAgent.execute({
        type: channelId === 'senara' ? 'scrape-political-content' : 'scrape-business-content',
        keywords: channel.keywords,
        sources: channel.sources
      });

      // Add channel information to result
      result.channelId = channelId;
      result.channelName = channel.name;

      return result;
    } catch (error) {
      console.error(`❌ Daily scraping failed for channel ${channelId}:`, error);
      throw error;
    }
  }

  /**
   * Run daily scraping operation for all channels
   */
  async runDailyScraping() {
    try {
      console.log('🚀 Starting daily scraping operation for all channels...');
=======
   * Run daily scraping operation
   */
  async runDailyScraping() {
    try {
      console.log('🚀 Starting daily scraping operation...');
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3

      // Get current date for filename
      const currentDate = new Date().toISOString().split('T')[0];

<<<<<<< HEAD
      // Scrape content for each channel
      const channelResults = {};
      for (const channelId in this.channels) {
        const channelResult = await this.runDailyScrapingForChannel(channelId);
        channelResults[channelId] = channelResult;
      }

      // Combine results for overall output
      const combinedResult = {
        success: true,
        timestamp: new Date().toISOString(),
        channels: channelResults,
        totalItems: Object.values(channelResults).reduce((sum, result) => sum + (result.totalItems || 0), 0),
        highQualityItems: Object.values(channelResults).reduce((sum, result) => sum + (result.highQualityItems || 0), 0)
      };

      // Save results to file
      const filename = `${this.resultsDirectory}/daily-scraping-results-${currentDate}.json`;
      await fs.writeFile(filename, JSON.stringify(combinedResult, null, 2));

      console.log(`✅ Daily scraping completed and saved to ${filename}`);
      console.log(`📊 Found ${combinedResult.totalItems} items, ${combinedResult.highQualityItems} with high quality`);

      // Log results for each channel
      for (const channelId in channelResults) {
        const result = channelResults[channelId];
        const channel = this.channels[channelId];
        console.log(`\n📢 Channel: ${channel.name} (${channelId})`);
        console.log(`   Found ${result.totalItems} items, ${result.highQualityItems} with high quality`);

        // Log top themes
        if (result.themes && result.themes.length > 0) {
          console.log('   🏷️  Top themes:');
          result.themes.slice(0, 3).forEach(theme => {
            console.log(`      ${theme.theme}: ${theme.score} points`);
          });
        }

        // Log video topics
        if (result.videoTopics) {
          console.log('   🎬 Video topics found:');
          Object.keys(result.videoTopics).forEach(theme => {
            if (result.videoTopics[theme].length > 0) {
              console.log(`      ${theme}: ${result.videoTopics[theme].slice(0, 3).join(', ')}`);
            }
          });
        }
      }

      return combinedResult;
=======
      // Execute scraping
      const result = await this.scrapingService.execute({
        type: 'scrape-keywords',
        keywords: this.keywords,
        sources: this.sources
      });

      // Save results to file
      const filename = `${this.resultsDirectory}/daily-scraping-results-${currentDate}.json`;
      await fs.writeFile(filename, JSON.stringify(result, null, 2));

      console.log(`✅ Daily scraping completed and saved to ${filename}`);
      console.log(`📊 Found ${result.totalItems} items, ${result.highQualityItems} with high quality`);

      // Log top themes
      if (result.themes && result.themes.length > 0) {
        console.log('🏷️  Top themes:');
        result.themes.forEach(theme => {
          console.log(`   ${theme.theme}: ${theme.score} points`);
        });
      }

      // Log video topics
      if (result.videoTopics) {
        console.log('🎬 Video topics found:');
        Object.keys(result.videoTopics).forEach(theme => {
          if (result.videoTopics[theme].length > 0) {
            console.log(`   ${theme}: ${result.videoTopics[theme].join(', ')}`);
          }
        });
      }

      return result;
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
    } catch (error) {
      console.error('❌ Daily scraping failed:', error);
      throw error;
    }
  }

  /**
   * Schedule daily scraping (runs every 24 hours)
   */
  scheduleDailyScraping() {
    console.log('📅 Scheduling daily scraping...');

    // Run immediately
    this.runDailyScraping();

    // Schedule to run every 24 hours
    setInterval(async () => {
      try {
        await this.runDailyScraping();
      } catch (error) {
        console.error('❌ Scheduled scraping failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    console.log('✅ Daily scraping scheduled to run every 24 hours');
  }

  /**
   * Get scraping results from a specific date
   */
  async getResultsFromDate(date) {
    try {
      const filename = `${this.resultsDirectory}/daily-scraping-results-${date}.json`;
      const data = await fs.readFile(filename, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Failed to read results from ${date}:`, error);
      return null;
    }
  }

  /**
   * Get all available scraping results
   */
  async getAllResults() {
    try {
      const files = await fs.readdir(this.resultsDirectory);
      const results = [];

      for (const file of files) {
        if (file.startsWith('daily-scraping-results-') && file.endsWith('.json')) {
          const data = await fs.readFile(`${this.resultsDirectory}/${file}`, 'utf8');
          results.push({
            date: file.replace('daily-scraping-results-', '').replace('.json', ''),
            data: JSON.parse(data)
          });
        }
      }

      // Sort by date (newest first)
      results.sort((a, b) => new Date(b.date) - new Date(a.date));

      return results;
    } catch (error) {
      console.error('❌ Failed to read all results:', error);
      return [];
    }
  }
}

// If run directly, start the daily scraper
if (require.main === module) {
  const dailyScraper = new DailyScraper();

  dailyScraper.initialize().then(() => {
    dailyScraper.scheduleDailyScraping();
  });
}

module.exports = DailyScraper;