const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Engagement Agent
 * Handles community engagement and interaction for YouTube automations
 * Supports comment management, community posts, and audience interaction
 */
class EngagementAgent {
  constructor(options = {}) {
    this.agentName = 'EngagementAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Engagement storage paths
    this.engagementDir = path.join(__dirname, '../../../data/engagement');
    this.commentsDir = path.join(__dirname, '../../../data/comments');
    this.communityPostsDir = path.join(__dirname, '../../../data/community-posts');
    this.jobsDir = path.join(__dirname, '../../../data/engagement-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported engagement types
    this.engagementTypes = {
      'comment': 'Kommentar',
      'reply': 'Antwort',
      'like': 'Like',
      'community-post': 'Community-Beitrag',
      'poll': 'Umfrage',
      'notification': 'Benachrichtigung'
    };

    // Comment moderation rules
    this.moderationRules = {
      'spam': ['kaufen', 'rabatt', 'kostenlos', 'jetzt bestellen'],
      'offensive': ['beleidigung', 'hass', 'diskriminierung'],
      'promotion': ['abonnieren', 'kanal', 'youtube'],
      'irrelevant': ['wtf', 'was ist das', 'sinnlos']
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.engagementDir, this.commentsDir, this.communityPostsDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute engagement task
   * @param {Object} taskData - The engagement task data
   * @returns {Object} Result of the engagement
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'process-comments':
          result = await this.processComments(taskData.videoId, taskData.options);
          break;
        case 'respond-to-comment':
          result = await this.respondToComment(taskData.commentId, taskData.response, taskData.options);
          break;
        case 'moderate-comment':
          result = await this.moderateComment(taskData.commentId, taskData.action, taskData.reason);
          break;
        case 'create-community-post':
          result = await this.createCommunityPost(taskData.content, taskData.options);
          break;
        case 'analyze-engagement':
          result = await this.analyzeEngagement(taskData.videoId, taskData.options);
          break;
        case 'get-comment':
          result = await this.getComment(taskData.commentId);
          break;
        case 'list-comments':
          result = await this.listComments(taskData.videoId, taskData.options);
          break;
        case 'delete-comment':
          result = await this.deleteComment(taskData.commentId);
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
      console.error('EngagementAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process comments for a video
   * @param {string} videoId - The video ID
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  async processComments(videoId, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'comment-processing',
      status: 'processing',
      videoId: videoId,
      options: options,
      progress: {
        currentStage: 'processing',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 20000 // 20 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Processing comments for video: ${videoId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Fetching comments...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock fetch comments
      const comments = this.generateMockComments(videoId, options.commentCount || 10);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing comments...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Process each comment
      const processedComments = [];
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
<<<<<<< HEAD

        // Moderate comment
        const moderationResult = this.moderateCommentContent(comment);

=======
        
        // Moderate comment
        const moderationResult = this.moderateCommentContent(comment);
        
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
        // Add to processed comments
        processedComments.push({
          ...comment,
          moderated: moderationResult,
          processedAt: new Date().toISOString()
        });
<<<<<<< HEAD

=======
        
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
        // Save comment
        this.saveComment({
          ...comment,
          moderated: moderationResult
        });
      }

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating engagement insights...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate engagement insights
      const insights = this.generateEngagementInsights(processedComments);

      // Create processing result
      const processingResult = {
        id: `processing-${uuidv4()}`,
        videoId: videoId,
        comments: processedComments,
        insights: insights,
        processedAt: new Date().toISOString(),
        options: options
      };

      // Save processing result
      this.saveEngagementData(processingResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = processingResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Comment processing completed successfully' });
      this.saveJob(job);

      return processingResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Comment processing failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Respond to a comment
   * @param {string} commentId - The comment ID
   * @param {string} response - The response text
   * @param {Object} options - Response options
   * @returns {Object} Response result
   */
  async respondToComment(commentId, response, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'comment-response',
      status: 'processing',
      commentId: commentId,
      response: response,
      options: options,
      progress: {
        currentStage: 'responding',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 5000 // 5 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Responding to comment: ${commentId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating response...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock response creation
      const responseResult = {
        id: `response-${uuidv4()}`,
        commentId: commentId,
        response: response,
        respondedAt: new Date().toISOString(),
        status: 'published',
        options: options
      };

      // Save response
      this.saveCommentResponse(responseResult);

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = responseResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Response created successfully' });
      this.saveJob(job);

      return responseResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Response creation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Moderate a comment
   * @param {string} commentId - The comment ID
   * @param {string} action - The moderation action
   * @param {string} reason - The moderation reason
   * @returns {Object} Moderation result
   */
  async moderateComment(commentId, action, reason) {
    try {
      // Get existing comment
      const comment = this.getComment(commentId);
      if (!comment) {
        throw new Error(`Comment with ID ${commentId} not found`);
      }

      // Apply moderation action
      comment.moderation = {
        action: action,
        reason: reason,
        moderatedAt: new Date().toISOString(),
        moderator: 'engagement-agent'
      };

      // Save updated comment
      this.saveComment(comment);

      return {
        commentId: commentId,
        action: action,
        reason: reason,
        moderatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error moderating comment:', error);
      throw error;
    }
  }

  /**
   * Moderate comment content
   * @param {Object} comment - The comment to moderate
   * @returns {Object} Moderation result
   */
  moderateCommentContent(comment) {
    const content = comment.text.toLowerCase();
    const moderationResult = {
      isSpam: false,
      isOffensive: false,
      isPromotional: false,
      isIrrelevant: false,
      flags: []
    };

    // Check for spam keywords
    for (const keyword of this.moderationRules.spam) {
      if (content.includes(keyword)) {
        moderationResult.isSpam = true;
        moderationResult.flags.push('spam');
        break;
      }
    }

    // Check for offensive keywords
    for (const keyword of this.moderationRules.offensive) {
      if (content.includes(keyword)) {
        moderationResult.isOffensive = true;
        moderationResult.flags.push('offensive');
        break;
      }
    }

    // Check for promotional keywords
    for (const keyword of this.moderationRules.promotion) {
      if (content.includes(keyword)) {
        moderationResult.isPromotional = true;
        moderationResult.flags.push('promotion');
        break;
      }
    }

    // Check for irrelevant keywords
    for (const keyword of this.moderationRules.irrelevant) {
      if (content.includes(keyword)) {
        moderationResult.isIrrelevant = true;
        moderationResult.flags.push('irrelevant');
        break;
      }
    }

    return moderationResult;
  }

  /**
   * Create a community post
   * @param {Object} content - The post content
   * @param {Object} options - Post options
   * @returns {Object} Post creation result
   */
  async createCommunityPost(content, options = {}) {
    const jobId = uuidv4();
    const postId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'community-post-creation',
      status: 'processing',
      content: content,
      options: options,
      progress: {
        currentStage: 'creating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 10000 // 10 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Creating community post' }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Formatting post content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock post creation
      const post = {
        id: postId,
        content: content,
        createdAt: new Date().toISOString(),
        status: 'published',
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0
        },
        options: options
      };

      // Save post
      this.saveCommunityPost(post);

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = post;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Community post created successfully' });
      this.saveJob(job);

      return post;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Community post creation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Analyze engagement for a video
   * @param {string} videoId - The video ID
   * @param {Object} options - Analysis options
   * @returns {Object} Engagement analysis
   */
  async analyzeEngagement(videoId, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'engagement-analysis',
      status: 'processing',
      videoId: videoId,
      options: options,
      progress: {
        currentStage: 'analyzing',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 15000 // 15 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Analyzing engagement for video: ${videoId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Collecting engagement data...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock engagement data
      const engagementData = this.generateMockEngagementData(videoId);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating insights...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate insights
      const insights = this.generateEngagementInsightsFromData(engagementData);

      // Create analysis result
      const analysisResult = {
        id: `analysis-${uuidv4()}`,
        videoId: videoId,
        engagementData: engagementData,
        insights: insights,
        analyzedAt: new Date().toISOString(),
        options: options
      };

      // Save analysis
      this.saveEngagementData(analysisResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = analysisResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Engagement analysis completed successfully' });
      this.saveJob(job);

      return analysisResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Engagement analysis failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Generate mock comments
   * @param {string} videoId - The video ID
   * @param {number} count - Number of comments to generate
   * @returns {Array} Mock comments
   */
  generateMockComments(videoId, count) {
    const comments = [];
    const commentTemplates = [
      "Tolles Video! Vielen Dank für die guten Informationen.",
      "Sehr interessant, das hat mir weitergeholfen.",
      "Kannst du dazu noch ein Video machen?",
      "Das ist genau das, was ich gesucht habe!",
      "Nicht schlecht, aber es fehlt noch etwas.",
      "Super erklärt, jetzt verstehe ich das viel besser.",
      "Wann kommt der nächste Teil?",
      "Das ist wirklich hilfreich, danke!",
      "Ich habe eine Frage zu diesem Thema...",
      "Gute Arbeit, weiter so!"
    ];

    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment-${uuidv4()}`,
        videoId: videoId,
        author: `User${Math.floor(Math.random() * 1000)}`,
        text: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
        likes: Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(), // Up to 7 days ago
        replies: Math.floor(Math.random() * 5)
      });
    }

    return comments;
  }

  /**
   * Generate mock engagement data
   * @param {string} videoId - The video ID
   * @returns {Object} Mock engagement data
   */
  generateMockEngagementData(videoId) {
    return {
      videoId: videoId,
      totalComments: Math.floor(Math.random() * 500) + 50,
      totalLikes: Math.floor(Math.random() * 10000) + 1000,
      totalDislikes: Math.floor(Math.random() * 200) + 10,
      engagementRate: (Math.random() * 15 + 5).toFixed(2), // 5-20%
      averageResponseTime: Math.floor(Math.random() * 24) + 1, // 1-24 hours
      topComments: [
        {
          id: `comment-${uuidv4()}`,
          author: 'TopUser1',
          text: 'Bestes Video aller Zeiten!',
          likes: Math.floor(Math.random() * 500) + 100,
          timestamp: new Date().toISOString()
        },
        {
          id: `comment-${uuidv4()}`,
          author: 'TopUser2',
          text: 'Sehr informativ, danke!',
          likes: Math.floor(Math.random() * 300) + 50,
          timestamp: new Date().toISOString()
        }
      ],
      sentiment: {
        positive: Math.floor(Math.random() * 70) + 20, // 20-90%
        neutral: Math.floor(Math.random() * 30) + 5,   // 5-35%
        negative: Math.floor(Math.random() * 15) + 0   // 0-15%
      }
    };
  }

  /**
   * Generate engagement insights from comments
   * @param {Array} comments - The comments to analyze
   * @returns {Array} Engagement insights
   */
  generateEngagementInsights(comments) {
    const insights = [];

    // Calculate engagement metrics
    const totalComments = comments.length;
    const moderatedComments = comments.filter(c => c.moderated && c.moderated.flags.length > 0).length;
<<<<<<< HEAD
    const positiveComments = comments.filter(c =>
      !c.moderated ||
=======
    const positiveComments = comments.filter(c => 
      !c.moderated || 
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
      (!c.moderated.isSpam && !c.moderated.isOffensive && !c.moderated.isPromotional)
    ).length;

    // Generate insights
    if (moderatedComments > totalComments * 0.3) {
      insights.push({
        type: 'warning',
        message: 'Hoher Anteil an moderierten Kommentaren - möglicherweise Spam oder unangemessene Inhalte',
        priority: 'high'
      });
    }

    if (positiveComments / totalComments > 0.8) {
      insights.push({
        type: 'success',
        message: 'Hoher Anteil positiver Kommentare - gutes Community-Feedback',
        priority: 'high'
      });
    }

    // Add general insight
    insights.push({
      type: 'info',
      message: `Verarbeitete ${totalComments} Kommentare, davon ${moderatedComments} moderiert`,
      priority: 'low'
    });

    return insights;
  }

  /**
   * Generate engagement insights from data
   * @param {Object} engagementData - The engagement data
   * @returns {Array} Engagement insights
   */
  generateEngagementInsightsFromData(engagementData) {
    const insights = [];

    // Generate insights based on engagement data
    if (engagementData.engagementRate > 15) {
      insights.push({
        type: 'success',
        message: 'Hohe Engagement-Rate - Video ist sehr beliebt',
        priority: 'high'
      });
    }

    if (engagementData.averageResponseTime > 12) {
      insights.push({
        type: 'warning',
        message: 'Lange durchschnittliche Antwortzeit - Community-Betreuung könnte verbessert werden',
        priority: 'medium'
      });
    }

    if (engagementData.sentiment.positive > 80) {
      insights.push({
        type: 'success',
        message: 'Sehr positives Community-Feedback',
        priority: 'high'
      });
    }

    if (engagementData.sentiment.negative > 10) {
      insights.push({
        type: 'warning',
        message: 'Negatives Feedback erkannt - möglicherweise problematische Inhalte',
        priority: 'medium'
      });
    }

    // Add general insight
    insights.push({
      type: 'info',
      message: `Engagement analysiert für Video ${engagementData.videoId}`,
      priority: 'low'
    });

    return insights;
  }

  /**
   * Get comment by ID
   * @param {string} commentId - The comment ID
   * @returns {Object} Comment data
   */
  async getComment(commentId) {
    try {
      const filePath = path.join(this.commentsDir, `${commentId}_comment.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting comment:', error);
      return null;
    }
  }

  /**
   * List comments for a video
   * @param {string} videoId - The video ID
   * @param {Object} options - Listing options
   * @returns {Array} List of comments
   */
  async listComments(videoId, options = {}) {
    try {
      const files = fs.readdirSync(this.commentsDir);
      const comments = files.filter(file => file.endsWith('_comment.json'))
        .map(file => {
          const filePath = path.join(this.commentsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        })
        .filter(comment => comment.videoId === videoId);

      // Apply sorting and filtering options
      if (options.sortBy === 'likes') {
        comments.sort((a, b) => b.likes - a.likes);
      } else if (options.sortBy === 'timestamp') {
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      // Apply limit
      if (options.limit) {
        return comments.slice(0, options.limit);
      }

      return comments;
    } catch (error) {
      console.error('Error listing comments:', error);
      return [];
    }
  }

  /**
   * Delete comment by ID
   * @param {string} commentId - The comment ID
   * @returns {boolean} Success status
   */
  async deleteComment(commentId) {
    try {
      const filePath = path.join(this.commentsDir, `${commentId}_comment.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  /**
   * Save comment to file system
   * @param {Object} comment - The comment data
   */
  saveComment(comment) {
    try {
      const filePath = path.join(this.commentsDir, `${comment.id}_comment.json`);
      fs.writeFileSync(filePath, JSON.stringify(comment, null, 2));
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  }

  /**
   * Save comment response to file system
   * @param {Object} response - The response data
   */
  saveCommentResponse(response) {
    try {
      const filePath = path.join(this.commentsDir, `${response.id}_response.json`);
      fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Error saving comment response:', error);
    }
  }

  /**
   * Save community post to file system
   * @param {Object} post - The post data
   */
  saveCommunityPost(post) {
    try {
      const filePath = path.join(this.communityPostsDir, `${post.id}_post.json`);
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    } catch (error) {
      console.error('Error saving community post:', error);
    }
  }

  /**
   * Save engagement data to file system
   * @param {Object} data - The engagement data
   */
  saveEngagementData(data) {
    try {
      const filePath = path.join(this.engagementDir, `${data.id}_engagement.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving engagement data:', error);
    }
  }

  /**
   * Save job to file system
   * @param {Object} job - The job data
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
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after specified time
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = EngagementAgent;