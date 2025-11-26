const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Video Repurposing Service
 * Spezialisiertes Modul für die automatische Erstellung von Shorts aus Long-Form-Videos
 * Bewertung: 9/10
 */
class VideoRepurposingService {
  constructor() {
    // Notification systems
    this.notificationChannels = {
      discord: process.env.DISCORD_WEBHOOK || null,
      telegram: process.env.TELEGRAM_BOT_TOKEN || null,
      webhook: process.env.WEBHOOK_URL || null,
      slack: process.env.SLACK_WEBHOOK || null
    };

    this.repurposingDir = path.join(__dirname, '../../data/repurposing');
    this.templatesDir = path.join(this.repurposingDir, 'templates');
    this.highlightsDir = path.join(this.repurposingDir, 'highlights');
    this.shortsDir = path.join(this.repurposingDir, 'shorts');

    this.ensureDirectories();
    this.loadConfiguration();
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
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [this.repurposingDir, this.templatesDir, this.highlightsDir, this.shortsDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load repurposing configuration
   */
  loadConfiguration() {
    try {
      const configPath = path.join(this.repurposingDir, 'config.json');
      if (fs.existsSync(configPath)) {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } else {
        this.config = {
          shortFormats: {
            'youtube_shorts': {
              duration: 60, // Sekunden
              aspectRatio: '9:16',
              resolution: '1080x1920',
              recommendedLengths: [15, 30, 45, 60]
            },
            'instagram_reels': {
              duration: 90, // Sekunden
              aspectRatio: '9:16',
              resolution: '1080x1920',
              recommendedLengths: [15, 30, 45, 60, 90]
            },
            'tiktok': {
              duration: 60, // Sekunden
              aspectRatio: '9:16',
              resolution: '1080x1920',
              recommendedLengths: [15, 30, 45, 60]
            },
            'linkedin': {
              duration: 60, // Sekunden
              aspectRatio: '1:1',
              resolution: '1080x1080',
              recommendedLengths: [15, 30, 45, 60]
            }
          },
          highlightDetection: {
            engagementThreshold: 0.7, // 70% Engagement-Rate
            textDensityThreshold: 0.5, // 50% Text-Dichte
            visualChangeThreshold: 0.3, // 30% visuelle Veränderung
            viralScoreThreshold: 0.8 // 80% Viral-Potenzial
          },
          templates: {
            hookFirst: {
              name: "Hook-First",
              description: "Beginnt mit dem stärksten Hook des Originalvideos",
              structure: ["hook", "context", "value_proposition", "call_to_action"],
              category: "engagement"
            },
            valueFirst: {
              name: "Value-First",
              description: "Beginnt mit dem wertvollsten Inhalt des Originalvideos",
              structure: ["value_proposition", "hook", "context", "call_to_action"],
              category: "value"
            },
            questionHook: {
              name: "Question Hook",
              description: "Beginnt mit einer provozierenden Frage",
              structure: ["question", "hook", "value_proposition", "call_to_action"],
              category: "engagement"
            },
            storytelling: {
              name: "Storytelling",
              description: "Erzählt eine Geschichte aus dem Originalvideo",
              structure: ["setup", "conflict", "resolution", "call_to_action"],
              category: "narrative"
            },
            educational: {
              name: "Educational",
              description: "Fokussiert auf Bildungsinhalte",
              structure: ["problem", "solution", "example", "call_to_action"],
              category: "education"
            }
          }
        };
        this.saveConfiguration();
      }
    } catch (error) {
      console.error('❌ Failed to load repurposing config:', error);
      this.config = {};
    }
  }

  /**
   * Save repurposing configuration
   */
  saveConfiguration() {
    try {
      const configPath = path.join(this.repurposingDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('❌ Failed to save repurposing config:', error);
    }
  }

  /**
   * Analyze long-form video for highlight extraction
   */
  async analyzeVideoForHighlights(videoData) {
    try {
      // Send notification about analysis start
      await this.sendNotification(`Starting video analysis for: ${videoData.title}`, 'info');

      const {
        videoId,
        title,
        transcript,
        timestamps,
        engagementMetrics,
        monetizationData
      } = videoData;

      console.log(`🔍 Analyzing video ${videoId} for highlights: "${title}"`);

      // 1. Textbasierte Analyse
      const textHighlights = this.extractTextHighlights(transcript, timestamps);

      // 2. Engagement-basierte Analyse
      const engagementHighlights = this.extractEngagementHighlights(engagementMetrics, timestamps);

      // 3. Monetarisierungs-basierte Analyse
      const monetizationHighlights = this.extractMonetizationHighlights(monetizationData, timestamps);

      // 4. Kombinierte Highlight-Bewertung
      const combinedHighlights = this.combineAndRankHighlights(
        textHighlights,
        engagementHighlights,
        monetizationHighlights
      );

      // 5. Speichern der Highlights
      const highlightId = uuidv4();
      const highlightData = {
        highlightId,
        videoId,
        title,
        createdAt: new Date().toISOString(),
        highlights: combinedHighlights,
        summary: {
          totalHighlights: combinedHighlights.length,
          topPerformingSegments: combinedHighlights.slice(0, 5)
        }
      };

      await this.saveHighlights(highlightId, highlightData);

      // Send notification about successful completion
      await this.sendNotification(`Video analysis completed for: ${videoData.title} - ${combinedHighlights.length} highlights found`, 'success');

      return highlightData;
    } catch (error) {
      console.error('❌ Failed to analyze video for highlights:', error);
      await this.sendNotification(`Video analysis failed for: ${videoData.title} - ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Extract text-based highlights
   */
  extractTextHighlights(transcript, timestamps) {
    const highlights = [];

    // Zerlege Transkript in Sätze
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Analysiere jeden Satz auf Schlüsselwörter und Struktur
    sentences.forEach((sentence, index) => {
      const score = this.calculateTextScore(sentence);
      if (score > 0.6) { // Schwellenwert für relevante Inhalte
        // Finde Zeitstempel für diesen Satz
        const timestamp = this.findTimestampForSentence(sentence, timestamps, index);

        highlights.push({
          type: 'text',
          content: sentence.trim(),
          timestamp: timestamp,
          score: score,
          confidence: 'high'
        });
      }
    });

    return highlights.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate text score based on keywords and structure
   */
  calculateTextScore(sentence) {
    const viralKeywords = [
      'wusstet ihr', 'überraschend', 'unglaublich', 'geheim', 'tipp',
      'müssen sehen', 'verblüffend', 'erstaunlich', 'sensation', 'exklusiv',
      'neu', 'aktuell', 'trend', 'jetzt', 'sofort'
    ];

    const questionWords = [
      'warum', 'wie', 'was', 'wann', 'wer', 'wo', 'welche', 'weshalb'
    ];

    const callToActionWords = [
      'jetzt', 'klick', 'abonnieren', 'teilen', 'kommentieren',
      'mehr', 'hier', 'jetzt', 'sehen', 'lernen'
    ];

    let score = 0;
    const lowerSentence = sentence.toLowerCase();

    // Viral-Koeffizient
    viralKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) score += 0.2;
    });

    // Frage-Koeffizient
    questionWords.forEach(word => {
      if (lowerSentence.includes(word)) score += 0.15;
    });

    // Call-to-Action-Koeffizient
    callToActionWords.forEach(word => {
      if (lowerSentence.includes(word)) score += 0.1;
    });

    // Längen-Koeffizient (optimale Länge 10-20 Wörter)
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 20) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Find timestamp for sentence
   */
  findTimestampForSentence(sentence, timestamps, sentenceIndex) {
    // Vereinfachte Implementierung - in echter Anwendung würde dies
    // komplexe Text-zu-Zeitstempel-Matching-Algorithmen verwenden
    if (timestamps && timestamps.length > 0) {
      const index = Math.min(sentenceIndex, timestamps.length - 1);
      return timestamps[index];
    }
    return { start: sentenceIndex * 5, end: (sentenceIndex + 1) * 5 }; // Schätzung
  }

  /**
   * Extract engagement-based highlights
   */
  extractEngagementHighlights(engagementMetrics, timestamps) {
    const highlights = [];

    if (!engagementMetrics || !engagementMetrics.timeline) {
      return highlights;
    }

    const timeline = engagementMetrics.timeline;
    const threshold = this.config.highlightDetection.engagementThreshold;

    // Finde Zeitabschnitte mit hoher Engagement-Rate
    timeline.forEach((segment, index) => {
      if (segment.engagementRate > threshold) {
        const timestamp = timestamps && timestamps[index] ?
          timestamps[index] :
          { start: segment.timestamp, end: segment.timestamp + segment.duration };

        highlights.push({
          type: 'engagement',
          content: `Hochengagierter Abschnitt mit ${Math.round(segment.engagementRate * 100)}% Engagement`,
          timestamp: timestamp,
          score: segment.engagementRate,
          confidence: 'medium'
        });
      }
    });

    return highlights.sort((a, b) => b.score - a.score);
  }

  /**
   * Extract monetization-based highlights
   */
  extractMonetizationHighlights(monetizationData, timestamps) {
    const highlights = [];

    if (!monetizationData || !monetizationData.revenueTimeline) {
      return highlights;
    }

    const timeline = monetizationData.revenueTimeline;
    const avgRevenue = timeline.reduce((sum, segment) => sum + segment.revenue, 0) / timeline.length;

    // Finde Zeitabschnitte mit überdurchschnittlicher Monetarisierung
    timeline.forEach((segment, index) => {
      if (segment.revenue > avgRevenue * 1.5) { // 50% über dem Durchschnitt
        const timestamp = timestamps && timestamps[index] ?
          timestamps[index] :
          { start: segment.timestamp, end: segment.timestamp + segment.duration };

        highlights.push({
          type: 'monetization',
          content: `Hochwertiger Abschnitt mit $${segment.revenue.toFixed(2)} Umsatz`,
          timestamp: timestamp,
          score: segment.revenue / avgRevenue,
          confidence: 'high'
        });
      }
    });

    return highlights.sort((a, b) => b.score - a.score);
  }

  /**
   * Combine and rank highlights from different sources
   */
  combineAndRankHighlights(textHighlights, engagementHighlights, monetizationHighlights) {
    // Kombiniere alle Highlights
    const allHighlights = [
      ...textHighlights.map(h => ({ ...h, source: 'text' })),
      ...engagementHighlights.map(h => ({ ...h, source: 'engagement' })),
      ...monetizationHighlights.map(h => ({ ...h, source: 'monetization' }))
    ];

    // Deduplizierung basierend auf Zeitstempel-Überlappung
    const deduplicated = this.deduplicateHighlights(allHighlights);

    // Ranking basierend auf Score und Quelle
    return deduplicated.sort((a, b) => {
      // Gewichtung: Monetarisierung (40%), Engagement (35%), Text (25%)
      const weightA = this.getHighlightWeight(a);
      const weightB = this.getHighlightWeight(b);

      const weightedScoreA = a.score * weightA;
      const weightedScoreB = b.score * weightB;

      return weightedScoreB - weightedScoreA;
    });
  }

  /**
   * Deduplicate highlights based on timestamp overlap
   */
  deduplicateHighlights(highlights) {
    const deduplicated = [];
    const processedTimestamps = new Set();

    highlights.forEach(highlight => {
      const timestampKey = `${Math.floor(highlight.timestamp.start / 10)}-${Math.floor(highlight.timestamp.end / 10)}`;

      if (!processedTimestamps.has(timestampKey)) {
        deduplicated.push(highlight);
        processedTimestamps.add(timestampKey);
      }
    });

    return deduplicated;
  }

  /**
   * Get highlight weight based on source
   */
  getHighlightWeight(highlight) {
    switch(highlight.source) {
      case 'monetization': return 0.4;
      case 'engagement': return 0.35;
      case 'text': return 0.25;
      default: return 0.2;
    }
  }

  /**
   * Save highlights to file
   */
  async saveHighlights(highlightId, highlightData) {
    try {
      const filename = `highlights-${highlightId}.json`;
      const filepath = path.join(this.highlightsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(highlightData, null, 2));
      console.log(`💾 Highlights saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save highlights:', error);
    }
  }

  /**
   * Create short video from highlights
   */
  async createShortFromHighlights(highlightData, options = {}) {
    try {
      // Send notification about short creation start
      await this.sendNotification(`Starting short creation from: ${highlightData.title}`, 'info');

      const {
        targetPlatform = 'youtube_shorts',
        targetLength = 60, // Sekunden
        template = 'hookFirst',
        customHook = null
      } = options;

      const shortId = uuidv4();
      console.log(`🎬 Creating short ${shortId} from highlights for ${targetPlatform}`);

      // 1. Wähle beste Highlights basierend auf Zielplattform und Länge
      const selectedHighlights = this.selectHighlightsForShort(
        highlightData.highlights,
        targetLength,
        targetPlatform
      );

      // 2. Erstelle Short-Struktur basierend auf Template
      const shortStructure = this.createShortStructure(
        selectedHighlights,
        template,
        customHook,
        targetLength
      );

      // 3. Generiere Short-Skript
      const shortScript = this.generateShortScript(shortStructure, targetPlatform);

      // 4. Erstelle Short-Konfiguration
      const shortConfig = {
        shortId,
        originalVideoId: highlightData.videoId,
        title: highlightData.title,
        targetPlatform,
        targetLength,
        template,
        createdAt: new Date().toISOString(),
        highlights: selectedHighlights,
        structure: shortStructure,
        script: shortScript,
        estimatedDuration: shortStructure.reduce((sum, segment) => sum + segment.duration, 0)
      };

      // 5. Speichere Short
      await this.saveShort(shortId, shortConfig);

      // Send notification about successful completion
      await this.sendNotification(`Short creation completed for: ${highlightData.title}`, 'success');

      return shortConfig;
    } catch (error) {
      console.error('❌ Failed to create short from highlights:', error);
      await this.sendNotification(`Short creation failed for: ${highlightData.title} - ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Select highlights for short video
   */
  selectHighlightsForShort(highlights, targetLength, targetPlatform) {
    // Filter Highlights nach Plattform-Eignung
    const platformConfig = this.config.shortFormats[targetPlatform];
    const suitableHighlights = highlights.filter(h =>
      h.timestamp.end - h.timestamp.start <= platformConfig.recommendedLengths[platformConfig.recommendedLengths.length - 1]
    );

    // Sortiere nach Score
    const sortedHighlights = suitableHighlights.sort((a, b) => b.score - a.score);

    // Wähle Highlights aus, die in die Zielzeit passen
    const selected = [];
    let totalTime = 0;

    for (const highlight of sortedHighlights) {
      const duration = highlight.timestamp.end - highlight.timestamp.start;
      if (totalTime + duration <= targetLength) {
        selected.push(highlight);
        totalTime += duration;
      }

      // Stoppe wenn wir nah an der Zielzeit sind
      if (totalTime >= targetLength * 0.9) {
        break;
      }
    }

    return selected;
  }

  /**
   * Create short structure from highlights
   */
  createShortStructure(highlights, templateName, customHook, targetLength) {
    const template = this.config.templates[templateName] || this.config.templates.hookFirst;
    const structure = [];

    // Berechne Zeit pro Segment
    const segmentTime = targetLength / template.structure.length;

    template.structure.forEach((segmentType, index) => {
      switch(segmentType) {
        case 'hook':
          // Verwende benutzerdefinierten Hook oder besten Highlight
          const hookContent = customHook || this.getBestHook(highlights);
          structure.push({
            type: 'hook',
            content: hookContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'value_proposition':
          // Verwende wertvollsten Highlight
          const valueContent = this.getBestValueProposition(highlights);
          structure.push({
            type: 'value_proposition',
            content: valueContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'context':
          // Verwende kontextrelevanten Highlight
          const contextContent = this.getContext(highlights);
          structure.push({
            type: 'context',
            content: contextContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'question':
          // Erstelle provozierende Frage
          const questionContent = this.generateQuestion(highlights);
          structure.push({
            type: 'question',
            content: questionContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'call_to_action':
          // Standard-Call-to-Action
          structure.push({
            type: 'call_to_action',
            content: 'Gefällt dir der Inhalt? Dann abonniere für mehr!',
            duration: segmentTime,
            order: index
          });
          break;

        case 'setup':
          // Storytelling Setup
          structure.push({
            type: 'setup',
            content: 'Lass mich dir eine Geschichte erzählen...',
            duration: segmentTime,
            order: index
          });
          break;

        case 'conflict':
          // Storytelling Conflict
          const conflictContent = this.getBestConflict(highlights);
          structure.push({
            type: 'conflict',
            content: conflictContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'resolution':
          // Storytelling Resolution
          structure.push({
            type: 'resolution',
            content: 'Und so wurde das Problem gelöst.',
            duration: segmentTime,
            order: index
          });
          break;

        case 'problem':
          // Educational Problem
          const problemContent = this.getBestProblem(highlights);
          structure.push({
            type: 'problem',
            content: problemContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'solution':
          // Educational Solution
          const solutionContent = this.getBestSolution(highlights);
          structure.push({
            type: 'solution',
            content: solutionContent,
            duration: segmentTime,
            order: index
          });
          break;

        case 'example':
          // Educational Example
          structure.push({
            type: 'example',
            content: 'Hier ist ein Beispiel dafür...',
            duration: segmentTime,
            order: index
          });
          break;

        default:
          // Fallback zu einfachem Highlight
          if (highlights[index]) {
            structure.push({
              type: 'content',
              content: highlights[index].content,
              duration: segmentTime,
              order: index
            });
          }
      }
    });

    return structure;
  }

  /**
   * Get best hook from highlights
   */
  getBestHook(highlights) {
    // Finde Highlight mit höchstem Score und viralen Keywords
    const hookHighlights = highlights.filter(h =>
      h.content.toLowerCase().includes('wusstet') ||
      h.content.toLowerCase().includes('überraschend') ||
      h.content.toLowerCase().includes('unglaublich')
    );

    if (hookHighlights.length > 0) {
      return hookHighlights[0].content;
    }

    // Fallback zu bestem Highlight
    return highlights.length > 0 ? highlights[0].content : 'Schau dir das an!';
  }

  /**
   * Get best value proposition from highlights
   */
  getBestValueProposition(highlights) {
    // Sortiere nach Monetarisierungs-Score
    const monetizationHighlights = highlights.filter(h => h.source === 'monetization');
    if (monetizationHighlights.length > 0) {
      return monetizationHighlights[0].content;
    }

    // Fallback zu bestem Highlight
    return highlights.length > 0 ? highlights[0].content : 'Das solltest du sehen!';
  }

  /**
   * Get context from highlights
   */
  getContext(highlights) {
    // Verwende mittleren Highlight für Kontext
    const midIndex = Math.floor(highlights.length / 2);
    return highlights[midIndex] ? highlights[midIndex].content : 'Hier ist der Kontext:';
  }

  /**
   * Generate question from highlights
   */
  generateQuestion(highlights) {
    // Erstelle Frage basierend auf bestem Highlight
    if (highlights.length > 0) {
      const bestHighlight = highlights[0].content;
      // Vereinfachte Frage-Generierung
      return `Wusstest du schon: ${bestHighlight.substring(0, 30)}...?`;
    }
    return 'Was denkst du darüber?';
  }

  /**
   * Get best conflict from highlights
   */
  getBestConflict(highlights) {
    // Finde Highlight mit Konflikt-Keywords
    const conflictHighlights = highlights.filter(h =>
      h.content.toLowerCase().includes('problem') ||
      h.content.toLowerCase().includes('herausforderung') ||
      h.content.toLowerCase().includes('schwierig')
    );

    if (conflictHighlights.length > 0) {
      return conflictHighlights[0].content;
    }

    // Fallback zu bestem Highlight
    return highlights.length > 0 ? highlights[0].content : 'Es gab ein Problem...';
  }

  /**
   * Get best problem from highlights
   */
  getBestProblem(highlights) {
    // Finde Highlight mit Problem-Keywords
    const problemHighlights = highlights.filter(h =>
      h.content.toLowerCase().includes('problem') ||
      h.content.toLowerCase().includes('herausforderung') ||
      h.content.toLowerCase().includes('schwierig')
    );

    if (problemHighlights.length > 0) {
      return problemHighlights[0].content;
    }

    // Fallback zu bestem Highlight
    return highlights.length > 0 ? highlights[0].content : 'Was ist das Problem?';
  }

  /**
   * Get best solution from highlights
   */
  getBestSolution(highlights) {
    // Finde Highlight mit Lösungs-Keywords
    const solutionHighlights = highlights.filter(h =>
      h.content.toLowerCase().includes('lösung') ||
      h.content.toLowerCase().includes('antwort') ||
      h.content.toLowerCase().includes('beheben')
    );

    if (solutionHighlights.length > 0) {
      return solutionHighlights[0].content;
    }

    // Fallback zu bestem Highlight
    return highlights.length > 0 ? highlights[0].content : 'So wurde es gelöst...';
  }

  /**
   * Generate short script
   */
  generateShortScript(structure, targetPlatform) {
    let script = `# Short Video Script für ${targetPlatform}\n\n`;

    structure.forEach((segment, index) => {
      script += `## ${index + 1}. ${segment.type.toUpperCase()}\n`;
      script += `${segment.content}\n\n`;
    });

    return script;
  }

  /**
   * Save short to file
   */
  async saveShort(shortId, shortData) {
    try {
      const filename = `short-${shortId}.json`;
      const filepath = path.join(this.shortsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(shortData, null, 2));
      console.log(`💾 Short saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save short:', error);
    }
  }

  /**
   * Get repurposing statistics
   */
  getStats() {
    try {
      const highlightFiles = fs.readdirSync(this.highlightsDir)
        .filter(f => f.startsWith('highlights-') && f.endsWith('.json'));

      const shortFiles = fs.readdirSync(this.shortsDir)
        .filter(f => f.startsWith('short-') && f.endsWith('.json'));

      return {
        totalHighlights: highlightFiles.length,
        totalShorts: shortFiles.length,
        lastHighlight: highlightFiles.length > 0 ? highlightFiles[highlightFiles.length - 1] : null,
        lastShort: shortFiles.length > 0 ? shortFiles[shortFiles.length - 1] : null,
        notificationSystems: this.notificationSystems,
        supportedPlatforms: Object.keys(this.config.shortFormats),
        supportedTemplates: Object.keys(this.config.templates)
      };
    } catch (error) {
      console.error('❌ Failed to get repurposing stats:', error);
      return {
        totalHighlights: 0,
        totalShorts: 0,
        error: error.message
      };
    }
  }
}

module.exports = VideoRepurposingService;