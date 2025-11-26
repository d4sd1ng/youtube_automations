const AvatarGenerationAgent = require('./modules/avatar-generation/avatarGenerationAgent');
const QualityCheckAgent = require('./modules/quality-check/qualityCheckAgent');
const ContentPlanningAgent = require('./modules/content-planning/contentPlanningAgent');
const VideoProcessingAgent = require('./modules/video-processing/videoProcessingAgent');
const ScriptGenerationAgent = require('./modules/script-generation/scriptGenerationAgent');
const ThumbnailGenerationAgent = require('./modules/thumbnail-generation/thumbnailGenerationAgent');
const SEOOptimizationAgent = require('./modules/seo-optimization/seoOptimizationAgent');
const TranslationAgent = require('./modules/translation/translationAgent');
const WebScrapingAgent = require('./modules/web-scraping/webScrapingAgent');
const ApprovalAgent = require('./modules/approval/approvalAgent');
const SchedulingAgent = require('./modules/scheduling/schedulingAgent');
const AnalyticsAgent = require('./modules/analytics/analyticsAgent');
const EngagementAgent = require('./modules/engagement/engagementAgent');
const TrendAnalysisAgent = require('./modules/trend-analysis/trendAnalysisAgent');
const CompetitorAnalysisAgent = require('./modules/competitor-analysis/competitorAnalysisAgent');
const BookWriterAgent = require('./modules/bookwriter/bookWriterAgent');
const HashtagOptimizationAgent = require('./modules/hashtag-optimization/hashtagOptimizationAgent');
const CaptionGenerationAgent = require('./modules/caption-generation/captionGenerationAgent');
const CommentResponseAgent = require('./modules/comment-response/commentResponseAgent');
const SocialMediaPostingAgent = require('./modules/social-media-posting/socialMediaPostingAgent');
const PerformanceMonitoringAgent = require('./modules/performance-monitoring/performanceMonitoringAgent');
const CommunityManagementAgent = require('./modules/community-management/communityManagementAgent');
const SimpleWorkflowExecutor = require('./simpleWorkflowExecutor');

class PipelineOrchestrator {
  constructor(options = {}) {
    this.agentPool = options.agentPool || null;
    this.scriptService = options.scriptService || new ScriptGenerationAgent();
    this.videoService = options.videoService || new VideoProcessingAgent();
    this.thumbnailService = options.thumbnailService || new ThumbnailGenerationAgent();
    this.seoService = options.seoService || new SEOOptimizationAgent();
    this.translationAgent = options.translationAgent || new TranslationAgent();
    this.webScrapingAgent = options.webScrapingAgent || new WebScrapingAgent();
    // Add avatar generation agent
    this.avatarGenerationAgent = new AvatarGenerationAgent();
    // Add quality check agent
    this.qualityCheckAgent = new QualityCheckAgent();
    // Add content planning agent
    this.contentPlanningAgent = new ContentPlanningAgent();
    // Add approval agent
    this.approvalAgent = new ApprovalAgent();
    // Add scheduling agent
    this.schedulingAgent = new SchedulingAgent();
    // Add analytics agent
    this.analyticsAgent = new AnalyticsAgent();
    // Add engagement agent
    this.engagementAgent = new EngagementAgent();
    // Add trend analysis agent
    this.trendAnalysisAgent = new TrendAnalysisAgent();
    // Add competitor analysis agent
    this.competitorAnalysisAgent = new CompetitorAnalysisAgent();
    // Add book writer agent
    this.bookWriterAgent = new BookWriterAgent();
    // Add hashtag optimization agent
    this.hashtagOptimizationAgent = new HashtagOptimizationAgent();
    // Add caption generation agent
    this.captionGenerationAgent = new CaptionGenerationAgent();
    // Add comment response agent
    this.commentResponseAgent = new CommentResponseAgent();
    // Add social media posting agent
    this.socialMediaPostingAgent = new SocialMediaPostingAgent();
    // Add performance monitoring agent
    this.performanceMonitoringAgent = new PerformanceMonitoringAgent();
    // Add community management agent
    this.communityManagementAgent = new CommunityManagementAgent();
    // Add simple workflow executor
    this.workflowExecutor = new SimpleWorkflowExecutor(this);

    // Pipeline storage
    this.pipelines = new Map();
    this.results = new Map();

    // Video storage for daily and weekly videos
    this.dailyVideos = new Map();
    this.weeklyVideos = new Map();
  }

  /**
   * Execute a simple content creation workflow
   * @param {Object} workflowData - The workflow data
   * @returns {Promise<Object>} Workflow result
   */
  async executeContentCreationWorkflow(workflowData) {
    return await this.workflowExecutor.executeContentCreationWorkflow(workflowData);
  }

  async createPipeline(config) {
    const pipelineId = this.generatePipelineId();
    const startTime = new Date().toISOString();

    console.log(`🚀 Creating pipeline ${pipelineId} with config:`, config);

    // Initialize pipeline
    const pipeline = {
      pipelineId,
      channelId: config.channelId || 'default-channel',
      channelName: config.channelName || 'Default Channel',
      topic: config.topic || 'Default Topic',
      status: 'initialized',
      config,
      createdAt: startTime,
      updatedAt: startTime
    };

    this.pipelines.set(pipelineId, pipeline);

    return pipelineId;
  }

