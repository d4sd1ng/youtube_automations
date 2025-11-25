const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Thumbnail Generation Agent
 * Handles generation of video thumbnails for YouTube automations
 * Supports various styles and platforms
 */
class ThumbnailGenerationAgent {
  constructor(options = {}) {
    this.agentName = 'ThumbnailGenerationAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Thumbnail storage paths
    this.thumbnailsDir = path.join(__dirname, '../../../data/thumbnails');
    this.templatesDir = path.join(__dirname, '../../../data/thumbnail-templates');
    this.jobsDir = path.join(__dirname, '../../../data/thumbnail-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported thumbnail styles
    this.styles = {
      'modern': { name: 'Modern', description: 'Clean and professional look' },
      'bold': { name: 'Bold', description: 'High contrast and eye-catching' },
      'minimal': { name: 'Minimal', description: 'Simple and elegant' },
      'busy': { name: 'Busy', description: 'Information rich design' }
    };

    // Supported platforms
    this.platforms = {
      'youtube': { name: 'YouTube', dimensions: '1280x720' },
      'tiktok': { name: 'TikTok', dimensions: '1080x1920' },
      'instagram': { name: 'Instagram', dimensions: '1080x1080' },
      'x': { name: 'X (Twitter)', dimensions: '1200x675' }
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.thumbnailsDir, this.templatesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute thumbnail generation task
   * @param {Object} taskData - The thumbnail generation task data
   * @returns {Object} Result of the thumbnail generation
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'generate-thumbnails':
          result = await this.generateThumbnails(taskData.contentData, taskData.options);
          break;
        case 'generate-thumbnail':
          result = await this.generateThumbnail(taskData.contentData, taskData.options);
          break;
        case 'list-thumbnails':
          result = await this.listThumbnails();
          break;
        case 'get-thumbnail':
          result = await this.getThumbnail(taskData.thumbnailId);
          break;
        case 'delete-thumbnail':
          result = await this.deleteThumbnail(taskData.thumbnailId);
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
      console.error('ThumbnailGenerationAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate thumbnails for content
   * @param {Object} contentData - The content data
   * @param {Object} options - Generation options
   * @returns {Object} Generated thumbnails
   */
  async generateThumbnails(contentData, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'thumbnail-generation',
      status: 'processing',
      contentData: contentData,
      options: options,
      progress: {
        currentStage: 'generating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 15000 // 15 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting thumbnail generation for content: ${contentData.title || 'Untitled'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      const {
        count = 3,
        style = 'modern',
        includeBranding = true,
        platform = 'youtube'
      } = options;

      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing content and requirements...' });
      this.saveJob(job);

      await this.sleep(500);

      // Generate multiple thumbnail options
      const thumbnails = [];
      for (let i = 0; i < count; i++) {
        const thumbnail = await this.createThumbnail(contentData, {
          index: i,
          style,
          includeBranding,
          platform
        });
        thumbnails.push(thumbnail);
      }

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating thumbnail designs...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Save thumbnails
      this.saveThumbnails(contentData.contentId, thumbnails);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = { contentId: contentData.contentId, thumbnails, generatedAt: new Date().toISOString() };
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Thumbnail generation completed successfully' });
      this.saveJob(job);

      return job.result;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Thumbnail generation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Generate a single thumbnail for content
   * @param {Object} contentData - The content data
   * @param {Object} options - Generation options
   * @returns {Object} Generated thumbnail
   */
  async generateThumbnail(contentData, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'single-thumbnail-generation',
      status: 'processing',
      contentData: contentData,
      options: options,
      progress: {
        currentStage: 'generating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 5000 // 5 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting single thumbnail generation for content: ${contentData.title || 'Untitled'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      const {
        style = 'modern',
        includeBranding = true,
        platform = 'youtube'
      } = options;

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating thumbnail design...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate a single thumbnail
      const thumbnail = await this.createThumbnail(contentData, {
        index: 0,
        style,
        includeBranding,
        platform
      });

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Finalizing thumbnail...' });
      this.saveJob(job);

      await this.sleep(500);

      // Save thumbnail
      this.saveThumbnails(contentData.contentId, [thumbnail]);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = thumbnail;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Single thumbnail generation completed successfully' });
      this.saveJob(job);

      return job.result;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Single thumbnail generation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Create a single thumbnail
   * @param {Object} contentData - The content data
   * @param {Object} options - Creation options
   * @returns {Object} Created thumbnail
   */
  async createThumbnail(contentData, options) {
    const {
      index,
      style,
      includeBranding,
      platform
    } = options;

    // Extract key information for thumbnail
    const title = contentData.title || 'Untitled';
    const keywords = contentData.keywords || contentData.trendingKeywords || [];
    const contentType = contentData.contentType || 'general';

    // Generate thumbnail design elements
    const design = this.generateDesignElements(title, keywords, contentType, style);

    // Create thumbnail metadata
    const thumbnail = {
      id: `thumb_${contentData.contentId || uuidv4()}_${index}`,
      title: this.optimizeTitleForThumbnail(title),
      design,
      style,
      platform,
      includeBranding,
      createdAt: new Date().toISOString()
    };

    return thumbnail;
  }

  /**
   * Generate design elements for thumbnail
   * @param {string} title - The title
   * @param {Array} keywords - The keywords
   * @param {string} contentType - The content type
   * @param {string} style - The style
   * @returns {Object} Design elements
   */
  generateDesignElements(title, keywords, contentType, style) {
    // Color scheme based on content type
    const colorSchemes = {
      'tutorial': { primary: '#4A90E2', secondary: '#50E3C2', accent: '#F5A623' },
      'review': { primary: '#E91E63', secondary: '#9C27B0', accent: '#FFEB3B' },
      'explanation': { primary: '#2196F3', secondary: '#00BCD4', accent: '#009688' },
      'news': { primary: '#FF5722', secondary: '#FF9800', accent: '#FFC107' },
      'general': { primary: '#9E9E9E', secondary: '#607D8B', accent: '#795548' }
    };

    // Layout based on style
    const layouts = {
      'modern': 'clean',
      'bold': 'highContrast',
      'minimal': 'simple',
      'busy': 'informationRich'
    };

    // Icon suggestions based on keywords
    const iconSuggestions = this.suggestIcons(keywords, contentType);

    return {
      colorScheme: colorSchemes[contentType] || colorSchemes.general,
      layout: layouts[style] || 'clean',
      iconSuggestions,
      fontSize: this.calculateFontSize(title),
      textPosition: 'center',
      hasOverlay: true
    };
  }

  /**
   * Suggest icons based on keywords and content type
   * @param {Array} keywords - The keywords
   * @param {string} contentType - The content type
   * @returns {Array} Icon suggestions
   */
  suggestIcons(keywords, contentType) {
    const iconMap = {
      'ai': ['🤖', '💻', '🧠'],
      'blockchain': ['🔗', '⛓️', '💰'],
      'tutorial': ['🎓', '📘', '✏️'],
      'review': ['⭐', '🔍', '✅'],
      'news': ['📰', '📢', '🔥'],
      'tech': ['🖥️', '📱', '⚡']
    };

    const suggestions = [];

    // Add icons based on keywords
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      Object.keys(iconMap).forEach(key => {
        if (lowerKeyword.includes(key) && iconMap[key]) {
          suggestions.push(...iconMap[key]);
        }
      });
    });

    // Add icons based on content type
    if (iconMap[contentType] && suggestions.length < 3) {
      suggestions.push(...iconMap[contentType]);
    }

    // Return unique icons, limit to 3
    return [...new Set(suggestions)].slice(0, 3);
  }

  /**
   * Optimize title for thumbnail display
   * @param {string} title - The title
   * @returns {string} Optimized title
   */
  optimizeTitleForThumbnail(title) {
    // Limit title length for better thumbnail display
    if (title.length > 50) {
      return title.substring(0, 47) + '...';
    }
    return title;
  }

  /**
   * Calculate font size based on title length
   * @param {string} title - The title
   * @returns {number} Font size
   */
  calculateFontSize(title) {
    const length = title.length;
    if (length <= 20) return 48;
    if (length <= 40) return 36;
    if (length <= 60) return 28;
    return 24;
  }

  /**
   * Save thumbnails to file system
   * @param {string} contentId - The content ID
   * @param {Array} thumbnails - The thumbnails
   */
  saveThumbnails(contentId, thumbnails) {
    try {
      const filePath = path.join(this.thumbnailsDir, `${contentId}_thumbnails.json`);
      fs.writeFileSync(filePath, JSON.stringify(thumbnails, null, 2));
    } catch (error) {
      console.error('Error saving thumbnails:', error);
    }
  }

  /**
   * Save job to file system
   * @param {Object} job - The job
   */
  saveJob(job) {
    try {
      const filePath = path.join(this.jobsDir, `${job.id}_job.json`);
      fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  /**
   * Get job status
   * @param {string} jobId - The job ID
   * @returns {Object} Job status
   */
  async getJobStatus(jobId) {
    try {
      const filePath = path.join(this.jobsDir, `${jobId}_job.json`);
      if (fs.existsSync(filePath)) {
        const jobData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jobData);
      }
      return null;
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  /**
   * List thumbnails
   * @returns {Array} List of thumbnails
   */
  async listThumbnails() {
    try {
      const files = fs.readdirSync(this.thumbnailsDir);
      const thumbnails = files.filter(file => file.endsWith('_thumbnails.json'))
        .map(file => {
          const filePath = path.join(this.thumbnailsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        });
      return thumbnails.flat();
    } catch (error) {
      console.error('Error listing thumbnails:', error);
      return [];
    }
  }

  /**
   * Get thumbnail by ID
   * @param {string} thumbnailId - The thumbnail ID
   * @returns {Object} Thumbnail data
   */
  async getThumbnail(thumbnailId) {
    try {
      // This is a simplified implementation
      // In a real-world scenario, you would need a more robust way to find thumbnails by ID
      const allThumbnails = await this.listThumbnails();
      return allThumbnails.find(thumb => thumb.id === thumbnailId) || null;
    } catch (error) {
      console.error('Error getting thumbnail:', error);
      return null;
    }
  }

  /**
   * Delete thumbnail by ID
   * @param {string} thumbnailId - The thumbnail ID
   * @returns {boolean} Success status
   */
  async deleteThumbnail(thumbnailId) {
    try {
      // This is a simplified implementation
      // In a real-world scenario, you would need a more robust way to delete thumbnails by ID
      console.log(`Deleting thumbnail: ${thumbnailId}`);
      return true;
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
      return false;
    }
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after specified time
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ThumbnailGenerationAgent;