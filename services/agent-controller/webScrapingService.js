const axios = require('axios');

/**
 * Web Scraping Service
 * Handles web scraping operations for content discovery
 * Only uses approved sources: YouTube, Twitter/X, TikTok, Instagram, Bundestag, Landtage, politische Talkshows
 */
class WebScrapingService {
  constructor() {
    this.weekendPause = false;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    // Approved platforms only
    this.supportedPlatforms = {
      'youtube': { name: 'YouTube', icon: '▶️' },
      'twitter': { name: 'Twitter/X', icon: '🐦' },
      'tiktok': { name: 'TikTok', icon: '🎵' },
      'instagram': { name: 'Instagram', icon: '📸' },
      'bundestag': { name: 'Bundestag', icon: '🏛️' },
      'landtage': { name: 'Landtage', icon: '🏛️' },
      'politische-talkshows': { name: 'Politische Talkshows', icon: '📺' }
    };

    // Define themes/topics for classification with clear separation
    this.themes = {
      'ki': ['ki', 'künstliche intelligenz', 'ai', 'machine learning', 'algorithmus', 'daten', 'robotik', 'neuronale netze', 'deep learning', 'chatgpt', 'openai'],
      'afd': ['afd', 'alternative für deutschland', 'alice weidel', 'tino chrupalla', 'rechtspopulismus', 'pegida', 'lutz bachmann'],
      'politik': ['politik', 'regierung', 'wahl', 'partei', 'bundestag', 'landtag', 'demokratie', 'parlament', 'minister', 'kanzler', 'bundespräsident', 'spd', 'cdu', 'csu', 'fdp', 'linke', 'grüne']
    };
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
   * Calculate quality score for content
   */
  calculateQualityScore(item) {
    if (!item) return 0;

    // Base score calculation
    let score = 0;

    // Engagement metrics (weighted)
    if (item.viewCount) score += item.viewCount * 0.1;
    if (item.likeCount) score += item.likeCount * 0.5;
    if (item.commentCount) score += item.commentCount * 1.0;
    if (item.shareCount) score += item.shareCount * 1.5;

    // Recency bonus (newer content gets higher scores)
    if (item.publishedAt) {
      const publishedDate = new Date(item.publishedAt);
      const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
      const recencyBonus = Math.max(0, 50 - (hoursSincePublished / 24)); // Max 50 point bonus for very recent content
      score += recencyBonus;
    }

    // Cap the score at 100
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Extract relevant keywords from content items
   */
  extractRelevantKeywords(contentItems, originalKeywords = []) {
    const keywordFrequency = {};

    // Add original keywords with high frequency to prioritize them
    originalKeywords.forEach(keyword => {
      keywordFrequency[keyword.toLowerCase()] = 100;
    });

    // Process each content item to extract keywords
    contentItems.forEach(item => {
      // Extract keywords from title
      if (item.title) {
        const titleWords = item.title.toLowerCase().match(/\b(\w{3,})\b/g) || [];
        titleWords.forEach(word => {
          keywordFrequency[word] = (keywordFrequency[word] || 0) + 3;
        });
      }

      // Extract keywords from description/content
      const contentText = (item.description || item.content || item.caption || '').toLowerCase();
      const contentWords = contentText.match(/\b(\w{3,})\b/g) || [];
      contentWords.forEach(word => {
        keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
      });

      // Boost keywords from high-quality content
      if (item.qualityScore >= 90) {
        const highQualityWords = (item.title + ' ' + contentText).toLowerCase().match(/\b(\w{3,})\b/g) || [];
        highQualityWords.forEach(word => {
          keywordFrequency[word] = (keywordFrequency[word] || 0) + 2;
        });
      }
    });

    // Convert to array and sort by frequency
    const sortedKeywords = Object.entries(keywordFrequency)
      .filter(([word, freq]) => freq > 2) // Only include words that appear more than twice
      .sort((a, b) => b[1] - a[1]) // Sort by frequency (descending)
      .map(([word, freq]) => ({ word, frequency: freq }));

    // Return top 15 keywords
    return sortedKeywords.slice(0, 15);
  }

  /**
   * Extract today's top keywords from content items
   */
  extractTodaysTopKeywords(contentItems, originalKeywords = []) {
    const keywordFrequency = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    // Add original keywords with high frequency to prioritize them
    originalKeywords.forEach(keyword => {
      keywordFrequency[keyword.toLowerCase()] = 100;
    });

    // Process each content item to extract keywords
    contentItems.forEach(item => {
      // Check if content is from today
      if (item.publishedAt) {
        const publishedDate = new Date(item.publishedAt);
        publishedDate.setHours(0, 0, 0, 0);

        // Only process content from today
        if (publishedDate.getTime() === today.getTime()) {
          // Extract keywords from title
          if (item.title) {
            const titleWords = item.title.toLowerCase().match(/\b(\w{3,})\b/g) || [];
            titleWords.forEach(word => {
              keywordFrequency[word] = (keywordFrequency[word] || 0) + 5; // Higher weight for today's content
            });
          }

          // Extract keywords from description/content
          const contentText = (item.description || item.content || item.caption || '').toLowerCase();
          const contentWords = contentText.match(/\b(\w{3,})\b/g) || [];
          contentWords.forEach(word => {
            keywordFrequency[word] = (keywordFrequency[word] || 0) + 2; // Higher weight for today's content
          });
        }
      }
    });

    // Convert to array and sort by frequency
    const sortedKeywords = Object.entries(keywordFrequency)
      .filter(([word, freq]) => freq > 1) // Only include words that appear more than once
      .sort((a, b) => b[1] - a[1]) // Sort by frequency (descending)
      .map(([word, freq]) => ({ word, frequency: freq }));

    // Return top 10 keywords from today
    return sortedKeywords.slice(0, 10);
  }

  /**
   * Classify content items into themes with clear separation
   */
  classifyThemes(contentItems) {
    const themeScores = {};

    // Initialize theme scores
    Object.keys(this.themes).forEach(theme => {
      themeScores[theme] = 0;
    });

    // Process each content item to classify themes
    contentItems.forEach(item => {
      const title = (item.title || '').toLowerCase();
      const contentText = (title + ' ' + (item.description || item.content || item.caption || '')).toLowerCase();

      // Check for theme keywords in content
      Object.entries(this.themes).forEach(([theme, keywords]) => {
        let themeScore = 0;

        keywords.forEach(keyword => {
          // Count occurrences of each keyword
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          const matches = contentText.match(regex);
          const count = matches ? matches.length : 0;

          // Add to theme score (weighted by keyword importance)
          themeScore += count * 3;
        });

        // Boost score for high-quality content
        if (item.qualityScore >= 90) {
          themeScore *= 1.5;
        }

        // Boost score for recent content
        if (item.publishedAt) {
          const publishedDate = new Date(item.publishedAt);
          const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
          if (hoursSincePublished <= 24) { // Content from last 24 hours
            themeScore *= 1.2;
          }
        }

        themeScores[theme] += themeScore;
      });
    });

    // Convert to array and sort by score
    const sortedThemes = Object.entries(themeScores)
      .filter(([theme, score]) => score > 0) // Only include themes with score > 0
      .sort((a, b) => b[1] - a[1]) // Sort by score (descending)
      .map(([theme, score]) => ({ theme, score: Math.round(score) }));

    return sortedThemes;
  }

  /**
   * Extract theme-specific content
   */
  extractThemeSpecificContent(contentItems) {
    const themeContent = {};

    // Initialize theme content arrays
    Object.keys(this.themes).forEach(theme => {
      themeContent[theme] = [];
    });

    // Process each content item and assign to themes
    contentItems.forEach(item => {
      const title = (item.title || '').toLowerCase();
      const contentText = (title + ' ' + (item.description || item.content || item.caption || '')).toLowerCase();

      // Check for theme keywords in content
      Object.entries(this.themes).forEach(([theme, keywords]) => {
        let themeRelevance = 0;

        keywords.forEach(keyword => {
          // Count occurrences of each keyword
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          const matches = contentText.match(regex);
          const count = matches ? matches.length : 0;

          themeRelevance += count;
        });

        // If content is relevant to theme, add it
        if (themeRelevance > 0) {
          themeContent[theme].push({
            ...item,
            themeRelevance: themeRelevance
          });
        }
      });
    });

    // Sort theme content by relevance and quality
    Object.keys(themeContent).forEach(theme => {
      themeContent[theme].sort((a, b) => {
        // Sort by theme relevance first, then by quality score
        if (b.themeRelevance !== a.themeRelevance) {
          return b.themeRelevance - a.themeRelevance;
        }
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      });

      // Keep only top 5 items per theme
      themeContent[theme] = themeContent[theme].slice(0, 5);
    });

    return themeContent;
  }

  /**
   * Extract specific video topics for content creation
   */
  extractVideoTopics(contentItems) {
    const videoTopics = {
      'ki': [],
      'politik': []
    };

    // Process each content item to extract potential video topics
    contentItems.forEach(item => {
      const title = (item.title || '').toLowerCase();
      const contentText = (title + ' ' + (item.description || item.content || item.caption || '')).toLowerCase();

      // Extract potential video topics for KI
      if (this.themes.ki.some(keyword => contentText.includes(keyword))) {
        // Extract topic from title
        const kiTopic = this.extractTopicFromText(title, this.themes.ki);
        if (kiTopic && !videoTopics.ki.includes(kiTopic)) {
          videoTopics.ki.push(kiTopic);
        }
      }

      // Extract potential video topics for Politik
      if (this.themes.politik.some(keyword => contentText.includes(keyword))) {
        // Extract topic from title
        const politikTopic = this.extractTopicFromText(title, this.themes.politik);
        if (politikTopic && !videoTopics.politik.includes(politikTopic)) {
          videoTopics.politik.push(politikTopic);
        }
      }
    });

    // Limit to top 5 topics per theme
    videoTopics.ki = videoTopics.ki.slice(0, 5);
    videoTopics.politik = videoTopics.politik.slice(0, 5);

    return videoTopics;
  }

  /**
   * Extract topic from text based on theme keywords
   */
  extractTopicFromText(text, themeKeywords) {
    // Find theme keywords in text
    const foundKeywords = themeKeywords.filter(keyword => text.includes(keyword));

    if (foundKeywords.length > 0) {
      // Try to extract a more specific topic
      const words = text.split(' ');
      const topicWords = words.filter(word =>
        word.length > 3 &&
        !['über', 'mit', 'für', 'und', 'der', 'die', 'das', 'ist', 'von', 'auf', 'in', 'an'].includes(word)
      );

      if (topicWords.length > 0) {
        // Return a combination of theme keyword and specific topic word
        return `${foundKeywords[0]}: ${topicWords.slice(0, 3).join(' ')}`;
      }

      return foundKeywords[0];
    }

    return null;
  }

  /**
   * Search the web for content
   */
  async searchWeb(query, options = {}) {
    try {
      const maxResults = options.maxResults || 10;
      const language = options.language || 'de'; // Default to German

      // Mock implementation - in a real service, this would make actual API calls
      return Array.from({ length: maxResults }, (_, i) => ({
        title: `Suchergebnis ${i + 1} für "${query}"`,
        url: `https://example.com/ergebnis-${i + 1}`,
        snippet: `Dies ist ein Beispielergebnis für die Suchanfrage "${query}"`,
        relevance: Math.random(),
        qualityScore: Math.floor(Math.random() * 40) + 60 // Scores between 60-100
      }));
    } catch (error) {
      console.error('❌ Web search failed:', error);
      return [];
    }
  }

  /**
   * Scrape YouTube with keywords
   */
  async scrapeYouTubeWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Thema';
      const items = [];

      // Generate 3-5 mock YouTube videos
      const count = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `YouTube Video über ${keyword} #${i + 1}`,
          description: `Dies ist eine Beispielbeschreibung für ein YouTube-Video über ${keyword}`,
          viewCount: Math.floor(Math.random() * 1000000),
          likeCount: Math.floor(Math.random() * 100000),
          commentCount: Math.floor(Math.random() * 10000),
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Within last week
          channelTitle: 'Beispielkanal',
          url: `https://youtube.com/watch?v=${Date.now()}-${i}`,
          source: 'youtube',
          platform: this.supportedPlatforms.youtube
        };

        item.qualityScore = this.calculateQualityScore(item);
        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ YouTube scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Scrape Twitter with keywords
   */
  async scrapeTwitterWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Thema';
      const items = [];

      // Generate 5-10 mock Twitter posts
      const count = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `Twitter-Post über ${keyword} #${i + 1}`,
          content: `Dies ist ein Beispiel-Twitter-Post über ${keyword} #${keyword.replace(/\s+/g, '')}`,
          retweetCount: Math.floor(Math.random() * 10000),
          likeCount: Math.floor(Math.random() * 10000),
          commentCount: Math.floor(Math.random() * 1000),
          publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Within last 24 hours
          url: `https://twitter.com/user/status/${Date.now()}-${i}`,
          source: 'twitter',
          platform: this.supportedPlatforms.twitter
        };

