const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Scraping Service with Weekend Pause
 * Scrapes web content with automatic pause on weekends
 */
class ScrapingService {
  constructor() {
    this.scrapedDir = path.join(__dirname, '../../data/scraped');
    this.logsDir = path.join(__dirname, '../../data/logs');
    this.isPaused = false;
    this.pauseReason = null;
    this.scrapingStats = {
      totalRequests: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      weekendPauses: 0,
      lastScrape: null
    };
    
    this.ensureDirectories();
    this.loadStats();
    this.startWeekendMonitor();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.scrapedDir, this.logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load scraping statistics
   */
  loadStats() {
    try {
      const statsPath = path.join(this.logsDir, 'scraping-stats.json');
      if (fs.existsSync(statsPath)) {
        this.scrapingStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      }
    } catch (error) {
      console.error('❌ Failed to load scraping stats:', error);
    }
  }

  /**
   * Save scraping statistics
   */
  saveStats() {
    try {
      const statsPath = path.join(this.logsDir, 'scraping-stats.json');
      fs.writeFileSync(statsPath, JSON.stringify(this.scrapingStats, null, 2));
    } catch (error) {
      console.error('❌ Failed to save scraping stats:', error);
    }
  }

  /**
   * Start weekend monitor
   */
  startWeekendMonitor() {
    // Check for weekend pause every hour
    setInterval(() => {
      this.checkWeekendPause();
    }, 60 * 60 * 1000); // 1 hour
    
    // Initial check
    this.checkWeekendPause();
  }

  /**
   * Check if scraping should be paused due to weekend
   */
  checkWeekendPause() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if it's weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (!this.isPaused) {
        this.isPaused = true;
        this.pauseReason = 'weekend';
        this.scrapingStats.weekendPauses++;
        this.saveStats();
        console.log('⏸️  Scraping paused for weekend');
      }
    } else {
      // Check if it's Monday and we were paused for weekend
      if (this.isPaused && this.pauseReason === 'weekend') {
        this.isPaused = false;
        this.pauseReason = null;
        console.log('▶️  Scraping resumed after weekend');
      }
    }
  }

  /**
   * Scrape URL content
   */
  async scrapeUrl(url, options = {}) {
    // Check if paused
    if (this.isPaused) {
      throw new Error(`Scraping is currently paused (${this.pauseReason})`);
    }
    
    try {
      console.log(`🕷️  Scraping URL: ${url}`);
      
      this.scrapingStats.totalRequests++;
      
      // Add delay to be respectful to servers
      await this.delay(1000 + Math.random() * 2000);
      
      // Scrape the URL
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        ...options
      });
      
      // Process the response
      const scrapedData = {
        url,
        title: this.extractTitle(response.data),
        content: this.extractContent(response.data),
        wordCount: this.countWords(response.data),
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        headers: response.headers
      };
      
      // Save scraped data
      const scrapeId = uuidv4();
      this.saveScrapedData(scrapeId, scrapedData);
      
      this.scrapingStats.successfulScrapes++;
      this.scrapingStats.lastScrape = new Date().toISOString();
      this.saveStats();
      
      console.log(`✅ Successfully scraped: ${url}`);
      
      return {
        scrapeId,
        ...scrapedData
      };
    } catch (error) {
      this.scrapingStats.failedScrapes++;
      this.saveStats();
      
      console.error(`❌ Failed to scrape ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract title from HTML
   */
  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'No title found';
  }

  /**
   * Extract content from HTML (simplified)
   */
  extractContent(html) {
    // Remove script and style tags
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    content = content.replace(/<[^>]+>/g, ' ');
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    // Limit content length
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }
    
    return content;
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Save scraped data
   */
  saveScrapedData(scrapeId, data) {
    try {
      const filename = `scraped-${scrapeId}.json`;
      const filepath = path.join(this.scrapedDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Scraped data saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save scraped data:', error);
    }
  }

  /**
   * Load scraped data
   */
  loadScrapedData(scrapeId) {
    try {
      const filename = `scraped-${scrapeId}.json`;
      const filepath = path.join(this.scrapedDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return null;
      }
      
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load scraped data:', error);
      return null;
    }
  }

  /**
   * List all scraped data
   */
  listScrapedData() {
    try {
      const files = fs.readdirSync(this.scrapedDir)
        .filter(f => f.startsWith('scraped-') && f.endsWith('.json'));
      
      return files.map(f => {
        const scrapeId = f.replace('scraped-', '').replace('.json', '');
        return {
          scrapeId,
          filename: f,
          createdAt: fs.statSync(path.join(this.scrapedDir, f)).birthtime.toISOString()
        };
      });
    } catch (error) {
      console.error('❌ Failed to list scraped data:', error);
      return [];
    }
  }

  /**
   * Search scraped data by keyword
   */
  searchScrapedData(keyword) {
    try {
      const results = [];
      const files = fs.readdirSync(this.scrapedDir)
        .filter(f => f.startsWith('scraped-') && f.endsWith('.json'));
      
      files.forEach(f => {
        try {
          const filepath = path.join(this.scrapedDir, f);
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          
          if (data.title.toLowerCase().includes(keyword.toLowerCase()) ||
              data.content.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({
              scrapeId: f.replace('scraped-', '').replace('.json', ''),
              url: data.url,
              title: data.title,
              wordCount: data.wordCount,
              timestamp: data.timestamp
            });
          }
        } catch (error) {
          // Skip files that can't be parsed
        }
      });
      
      return results;
    } catch (error) {
      console.error('❌ Failed to search scraped data:', error);
      return [];
    }
  }

  /**
   * Add delay between requests
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get scraping statistics
   */
  getStats() {
    return {
      ...this.scrapingStats,
      isPaused: this.isPaused,
      pauseReason: this.pauseReason,
      successRate: this.scrapingStats.totalRequests > 0 
        ? Math.round((this.scrapingStats.successfulScrapes / this.scrapingStats.totalRequests) * 100)
        : 0
    };
  }

  /**
   * Clear scraped data
   */
  clearScrapedData() {
    try {
      const files = fs.readdirSync(this.scrapedDir)
        .filter(f => f.startsWith('scraped-') && f.endsWith('.json'));
      
      files.forEach(f => {
        fs.unlinkSync(path.join(this.scrapedDir, f));
      });
      
      // Reset stats
      this.scrapingStats = {
        totalRequests: 0,
        successfulScrapes: 0,
        failedScrapes: 0,
        weekendPauses: this.scrapingStats.weekendPauses,
        lastScrape: null
      };
      this.saveStats();
      
      console.log(`🧹 Cleared ${files.length} scraped data files`);
      
      return {
        cleared: files.length
      };
    } catch (error) {
      console.error('❌ Failed to clear scraped data:', error);
      throw error;
    }
  }

  /**
   * Force resume scraping (override weekend pause)
   */
  forceResume() {
    this.isPaused = false;
    this.pauseReason = null;
    console.log('▶️  Scraping forcefully resumed');
  }

  /**
   * Force pause scraping
   */
  forcePause(reason = 'manual') {
    this.isPaused = true;
    this.pauseReason = reason;
    console.log(`⏸️  Scraping forcefully paused (${reason})`);
  }
}

module.exports = ScrapingService;