  async executePipeline(pipelineId) {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    try {
      pipeline.status = 'running';
      pipeline.startedAt = new Date().toISOString();
      this.pipelines.set(pipelineId, pipeline);

      console.log(`🚀 Executing pipeline ${pipelineId} for channel: ${pipeline.channelName}`);

      // Step 1: Scrape content using WebScrapingAgent
      const scrapedContent = await this.scrapeContent(pipeline);

      // Step 2: Analyze content
      const analyzedContent = await this.analyzeContent(scrapedContent, pipeline);

      // Step 3: Generate scripts (if requested)
      let generatedScripts = null;
      if (pipeline.config.generateScripts) {
        generatedScripts = await this.generateScripts(analyzedContent, pipeline);
      }

      // Step 4: Create video content
      let videoContent = null;
      if (pipeline.config.createVideo) {
        videoContent = await this.createVideoContent(analyzedContent, pipeline);
      }

      // Step 5: Use existing avatar (don't create new one each time)
      let avatar = null;
      if (pipeline.config.generateAvatar && videoContent) {
        // Check if avatar already exists for this channel
        const avatarId = `avatar-${pipeline.channelId}`;
        try {
          const avatarTaskData = {
            type: 'get-avatar',
            avatarId: avatarId
          };

          const avatarResult = await this.avatarGenerationAgent.execute(avatarTaskData);
          if (avatarResult.success) {
            avatar = avatarResult.result;
          } else {
            // If avatar doesn't exist, create one
            avatar = await this.generateAvatar(videoContent, pipeline);
          }
        } catch (error) {
          console.error(`❌ Failed to get or create avatar for channel ${pipeline.channelId}:`, error);
          // Continue without avatar if there's an error
        }
      }

      // Step 6: Generate thumbnails
      let thumbnails = null;
      if (pipeline.config.generateThumbnails) {
        thumbnails = await this.generateThumbnails(analyzedContent, pipeline);
      }

      // Step 7: Optimize for SEO
      let seoOptimization = null;
      if (pipeline.config.optimizeSEO) {
        seoOptimization = await this.optimizeSEO(analyzedContent, pipeline);
      }

      // Step 8: Translate content (if requested)
      let translatedContent = null;
      if (pipeline.config.translateContent) {
        translatedContent = await this.translateContent(analyzedContent, pipeline);
      }

      // Step 9: Perform quality checks (if requested)
      let qualityReport = null;
      if (pipeline.config.performQualityCheck) {
        const contentToCheck = {
          generatedScripts,
          videoContent,
          thumbnails
        };
        qualityReport = await this.checkQuality(contentToCheck, pipeline);
      }

      // Step 10: Optimize video for different platforms (if requested)
      let optimizedVideos = null;
      if (pipeline.config.optimizeForPlatforms && videoContent) {
        optimizedVideos = await this.optimizeVideoForPlatforms(videoContent, pipeline);
      }

      // Step 11: Plan content and create schedule (if requested)
      let contentPlan = null;
      let schedule = null;
      if (pipeline.config.planContent) {
        const planningResult = await this.planContent(pipeline);
        contentPlan = planningResult.contentPlan;
        schedule = planningResult.schedule;
      }

      // Step 12: Request approval for content (if requested)
      let approval = null;
      if (pipeline.config.requestApproval) {
        approval = await this.requestContentApproval(pipeline, {
          videoContent,
          generatedScripts,
          thumbnails,
          seoOptimization
        });
      }

      // Compile results
      const results = {
        pipelineId,
        channelId: pipeline.channelId,
        channelName: pipeline.channelName,
        status: 'completed',
        scrapedContent,
        analyzedContent,
        generatedScripts,
        videoContent,
        avatar,
        thumbnails,
        seoOptimization,
        translatedContent,
        qualityReport,
        optimizedVideos,
        contentPlan,
        schedule,
        // File storage instructions
        outputFile: `./data/videos/${pipeline.channelId}/${pipelineId}.mp4`,
        audioFile: `./data/audio/${pipeline.channelId}/${pipelineId}.wav`,
        thumbnailFile: `./data/thumbnails/${pipeline.channelId}/${pipelineId}.png`,
        completedAt: new Date().toISOString(),
        duration: Date.now() - new Date(pipeline.startedAt).getTime()
      };

      // Store results
      this.results.set(pipelineId, results);

      // Update pipeline status
      pipeline.status = 'completed';
      pipeline.completedAt = results.completedAt;
      this.pipelines.set(pipelineId, pipeline);

      console.log(`✅ Pipeline ${pipelineId} completed successfully for channel: ${pipeline.channelName}`);

      return results;
    } catch (error) {
      console.error(`❌ Pipeline ${pipelineId} failed:`, error);

      pipeline.status = 'failed';
      pipeline.error = error.message;
      pipeline.failedAt = new Date().toISOString();
      this.pipelines.set(pipelineId, pipeline);

      throw error;
    }
  }