        item.qualityScore = this.calculateQualityScore(item);
        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ Twitter scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Scrape TikTok with keywords
   */
  async scrapeTikTokWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Thema';
      const items = [];

      // Generate 3-7 mock TikTok videos
      const count = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `TikTok Video über ${keyword} #${i + 1}`,
          description: `#${keyword.replace(/\s+/g, '')} #TikTok #Viral`,
          viewCount: Math.floor(Math.random() * 5000000),
          likeCount: Math.floor(Math.random() * 500000),
          commentCount: Math.floor(Math.random() * 50000),
          shareCount: Math.floor(Math.random() * 100000),
          publishedAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(), // Within last 48 hours
          creator: 'BeispielCreator',
          url: `https://tiktok.com/@creator/video/${Date.now()}-${i}`,
          source: 'tiktok',
          platform: this.supportedPlatforms.tiktok
        };

        item.qualityScore = this.calculateQualityScore(item);
        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ TikTok scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Scrape Instagram with keywords
   */
  async scrapeInstagramWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Thema';
      const items = [];

      // Generate 2-6 mock Instagram posts
      const count = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `Instagram-Post über ${keyword} #${i + 1}`,
          caption: `Beispielbild über ${keyword} #${keyword.replace(/\s+/g, '')} #Instagram`,
          likeCount: Math.floor(Math.random() * 100000),
          commentCount: Math.floor(Math.random() * 5000),
          publishedAt: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString(), // Within last 72 hours
          url: `https://instagram.com/p/${Date.now()}-${i}`,
          source: 'instagram',
          platform: this.supportedPlatforms.instagram
        };

        item.qualityScore = this.calculateQualityScore(item);
        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ Instagram scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Scrape Bundestag content with keywords
   */
  async scrapeBundestagWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Politik';
      const items = [];

      // Generate 1-3 mock Bundestag items
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `Bundestag: Debatte über ${keyword} #${i + 1}`,
          content: `Amtlicher Bericht der Debatte über ${keyword} im Deutschen Bundestag`,
          publishedAt: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000).toISOString(), // Within last week
          url: `https://bundestag.de/dokument-${Date.now()}-${i}`,
          source: 'bundestag',
          platform: this.supportedPlatforms.bundestag,
          qualityScore: 95 // Official government content gets high score
        };

        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ Bundestag scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Scrape Landtage content with keywords
   */
  async scrapeLandtageWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Regionalpolitik';
      const items = [];

      // Generate 1-2 mock Landtag items
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `Landtag: Diskussion über ${keyword} #${i + 1}`,
          content: `Amtlicher Bericht der Diskussion über ${keyword} im Landtag`,
          publishedAt: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000).toISOString(), // Within last week
          url: `https://landtag.de/dokument-${Date.now()}-${i}`,
          source: 'landtage',
          platform: this.supportedPlatforms.landtage,
          qualityScore: 90 // Official regional government content
        };

        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ Landtage scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Scrape politische Talkshows with keywords
   */
  async scrapeTalkshowsWithKeywords(keywords) {
    try {
      // Mock implementation
      const keyword = keywords[0] || 'Aktuelles';
      const items = [];

      // Generate 2-4 mock talk show items
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        const item = {
          title: `Talksendung: Diskussion über ${keyword} #${i + 1}`,
          content: `Zusammenfassung der Talksendung über ${keyword} mit Expertengast`,
          viewCount: Math.floor(Math.random() * 2000000),
          publishedAt: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000).toISOString(), // Within last week
          url: `https://talkshow.de/sendung-${Date.now()}-${i}`,
          source: 'politische-talkshows',
          platform: this.supportedPlatforms['politische-talkshows'],
          qualityScore: Math.floor(Math.random() * 10) + 85 // 85-95 range
        };

        item.qualityScore = this.calculateQualityScore(item);
        items.push(item);
      }

      return items;
    } catch (error) {
      console.error('❌ Talkshows scraping with keywords failed:', error);
      return [];
    }
  }

  /**
   * Execute scraping operation
   */
  async execute(options = {}) {
    try {
      console.log(`🔍 Starting scraping operation with type: ${options.type}`);

      // Handle different scraping types
      switch (options.type) {
        case 'scrape-keywords':
          return await this.scrapeContentWithKeywords(options.keywords, options.sources);

        case 'search-web':
          return await this.searchWeb(options.query, options);

        default:
          throw new Error(`Unsupported scraping type: ${options.type}`);
      }
    } catch (error) {
      console.error('❌ Scraping execution failed:', error);
      throw error;
    }
  }

  /**
   * Scrape content with keywords from approved sources and extract relevant information for video content creation
   */
  async scrapeContentWithKeywords(keywords, sources = []) {
    try {
      console.log(`🔍 Scraping content with keywords: ${keywords ? keywords.join(', ') : 'none'}`);
      console.log(`📚 Using sources: ${sources && sources.length > 0 ? sources.join(', ') : 'all approved'}\n`);

      // Handle case where keywords might be undefined
      const safeKeywords = keywords && Array.isArray(keywords) ? keywords : [];

      // Use all approved sources if none specified
      const sourcesToUse = sources && sources.length > 0 ? sources : Object.keys(this.supportedPlatforms);

      // Validate sources
      const validSources = sourcesToUse.filter(source => this.supportedPlatforms[source]);
      if (validSources.length === 0) {
        throw new Error('No valid sources specified');
      }

      console.log(`✅ Valid sources: ${validSources.join(', ')}`);

      // Scrape from multiple sources in parallel
      const scrapingPromises = [];

      if (validSources.includes('youtube')) {
        scrapingPromises.push(this.scrapeYouTubeWithKeywords(safeKeywords));
      }

      if (validSources.includes('twitter')) {
        scrapingPromises.push(this.scrapeTwitterWithKeywords(safeKeywords));
      }

      if (validSources.includes('tiktok')) {
        scrapingPromises.push(this.scrapeTikTokWithKeywords(safeKeywords));
      }

      if (validSources.includes('instagram')) {
        scrapingPromises.push(this.scrapeInstagramWithKeywords(safeKeywords));
      }

      if (validSources.includes('bundestag')) {
        scrapingPromises.push(this.scrapeBundestagWithKeywords(safeKeywords));
      }

      if (validSources.includes('landtage')) {
        scrapingPromises.push(this.scrapeLandtageWithKeywords(safeKeywords));
      }

      if (validSources.includes('politische-talkshows')) {
        scrapingPromises.push(this.scrapeTalkshowsWithKeywords(safeKeywords));
      }

      // Wait for all scraping operations to complete
      const results = await Promise.all(scrapingPromises);

      // Flatten results
      const allContent = results.flat();

      // Sort by quality score (descending)
      allContent.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

      // Filter for high quality content (95+)
      const highQualityContent = allContent.filter(item => (item.qualityScore || 0) >= 95);

      // Extract relevant keywords from all content
      const relevantKeywords = this.extractRelevantKeywords(allContent, safeKeywords);

      // Extract today's top keywords
      const todaysTopKeywords = this.extractTodaysTopKeywords(allContent, safeKeywords);

      // Classify themes from all content with improved logic
      const classifiedThemes = this.classifyThemes(allContent);

      // Extract theme-specific content
      const themeSpecificContent = this.extractThemeSpecificContent(allContent);

      // Extract specific video topics for content creation
      const videoTopics = this.extractVideoTopics(allContent);

      console.log(`✅ Scraped ${allContent.length} total items (${highQualityContent.length} with 95+ quality)`);
      console.log(`🔑 Extracted ${relevantKeywords.length} relevant keywords`);
      console.log(`🔥 Extracted ${todaysTopKeywords.length} today's top keywords`);
      console.log(`🏷️  Classified ${classifiedThemes.length} themes`);
      console.log(`📂 Extracted theme-specific content for ${Object.keys(themeSpecificContent).length} themes`);
      console.log(`🎬 Extracted ${videoTopics.ki.length + videoTopics.politik.length} specific video topics`);

      // Return structured result with all extracted information
      return {
        success: true,
        timestamp: new Date().toISOString(),
        keywords: safeKeywords,
        sources: validSources,
        totalItems: allContent.length,
        highQualityItems: highQualityContent.length,
        contentItems: allContent,
        highQualityContent: highQualityContent,
        relevantKeywords: relevantKeywords,
        todaysTopKeywords: todaysTopKeywords,
        themes: classifiedThemes,
        themeSpecificContent: themeSpecificContent,
        videoTopics: videoTopics, // Neue Ausgabe der spezifischen Videothemen
        statistics: {
          avgQualityScore: Math.round(allContent.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / allContent.length || 0),
          sourcesCount: validSources.length
        }
      };
    } catch (error) {
      console.error('❌ Content scraping with keywords failed:', error);
      throw error;
    }
  }
}

module.exports = WebScrapingService;