const VideoScheduler = require('./videoScheduler');

async function testVideoScheduler() {
  console.log('🚀 Testing VideoScheduler...');

  try {
    // Create scheduler instance
    const scheduler = new VideoScheduler();

    // Initialize scheduler
    await scheduler.initialize();

    // Test daily video process
    console.log('\n🌅 Testing daily video process...');
    await scheduler.runDailyVideoProcess();

    // Test weekly video process
    console.log('\n📅 Testing weekly video process...');
    await scheduler.runWeeklyVideoProcess();

    // Get and display video schedule
    console.log('\n📋 Getting video schedule...');
    const schedule = await scheduler.getVideoSchedule();
    console.log('Video schedule:', JSON.stringify(schedule, null, 2));

    // Save video schedule
    console.log('\n💾 Saving video schedule...');
    await scheduler.saveVideoSchedule();

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testVideoScheduler();