  async scrapeContent(pipeline) {
    console.log(`🔍 Scraping content for channel: ${pipeline.channelName}`);

    try {
      // Use the web scraping service if available
      if (this.webScrapingAgent) {
        // Determine scraping type based on channel
        let scrapingType, keywords, sources;

        if (pipeline.channelId === 'senara') {
          // Political content scraping
          scrapingType = 'scrape-political-content';
          keywords = pipeline.config.keywords || ['Politik', 'Regierung', 'Demokratie'];
          sources = pipeline.config.sources || ['bundestag', 'news', 'talkshows'];
        } else if (pipeline.channelId === 'neurova') {
          // Business/technology content scraping
          scrapingType = 'scrape-business-content';
          keywords = pipeline.config.keywords || ['KI', 'Technologie', 'Innovation'];
          sources = pipeline.config.sources || ['tech-news', 'ai-research', 'business-platforms'];
        } else {
          // General keyword scraping
          scrapingType = 'scrape-keywords';
          keywords = pipeline.config.keywords || [];
          sources = pipeline.config.sources || ['reddit', 'youtube', 'twitter'];
        }

        // Execute scraping task
        const taskData = {
          type: scrapingType,
          keywords: keywords,
          sources: sources,
          options: {
            maxResults: 20,
            includeImages: true,
            includeVideos: true
          }
        };

        const result = await this.webScrapingAgent.execute(taskData);

        if (result.success) {
          console.log(`✅ Successfully scraped content for ${pipeline.channelName}`);
          return result.result;
        } else {
          throw new Error(`Scraping failed: ${result.error}`);
        }
      } else {
        // Mock scraping for demonstration
        console.log(`⚠️  Using mock data for ${pipeline.channelName} as web scraping service is not available`);

        // Return mock data based on channel
        if (pipeline.channelId === 'senara') {
          return this.getMockPoliticalContent();
        } else if (pipeline.channelId === 'neurova') {
          return this.getMockTechnologyContent();
        } else {
          return this.getMockGeneralContent();
        }
      }
    } catch (error) {
      console.error(`❌ Error scraping content for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  async analyzeContent(scrapedContent, pipeline) {
    console.log(`📊 Analyzing content for channel: ${pipeline.channelName}`);

    // Mock analysis - in a real implementation, this would use an analysis service
    const analysis = {
      keywords: this.extractKeywords(scrapedContent, pipeline),
      topics: this.extractTopics(scrapedContent, pipeline),
      trendingContent: this.identifyTrendingContent(scrapedContent, pipeline),
      contentQuality: this.assessContentQuality(scrapedContent),
      recommendations: this.generateRecommendations(scrapedContent, pipeline)
    };

    console.log(`✅ Content analysis completed for ${pipeline.channelName}`);
    return analysis;
  }

  async generateScripts(analyzedContent, pipeline) {
    console.log(`📝 Generating scripts for channel: ${pipeline.channelName}`);

    try {
      // Use the script generation agent
      if (this.scriptService) {
        const scriptResult = await this.scriptService.execute({
          type: 'generate-script',
          topic: analyzedContent.topics[0] || pipeline.topic || 'Default Topic',
          options: {
            scriptType: pipeline.config.scriptType || 'long-form',
            channelId: pipeline.channelId,
            channelName: pipeline.channelName,
            keywords: analyzedContent.keywords,
            duration: pipeline.config.scriptDuration || 600 // 10 minutes default
          }
        });

        if (scriptResult.success) {
          console.log(`✅ Scripts generated for ${pipeline.channelName}`);
          return scriptResult.result;
        } else {
          throw new Error(`Script generation failed: ${scriptResult.error}`);
        }
      } else {
        // Mock script generation
        const scripts = {
          videoScripts: [
            {
              title: `Aktuelle Entwicklungen in ${pipeline.channelName}`,
              script: `In diesem Video werden wir die neuesten Entwicklungen im Bereich ${pipeline.channelName} besprechen...`,
              duration: '5-7 minutes',
              targetPlatform: 'YouTube'
            }
          ],
          socialMediaPosts: [
            {
              platform: 'Twitter',
              content: `Neues Video zu aktuellen Themen in ${pipeline.channelName}! #${pipeline.channelName}`,
              hashtags: [`#${pipeline.channelName}`, '#Trending']
            }
          ]
        };

