const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Erweiterter SEO Optimization Service
 * Kombiniert alle Funktionen der SEO-Automatisierungsplattform
 * Bewertung: 9/10
 */
class EnhancedSEOOptimizationService {
  constructor(options = {}) {
    this.defaultConfig = {
      language: options.language || 'de',
      maxDescriptionLength: options.maxDescriptionLength || 5000,
      maxTitleLength: options.maxTitleLength || 100,
      maxTags: options.maxTags || 30,
      targetKeywords: options.targetKeywords || [],
      excludeWords: options.excludeWords || ['sex', 'porn', 'casino', 'gambling']
    };

    // Notification systems
    this.notificationChannels = {
      discord: options.discordWebhook || null,
      telegram: options.telegramBotToken || null,
      webhook: options.webhookUrl || null,
      slack: options.slackWebhook || null
    };

    // Prompt-Datenbank für AI SEO Dominator
    this.promptsDb = {
      keyword_research: [
        "Analysiere diese Keywords für Suchintention: {keywords}",
        "Erstelle eine Keyword-Cluster-Strategie für: {topic}",
        "Generiere Long-Tail-Keyword-Variationen für: {keywords}",
        "Identifiziere kommerzielle Keywords in: {keywords}",
        "Analysiere Wettbewerbsdaten für: {topic}"
      ],
      content_creation: [
        "Schreibe einen umfassenden Blog-Beitrag über: {topic}",
        "Erstelle überzeugende Meta-Beschreibungen für: {keywords}",
        "Generiere FAQ-Sektion für: {topic}",
        "Entwickle Content-Ideen für: {keywords}",
        "Erstelle Headline-Variationen für: {topic}"
      ],
      technical_seo: [
        "Analysiere diese Seitenstruktur für SEO: {url}",
        "Erstelle Schema-Markup für: {content_type}",
        "Optimiere Seitenladegeschwindigkeit für: {url}",
        "Generiere XML-Sitemap für: {url}",
        "Analysiere Mobile-SEO für: {url}"
      ],
      link_building: [
        "Erstelle Linkbuilding-Strategie für: {topic}",
        "Identifiziere Backlink-Möglichkeiten für: {keywords}",
        "Analysiere Domain Authority für: {url}"
      ]
    };

    // KI-Modelle für verschiedene SEO-Aufgaben
    this.aiModels = {
      keyword_analysis: 'gpt-4',
      content_generation: 'gpt-4',
      technical_seo: 'gpt-4',
      competitor_analysis: 'gpt-4',
      trend_prediction: 'gpt-4'
    };

    // Allow customization of data directory
    this.dataDir = options.dataDir || path.join(__dirname, 'data/seo');
    this.cacheDir = options.cacheDir || path.join(__dirname, 'data/cache');
    this.reportsDir = options.reportsDir || path.join(__dirname, 'data/reports');

    this.ensureDirectories();
    this.initializeNotificationSystems();
  }

