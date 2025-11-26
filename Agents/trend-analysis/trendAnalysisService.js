const fs = require('fs');
const path = require('path');

/**
 * Trend Analysis & Topic Discovery Service
 * Analyzes scraped content to identify viral trends and hot topics
 */
class TrendAnalysisService {
  constructor(options = {}) {
    // Allow customization of directories
    this.dataDir = options.dataDir || path.join(__dirname, 'data/scraped-content');
    this.trendsDir = options.trendsDir || path.join(__dirname, 'data/trends');
    this.cacheDir = options.cacheDir || path.join(__dirname, 'data/trend-cache');

    // Trend analysis configuration
    this.analysisConfig = {
      minEngagement: 50,        // Minimum engagement for trend consideration
      trendingThreshold: 3,     // Minimum mentions across sources
      viralThreshold: 7.5,      // Minimum viral potential score
      timeWindow: 72,           // Hours to look back for trending analysis
      maxTrends: 50             // Maximum trends to track
    };

    // Keyword scoring weights
    this.scoringWeights = {
      engagement: 0.3,
      viralPotential: 0.25,
      recency: 0.2,
      crossPlatform: 0.15,
      keywordRelevance: 0.1
    };

    // Topic categories
    this.categories = {
      'ai_tech': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'gpt', 'llm', 'robot'],
      'programming': ['code', 'developer', 'programming', 'software', 'github', 'python', 'javascript'],
      'startup': ['startup', 'funding', 'venture', 'ipo', 'acquisition', 'series'],
      'crypto': ['bitcoin', 'crypto', 'blockchain', 'ethereum', 'nft', 'defi'],
      'science': ['research', 'study', 'discovery', 'breakthrough', 'science', 'university'],
      'business': ['company', 'ceo', 'market', 'business', 'revenue', 'profit'],
      'politics': ['government', 'policy', 'regulation', 'law', 'congress', 'senate']
    };

    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.trendsDir, this.cacheDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get latest scraped content files
   */
  getLatestScrapedContent(hoursBack = 72) {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const allContent = [];

    try {
      // Check if data directory exists
      if (!fs.existsSync(this.dataDir)) {
        console.warn('⚠️ Data directory does not exist');
        return [];
      }

      const files = fs.readdirSync(this.dataDir)
        .filter(f => f.startsWith('scraped-content-'))
        .map(f => ({
          name: f,
          path: path.join(this.dataDir, f),
          mtime: fs.statSync(path.join(this.dataDir, f)).mtime
        }))
        .filter(f => f.mtime > cutoffTime)
        .sort((a, b) => b.mtime - a.mtime);

      for (const file of files) {
        const data = JSON.parse(fs.readFileSync(file.path));
        allContent.push(...data.items);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load scraped content:', error.message);
    }

    return allContent;
  }

  /**
   * Extract keywords from text using simple NLP
   */
  extractKeywords(text) {
    if (!text) return [];

    // Convert to lowercase and remove special characters
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
      'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
      'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could',
      'can', 'may', 'might', 'must', 'shall'
    ]);

    // Extract words (minimum 3 characters)
    const words = cleanText.split(' ')
      .filter(word => word.length >= 3 && !stopWords.has(word))
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers

    // Count word frequencies
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return sorted by frequency
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * Categorize content based on keywords
   */
  categorizeContent(content) {
    const text = `${content.title} ${content.content}`.toLowerCase();
    const scores = {};

    for (const [category, keywords] of Object.entries(this.categories)) {
      let score = 0;
      keywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        score += matches;
      });
      if (score > 0) {
        scores[category] = score;
      }
    }

    // Return primary category (highest score)
    const entries = Object.entries(scores);
    if (entries.length === 0) return 'general';

    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Calculate trending score for a topic
   */
  calculateTrendingScore(keyword, mentions, timeSpread, avgEngagement, avgViralPotential) {
    const weights = this.scoringWeights;

    // Normalize values
    const normalizedMentions = Math.min(mentions / 10, 1); // Max 10 mentions = 1.0
    const normalizedTimeSpread = Math.min(timeSpread / 48, 1); // Max 48 hours = 1.0
    const normalizedEngagement = Math.min(avgEngagement / 1000, 1); // Max 1000 engagement = 1.0
    const normalizedViral = Math.min(avgViralPotential / 10, 1); // Max 10 viral score = 1.0

    // Keyword relevance (boost for tech/trending terms)
    const trendingKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'breakthrough', 'revolutionary',
      'new', 'latest', 'update', 'release', 'launch', 'announcement'
    ];
    const keywordRelevance = trendingKeywords.some(tk =>
      keyword.toLowerCase().includes(tk.toLowerCase())
    ) ? 1.0 : 0.5;

    const score =
      normalizedEngagement * weights.engagement +
      normalizedViral * weights.viralPotential +
      normalizedTimeSpread * weights.recency +
      normalizedMentions * weights.crossPlatform +
      keywordRelevance * weights.keywordRelevance;

    return Math.round(score * 100) / 100;
  }

  /**
   * Analyze trends from scraped content
   */
  async analyzeTrends() {
    console.log('📈 Starting trend analysis...');

    const content = this.getLatestScrapedContent(this.analysisConfig.timeWindow);

    if (content.length === 0) {
      console.log('⚠️ No content available for trend analysis');
      return { trends: [], topics: [], analysis: null };
    }

    console.log(`📊 Analyzing ${content.length} content items...`);

    // Extract all keywords
    const allKeywords = [];
    const contentWithKeywords = content.map(item => {
      const keywords = this.extractKeywords(`${item.title} ${item.content}`);
      allKeywords.push(...keywords);
      return { ...item, keywords };
    });

    // Count keyword frequencies
    const keywordCounts = {};
    allKeywords.forEach(({ word, count }) => {
      if (!keywordCounts[word]) {
        keywordCounts[word] = { total: 0, items: [] };
      }
      keywordCounts[word].total += count;
      keywordCounts[word].items.push(count);
    });

    // Filter for trending keywords
    const trendingKeywords = Object.entries(keywordCounts)
      .filter(([keyword, data]) => data.total >= this.analysisConfig.trendingThreshold)
      .map(([keyword, data]) => ({
        keyword,
        count: data.total,
        items: data.items.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, this.analysisConfig.maxTrends);

    // Calculate trending scores
    const trendsWithScores = trendingKeywords.map(trend => {
      // Calculate average engagement and viral potential for this keyword
      let totalEngagement = 0;
      let totalViralPotential = 0;
      let earliestTime = Date.now();
      let latestTime = 0;
      let itemCount = 0;

      contentWithKeywords.forEach(item => {
        const keywordMatch = item.keywords.find(k => k.word === trend.keyword);
        if (keywordMatch) {
          totalEngagement += item.engagement || 0;
          totalViralPotential += item.viralPotential || 5;
          const timestamp = new Date(item.timestamp || Date.now()).getTime();
          earliestTime = Math.min(earliestTime, timestamp);
          latestTime = Math.max(latestTime, timestamp);
          itemCount++;
        }
      });

      const avgEngagement = totalEngagement / itemCount;
      const avgViralPotential = totalViralPotential / itemCount;
      const timeSpread = (latestTime - earliestTime) / (1000 * 60 * 60); // Hours

      const trendingScore = this.calculateTrendingScore(
        trend.keyword,
        trend.items,
        timeSpread,
        avgEngagement,
        avgViralPotential
      );

      return {
        ...trend,
        avgEngagement: Math.round(avgEngagement),
        avgViralPotential: Math.round(avgViralPotential * 10) / 10,
        timeSpread: Math.round(timeSpread * 10) / 10,
        trendingScore,
        category: this.categorizeContent({ title: trend.keyword, content: '' })
      };
    });

    // Sort by trending score
    const sortedTrends = trendsWithScores
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, this.analysisConfig.maxTrends);

    // Extract topics
    const topics = {};
    contentWithKeywords.forEach(item => {
      const category = this.categorizeContent(item);
      if (!topics[category]) {
        topics[category] = { count: 0, engagement: 0, viralPotential: 0 };
      }
      topics[category].count++;
      topics[category].engagement += item.engagement || 0;
      topics[category].viralPotential += item.viralPotential || 0;
    });

    // Normalize topic data
    Object.keys(topics).forEach(category => {
      const topic = topics[category];
      topics[category] = {
        count: topic.count,
        avgEngagement: Math.round(topic.engagement / topic.count),
        avgViralPotential: Math.round((topic.viralPotential / topic.count) * 10) / 10
      };
    });

    // Create analysis result
    const analysis = {
      timestamp: new Date().toISOString(),
      totalContentItems: content.length,
      totalKeywords: allKeywords.length,
      trendingKeywords: sortedTrends.length,
      topics: Object.keys(topics).length,
      topCategories: Object.entries(topics)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([category, data]) => ({ category, ...data }))
    };

    // Save trend analysis
    const trendData = {
      timestamp: new Date().toISOString(),
      trends: sortedTrends,
      topics,
      analysis
    };

    this.saveTrendAnalysis(trendData);

    console.log(`✅ Trend analysis complete. Found ${sortedTrends.length} trending keywords`);

    return {
      trends: sortedTrends,
      topics,
      analysis
    };
  }

  /**
   * Get latest trend analysis
   */
  getLatestTrendAnalysis() {
    try {
      const files = fs.readdirSync(this.trendsDir)
        .filter(f => f.startsWith('trend-analysis-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.trendsDir, f),
          mtime: fs.statSync(path.join(this.trendsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (files.length === 0) {
        return null;
      }

      const latest = JSON.parse(fs.readFileSync(files[0].path));
      return {
        ...latest,
        topTrend: latest?.trends?.[0]?.keyword || null,
        topTrendScore: latest?.trends?.[0]?.trendingScore || 0,
        analysisConfig: this.analysisConfig
      };
    } catch (error) {
      console.error('❌ Failed to load trend analysis:', error);
      return null;
    }
  }

  /**
   * Save trend analysis to file
   */
  saveTrendAnalysis(data) {
    try {
      const filename = `trend-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filepath = path.join(this.trendsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Trend analysis saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save trend analysis:', error);
    }
  }

  /**
   * Get trend analysis configuration
   */
  getConfig() {
    return this.analysisConfig;
  }

  /**
   * Update trend analysis configuration
   */
  updateConfig(newConfig) {
    this.analysisConfig = { ...this.analysisConfig, ...newConfig };
  }
}

module.exports = TrendAnalysisService;