        console.log(`✅ Scripts generated for ${pipeline.channelName}`);
        return scripts;
      }
    } catch (error) {
      console.error(`❌ Error generating scripts for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  async createVideoContent(analyzedContent, pipeline) {
    console.log(`🎥 Creating video content for channel: ${pipeline.channelName}`);

    // Mock video content creation
    const videoContent = {
      title: `Aktuelle Themen in ${pipeline.channelName}`,
      description: `Die neuesten Entwicklungen und Trends im Bereich ${pipeline.channelName}.`,
      tags: [`#${pipeline.channelName}`, '#Trending', '#News'],
      suggestedUploadTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      // File storage instructions
      outputFile: `./data/videos/${pipeline.channelId}/${pipeline.pipelineId}.mp4`,
      audioFile: `./data/audio/${pipeline.channelId}/${pipeline.pipelineId}.wav`,
      thumbnailFile: `./data/thumbnails/${pipeline.channelId}/${pipeline.pipelineId}.png`,
      // Avatar configuration
      avatarConfig: {
        avatarType: pipeline.config.avatarType || (pipeline.channelId === 'senara' ? 'upper_body' : 'full_person'),
        voiceType: pipeline.config.voiceType || (pipeline.channelId === 'senara' ? 'ai_voice_professional' : 'ai_voice_natural'),
        enableGestures: pipeline.config.enableGestures !== undefined ? pipeline.config.enableGestures : true,
        useTemplate: pipeline.config.useTemplate !== undefined ? pipeline.config.useTemplate : true
      }
    };

    console.log(`✅ Video content created for ${pipeline.channelName}`);
    return videoContent;
  }

  // Add new method for avatar generation
  async generateAvatar(videoContent, pipeline) {
    console.log(`👤 Generating avatar for channel: ${pipeline.channelName}`);

    try {
      // Use the avatar generation agent
      // Check if avatar already exists for this channel
      const avatarId = `avatar-${pipeline.channelId}`;
      let avatarExists = false;

      try {
        const checkTaskData = {
          type: 'get-avatar',
          avatarId: avatarId
        };

        const checkResult = await this.avatarGenerationAgent.execute(checkTaskData);
        avatarExists = checkResult.success;
      } catch (error) {
        // Avatar doesn't exist or error occurred
        avatarExists = false;
      }

      // Only create avatar if it doesn't already exist
      if (!avatarExists) {
        // Determine avatar configuration based on channel type and content
        let avatarConfig = {
          name: `Avatar-${pipeline.channelName}`,
          avatarType: 'upper_body', // Default to upper body
          voiceType: 'ai_voice_natural', // Use AI voice
          enableGestures: true,
          enableBackgroundRemoval: true,
          useTemplate: true, // Use templates for faster generation
          textContent: videoContent.title // Use video title as text content
        };

        // Customize avatar based on channel type
        if (pipeline.channelId === 'senara') {
          // Political content - more professional appearance
          avatarConfig.avatarType = 'upper_body';
          avatarConfig.voiceType = 'ai_voice_professional';
          avatarConfig.enableGestures = true; // Mit Gesten für professionelle Darstellung
        } else if (pipeline.channelId === 'neurova') {
          // Technology content - more dynamic appearance
          avatarConfig.avatarType = 'full_person';
          avatarConfig.voiceType = 'ai_voice_natural';
          avatarConfig.enableGestures = true; // Mit Gesten für dynamische Darstellung
        }

        // For short videos, use head-only avatar to save resources
        if (pipeline.config.videoType === 'short') {
          avatarConfig.avatarType = 'head_only';
          avatarConfig.enableGestures = false; // Ohne Gesten für kurze Videos
        }

        // Allow pipeline config to override avatar settings
        if (pipeline.config.avatarType) {
          avatarConfig.avatarType = pipeline.config.avatarType;
        }
        if (pipeline.config.voiceType) {
          avatarConfig.voiceType = pipeline.config.voiceType;
        }
        if (pipeline.config.enableGestures !== undefined) {
          avatarConfig.enableGestures = pipeline.config.enableGestures; // Explizite Geste-Einstellung
        }
        if (pipeline.config.useTemplate !== undefined) {
          avatarConfig.useTemplate = pipeline.config.useTemplate;
        }

        const taskData = {
          type: 'create-avatar',
          config: avatarConfig
        };

        const result = await this.avatarGenerationAgent.execute(taskData);

        if (result.success) {
          console.log(`✅ Avatar generated for ${pipeline.channelName}`);
          return result.result;
        } else {
          throw new Error(`Avatar generation failed: ${result.error}`);
        }
      } else {
        console.log(`✅ Using existing avatar for ${pipeline.channelName}`);
        // Return existing avatar
        const getTaskData = {
          type: 'get-avatar',
          avatarId: avatarId
        };

        const getResult = await this.avatarGenerationAgent.execute(getTaskData);
        return getResult.result;
      }
    } catch (error) {
      console.error(`❌ Error generating avatar for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  async generateThumbnails(analyzedContent, pipeline) {
    console.log(`🖼️ Generating thumbnails for channel: ${pipeline.channelName}`);

    try {
      // Use the thumbnail generation agent
      if (this.thumbnailService) {
        const thumbnailResult = await this.thumbnailService.execute({
          type: 'generate-thumbnails',
          contentData: {
            contentId: pipeline.pipelineId,
            title: analyzedContent.topics[0] || pipeline.topic || 'Default Topic',
            keywords: analyzedContent.keywords,
            trendingKeywords: analyzedContent.trendingContent,
            contentType: pipeline.config.contentType || 'general'
          },
          options: {
            count: pipeline.config.thumbnailCount || 3,
            style: pipeline.config.thumbnailStyle || 'modern',
            includeBranding: pipeline.config.includeBranding !== undefined ? pipeline.config.includeBranding : true,
            platform: pipeline.config.targetPlatform || 'youtube'
          }
        });

        if (thumbnailResult.success) {
          console.log(`✅ Thumbnails generated for ${pipeline.channelName}`);
          return thumbnailResult.result;
        } else {
          throw new Error(`Thumbnail generation failed: ${thumbnailResult.error}`);
        }
      } else {
        // Mock thumbnail generation
        const thumbnails = [
          {
            type: 'main',
            description: `Haupt-Thumbnail für ${pipeline.channelName}`,
            textElements: [pipeline.channelName, 'Aktuelle Themen', 'Jetzt ansehen'],
            colorScheme: '#FF0000'
          }
        ];

        console.log(`✅ Thumbnails generated for ${pipeline.channelName}`);
        return thumbnails;
      }
    } catch (error) {
      console.error(`❌ Error generating thumbnails for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  async optimizeSEO(analyzedContent, pipeline) {
    console.log(`🔍 Optimizing SEO for channel: ${pipeline.channelName}`);

    try {
      // Use the SEO optimization agent
      if (this.seoService) {
        const seoResult = await this.seoService.execute({
          type: 'optimize-video',
          videoData: {
            id: pipeline.pipelineId,
            title: analyzedContent.topics[0] || pipeline.topic || 'Default Topic',
            description: `Die neuesten Entwicklungen und Trends im Bereich ${pipeline.channelName}.`,
            keywords: analyzedContent.keywords,
            channelId: pipeline.channelId,
            channelName: pipeline.channelName
          },
          options: {
            language: pipeline.config.language || 'de',
            category: pipeline.config.category || 'Entertainment',
            optimizationLevel: pipeline.config.seoOptimizationLevel || 'standard'
          }
        });

        if (seoResult.success) {
          console.log(`✅ SEO optimization completed for ${pipeline.channelName}`);
          return seoResult.result;
        } else {
          throw new Error(`SEO optimization failed: ${seoResult.error}`);
        }
      } else {
        // Mock SEO optimization
        const seoOptimization = {
          title: `Aktuelle Themen in ${pipeline.channelName} | ${new Date().getFullYear()}`,
          description: `Die neuesten Entwicklungen und Trends im Bereich ${pipeline.channelName}. Verpassen Sie keine wichtigen Updates!`,
          tags: [pipeline.channelName, 'Trending', 'News', 'Aktuell', '2025'],
          suggestedKeywords: [pipeline.channelName, `neue ${pipeline.channelName} Themen`, `aktuelle ${pipeline.channelName} Entwicklungen`]
        };

        console.log(`✅ SEO optimization completed for ${pipeline.channelName}`);
        return seoOptimization;
      }
    } catch (error) {
      console.error(`❌ Error optimizing SEO for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  async translateContent(analyzedContent, pipeline) {
    console.log(`🌍 Translating content for channel: ${pipeline.channelName}`);

    try {
      // Use the translation agent
      if (this.translationAgent) {
        const translationResult = await this.translationAgent.execute({
          type: 'translate-content',
          content: {
            title: analyzedContent.topics[0] || pipeline.topic || 'Default Topic',
            description: `Die neuesten Entwicklungen und Trends im Bereich ${pipeline.channelName}.`,
            keywords: analyzedContent.keywords,
            channelId: pipeline.channelId,
            channelName: pipeline.channelName
          },
          sourceLanguage: pipeline.config.sourceLanguage || 'de',
          targetLanguage: pipeline.config.targetLanguage || 'en',
          options: {
            contentType: 'video',
            preserveFormatting: true,
            includeKeywords: true
          }
        });

        if (translationResult.success) {
          console.log(`✅ Content translated for ${pipeline.channelName}`);
          return translationResult.result;
        } else {
          throw new Error(`Content translation failed: ${translationResult.error}`);
        }
      } else {
        // Mock translation
        const translatedContent = {
          title: `Current Topics in ${pipeline.channelName}`,
          description: `The latest developments and trends in ${pipeline.channelName}.`,
          language: 'en'
        };

        console.log(`✅ Content translated for ${pipeline.channelName}`);
        return translatedContent;
      }
    } catch (error) {
      console.error(`❌ Error translating content for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  // Add new method for quality checking
  async checkQuality(content, pipeline) {
    console.log(`🔍 Performing quality check for channel: ${pipeline.channelName}`);

    try {
      // Perform quality checks on different content types
      const qualityChecks = {};

      // Check script quality if scripts were generated
      if (content.generatedScripts) {
        const scriptCheck = await this.qualityCheckAgent.execute({
          type: 'check-script-quality',
          script: content.generatedScripts.videoScripts[0]
        });
        qualityChecks.script = scriptCheck.result;
      }

      // Check video content quality if video was created
      if (content.videoContent) {
        const videoCheck = await this.qualityCheckAgent.execute({
          type: 'check-video-quality',
          video: content.videoContent
        });
        qualityChecks.video = videoCheck.result;
      }

      // Check thumbnail quality if thumbnails were generated
      if (content.thumbnails && content.thumbnails.length > 0) {
        const thumbnailCheck = await this.qualityCheckAgent.execute({
          type: 'check-thumbnail-quality',
          thumbnail: content.thumbnails[0]
        });
        qualityChecks.thumbnail = thumbnailCheck.result;
      }

      // Generate overall quality report
      const report = await this.qualityCheckAgent.execute({
        type: 'generate-quality-report',
        contentId: pipeline.pipelineId,
        checks: qualityChecks
      });

      console.log(`✅ Quality check completed for ${pipeline.channelName}`);
      return report.result;
    } catch (error) {
      console.error(`❌ Error performing quality check for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  // Daily video creation process
  async createDailyVideos(channelId) {
    console.log(`🌅 Creating daily videos for channel: ${channelId}`);

    try {
      // Get today's scraped content for the channel
      // In a real implementation, this would fetch from the daily scraping results
      const scrapedContent = channelId === 'senara' ?
        this.getMockPoliticalContent() :
        this.getMockTechnologyContent();

      // Create 1-2 short videos for morning
      const morningVideos = [];
      for (let i = 0; i < 2; i++) {
        const video = await this.createShortVideo(scrapedContent, channelId, 'morning');
        morningVideos.push(video);
      }

      // Create 1-2 short videos for afternoon
      const afternoonVideos = [];
      for (let i = 0; i < 2; i++) {
        const video = await this.createShortVideo(scrapedContent, channelId, 'afternoon');
        afternoonVideos.push(video);
      }

      // Store daily videos
      const dailyVideoEntry = {
        date: new Date().toISOString().split('T')[0],
        morningVideos,
        afternoonVideos,
        channelId,
        createdAt: new Date().toISOString()
      };

      if (!this.dailyVideos.has(channelId)) {
        this.dailyVideos.set(channelId, []);
      }
      this.dailyVideos.get(channelId).push(dailyVideoEntry);

      console.log(`✅ Created ${morningVideos.length} morning and ${afternoonVideos.length} afternoon videos for ${channelId}`);

      return dailyVideoEntry;
    } catch (error) {
      console.error(`❌ Failed to create daily videos for ${channelId}:`, error);
      throw error;
    }
  }

  // Weekly video creation process
  async createWeeklyVideo(channelId) {
    console.log(`📅 Creating weekly video for channel: ${channelId}`);

    try {
      // Get this week's scraped content for the channel
      // In a real implementation, this would fetch from the weekly scraping results
      const scrapedContent = channelId === 'senara' ?
        this.getMockPoliticalContent() :
        this.getMockTechnologyContent();

      // Create one long-form video
      const longVideo = await this.createLongVideo(scrapedContent, channelId);

      // Create short copies from the long video
      const shortCopies = [];
      for (let i = 0; i < 3; i++) {
        const shortCopy = await this.createShortCopy(longVideo, channelId);
        shortCopies.push(shortCopy);
      }

      // Store weekly video
      const weeklyVideoEntry = {
        week: this.getWeekNumber(new Date()),
        longVideo,
        shortCopies,
        channelId,
        createdAt: new Date().toISOString()
      };

      if (!this.weeklyVideos.has(channelId)) {
        this.weeklyVideos.set(channelId, []);
      }
      this.weeklyVideos.get(channelId).push(weeklyVideoEntry);

      console.log(`✅ Created weekly long video and ${shortCopies.length} short copies for ${channelId}`);

      return weeklyVideoEntry;
    } catch (error) {
      console.error(`❌ Failed to create weekly video for ${channelId}:`, error);
      throw error;
    }
  }

  // Helper function to create a short video
  async createShortVideo(scrapedContent, channelId, timeOfDay) {
    // Mock short video creation
    const videoData = {
      id: `short-${channelId}-${Date.now()}-${timeOfDay}`,
      type: 'short',
      title: `Aktuelles aus ${channelId === 'senara' ? 'Politik' : 'Technologie'} - ${timeOfDay === 'morning' ? 'Morgens' : 'Nachmittags'}`,
      description: `Die wichtigsten Themen des Tages für ${channelId === 'senara' ? 'Politikinteressierte' : 'Technikbegeisterte'}`,
      duration: '60', // 60 seconds
      platform: 'YouTube Shorts',
      scheduledTime: timeOfDay === 'morning' ?
        new Date(new Date().setHours(8, 0, 0, 0)).toISOString() :
        new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      createdAt: new Date().toISOString(),
      // File storage instructions
      outputFile: `./data/videos/${channelId}/shorts/${videoData.id}.mp4`,
      audioFile: `./data/audio/${channelId}/shorts/${videoData.id}.wav`,
      thumbnailFile: `./data/thumbnails/${channelId}/shorts/${videoData.id}.png`,
      // Avatar configuration for short videos
      avatarConfig: {
        avatarType: 'head_only', // Use head-only for short videos
        voiceType: 'ai_voice_natural',
        enableGestures: false, // Ohne Gesten für kurze Videos
        useTemplate: true
      }
    };

    // Use existing avatar for the video (don't create new one each time)
    videoData.avatarId = `avatar-${channelId}`;

    return videoData;
  }

  // Helper function to create a long video
  async createLongVideo(scrapedContent, channelId) {
    // Mock long video creation
    const videoData = {
      id: `long-${channelId}-${Date.now()}`,
      type: 'long',
      title: `Die wichtigsten Entwicklungen der Woche in ${channelId === 'senara' ? 'Politik' : 'Technologie'}`,
      description: `Ein ausführlicher Überblick über die wichtigsten Themen der Woche`,
      duration: '600', // 10 minutes
      platform: 'YouTube',
      scheduledTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // In 2 days
      createdAt: new Date().toISOString(),
      // File storage instructions
      outputFile: `./data/videos/${channelId}/longs/${videoData.id}.mp4`,
      audioFile: `./data/audio/${channelId}/longs/${videoData.id}.wav`,
      thumbnailFile: `./data/thumbnails/${channelId}/longs/${videoData.id}.png`,
      // Avatar configuration for long videos
      avatarConfig: {
        avatarType: channelId === 'senara' ? 'upper_body' : 'full_person',
        voiceType: channelId === 'senara' ? 'ai_voice_professional' : 'ai_voice_natural',
        enableGestures: true, // Mit Gesten für lange Videos
        useTemplate: true
      }
    };

    // Use existing avatar for the video (don't create new one each time)
    videoData.avatarId = `avatar-${channelId}`;

    return videoData;
  }

  // Helper function to create a short copy from a long video
  async createShortCopy(longVideo, channelId) {
    // Mock short copy creation
    const videoData = {
      id: `shortcopy-${channelId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'short-copy',
      title: longVideo.title,
      description: longVideo.description,
      duration: '60', // 60 seconds
      platform: 'YouTube Shorts',
      sourceVideoId: longVideo.id,
      createdAt: new Date().toISOString(),
      // File storage instructions
      outputFile: `./data/videos/${channelId}/shorts/${videoData.id}.mp4`,
      audioFile: `./data/audio/${channelId}/shorts/${videoData.id}.wav`,
      thumbnailFile: `./data/thumbnails/${channelId}/shorts/${videoData.id}.png`,
      // Avatar configuration for short copies (same as short videos)
      avatarConfig: {
        avatarType: 'head_only',
        voiceType: 'ai_voice_natural',
        enableGestures: false, // Ohne Gesten für kurze Kopien
        useTemplate: true
      }
    };

    // Use existing avatar for the video copy (don't create new one each time)
    videoData.avatarId = `avatar-${channelId}`;

    return videoData;
  }

  // Helper function to get week number
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Helper methods for mock data
  getMockPoliticalContent() {
    return {
      content: [
        {
          title: "Aktuelle Bundestagsdebatte: Klimaschutzgesetz Novelle 2025",
          description: "Die neueste Debatte im Bundestag über die Novelle des Klimaschutzgesetzes wird von Experten als wegweisend für die zukünftige Klimapolitik bewertet.",
          viewCount: 1493790,
          likeCount: 33934,
          commentCount: 3744,
          shareCount: 11993,
          publishedAt: new Date().toISOString(),
          channelTitle: "Bundestag Live",
          url: "https://youtube.com/watch?v=bundestag_klima_2025",
          source: "youtube",
          qualityScore: 95
        },
        {
          "title": "Wahlumfrage aktuell 2025-11-24: Koalitionsverhandlungen im Fokus",
          "description": "Die aktuelle Wahlumfrage zeigt spannende Entwicklungen bei den Koalitionsverhandlungen. Experten analysieren die möglichen Auswirkungen auf die Regierungsbildung.",
          "viewCount": 973124,
          "likeCount": 25341,
          "commentCount": 6192,
          "shareCount": 12311,
          "publishedAt": new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          "channelTitle": "Politik Aktuell",
          "url": "https://youtube.com/watch?v=umfrage_2025",
          "source": "youtube",
          "qualityScore": 92
        },
        {
          "title": "Steuersenkung 2026: Wer profitiert wirklich?",
          "description": "Die geplante Steuersenkung 2026 wird kontrovers diskutiert. Bürgerverbände und Wirtschaftsexperten zeigen Vor- und Nachteile auf.",
          "viewCount": 875432,
          "likeCount": 28456,
          "commentCount": 4123,
          "shareCount": 6543,
          "publishedAt": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          "channelTitle": "Finanzen & Politik",
          "url": "https://youtube.com/watch?v=steuern_2026",
          "source": "youtube",
          "qualityScore": 89
        }
      ],
      keywords: ["Bundestag", "Klimaschutz", "Wahlen 2025", "Regierung", "Demokratie", "Steuern", "Digitalisierung", "Verwaltung", "Parteien", "Politik"],
      topics: [
        "Aktuelle Bundestagsdebatten und Regierungsarbeit",
        "Wahlkampfthemen und Parteiprogramme 2025",
        "Klimaschutzmaßnahmen und wirtschaftliche Auswirkungen",
        "Digitalisierung der öffentlichen Verwaltung",
        "Soziale Reformen und Steuersystem"
      ],
      scrapedAt: new Date().toISOString()
    };
  }

  getMockTechnologyContent() {
    return {
      content: [
        {
          "title": "Neue KI-Durchbrüche in der Softwareentwicklung 2025",
          "description": "Forscher präsentieren bahnbrechende Fortschritte in der KI-gestützten Softwareentwicklung. Diese Innovationen könnten die Art, wie wir programmieren, revolutionieren.",
          "viewCount": 1624873,
          "likeCount": 41234,
          "commentCount": 2876,
          "shareCount": 9876,
          "publishedAt": new Date().toISOString(),
          "channelTitle": "Tech Innovation",
          "url": "https://youtube.com/watch?v=ki_durchbruch_2025",
          "source": "youtube",
          "qualityScore": 96
        },
        {
          "title": "Quantencomputing: Nächste Generation von Prozessoren",
          "description": "Die nächste Generation von Quantenprozessoren verspricht exponentielle Leistungssteigerungen. Unternehmen investieren Milliarden in diese Technologie.",
          "viewCount": 1287654,
          "likeCount": 35678,
          "commentCount": 3245,
          "shareCount": 7654,
          "publishedAt": new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          "channelTitle": "Future Tech",
          "url": "https://youtube.com/watch?v=quanten_2025",
          "source": "youtube",
          "qualityScore": 93
        },
        {
          "title": "KI in der Medizin: Diagnose und Behandlung revolutionieren",
          "description": "Künstliche Intelligenz revolutioniert die medizinische Diagnostik. Neue Algorithmen erkennen Krankheiten früher und genauer als je zuvor.",
          "viewCount": 1123456,
          "likeCount": 31245,
          "commentCount": 2987,
          "shareCount": 8765,
          "publishedAt": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          "channelTitle": "MedTech Today",
          "url": "https://youtube.com/watch?v=ki_medicin_2025",
          "source": "youtube",
          "qualityScore": 94
        }
      ],
      keywords: ["KI", "Technologie", "Innovation", "Softwareentwicklung", "Maschinelles Lernen", "Quantencomputing", "Datenwissenschaft", "Robotik", "Cloud Computing", "Cybersicherheit"],
      topics: [
        "Künstliche Intelligenz in der Softwareentwicklung",
        "Technologietrends und Innovationen 2025",
        "Quantencomputing und die nächste Prozessorgeneration",
        "KI-Anwendungen in der Medizin",
        "Cloud Computing und Edge Computing"
      ],
      scrapedAt: new Date().toISOString()
    };
  }

  getMockGeneralContent() {
    return {
      content: [],
      keywords: [],
      topics: [],
      scrapedAt: new Date().toISOString()
    };
  }

  // Helper methods for content analysis
  extractKeywords(scrapedContent, pipeline) {
    if (scrapedContent && scrapedContent.keywords) {
      return scrapedContent.keywords;
    }

    // Fallback to channel-specific keywords
    if (pipeline.channelId === 'senara') {
      return ["Politik", "Regierung", "Demokratie", "Wahlen", "Bundestag"];
    } else if (pipeline.channelId === 'neurova') {
      return ["KI", "Technologie", "Innovation", "Software", "Entwicklung"];
    }

    return [];
  }

  extractTopics(scrapedContent, pipeline) {
    if (scrapedContent && scrapedContent.topics) {
      return scrapedContent.topics;
    }

    // Fallback to channel-specific topics
    if (pipeline.channelId === 'senara') {
      return ["Aktuelle politische Ereignisse", "Wahlprognosen", "Regierungspolitik"];
    } else if (pipeline.channelId === 'neurova') {
      return ["Künstliche Intelligenz", "Technologietrends", "Innovationsmanagement"];
    }

    return [];
  }

  identifyTrendingContent(scrapedContent, pipeline) {
    if (scrapedContent && scrapedContent.content) {
      // Sort by view count to identify most popular content
      return scrapedContent.content
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3); // Top 3 most viewed
    }

    return [];
  }

  assessContentQuality(scrapedContent) {
    if (scrapedContent && scrapedContent.content) {
      const avgQuality = scrapedContent.content.reduce((sum, item) =>
        sum + (item.qualityScore || 0), 0) / scrapedContent.content.length;

      return {
        averageQualityScore: Math.round(avgQuality),
        totalItems: scrapedContent.content.length,
        highQualityItems: scrapedContent.content.filter(item => (item.qualityScore || 0) >= 80).length
      };
    }

    return {
      averageQualityScore: 0,
      totalItems: 0,
      highQualityItems: 0
    };
  }

  generateRecommendations(scrapedContent, pipeline) {
    const recommendations = [];

    if (pipeline.channelId === 'senara') {
      recommendations.push(
        "Fokus auf aktuelle Bundestagsdebatten für wöchentliche Inhalte",
        "Integration von Wahlumfragen und politischen Analysen",
        "Verwendung von offiziellen Regierungsquellen für Authentizität"
      );
    } else if (pipeline.channelId === 'neurova') {
      recommendations.push(
        "Fokus auf KI-Durchbrüche und technologische Innovationen",
        "Integration von Forschungsergebnissen aus führenden Universitäten",
        "Verwendung von Tech-Trends für zukünftige Inhalte"
      );
    }

    return recommendations;
  }

  generatePipelineId() {
    return 'pipeline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getPipelineStatus(pipelineId) {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      return null;
    }

    return {
      pipelineId: pipeline.pipelineId,
      channelId: pipeline.channelId,
      channelName: pipeline.channelName,
      status: pipeline.status,
      createdAt: pipeline.createdAt,
      startedAt: pipeline.startedAt,
      completedAt: pipeline.completedAt,
      failedAt: pipeline.failedAt,
      error: pipeline.error
    };
  }

  getPipelineResults(pipelineId) {
    return this.results.get(pipelineId) || null;
  }

  getAllPipelines() {
    return Array.from(this.pipelines.values());
  }

  getAllResults() {
    return Array.from(this.results.values());
  }

  // Get daily videos for a channel
  getDailyVideos(channelId) {
    return this.dailyVideos.get(channelId) || [];
  }

  // Get weekly videos for a channel
  getWeeklyVideos(channelId) {
    return this.weeklyVideos.get(channelId) || [];
  }

  // Add new method for video optimization and format conversion
  async optimizeVideoForPlatforms(videoContent, pipeline) {
    console.log(`🔄 Optimizing video for platforms: ${pipeline.channelName}`);

    try {
      // Determine target platforms based on pipeline config
      const targetPlatforms = pipeline.config.targetPlatforms || ['youtube', 'tiktok', 'instagram', 'x'];

      // Mock video optimization using the video processing agent
      if (this.videoService) {
        const optimizationResult = await this.videoService.execute({
          type: 'optimize-video',
          videoId: videoContent.id || pipeline.pipelineId,
          optimizationOptions: {
            targetPlatforms: targetPlatforms,
            customSettings: pipeline.config.videoSettings || {}
          }
        });

        if (optimizationResult.success) {
          console.log(`✅ Video optimized for platforms: ${targetPlatforms.join(', ')}`);
          return optimizationResult.result;
        } else {
          throw new Error(`Video optimization failed: ${optimizationResult.error}`);
        }
      } else {
        // Mock optimization result
        const optimizedVideos = targetPlatforms.map(platform => ({
          id: `optimized-${videoContent.id || pipeline.pipelineId}-${platform}`,
          platform: platform,
          title: `${videoContent.title || 'Video'} - ${platform} Version`,
          filename: `optimized_${videoContent.id || pipeline.pipelineId}_${platform}.mp4`,
          format: 'mp4',
          resolution: platform === 'tiktok' ? '1080x1920' :
                     platform === 'instagram' ? '1080x1350' :
                     '1920x1080',
          size: Math.floor(Math.random() * 50000000) + 10000000, // 10-50 MB
          optimizedAt: new Date().toISOString()
        }));

        console.log(`⚠️  Using mock optimization for platforms: ${targetPlatforms.join(', ')}`);
        return { optimizedVideos };
      }
    } catch (error) {
      console.error(`❌ Error optimizing video for platforms:`, error);
      throw error;
    }
  }

  // Add new method for content planning and scheduling
  async planContent(pipeline) {
    console.log(`📅 Planning content for channel: ${pipeline.channelName}`);

    try {
      // Create content plan using the content planning agent
      const planResult = await this.contentPlanningAgent.execute({
        type: 'create-content-plan',
        channelId: pipeline.channelId,
        planOptions: {
          title: `Content Plan for ${pipeline.channelName}`,
          period: 'week',
          startDate: new Date().toISOString(),
          contentTypes: pipeline.config.contentTypes || ['long', 'short']
        }
      });

      if (planResult.success) {
        console.log(`✅ Content plan created for ${pipeline.channelName}`);

        // Schedule the content
        const scheduleResult = await this.contentPlanningAgent.execute({
          type: 'schedule-content',
          contentItems: planResult.result.contentPlan.contentItems,
          schedulingOptions: {
            channelId: pipeline.channelId,
            startDate: new Date()
          }
        });

        if (scheduleResult.success) {
          console.log(`✅ Content scheduled for ${pipeline.channelName}`);
          return {
            contentPlan: planResult.result.contentPlan,
            schedule: scheduleResult.result.schedule
          };
        } else {
          throw new Error(`Content scheduling failed: ${scheduleResult.error}`);
        }
      } else {
        throw new Error(`Content planning failed: ${planResult.error}`);
      }
    } catch (error) {
      console.error(`❌ Error planning content for ${pipeline.channelName}:`, error);
      throw error;
    }
  }

  // Add new method for content approval
  async requestContentApproval(pipeline, content) {
    console.log(`✅ Requesting approval for content from channel: ${pipeline.channelName}`);

    try {
      // Use the approval agent
      if (this.approvalAgent) {
        const approvalResult = await this.approvalAgent.execute({
          type: 'request-approval',
          content: {
            id: pipeline.pipelineId,
            title: content.videoContent?.title || content.generatedScripts?.videoScripts[0]?.title || 'Untitled Content',
            description: content.videoContent?.description || content.generatedScripts?.videoScripts[0]?.script || '',
            channelId: pipeline.channelId,
            channelName: pipeline.channelName,
            contentType: 'video',
            createdAt: new Date().toISOString(),
            riskLevel: 'low',
            creatorTrustLevel: 'trusted',
            templateType: 'standard'
          },
          options: {
            contentType: 'video',
            requester: 'pipeline-orchestrator',
            priority: 'normal',
            allowAutoApproval: pipeline.config.autoApprove !== undefined ? pipeline.config.autoApprove : true,
            approvers: pipeline.config.approvers || ['admin']
          }
        });

        if (approvalResult.success) {
          console.log(`✅ Approval requested for ${pipeline.channelName}`);
          return approvalResult.result;
        } else {
          throw new Error(`Approval request failed: ${approvalResult.error}`);
        }
      } else {
        // Mock approval for demonstration
        const approval = {
          id: `approval-${pipeline.pipelineId}`,
          status: 'approved',
          contentType: 'video',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log(`✅ Content approved for ${pipeline.channelName}`);
        return approval;
      }
    } catch (error) {
      console.error(`❌ Error requesting approval for ${pipeline.channelName}:`, error);
      throw error;
    }
  }
}

module.exports = PipelineOrchestrator;