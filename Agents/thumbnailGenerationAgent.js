const fs = require('fs');
const path = require('path');

/**
 * Thumbnail Generation Service
 * Handles generation of video thumbnails
 */
class ThumbnailGenerationService {
  constructor() {
    this.thumbnailsDir = path.join(__dirname, '../../data/thumbnails');
    this.templateDir = path.join(__dirname, '../../data/templates');
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.thumbnailsDir, this.templateDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate thumbnails for content
   */
  async generateThumbnails(contentData, options = {}) {
    try {
      console.log(`🖼️ Generating thumbnails for: ${contentData.title || 'Untitled'}`);

      const {
        count = 3,
        style = 'modern',
        includeBranding = true,
        platform = 'youtube'
      } = options;

      // Generate multiple thumbnail options
      const thumbnails = [];
      for (let i = 0; i < count; i++) {
        const thumbnail = await this.createThumbnail(contentData, {
          index: i,
          style,
          includeBranding,
          platform
        });
        thumbnails.push(thumbnail);
      }

      // Save thumbnails
      this.saveThumbnails(contentData.contentId, thumbnails);

      console.log(`✅ Generated ${thumbnails.length} thumbnails for: ${contentData.title || 'Untitled'}`);

      return {
        contentId: contentData.contentId,
        thumbnails,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a single thumbnail for content
   */
  async generateThumbnail(contentData, options = {}) {
    try {
      console.log(`🖼️ Generating single thumbnail for: ${contentData.title || 'Untitled'}`);

      const {
        style = 'modern',
        includeBranding = true,
        platform = 'youtube'
      } = options;

      // Generate a single thumbnail
      const thumbnail = await this.createThumbnail(contentData, {
        index: 0,
        style,
        includeBranding,
        platform
      });

      // Save thumbnail
      this.saveThumbnails(contentData.contentId, [thumbnail]);

      console.log(`✅ Generated single thumbnail for: ${contentData.title || 'Untitled'}`);

      return thumbnail;
    } catch (error) {
      console.error('❌ Single thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Create a single thumbnail
   */
  async createThumbnail(contentData, options) {
    const {
      index,
      style,
      includeBranding,
      platform
    } = options;

    // Extract key information for thumbnail
    const title = contentData.title || 'Untitled';
    const keywords = contentData.keywords || contentData.trendingKeywords || [];
    const contentType = contentData.contentType || 'general';

    // Generate thumbnail design elements
    const design = this.generateDesignElements(title, keywords, contentType, style);

    // Create thumbnail metadata
    const thumbnail = {
      id: `thumb_${contentData.contentId}_${index}`,
      title: this.optimizeTitleForThumbnail(title),
      design,
      style,
      platform,
      includeBranding,
      createdAt: new Date().toISOString()
    };

    return thumbnail;
  }

  /**
   * Generate design elements for thumbnail
   */
  generateDesignElements(title, keywords, contentType, style) {
    // Color scheme based on content type
    const colorSchemes = {
      'tutorial': { primary: '#4A90E2', secondary: '#50E3C2', accent: '#F5A623' },
      'review': { primary: '#E91E63', secondary: '#9C27B0', accent: '#FFEB3B' },
      'explanation': { primary: '#2196F3', secondary: '#00BCD4', accent: '#009688' },
      'news': { primary: '#FF5722', secondary: '#FF9800', accent: '#FFC107' },
      'general': { primary: '#9E9E9E', secondary: '#607D8B', accent: '#795548' }
    };

    // Layout based on style
    const layouts = {
      'modern': 'clean',
      'bold': 'highContrast',
      'minimal': 'simple',
      'busy': 'informationRich'
    };

    // Icon suggestions based on keywords
    const iconSuggestions = this.suggestIcons(keywords, contentType);

    return {
      colorScheme: colorSchemes[contentType] || colorSchemes.general,
      layout: layouts[style] || 'clean',
      iconSuggestions,
      fontSize: this.calculateFontSize(title),
      textPosition: 'center',
      hasOverlay: true
    };
  }

  /**
   * Suggest icons based on keywords and content type
   */
  suggestIcons(keywords, contentType) {
    const iconMap = {
      'ai': ['🤖', '💻', '🧠'],
      'blockchain': ['🔗', '⛓️', '💰'],
      'tutorial': ['🎓', '📘', '✏️'],
      'review': ['⭐', '🔍', '✅'],
      'news': ['📰', '📢', '🔥'],
      'tech': ['🖥️', '📱', '⚡']
    };

    const suggestions = [];

    // Add icons based on keywords
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      Object.keys(iconMap).forEach(key => {
        if (lowerKeyword.includes(key) && iconMap[key]) {
          suggestions.push(...iconMap[key]);
        }
      });
    });

    // Add icons based on content type
    if (iconMap[contentType] && suggestions.length < 3) {
      suggestions.push(...iconMap[contentType]);
    }

    // Return unique icons, limit to 3
    return [...new Set(suggestions)].slice(0, 3);
  }

  /**
   * Optimize title for thumbnail display
   */
  optimizeTitleForThumbnail(title) {
    // Limit to 50 characters for better thumbnail readability
    if (title.length <= 50) {
      return title;
    }

    // Truncate and add ellipsis
    return title.substring(0, 47) + '...';
  }

  /**
   * Calculate optimal font size based on title length
   */
  calculateFontSize(title) {
    const length = title.length;

    if (length <= 20) return 48;  // Large font for short titles
    if (length <= 40) return 36;  // Medium font for medium titles
    if (length <= 60) return 28;  // Smaller font for longer titles
    return 24;                    // Smallest font for very long titles
  }

  /**
   * Save thumbnails to file
   */
  saveThumbnails(contentId, thumbnails) {
    try {
      const filePath = path.join(this.thumbnailsDir, `${contentId}_thumbnails.json`);
      fs.writeFileSync(filePath, JSON.stringify(thumbnails, null, 2));
      console.log(`✅ Thumbnails saved for content: ${contentId}`);
    } catch (error) {
      console.error('❌ Failed to save thumbnails:', error);
    }
  }

  /**
   * Load thumbnails from file
   */
  loadThumbnails(contentId) {
    try {
      const filePath = path.join(this.thumbnailsDir, `${contentId}_thumbnails.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load thumbnails:', error);
      return null;
    }
  }

  /**
   * Generate thumbnail variations for A/B testing
   */
  async generateABTestVariations(contentData, baseThumbnail, variations = 3) {
    try {
      console.log(`🔬 Generating A/B test variations for thumbnail: ${baseThumbnail.id}`);

      const testVariations = [];

      // Generate variations with different styles
      const styles = ['modern', 'bold', 'minimal'];
      for (let i = 0; i < Math.min(variations, styles.length); i++) {
        const variation = await this.createThumbnail(contentData, {
          index: i + 100, // Different index to avoid conflicts
          style: styles[i],
          includeBranding: baseThumbnail.includeBranding,
          platform: baseThumbnail.platform
        });

        // Add variation metadata
        variation.variationId = `var_${i + 1}`;
        variation.testGroup = String.fromCharCode(65 + i); // A, B, C, etc.

        testVariations.push(variation);
      }

      console.log(`✅ Generated ${testVariations.length} A/B test variations`);

      return {
        baseThumbnail,
        variations: testVariations,
        testId: `test_${contentData.contentId}_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to generate A/B test variations:', error);
      throw error;
    }
  }
}

module.exports = ThumbnailGenerationService;