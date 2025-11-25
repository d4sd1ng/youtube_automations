class PipelineOrchestrator {
  constructor(options = {}) {
    this.agentPool = options.agentPool || null;
    this.scriptService = options.scriptService || null;
    this.videoService = options.videoService || null;
    this.thumbnailService = options.thumbnailService || null;
    this.seoService = options.seoService || null;
    this.translationAgent = options.translationAgent || null;
    this.webScrapingAgent = options.webScrapingAgent || null;

    // Pipeline storage
    this.pipelines = new Map();
    this.results = new Map();
    
    // Video storage for daily and weekly videos
    this.dailyVideos = new Map();
    this.weeklyVideos = new Map();
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

      // Step 5: Generate thumbnails
      let thumbnails = null;
      if (pipeline.config.generateThumbnails) {
        thumbnails = await this.generateThumbnails(analyzedContent, pipeline);
      }

      // Step 6: Optimize for SEO
      let seoOptimization = null;
      if (pipeline.config.optimizeSEO) {
        seoOptimization = await this.optimizeSEO(analyzedContent, pipeline);
      }

      // Step 7: Translate content (if requested)
      let translatedContent = null;
      if (pipeline.config.translateContent) {
        translatedContent = await this.translateContent(analyzedContent, pipeline);
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
        thumbnails,
        seoOptimization,
        translatedContent,
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

  async createVideoContent(analyzedContent, pipeline) {
    console.log(`🎥 Creating video content for channel: ${pipeline.channelName}`);

    // Mock video content creation
    const videoContent = {
      title: `Aktuelle Themen in ${pipeline.channelName}`,
      description: `Die neuesten Entwicklungen und Trends im Bereich ${pipeline.channelName}.`,
      tags: [`#${pipeline.channelName}`, '#Trending', '#News'],
      suggestedUploadTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };

    console.log(`✅ Video content created for ${pipeline.channelName}`);
    return videoContent;
  }

  async generateThumbnails(analyzedContent, pipeline) {
    console.log(`🖼️ Generating thumbnails for channel: ${pipeline.channelName}`);

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

  async optimizeSEO(analyzedContent, pipeline) {
    console.log(`🔍 Optimizing SEO for channel: ${pipeline.channelName}`);

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

  async translateContent(analyzedContent, pipeline) {
    console.log(`🌍 Translating content for channel: ${pipeline.channelName}`);

    // Mock translation
    const translatedContent = {
      title: `Current Topics in ${pipeline.channelName}`,
      description: `The latest developments and trends in ${pipeline.channelName}.`,
      language: 'en'
    };

    console.log(`✅ Content translated for ${pipeline.channelName}`);
    return translatedContent;
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
    return {
      id: `short-${channelId}-${Date.now()}-${timeOfDay}`,
      type: 'short',
      title: `Aktuelles aus ${channelId === 'senara' ? 'Politik' : 'Technologie'} - ${timeOfDay === 'morning' ? 'Morgens' : 'Nachmittags'}`,
      description: `Die wichtigsten Themen des Tages für ${channelId === 'senara' ? 'Politikinteressierte' : 'Technikbegeisterte'}`,
      duration: '60', // 60 seconds
      platform: 'YouTube Shorts',
      scheduledTime: timeOfDay === 'morning' ? 
        new Date(new Date().setHours(8, 0, 0, 0)).toISOString() : 
        new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      createdAt: new Date().toISOString()
    };
  }

  // Helper function to create a long video
  async createLongVideo(scrapedContent, channelId) {
    // Mock long video creation
    return {
      id: `long-${channelId}-${Date.now()}`,
      type: 'long',
      title: `Die wichtigsten Entwicklungen der Woche in ${channelId === 'senara' ? 'Politik' : 'Technologie'}`,
      description: `Ein ausführlicher Überblick über die wichtigsten Themen der Woche`,
      duration: '600', // 10 minutes
      platform: 'YouTube',
      scheduledTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // In 2 days
      createdAt: new Date().toISOString()
    };
  }

  // Helper function to create a short copy from a long video
  async createShortCopy(longVideo, channelId) {
    // Mock short copy creation
    return {
      id: `shortcopy-${channelId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'short-copy',
      title: longVideo.title,
      description: longVideo.description,
      duration: '60', // 60 seconds
      platform: 'YouTube Shorts',
      sourceVideoId: longVideo.id,
      createdAt: new Date().toISOString()
    };
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
}

module.exports = PipelineOrchestrator;