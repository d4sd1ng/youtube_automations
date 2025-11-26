const LLMService = require('./llmService');

class TextAnalysisService {
  constructor() {
    this.llmService = new LLMService();

    // Notification systems
    this.notificationChannels = {
      discord: process.env.DISCORD_WEBHOOK || null,
      telegram: process.env.TELEGRAM_BOT_TOKEN || null,
      webhook: process.env.WEBHOOK_URL || null,
      slack: process.env.SLACK_WEBHOOK || null
    };

    this.initializeNotificationSystems();
  }

  /**
   * Initialize notification systems
   */
  initializeNotificationSystems() {
    console.log('🔔 Initializing notification systems...');
    this.notificationSystems = {
      discord: !!this.notificationChannels.discord,
      telegram: !!this.notificationChannels.telegram,
      webhook: !!this.notificationChannels.webhook,
      slack: !!this.notificationChannels.slack
    };
    console.log('✅ Notification systems initialized');
  }

  /**
   * Send notification
   */
  async sendNotification(message, level = 'info') {
    // In a real implementation, this would send notifications through various channels
    console.log(`[${level.toUpperCase()}] ${message}`);

    // Discord notification
    if (this.notificationSystems.discord && this.notificationChannels.discord) {
      console.log(`📤 Discord notification: ${message}`);
    }

    // Telegram notification
    if (this.notificationSystems.telegram && this.notificationChannels.telegram) {
      console.log(`📤 Telegram notification: ${message}`);
    }

    // Webhook notification
    if (this.notificationSystems.webhook && this.notificationChannels.webhook) {
      console.log(`📤 Webhook notification: ${message}`);
    }

    // Slack notification
    if (this.notificationSystems.slack && this.notificationChannels.slack) {
      console.log(`📤 Slack notification: ${message}`);
    }
  }

