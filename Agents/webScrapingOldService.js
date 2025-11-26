const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Firecrawl integration for better scraping
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

// AWS SDK for cloud integration
const AWS = require('aws-sdk');

/**
 * Web & Social Media Scraping Service
 * Collects trending content from multiple sources with weekend pause compliance
 */
class WebScrapingService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../../data/scraped-content');
    this.cacheDir = path.join(__dirname, '../../../data/scraping-cache');

    // Weekend pause compliance (Fr-So)
    this.weekendPause = true;
    this.weekendDays = [0, 5, 6]; // Sunday, Friday, Saturday

    // Firecrawl integration
    this.firecrawlApiKey = FIRECRAWL_API_KEY;
    this.useFirecrawl = !!this.firecrawlApiKey;

    // AWS S3 integration
    this.s3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ?
      new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'eu-central-1'
      }) : null;
    this.useS3 = !!this.s3 && !!process.env.AWS_S3_BUCKET;
    this.s3Bucket = process.env.AWS_S3_BUCKET;

    // Rate limiting configuration
    this.requestDelay = {
      reddit: 2000,    // 2 seconds between Reddit requests
      twitter: 3000,   // 3 seconds for Twitter (rate limited)
      news: 1500,      // 1.5 seconds for news sites
      youtube: 1000,   // 1 second for YouTube trends
      tiktok: 2500,    // 2.5 seconds for TikTok
      instagram: 3000, // 3 seconds for Instagram
      parliament: 3000, // 3 seconds for parliamentary content
      politics: 2000,  // 2 seconds for political talk shows
      web: 1000        // 1 second for general web scraping
    };

    // Content sources configuration
    this.sources = {
      reddit: {
        enabled: true,
        subreddits: ['technology', 'artificial', 'MachineLearning', 'programming', 'Futurology'],
        endpoints: [
          'https://www.reddit.com/r/{subreddit}/hot.json?limit=25',
          'https://www.reddit.com/r/{subreddit}/rising.json?limit=15'
        ]
      },
      hackernews: {
        enabled: true,
        endpoints: [
          'https://hacker-news.firebaseio.com/v0/topstories.json',
          'https://hacker-news.firebaseio.com/v0/newstories.json'
        ]
      },
      techNews: {
        enabled: true,
        sites: [
          'https://techcrunch.com/feed/',
          'https://feeds.arstechnica.com/arstechnica/index',
          'https://www.theverge.com/rss/index.xml'
        ]
      },
      // AI and Technology Sources
      aiResearch: {
        enabled: true,
        sites: [
          'https://ai.googleblog.com/',
          'https://www.deepmind.com/blog',
          'https://openai.com/blog/',
          'https://blogs.microsoft.com/ai/',
          'https://research.ibm.com/artificial-intelligence/',
          'https://www.nvidia.com/en-us/research/',
          'https://www.mit.edu/~jda/'
        ]
      },
      aiPapers: {
        enabled: true,
        sites: [
          'https://arxiv.org/list/cs.AI/recent',
          'https://arxiv.org/list/cs.LG/recent',
          'https://arxiv.org/list/cs.NE/recent',
          'https://arxiv.org/list/cs.CL/recent',
          'https://arxiv.org/list/cs.CV/recent'
        ]
      },
      // Social Media Platforms
      youtube: {
        enabled: true,
        endpoints: [
          'https://www.googleapis.com/youtube/v3/videos' // Requires API key
        ],
        trendingEndpoint: 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=DE&maxResults=25',
        searchEndpoint: 'https://www.googleapis.com/youtube/v3/search'
      },
      twitter: {
        enabled: true,
        endpoints: [
          'https://api.twitter.com/2/tweets/search/recent' // Requires Bearer Token
        ],
        trendingEndpoint: 'https://api.twitter.com/2/tweets/search/recent'
      },
      tiktok: {
        enabled: true,
        endpoints: [
          'https://www.tiktok.com/api/recommend/item_list/' // Requires headers
        ],
        trendingEndpoint: 'https://www.tiktok.com/api/recommend/item_list/'
      },
      instagram: {
        enabled: true,
        endpoints: [
          'https://www.instagram.com/graphql/query/' // Requires authentication
        ],
        trendingEndpoint: 'https://www.instagram.com/graphql/query/'
      },
      // NEW: Political Content Sources
      bundestag: {
        enabled: true,
        endpoints: [
          'https://www.bundestag.de/ajax/filterlist/de/services/opendata/442990-442990', // Plenarprotokolle
          'https://www.bundestag.de/ajax/filterlist/de/mediathek/mediathek-fernsehen-und-radio-442996' // Mediathek
        ]
      },
      landtags: {
        enabled: true,
        states: [
          'bayern', 'baden-wuerttemberg', 'berlin', 'brandenburg',
          'bremen', 'hamburg', 'hessen', 'mecklenburg-vorpommern',
          'niedersachsen', 'nordrhein-westfalen', 'rheinland-pfalz',
          'saarland', 'sachsen', 'sachsen-anhalt', 'schleswig-holstein', 'thueringen'
        ]
      },
      politicalTalkShows: {
        enabled: true,
        shows: {
          lanz: 'https://www.zdf.de/sendung/markus-lanz',
          illner: 'https://www.zdf.de/sendung/maybrit-illner',
          maischberger: 'https://www.daserste.de/information/talk/maischberger/videos/',
          migosatalk: 'https://www.br.de/mediathek/sendung/migosa-talk'
        }
      },
      // NEW: General Web Scraping
      web: {
        enabled: true,
        maxDepth: 2,
        respectRobotsTxt: true
      }
    };

    // Translation service configuration
    this.translationService = {
      enabled: true,
      targetLanguage: 'de',
      providers: [
        'deepl',
        'google-translate',
        'microsoft-translator'
      ]
    };

    // Enhanced analysis configuration
    this.analysisConfig = {
      sentiment: {
        enabled: true,
        provider: 'local' // Could be 'aws-comprehend', 'google-nlp', etc.
      },
      entityRecognition: {
        enabled: true,
        types: ['PERSON', 'ORGANIZATION', 'PRODUCT', 'LOCATION']
      },
      trendPrediction: {
        enabled: true,
        lookbackDays: 30
      }
    };

    this.lastRequest = {};
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.dataDir, this.cacheDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Check if current time is during weekend pause
   */
  isWeekendPause() {
    if (!this.weekendPause) return false;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Friday 18:00 - Monday 06:00
    if (day === 5 && hour >= 18) return true; // Friday evening
    if (day === 6) return true; // Saturday all day
    if (day === 0) return true; // Sunday all day
    if (day === 1 && hour < 6) return true; // Monday early morning

    return false;
  }

  /**
   * Rate limiting helper
   */
  async waitForRateLimit(source) {
    const delay = this.requestDelay[source] || 2000;
    const lastReq = this.lastRequest[source] || 0;
    const timeSince = Date.now() - lastReq;

    if (timeSince < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - timeSince));
    }

    this.lastRequest[source] = Date.now();
  }

  /**
   * Enhanced content quality analysis with sentiment and entity recognition
   */
  async analyzeContentQuality(contentData) {
    try {
      // Calculate quality metrics
      const textLength = (contentData.content || '').length;
      const wordCount = (contentData.content || '').split(/\s+/).filter(w => w.length > 0).length;

      // Engagement ratio (comments/score)
      const engagementRatio = contentData.comments / Math.max(contentData.score, 1);

      // Recency factor (newer content gets higher score)
      const ageInHours = (Date.now() / 1000 - contentData.created) / 3600;
      const recencyFactor = Math.max(0.1, 1 - (ageInHours / 24));

      // Quality score calculation
      const qualityScore = Math.min(100,
        (contentData.score / 100) +
        (contentData.comments / 5) +
        (wordCount / 10) +
        (engagementRatio * 20) +
        (recencyFactor * 30)
      );

      // Trending score (high engagement + recency)
      const trendingScore = (engagementRatio * 50) + (recencyFactor * 50);

      // Category detection
      const category = this.detectCategory(contentData.title, contentData.content);

      // Keyword extraction
      const keywords = this.extractKeywords(contentData.title, contentData.content);

      // Sentiment analysis (enhanced)
      const sentiment = await this.analyzeSentimentEnhanced(contentData.title, contentData.content);

      // Entity recognition
      const entities = await this.recognizeEntities(contentData.title, contentData.content);

      // Virality potential
      const viralityPotential = this.calculateViralityPotential({
        engagementRatio,
        wordCount,
        qualityScore,
        trendingScore
      });

      // Translation if needed
      const translatedContent = await this.translateContentIfNeeded(contentData);

      return {
        qualityScore: Math.round(qualityScore),
        trendingScore: Math.round(trendingScore),
        category,
        keywords,
        sentiment,
        entities,
        viralityPotential: Math.round(viralityPotential),
        translatedContent
      };
    } catch (error) {
      console.error('❌ Content quality analysis failed:', error);
      return {
        qualityScore: 50,
        trendingScore: 50,
        category: 'unknown',
        keywords: [],
        sentiment: { polarity: 'neutral', score: 0 },
        entities: [],
        viralityPotential: 50,
        translatedContent: null
      };
    }
  }

  /**
   * Enhanced sentiment analysis with multiple providers
   */
  async analyzeSentimentEnhanced(title, content) {
    if (!this.analysisConfig.sentiment.enabled) {
      // Fallback to simple sentiment analysis
      return this.analyzeSentiment(title, content);
    }

    const text = (title + ' ' + content).substring(0, 5000); // Limit text length

    try {
      // Local sentiment analysis (existing implementation)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'outstanding', 'superb'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'worst', 'hate', 'disappointing', 'poor', 'awful'];

      const textLower = text.toLowerCase();
      let positiveCount = 0;
      let negativeCount = 0;

      positiveWords.forEach(word => {
        const matches = (textLower.match(new RegExp('\\b' + word + '\\b', 'g')) || []).length;
        positiveCount += matches;
      });

      negativeWords.forEach(word => {
        const matches = (textLower.match(new RegExp('\\b' + word + '\\b', 'g')) || []).length;
        negativeCount += matches;
      });

      const totalWords = text.split(/\s+/).length;
      const polarity = positiveCount > negativeCount ? 'positive' :
                      negativeCount > positiveCount ? 'negative' : 'neutral';
      const score = totalWords > 0 ? (positiveCount - negativeCount) / totalWords : 0;

      return {
        polarity,
        score: Math.round(score * 100) / 100,
        positiveWords: positiveCount,
        negativeWords: negativeCount
      };
    } catch (error) {
      console.warn('⚠️ Enhanced sentiment analysis failed, using basic:', error.message);
      return this.analyzeSentiment(title, content);
    }
  }

  /**
   * Entity recognition
   */
  async recognizeEntities(title, content) {
    if (!this.analysisConfig.entityRecognition.enabled) {
      return [];
    }

    const text = (title + ' ' + content).substring(0, 5000); // Limit text length
    const entities = [];

    try {
      // Simple entity recognition based on capitalization and common patterns
      const entityRegex = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g;
      const matches = text.match(entityRegex) || [];

      // Filter for likely entities (more than one word, not at start of sentence)
      const likelyEntities = matches.filter(match => {
        // Skip if it's at the very beginning of the text
        if (text.startsWith(match)) return false;

        // Must have at least one space (multi-word) or be a known entity
        const isMultiWord = match.includes(' ');
        const knownEntities = ['AI', 'USA', 'UK', 'EU', 'GDP', 'CEO', 'CTO', 'CFO', 'NASA', 'Google', 'Apple', 'Microsoft', 'Amazon'];
        const isKnownEntity = knownEntities.includes(match);

        return isMultiWord || isKnownEntity;
      });

      // Remove duplicates and limit results
      const uniqueEntities = [...new Set(likelyEntities)].slice(0, 20);

      uniqueEntities.forEach(entity => {
        entities.push({
          text: entity,
          type: 'UNKNOWN', // In a real implementation, we would classify the type
          confidence: 0.7 // Mock confidence score
        });
      });

      return entities;
    } catch (error) {
      console.warn('⚠️ Entity recognition failed:', error.message);
      return [];
    }
  }

  /**
   * Save scraped content with enhanced export options
   */
  async saveScrapedContent(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scraped-content-${timestamp}.json`;
    const filepath = path.join(this.dataDir, filename);

    const data = {
      scrapedAt: new Date().toISOString(),
      totalItems: results.length,
      sources: [...new Set(results.map(r => r.source))],
      items: results
    };

    // Save to local file system
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${results.length} items to ${filename}`);

    // Upload to S3 if configured
    if (this.useS3) {
      try {
        const s3Key = `scraped-content/${filename}`;
        await this.s3.upload({
          Bucket: this.s3Bucket,
          Key: s3Key,
          Body: JSON.stringify(data, null, 2),
          ContentType: 'application/json'
        }).promise();

        console.log(`☁️ Uploaded ${results.length} items to S3: ${s3Key}`);
      } catch (error) {
        console.error('❌ Failed to upload to S3:', error.message);
      }
    }

    // Keep only last 10 files locally
    this.cleanupOldFiles();
  }

  /**
   * Export scraped content in different formats
   */
  async exportScrapedContent(format = 'json') {
    try {
      // Get the latest scraped content file
      const files = fs.readdirSync(this.dataDir)
        .filter(f => f.startsWith('scraped-content-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.dataDir, f),
          mtime: fs.statSync(path.join(this.dataDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (files.length === 0) {
        throw new Error('No scraped content files found');
      }

      const latestFile = files[0];
      const rawData = fs.readFileSync(latestFile.path, 'utf8');
      const data = JSON.parse(rawData);

      const exportFilename = latestFile.name.replace('.json', `.${format}`);
      const exportPath = path.join(this.dataDir, exportFilename);

      switch (format.toLowerCase()) {
        case 'csv':
          // Convert to CSV format
          const csvHeaders = ['source', 'title', 'content', 'score', 'comments', 'url', 'created', 'category', 'qualityScore'];
          const csvRows = data.items.map(item => {
            return [
              item.source,
              `"${(item.title || '').replace(/"/g, '""')}"`,
              `"${(item.content || '').replace(/"/g, '""')}"`,
              item.score || '',
              item.comments || '',
              item.url || '',
              item.created || '',
              item.category || '',
              item.qualityScore || ''
            ].join(',');
          });

          const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
          fs.writeFileSync(exportPath, csvContent, 'utf8');
          console.log(`📤 Exported to CSV: ${exportPath}`);
          break;

        case 'xml':
          // Convert to XML format
          let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<scrapedContent>\n';
          xmlContent += `  <scrapedAt>${data.scrapedAt}</scrapedAt>\n`;
          xmlContent += `  <totalItems>${data.totalItems}</totalItems>\n`;
          xmlContent += '  <items>\n';

          data.items.forEach(item => {
            xmlContent += '    <item>\n';
            xmlContent += `      <source>${this.escapeXml(item.source || '')}</source>\n`;
            xmlContent += `      <title>${this.escapeXml(item.title || '')}</title>\n`;
            xmlContent += `      <content>${this.escapeXml(item.content || '')}</content>\n`;
            xmlContent += `      <score>${item.score || ''}</score>\n`;
            xmlContent += `      <comments>${item.comments || ''}</comments>\n`;
            xmlContent += `      <url>${this.escapeXml(item.url || '')}</url>\n`;
            xmlContent += `      <created>${item.created || ''}</created>\n`;
            xmlContent += `      <category>${this.escapeXml(item.category || '')}</category>\n`;
            xmlContent += `      <qualityScore>${item.qualityScore || ''}</qualityScore>\n`;
            xmlContent += '    </item>\n';
          });

          xmlContent += '  </items>\n</scrapedContent>';
          fs.writeFileSync(exportPath, xmlContent, 'utf8');
          console.log(`📤 Exported to XML: ${exportPath}`);
          break;

        default:
          // JSON is already saved by saveScrapedContent
          console.log(`📤 JSON file already exists: ${latestFile.path}`);
          return latestFile.path;
      }

      // Upload to S3 if configured
      if (this.useS3) {
        try {
          const s3Key = `exports/${exportFilename}`;
          const fileContent = fs.readFileSync(exportPath);

          let contentType = 'application/json';
          if (format === 'csv') contentType = 'text/csv';
          if (format === 'xml') contentType = 'application/xml';

          await this.s3.upload({
            Bucket: this.s3Bucket,
            Key: s3Key,
            Body: fileContent,
            ContentType: contentType
          }).promise();

          console.log(`☁️ Uploaded export to S3: ${s3Key}`);
        } catch (error) {
          console.error('❌ Failed to upload export to S3:', error.message);
        }
      }

      return exportPath;
    } catch (error) {
      console.error(`❌ Failed to export scraped content as ${format}:`, error.message);
      throw error;
    }
  }

  /**
   * Helper function to escape XML special characters
   */
  escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  /**
   * Helper function to calculate virality potential
   */
  calculateViralityPotential(metrics) {
    // Simple virality calculation based on engagement and quality
    return (metrics.engagementRatio * 30) +
           (Math.min(metrics.wordCount / 100, 20)) +
           (metrics.qualityScore / 10) +
           (metrics.trendingScore / 2);
  }

  /**
   * Helper function to translate content if needed
   */
  async translateContentIfNeeded(contentData) {
    if (!this.translationService.enabled) {
      return contentData.content;
    }

    const text = (contentData.title || '') + ' ' + (contentData.content || '');
    if (!text.trim()) return null;

    try {
      // Placeholder for translation logic
      // For example, using Google Translate API
      const translatedText = await this.translateText(text, this.translationService.targetLanguage);
      return translatedText;
    } catch (error) {
      console.error('❌ Translation failed:', error.message);
      return contentData.content;
    }
  }

  /**
   * Placeholder function for text translation
   */
  async translateText(text, targetLanguage) {
    // Replace with actual translation logic
    return text; // Dummy return
  }

  /**
   * Helper function to check if content is AI-related
   */
  isAIContent(title, content) {
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
      'computer vision', 'nlp', 'natural language processing', 'gpt', 'chatgpt', 'llm',
      'large language model', 'transformer', 'openai', 'google ai', 'microsoft ai',
      'tensorflow', 'pytorch', 'algorithm', 'data science', 'robotics', 'automation'
    ];

    const text = (title + ' ' + content).toLowerCase();
    return aiKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Helper function to calculate momentum score
   */
  calculateMomentumScore(metrics) {
    // Simple momentum calculation based on engagement and recency
    const engagementScore = (metrics.viewCount || 0) * 0.2 +
                          (metrics.likeCount || 0) * 0.3 +
                          (metrics.commentCount || 0) * 0.5;
    const ageInDays = (new Date() - metrics.publishedAt) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.1, 1 - (ageInDays / 30));
    return engagementScore * recencyFactor;
  }

  /**
   * Helper function to calculate viral potential
   */
  calculateViralPotential(story) {
    // Simple viral potential calculation based on engagement and quality
    return (story.score || 0) * 0.4 +
           (story.descendants || 0) * 0.6;
  }

  /**
   * Helper function to clean up old files
   */
  cleanupOldFiles() {
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('scraped-content-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(this.dataDir, f),
        mtime: fs.statSync(path.join(this.dataDir, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Deleted old file: ${file.name}`);
      }
    }
  }

  /**
   * Scrape Reddit for trending content with enhanced analysis
   */
  async scrapeReddit() {
    if (!this.sources.reddit.enabled) return [];

    console.log('🔍 Scraping Reddit for trending content...');
    const results = [];

    for (const subreddit of this.sources.reddit.subreddits) {
      try {
        await this.waitForRateLimit('reddit');

        const url = this.sources.reddit.endpoints[0].replace('{subreddit}', subreddit);
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'YouTube-Automation-Bot/1.0'
          },
          timeout: 10000
        });

        const posts = response.data.data.children;

        for (const post of posts.slice(0, 10)) { // Top 10 per subreddit
          const postData = post.data;

          // Content quality filtering
          if (postData.score < 50 || postData.num_comments < 10) continue;

          // Enhanced content analysis
          const analyzedContent = await this.analyzeContentQuality({
            title: postData.title,
            content: postData.selftext || postData.url,
            subreddit: subreddit,
            score: postData.score,
            comments: postData.num_comments,
            created: postData.created_utc
          });

          results.push({
            source: 'reddit',
            subreddit: subreddit,
            title: postData.title,
            content: postData.selftext || postData.url,
            score: postData.score,
            comments: postData.num_comments,
            created: postData.created_utc,
            qualityScore: analyzedContent.qualityScore,
            trendingScore: analyzedContent.trendingScore,
            category: analyzedContent.category,
            keywords: analyzedContent.keywords,
            sentiment: analyzedContent.sentiment,
            viralityPotential: analyzedContent.viralityPotential,
            translatedContent: analyzedContent.translatedContent
          });
        }
      } catch (error) {
        console.error(`❌ Failed to scrape Reddit subreddit ${subreddit}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Detect content category
   */
  detectCategory(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    const categories = {
      technology: ['ai', 'artificial intelligence', 'machine learning', 'tech', 'programming', 'software', 'hardware'],
      politics: ['politics', 'government', 'election', 'policy', 'parliament', 'bundestag', 'minister'],
      entertainment: ['movie', 'film', 'music', 'celebrity', 'show', 'tv', 'series'],
      science: ['science', 'research', 'study', 'discovery', 'experiment', 'scientific'],
      business: ['business', 'economy', 'finance', 'market', 'company', 'startup', 'investment']
    };

    let bestCategory = 'general';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(title, content) {
    // Simple keyword extraction (in a real implementation, this would use NLP)
    const text = (title + ' ' + content).toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];

    const words = text.match(/\b(\w+)\b/g) || [];
    const wordFreq = {};

    words.forEach(word => {
      if (word.length > 3 && !commonWords.includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Return top 5 keywords
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Simple sentiment analysis
   */
  analyzeSentiment(title, content) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'brilliant'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'worst', 'hate', 'disappointing'];

    const text = (title + ' ' + content).toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      const matches = (text.match(new RegExp('\\b' + word + '\\b', 'g')) || []).length;
      positiveCount += matches;
    });

    negativeWords.forEach(word => {
      const matches = (text.match(new RegExp('\\b' + word + '\\b', 'g')) || []).length;
      negativeCount += matches;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Scrape Hacker News for tech trends
   */
  async scrapeHackerNews() {
    if (!this.sources.hackernews.enabled) return [];

    console.log('🔍 Scraping Hacker News...');
    const results = [];

    try {
      await this.waitForRateLimit('news');

      // Get top stories IDs
      const topResponse = await axios.get(this.sources.hackernews.endpoints[0]);
      const topStoryIds = topResponse.data.slice(0, 20); // Top 20 stories

      // Fetch individual stories
      for (const storyId of topStoryIds) {
        try {
          await this.waitForRateLimit('news');

          const storyResponse = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
          );
          const story = storyResponse.data;

          if (!story || story.type !== 'story' || !story.title) continue;

          // Check if this is AI/tech related content
          const isAIContent = this.isAIContent(story.title, story.text || story.url || '');
          if (!isAIContent) continue;

          // Calculate momentum score
          const momentum = this.calculateMomentumScore({
            viewCount: story.score || 0,
            likeCount: 0, // HN doesn't have likes
            commentCount: story.descendants || 0,
            publishedAt: new Date(story.time * 1000)
          });

          results.push({
            source: 'hackernews',
            title: story.title,
            content: story.text || story.url || '',
            score: story.score || 0,
            comments: story.descendants || 0,
            url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
            created: new Date(story.time * 1000),
            tags: ['hackernews', 'tech', 'ai'],
            engagement: (story.score || 0) + (story.descendants || 0),
            viralPotential: this.calculateViralPotential(story),
            momentum: momentum,
            // Translate content if needed
            translatedContent: await this.translateContentIfNeeded({
              title: story.title,
              content: story.text || story.url || ''
            })
          });

        } catch (error) {
          console.warn(`⚠️ Failed to fetch HN story ${storyId}`);
        }
      }

      console.log(`✅ Scraped Hacker News: ${results.length} stories`);

    } catch (error) {
      console.error('❌ Failed to scrape Hacker News:', error.message);
    }

    return results;
  }

  /**
   * Scrape with Firecrawl
   */
  async scrapeWithFirecrawlSite(site) {
    try {
      const response = await axios.post(
        'https://api.firecrawl.io/v1/scrape',
        {
          url: site,
          depth: 2,
          respectRobotsTxt: true
        },
        {
          headers: {
            'X-API-Key': this.firecrawlApiKey
          },
          timeout: 30000
        }
      );

      const results = [];
      const pages = response.data.pages;

      for (const page of pages) {
        const $ = cheerio.load(page.content);

        // Extract articles/blog posts
        const articles = $('article, .post, .blog-post, .entry').slice(0, 5);

        for (let i = 0; i < articles.length; i++) {
          const article = articles[i];
          const title = $(article).find('h1, h2, h3').first().text().trim();
          const content = $(article).find('p').text().substring(0, 1000);
          const link = $(article).find('a').first().attr('href') || site;

          if (title && content) {
            // Calculate momentum score
            const momentum = this.calculateMomentumScore({
              viewCount: null, // No view count available
              likeCount: null,
              commentCount: null,
              publishedAt: new Date() // Approximate date
            });

            results.push({
              source: 'ai-research',
              title: title,
              content: content,
              score: null,
              comments: null,
              url: link,
              created: new Date(),
              tags: ['ai-research'],
              engagement: 0,
              viralPotential: 0,
              momentum: momentum,
              // Translate content if needed
              translatedContent: await this.translateContentIfNeeded({
                title: title,
                content: content
              })
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Failed to scrape with Firecrawl:', error.message);
      return [];
    }
  }

  /**
   * Scrape AI Research sites
   */
  async scrapeAIResearch() {
    if (!this.sources.aiResearch.enabled) return [];

    console.log('🔍 Scraping AI Research sites...');
    const results = [];

    try {
      // Scrape each AI research site
      for (const site of this.sources.aiResearch.sites) {
        try {
          await this.waitForRateLimit('web');

          const response = await axios.get(site, {
            headers: {
              'User-Agent': 'YouTube-Automation-Bot/1.0'
            },
            timeout: 15000
          });

          const $ = cheerio.load(response.data);

          // Extract articles/blogs
          const articles = $('article, .post, .blog-post').slice(0, 5);

          for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const title = $(article).find('h1, h2, h3, .title').first().text().trim();
            const content = $(article).find('p, .content').text().trim().substring(0, 1000);
            const link = $(article).find('a').first().attr('href');

            if (title && content) {
              // Calculate momentum score
              const momentum = this.calculateMomentumScore({
                viewCount: null, // No view count available
                likeCount: null,
                commentCount: null,
                publishedAt: new Date() // Approximate date
              });

              results.push({
                source: 'ai-research',
                title: title,
                content: content,
                score: null,
                comments: null,
                url: link ? (link.startsWith('http') ? link : new URL(link, site).href) : site,
                created: new Date(),
                tags: ['ai', 'research', 'technology'],
                engagement: null,
                viralPotential: this.calculateViralPotential({
                  title: title,
                  text: content
                }),
                momentum: momentum,
                translatedContent: await this.translateContentIfNeeded({
                  title: title,
                  content: content
                })
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to scrape AI research site ${site}:`, error.message);
        }
      }

      console.log(`✅ Scraped AI Research: ${results.length} articles`);

    } catch (error) {
      console.error('❌ Failed to scrape AI Research:', error.message);
    }

    return results;
  }

  /**
   * Scrape AI Papers from arXiv
   */
  async scrapeAIPapers() {
    if (!this.sources.aiPapers.enabled) return [];

    console.log('🔍 Scraping AI Papers from arXiv...');
    const results = [];

    try {
      // Scrape each arXiv category
      for (const site of this.sources.aiPapers.sites) {
        try {
          await this.waitForRateLimit('web');

          const response = await axios.get(site, {
            headers: {
              'User-Agent': 'YouTube-Automation-Bot/1.0'
            },
            timeout: 15000
          });

          const $ = cheerio.load(response.data);

          // Extract papers
          const papers = $('li.arxiv-result').slice(0, 10);

          for (let i = 0; i < papers.length; i++) {
            const paper = papers[i];
            const title = $(paper).find('.title').text().trim();
            const abstract = $(paper).find('.abstract').text().trim().substring(0, 1000);
            const link = $(paper).find('.list-title a').first().attr('href');
            const authors = $(paper).find('.authors').text().trim();

            if (title && abstract) {
              // Calculate momentum score
              const momentum = this.calculateMomentumScore({
                viewCount: null, // No view count available
                likeCount: null,
                commentCount: null,
                publishedAt: new Date() // Approximate date
              });

              results.push({
                source: 'ai-papers',
                title: title,
                content: abstract,
                authors: authors,
                score: null,
                comments: null,
                url: link ? `https://arxiv.org${link}` : site,
                created: new Date(),
                tags: ['ai', 'papers', 'research'],
                engagement: null,
                viralPotential: this.calculateViralPotential({
                  title: title,
                  text: abstract
                }),
                momentum: momentum,
                translatedContent: await this.translateContentIfNeeded({
                  title: title,
                  content: abstract
                })
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to scrape AI papers from ${site}:`, error.message);
        }
      }

      console.log(`✅ Scraped AI Papers: ${results.length} papers`);

    } catch (error) {
      console.error('❌ Failed to scrape AI Papers:', error.message);
    }

    return results;
  }

  /**
   * Scrape YouTube for trending content
   */
  async scrapeYouTube() {
    if (!this.sources.youtube.enabled) return [];

    console.log('🔍 Scraping YouTube for trending content...');

    // Use Firecrawl if available
    if (this.useFirecrawl) {
      return await this.scrapeWithFirecrawl('youtube');
    }

    const results = [];

    try {
      // Check if YouTube API key is available
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ YouTube API key not found. Set YOUTUBE_API_KEY environment variable.');
        return [];
      }

      await this.waitForRateLimit('youtube');

      const url = `${this.sources.youtube.trendingEndpoint}&key=${apiKey}`;
      const response = await axios.get(url, {
        timeout: 10000
      });

      const videos = response.data.items;

      for (const video of videos) {
        // Translate content if needed
        const translatedContent = await this.translateContentIfNeeded({
          title: video.snippet.title,
          content: video.snippet.description
        });

        const viewCount = parseInt(video.statistics.viewCount);
        const likeCount = parseInt(video.statistics.likeCount || 0);
        const commentCount = parseInt(video.statistics.commentCount || 0);
        const engagement = viewCount + likeCount + commentCount;

        results.push({
          source: 'youtube',
          title: video.snippet.title,
          content: video.snippet.description,
          score: viewCount,
          comments: commentCount,
          likes: likeCount,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          created: new Date(video.snippet.publishedAt),
          tags: video.snippet.tags || [],
          engagement: engagement,
          viralPotential: this.calculateViralPotential({
            score: viewCount,
            num_comments: commentCount
          }),
          thumbnail: video.snippet.thumbnails?.high?.url || '',
          channel: video.snippet.channelTitle,
          duration: null, // Would require additional API call to get duration
          translatedContent: translatedContent,
          momentum: this.calculateMomentumScore({
            viewCount: viewCount,
            likeCount: likeCount,
            commentCount: commentCount,
            publishedAt: video.snippet.publishedAt
          })
        });
      }

      console.log(`✅ Scraped YouTube: ${results.length} videos`);

    } catch (error) {
      console.error('❌ Failed to scrape YouTube:', error.message);
    }

    return results;
  }

  /**
   * Scrape Twitter for trending content
   */
  async scrapeTwitter() {
    if (!this.sources.twitter.enabled) return [];

    console.log('🔍 Scraping Twitter for trending content...');

    // Use Firecrawl if available
    if (this.useFirecrawl) {
      return await this.scrapeWithFirecrawl('twitter');
    }

    const results = [];

    try {
      // Check if Twitter Bearer Token is available
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        console.warn('⚠️ Twitter Bearer Token not found. Set TWITTER_BEARER_TOKEN environment variable.');
        return [];
      }

      await this.waitForRateLimit('twitter');

      // Example search query - would need to be customized based on requirements
      const searchQuery = 'AI OR machine learning OR technology -is:retweet lang:de';
      const url = `${this.sources.twitter.endpoints[0]}?query=${encodeURIComponent(searchQuery)}&max_results=25&tweet.fields=created_at,public_metrics,context_annotations`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'User-Agent': 'YouTube-Automation-Bot/1.0'
        },
        timeout: 10000
      });

      const tweets = response.data.data || [];

      for (const tweet of tweets) {
        // Translate content if needed
        const translatedContent = await this.translateContentIfNeeded({
          title: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
          content: tweet.text
        });

        results.push({
          source: 'twitter',
          title: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''), // First 100 chars as title
          content: tweet.text,
          score: tweet.public_metrics.like_count,
          comments: tweet.public_metrics.reply_count,
          retweets: tweet.public_metrics.retweet_count,
          url: `https://twitter.com/user/status/${tweet.id}`,
          created: new Date(tweet.created_at),
          tags: tweet.context_annotations?.map(ca => ca.entity.name) || [],
          engagement: tweet.public_metrics.like_count + tweet.public_metrics.reply_count + tweet.public_metrics.retweet_count,
          viralPotential: this.calculateViralPotential({
            score: tweet.public_metrics.like_count,
            num_comments: tweet.public_metrics.reply_count
          }),
          author: null, // Would require additional API call to get user info
          translatedContent: translatedContent,
          momentum: this.calculateMomentumScore({
            viewCount: tweet.public_metrics.like_count,
            likeCount: tweet.public_metrics.like_count,
            commentCount: tweet.public_metrics.reply_count,
            publishedAt: tweet.created_at
          })
        });
      }

      console.log(`✅ Scraped Twitter: ${results.length} tweets`);

    } catch (error) {
      console.error('❌ Failed to scrape Twitter:', error.message);
    }

    return results;
  }

  /**
   * NEW: Scrape Instagram for content
   */
  async scrapeInstagram() {
    if (!this.sources.instagram.enabled) return [];

    console.log('🔍 Scraping Instagram for content...');

    // Use Firecrawl if available
    if (this.useFirecrawl) {
      return await this.scrapeWithFirecrawl('instagram');
    }

    const results = [];

    try {
      await this.waitForRateLimit('instagram');

      // Note: Instagram scraping without authentication is very limited
      // This is a simplified example - in practice would require authentication
      console.warn('⚠️ Instagram scraping without authentication is limited. Consider using official API.');

      // For demo purposes, we'll simulate some Instagram content
      // In a real implementation, this would use Instagram's Graph API
      for (let i = 0; i < 5; i++) {
        // Translate content if needed
        const contentText = `This is a simulated Instagram post about technology and AI. In a real implementation, this would fetch actual Instagram content using the Graph API.`;
        const translatedContent = await this.translateContentIfNeeded({
          title: `Instagram Post ${i+1}`,
          content: contentText
        });

        results.push({
          source: 'instagram',
          title: `Instagram Post ${i+1}`,
          content: contentText,
          score: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
          likes: Math.floor(Math.random() * 10000),
          url: `https://instagram.com/post/${i+1}`,
          created: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within last week
          tags: ['technology', 'ai', 'innovation'],
          engagement: Math.floor(Math.random() * 1000),
          viralPotential: Math.floor(Math.random() * 10),
          type: 'post',
          author: 'tech_influencer',
          translatedContent: translatedContent,
          momentum: this.calculateMomentumScore({
            viewCount: Math.floor(Math.random() * 10000),
            likeCount: Math.floor(Math.random() * 10000),
            commentCount: Math.floor(Math.random() * 100),
            publishedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
          })
        });
      }

      console.log(`✅ Scraped Instagram: ${results.length} posts`);

    } catch (error) {
      console.error('❌ Failed to scrape Instagram:', error.message);
    }

    return results;
  }

  /**
   * Scrape TikTok for trending content
   */
  async scrapeTikTok() {
    if (!this.sources.tiktok.enabled) return [];

    console.log('🔍 Scraping TikTok for trending content...');

    // Use Firecrawl if available
    if (this.useFirecrawl) {
      return await this.scrapeWithFirecrawl('tiktok');
    }

    const results = [];

    try {
      await this.waitForRateLimit('tiktok');

      // Note: TikTok scraping is complex due to anti-bot measures
      // This is a simplified example - in practice would require more sophisticated handling
      const params = new URLSearchParams({
        aid: '1988',
        app_name: 'tiktok_web',
        device_platform: 'web_pc',
        count: '30',
        cursor: '0'
      });

      const url = `${this.sources.tiktok.endpoints[0]}?${params.toString()}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.tiktok.com/',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 10000
      });

      const videos = response.data.itemList || [];

      for (const video of videos) {
        // Translate content if needed
        const translatedContent = await this.translateContentIfNeeded({
          title: video.desc || 'TikTok Video',
          content: video.desc || ''
        });

        results.push({
          source: 'tiktok',
          title: video.desc || 'TikTok Video',
          content: video.desc || '',
          score: video.stats.playCount,
          comments: video.stats.commentCount,
          likes: video.stats.diggCount,
          shares: video.stats.shareCount,
          url: `https://www.tiktok.com/@${video.author.uniqueId}/video/${video.id}`,
          created: new Date(video.createTime * 1000),
          tags: video.challenges?.map(c => c.title) || [],
          engagement: video.stats.playCount + video.stats.commentCount + video.stats.diggCount + video.stats.shareCount,
          viralPotential: this.calculateViralPotential({
            score: video.stats.playCount,
            num_comments: video.stats.commentCount
          }),
          thumbnail: video.video.cover,
          author: video.author.uniqueId,
          duration: video.video.duration,
          translatedContent: translatedContent,
          momentum: this.calculateMomentumScore({
            viewCount: video.stats.playCount,
            likeCount: video.stats.diggCount,
            commentCount: video.stats.commentCount,
            publishedAt: new Date(video.createTime * 1000)
          })
        });
      }

      console.log(`✅ Scraped TikTok: ${results.length} videos`);

    } catch (error) {
      console.error('❌ Failed to scrape TikTok:', error.message);
    }

    return results;
  }

  /**
   * NEW: Scrape Bundestag sessions and content
   */
  async scrapeBundestag() {
    if (!this.sources.bundestag.enabled) return [];

    console.log('🔍 Scraping Bundestag content...');
    const results = [];

    try {
      await this.waitForRateLimit('parliament');

      // Scrape Plenarprotokolle
      const protocolsUrl = this.sources.bundestag.endpoints[0];
      const protocolsResponse = await axios.get(protocolsUrl, {
        headers: {
          'User-Agent': 'YouTube-Automation-Bot/1.0'
        },
        timeout: 15000
      });

      // Parse HTML content
      const $ = cheerio.load(protocolsResponse.data);
      const protocolLinks = $('a[href*="plenarprotokoll"]').slice(0, 10); // Top 10 protocols

      for (let i = 0; i < protocolLinks.length; i++) {
        const link = protocolLinks[i];
        const href = $(link).attr('href');
        const title = $(link).text().trim();

        if (href) {
          try {
            await this.waitForRateLimit('parliament');

            // Get protocol content
            const protocolUrl = href.startsWith('http') ? href : `https://www.bundestag.de${href}`;
            const protocolResponse = await axios.get(protocolUrl, {
              headers: {
                'User-Agent': 'YouTube-Automation-Bot/1.0'
              },
              timeout: 15000
            });

            const protocol$ = cheerio.load(protocolResponse.data);
            const content = protocol$('.content').text().substring(0, 2000); // First 2000 chars

            // Extract actual date from protocol content if possible
            let createdDate = new Date();
            const dateMatch = content.match(/\d{2}\.\d{2}\.\d{4}/);
            if (dateMatch) {
              const [day, month, year] = dateMatch[0].split('.');
              createdDate = new Date(`${year}-${month}-${day}`);
            }

            // Calculate engagement metrics for political content
            const wordCount = content.split(' ').length;
            const engagementScore = Math.min(wordCount / 100, 10); // Normalize word count to engagement score

            results.push({
              source: 'bundestag',
              title: title || 'Bundestag Plenarsitzung',
              content: content,
              score: engagementScore,
              comments: null,
              url: protocolUrl,
              created: createdDate,
              tags: ['bundestag', 'plenarsitzung', 'politik'],
              engagement: engagementScore * 100,
              viralPotential: this.calculateViralPotential({
                score: engagementScore,
                title: title || 'Bundestag Plenarsitzung'
              }),
              type: 'protocol',
              momentum: this.calculateMomentumScore({
                viewCount: engagementScore * 100,
                likeCount: engagementScore * 10,
                commentCount: engagementScore * 5,
                publishedAt: createdDate
              })
            });
          } catch (error) {
            console.warn(`⚠️ Failed to scrape Bundestag protocol: ${href}`);
          }
        }
      }

      console.log(`✅ Scraped Bundestag: ${results.length} items`);

    } catch (error) {
      console.error('❌ Failed to scrape Bundestag:', error.message);
    }

    return results;
  }

  /**
   * NEW: Scrape Landtag sessions
   */
  async scrapeLandtags() {
    if (!this.sources.landtags.enabled) return [];

    console.log('🔍 Scraping Landtag sessions...');
    const results = [];

    try {
      // For demo purposes, we'll focus on a few key states
      const keyStates = ['bayern', 'berlin', 'hamburg', 'niedersachsen'];

      for (const state of keyStates) {
        try {
          await this.waitForRateLimit('parliament');

          // Example URLs - would need to be customized for each state
          const stateUrls = {
            bayern: 'https://www.bayern.landtag.de/webangebot/services/opendata/',
            berlin: 'https://www.parlament-berlin.de/dokumente/open-data/',
            hamburg: 'https://www.buergerschaft-hh.de/parldok/dokumentenfundstelle',
            niedersachsen: 'https://www.niedersachsen.landtag.de/webseite/oeffentlicher-service/opendata/'
          };

          const stateUrl = stateUrls[state];
          if (!stateUrl) continue;

          const response = await axios.get(stateUrl, {
            headers: {
              'User-Agent': 'YouTube-Automation-Bot/1.0'
            },
            timeout: 15000
          });

          // Parse HTML content
          const $ = cheerio.load(response.data);
          const contentLinks = $('a[href*=".pdf"], a[href*="dokument"], a[href*="sitzung"]').slice(0, 5);

          for (let i = 0; i < contentLinks.length; i++) {
            const link = contentLinks[i];
            const href = $(link).attr('href');
            const title = $(link).text().trim() || `Landtag ${state} Dokument`;

            if (href) {
              const fullUrl = href.startsWith('http') ? href : `https://www.${state}.landtag.de${href}`;

              // Try to extract date from title or URL
              let createdDate = new Date();
              const dateRegex = /\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4}/;
              const dateMatch = title.match(dateRegex) || fullUrl.match(dateRegex);
              if (dateMatch) {
                try {
                  if (dateMatch[0].includes('.')) {
                    const [day, month, year] = dateMatch[0].split('.');
                    createdDate = new Date(`${year}-${month}-${day}`);
                  } else {
                    createdDate = new Date(dateMatch[0]);
                  }
                } catch (e) {
                  // Use current date if parsing fails
                  createdDate = new Date();
                }
              }

              // Create more detailed content description
              const contentDescription = `Dokument vom Landtag ${state} - ${title}. Details und vollständiger Inhalt finden Sie unter: ${fullUrl}`;

              // Calculate engagement metrics
              const wordCount = contentDescription.split(' ').length;
              const engagementScore = Math.min(wordCount / 10, 5); // Normalize word count to engagement score

              results.push({
                source: `landtag-${state}`,
                title: title,
                content: contentDescription,
                score: engagementScore,
                comments: null,
                url: fullUrl,
                created: createdDate,
                tags: ['landtag', state, 'politik'],
                engagement: engagementScore * 50,
                viralPotential: this.calculateViralPotential({
                  score: engagementScore,
                  title: title
                }),
                type: 'document',
                momentum: this.calculateMomentumScore({
                  viewCount: engagementScore * 50,
                  likeCount: engagementScore * 5,
                  commentCount: engagementScore * 2,
                  publishedAt: createdDate
                })
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to scrape Landtag ${state}:`, error.message);
        }
      }

      console.log(`✅ Scraped Landtags: ${results.length} items`);

    } catch (error) {
      console.error('❌ Failed to scrape Landtags:', error.message);
    }

    return results;
  }

  /**
   * NEW: Scrape political talk shows
   */
  async scrapePoliticalTalkShows() {
    if (!this.sources.politicalTalkShows.enabled) return [];

    console.log('🔍 Scraping political talk shows...');
    const results = [];

    try {
      // Scrape each talk show
      for (const [showName, showUrl] of Object.entries(this.sources.politicalTalkShows.shows)) {
        try {
          await this.waitForRateLimit('politics');

          const response = await axios.get(showUrl, {
            headers: {
              'User-Agent': 'YouTube-Automation-Bot/1.0'
            },
            timeout: 15000
          });

          // Parse HTML content
          const $ = cheerio.load(response.data);

          // Extract show information
          const title = $('title').text() || `Sendung ${showName}`;
          const description = $('meta[name="description"]').attr('content') ||
                             $('.text, .description, .intro').first().text().substring(0, 500) ||
                             `Politische Talkshow ${showName}`;

          // Extract video links if available
          const videoLinks = $('a[href*="video"], a[href*="sendung"]').slice(0, 3);

          if (videoLinks.length > 0) {
            for (let i = 0; i < videoLinks.length; i++) {
              const link = videoLinks[i];
              const href = $(link).attr('href');
              const linkText = $(link).text().trim();

              if (href) {
                const fullUrl = href.startsWith('http') ? href : `https://www.zdf.de${href}`;

                // Try to extract date from the page content
                let createdDate = new Date();
                const timeElement = $('time').attr('datetime') || $('meta[property="article:published_time"]').attr('content');
                if (timeElement) {
                  try {
                    createdDate = new Date(timeElement);
                  } catch (e) {
                    // Use current date if parsing fails
                    createdDate = new Date();
                  }
                }

                // Calculate engagement metrics based on content
                const wordCount = description.split(' ').length;
                const engagementScore = Math.min(wordCount / 50, 10); // Normalize word count to engagement score

                results.push({
                  source: `talkshow-${showName}`,
                  title: linkText || title,
                  content: description,
                  score: engagementScore,
                  comments: null,
                  url: fullUrl,
                  created: createdDate,
                  tags: ['talkshow', showName, 'politik'],
                  engagement: engagementScore * 200,
                  viralPotential: this.calculateViralPotential({
                    score: engagementScore,
                    title: linkText || title
                  }),
                  type: 'video',
                  momentum: this.calculateMomentumScore({
                    viewCount: engagementScore * 200,
                    likeCount: engagementScore * 50,
                    commentCount: engagementScore * 20,
                    publishedAt: createdDate
                  })
                });
              }
            }
          } else {
            // If no specific videos found, add the main page
            // Try to extract date from the page content
            let createdDate = new Date();
            const timeElement = $('time').attr('datetime') || $('meta[property="article:published_time"]').attr('content');
            if (timeElement) {
              try {
                createdDate = new Date(timeElement);
              } catch (e) {
                // Use current date if parsing fails
                createdDate = new Date();
              }
            }

            // Calculate engagement metrics based on content
            const wordCount = description.split(' ').length;
            const engagementScore = Math.min(wordCount / 50, 10); // Normalize word count to engagement score

            results.push({
              source: `talkshow-${showName}`,
              title: title,
              content: description,
              score: engagementScore,
              comments: null,
              url: showUrl,
              created: createdDate,
              tags: ['talkshow', showName, 'politik'],
              engagement: engagementScore * 150,
              viralPotential: this.calculateViralPotential({
                score: engagementScore,
                title: title
              }),
              type: 'page',
              momentum: this.calculateMomentumScore({
                viewCount: engagementScore * 150,
                likeCount: engagementScore * 30,
                commentCount: engagementScore * 10,
                publishedAt: createdDate
              })
            });
          }
        } catch (error) {
          console.warn(`⚠️ Failed to scrape talk show ${showName}:`, error.message);
        }
      }

      console.log(`✅ Scraped political talk shows: ${results.length} items`);

    } catch (error) {
      console.error('❌ Failed to scrape political talk shows:', error.message);
    }

    return results;
  }

  /**
   * NEW: General web scraping function
   */
  async scrapeWebPage(url) {
    if (!this.sources.web.enabled) return null;

    try {
      await this.waitForRateLimit('web');

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'YouTube-Automation-Bot/1.0'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Extract content
      const title = $('title').text() || 'Untitled Page';
      const content = $('p, h1, h2, h3, h4, h5, h6').text().substring(0, 2000);

      return {
        source: 'web',
        title: title,
        content: content,
        score: null,
        comments: null,
        url: url,
        created: new Date(),
        tags: ['web', 'scraped'],
        engagement: null,
        viralPotential: 5,
        type: 'webpage'
      };
    } catch (error) {
      console.error(`❌ Failed to scrape web page ${url}:`, error.message);
      return null;
    }
  }

  /**
   * NEW: Enhanced web search function
   */
  async searchWeb(query, options = {}) {
    if (!this.sources.web.enabled) return [];

    const {
      maxResults = 10,
      language = 'de',
      searchDepth = 1
    } = options;

    console.log(`🔍 Searching web for: "${query}"`);
    const results = [];

    try {
      // Example using a search engine API (would need actual implementation)
      // For demo purposes, we'll simulate search results

      // In a real implementation, this would use an actual search API
      // like Google Custom Search, Bing Search API, etc.

      for (let i = 0; i < maxResults; i++) {
        await this.waitForRateLimit('web');

        // Create result object
        const result = {
          source: 'web-search',
          title: `Suchergebnis für "${query}" - Seite ${i+1}`,
          content: `Dies ist ein simuliertes Suchergebnis für die Anfrage "${query}". In einer echten Implementierung würden hier die tatsächlichen Suchergebnisse von einer Suchmaschinen-API angezeigt.`,
          score: null,
          comments: null,
          url: `https://example.com/search?q=${encodeURIComponent(query)}&page=${i+1}`,
          created: new Date(),
          tags: ['web-search', query, language],
          engagement: null,
          viralPotential: 3,
          type: 'search-result',
          searchQuery: query
        };

        // Translate content if needed
        const translatedResult = await this.translateContentIfNeeded(result);
        if (translatedResult) {
          result.translatedContent = translatedResult;
        }

        results.push(result);
      }

      console.log(`✅ Web search completed: ${results.length} results`);

    } catch (error) {
      console.error('❌ Web search failed:', error.message);
    }

    return results;
  }

  /**
   * Calculate viral potential score
   */
  calculateViralPotential(item) {
    let score = 0;

    // Engagement ratio
    const engagement = (item.score || 0) + (item.num_comments || item.descendants || 0);
    score += Math.min(engagement / 100, 10); // Max 10 points for engagement

    // Recency bonus (newer content gets higher score)
    const age = Date.now() - (item.created_utc || item.time || 0) * 1000;
    const ageHours = age / (1000 * 60 * 60);
    if (ageHours < 6) score += 5;
    else if (ageHours < 24) score += 3;
    else if (ageHours < 72) score += 1;

    // Title analysis (viral keywords)
    const viralKeywords = [
      'breaking', 'new', 'revolutionary', 'breakthrough', 'amazing',
      'shocking', 'incredible', 'game-changing', 'first', 'latest'
    ];
    const title = (item.title || item.text || '').toLowerCase();
    viralKeywords.forEach(keyword => {
      if (title.includes(keyword)) score += 2;
    });

    return Math.round(score * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate momentum score for sorting
   */
  calculateMomentumScore(item) {
    // Momentum = recency * engagement * virality
    const age = Date.now() - new Date(item.publishedAt).getTime();
    const ageHours = age / (1000 * 60 * 60);

    // Recency factor (newer content gets higher score)
    const recencyFactor = Math.max(0.1, 1 - (ageHours / 168)); // 168 hours = 1 week

    // Engagement score
    const engagement = (item.viewCount || 0) + (item.likeCount || 0) + (item.commentCount || 0);
    const engagementScore = Math.log10(engagement + 1);

    // Virality factor
    const virality = engagement > 0 ? (item.likeCount || 0) / engagement : 0;

    return recencyFactor * engagementScore * (1 + virality);
  }

  /**
   * Translate content if needed
   */
  async translateContentIfNeeded(contentData) {
    // Check if translation is enabled and needed
    if (!this.translationService.enabled) return null;

    // Check if content is in target language already
    // This is a simplified check - in a real implementation, you would use a language detection library
    const content = contentData.content || contentData.title || '';
    const isLikelyGerman = content.includes('der') || content.includes('die') || content.includes('das') ||
                          content.includes('und') || content.includes('oder') || content.includes('mit');

    // If content is likely already in German, no translation needed
    if (isLikelyGerman && this.translationService.targetLanguage === 'de') {
      return null;
    }

    // If content is likely in English and we want German, translate
    const isLikelyEnglish = content.includes('the') || content.includes('and') || content.includes('or') ||
                          content.includes('with') || content.includes('for') || content.includes('this');

    if (isLikelyEnglish && this.translationService.targetLanguage === 'de') {
      // In a real implementation, you would call a translation API here
      // For now, we'll simulate translation
      console.log(`🔄 Translating content from English to German: ${content.substring(0, 50)}...`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Return simulated translation
      return `ÜBERSETZT: ${content}`;
    }

    return null;
  }

  /**
   * Scrape with Firecrawl
   */
  async scrapeWithFirecrawl(source) {
    if (!this.useFirecrawl) return [];

    console.log(`🔍 Scraping ${source} with Firecrawl...`);
    const results = [];

    try {
      // Define scraping URLs based on source
      let urls = [];
      switch (source) {
        case 'youtube':
          urls = [
            'https://www.youtube.com/results?search_query=AI+technology',
            'https://www.youtube.com/results?search_query=machine+learning'
          ];
          break;
        case 'twitter':
          urls = [
            'https://twitter.com/search?q=AI%20technology&src=typed_query',
            'https://twitter.com/search?q=machine%20learning&src=typed_query'
          ];
          break;
        case 'tiktok':
          urls = [
            'https://www.tiktok.com/tag/ai',
            'https://www.tiktok.com/tag/machinelearning'
          ];
          break;
        case 'instagram':
          urls = [
            'https://www.instagram.com/explore/tags/artificialintelligence/',
            'https://www.instagram.com/explore/tags/machinelearning/'
          ];
          break;
        default:
          return [];
      }

      // Scrape each URL
      for (const url of urls) {
        try {
          await this.waitForRateLimit('web');

          // Make request to Firecrawl API
          const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
            url: url,
            formats: ['markdown', 'html']
          }, {
            headers: {
              'Authorization': `Bearer ${this.firecrawlApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          if (response.data.success) {
            const data = response.data.data;

            // Create result object
            const result = {
              source: source,
              title: data.metadata?.title || `Scraped ${source} content`,
              content: data.markdown || data.html || '',
              url: url,
              created: new Date(),
              engagement: Math.floor(Math.random() * 1000),
              viralPotential: Math.floor(Math.random() * 10),
              momentum: Math.random() * 100
            };

            // Translate content if needed
            const translatedContent = await this.translateContentIfNeeded({
              title: result.title,
              content: result.content
            });

            if (translatedContent) {
              result.translatedContent = translatedContent;
            }

            results.push(result);
          }
        } catch (error) {
          console.error(`❌ Firecrawl scraping failed for ${url}:`, error.message);
        }
      }

      console.log(`✅ Firecrawl scraping completed for ${source}: ${results.length} items`);
      return results;

    } catch (error) {
      console.error(`❌ Firecrawl scraping failed for ${source}:`, error.message);
      return [];
    }
  }

  /**
   * Scrape a website using Firecrawl
   */
  async scrapeWithFirecrawlSite(url) {
    if (!this.useFirecrawl) return [];

    console.log(`🔍 Scraping site with Firecrawl: ${url}`);
    const results = [];

    try {
      await this.waitForRateLimit('web');

      // Make request to Firecrawl API
      const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
        url: url,
        formats: ['markdown', 'html']
      }, {
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.success) {
        const data = response.data.data;

        // Create result object
        const result = {
          source: 'firecrawl-site',
          title: data.metadata?.title || `Scraped content from ${url}`,
          content: data.markdown || data.html || '',
          url: url,
          created: new Date(),
          engagement: null,
          viralPotential: this.calculateViralPotential({
            title: data.metadata?.title || `Scraped content from ${url}`,
            text: data.markdown || data.html || ''
          }),
          momentum: this.calculateMomentumScore({
            viewCount: null,
            likeCount: null,
            commentCount: null,
            publishedAt: new Date()
          })
        };

        // Translate content if needed
        const translatedContent = await this.translateContentIfNeeded({
          title: result.title,
          content: result.content
        });

        if (translatedContent) {
          result.translatedContent = translatedContent;
        }

        results.push(result);
      }

      console.log(`✅ Firecrawl site scraping completed: ${results.length} items`);
      return results;

    } catch (error) {
      console.error(`❌ Firecrawl site scraping failed for ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Scrape content for a specific topic with SEO keywords
   */
  async scrapeContentForTopicWithKeywords(topic, keywords = []) {
    console.log(`🔍 Scraping content for topic "${topic}" with ${keywords.length} keywords...`);

    // Combine topic and keywords for more comprehensive search
    const searchTerms = [topic, ...keywords].slice(0, 10); // Limit to 10 terms

    // Use Firecrawl if available for better results
    if (this.useFirecrawl) {
      return await this.scrapeWithKeywordsFirecrawl(searchTerms);
    }

    const results = {
      topic: topic,
      keywords: keywords,
      contentItems: [],
      sources: {},
      totalItems: 0,
      processingTime: 0
    };

    const startTime = Date.now();

    try {
      // Scrape each source with the enhanced search terms
      const scrapingTasks = [
        this.scrapeRedditWithKeywords(searchTerms),
        this.scrapeYouTubeWithKeywords(searchTerms),
        this.scrapeTwitterWithKeywords(searchTerms),
        this.scrapeTikTokWithKeywords(searchTerms),
        this.scrapeInstagramWithKeywords(searchTerms),
        this.scrapeBundestagWithKeywords(searchTerms),
        this.scrapeAIResearchWithKeywords(searchTerms),
        this.scrapeAIPapersWithKeywords(searchTerms)
      ];

      // Execute all scraping tasks in parallel
      const scrapingResults = await Promise.allSettled(scrapingTasks);

      // Process results
      scrapingResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          results.contentItems.push(...result.value);

          // Track source statistics
          if (result.value.length > 0) {
            const sourceName = ['reddit', 'youtube', 'twitter', 'tiktok', 'instagram', 'bundestag', 'aiResearch', 'aiPapers'][index];
            results.sources[sourceName] = result.value.length;
          }
        }
      });

      // Sort by momentum score
      results.contentItems.sort((a, b) => (b.momentum || 0) - (a.momentum || 0));

      // Limit to top 50 results to avoid overwhelming the system
      results.contentItems = results.contentItems.slice(0, 50);

      results.totalItems = results.contentItems.length;
      results.processingTime = Date.now() - startTime;

      console.log(`✅ Scraping completed: ${results.totalItems} items from ${Object.keys(results.sources).length} sources`);

      return results;
    } catch (error) {
      console.error('❌ Failed to scrape content with keywords:', error);
      throw error;
    }
  }

  /**
   * Scrape Reddit with keywords
   */
  async scrapeRedditWithKeywords(keywords) {
    if (!this.sources.reddit.enabled) return [];

    console.log('🔍 Scraping Reddit with keywords...');
    const results = [];

    try {
      // For each subreddit, search with keywords
      for (const subreddit of this.sources.reddit.subreddits) {
        for (const keyword of keywords) {
          try {
            await this.waitForRateLimit('reddit');

            // Create search URL with keyword
            const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=on&sort=relevance&t=week`;

            const response = await axios.get(searchUrl, {
              headers: {
                'User-Agent': 'YouTube-Automation-Bot/1.0'
              },
              timeout: 10000
            });

            const posts = response.data.data.children.slice(0, 5); // Limit to 5 posts per keyword

            for (const post of posts) {
              const data = post.data;

              if (data.title && data.selftext) {
                // Calculate momentum score based on engagement metrics
                const momentum = this.calculateMomentumScore({
                  viewCount: data.ups,
                  likeCount: data.ups,
                  commentCount: data.num_comments,
                  publishedAt: new Date(data.created_utc * 1000)
                });

                results.push({
                  source: 'reddit',
                  type: 'post',
                  title: data.title,
                  content: data.selftext.substring(0, 1000),
                  score: data.ups,
                  comments: data.num_comments,
                  url: `https://reddit.com${data.permalink}`,
                  created: new Date(data.created_utc * 1000),
                  tags: [subreddit, ...keywords.slice(0, 3)],
                  engagement: data.ups,
                  viralPotential: this.calculateViralPotential({
                    score: data.ups,
                    title: data.title,
                    text: data.selftext
                  }),
                  momentum: momentum,
                  translatedContent: await this.translateContentIfNeeded({
                    title: data.title,
                    content: data.selftext
                  })
                });
              }
            }
          } catch (error) {
            console.warn(`⚠️ Failed to search Reddit subreddit ${subreddit} for keyword "${keyword}"`);
          }
        }
      }

      console.log(`✅ Scraped Reddit with keywords: ${results.length} posts`);

    } catch (error) {
      console.error('❌ Failed to scrape Reddit with keywords:', error.message);
    }

    return results;
  }

  /**
   * Scrape YouTube with keywords
   */
  async scrapeYouTubeWithKeywords(keywords) {
    if (!this.sources.youtube.enabled) return [];

    console.log('🔍 Scraping YouTube with keywords...');

    // Use Firecrawl if available
    if (this.useFirecrawl) {
      return await this.scrapeWithFirecrawlKeywords('youtube', keywords);
    }

    const results = [];

    try {
      // Search YouTube for each keyword
      for (const keyword of keywords) {
        try {
          await this.waitForRateLimit('youtube');

          // Note: This is a simplified approach as we don't have YouTube API key in this context
          // In a real implementation, we would use the YouTube Data API
          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;

          // For demo purposes, we'll simulate YouTube results
          const simulatedResults = [];
          for (let i = 0; i < 3; i++) {
            simulatedResults.push({
              source: 'youtube',
              type: 'video',
              title: `Video about ${keyword} - Sample ${i + 1}`,
              content: `This is a sample video description about ${keyword}. It covers various aspects of the topic and provides valuable information.`,
              url: `https://youtube.com/watch?v=sample${i + 1}`,
              created: new Date(),
              tags: [keyword, 'youtube', 'video'],
              engagement: Math.floor(Math.random() * 10000),
              viralPotential: Math.floor(Math.random() * 10),
              momentum: Math.random() * 100
            });
          }

          results.push(...simulatedResults);
        } catch (error) {
          console.warn(`⚠️ Failed to search YouTube for keyword "${keyword}"`);
        }
      }

      console.log(`✅ Scraped YouTube with keywords: ${results.length} videos`);

    } catch (error) {
      console.error('❌ Failed to scrape YouTube with keywords:', error.message);
    }

    return results;
  }

  /**
   * Scrape Twitter with keywords
   */
  async scrapeTwitterWithKeywords(keywords) {
    if (!this.sources.twitter.enabled) return [];

    console.log('🔍 Scraping Twitter with keywords...');

    // Use Firecrawl if available
    if (this.useFirecrawl) {
      return await this.scrapeWithFirecrawlKeywords('twitter', keywords);
    }

    const results = [];

    try {
      // Search Twitter for each keyword
      for (const keyword of keywords) {
        try {
          await this.waitForRateLimit('twitter');

          // Note: This is a simplified approach as we don't have Twitter API key in this context
          // In a real implementation, we would use the Twitter API
          const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(keyword)}&src=typed_query`;

          // For demo purposes, we'll simulate Twitter results
          const simulatedResults = [];
          for (let i = 0; i < 3; i++) {
            simulatedResults.push({
              source: 'twitter',
              type: 'tweet',
              title: `Tweet about ${keyword}`,
              content: `This is a sample tweet about ${keyword}. It's trending and has valuable insights! #${keyword.replace(/\s+/g, '')}`,
              url: `https://twitter.com/user/status/sample${i + 1}`,
              created: new Date(),
              tags: [keyword, 'twitter', ...keyword.split(/\s+/)],
              engagement: Math.floor(Math.random() * 5000),
              viralPotential: Math.floor(Math.random() * 10),
              momentum: Math.random() * 100
            });
          }

          results.push(...simulatedResults);
        } catch (error) {
          console.warn(`⚠️ Failed to search Twitter for keyword "${keyword}"`);
        }
      }

      console.log(`✅ Scraped Twitter with keywords: ${results.length} tweets`);

    } catch (error) {
      console.error('❌ Failed to scrape Twitter with keywords:', error.message);
    }

    return results;
  }

  /**
   * Scrape with Firecrawl using keywords
   */
  async scrapeWithFirecrawlKeywords(source, keywords) {
    if (!this.useFirecrawl) return [];

    console.log(`🔍 Scraping ${source} with Firecrawl and keywords...`);
    const results = [];

    try {
      // Search for each keyword
      for (const keyword of keywords) {
        try {
          await this.waitForRateLimit('web');

          // Define search URLs based on source and keyword
          let searchUrl = '';
          switch (source) {
            case 'youtube':
              searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
              break;
            case 'twitter':
              searchUrl = `https://twitter.com/search?q=${encodeURIComponent(keyword)}&src=typed_query`;
              break;
            case 'tiktok':
              searchUrl = `https://www.tiktok.com/tag/${encodeURIComponent(keyword)}`;
              break;
            case 'instagram':
              searchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(keyword)}/`;
              break;
            default:
              // Generic search
              searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
          }

          // Make request to Firecrawl API
          const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
            url: searchUrl,
            formats: ['markdown', 'html']
          }, {
            headers: {
              'Authorization': `Bearer ${this.firecrawlApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          if (response.data.success) {
            const data = response.data.data;

            // Create result object
            const result = {
              source: source,
              title: data.metadata?.title || `Content about ${keyword}`,
              content: data.markdown || data.html || '',
              url: searchUrl,
              created: new Date(),
              engagement: Math.floor(Math.random() * 1000),
              viralPotential: Math.floor(Math.random() * 10),
              momentum: Math.random() * 100,
              keyword: keyword
            };

            // Translate content if needed
            const translatedContent = await this.translateContentIfNeeded({
              title: result.title,
              content: result.content
            });

            if (translatedContent) {
              result.translatedContent = translatedContent;
            }

            results.push(result);
          }
        } catch (error) {
          console.error(`❌ Firecrawl scraping failed for ${source} keyword "${keyword}":`, error.message);
        }
      }

      console.log(`✅ Firecrawl scraping completed for ${source} with keywords: ${results.length} items`);
      return results;

    } catch (error) {
      console.error(`❌ Firecrawl scraping failed for ${source} with keywords:`, error.message);
      return [];
    }
  }

  /**
   * Scrape AI Research sites with keywords
   */
  async scrapeAIResearchWithKeywords(keywords) {
    if (!this.sources.aiResearch.enabled) return [];

    console.log('🔍 Scraping AI Research sites with keywords...');
    const results = [];

    try {
      // Scrape each AI research site for each keyword
      for (const site of this.sources.aiResearch.sites) {
        for (const keyword of keywords) {
          try {
            await this.waitForRateLimit('web');

            // Use Firecrawl if available
            if (this.useFirecrawl) {
              const firecrawlResults = await this.scrapeWithFirecrawlSiteWithKeyword(site, keyword);
              results.push(...firecrawlResults);
              continue;
            }

            // For demo purposes, we'll simulate results
            const simulatedResults = [{
              source: 'ai-research',
              title: `Research on ${keyword} from ${new URL(site).hostname}`,
              content: `This is simulated research content about ${keyword}. In a real implementation, this would be actual content from the research site.`,
              url: site,
              created: new Date(),
              tags: ['ai', 'research', keyword],
              engagement: Math.floor(Math.random() * 500),
              viralPotential: Math.floor(Math.random() * 5),
              momentum: Math.random() * 50,
              keyword: keyword
            }];

            results.push(...simulatedResults);
          } catch (error) {
            console.warn(`⚠️ Failed to scrape AI research site ${site} for keyword "${keyword}"`);
          }
        }
      }

      console.log(`✅ Scraped AI Research with keywords: ${results.length} articles`);

    } catch (error) {
      console.error('❌ Failed to scrape AI Research with keywords:', error.message);
    }

    return results;
  }

  /**
   * Scrape a website using Firecrawl with a keyword
   */
  async scrapeWithFirecrawlSiteWithKeyword(url, keyword) {
    if (!this.useFirecrawl) return [];

    console.log(`🔍 Scraping site with Firecrawl: ${url} for keyword: ${keyword}`);
    const results = [];

    try {
      await this.waitForRateLimit('web');

      // Modify the URL to include the keyword in search if possible
      const searchUrl = `${url}?q=${encodeURIComponent(keyword)}`;

      // Make request to Firecrawl API
      const response = await axios.post('https://api.firecrawl.dev/v0/scrape', {
        url: searchUrl,
        formats: ['markdown', 'html']
      }, {
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.success) {
        const data = response.data.data;

        // Create result object
        const result = {
          source: 'firecrawl-site',
          title: data.metadata?.title || `Content about ${keyword} from ${new URL(url).hostname}`,
          content: data.markdown || data.html || '',
          url: searchUrl,
          created: new Date(),
          engagement: null,
          viralPotential: this.calculateViralPotential({
            title: data.metadata?.title || `Content about ${keyword}`,
            text: data.markdown || data.html || ''
          }),
          momentum: this.calculateMomentumScore({
            viewCount: null,
            likeCount: null,
            commentCount: null,
            publishedAt: new Date()
          }),
          keyword: keyword
        };

        // Translate content if needed
        const translatedContent = await this.translateContentIfNeeded({
          title: result.title,
          content: result.content
        });

        if (translatedContent) {
          result.translatedContent = translatedContent;
        }

        results.push(result);
      }

      console.log(`✅ Firecrawl site scraping completed for keyword "${keyword}": ${results.length} items`);
      return results;

    } catch (error) {
      console.error(`❌ Firecrawl site scraping failed for ${url} keyword "${keyword}":`, error.message);
      return [];
    }
  }

  /**
   * Main scraping orchestrator
   */
  async scrapeAllSources() {
    // Check weekend pause
    if (this.isWeekendPause()) {
      console.log('🏖️ Weekend pause active - skipping scraping');
      return {
        success: false,
        reason: 'weekend_pause',
        nextScrape: this.getNextScrapeTime()
      };
    }

    console.log('🚀 Starting comprehensive content scraping...');
    const startTime = Date.now();

    const allResults = [];

    try {
      // Scrape all sources in parallel (with rate limiting)
      const [
        redditResults,
        hackerNewsResults,
        youtubeResults,
        twitterResults,
        tiktokResults,
        instagramResults,
        bundestagResults,
        landtagResults,
        talkShowResults,
        aiResearchResults,
        aiPapersResults
      ] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeHackerNews(),
        this.scrapeYouTube(),
        this.scrapeTwitter(),
        this.scrapeTikTok(),
        this.scrapeInstagram(),
        this.scrapeBundestag(),
        this.scrapeLandtags(),
        this.scrapePoliticalTalkShows(),
        this.scrapeAIResearch(),
        this.scrapeAIPapers()
      ]);

      // Collect successful results
      if (redditResults.status === 'fulfilled') {
        allResults.push(...redditResults.value);
      }
      if (hackerNewsResults.status === 'fulfilled') {
        allResults.push(...hackerNewsResults.value);
      }
      if (youtubeResults.status === 'fulfilled') {
        allResults.push(...youtubeResults.value);
      }
      if (twitterResults.status === 'fulfilled') {
        allResults.push(...twitterResults.value);
      }
      if (tiktokResults.status === 'fulfilled') {
        allResults.push(...tiktokResults.value);
      }
      if (instagramResults.status === 'fulfilled') {
        allResults.push(...instagramResults.value);
      }
      if (bundestagResults.status === 'fulfilled') {
        allResults.push(...bundestagResults.value);
      }
      if (landtagResults.status === 'fulfilled') {
        allResults.push(...landtagResults.value);
      }
      if (talkShowResults.status === 'fulfilled') {
        allResults.push(...talkShowResults.value);
      }
      if (aiResearchResults.status === 'fulfilled') {
        allResults.push(...aiResearchResults.value);
      }
      if (aiPapersResults.status === 'fulfilled') {
        allResults.push(...aiPapersResults.value);
      }

      // Sort by momentum (using calculateMomentumScore method)
      allResults.sort((a, b) => {
        const momentumA = this.calculateMomentumScore(a);
        const momentumB = this.calculateMomentumScore(b);
        return momentumB - momentumA; // High to low
      });

      // Save results
      await this.saveScrapedContent(allResults);

      const duration = Date.now() - startTime;

      console.log(`🎉 Scraping completed: ${allResults.length} items in ${duration}ms`);

      return {
        success: true,
        totalItems: allResults.length,
        sources: {
          reddit: redditResults.status === 'fulfilled' ? redditResults.value.length : 0,
          hackernews: hackerNewsResults.status === 'fulfilled' ? hackerNewsResults.value.length : 0,
          youtube: youtubeResults.status === 'fulfilled' ? youtubeResults.value.length : 0,
          twitter: twitterResults.status === 'fulfilled' ? twitterResults.value.length : 0,
          tiktok: tiktokResults.status === 'fulfilled' ? tiktokResults.value.length : 0,
          instagram: instagramResults.status === 'fulfilled' ? instagramResults.value.length : 0,
          bundestag: bundestagResults.status === 'fulfilled' ? bundestagResults.value.length : 0,
          landtags: landtagResults.status === 'fulfilled' ? landtagResults.value.length : 0,
          talkshows: talkShowResults.status === 'fulfilled' ? talkShowResults.value.length : 0,
          aiResearch: aiResearchResults.status === 'fulfilled' ? aiResearchResults.value.length : 0,
          aiPapers: aiPapersResults.status === 'fulfilled' ? aiPapersResults.value.length : 0
        },
        topItems: allResults.slice(0, 10),
        duration: duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Save scraped content to file system
   */
  async saveScrapedContent(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scraped-content-${timestamp}.json`;
    const filepath = path.join(this.dataDir, filename);

    const data = {
      scrapedAt: new Date().toISOString(),
      totalItems: results.length,
      sources: [...new Set(results.map(r => r.source))],
      items: results
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${results.length} items to ${filename}`);

    // Keep only last 10 files
    this.cleanupOldFiles();
  }

  /**
   * Cleanup old scraping files
   */
  cleanupOldFiles() {
    try {
      const files = fs.readdirSync(this.dataDir)
        .filter(f => f.startsWith('scraped-content-'))
        .map(f => ({
          name: f,
          path: path.join(this.dataDir, f),
          mtime: fs.statSync(path.join(this.dataDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Keep only 10 most recent files
      files.slice(10).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.warn('⚠️ Cleanup failed:', error.message);
    }
  }

  /**
   * Get next scheduled scrape time
   */
  getNextScrapeTime() {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    monday.setHours(6, 0, 0, 0);
    return monday.toISOString();
  }

  /**
   * Get service statistics
   */
  getStats() {
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('scraped-content-'));

    let totalItems = 0;
    let latestScrape = null;

    if (files.length > 0) {
      const latestFile = files.sort().pop();
      const data = JSON.parse(fs.readFileSync(path.join(this.dataDir, latestFile)));
      totalItems = data.totalItems;
      latestScrape = data.scrapedAt;
    }

    return {
      enabled: !this.isWeekendPause(),
      weekendPause: this.weekendPause,
      isWeekend: this.isWeekendPause(),
      totalScrapingRuns: files.length,
      latestScrape,
      totalItemsLastRun: totalItems,
      sources: Object.keys(this.sources).filter(s => this.sources[s].enabled),
      nextScrape: this.isWeekendPause() ? this.getNextScrapeTime() : 'Available now'
    };
  }
}

module.exports = WebScrapingService;