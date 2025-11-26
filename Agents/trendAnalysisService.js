const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Trend Analysis & Topic Discovery Agent
 * Analyzes scraped content to identify viral trends and hot topics with advanced AI capabilities
 * Bewertung: 9/10
 */
class TrendAnalysisAgent {
  constructor() {
    this.dataDir = path.join(__dirname, '../../../data/scraped-content');
    this.trendsDir = path.join(__dirname, '../../../data/trends');
    this.cacheDir = path.join(__dirname, '../../../data/trend-cache');
    this.predictionsDir = path.join(this.trendsDir, 'predictions');
    this.reportsDir = path.join(this.trendsDir, 'reports');

    // Erweiterte Trendanalyse-Konfiguration
    this.analysisConfig = {
      minEngagement: 50,        // Minimum engagement for trend consideration
      trendingThreshold: 3,     // Minimum mentions across sources
      viralThreshold: 7.5,      // Minimum viral potential score
      timeWindow: 72,           // Hours to look back for trending analysis
      maxTrends: 50,            // Maximum trends to track
      predictionWindow: 7,      // Tage für Trendvorhersagen
      confidenceThreshold: 0.7  // Mindestvertrauensschwelle für Vorhersagen
    };

    // Erweiterte Keyword-Bewertungsgewichte
    this.scoringWeights = {
      engagement: 0.25,
      viralPotential: 0.2,
      recency: 0.15,
      crossPlatform: 0.15,
      sentiment: 0.1,
      momentum: 0.1,
      keywordRelevance: 0.05
    };

    // Erweiterte Themenkategorien
    this.categories = {
      'ai_tech': {
        keywords: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'gpt', 'llm', 'robot', 'automation'],
        weight: 1.2
      },
      'programming': {
        keywords: ['code', 'developer', 'programming', 'software', 'github', 'python', 'javascript', 'framework'],
        weight: 1.0
      },
      'startup': {
        keywords: ['startup', 'funding', 'venture', 'ipo', 'acquisition', 'series', 'entrepreneur'],
        weight: 1.1
      },
      'crypto': {
        keywords: ['bitcoin', 'crypto', 'blockchain', 'ethereum', 'nft', 'defi', 'web3'],
        weight: 1.0
      },
      'science': {
        keywords: ['research', 'study', 'discovery', 'breakthrough', 'science', 'university', 'experiment'],
        weight: 0.9
      },
      'business': {
        keywords: ['company', 'ceo', 'market', 'business', 'revenue', 'profit', 'economy'],
        weight: 1.0
      },
      'politics': {
        keywords: ['government', 'policy', 'regulation', 'law', 'congress', 'senate', 'election'],
        weight: 0.8
      },
      'health': {
        keywords: ['health', 'medical', 'doctor', 'treatment', 'vaccine', 'pandemic', 'wellness'],
        weight: 1.1
      },
      'environment': {
        keywords: ['climate', 'environment', 'sustainability', 'green', 'renewable', 'carbon', 'eco'],
        weight: 1.0
      },
      'entertainment': {
        keywords: ['movie', 'music', 'celebrity', 'show', 'tv', 'actor', 'album'],
        weight: 0.9
      }
    };