  /**
   * Analyze text and extract key points with AI
   * @param {string} text - Text to analyze
   * @param {object} options - Analysis options
   * @returns {Promise<object>} - Analysis result
   */
  async analyzeText(text, options = {}) {
    try {
      console.log('🔍 Starting text analysis...');

      // Send notification about analysis start
      await this.sendNotification(`Starting text analysis (${text.length} characters)`, 'info');

      // Validate input
      if (!text || text.trim().length < 10) {
        throw new Error('Text too short for meaningful analysis');
      }

      // Prepare analysis parameters
      const analysisType = options.type || 'comprehensive';
      const language = options.language || 'de';
      const maxKeyPoints = options.maxKeyPoints || 8;

      // Generate analysis prompt
      const prompt = this.buildAnalysisPrompt(text, {
        type: analysisType,
        language,
        maxKeyPoints,
        includeStructure: options.includeStructure !== false,
        includeSummary: options.includeSummary !== false,
        includeActionItems: options.includeActionItems === true,
        includeSentiment: options.includeSentiment === true,
        includeEntities: options.includeEntities === true
      });

      // Get AI analysis
      const aiResponse = await this.llmService.generateContent(
        'Text Analysis',
        'analysis',
        { prompt }
      );

      // Parse and structure the response
      const analysis = this.parseAnalysisResponse(aiResponse.content);

      // Send notification about successful completion
      await this.sendNotification(`Text analysis completed - ${analysis.keyPoints.length} key points extracted`, 'success');

      return {
        success: true,
        originalText: {
          length: text.length,
          wordCount: this.countWords(text),
          estimatedReadingTime: this.calculateReadingTime(text)
        },
        analysis: {
          ...analysis,
          confidence: aiResponse.confidence || 0.85,
          provider: aiResponse.provider,
          model: aiResponse.model
        },
        metadata: {
          analysisType,
          language,
          timestamp: new Date().toISOString(),
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('❌ Text analysis failed:', error);
      await this.sendNotification(`Text analysis failed - ${error.message}`, 'error');
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Build AI prompt for text analysis
   * @param {string} text - Text to analyze
   * @param {object} options - Analysis options
   * @returns {string} - Analysis prompt
   */
  buildAnalysisPrompt(text, options) {
    const { type, language, maxKeyPoints, includeStructure, includeSummary, includeActionItems, includeSentiment, includeEntities } = options;

    let prompt = `Analysiere folgenden Text und extrahiere die wichtigsten Informationen:

TEXT:
"""
${text}
"""

AUFGABEN:
1. **Hauptpunkte** (max. ${maxKeyPoints}): Identifiziere die wichtigsten Kernaussagen, Themen oder Argumente
2. **Kategorisierung**: Ordne die Hauptpunkte thematischen Kategorien zu`;

    if (includeSummary) {
      prompt += `
3. **Zusammenfassung**: Erstelle eine prägnante Zusammenfassung (2-3 Sätze)`;
    }

    if (includeStructure) {
      prompt += `
4. **Struktur**: Analysiere die logische Struktur und den Aufbau des Textes`;
    }

    if (includeActionItems) {
      prompt += `
5. **Handlungsempfehlungen**: Leite konkrete Handlungsschritte oder Empfehlungen ab`;
    }

    if (includeSentiment) {
      prompt += `
6. **Stimmungsanalyse**: Analysiere die emotionale Stimmung des Textes (positiv, negativ, neutral)`;
    }

    if (includeEntities) {
      prompt += `
7. **Entitäten-Erkennung**: Identifiziere wichtige Personen, Orte, Organisationen und Konzepte`;
    }

    prompt += `

ANTWORT-FORMAT (JSON):
{
  "keyPoints": [
    {
      "title": "Hauptpunkt 1",
      "description": "Detaillierte Beschreibung",
      "category": "Kategorie",
      "importance": "hoch/mittel/niedrig",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "summary": "Kurze Zusammenfassung des gesamten Inhalts",
  "categories": {
    "kategorie1": ["punkt1", "punkt2"],
    "kategorie2": ["punkt3", "punkt4"]
  },
  "structure": {
    "type": "argumentativ/informativ/erzählend",
    "flow": "Beschreibung der logischen Struktur"
  }`;

    if (includeActionItems) {
      prompt += `,
  "actionItems": [
    {
      "action": "Handlungsempfehlung",
      "priority": "hoch/mittel/niedrig",
      "timeframe": "sofort/kurz-/mittelfristig"
    }
  ]`;
    }

    if (includeSentiment) {
      prompt += `,
  "sentiment": {
    "overall": "positiv/negativ/neutral",
    "score": 0.7,
    "explanation": "Begründung für die Stimmungseinschätzung"
  }`;
    }

    if (includeEntities) {
      prompt += `,
  "entities": [
    {
      "name": "Entität",
      "type": "person/location/organization/concept",
      "relevance": "hoch/mittel/niedrig"
    }
  ]`;
    }

    prompt += `
}

Antworte nur mit gültigem JSON, ohne zusätzliche Erklärungen.`;

    return prompt;
  }

  /**
   * Parse AI analysis response
   * @param {string} response - AI response text
   * @returns {object} - Parsed analysis
   */
  parseAnalysisResponse(response) {
    try {
      // Clean response (remove markdown formatting if present)
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanResponse);

      // Validate and enhance the parsed response
      return {
        keyPoints: this.validateKeyPoints(parsed.keyPoints || []),
        summary: parsed.summary || 'Zusammenfassung nicht verfügbar',
        categories: parsed.categories || {},
        structure: parsed.structure || { type: 'unbekannt', flow: 'Struktur nicht erkannt' },
        actionItems: parsed.actionItems || [],
        sentiment: parsed.sentiment || { overall: 'neutral', score: 0.0, explanation: 'Nicht analysiert' },
        entities: parsed.entities || [],
        insights: this.generateInsights(parsed)
      };

    } catch (error) {
      console.error('❌ Failed to parse analysis response:', error);

      // Fallback: Extract key information manually
      return this.fallbackAnalysis(response);
    }
  }

  /**
   * Validate and enhance key points
   * @param {Array} keyPoints - Raw key points from AI
   * @returns {Array} - Validated key points
   */
  validateKeyPoints(keyPoints) {
    return keyPoints.map((point, index) => ({
      id: `point_${index + 1}`,
      title: point.title || `Hauptpunkt ${index + 1}`,
      description: point.description || '',
      category: point.category || 'Allgemein',
      importance: ['hoch', 'mittel', 'niedrig'].includes(point.importance) ? point.importance : 'mittel',
      keywords: Array.isArray(point.keywords) ? point.keywords : [],
      position: index + 1
    }));
  }

  /**
   * Generate additional insights from analysis
   * @param {object} analysis - Parsed analysis
   * @returns {object} - Generated insights
   */
  generateInsights(analysis) {
    const keyPoints = analysis.keyPoints || [];
    const categories = Object.keys(analysis.categories || {});
    const entities = analysis.entities || [];
    const sentiment = analysis.sentiment || { overall: 'neutral', score: 0.0 };

    return {
      complexity: keyPoints.length > 6 ? 'hoch' : keyPoints.length > 3 ? 'mittel' : 'niedrig',
      mainCategory: categories.length > 0 ? categories[0] : 'Allgemein',
      topicDiversity: categories.length,
      entityCount: entities.length,
      sentiment: sentiment.overall,
      sentimentScore: sentiment.score,
      priorityDistribution: {
        high: keyPoints.filter(p => p.importance === 'hoch').length,
        medium: keyPoints.filter(p => p.importance === 'mittel').length,
        low: keyPoints.filter(p => p.importance === 'niedrig').length
      }
    };
  }

  /**
   * Fallback analysis when JSON parsing fails
   * @param {string} response - AI response text
   * @returns {object} - Fallback analysis
   */
  fallbackAnalysis(response) {
    // Extract key points using text patterns
    const lines = response.split('\n').filter(line => line.trim());
    const keyPoints = [];

    lines.forEach((line, index) => {
      if (line.includes('•') || line.includes('-') || line.match(/^\d+\./)) {
        keyPoints.push({
          id: `point_${keyPoints.length + 1}`,
          title: `Punkt ${keyPoints.length + 1}`,
          description: line.replace(/^[•\-\d\.]\s*/, '').trim(),
          category: 'Allgemein',
          importance: 'mittel',
          keywords: [],
          position: keyPoints.length + 1
        });
      }
    });

    return {
      keyPoints: keyPoints.slice(0, 8), // Limit to 8 points
      summary: response.split('\n').slice(0, 3).join(' ').substring(0, 200) + '...',
      categories: { 'Allgemein': keyPoints.map(p => p.title) },
      structure: { type: 'unbekannt', flow: 'Automatische Extraktion' },
      actionItems: [],
      sentiment: { overall: 'neutral', score: 0.0, explanation: 'Automatische Extraktion' },
      entities: [],
      insights: {
        complexity: 'unbekannt',
        mainCategory: 'Allgemein',
        topicDiversity: 1,
        entityCount: 0,
        sentiment: 'neutral',
        sentimentScore: 0.0,
        priorityDistribution: { high: 0, medium: keyPoints.length, low: 0 }
      }
    };
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} - Word count
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate estimated reading time
   * @param {string} text - Text to analyze
   * @returns {number} - Reading time in minutes
   */
  calculateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.countWords(text);
    return Math.max(1, Math.round(wordCount / wordsPerMinute));
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to analyze
   * @param {number} maxKeywords - Maximum number of keywords
   * @returns {Promise<Array>} - Extracted keywords
   */
  async extractKeywords(text, maxKeywords = 10) {
    const prompt = `Extrahiere die ${maxKeywords} wichtigsten Schlagworte aus folgendem Text:

TEXT: "${text}"

Antworte nur mit einer kommagetrennten Liste von Schlagworten, ohne Erklärungen.`;

    try {
      const response = await this.llmService.generateContent('Keywords', 'analysis', { prompt });
      const keywords = response.content
        .split(',')
        .map(keyword => keyword.trim().toLowerCase())
        .filter(keyword => keyword.length > 2)
        .slice(0, maxKeywords);

      return keywords;
    } catch (error) {
      console.error('❌ Keyword extraction failed:', error);
      return [];
    }
  }

  /**
   * Perform sentiment analysis on text
   * @param {string} text - Text to analyze
   * @returns {Promise<object>} - Sentiment analysis result
   */
  async analyzeSentiment(text) {
    const prompt = `Analysiere die emotionale Stimmung des folgenden Textes:

TEXT: "${text}"

ANTWORT-FORMAT (JSON):
{
  "overall": "positiv/negativ/neutral",
  "score": 0.7,
  "explanation": "Begründung für die Stimmungseinschätzung",
  "keyEmotions": ["freude", "wut", "trauer", "angst", "überraschung", "ekel"]
}

Antworte nur mit gültigem JSON, ohne zusätzliche Erklärungen.`;

    try {
      const response = await this.llmService.generateContent('Sentiment Analysis', 'analysis', { prompt });

      try {
        let cleanResponse = response.content.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse sentiment response:', parseError);
        return {
          overall: 'neutral',
          score: 0.0,
          explanation: 'Analyse fehlgeschlagen',
          keyEmotions: []
        };
      }
    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error);
      return {
        overall: 'neutral',
        score: 0.0,
        explanation: 'Analyse fehlgeschlagen: ' + error.message,
        keyEmotions: []
      };
    }
  }

  /**
   * Extract entities from text
   * @param {string} text - Text to analyze
   * @returns {Promise<Array>} - Extracted entities
   */
  async extractEntities(text) {
    const prompt = `Identifiziere wichtige Personen, Orte, Organisationen und Konzepte im folgenden Text:

TEXT: "${text}"

ANTWORT-FORMAT (JSON):
[
  {
    "name": "Entität",
    "type": "person/location/organization/concept",
    "relevance": "hoch/mittel/niedrig"
  }
]

Antworte nur mit gültigem JSON, ohne zusätzliche Erklärungen.`;

    try {
      const response = await this.llmService.generateContent('Entity Recognition', 'analysis', { prompt });

      try {
        let cleanResponse = response.content.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse entities response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('❌ Entity extraction failed:', error);
      return [];
    }
  }

  /**
   * Get analysis statistics
   * @returns {object} - Service statistics
   */
  getStats() {
    return {
      service: 'TextAnalysisService',
      supportedLanguages: ['de', 'en'],
      maxTextLength: 50000,
      defaultKeyPoints: 8,
      notificationSystems: this.notificationSystems,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TextAnalysisService;