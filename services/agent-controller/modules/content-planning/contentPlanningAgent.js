const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Content Planning Agent
 * Handles content scheduling, playlist creation, and publication planning
 * Supports automated content calendars and strategic publishing schedules
 */
class ContentPlanningAgent {
  constructor(options = {}) {
    this.agentName = 'ContentPlanningAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Content planning storage paths
    this.plansDir = path.join(__dirname, '../../../data/content-plans');
    this.playlistsDir = path.join(__dirname, '../../../data/playlists');
    this.schedulesDir = path.join(__dirname, '../../../data/schedules');
    this.jobsDir = path.join(__dirname, '../../../data/planning-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Default scheduling rules
    this.schedulingRules = {
      // Best times for different content types
      bestTimes: {
        'short': [
          { hour: 8, weight: 0.9 },   // Morning commute
          { hour: 12, weight: 0.8 },  // Lunch break
          { hour: 18, weight: 0.9 }   // Evening commute
        ],
        'long': [
          { hour: 10, weight: 0.8 },  // Mid-morning
          { hour: 15, weight: 0.7 },  // Afternoon
          { hour: 20, weight: 0.9 }   // Evening prime time
        ]
      },

      // Days of week preferences
      dayPreferences: {
        'monday': 0.8,
        'tuesday': 0.9,
        'wednesday': 0.85,
        'thursday': 0.9,
        'friday': 0.95,
        'saturday': 0.7,
        'sunday': 0.6
      }
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.plansDir, this.playlistsDir, this.schedulesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute content planning task
   * @param {Object} taskData - The content planning task data
   * @returns {Object} Result of the content planning
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'create-content-plan':
          result = await this.createContentPlan(taskData.channelId, taskData.planOptions);
          break;
        case 'create-playlist':
          result = await this.createPlaylist(taskData.playlistData);
          break;
        case 'schedule-content':
          result = await this.scheduleContent(taskData.contentItems, taskData.schedulingOptions);
          break;
        case 'get-content-plan':
          result = await this.getContentPlan(taskData.planId);
          break;
        case 'list-content-plans':
          result = await this.listContentPlans(taskData.channelId);
          break;
        case 'get-playlist':
          result = await this.getPlaylist(taskData.playlistId);
          break;
        case 'list-playlists':
          result = await this.listPlaylists(taskData.channelId);
          break;
        case 'get-schedule':
          result = await this.getSchedule(taskData.scheduleId);
          break;
        case 'list-schedules':
          result = await this.listSchedules(taskData.channelId);
          break;
        case 'optimize-schedule':
          result = await this.optimizeSchedule(taskData.scheduleId, taskData.optimizationOptions);
          break;
        case 'get-job-status':
          result = await this.getJobStatus(taskData.jobId);
          break;
        default:
          throw new Error(`Unsupported task type: ${taskData.type}`);
      }

      return {
        success: true,
        agent: this.agentName,
        result: result,
        timestamp: this.lastExecution
      };
    } catch (error) {
      console.error('ContentPlanningAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create content plan for a channel
   * @param {string} channelId - Channel ID
   * @param {Object} planOptions - Plan options
   * @returns {Object} Content plan
   */
  async createContentPlan(channelId, planOptions = {}) {
    const jobId = uuidv4();
    const planId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'content-plan-creation',
      status: 'processing',
      channelId: channelId,
      options: planOptions,
      progress: {
        currentStage: 'planning',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 30000 // 30 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting content plan creation for channel: ${channelId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Generate content plan based on options
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating content plan...' });
      this.saveJob(job);

      // Determine plan period
      const period = planOptions.period || 'week';
      const startDate = planOptions.startDate || new Date().toISOString();
      const endDate = planOptions.endDate || this.calculateEndDate(startDate, period);

      // Create plan structure
      const contentPlan = {
        id: planId,
        channelId: channelId,
        title: planOptions.title || `Content Plan for ${channelId}`,
        period: period,
        startDate: startDate,
        endDate: endDate,
        contentItems: [],
        createdAt: new Date().toISOString(),
        createdBy: 'ContentPlanningAgent'
      };

      // Generate content items based on channel type and plan options
      const contentItems = await this.generateContentItems(channelId, planOptions);
      contentPlan.contentItems = contentItems;

      await this.sleep(1000);

      // Save content plan
      this.saveContentPlan(contentPlan);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = contentPlan;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Content plan creation completed successfully' });
      this.saveJob(job);

      return { contentPlan, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Content plan creation failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Generate content items for a channel
   * @param {string} channelId - Channel ID
   * @param {Object} planOptions - Plan options
   * @returns {Array} Content items
   */
  async generateContentItems(channelId, planOptions) {
    const contentItems = [];

    // Determine content types based on channel
    let contentTypes;
    if (channelId === 'senara') {
      contentTypes = [
        { type: 'long', frequency: 1, topics: ['Politik', 'Regierung', 'Demokratie'] },
        { type: 'short', frequency: 4, topics: ['Politik', 'Regierung', 'Demokratie'] }
      ];
    } else if (channelId === 'neurova') {
      contentTypes = [
        { type: 'long', frequency: 1, topics: ['KI', 'Technologie', 'Innovation'] },
        { type: 'short', frequency: 4, topics: ['KI', 'Technologie', 'Innovation'] }
      ];
    } else {
      contentTypes = [
        { type: 'long', frequency: 1, topics: ['Allgemein'] },
        { type: 'short', frequency: 4, topics: ['Allgemein'] }
      ];
    }

    // Generate content items for each type
    for (const contentType of contentTypes) {
      for (let i = 0; i < contentType.frequency; i++) {
        const contentItem = {
          id: uuidv4(),
          type: contentType.type,
          title: `Geplanter ${contentType.type === 'long' ? 'Langform' : 'Short'}-Video`,
          topic: contentType.topics[Math.floor(Math.random() * contentType.topics.length)],
          description: `Geplanter Inhalt für ${channelId}`,
          estimatedDuration: contentType.type === 'long' ? 600 : 60, // 10 min or 1 min
          status: 'planned',
          priority: Math.floor(Math.random() * 3) + 1, // 1-3 priority levels
          createdAt: new Date().toISOString()
        };
        contentItems.push(contentItem);
      }
    }

    return contentItems;
  }

  /**
   * Create playlist
   * @param {Object} playlistData - Playlist data
   * @returns {Object} Created playlist
   */
  async createPlaylist(playlistData) {
    const jobId = uuidv4();
    const playlistId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'playlist-creation',
      status: 'processing',
      playlistData: playlistData,
      progress: {
        currentStage: 'creating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 20000 // 20 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Starting playlist creation' }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Create playlist
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating playlist...' });
      this.saveJob(job);

      const playlist = {
        id: playlistId,
        title: playlistData.title || 'New Playlist',
        description: playlistData.description || '',
        channelId: playlistData.channelId,
        videos: playlistData.videos || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'ContentPlanningAgent'
      };

      await this.sleep(1000);

      // Save playlist
      this.savePlaylist(playlist);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = playlist;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Playlist creation completed successfully' });
      this.saveJob(job);

      return { playlist, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Playlist creation failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Schedule content items
   * @param {Array} contentItems - Content items to schedule
   * @param {Object} schedulingOptions - Scheduling options
   * @returns {Object} Schedule
   */
  async scheduleContent(contentItems, schedulingOptions = {}) {
    const jobId = uuidv4();
    const scheduleId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'content-scheduling',
      status: 'processing',
      contentItems: contentItems,
      options: schedulingOptions,
      progress: {
        currentStage: 'scheduling',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 40000 // 40 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Starting content scheduling' }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Schedule content items
      job.progress.stageProgress = 30;
      job.progress.overallProgress = 30;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Scheduling content items...' });
      this.saveJob(job);

      const scheduledItems = [];
      const startDate = schedulingOptions.startDate || new Date();
      const channelId = schedulingOptions.channelId;

      // Schedule each content item
      for (let i = 0; i < contentItems.length; i++) {
        const contentItem = contentItems[i];

        // Determine optimal time based on content type and scheduling rules
        const scheduledTime = this.calculateOptimalTime(
          contentItem.type,
          startDate,
          i,
          channelId
        );

        const scheduledItem = {
          id: uuidv4(),
          contentId: contentItem.id,
          contentType: contentItem.type,
          title: contentItem.title,
          scheduledTime: scheduledTime.toISOString(),
          channelId: channelId,
          status: 'scheduled',
          priority: contentItem.priority || 1
        };

        scheduledItems.push(scheduledItem);
        await this.sleep(100);
      }

      await this.sleep(1000);

      // Create schedule
      const schedule = {
        id: scheduleId,
        channelId: channelId,
        title: schedulingOptions.title || 'Content Schedule',
        scheduledItems: scheduledItems,
        startDate: startDate.toISOString(),
        endDate: scheduledItems.length > 0 ?
          scheduledItems[scheduledItems.length - 1].scheduledTime :
          new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'ContentPlanningAgent'
      };

      // Save schedule
      this.saveSchedule(schedule);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = schedule;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Content scheduling completed successfully' });
      this.saveJob(job);

      return { schedule, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Content scheduling failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Calculate optimal time for content publication
   * @param {string} contentType - Content type (short/long)
   * @param {Date} startDate - Start date
   * @param {number} index - Item index
   * @param {string} channelId - Channel ID
   * @returns {Date} Optimal scheduled time
   */
  calculateOptimalTime(contentType, startDate, index, channelId) {
    // Start with base date plus index-based offset
    const baseDate = new Date(startDate);
    baseDate.setDate(baseDate.getDate() + Math.floor(index / 2));

    // Get best times for content type
    const bestTimes = this.schedulingRules.bestTimes[contentType] ||
                     this.schedulingRules.bestTimes['short'];

    // Apply day preferences
    const dayPreference = this.schedulingRules.dayPreferences[baseDate.toLocaleLowerCase('en-US', { weekday: 'long' })] || 1;

    // Select optimal time slot
    let selectedTime = bestTimes[0];
    let maxWeight = bestTimes[0].weight * dayPreference;

    for (const timeSlot of bestTimes) {
      const weight = timeSlot.weight * dayPreference;
      if (weight > maxWeight) {
        selectedTime = timeSlot;
        maxWeight = weight;
      }
    }

    // Set the time
    baseDate.setHours(selectedTime.hour, 0, 0, 0);

    return baseDate;
  }

  /**
   * Calculate end date based on period
   * @param {string} startDate - Start date ISO string
   * @param {string} period - Period (day/week/month)
   * @returns {string} End date ISO string
   */
  calculateEndDate(startDate, period) {
    const start = new Date(startDate);
    const end = new Date(start);

    switch (period) {
      case 'day':
        end.setDate(end.getDate() + 1);
        break;
      case 'week':
        end.setDate(end.getDate() + 7);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1);
        break;
      default:
        end.setDate(end.getDate() + 7);
    }

    return end.toISOString();
  }

  /**
   * Optimize existing schedule
   * @param {string} scheduleId - Schedule ID
   * @param {Object} optimizationOptions - Optimization options
   * @returns {Object} Optimized schedule
   */
  async optimizeSchedule(scheduleId, optimizationOptions = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'schedule-optimization',
      status: 'processing',
      scheduleId: scheduleId,
      options: optimizationOptions,
      progress: {
        currentStage: 'optimizing',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 30000 // 30 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting schedule optimization for schedule: ${scheduleId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Load existing schedule
      job.progress.stageProgress = 20;
      job.progress.overallProgress = 20;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Loading existing schedule...' });
      this.saveJob(job);

      const schedule = await this.getSchedule(scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      await this.sleep(500);

      // Optimize schedule based on options
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Optimizing schedule...' });
      this.saveJob(job);

      // Apply optimization rules
      const optimizedItems = [...schedule.scheduledItems];

      // Sort by priority and content type
      optimizedItems.sort((a, b) => {
        // Higher priority first
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Long content before short content
        if (a.contentType === 'long' && b.contentType !== 'long') {
          return -1;
        }
        if (b.contentType === 'long' && a.contentType !== 'long') {
          return 1;
        }
        // Earlier dates first
        return new Date(a.scheduledTime) - new Date(b.scheduledTime);
      });

      // Adjust timing based on optimization options
      if (optimizationOptions.spreadContent) {
        // Spread content more evenly
        for (let i = 0; i < optimizedItems.length; i++) {
          const item = optimizedItems[i];
          const newDate = new Date(schedule.startDate);
          newDate.setDate(newDate.getDate() + Math.floor(i * 7 / optimizedItems.length));

          // Apply best time for content type
          const bestTimes = this.schedulingRules.bestTimes[item.contentType] ||
                           this.schedulingRules.bestTimes['short'];
          const bestTime = bestTimes[0];
          newDate.setHours(bestTime.hour, 0, 0, 0);

          item.scheduledTime = newDate.toISOString();
        }
      }

      await this.sleep(1000);

      // Update schedule
      const optimizedSchedule = {
        ...schedule,
        scheduledItems: optimizedItems,
        optimizedAt: new Date().toISOString(),
        optimizationDetails: optimizationOptions
      };

      // Save optimized schedule
      this.saveSchedule(optimizedSchedule);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = optimizedSchedule;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Schedule optimization completed successfully' });
      this.saveJob(job);

      return { optimizedSchedule, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Schedule optimization failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Get content plan by ID
   * @param {string} planId - Plan ID
   * @returns {Object} Content plan
   */
  async getContentPlan(planId) {
    try {
      const planPath = path.join(this.plansDir, `${planId}.json`);
      if (fs.existsSync(planPath)) {
        return JSON.parse(fs.readFileSync(planPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting content plan ${planId}:`, error);
      return null;
    }
  }

  /**
   * List content plans for a channel
   * @param {string} channelId - Channel ID
   * @returns {Array} Content plans
   */
  async listContentPlans(channelId) {
    try {
      const plans = [];
      if (fs.existsSync(this.plansDir)) {
        const files = fs.readdirSync(this.plansDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const planData = JSON.parse(fs.readFileSync(path.join(this.plansDir, file), 'utf8'));
            if (!channelId || planData.channelId === channelId) {
              plans.push(planData);
            }
          }
        }
      }
      return plans;
    } catch (error) {
      console.error('Error listing content plans:', error);
      return [];
    }
  }

  /**
   * Get playlist by ID
   * @param {string} playlistId - Playlist ID
   * @returns {Object} Playlist
   */
  async getPlaylist(playlistId) {
    try {
      const playlistPath = path.join(this.playlistsDir, `${playlistId}.json`);
      if (fs.existsSync(playlistPath)) {
        return JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting playlist ${playlistId}:`, error);
      return null;
    }
  }

  /**
   * List playlists for a channel
   * @param {string} channelId - Channel ID
   * @returns {Array} Playlists
   */
  async listPlaylists(channelId) {
    try {
      const playlists = [];
      if (fs.existsSync(this.playlistsDir)) {
        const files = fs.readdirSync(this.playlistsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const playlistData = JSON.parse(fs.readFileSync(path.join(this.playlistsDir, file), 'utf8'));
            if (!channelId || playlistData.channelId === channelId) {
              playlists.push(playlistData);
            }
          }
        }
      }
      return playlists;
    } catch (error) {
      console.error('Error listing playlists:', error);
      return [];
    }
  }

  /**
   * Get schedule by ID
   * @param {string} scheduleId - Schedule ID
   * @returns {Object} Schedule
   */
  async getSchedule(scheduleId) {
    try {
      const schedulePath = path.join(this.schedulesDir, `${scheduleId}.json`);
      if (fs.existsSync(schedulePath)) {
        return JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting schedule ${scheduleId}:`, error);
      return null;
    }
  }

  /**
   * List schedules for a channel
   * @param {string} channelId - Channel ID
   * @returns {Array} Schedules
   */
  async listSchedules(channelId) {
    try {
      const schedules = [];
      if (fs.existsSync(this.schedulesDir)) {
        const files = fs.readdirSync(this.schedulesDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const scheduleData = JSON.parse(fs.readFileSync(path.join(this.schedulesDir, file), 'utf8'));
            if (!channelId || scheduleData.channelId === channelId) {
              schedules.push(scheduleData);
            }
          }
        }
      }
      return schedules;
    } catch (error) {
      console.error('Error listing schedules:', error);
      return [];
    }
  }

  /**
   * Get job status
   * @param {string} jobId - Job ID
   * @returns {Object} Job status
   */
  async getJobStatus(jobId) {
    try {
      const jobPath = path.join(this.jobsDir, `${jobId}.json`);
      if (fs.existsSync(jobPath)) {
        return JSON.parse(fs.readFileSync(jobPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting job status ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Save content plan
   * @param {Object} plan - Content plan to save
   */
  saveContentPlan(plan) {
    try {
      const planPath = path.join(this.plansDir, `${plan.id}.json`);
      fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
    } catch (error) {
      console.error('Error saving content plan:', error);
    }
  }

  /**
   * Save playlist
   * @param {Object} playlist - Playlist to save
   */
  savePlaylist(playlist) {
    try {
      const playlistPath = path.join(this.playlistsDir, `${playlist.id}.json`);
      fs.writeFileSync(playlistPath, JSON.stringify(playlist, null, 2));
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  }

  /**
   * Save schedule
   * @param {Object} schedule - Schedule to save
   */
  saveSchedule(schedule) {
    try {
      const schedulePath = path.join(this.schedulesDir, `${schedule.id}.json`);
      fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  }

  /**
   * Save job data
   * @param {Object} job - Job data to save
   */
  saveJob(job) {
    try {
      const jobPath = path.join(this.jobsDir, `${job.id}.json`);
      fs.writeFileSync(jobPath, JSON.stringify(job, null, 2));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  /**
   * Simple sleep function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after ms milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get agent status
   * @returns {Object} Agent status information
   */
  getStatus() {
    return {
      agentName: this.agentName,
      version: this.version,
      isAvailable: this.isAvailable,
      lastExecution: this.lastExecution,
      supportedTasks: [
        'create-content-plan',
        'create-playlist',
        'schedule-content',
        'get-content-plan',
        'list-content-plans',
        'get-playlist',
        'list-playlists',
        'get-schedule',
        'list-schedules',
        'optimize-schedule',
        'get-job-status'
      ]
    };
  }

  /**
   * Set agent availability
   * @param {boolean} available - Availability status
   */
  setAvailability(available) {
    this.isAvailable = available;
  }
}

module.exports = ContentPlanningAgent;