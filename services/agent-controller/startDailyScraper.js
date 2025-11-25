#!/usr/bin/env node

/**
 * Start Daily Scraper
 * This script starts the daily scraping service
 */

const DailyScraper = require('./dailyScraper');

async function startScraper() {
  console.log('🚀 Starting Daily Scraper Service...');

  try {
    const dailyScraper = new DailyScraper();

    // Initialize the scraper
    await dailyScraper.initialize();

    // Schedule daily scraping
    dailyScraper.scheduleDailyScraping();

    console.log('✅ Daily Scraper Service is now running');
    console.log('📅 Will run daily scraping every 24 hours');
    console.log('📁 Results will be saved to ./data/scraping-results/');

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down Daily Scraper Service...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start Daily Scraper Service:', error);
    process.exit(1);
  }
}

// Start the scraper if this file is run directly
if (require.main === module) {
  startScraper();
}

module.exports = startScraper;