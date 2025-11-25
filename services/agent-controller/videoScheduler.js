const PipelineOrchestrator = require('./pipelineOrchestrator');
const DailyScraper = require('./dailyScraper');
const fs = require('fs').promises;

/**
 * Video Scheduler Service
 * Automates the daily and weekly video creation process for both channels
 */
class VideoScheduler {
  constructor() {
    this.orchestrator = new PipelineOrchestrator();
    this.scraper = new DailyScraper();
    this.resultsDirectory = './data/scraping-results';
    this.videoSchedule = './data/video-schedule.json';
    
    // Channel configurations
    this.channels = {
      'senara': {
        name: 'Senara',
        type: 'political'
      },
      'neurova': {
        name: 'Neurova', 
        type: 'technology'
      }
    };
  }

  /**
   * Initialize the video scheduler
   */
  async initialize() {
    try {
      // Create required directories
      await fs.mkdir('./data', { recursive: true });
      await fs.mkdir(this.resultsDirectory, { recursive: true });
      
      console.log('✅ Video scheduler initialized');
    } catch (error) {
      console.error('❌ Failed to initialize video scheduler:', error);
    }
  }

  /**
   * Run the daily video creation process
   */
  async runDailyVideoProcess() {
    try {
      console.log('🌅 Starting daily video creation process...');
      
      // First, run daily scraping for both channels
      console.log('🔍 Running daily scraping for both channels...');
      await this.scraper.runDailyScraping();
      
      // Create daily videos for each channel
      for (const channelId in this.channels) {
        console.log(`\n🎬 Creating daily videos for ${this.channels[channelId].name}...`);
        await this.orchestrator.createDailyVideos(channelId);
      }
      
      console.log('\n✅ Daily video creation process completed');
      
      // Log summary
      this.logVideoScheduleSummary();
    } catch (error) {
      console.error('❌ Daily video process failed:', error);
      throw error;
    }
  }

  /**
   * Run the weekly video creation process
   */
  async runWeeklyVideoProcess() {
    try {
      console.log('📅 Starting weekly video creation process...');
      
      // Create weekly videos for each channel
      for (const channelId in this.channels) {
        console.log(`\n🎬 Creating weekly video for ${this.channels[channelId].name}...`);
        await this.orchestrator.createWeeklyVideo(channelId);
      }
      
      console.log('\n✅ Weekly video creation process completed');
      
      // Log summary
      this.logVideoScheduleSummary();
    } catch (error) {
      console.error('❌ Weekly video process failed:', error);
      throw error;
    }
  }

  /**
   * Schedule daily and weekly video processes
   */
  scheduleVideoProcesses() {
    console.log('⏰ Scheduling video processes...');
    
    // Run daily process at 2 AM
    const now = new Date();
    const nextDailyRun = new Date();
    nextDailyRun.setHours(2, 0, 0, 0);
    if (nextDailyRun < now) {
      nextDailyRun.setDate(nextDailyRun.getDate() + 1);
    }
    
    const dailyDelay = nextDailyRun.getTime() - now.getTime();
    setTimeout(() => {
      this.runDailyVideoProcess();
      // Then run daily every 24 hours
      setInterval(() => {
        this.runDailyVideoProcess();
      }, 24 * 60 * 60 * 1000);
    }, dailyDelay);
    
    console.log(`✅ Daily video process scheduled for ${nextDailyRun.toLocaleString()}`);
    
    // Run weekly process on Monday at 3 AM
    const nextWeeklyRun = new Date();
    nextWeeklyRun.setHours(3, 0, 0, 0);
    const daysUntilMonday = (8 - nextWeeklyRun.getDay()) % 7;
    nextWeeklyRun.setDate(nextWeeklyRun.getDate() + daysUntilMonday);
    
    const weeklyDelay = nextWeeklyRun.getTime() - now.getTime();
    setTimeout(() => {
      this.runWeeklyVideoProcess();
      // Then run weekly every 7 days
      setInterval(() => {
        this.runWeeklyVideoProcess();
      }, 7 * 24 * 60 * 60 * 1000);
    }, weeklyDelay);
    
    console.log(`✅ Weekly video process scheduled for ${nextWeeklyRun.toLocaleString()}`);
  }

  /**
   * Log video schedule summary
   */
  logVideoScheduleSummary() {
    console.log('\n📊 Video Schedule Summary:');
    
    for (const channelId in this.channels) {
      const channelName = this.channels[channelId].name;
      const dailyVideos = this.orchestrator.getDailyVideos(channelId);
      const weeklyVideos = this.orchestrator.getWeeklyVideos(channelId);
      
      console.log(`\n📺 ${channelName} (${channelId}):`);
      console.log(`   Daily videos created: ${dailyVideos.length}`);
      console.log(`   Weekly videos created: ${weeklyVideos.length}`);
      
      if (dailyVideos.length > 0) {
        const latestDaily = dailyVideos[dailyVideos.length - 1];
        console.log(`   Latest daily video date: ${latestDaily.date}`);
        console.log(`   Morning videos: ${latestDaily.morningVideos.length}`);
        console.log(`   Afternoon videos: ${latestDaily.afternoonVideos.length}`);
      }
      
      if (weeklyVideos.length > 0) {
        const latestWeekly = weeklyVideos[weeklyVideos.length - 1];
        console.log(`   Latest weekly video week: ${latestWeekly.week}`);
        console.log(`   Long video created: ${latestWeekly.longVideo ? 'Yes' : 'No'}`);
        console.log(`   Short copies created: ${latestWeekly.shortCopies ? latestWeekly.shortCopies.length : 0}`);
      }
    }
  }

  /**
   * Get video schedule
   */
  async getVideoSchedule() {
    try {
      const schedule = {
        channels: {},
        lastUpdated: new Date().toISOString()
      };
      
      for (const channelId in this.channels) {
        schedule.channels[channelId] = {
          name: this.channels[channelId].name,
          dailyVideos: this.orchestrator.getDailyVideos(channelId),
          weeklyVideos: this.orchestrator.getWeeklyVideos(channelId)
        };
      }
      
      return schedule;
    } catch (error) {
      console.error('❌ Failed to get video schedule:', error);
      return null;
    }
  }

  /**
   * Save video schedule to file
   */
  async saveVideoSchedule() {
    try {
      const schedule = await this.getVideoSchedule();
      if (schedule) {
        await fs.writeFile(this.videoSchedule, JSON.stringify(schedule, null, 2));
        console.log(`✅ Video schedule saved to ${this.videoSchedule}`);
      }
    } catch (error) {
      console.error('❌ Failed to save video schedule:', error);
    }
  }
}

// If run directly, start the video scheduler
if (require.main === module) {
  const videoScheduler = new VideoScheduler();
  
  videoScheduler.initialize().then(() => {
    // For testing purposes, run daily process immediately
    videoScheduler.runDailyVideoProcess().then(() => {
      // Then schedule the processes
      videoScheduler.scheduleVideoProcesses();
    }).catch(error => {
      console.error('❌ Failed to run initial daily process:', error);
    });
  });
}

module.exports = VideoScheduler;