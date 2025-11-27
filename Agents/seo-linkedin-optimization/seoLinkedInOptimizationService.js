const axios = require('axios');

/**
 * Service zur SEO-Optimierung von LinkedIn-Posts
 * Erstellt professionelle, SEO-konforme Beschreibungen, Titel und Tags für LinkedIn
 */
class SEOLinkedInOptimizationService {
  constructor(options = {}) {
    this.defaultConfig = {
      language: options.language || 'de',
      maxDescriptionLength: options.maxDescriptionLength || 3000,
      maxTitleLength: options.maxTitleLength || 200,
      maxTags: options.maxTags || 15,
      targetKeywords: options.targetKeywords || [],
      excludeWords: options.excludeWords || ['sex', 'porn', 'casino', 'gambling']
    };
  }

  /**
   * Erstellt eine SEO-konforme Beschreibung für LinkedIn-Posts
   * @param {Object} postData - Postdaten
   * @param {Object} config - Konfigurationsoptionen
   * @returns {Object} SEO-optimierte LinkedIn-Postbeschreibung
   */
  async generateLinkedInPostDescription(postData, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };

    try {
      // Für LinkedIn verwenden wir eine professionellere Sprache
      mergedConfig.language = 'de'; // LinkedIn-Posts auf Deutsch

      const description = this.createLinkedInDescription(postData, mergedConfig);
      const title = this.optimizePostTitle(postData.title || '', mergedConfig);
      const tags = this.generateLinkedInTags(postData, mergedConfig);
      const keywords = this.extractLinkedInKeywords(postData, mergedConfig);

      return {
        success: true,
        title,
        description,
        tags,
        keywords,
        metadata: {
          generatedAt: new Date().toISOString(),
          platform: 'linkedin',
          language: mergedConfig.language
        }
      };
    } catch (error) {
      console.error('Fehler bei der LinkedIn-Post-Beschreibungserstellung:', error);
      return {
        success: false,
        error: error.message,
        title: postData.title || '',
        description: '',
        tags: [],
        keywords: []
      };
    }
  }

  /**
   * Erstellt eine LinkedIn-Beschreibung
   * @param {Object} postData - Postdaten
   * @param {Object} config - Konfiguration
   * @returns {string} LinkedIn-Beschreibung
   */
  createLinkedInDescription(postData, config) {
    const { title, content, keyPoints, callToAction } = postData;

    let desc = `${title || 'Professioneller Inhalt'}\n\n`;

    if (content) {
      desc += `${content}\n\n`;
    }

    if (keyPoints && keyPoints.length > 0) {
      desc += `Schlüsselpunkte:\n`;
      keyPoints.forEach((point, index) => {
        desc += `• ${point}\n`;
      });
      desc += `\n`;
    }

    if (callToAction) {
      desc += `${callToAction}\n\n`;
    }

    desc += `Weitere Insights: [Folgen Sie uns]\n`;
    desc += `Diskussion: [Kommentare erwünscht]`;

    return desc.substring(0, config.maxDescriptionLength);
  }

  /**
   * Optimiert den Post-Titel
   * @param {string} title - Originaltitel
   * @param {Object} config - Konfiguration
   * @returns {string} Optimierter Titel
   */
  optimizePostTitle(title, config) {
    // Für LinkedIn verwenden wir eine professionellere Formatierung
    return title
      .replace(/[^\w\s\-äöüÄÖÜß:]/g, '') // Erlaube Doppelpunkt für professionelle Titel
      .substring(0, config.maxTitleLength);
  }

  /**
   * Extrahiert LinkedIn-Keywords
   * @param {Object} postData - Postdaten
   * @param {Object} config - Konfiguration
   * @returns {Array} Keywords
   */
  extractLinkedInKeywords(postData, config) {
    const keywords = new Set();

    if (postData.title) {
      postData.title.split(/\s+/).forEach(word => {
        if (word.length > 4) { // Längere Wörter für professionellen Kontext
          keywords.add(word);
        }
      });
    }

    if (postData.industry) {
      keywords.add(postData.industry);
    }

    if (postData.profession) {
      keywords.add(postData.profession);
    }

    // Füge Ziel-Keywords hinzu
    config.targetKeywords.forEach(keyword => keywords.add(keyword));

    // Filtere ausgeschlossene Wörter
    return Array.from(keywords)
      .filter(keyword => !config.excludeWords.includes(keyword.toLowerCase()))
      .slice(0, 20); // Weniger Keywords für LinkedIn
  }

  /**
   * Generiert LinkedIn-Tags
   * @param {Object} postData - Postdaten
   * @param {Object} config - Konfiguration
   * @returns {Array} Tags
   */
  generateLinkedInTags(postData, config) {
    const tags = new Set();

    if (postData.industry) {
      tags.add(postData.industry);
    }

    if (postData.profession) {
      tags.add(postData.profession);
    }

    // Füge allgemeine Business-Tags hinzu
    ['Business', 'Professional', 'Leadership', 'Innovation'].forEach(tag => tags.add(tag));

    return Array.from(tags).slice(0, 15); // Weniger Tags für LinkedIn
  }
}

module.exports = SEOLinkedInOptimizationService;