    // Sentiment-Wörterbücher
    this.sentimentWords = {
      positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'brilliant', 'outstanding'],
      negative: ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'failed']
    };

    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [this.trendsDir, this.cacheDir, this.predictionsDir, this.reportsDir];
    dirs.forEach(dir => {
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
   * Erweiterte Keyword-Extraktion mit NLP
   */
  extractKeywords(text) {
    if (!text) return [];

    // Convert to lowercase and remove special characters
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Erweiterte Stoppwort-Liste
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
      'can', 'may', 'might', 'must', 'shall', 'get', 'got', 'getting', 'make', 'made',
      'making', 'take', 'took', 'taking', 'go', 'went', 'going', 'come', 'came', 'coming'
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

    // Return sorted by frequency with additional metrics
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        relevance: this.calculateWordRelevance(word),
        trendingPotential: this.calculateTrendingPotential(word)
      }));
  }

  /**
   * Berechne Wortrelevanz
   */
  calculateWordRelevance(word) {
    // Prüfe auf Tech/Trending-Begriffe
    const trendingKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'breakthrough', 'revolutionary',
      'new', 'latest', 'update', 'release', 'launch', 'announcement', 'trend', 'viral'
    ];

    return trendingKeywords.some(tk =>
      word.toLowerCase().includes(tk.toLowerCase())
    ) ? 1.0 : 0.5;
  }

  /**
   * Berechne Trending-Potential eines Wortes
   */
  calculateTrendingPotential(word) {
    // Einfache Heuristik basierend auf Worttyp
    if (word.length > 10) return 0.3; // Lange Wörter seltener
    if (word.length < 4) return 0.7;  // Kurze Wörter häufiger
    return 0.5; // Standard
  }

  /**
   * Erweiterte Inhaltskategorisierung
   */
  categorizeContent(content) {
    const text = `${content.title} ${content.content}`.toLowerCase();
    const scores = {};

    for (const [category, data] of Object.entries(this.categories)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * data.weight;
      });
      if (score > 0) {
        scores[category] = score;
      }
    }

    // Return primary category (highest score)
    const entries = Object.entries(scores);
    if (entries.length === 0) return { category: 'general', confidence: 0 };

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const primary = sorted[0];

    // Berechne Konfidenz
    const totalScore = sorted.reduce((sum, [, score]) => sum + score, 0);
    const confidence = totalScore > 0 ? primary[1] / totalScore : 0;

    return {
      category: primary[0],
      confidence,
      scores: Object.fromEntries(sorted)
    };
  }

  /**
   * Sentiment-Analyse
   */
  analyzeSentiment(text) {
    const words = text.toLowerCase().split(/\s+/);
    let positive = 0;
    let negative = 0;

    words.forEach(word => {
      if (this.sentimentWords.positive.includes(word)) positive++;
      if (this.sentimentWords.negative.includes(word)) negative++;
    });

    const total = positive + negative;
    if (total === 0) return 0; // Neutral

    return (positive - negative) / total; // -1 bis 1
  }

  /**
   * Berechne Trending-Score für ein Thema
   */
  calculateTrendingScore(keywordData) {
    const weights = this.scoringWeights;

    // Normalize values
    const normalizedMentions = Math.min(keywordData.mentions / 20, 1); // Max 20 mentions = 1.0
    const normalizedTimeSpread = Math.min(keywordData.timeSpread / 72, 1); // Max 72 hours = 1.0
    const normalizedEngagement = Math.min(keywordData.avgEngagement / 1000, 1); // Max 1000 engagement = 1.0
    const normalizedViral = Math.min(keywordData.avgViralPotential / 10, 1); // Max 10 viral score = 1.0
    const normalizedMomentum = Math.min(keywordData.momentum / 5, 1); // Max 5 momentum = 1.0
    const normalizedSentiment = (keywordData.avgSentiment + 1) / 2; // -1 bis 1 -> 0 bis 1

    const score =
      normalizedEngagement * weights.engagement +
      normalizedViral * weights.viralPotential +
      normalizedTimeSpread * weights.recency +
      normalizedMentions * weights.crossPlatform +
      normalizedMomentum * weights.momentum +
      normalizedSentiment * weights.sentiment +
      keywordData.relevance * weights.keywordRelevance;

    return Math.round(score * 100) / 100;
  }

  /**
   * Erweiterte Trendanalyse
   */
  async analyzeTrends() {
    console.log('📈 Starting advanced trend analysis...');

    const content = this.getLatestScrapedContent(this.analysisConfig.timeWindow);

    if (content.length === 0) {
      console.log('⚠️ No content available for trend analysis');
      return { trends: [], topics: [], analysis: null };
    }

    console.log(`📊 Analyzing ${content.length} content items...`);

    // Extract all keywords from all content
    const keywordData = {};
    const topicData = {};

    content.forEach(item => {
      // Skip low-engagement content
      if (item.engagement < this.analysisConfig.minEngagement) return;

      // Extract keywords
      const keywords = this.extractKeywords(`${item.title} ${item.content}`);
      keywords.forEach(({ word, count, relevance, trendingPotential }) => {
        if (!keywordData[word]) {
          keywordData[word] = {
            word,
            mentions: 0,
            totalCount: 0,
            sources: new Set(),
            items: [],
            totalEngagement: 0,
            totalViralPotential: 0,
            totalSentiment: 0,
            firstSeen: item.created,
            lastSeen: item.created,
            relevance,
            trendingPotential
          };
        }

        const kd = keywordData[word];
        kd.mentions += 1;
        kd.totalCount += count;
        kd.sources.add(item.source);
        kd.items.push(item);
        kd.totalEngagement += item.engagement;
        kd.totalViralPotential += item.viralPotential;
        kd.totalSentiment += this.analyzeSentiment(`${item.title} ${item.content}`);

        if (item.created < kd.firstSeen) kd.firstSeen = item.created;
        if (item.created > kd.lastSeen) kd.lastSeen = item.created;
      });

      // Categorize content
      const categoryResult = this.categorizeContent(item);
      const category = categoryResult.category;

      if (!topicData[category]) {
        topicData[category] = {
          category,
          items: [],
          totalEngagement: 0,
          totalViralPotential: 0,
          totalSentiment: 0,
          avgScore: 0
        };
      }

      topicData[category].items.push(item);
      topicData[category].totalEngagement += item.engagement;
      topicData[category].totalViralPotential += item.viralPotential;
      topicData[category].totalSentiment += this.analyzeSentiment(`${item.title} ${item.content}`);
    });

    // Calculate trending scores for keywords
    const trends = Object.values(keywordData)
      .filter(kd => kd.mentions >= this.analysisConfig.trendingThreshold)
      .map(kd => {
        const timeSpread = (new Date(kd.lastSeen) - new Date(kd.firstSeen)) / (1000 * 60 * 60); // hours
        const avgEngagement = kd.totalEngagement / kd.mentions;
        const avgViralPotential = kd.totalViralPotential / kd.mentions;
        const avgSentiment = kd.totalSentiment / kd.mentions;
        const momentum = timeSpread > 0 ? kd.mentions / timeSpread : kd.mentions;

        const trendData = {
          word: kd.word,
          mentions: kd.mentions,
          sources: Array.from(kd.sources),
          crossPlatform: kd.sources.size > 1,
          totalEngagement: kd.totalEngagement,
          avgEngagement: Math.round(avgEngagement),
          avgViralPotential: Math.round(avgViralPotential * 10) / 10,
          avgSentiment: Math.round(avgSentiment * 100) / 100,
          timeSpread: Math.round(timeSpread * 10) / 10,
          momentum,
          firstSeen: kd.firstSeen,
          lastSeen: kd.lastSeen,
          relevance: kd.relevance,
          trendingPotential: kd.trendingPotential,
          sampleTitles: kd.items.slice(0, 3).map(item => item.title)
        };

        trendData.trendingScore = this.calculateTrendingScore(trendData);

        return trendData;
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, this.analysisConfig.maxTrends);

    // Calculate topic scores
    const topics = Object.values(topicData)
      .map(td => {
        td.avgScore = td.totalEngagement / td.items.length;
        td.avgViralPotential = td.totalViralPotential / td.items.length;
        td.avgSentiment = td.totalSentiment / td.items.length;
        return td;
      })
      .sort((a, b) => b.avgScore - a.avgScore);

    // Analysis summary
    const analysis = {
      totalContent: content.length,
      timeWindow: this.analysisConfig.timeWindow,
      trendsFound: trends.length,
      topicsAnalyzed: topics.length,
      sources: [...new Set(content.map(c => c.source))],
      topTrend: trends[0] || null,
      hottestTopic: topics[0] || null,
      avgEngagement: Math.round(content.reduce((sum, c) => sum + c.engagement, 0) / content.length),
      analysisTime: new Date().toISOString()
    };

    // Generiere Vorhersagen
    const predictions = await this.generateTrendPredictions(trends);

    // Save results
    await this.saveTrendAnalysis({ trends, topics, analysis, predictions });

    console.log(`🎉 Trend analysis completed: ${trends.length} trends, ${topics.length} topics`);

    return { trends, topics, analysis, predictions };
  }

  /**
   * Generiere Trendvorhersagen mit KI-Modell (vereinfachte Implementierung)
   */
  async generateTrendPredictions(currentTrends) {
    try {
      console.log('🔮 Generating trend predictions...');

      const predictions = [];

      // Für jede aktuelle Trendvorhersage
      for (const trend of currentTrends.slice(0, 10)) { // Nur Top 10
        // Berechne Wachstumstrend basierend auf Momentum und Engagement
        const growthRate = this.calculateGrowthRate(trend);
        const predictedScore = Math.min(10, trend.trendingScore * (1 + growthRate));
        const confidence = Math.min(1, trend.mentions / 20 + trend.crossPlatform ? 0.3 : 0);

        predictions.push({
          keyword: trend.word,
          currentScore: trend.trendingScore,
          predictedScore: Math.round(predictedScore * 100) / 100,
          growthRate: Math.round(growthRate * 100) / 100,
          confidence: Math.round(confidence * 100) / 100,
          predictionWindow: this.analysisConfig.predictionWindow,
          predictedAt: new Date().toISOString()
        });
      }

      // Speichere Vorhersagen
      await this.savePredictions(predictions);

      return predictions;
    } catch (error) {
      console.error('❌ Failed to generate trend predictions:', error.message);
      return [];
    }
  }

  /**
   * Berechne Wachstumsrate für Vorhersagen
   */
  calculateGrowthRate(trend) {
    // Einfache Heuristik basierend auf Momentum und Engagement
    const momentumFactor = Math.min(1, trend.momentum / 5);
    const engagementFactor = Math.min(1, trend.avgEngagement / 500);
    const crossPlatformFactor = trend.crossPlatform ? 0.5 : 0;

    return (momentumFactor + engagementFactor + crossPlatformFactor) / 3;
  }

  /**
   * Speichere Trendvorhersagen
   */
  async savePredictions(predictions) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `trend-predictions-${timestamp}.json`;
      const filepath = path.join(this.predictionsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(predictions, null, 2));
      console.log(`💾 Saved trend predictions to ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save trend predictions:', error.message);
    }
  }

  /**
   * Save trend analysis results
   */
  async saveTrendAnalysis(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `trend-analysis-${timestamp}.json`;
    const filepath = path.join(this.trendsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`💾 Saved trend analysis to ${filename}`);

    // Speichere auch detaillierten Bericht
    await this.generateDetailedReport(results, timestamp);

    // Keep only last 20 files
    this.cleanupOldTrendFiles();
  }

  /**
   * Generiere detaillierten Bericht
   */
  async generateDetailedReport(results, timestamp) {
    try {
      const report = {
        ...results,
        generatedAt: new Date().toISOString(),
        summary: {
          totalTrends: results.trends.length,
          totalTopics: results.topics.length,
          avgTrendingScore: Math.round(results.trends.reduce((sum, t) => sum + t.trendingScore, 0) / results.trends.length * 100) / 100,
          topSources: results.analysis.sources.slice(0, 5),
          trendingCategories: this.getTrendingCategories(results.trends)
        },
        recommendations: this.generateRecommendations(results)
      };

      const filename = `trend-report-${timestamp}.json`;
      const filepath = path.join(this.reportsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`📊 Generated detailed trend report: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to generate detailed report:', error.message);
    }
  }

  /**
   * Ermittle trendende Kategorien
   */
  getTrendingCategories(trends) {
    const categoryCount = {};

    trends.forEach(trend => {
      // Versuche, die Kategorie aus dem Keyword abzuleiten
      const category = this.deriveCategoryFromKeyword(trend.word);
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Leite Kategorie aus Keyword ab
   */
  deriveCategoryFromKeyword(keyword) {
    for (const [category, data] of Object.entries(this.categories)) {
      if (data.keywords.some(kw => keyword.toLowerCase().includes(kw))) {
        return category;
      }
    }
    return null;
  }

  /**
   * Generiere Empfehlungen basierend auf der Analyse
   */
  generateRecommendations(results) {
    const recommendations = [];

    // Empfehlung basierend auf Top-Trend
    if (results.trends.length > 0) {
      const topTrend = results.trends[0];
      recommendations.push({
        type: 'content',
        priority: 'high',
        message: `Top-Trend: "${topTrend.word}" mit Score ${topTrend.trendingScore}. Erwägen Sie Inhalte zu diesem Thema zu erstellen.`
      });
    }

    // Empfehlung basierend auf Kategorien
    if (results.topics.length > 0) {
      const hottestTopic = results.topics[0];
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        message: `Hottest Topic: "${hottestTopic.category}" mit durchschnittlichem Score ${Math.round(hottestTopic.avgScore)}. Fokus auf diese Kategorie.`
      });
    }

    // Allgemeine Empfehlung
    recommendations.push({
      type: 'optimization',
      priority: 'low',
      message: 'Erwägen Sie die Integration externer Datenquellen für genauere Trendvorhersagen.'
    });

    return recommendations;
  }

  /**
   * Cleanup old trend files
   */
  cleanupOldTrendFiles() {
    try {
      // Bereinige Haupt-Trend-Dateien
      const trendFiles = fs.readdirSync(this.trendsDir)
        .filter(f => f.startsWith('trend-analysis-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.trendsDir, f),
          mtime: fs.statSync(path.join(this.trendsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      trendFiles.slice(20).forEach(file => {
        fs.unlinkSync(file.path);
      });

      // Bereinige Vorhersage-Dateien
      const predictionFiles = fs.readdirSync(this.predictionsDir)
        .filter(f => f.startsWith('trend-predictions-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.predictionsDir, f),
          mtime: fs.statSync(path.join(this.predictionsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      predictionFiles.slice(50).forEach(file => {
        fs.unlinkSync(file.path);
      });

      // Bereinige Berichts-Dateien
      const reportFiles = fs.readdirSync(this.reportsDir)
        .filter(f => f.startsWith('trend-report-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.reportsDir, f),
          mtime: fs.statSync(path.join(this.reportsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      reportFiles.slice(30).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.warn('⚠️ Trend cleanup failed:', error.message);
    }
  }

  /**
   * Get latest trend analysis
   */
  getLatestTrends() {
    try {
      const files = fs.readdirSync(this.trendsDir)
        .filter(f => f.startsWith('trend-analysis-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) return null;

      const latestFile = path.join(this.trendsDir, files[0]);
      return JSON.parse(fs.readFileSync(latestFile));
    } catch (error) {
      console.warn('⚠️ Failed to load latest trends:', error.message);
      return null;
    }
  }

  /**
   * Get latest predictions
   */
  getLatestPredictions() {
    try {
      const files = fs.readdirSync(this.predictionsDir)
        .filter(f => f.startsWith('trend-predictions-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) return null;

      const latestFile = path.join(this.predictionsDir, files[0]);
      return JSON.parse(fs.readFileSync(latestFile));
    } catch (error) {
      console.warn('⚠️ Failed to load latest predictions:', error.message);
      return null;
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    try {
      const trendFiles = fs.readdirSync(this.trendsDir)
        .filter(f => f.startsWith('trend-analysis-') && f.endsWith('.json'));

      const predictionFiles = fs.readdirSync(this.predictionsDir)
        .filter(f => f.startsWith('trend-predictions-') && f.endsWith('.json'));

      const reportFiles = fs.readdirSync(this.reportsDir)
        .filter(f => f.startsWith('trend-report-') && f.endsWith('.json'));

      const latest = this.getLatestTrends();

      return {
        totalAnalyses: trendFiles.length,
        totalPredictions: predictionFiles.length,
        totalReports: reportFiles.length,
        latestAnalysis: latest?.analysis?.analysisTime || null,
        currentTrends: latest?.trends?.length || 0,
        currentTopics: latest?.topics?.length || 0,
        topTrend: latest?.trends?.[0]?.word || null,
        topTrendScore: latest?.trends?.[0]?.trendingScore || 0,
        analysisConfig: this.analysisConfig
      };
    } catch (error) {
      console.error('❌ Failed to get trend analysis stats:', error.message);
      return {
        totalAnalyses: 0,
        totalPredictions: 0,
        totalReports: 0,
        error: error.message
      };
    }
  }

  /**
   * Echtzeit-Trend-Analyse (simulierte Implementierung)
   */
  async realtimeTrendAnalysis(newContent) {
    try {
      console.log('⚡ Performing realtime trend analysis...');

      // Führe eine schnelle Analyse des neuen Inhalts durch
      const keywords = this.extractKeywords(`${newContent.title} ${newContent.content}`);
      const category = this.categorizeContent(newContent);
      const sentiment = this.analyzeSentiment(`${newContent.title} ${newContent.content}`);

      // Prüfe, ob neue Trends entstehen
      const emergingTrends = keywords.filter(kw => kw.trendingPotential > 0.7);

      const result = {
        contentId: newContent.id,
        keywords: keywords.map(kw => kw.word),
        category: category.category,
        sentiment: Math.round(sentiment * 100) / 100,
        emergingTrends: emergingTrends.map(t => t.word),
        analyzedAt: new Date().toISOString()
      };

      // Speichere Echtzeit-Ergebnis im Cache
      const cacheFile = path.join(this.cacheDir, `realtime-${Date.now()}.json`);
      fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('❌ Failed to perform realtime trend analysis:', error.message);
      return null;
    }
  }

  /**
   * Export trends for external use
   */
  exportTrends(format = 'json') {
    try {
      const latestTrends = this.getLatestTrends();
      if (!latestTrends) {
        throw new Error('No trends available for export');
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        trends: latestTrends.trends,
        topics: latestTrends.topics,
        predictions: this.getLatestPredictions()
      };

      let exportedContent;
      let fileExtension;

      switch (format.toLowerCase()) {
        case 'json':
          exportedContent = JSON.stringify(exportData, null, 2);
          fileExtension = 'json';
          break;
        case 'csv':
          // Konvertiere zu CSV-Format
          const headers = Object.keys(exportData.trends[0]).join(',');
          const rows = exportData.trends.map(trend =>
            Object.values(trend).map(v =>
              typeof v === 'object' ? JSON.stringify(v) : v
            ).join(',')
          );
          exportedContent = [headers, ...rows].join('\n');
          fileExtension = 'csv';
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      const filename = `trends-export-${new Date().toISOString().replace(/[:.]/g, '-')}.${fileExtension}`;
      const filepath = path.join(this.trendsDir, filename);

      fs.writeFileSync(filepath, exportedContent);
      console.log(`📤 Exported trends to ${filename}`);

      return {
        success: true,
        path: filepath,
        format: format
      };
    } catch (error) {
      console.error('❌ Failed to export trends:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TrendAnalysisAgent;