const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Web Scraping Agent
 * Handles web scraping operations for content discovery and keyword research
 * Supports multiple sources including Reddit, YouTube, Twitter, and political platforms
 */
class WebScrapingAgent {
  constructor(options = {}) {
    this.agentName = 'WebScrapingAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Scraping storage paths
    this.scrapingDir = path.join(__dirname, '../../../data/scraping');
    this.jobsDir = path.join(__dirname, '../../../data/scraping-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported platforms for scraping
    this.supportedPlatforms = {
      'reddit': { name: 'Reddit', icon: '🔗' },
      'youtube': { name: 'YouTube', icon: '▶️' },
      'twitter': { name: 'Twitter/X', icon: '🐦' },
      'tiktok': { name: 'TikTok', icon: '🎵' },
      'instagram': { name: 'Instagram', icon: '📸' },
      'bundestag': { name: 'Bundestag', icon: '🏛️' },
      'landtage': { name: 'Landtage', icon: '🏛️' },
      'politische-talkshows': { name: 'Politische Talkshows', icon: '📺' }
    };

    // Political content sources for Politara
    this.politicalSources = {
      'bundestag': 'https://www.bundestag.de',
      'landtage': [
        'https://www.landtag.bw.de',
        'https://www.landtag.by.de',
        'https://www.landtag.mv.de',
        'https://www.landtag.nrw.de',
        'https://www.landtag.rlp.de',
        'https://www.landtag.sl.de',
        'https://www.landtag.thueringen.de'
      ],
      'talkshows': [
        'https://www.ardmediathek.de/sendung/lanz/128000',
        'https://www.ardmediathek.de/sendung/illner/128002',
        'https://www.ardmediathek.de/sendung/maischberger/128004',
        'https://www.ardmediathek.de/sendung/migosa-talk/128006'
      ],
      'news': [
        'https://www.tagesschau.de',
        'https://www.zdf.de/nachrichten',
        'https://www.spiegel.de/politik',
        'https://www.sueddeutsche.de/politik',
        'https://www.faz.net/aktuell/politik',
        'https://www.welt.de/politik',
        'https://www.n-tv.de/politik',
        'https://www.stern.de/politik'
      ],
      'social-media': [
        'https://twitter.com/bundestag',
        'https://twitter.com/BMF_Bund',
        'https://twitter.com/RegSprecher'
      ]
    };

    // Business/Technology sources for Autonova
    this.businessSources = {
      'tech-news': [
        'https://techcrunch.com',
        'https://www.theverge.com',
        'https://www.wired.com',
        'https://www.heise.de',
        'https://t3n.de',
        'https://www.golem.de'
      ],
      'ai-research': [
        'https://arxiv.org',
        'https://www.sciencedirect.com',
        'https://ieeexplore.ieee.org',
        'https://www.mitpressjournals.org',
        'https://jmlr.org'
      ],
      'business-platforms': [
        'https://www.linkedin.com',
        'https://www.xing.com',
        'https://www.forbes.com',
        'https://www.bloomberg.com',
        'https://www.wsj.com'
      ],
      'startup-platforms': [
        'https://www.crunchbase.com',
        'https://www.producthunt.com',
        'https://www.ycombinator.com',
        'https://www.kickstarter.com'
      ]
    };

    // Weekend pause configuration
    this.weekendPause = false;
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.scrapingDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute web scraping task
   * @param {Object} taskData - The web scraping task data
   * @returns {Object} Result of the web scraping
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'scrape-reddit':
          result = await this.scrapeReddit(taskData.options);
          break;
        case 'scrape-youtube':
          result = await this.scrapeYouTube(taskData.keywords, taskData.options);
          break;
        case 'scrape-twitter':
          result = await this.scrapeTwitter(taskData.keywords, taskData.options);
          break;
        case 'scrape-political-content':
          result = await this.scrapePoliticalContent(taskData.keywords, taskData.options);
          break;
        case 'scrape-business-content':
          result = await this.scrapeBusinessContent(taskData.keywords, taskData.options);
          break;
        case 'scrape-keywords':
          result = await this.scrapeForKeywords(taskData.keywords, taskData.sources, taskData.options);
          break;
        case 'search-web':
          result = await this.searchWeb(taskData.query, taskData.options);
          break;
        case 'get-scraping-result':
          result = await this.getScrapingResult(taskData.resultId);
          break;
        case 'list-scraping-results':
          result = await this.listScrapingResults();
          break;
        case 'delete-scraping-result':
          result = await this.deleteScrapingResult(taskData.resultId);
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
      console.error('WebScrapingAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check if weekend pause is enabled
   */
  isWeekendPause() {
    if (!this.weekendPause) return false;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Pause on Friday evening through Sunday
    return (day === 5 && hour >= 18) || day === 6 || (day === 0 && hour < 18);
  }

  /**
   * Calculate viral potential of content
   */
  calculateViralPotential(item) {
    if (!item) return 0;

    const baseScore = (item.score || 0) + (item.num_comments || 0) * 2;

    // Boost for newer content
    if (item.created_utc) {
      const ageHours = (Date.now() / 1000 - item.created_utc) / 3600;
      const freshnessBoost = Math.max(0, 1 - ageHours / 168); // 168 hours = 1 week
      return baseScore * (1 + freshnessBoost);
    }

    return baseScore;
  }

  /**
   * Scrape Reddit for content
   */
  async scrapeReddit(options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'reddit-scraping',
      status: 'processing',
      options: options,
      progress: {
        currentStage: 'scraping',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 30000 // 30 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Starting Reddit scraping' }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Simulate scraping process
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Scraping Reddit content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock scraped content
      const scrapedContent = [
        {
          title: 'Sample Reddit Post',
          content: 'This is sample content from Reddit',
          score: 100,
          num_comments: 50,
          permalink: '/r/sample/comments/123',
          created_utc: Date.now() / 1000,
          source: 'reddit',
          qualityScore: 85
        }
      ];

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'reddit',
        content: scrapedContent,
        scrapedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Reddit scraping completed successfully' });
      this.saveJob(job);

      return { content: scrapedContent, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Reddit scraping failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Scrape YouTube with keywords
   */
  async scrapeYouTube(keywords, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'youtube-scraping',
      status: 'processing',
      keywords: keywords,
      options: options,
      progress: {
        currentStage: 'scraping',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 45000 // 45 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting YouTube scraping for keywords: ${keywords ? keywords.join(', ') : 'none'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Simulate scraping process
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Scraping YouTube content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock scraped content
      const keyword = keywords && keywords[0] || 'unknown';
      const scrapedContent = [
        {
          title: `YouTube video about ${keyword}`,
          description: `This is a sample YouTube video description about ${keyword}`,
          viewCount: Math.floor(Math.random() * 1000000),
          likeCount: Math.floor(Math.random() * 100000),
          commentCount: Math.floor(Math.random() * 10000),
          publishedAt: new Date().toISOString(),
          channelTitle: 'Sample Channel',
          url: `https://youtube.com/watch?v=${Date.now()}`,
          source: 'youtube',
          qualityScore: Math.floor(Math.random() * 100)
        }
      ];

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'youtube',
        keywords: keywords,
        content: scrapedContent,
        scrapedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'YouTube scraping completed successfully' });
      this.saveJob(job);

      return { content: scrapedContent, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `YouTube scraping failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Scrape Twitter with keywords
   */
  async scrapeTwitter(keywords, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'twitter-scraping',
      status: 'processing',
      keywords: keywords,
      options: options,
      progress: {
        currentStage: 'scraping',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 30000 // 30 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting Twitter scraping for keywords: ${keywords ? keywords.join(', ') : 'none'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Simulate scraping process
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Scraping Twitter content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock scraped content
      const keyword = keywords && keywords[0] || 'unknown';
      const scrapedContent = [
        {
          title: `Twitter post about ${keyword}`,
          content: `This is a sample Twitter post about ${keyword} #${keyword.replace(/\s+/g, '')}`,
          retweetCount: Math.floor(Math.random() * 10000),
          likeCount: Math.floor(Math.random() * 10000),
          publishedAt: new Date().toISOString(),
          url: `https://twitter.com/user/status/${Date.now()}`,
          source: 'twitter',
          qualityScore: Math.floor(Math.random() * 100)
        }
      ];

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'twitter',
        keywords: keywords,
        content: scrapedContent,
        scrapedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Twitter scraping completed successfully' });
      this.saveJob(job);

      return { content: scrapedContent, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Twitter scraping failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Scrape political content for Politara brand
   */
  async scrapePoliticalContent(keywords = [], options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'political-content-scraping',
      status: 'processing',
      keywords: keywords,
      options: options,
      progress: {
        currentStage: 'scraping',
        stageProgress: 0,
        overallProgress: 0,
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 120000 // 120 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting political content scraping for: ${keywords ? keywords.join(', ') : 'none'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Determine which political sources to scrape
      const sourcesToScrape = options.sources && options.sources.length > 0 ?
        options.sources : ['bundestag', 'news', 'talkshows'];

      // Scrape from each source
      const allContent = [];

      for (let i = 0; i < sourcesToScrape.length; i++) {
        const source = sourcesToScrape[i];
        const progress = Math.round(((i + 1) / sourcesToScrape.length) * 100);

        job.progress.stageProgress = progress;
        job.progress.overallProgress = progress;
        job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Scraping from ${source}...` });
        this.saveJob(job);

        let content = [];
        switch (source) {
          case 'bundestag':
            // Mock implementation for Bundestag scraping
            content = [
              {
                title: `Bundestag: ${keywords[0] || 'Politik'} Diskussion`,
                content: `Aktuelle Diskussion im Bundestag zum Thema ${keywords[0] || 'Politik'}`,
                source: 'bundestag',
                publishedAt: new Date().toISOString(),
                url: 'https://bundestag.de/debatte',
                qualityScore: 95
              }
            ];
            break;

          case 'news':
            // Mock implementation for political news scraping
            content = [
              {
                title: `Politik: ${keywords[0] || 'Aktuell'} Nachrichten`,
                content: `Aktuelle Nachrichten zum Thema ${keywords[0] || 'Politik'}`,
                source: 'political-news',
                publishedAt: new Date().toISOString(),
                url: 'https://news.de/politik',
                qualityScore: 85
              }
            ];
            break;

          case 'talkshows':
            // Mock implementation for political talk shows
            content = [
              {
                title: `Talkshow: ${keywords[0] || 'Politik'} Diskussion`,
                content: `Diskussion in politischer Talkshow zum Thema ${keywords[0] || 'Politik'}`,
                source: 'political-talkshow',
                publishedAt: new Date().toISOString(),
                url: 'https://talkshow.de/politik',
                qualityScore: 80
              }
            ];
            break;

          case 'social-media':
            // Mock implementation for political social media content
            content = [
              {
                title: `Social Media: ${keywords[0] || 'Politik'} Post`,
                content: `Aktueller Post zum Thema ${keywords[0] || 'Politik'}`,
                source: 'political-social-media',
                publishedAt: new Date().toISOString(),
                url: 'https://socialmedia.de/politik',
                qualityScore: 75
              }
            ];
            break;
        }

        allContent.push(...content);
        await this.sleep(500);
      }

      // Sort by quality score
      allContent.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'political-content',
        keywords: keywords,
        sources: sourcesToScrape,
        content: allContent,
        scrapedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Political content scraping completed successfully' });
      this.saveJob(job);

      return { content: allContent, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Political content scraping failed: ${error.message}` });
      this.saveJob(job);

      console.error('Political content scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scrape business content for Autonova brand
   */
  async scrapeBusinessContent(keywords = [], options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'business-content-scraping',
      status: 'processing',
      keywords: keywords,
      options: options,
      progress: {
        currentStage: 'scraping',
        stageProgress: 0,
        overallProgress: 0,
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 120000 // 120 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting business content scraping for: ${keywords ? keywords.join(', ') : 'none'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Determine which business sources to scrape
      const sourcesToScrape = options.sources && options.sources.length > 0 ?
        options.sources : ['tech-news', 'ai-research', 'business-platforms'];

      // Scrape from each source
      const allContent = [];

      for (let i = 0; i < sourcesToScrape.length; i++) {
        const source = sourcesToScrape[i];
        const progress = Math.round(((i + 1) / sourcesToScrape.length) * 100);

        job.progress.stageProgress = progress;
        job.progress.overallProgress = progress;
        job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Scraping from ${source}...` });
        this.saveJob(job);

        let content = [];
        switch (source) {
          case 'tech-news':
            // Mock implementation for tech news scraping
            content = [
              {
                title: `Tech News: ${keywords[0] || 'Innovation'} Update`,
                content: `Neueste Innovationen im Bereich ${keywords[0] || 'Technologie'}`,
                source: 'tech-news',
                publishedAt: new Date().toISOString(),
                url: 'https://technews.de/innovation',
                qualityScore: 90
              }
            ];
            break;

          case 'ai-research':
            // Mock implementation for AI research scraping
            content = [
              {
                title: `AI Research: ${keywords[0] || 'Machine Learning'} Paper`,
                content: `Forschungsergebnisse zu ${keywords[0] || 'Künstlicher Intelligenz'}`,
                source: 'ai-research',
                publishedAt: new Date().toISOString(),
                url: 'https://airesearch.de/paper',
                qualityScore: 92
              }
            ];
            break;

          case 'business-platforms':
            // Mock implementation for business platforms
            content = [
              {
                title: `Business: ${keywords[0] || 'Market'} Trends`,
                content: `Aktuelle Trends im Bereich ${keywords[0] || 'Business'}`,
                source: 'business-platforms',
                publishedAt: new Date().toISOString(),
                url: 'https://business.de/trends',
                qualityScore: 85
              }
            ];
            break;

          case 'startup-platforms':
            // Mock implementation for startup platforms
            content = [
              {
                title: `Startup: ${keywords[0] || 'Funding'} News`,
                content: `Aktuelle Nachrichten zu ${keywords[0] || 'Startups'}`,
                source: 'startup-platforms',
                publishedAt: new Date().toISOString(),
                url: 'https://startup.de/news',
                qualityScore: 80
              }
            ];
            break;
        }

        allContent.push(...content);
        await this.sleep(500);
      }

      // Sort by quality score
      allContent.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'business-content',
        keywords: keywords,
        sources: sourcesToScrape,
        content: allContent,
        scrapedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Business content scraping completed successfully' });
      this.saveJob(job);

      return { content: allContent, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Business content scraping failed: ${error.message}` });
      this.saveJob(job);

      console.error('Business content scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scrape content for keywords across multiple sources
   */
  async scrapeForKeywords(keywords, sources, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'keyword-scraping',
      status: 'processing',
      keywords: keywords,
      sources: sources,
      options: options,
      progress: {
        currentStage: 'scraping',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 90000 // 90 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting keyword scraping for: ${keywords ? keywords.join(', ') : 'none'}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Determine which sources to scrape
      const sourcesToScrape = sources && sources.length > 0 ? sources : ['reddit', 'youtube', 'twitter'];

      // Scrape from each source
      const allContent = [];

      for (let i = 0; i < sourcesToScrape.length; i++) {
        const source = sourcesToScrape[i];
        const progress = Math.round(((i + 1) / sourcesToScrape.length) * 100);

        job.progress.stageProgress = progress;
        job.progress.overallProgress = progress;
        job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Scraping from ${source}...` });
        this.saveJob(job);

        let content = [];
        switch (source) {
          case 'reddit':
            const redditResult = await this.scrapeReddit(options);
            content = redditResult.content;
            break;
          case 'youtube':
            const youtubeResult = await this.scrapeYouTube(keywords, options);
            content = youtubeResult.content;
            break;
          case 'twitter':
            const twitterResult = await this.scrapeTwitter(keywords, options);
            content = twitterResult.content;
            break;
          case 'political':
            const politicalResult = await this.scrapePoliticalContent(keywords, options);
            content = politicalResult.content;
            break;
          case 'business':
            const businessResult = await this.scrapeBusinessContent(keywords, options);
            content = businessResult.content;
            break;
        }

        allContent.push(...content);
        await this.sleep(500);
      }

      // Sort by quality score
      allContent.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'keyword-scraping',
        keywords: keywords,
        sources: sourcesToScrape,
        content: allContent,
        scrapedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Keyword scraping completed. Found ${allContent.length} items.` });
      this.saveJob(job);

      return { content: allContent, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Keyword scraping failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Search the web for content
   */
  async searchWeb(query, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'web-search',
      status: 'processing',
      query: query,
      options: options,
      progress: {
        currentStage: 'searching',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 25000 // 25 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting web search for: ${query}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Check for weekend pause
      if (this.isWeekendPause()) {
        throw new Error('Scraping paused during weekend hours');
      }

      // Simulate search process
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Searching web content...' });
      this.saveJob(job);

      await this.sleep(1000);

      const maxResults = options.maxResults || 10;
      const language = options.language || 'en';

      // Mock search results
      const searchResults = Array.from({ length: maxResults }, (_, i) => ({
        title: `Search Result ${i + 1} for "${query}"`,
        url: `https://example.com/result-${i + 1}`,
        snippet: `This is a sample search result for the query "${query}"`,
        relevance: Math.random(),
        source: 'web-search'
      }));

      // Save result
      const resultId = uuidv4();
      const result = {
        id: resultId,
        type: 'web-search',
        query: query,
        content: searchResults,
        searchedAt: new Date().toISOString(),
        options: options
      };

      this.saveScrapingResult(result);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = result;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Web search completed. Found ${searchResults.length} results.` });
      this.saveJob(job);

      return { content: searchResults, resultId, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Web search failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Get scraping result by ID
   */
  async getScrapingResult(resultId) {
    try {
      const resultPath = path.join(this.scrapingDir, `${resultId}.json`);
      if (fs.existsSync(resultPath)) {
        return JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting scraping result ${resultId}:`, error);
      return null;
    }
  }

  /**
   * List all scraping results
   */
  async listScrapingResults() {
    try {
      const results = [];
      if (fs.existsSync(this.scrapingDir)) {
        const files = fs.readdirSync(this.scrapingDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const resultData = JSON.parse(fs.readFileSync(path.join(this.scrapingDir, file), 'utf8'));
            results.push(resultData);
          }
        }
      }
      return results;
    } catch (error) {
      console.error('Error listing scraping results:', error);
      return [];
    }
  }

  /**
   * Delete scraping result by ID
   */
  async deleteScrapingResult(resultId) {
    try {
      const resultPath = path.join(this.scrapingDir, `${resultId}.json`);
      if (fs.existsSync(resultPath)) {
        fs.unlinkSync(resultPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting scraping result ${resultId}:`, error);
      return false;
    }
  }

  /**
   * Get job status
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
   * Save scraping result
   */
  saveScrapingResult(result) {
    try {
      const resultPath = path.join(this.scrapingDir, `${result.id}.json`);
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error saving scraping result:', error);
    }
  }

  /**
   * Save job
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
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentName: this.agentName,
      version: this.version,
      isAvailable: this.isAvailable,
      lastExecution: this.lastExecution,
      supportedTasks: [
        'scrape-reddit',
        'scrape-youtube',
        'scrape-twitter',
        'scrape-political-content',
        'scrape-business-content',
        'scrape-keywords',
        'search-web',
        'get-scraping-result',
        'list-scraping-results',
        'delete-scraping-result',
        'get-job-status'
      ]
    };
  }

  /**
   * Set agent availability
   */
  setAvailability(available) {
    this.isAvailable = available;
  }
}

module.exports = WebScrapingAgent;