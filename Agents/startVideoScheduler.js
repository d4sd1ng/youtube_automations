const videoSchedulerAgent = require('./videoSchedulerAgent');

async function startvideoSchedulerAgent() {
  console.log('🚀 Starting Video Scheduler Agent...');
  
  try {
    // Create scheduler instance
    const scheduler = new videoSchedulerAgent();
    
    // Initialize scheduler
    await scheduler.initialize();
    
    // Start the scheduled processes
    scheduler.scheduleVideoProcesses();
    
    console.log('✅ Video Scheduler Agent started successfully!');
    console.log('📅 Daily videos will be created at 2:00 AM');
    console.log('📅 Weekly videos will be created every Monday at 3:00 AM');
    
  } catch (error) {
    console.error('❌ Failed to start Video Scheduler Agent:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Video Scheduler Agent...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Video Scheduler Agent...');
  process.exit(0);
});

// Run the Agent
startvideoSchedulerAgent();
