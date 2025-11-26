const axios = require('axios');

/**
 * Service zur SEO-Optimierung von YouTube-Kanälen
 * Erstellt kanal-spezifische SEO-konforme Beschreibungen und Keywords
 */
class SEOChannelOptimizationService {
  constructor(options = {}) {
    this.defaultConfig = {
      language: options.language || 'de',
      maxDescriptionLength: options.maxDescriptionLength || 5000,
      maxTitleLength: options.maxTitleLength || 100,
      maxTags: options.maxTags || 30,
      targetKeywords: options.targetKeywords || [],
      excludeWords: options.excludeWords || ['sex', 'porn', 'casino', 'gambling']
    };
  }

  /**
   * Erstellt eine SEO-konforme Kanalbeschreibung
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
}

module.exports = SEOChannelOptimizationService;