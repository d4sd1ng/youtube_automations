const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Hashtag Optimization Agent
 * Handles hashtag research and optimization for social media content
 * Supports various platforms and content types
 */
class HashtagOptimizationAgent {
  constructor(options = {}) {
    this.agentName = 'HashtagOptimizationAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Hashtag optimization storage paths
    this.hashtagsDir = path.join(__dirname, '../../../data/hashtags');
    this.reportsDir = path.join(__dirname, '../../../data/hashtag-reports');
    this.jobsDir = path.join(__dirname, '../../../data/hashtag-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported platforms
    this.platforms = {
      'youtube': 'YouTube',
      'instagram': 'Instagram',
      'twitter': 'Twitter/X',
      'tiktok': 'TikTok',
      'linkedin': 'LinkedIn'
    };

    // Hashtag categories
    this.hashtagCategories = {
      'trending': 'Trending',
      'industry': 'Branchen-hashtags',
      'location': 'Standort-hashtags',
      'brand': 'Marken-hashtags',
      'campaign': 'Kampagnen-hashtags',
      'community': 'Community-hashtags'
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.hashtagsDir, this.reportsDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute hashtag optimization task
   * @param {Object} taskData - The hashtag optimization task data
   * @returns {Object} Result of the hashtag optimization
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'optimize-hashtags':
          result = await this.optimizeHashtags(taskData.content, taskData.platform, taskData.options);
          break;
        case 'research-trending':
          result = await this.researchTrendingHashtags(taskData.topic, taskData.platform, taskData.options);
          break;
        case 'analyze-competitors':
          result = await this.analyzeCompetitorHashtags(taskData.competitors, taskData.platform, taskData.options);
          break;
        case 'generate-hashtag-report':
          result = await this.generateHashtagReport(taskData.reportType, taskData.data, taskData.options);
          break;
        case 'get-hashtag-data':
          result = await this.getHashtagData(taskData.hashtagId);
          break;
        case 'list-hashtags':
          result = await this.listHashtags(taskData.options);
          break;
        case 'delete-hashtag-data':
          result = await this.deleteHashtagData(taskData.hashtagId);
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
      console.error('HashtagOptimizationAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Optimize hashtags for content
   * @param {Object} content - The content to optimize hashtags for
   * @param {string} platform - The platform
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized hashtags
   */
  async optimizeHashtags(content, platform, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'hashtag-optimization',
      status: 'processing',
      content: content,
      platform: platform,
      options: options,
      progress: {
        currentStage: 'optimizing',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 20000 // 20 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Optimizing hashtags for ${platform}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Analyze content for relevant keywords
      const keywords = this.extractKeywords(content);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Researching hashtags...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Research hashtags based on keywords and platform
      const hashtagData = await this.researchHashtags(keywords, platform, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Optimizing hashtag selection...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Optimize hashtag selection
      const optimizedHashtags = this.optimizeHashtagSelection(hashtagData, platform, options);

      // Create optimization result
      const optimizationResult = {
        id: `optimization-${uuidv4()}`,
        content: content,
        platform: platform,
        keywords: keywords,
        hashtagData: hashtagData,
        optimizedHashtags: optimizedHashtags,
        optimizedAt: new Date().toISOString(),
        options: options
      };

      // Save optimization
      this.saveHashtagData(optimizationResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = optimizationResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Hashtag optimization completed successfully' });
      this.saveJob(job);

      return optimizationResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Hashtag optimization failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Research trending hashtags
   * @param {string} topic - The topic to research
   * @param {string} platform - The platform
   * @param {Object} options - Research options
   * @returns {Object} Trending hashtags
   */
  async researchTrendingHashtags(topic, platform, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'trending-research',
      status: 'processing',
      topic: topic,
      platform: platform,
      options: options,
      progress: {
        currentStage: 'researching',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 25000 // 25 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Researching trending hashtags for ${topic} on ${platform}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Collecting trending data...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Mock trending hashtag collection
      const trendingData = this.collectTrendingHashtags(topic, platform, options);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing trends...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Analyze trending hashtags
      const analyzedTrends = this.analyzeTrendingHashtags(trendingData);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating insights...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate insights
      const insights = this.generateTrendingInsights(analyzedTrends);

      // Create research result
      const researchResult = {
        id: `research-${uuidv4()}`,
        topic: topic,
        platform: platform,
        trendingData: trendingData,
        analyzedTrends: analyzedTrends,
        insights: insights,
        researchedAt: new Date().toISOString(),
        options: options
      };

      // Save research
      this.saveHashtagData(researchResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = researchResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Trending hashtag research completed successfully' });
      this.saveJob(job);

      return researchResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Trending hashtag research failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Analyze competitor hashtags
   * @param {Array} competitors - Competitors to analyze
   * @param {string} platform - The platform
   * @param {Object} options - Analysis options
   * @returns {Object} Competitor analysis
   */
  async analyzeCompetitorHashtags(competitors, platform, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'competitor-analysis',
      status: 'processing',
      competitors: competitors,
      platform: platform,
      options: options,
      progress: {
        currentStage: 'analyzing',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 30000 // 30 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Analyzing competitor hashtags on ${platform}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Collecting competitor data...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Mock competitor data collection
      const competitorData = this.collectCompetitorHashtags(competitors, platform, options);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing competitor strategies...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Analyze competitor hashtags
      const analyzedCompetitors = this.analyzeCompetitorStrategies(competitorData);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating recommendations...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate recommendations
      const recommendations = this.generateCompetitorRecommendations(analyzedCompetitors);

      // Create analysis result
      const analysisResult = {
        id: `analysis-${uuidv4()}`,
        competitors: competitors,
        platform: platform,
        competitorData: competitorData,
        analyzedCompetitors: analyzedCompetitors,
        recommendations: recommendations,
        analyzedAt: new Date().toISOString(),
        options: options
      };

      // Save analysis
      this.saveHashtagData(analysisResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = analysisResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Competitor hashtag analysis completed successfully' });
      this.saveJob(job);

      return analysisResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Competitor hashtag analysis failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Generate hashtag report
   * @param {string} reportType - The report type
   * @param {Object} data - The data to include in the report
   * @param {Object} options - Report options
   * @returns {Object} Generated report
   */
  async generateHashtagReport(reportType, data, options = {}) {
    const jobId = uuidv4();
    const reportId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'hashtag-report-generation',
      status: 'processing',
      reportType: reportType,
      data: data,
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
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Generating ${reportType} hashtag report` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Processing data...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate report content
      const reportContent = this.generateReportContent(reportType, data, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Formatting report...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Create report
      const report = {
        id: reportId,
        type: reportType,
        content: reportContent,
        data: data,
        generatedAt: new Date().toISOString(),
        options: options
      };

      // Save report
      this.saveReport(report);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = report;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Hashtag report generated successfully' });
      this.saveJob(job);

      return report;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Hashtag report generation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Extract keywords from content
   * @param {Object} content - The content
   * @returns {Array} Extracted keywords
   */
  extractKeywords(content) {
    // Mock keyword extraction
    const text = content.title + ' ' + content.description;
    const words = text.toLowerCase().split(/\s+/);
    const keywords = [...new Set(words.filter(word => word.length > 3))]; // Unique words longer than 3 characters
    return keywords.slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Research hashtags based on keywords
   * @param {Array} keywords - Keywords to research
   * @param {string} platform - The platform
   * @param {Object} options - Research options
   * @returns {Object} Hashtag data
   */
  async researchHashtags(keywords, platform, options = {}) {
    // Mock hashtag research
    const hashtagData = {
      keywords: keywords,
      platform: platform,
      hashtags: []
    };

    keywords.forEach(keyword => {
      const hashtagCount = Math.floor(Math.random() * 5) + 3; // 3-7 hashtags per keyword
      for (let i = 0; i < hashtagCount; i++) {
        hashtagData.hashtags.push({
          tag: `#${keyword}${i > 0 ? i : ''}`,
          volume: Math.floor(Math.random() * 100000) + 1000,
          competition: Math.floor(Math.random() * 100),
          relevance: Math.floor(Math.random() * 100),
          category: Object.keys(this.hashtagCategories)[Math.floor(Math.random() * Object.keys(this.hashtagCategories).length)]
        });
      }
    });

    return hashtagData;
  }

  /**
   * Optimize hashtag selection
   * @param {Object} hashtagData - The hashtag data
   * @param {string} platform - The platform
   * @param {Object} options - Optimization options
   * @returns {Array} Optimized hashtags
   */
  optimizeHashtagSelection(hashtagData, platform, options = {}) {
    // Sort hashtags by relevance and volume
    const sortedHashtags = hashtagData.hashtags.sort((a, b) => {
      // Weighted score: 40% relevance, 30% volume, 30% competition (inverse)
      const scoreA = (a.relevance * 0.4) + (a.volume / 100000 * 0.3) + ((100 - a.competition) * 0.3);
      const scoreB = (b.relevance * 0.4) + (b.volume / 100000 * 0.3) + ((100 - b.competition) * 0.3);
      return scoreB - scoreA;
    });

    // Limit based on platform
    let limit = 30; // Default limit
    if (platform === 'twitter') {
      limit = 10; // Twitter has character limit
    } else if (platform === 'instagram') {
      limit = 30; // Instagram allows up to 30 hashtags
    } else if (platform === 'tiktok') {
      limit = 5; // TikTok typically uses fewer hashtags
    }

    return sortedHashtags.slice(0, limit);
  }

  /**
   * Collect trending hashtags
   * @param {string} topic - The topic
   * @param {string} platform - The platform
   * @param {Object} options - Collection options
   * @returns {Object} Trending data
   */
  collectTrendingHashtags(topic, platform, options = {}) {
    // Mock trending hashtag collection
    return {
      topic: topic,
      platform: platform,
      timeframe: options.timeframe || '7d',
      hashtags: this.generateMockTrendingHashtags(topic, platform)
    };
  }

  /**
   * Generate mock trending hashtags
   * @param {string} topic - The topic
   * @param {string} platform - The platform
   * @returns {Array} Mock trending hashtags
   */
  generateMockTrendingHashtags(topic, platform) {
    const hashtags = [];
    const count = Math.floor(Math.random() * 20) + 10; // 10-30 hashtags

    for (let i = 0; i < count; i++) {
      hashtags.push({
        tag: `#${topic.replace(/\s+/g, '')}${i > 0 ? i : ''}`,
        volume: Math.floor(Math.random() * 1000000) + 10000,
        growthRate: (Math.random() * 100 - 50).toFixed(2), // -50% to +50%
        competition: Math.floor(Math.random() * 100),
        category: Object.keys(this.hashtagCategories)[Math.floor(Math.random() * Object.keys(this.hashtagCategories).length)],
        timestamp: new Date().toISOString()
      });
    }

    return hashtags;
  }

  /**
   * Analyze trending hashtags
   * @param {Object} trendingData - The trending data
   * @returns {Array} Analyzed trends
   */
  analyzeTrendingHashtags(trendingData) {
    const analyzedTrends = [];

    trendingData.hashtags.forEach(hashtag => {
      // Determine trend status
      let status = 'stable';
      if (hashtag.growthRate > 20) {
        status = 'rising';
      } else if (hashtag.growthRate < -20) {
        status = 'declining';
      }

      // Determine opportunity level
      let opportunity = 'low';
      if (hashtag.growthRate > 30 && hashtag.competition < 50) {
        opportunity = 'high';
      } else if (hashtag.growthRate > 10 && hashtag.competition < 70) {
        opportunity = 'medium';
      }

      analyzedTrends.push({
        ...hashtag,
        status: status,
        opportunity: opportunity,
        analyzedAt: new Date().toISOString()
      });
    });

    return analyzedTrends;
  }

  /**
   * Generate trending insights
   * @param {Array} analyzedTrends - The analyzed trends
   * @returns {Array} Trending insights
   */
  generateTrendingInsights(analyzedTrends) {
    const insights = [];

    // Identify rising trends
    const risingTrends = analyzedTrends.filter(trend => trend.status === 'rising');
    if (risingTrends.length > 0) {
      insights.push({
        type: 'opportunity',
        message: `Es gibt ${risingTrends.length} aufsteigende Hashtags, die Chancen bieten könnten`,
        priority: 'high',
        hashtags: risingTrends.map(t => t.tag)
      });
    }

    // Identify high-opportunity trends
    const highOpportunityTrends = analyzedTrends.filter(trend => trend.opportunity === 'high');
    if (highOpportunityTrends.length > 0) {
      insights.push({
        type: 'opportunity',
        message: `Es gibt ${highOpportunityTrends.length} Hashtags mit hoher Chance und geringer Konkurrenz`,
        priority: 'high',
        hashtags: highOpportunityTrends.map(t => t.tag)
      });
    }

    // Identify declining trends
    const decliningTrends = analyzedTrends.filter(trend => trend.status === 'declining');
    if (decliningTrends.length > 0) {
      insights.push({
        type: 'warning',
        message: `Es gibt ${decliningTrends.length} absteigende Hashtags, die möglicherweise vermieden werden sollten`,
        priority: 'medium',
        hashtags: decliningTrends.map(t => t.tag)
      });
    }

    // Add general insight
    insights.push({
      type: 'info',
      message: `Analysierte insgesamt ${analyzedTrends.length} Hashtags`,
      priority: 'low'
    });

    return insights;
  }

  /**
   * Collect competitor hashtags
   * @param {Array} competitors - Competitors to analyze
   * @param {string} platform - The platform
   * @param {Object} options - Collection options
   * @returns {Object} Competitor data
   */
  collectCompetitorHashtags(competitors, platform, options = {}) {
    // Mock competitor hashtag collection
    const competitorData = {
      competitors: competitors,
      platform: platform,
      data: {}
    };

    competitors.forEach(competitor => {
      competitorData.data[competitor.id] = this.generateMockCompetitorHashtags(competitor, platform);
    });

    return competitorData;
  }

  /**
   * Generate mock competitor hashtags
   * @param {Object} competitor - The competitor
   * @param {string} platform - The platform
   * @returns {Object} Mock competitor hashtags
   */
  generateMockCompetitorHashtags(competitor, platform) {
    const hashtags = [];
    const count = Math.floor(Math.random() * 15) + 5; // 5-20 hashtags

    for (let i = 0; i < count; i++) {
      hashtags.push({
        tag: `#${competitor.name.replace(/\s+/g, '')}${i > 0 ? i : ''}`,
        usageCount: Math.floor(Math.random() * 10000) + 100,
        engagementRate: (Math.random() * 20).toFixed(2), // 0-20%
        category: Object.keys(this.hashtagCategories)[Math.floor(Math.random() * Object.keys(this.hashtagCategories).length)],
        timestamp: new Date().toISOString()
      });
    }

    return {
      id: competitor.id,
      name: competitor.name,
      hashtags: hashtags
    };
  }

  /**
   * Analyze competitor strategies
   * @param {Object} competitorData - The competitor data
   * @returns {Array} Analyzed competitors
   */
  analyzeCompetitorStrategies(competitorData) {
    const analyzedCompetitors = [];

    Object.keys(competitorData.data).forEach(competitorId => {
      const competitor = competitorData.data[competitorId];

      // Calculate hashtag effectiveness
      const effectiveness = this.calculateHashtagEffectiveness(competitor.hashtags);

      // Identify common hashtags
      const commonHashtags = this.identifyCommonHashtags(competitor.hashtags);

      analyzedCompetitors.push({
        ...competitor,
        effectiveness: effectiveness,
        commonHashtags: commonHashtags,
        analyzedAt: new Date().toISOString()
      });
    });

    return analyzedCompetitors;
  }

  /**
   * Calculate hashtag effectiveness
   * @param {Array} hashtags - The hashtags
   * @returns {number} Effectiveness score
   */
  calculateHashtagEffectiveness(hashtags) {
    // Simple weighted score calculation
    const totalEngagement = hashtags.reduce((sum, tag) => sum + parseFloat(tag.engagementRate), 0);
    const avgEngagement = hashtags.length > 0 ? totalEngagement / hashtags.length : 0;

    return Math.min(avgEngagement * 5, 100); // Scale to 100
  }

  /**
   * Identify common hashtags
   * @param {Array} hashtags - The hashtags
   * @returns {Array} Common hashtags
   */
  identifyCommonHashtags(hashtags) {
    // Mock common hashtag identification
    // In a real implementation, this would compare hashtags across competitors
    return hashtags.slice(0, 3).map(tag => tag.tag);
  }

  /**
   * Generate competitor recommendations
   * @param {Array} analyzedCompetitors - The analyzed competitors
   * @returns {Array} Competitor recommendations
   */
  generateCompetitorRecommendations(analyzedCompetitors) {
    const recommendations = [];

    // Identify most effective competitors
    const mostEffective = analyzedCompetitors
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3);

    if (mostEffective.length > 0) {
      recommendations.push({
        type: 'strategy',
        message: `Top 3 effektivste Wettbewerber nach Hashtag-Nutzung: ${mostEffective.map(c => c.name).join(', ')}`,
        priority: 'high',
        competitors: mostEffective.map(c => ({
          name: c.name,
          effectiveness: c.effectiveness
        }))
      });
    }

    // Identify common hashtags across competitors
    const allHashtags = analyzedCompetitors.flatMap(c => c.commonHashtags);
    const hashtagFrequency = {};
    allHashtags.forEach(tag => {
      hashtagFrequency[tag] = (hashtagFrequency[tag] || 0) + 1;
    });

    const popularHashtags = Object.entries(hashtagFrequency)
      .filter(([tag, count]) => count > 1)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    if (popularHashtags.length > 0) {
      recommendations.push({
        type: 'opportunity',
        message: `Beliebte Hashtags bei Wettbewerbern: ${popularHashtags.slice(0, 5).map(h => h.tag).join(', ')}`,
        priority: 'medium',
        hashtags: popularHashtags.slice(0, 5)
      });
    }

    // Add general recommendation
    recommendations.push({
      type: 'info',
      message: `Analysierte insgesamt ${analyzedCompetitors.length} Wettbewerber`,
      priority: 'low'
    });

    return recommendations;
  }

  /**
   * Generate report content
   * @param {string} reportType - The report type
   * @param {Object} data - The data to include
   * @param {Object} options - Report options
   * @returns {Object} Generated report content
   */
  generateReportContent(reportType, data, options = {}) {
    // Mock report content generation
    return {
      title: `${reportType} Hashtag-Bericht`,
      generatedAt: new Date().toISOString(),
      dataSummary: this.summarizeData(data),
      keyFindings: this.extractKeyFindings(data),
      insights: this.generateReportInsights(data, reportType),
      recommendations: this.generateReportRecommendations(data, reportType)
    };
  }

  /**
   * Summarize data
   * @param {Object} data - The data to summarize
   * @returns {Object} Data summary
   */
  summarizeData(data) {
    if (!data) return {};

    // Count properties
    const propertyCount = Object.keys(data).length;

    return {
      totalProperties: propertyCount,
      dataType: typeof data,
      hasNestedObjects: this.hasNestedObjects(data)
    };
  }

  /**
   * Check if object has nested objects
   * @param {Object} obj - The object to check
   * @returns {boolean} Whether object has nested objects
   */
  hasNestedObjects(obj) {
    if (!obj || typeof obj !== 'object') return false;

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract key findings from data
   * @param {Object} data - The data to extract findings from
   * @returns {Array} Key findings
   */
  extractKeyFindings(data) {
    const findings = [];

    // Extract findings if they exist in the data
    if (data && data.optimizedHashtags) {
      // Get top 5 hashtags by relevance
      const topHashtags = data.optimizedHashtags
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);

      findings.push(...topHashtags.map(h => ({
        hashtag: h.tag,
        relevance: h.relevance,
        volume: h.volume
      })));
    }

    return findings;
  }

  /**
   * Generate report insights
   * @param {Object} data - The data
   * @param {string} reportType - The report type
   * @returns {Array} Report insights
   */
  generateReportInsights(data, reportType) {
    // Mock insights generation
    return [
      {
        type: 'info',
        message: `Hashtag-Bericht vom Typ "${reportType}" erfolgreich generiert`,
        priority: 'low'
      }
    ];
  }

  /**
   * Generate report recommendations
   * @param {Object} data - The data
   * @param {string} reportType - The report type
   * @returns {Array} Report recommendations
   */
  generateReportRecommendations(data, reportType) {
    // Mock recommendations generation
    return [
      {
        type: 'info',
        message: `Weitere Analysen für "${reportType}" durchführen`,
        priority: 'low'
      }
    ];
  }

  /**
   * Get hashtag data by ID
   * @param {string} hashtagId - The hashtag ID
   * @returns {Object} Hashtag data
   */
  async getHashtagData(hashtagId) {
    try {
      const filePath = path.join(this.hashtagsDir, `${hashtagId}_hashtag.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting hashtag data:', error);
      return null;
    }
  }

  /**
   * List hashtags
   * @param {Object} options - Listing options
   * @returns {Array} List of hashtags
   */
  async listHashtags(options = {}) {
    try {
      const files = fs.readdirSync(this.hashtagsDir);
      const hashtags = files.filter(file => file.endsWith('_hashtag.json'))
        .map(file => {
          const filePath = path.join(this.hashtagsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        });

      // Apply sorting and filtering options
      if (options.sortBy === 'volume') {
        hashtags.sort((a, b) => b.volume - a.volume);
      } else if (options.sortBy === 'relevance') {
        hashtags.sort((a, b) => b.relevance - a.relevance);
      }

      // Apply limit
      if (options.limit) {
        return hashtags.slice(0, options.limit);
      }

      return hashtags;
    } catch (error) {
      console.error('Error listing hashtags:', error);
      return [];
    }
  }

  /**
   * Delete hashtag data
   * @param {string} hashtagId - The hashtag ID
   * @returns {boolean} Success status
   */
  async deleteHashtagData(hashtagId) {
    try {
      const filePath = path.join(this.hashtagsDir, `${hashtagId}_hashtag.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting hashtag data:', error);
      return false;
    }
  }

  /**
   * Save hashtag data to file system
   * @param {Object} data - The hashtag data
   */
  saveHashtagData(data) {
    try {
      const filePath = path.join(this.hashtagsDir, `${data.id}_hashtag.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving hashtag data:', error);
    }
  }

  /**
   * Save report to file system
   * @param {Object} report - The report data
   */
  saveReport(report) {
    try {
      const filePath = path.join(this.reportsDir, `${report.id}_report.json`);
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('Error saving report:', error);
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

module.exports = HashtagOptimizationAgent;