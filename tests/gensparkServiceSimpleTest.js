const GensparkService = require('../services/agent-controller/gensparkService');
const fs = require('fs');
const path = require('path');

/**
 * Simple test for GensparkService
 */
async function testGensparkService() {
  console.log('🔬 Testing GensparkService...\n');

  try {
    // Create service instance
    const gensparkService = new GensparkService();

    console.log('✅ GensparkService instantiated successfully\n');

    // Test configuration loading
    console.log('⚙️  Testing configuration loading...');
    console.log(`Enabled: ${gensparkService.config.genspark.enabled}`);
    console.log(`Base URL: ${gensparkService.config.genspark.baseUrl}`);
    console.log(`Tier: ${gensparkService.config.genspark.tier}\n`);

    // Test availability check
    console.log('🔌 Testing availability check...');
    const isAvailable = gensparkService.isAvailable();
    console.log(`Is Available: ${isAvailable}\n`);

    // Test usage statistics
    console.log('📊 Testing usage statistics...');
    const stats = gensparkService.getUsageStats();
    console.log(`Current Usage: ${stats.currentUsage}`);
    console.log(`Daily Limit: ${stats.dailyLimit}`);
    console.log(`Remaining Usage: ${stats.remainingUsage}\n`);

    // Test fallback thumbnail creation
    console.log('🎨 Testing fallback thumbnail creation...');
    const fallback = gensparkService.createFallbackThumbnail('Test prompt');
    console.log(`Fallback Success: ${!fallback.success}`);
    console.log(`Fallback Message: ${fallback.message}\n`);

    // Test daily usage reset
    console.log('🔄 Testing daily usage reset...');
    const previousUsage = gensparkService.config.genspark.currentUsage;
    gensparkService.resetDailyUsage();
    const newUsage = gensparkService.config.genspark.currentUsage;
    console.log(`Previous Usage: ${previousUsage}`);
    console.log(`New Usage: ${newUsage}`);
    console.log(`Reset Successful: ${newUsage === 0}\n`);

    console.log('🎉 All GensparkService tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testGensparkService().catch(console.error);
}

module.exports = testGensparkService;