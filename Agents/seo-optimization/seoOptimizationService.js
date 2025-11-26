const axios = require('axios');
const SEOChannelOptimizationService = require('@agents/seo-channel-optimization');
const SEOVideoOptimizationService = require('@agents/seo-video-optimization');
const SEOLinkedInOptimizationService = require('@agents/seo-linkedin-optimization');

/**
 * Service zur SEO-Optimierung von YouTube-Kanälen und -Videos
 * Erstellt kanal- und video-spezifische SEO-konforme Beschreibungen
 *
 * Hinweis: Dieser Service ist ein Wrapper für die separaten Module:
 * - @agents/seo-channel-optimization
 * - @agents/seo-video-optimization
 * - @agents/seo-linkedin-optimization
 */
class SEOOptimizationService {
  constructor(options = {}) {
    this.channelService = new SEOChannelOptimizationService(options);
    this.videoService = new SEOVideoOptimizationService(options);
    this.linkedinService = new SEOLinkedInOptimizationService(options);
  }

  /**
   * Erstellt eine SEO-konforme Kanalbeschreibung
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Kanalbeschreibung
   */
  async generateChannelDescription(channelData, config = {}) {
    return await this.channelService.generateChannelDescription(channelData, config);
  }

  /**
   * Extrahiert Keywords für den Kanal
   * @param {Object} channelData - Kanalinformationen
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Kanal-Keywords
   */
  async generateChannelKeywords(channelData, config = {}) {
    return await this.channelService.generateChannelKeywords(channelData, config);
  }

  /**
   * Führt umfassende SEO-Keyword-Recherche durch
   * @param {string} topic - Das Hauptthema
   * @param {Object} options - Zusätzliche Optionen
   * @returns {Object} Umfassende Keyword-Recherche-Ergebnisse
   */
  async performComprehensiveSEOAnalysis(topic, options = {}) {
    // Diese Methode bleibt im Haupt-SEO-Service, da sie eine umfassende Analyse durchführt
    try {
      console.log(`🔍 Performing comprehensive SEO analysis for topic: "${topic}"`);

      // In einer echten Implementierung würden wir hier verschiedene SEO-Tools
      // und Techniken verwenden, um eine umfassende Analyse durchzuführen.
      // Für diese Demo simulieren wir die Ergebnisse.

      // Generiere primäre Keywords
      const primaryKeywords = [
        topic,
        `${topic} Anleitung`,
        `${topic} Tutorial`,
        `${topic} Erklärung`,
        `${topic} Guide`
      ];

      // Generiere verwandte Keywords
      const relatedKeywords = [
        `Was ist ${topic}`,
        `Wie funktioniert ${topic}`,
        `${topic} Vorteile`,
        `${topic} Nachteile`,
        `${topic} Vergleich`,
        `${topic} Test`,
        `${topic} Bewertung`,
        `${topic} Erfahrungen`,
        `${topic} Tipps`,
        `${topic} Tricks`
      ];

      // Generiere Long-Tail-Keywords
      const longTailKeywords = [
        `Wie man ${topic} richtig verwendet`,
        `${topic} für Anfänger erklärt`,
        `Beste ${topic} im Jahr 2024`,
        `${topic} vs Alternativen`,
        `Kosten von ${topic} verglichen`
      ];

      // Kombiniere alle Keywords
      const allKeywords = [...primaryKeywords, ...relatedKeywords, ...longTailKeywords];

      // Entferne Duplikate und beschränke auf 50 Keywords
      const uniqueKeywords = [...new Set(allKeywords)].slice(0, 50);

      return {
        success: true,
        primaryKeywords: primaryKeywords,
        relatedKeywords: relatedKeywords,
        longTailKeywords: longTailKeywords,
        allKeywords: uniqueKeywords,
        metadata: {
          generatedAt: new Date().toISOString(),
          topic: topic,
          keywordCount: uniqueKeywords.length
        }
      };
    } catch (error) {
      console.error('Fehler bei der umfassenden SEO-Analyse:', error);
      return {
        success: false,
        error: error.message,
        primaryKeywords: [],
        relatedKeywords: [],
        longTailKeywords: [],
        allKeywords: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          topic: topic
        }
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
    return await this.videoService.generateLongFormVideoDescription(videoData, config);
  }

  /**
   * Erstellt eine SEO-konforme Videobeschreibung für Shorts
   * @param {Object} videoData - Videodaten
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte Shorts-Beschreibung
   */
  async generateShortsVideoDescription(videoData, config = {}) {
    return await this.videoService.generateShortsVideoDescription(videoData, config);
  }

  /**
   * Erstellt eine SEO-konforme Videobeschreibung für LinkedIn
   * @param {Object} postData - Postdaten
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte LinkedIn-Postbeschreibung
   */
  async generateLinkedInPostDescription(postData, config = {}) {
    return await this.linkedinService.generateLinkedInPostDescription(postData, config);
  }
}

module.exports = SEOOptimizationService;