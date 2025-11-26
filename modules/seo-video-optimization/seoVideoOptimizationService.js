const axios = require('axios');

/**
 * Service zur SEO-Optimierung von YouTube-Videos
 * Erstellt video-spezifische SEO-konforme Beschreibungen, Titel und Tags
 */
class SEOVideoOptimizationService {
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
  async generateShortsVideoDescription(videoData, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      const description = this.createShortsDescription(videoData, mergedConfig);
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
  createShortsDescription(videoData, config) {
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

module.exports = SEOVideoOptimizationService;