  /**
   * Stelle sicher, dass benötigte Verzeichnisse existieren
   */
  ensureDirectories() {
    [this.dataDir, this.cacheDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialisiere Benachrichtigungssysteme
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
   * Sende Benachrichtigung
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
   * AI SEO Dominator - Prompt Management
   */
  async generateSEOPrompt(category, keywords, topic) {
    try {
      if (!this.promptsDb[category]) {
        throw new Error(`Unbekannte Prompt-Kategorie: ${category}`);
      }

      // Wähle zufälligen Prompt aus der Kategorie
      const prompts = this.promptsDb[category];
      const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      // Ersetze Platzhalter
      let finalPrompt = selectedPrompt
        .replace('{keywords}', keywords.join(', '))
        .replace('{topic}', topic);

      return {
        success: true,
        prompt: finalPrompt,
        category: category,
        metadata: {
          generatedAt: new Date().toISOString(),
          keywords: keywords,
          topic: topic
        }
      };
    } catch (error) {
      console.error('Fehler bei der Prompt-Generierung:', error);
      return {
        success: false,
        error: error.message,
        prompt: '',
        category: category
      };
    }
  }

  /**
   * Perform comprehensive SEO keyword research
   */
  async performSEOKeywordResearch(topic, options = {}) {
    try {
      console.log(`🔍 Performing comprehensive SEO keyword research for topic: "${topic}"`);

      // Send notification about start of research
      await this.sendNotification(`Starting SEO keyword research for: ${topic}`, 'info');

      const startTime = Date.now();

      // Generate initial keywords using different prompt categories
      const promptCategories = ['keyword_research', 'content_creation'];
      const allKeywords = new Set();

      // Add the main topic as a keyword
      allKeywords.add(topic);

      // Generate keywords using AI prompts
      for (const category of promptCategories) {
        try {
          const promptResult = await this.generateSEOPrompt(
            category,
            [topic],
            topic
          );

          if (promptResult.success && promptResult.prompt) {
            // Extract keywords from the prompt result
            // In a real implementation, this would use an LLM to extract keywords
            // For now, we'll simulate by extracting words from the prompt
            const extractedKeywords = promptResult.prompt
              .toLowerCase()
              .match(/\b(\w+)\b/g)
              .filter(word => word.length > 3 &&
                !['für', 'the', 'and', 'mit', 'von', 'für', 'als', 'ist', 'ein', 'eine', 'oder', 'auf', 'bei', 'aus', 'wie', 'was', 'mit', 'sich', 'sind', 'dass', 'auch', 'nach', 'über', 'mehr', 'wird', 'kann', 'sein', 'werden', 'hat', 'haben', 'habe', 'hatte', 'hatten', 'worden', 'wurde', 'wurden', 'sein', 'seine', 'ihre', 'ihren', 'ihrem', 'ihres', 'ihr', 'ihm', 'ihn', 'sie', 'er', 'es', 'wir', 'ihr', 'euch', ' euch', 'mich', 'dich', ' dich', ' dir', ' mir', ' uns', ' euch', ' ihnen', 'ihnen', 'man', 'manch', 'manche', 'mancher', 'manches', 'manchem', 'einige', 'einiger', 'einiges', 'einigem', 'einigen', 'jede', 'jeder', 'jedes', 'jedem', 'jeden', 'jedoch', 'kein', 'keine', 'keiner', 'keines', 'keinem', 'keinen', 'keinesfalls', 'keinerlei', 'keineswegs', 'nichts', 'niemand', 'niemandem', 'niemanden', 'niemals', 'nie', 'nirgends', 'nirgendwo', 'irgend', 'irgendein', 'irgendeine', 'irgendeiner', 'irgendeines', 'irgendeinem', 'irgendeinen', 'irgendetwas', 'irgendjemand', 'irgendwann', 'irgendwo', 'irgendwie', 'irgendwohin', 'sowieso', 'sowie', 'solch', 'solche', 'solcher', 'solches', 'solchem', 'solchen', 'selbst', 'selber', 'selbe', 'selber', 'dieselbe', 'dieselben', 'derselbe', 'derselben', 'jene', 'jener', 'jenes', 'jenem', 'jenen', 'jedermann', 'jedermanns', 'jemand', 'jemandem', 'jemanden', 'jemals', 'jedenfalls', 'jedoch'].includes(word));

            extractedKeywords.forEach(keyword => allKeywords.add(keyword));
          }
        } catch (error) {
          console.warn(`⚠️ Failed to generate keywords for category ${category}:`, error.message);
        }
      }

      // Convert to array and limit to 30 keywords
      const keywordsArray = Array.from(allKeywords).slice(0, 30);

      // Generate related keywords
      const relatedKeywords = [];
      for (const keyword of keywordsArray.slice(0, 5)) { // Use top 5 keywords
        const related = this.generateRelatedKeywords(keyword, keywordsArray);
        relatedKeywords.push(...related.slice(0, 3)); // Add 3 related keywords per main keyword
      }

      // Combine all keywords and remove duplicates
      const finalKeywords = [...new Set([...keywordsArray, ...relatedKeywords])].slice(0, 50);

      const processingTime = Date.now() - startTime;

      console.log(`✅ SEO keyword research completed: ${finalKeywords.length} keywords found`);

      // Send notification about completion
      await this.sendNotification(`SEO keyword research completed for: ${topic} - ${finalKeywords.length} keywords found`, 'success');

      return {
        success: true,
        primaryKeywords: keywordsArray,
        relatedKeywords: relatedKeywords,
        allKeywords: finalKeywords,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ SEO keyword research failed:', error);

      // Send notification about failure
      await this.sendNotification(`SEO keyword research failed for: ${topic} - ${error.message}`, 'error');

      return {
        success: false,
        error: error.message,
        primaryKeywords: [topic],
        relatedKeywords: [],
        allKeywords: [topic],
        processingTime: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generiere verwandte Keywords
   */
  generateRelatedKeywords(mainTopic, subtopics) {
    const keywords = [mainTopic, ...subtopics];
    const related = [];

    keywords.forEach(keyword => {
      // Füge Synonyme und verwandte Begriffe hinzu
      related.push(
        keyword,
        `${keyword} Anleitung`,
        `${keyword} Tutorial`,
        `${keyword} Tipps`,
        `Was ist ${keyword}`,
        `Wie funktioniert ${keyword}`,
        `${keyword} Erklärung`,
        `${keyword} Guide`,
        `${keyword} Informationen`,
        `${keyword} News`,
        `${keyword} 2025`,
        `Beste ${keyword}`,
        `${keyword} Vergleich`
      );
    });

    return [...new Set(related)]; // Entferne Duplikate
  }

  /**
   * Image SEO Dominator - Image Optimization
   */
  async generateImageSEOData(imagePath, keywords, context) {
    try {
      // In einer echten Implementierung würden wir hier Computer Vision verwenden
      // Für diese Demo generieren wir die Daten algorithmisch

      // Alt-Text Generierung
      const altText = `Bild zeigt ${context} im Zusammenhang mit ${keywords.join(', ')}`;

      // Dateiname Optimierung
      const optimizedFilename = this.optimizeImageFilename(path.basename(imagePath), keywords);

      // Titel Generierung
      const title = `${context} - ${keywords.slice(0, 3).join(', ')}`;

      return {
        success: true,
        altText: altText,
        filename: optimizedFilename,
        title: title,
        metadata: {
          generatedAt: new Date().toISOString(),
          imagePath: imagePath,
          keywords: keywords
        }
      };
    } catch (error) {
      console.error('Fehler bei der Image-SEO-Generierung:', error);
      return {
        success: false,
        error: error.message,
        altText: '',
        filename: path.basename(imagePath),
        title: ''
      };
    }
  }

  /**
   * Optimiere Bild-Dateinamen für SEO
   */
  optimizeImageFilename(originalFilename, keywords) {
    // Entferne Dateiendung
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);

    // Erstelle SEO-freundlichen Namen
    const seoKeywords = keywords.slice(0, 3).join('-').toLowerCase();
    const timestamp = Date.now();

    return `${seoKeywords}-${timestamp}${ext}`;
  }

  /**
   * AI SEO Traffic Dominator - Content Automation
   */
  async generateAutomatedContent(keywords, contentType, targetAudience) {
    try {
      // In einer echten Implementierung würden wir hier LLMs verwenden
      // Für diese Demo generieren wir Beispielinhalt

      let content = '';
      let title = '';

      switch(contentType) {
        case 'blog_post':
          title = `Alles über ${keywords[0]}: Umfassender Leitfaden für ${targetAudience}`;
          content = `In diesem umfassenden Leitfaden erfahren Sie alles über ${keywords[0]}. ` +
                   `Wir beleuchten die wichtigsten Aspekte im Detail und zeigen praktische Anwendungsmöglichkeiten auf.`;
          break;
        case 'product_page':
          title = `${keywords[0]} - Premium Lösung für ${targetAudience}`;
          content = `Entdecken Sie unsere Premium ${keywords[0]} Lösung, speziell für ${targetAudience} entwickelt. ` +
                   `Mit fortschrittlicher Technologie und benutzerfreundlichem Design.`;
          break;
        case 'landing_page':
          title = `Steigern Sie Ihre ${keywords[0]} mit unserer Lösung`;
          content = `Unsere innovative Lösung für ${keywords[0]} hilft ${targetAudience}, ` +
                   `ihre Ziele effizienter zu erreichen. Jetzt mehr erfahren!`;
          break;
        default:
          title = `${keywords[0]} - Wichtige Informationen`;
          content = `Wichtige Informationen zu ${keywords[0]} für interessierte ${targetAudience}.`;
      }

      return {
        success: true,
        title: title,
        content: content,
        contentType: contentType,
        metadata: {
          generatedAt: new Date().toISOString(),
          keywords: keywords,
          targetAudience: targetAudience
        }
      };
    } catch (error) {
      console.error('Fehler bei der Content-Generierung:', error);
      return {
        success: false,
        error: error.message,
        title: '',
        content: '',
        contentType: contentType
      };
    }
  }

  /**
   * Generative Engine Optimization (GEO)
   */
  async optimizeForAISearch(content) {
    try {
      // Analyse der KI-Lesbarkeit
      const readabilityScore = this.calculateAIReadability(content);

      // Strukturierte Daten Generierung
      const structuredData = this.generateStructuredData(content);

      // Voice Search Optimierung
      const voiceOptimizedContent = this.optimizeForVoiceSearch(content);

      return {
        success: true,
        readabilityScore: readabilityScore,
        structuredData: structuredData,
        voiceOptimizedContent: voiceOptimizedContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          contentLength: content.length
        }
      };
    } catch (error) {
      console.error('Fehler bei der GEO-Optimierung:', error);
      return {
        success: false,
        error: error.message,
        readabilityScore: 0,
        structuredData: {},
        voiceOptimizedContent: content
      };
    }
  }

  /**
   * Berechne KI-Lesbarkeits-Score
   */
  calculateAIReadability(content) {
    // Vereinfachte Berechnung für Demo-Zwecke
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgSentenceLength = words.length / sentences.length;

    // Score basierend auf durchschnittlicher Satzlänge (je kürzer, desto besser für KI)
    const score = Math.max(0, Math.min(100, 100 - (avgSentenceLength * 2)));
    return Math.round(score);
  }

  /**
   * Generiere strukturierte Daten
   */
  generateStructuredData(content) {
    // Vereinfachte Schema.org Struktur für Demo-Zwecke
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": content.substring(0, 100) + "...",
      "description": content.substring(0, 200) + "...",
      "author": {
        "@type": "Person",
        "name": "AI Content Generator"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SEO Automation Platform"
      }
    };
  }

  /**
   * Optimiere für Voice Search
   */
  optimizeForVoiceSearch(content) {
    // Füge häufige Frageformulierungen hinzu
    const questionPhrases = [
      "Was ist",
      "Wie funktioniert",
      "Warum ist",
      "Welche Vorteile",
      "Wie kann man"
    ];

    // Teile den Content in Absätze
    const paragraphs = content.split('\n\n');

    // Füge Frage-Absätze hinzu
    const optimizedParagraphs = [...paragraphs];
    questionPhrases.forEach(phrase => {
      optimizedParagraphs.push(`${phrase} ${content.substring(0, 50)}?`);
    });

    return optimizedParagraphs.join('\n\n');
  }

  /**
   * Erstelle Content-Cluster
   */
  async createContentCluster(mainTopic, subtopics) {
    try {
      const cluster = {
        mainTopic: mainTopic,
        subtopics: subtopics,
        relatedKeywords: [],
        internalLinks: []
      };

      // Generiere verwandte Keywords
      cluster.relatedKeywords = this.generateRelatedKeywords(mainTopic, subtopics);

      // Erstelle interne Linkstruktur
      cluster.internalLinks = this.createInternalLinkStructure(mainTopic, subtopics);

      return {
        success: true,
        cluster: cluster,
        metadata: {
          generatedAt: new Date().toISOString(),
          subtopicCount: subtopics.length
        }
      };
    } catch (error) {
      console.error('Fehler bei der Content-Cluster-Erstellung:', error);
      return {
        success: false,
        error: error.message,
        cluster: null
      };
    }
  }

  /**
   * Generiere verwandte Keywords
   */
  generateRelatedKeywords(mainTopic, subtopics) {
    const keywords = [mainTopic, ...subtopics];
    const related = [];

    keywords.forEach(keyword => {
      // Füge Synonyme und verwandte Begriffe hinzu
      related.push(
        keyword,
        `${keyword} Anleitung`,
        `${keyword} Tutorial`,
        `${keyword} Tipps`,
        `Was ist ${keyword}`,
        `Wie funktioniert ${keyword}`
      );
    });

    return [...new Set(related)]; // Entferne Duplikate
  }

  /**
   * Erstelle interne Linkstruktur
   */
  createInternalLinkStructure(mainTopic, subtopics) {
    const links = [];

    // Link vom Hauptthema zu den Unterthemen
    subtopics.forEach(subtopic => {
      links.push({
        from: mainTopic,
        to: subtopic,
        anchorText: `Mehr über ${subtopic}`
      });
    });

    // Links zwischen Unterthemen
    for (let i = 0; i < subtopics.length - 1; i++) {
      links.push({
        from: subtopics[i],
        to: subtopics[i + 1],
        anchorText: `Weiter zu ${subtopics[i + 1]}`
      });
    }

    return links;
  }

  /**
   * Batch-SEO-Optimierung
   */
  async batchOptimizeSEO(items, optimizationType) {
    try {
      const results = [];

      for (const item of items) {
        let result;

        switch(optimizationType) {
          case 'channel':
            result = await this.generateChannelDescription(item);
            break;
          case 'long_form':
            result = await this.generateLongFormVideoDescription(item);
            break;
          case 'short':
            result = await this.generateShortVideoDescription(item);
            break;
          case 'image':
            result = await this.generateImageSEOData(item.path, item.keywords, item.context);
            break;
          case 'content':
            result = await this.generateAutomatedContent(item.keywords, item.type, item.audience);
            break;
          default:
            throw new Error(`Unbekannter Optimierungstyp: ${optimizationType}`);
        }

        results.push({
          item: item,
          result: result
        });
      }

      return {
        success: true,
        results: results,
        metadata: {
          generatedAt: new Date().toISOString(),
          itemCount: items.length,
          optimizationType: optimizationType
        }
      };
    } catch (error) {
      console.error('Fehler bei der Batch-SEO-Optimierung:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Speichere SEO-Daten
   */
  saveSEOData(data, filename) {
    try {
      const filepath = path.join(this.dataDir, `${filename}.json`);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 SEO-Daten gespeichert: ${filepath}`);
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der SEO-Daten:', error);
      return false;
    }
  }

  /**
   * Lade SEO-Daten
   */
  loadSEOData(filename) {
    try {
      const filepath = path.join(this.dataDir, `${filename}.json`);
      if (!fs.existsSync(filepath)) {
        return null;
      }

      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Fehler beim Laden der SEO-Daten:', error);
      return null;
    }
  }

  /**
   * Erstelle eine SEO-konforme Kanalbeschreibung
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Kanalbeschreibung
   */
  async generateChannelDescription(channelData, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      // Erstelle Kanalbeschreibung basierend auf den bereitgestellten Daten
      const description = this.createChannelDescription(channelData, mergedConfig);
      const keywords = this.extractChannelKeywords(channelData, mergedConfig);
      const tags = this.generateChannelTags(channelData, mergedConfig);

      return {
        success: true,
        description,
        keywords,
        tags,
        metadata: {
          generatedAt: new Date().toISOString(),
          language: mergedConfig.language,
          targetAudience: channelData.targetAudience || 'Allgemeines Publikum'
        }
      };
    } catch (error) {
      console.error('Fehler bei der Kanalbeschreibungserstellung:', error);
      return {
        success: false,
        error: error.message,
        description: '',
        keywords: [],
        tags: []
      };
    }
  }

  /**
   * Extrahiert Keywords für den Kanal
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Kanal-Keywords
   */
  async generateChannelKeywords(channelData, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      const keywords = this.extractChannelKeywords(channelData, mergedConfig);

      return {
        success: true,
        keywords,
        metadata: {
          generatedAt: new Date().toISOString(),
          language: mergedConfig.language
        }
      };
    } catch (error) {
      console.error('Fehler bei der Kanal-Keywords-Generierung:', error);
      return {
        success: false,
        error: error.message,
        keywords: []
      };
    }
  }

  /**
   * Erstellt eine SEO-konforme Videobeschreibung für Long-Form-Inhalte
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Videobeschreibung
   */
  async generateLongFormVideoDescription(videoData, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      const description = this.createLongFormDescription(videoData, mergedConfig);
      const title = this.optimizeVideoTitle(videoData.title || '', mergedConfig);
      const tags = this.generateVideoTags(videoData, mergedConfig);
      const keywords = this.extractVideoKeywords(videoData, mergedConfig);

      return {
        success: true,
        title,
        description,
        tags,
        keywords,
        metadata: {
          generatedAt: new Date().toISOString(),
          contentType: 'long-form',
          language: mergedConfig.language
        }
      };
    } catch (error) {
      console.error('Fehler bei der Long-Form-Beschreibungserstellung:', error);
      return {
        success: false,
        error: error.message,
        title: videoData.title || '',
        description: '',
        tags: [],
        keywords: []
      };
    }
  }

  /**
   * Erstellt eine SEO-konforme Videobeschreibung für Shorts
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Shorts-Beschreibung
   */
  async generateShortVideoDescription(videoData, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      const description = this.createShortDescription(videoData, mergedConfig);
      const title = this.optimizeVideoTitle(videoData.title || '', mergedConfig);
      const tags = this.generateVideoTags(videoData, mergedConfig);
      const keywords = this.extractVideoKeywords(videoData, mergedConfig);

      return {
        success: true,
        title,
        description,
        tags,
        keywords,
        metadata: {
          generatedAt: new Date().toISOString(),
          contentType: 'shorts',
          language: mergedConfig.language
        }
      };
    } catch (error) {
      console.error('Fehler bei der Shorts-Beschreibungserstellung:', error);
      return {
        success: false,
        error: error.message,
        title: videoData.title || '',
        description: '',
        tags: [],
        keywords: []
      };
    }
  }

  /**
   * Erstellt eine Kanalbeschreibung
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfiguration
   * @returns {string} Kanalbeschreibung
   */
  createChannelDescription(channelData, config) {
    const { channelName, description, niche, targetAudience } = channelData;

    let desc = `Willkommen auf dem offiziellen Kanal von ${channelName || 'Unserem Kanal'}!\n\n`;

    if (description) {
      desc += `${description}\n\n`;
    }

    if (niche) {
      desc += `Inhalt: ${niche}\n\n`;
    }

    if (targetAudience) {
      desc += `Zielgruppe: ${targetAudience}\n\n`;
    }

    desc += `Abonniere für wöchentliche Updates zu spannenden Themen!\n\n`;
    desc += `#YouTube #Kanal #Abonnieren`;

    // Kürze auf maximale Länge
    return desc.substring(0, config.maxDescriptionLength);
  }

  /**
   * Extrahiert Kanal-Keywords
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfiguration
   * @returns {Array} Keywords
   */
  extractChannelKeywords(channelData, config) {
    const keywords = new Set();

    if (channelData.channelName) {
      keywords.add(channelData.channelName);
    }

    if (channelData.niche) {
      keywords.add(channelData.niche);
    }

    if (channelData.targetAudience) {
      channelData.targetAudience.split(/\s+/).forEach(word => {
        if (word.length > 3) {
          keywords.add(word);
        }
      });
    }

    // Füge Ziel-Keywords hinzu
    config.targetKeywords.forEach(keyword => keywords.add(keyword));

    // Filtere ausgeschlossene Wörter
    return Array.from(keywords)
      .filter(keyword => !config.excludeWords.includes(keyword.toLowerCase()))
      .slice(0, 30);
  }

  /**
   * Generiert Kanal-Tags
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfiguration
   * @returns {Array} Tags
   */
  generateChannelTags(channelData, config) {
    const tags = new Set();

    if (channelData.channelName) {
      tags.add(channelData.channelName.replace(/\s+/g, ''));
    }

    if (channelData.niche) {
      tags.add(channelData.niche.replace(/\s+/g, ''));
    }

    // Füge allgemeine Tags hinzu
    ['YouTube', 'Kanal', 'Video', 'Content'].forEach(tag => tags.add(tag));

    return Array.from(tags).slice(0, config.maxTags);
  }

  /**
   * Erstellt eine Long-Form-Beschreibung
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfiguration
   * @returns {string} Videobeschreibung
   */
  createLongFormDescription(videoData, config) {
    const { title, content, keyPoints, callToAction } = videoData;

    let desc = `${title || 'Unbenanntes Video'}\n\n`;

    if (content) {
      desc += `${content}\n\n`;
    }

    if (keyPoints && keyPoints.length > 0) {
      desc += `Wichtige Punkte:\n`;
      keyPoints.forEach((point, index) => {
        desc += `${index + 1}. ${point}\n`;
      });
      desc += `\n`;
    }

    if (callToAction) {
      desc += `${callToAction}\n\n`;
    }

    desc += `Mehr Inhalte: [Kanal abonnieren]\n`;
    desc += `Diskussion: [Kommentare unten]\n\n`;
    desc += `#Video #YouTube #Content`;

    return desc.substring(0, config.maxDescriptionLength);
  }

  /**
   * Erstellt eine Shorts-Beschreibung
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfiguration
   * @returns {string} Shorts-Beschreibung
   */
  createShortDescription(videoData, config) {
    const { title, content } = videoData;

    let desc = `${title || 'Kurzvideo'}\n\n`;

    if (content) {
      desc += `${content.substring(0, 200)}...\n\n`;
    }

    desc += `Mehr auf unserem Kanal!\n`;
    desc += `#Shorts #YouTube #Kurzvideo`;

    return desc.substring(0, 200); // Shorts haben eine kürzere Beschreibung
  }

  /**
   * Optimiert den Videotitel
   * @param {string} title - Originaltitel
   * @param {Object} config - Konfiguration
   * @returns {string} Optimierter Titel
   */
  optimizeVideoTitle(title, config) {
    // Entferne überflüssige Zeichen und kürze auf maximale Länge
    return title
      .replace(/[^\w\s\-äöüÄÖÜß]/g, '') // Entferne Sonderzeichen außer Bindestriche
      .substring(0, config.maxTitleLength);
  }

  /**
   * Extrahiert Video-Keywords
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfiguration
   * @returns {Array} Keywords
   */
  extractVideoKeywords(videoData, config) {
    const keywords = new Set();

    if (videoData.title) {
      videoData.title.split(/\s+/).forEach(word => {
        if (word.length > 3) {
          keywords.add(word);
        }
      });
    }

    if (videoData.tags) {
      videoData.tags.forEach(tag => keywords.add(tag));
    }

    // Füge Ziel-Keywords hinzu
    config.targetKeywords.forEach(keyword => keywords.add(keyword));

    // Filtere ausgeschlossene Wörter
    return Array.from(keywords)
      .filter(keyword => !config.excludeWords.includes(keyword.toLowerCase()))
      .slice(0, 30);
  }

  /**
   * Generiert Video-Tags
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfiguration
   * @returns {Array} Tags
   */
  generateVideoTags(videoData, config) {
    const tags = new Set();

    if (videoData.title) {
      videoData.title.split(/\s+/).forEach(word => {
        if (word.length > 3) {
          tags.add(word);
        }
      });
    }

    if (videoData.category) {
      tags.add(videoData.category);
    }

    if (videoData.contentType) {
      tags.add(videoData.contentType);
    }

    return Array.from(tags).slice(0, config.maxTags);
  }
}

module.exports = EnhancedSEOOptimizationService;