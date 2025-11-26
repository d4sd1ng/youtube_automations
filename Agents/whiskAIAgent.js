const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Whisk AI Service
 * Integration mit Google Labs' Whisk AI für die Verbesserung von Textbeschreibungen
 * und die Generierung visueller Konzepte für Thumbnails
 *
 * Hinweis: Whisk AI ist derzeit ein experimentelles Tool von Google Labs ohne öffentliche API.
 * Die aktuelle Implementierung verwendet simulierte Funktionalität, die bei Verfügbarkeit
 * einer öffentlichen API durch echte API-Aufrufe ersetzt werden kann.
 */
class WhiskAIService {
  constructor() {
    this.configPath = path.join(__dirname, 'aiToolsConfig.json');
    this.loadConfiguration();
  }

  /**
   * Load AI tools configuration
   */
  loadConfiguration() {
    try {
      if (fs.existsSync(this.configPath)) {
        this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } else {
        this.config = {
          whiskAI: {
            enabled: true,
            baseUrl: "https://labs.google.com/whisk",
            experimental: true,
            dailyLimit: 100,
            currentUsage: 0,
            lastReset: new Date().toISOString().split('T')[0],
            features: {
              promptOptimization: true,
              visualConceptGeneration: true
            },
            limits: {
              dailyPromptOptimizations: 50,
              dailyVisualConcepts: 50
            }
          },
          budget: {
            monthlyLimit: 100,
            currentSpent: 0,
            currency: "EUR"
          }
        };
        this.saveConfiguration();
      }

      // Reset daily usage if needed
      const today = new Date().toISOString().split('T')[0];
      if (this.config.whiskAI.lastReset !== today) {
        this.config.whiskAI.currentUsage = 0;
        this.config.whiskAI.lastReset = today;
        this.saveConfiguration();
      }
    } catch (error) {
      console.error('❌ Failed to load AI tools config:', error);
      this.config = {};
    }
  }

  /**
   * Save AI tools configuration
   */
  saveConfiguration() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('❌ Failed to save AI tools config:', error);
    }
  }

  /**
   * Optimize prompt using Whisk AI
   * @param {string} prompt - Original prompt to optimize
   * @param {object} options - Additional options for optimization
   * @returns {Promise<string>} Optimized prompt
   */
  async optimizePrompt(prompt, options = {}) {
    try {
      // Check if Whisk AI is enabled and within limits
      if (!this.config.whiskAI.enabled) {
        console.log('⏭️  Whisk AI is disabled, returning original prompt');
        return prompt;
      }

      // Check if prompt optimization feature is enabled
      if (!this.config.whiskAI.features || !this.config.whiskAI.features.promptOptimization) {
        console.log('⏭️  Whisk AI prompt optimization feature is disabled, returning original prompt');
        return prompt;
      }

      // Check daily limit for prompt optimizations
      if (this.config.whiskAI.currentUsage >= this.config.whiskAI.limits.dailyPromptOptimizations) {
        console.log('⏭️  Whisk AI daily prompt optimization limit reached, returning original prompt');
        return prompt;
      }

      // For now, we'll simulate the optimization since Whisk AI is experimental
      // In a real implementation, this would call the Whisk AI API
      console.log(`🔍 Optimizing prompt with Whisk AI: "${prompt}"`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple prompt enhancement logic (in real implementation, this would be replaced with actual API call)
      const optimizedPrompt = this.enhancePrompt(prompt, options);

      // Update usage counter
      this.config.whiskAI.currentUsage++;
      this.saveConfiguration();

      console.log(`✅ Prompt optimized: "${optimizedPrompt}"`);
      return optimizedPrompt;
    } catch (error) {
      console.error('❌ Failed to optimize prompt with Whisk AI:', error);
      return prompt; // Return original prompt if optimization fails
    }
  }

  /**
   * Enhance prompt with better descriptions
   * @param {string} prompt - Original prompt
   * @param {object} options - Enhancement options
   * @returns {string} Enhanced prompt
   */
  enhancePrompt(prompt, options = {}) {
    // This is a simplified enhancement logic
    // In a real implementation, this would be replaced with actual Whisk AI API integration

    const enhancements = [
      "high quality",
      "professional",
      "detailed",
      "sharp focus",
      "vibrant colors",
      "studio lighting"
    ];

    // Add some enhancements based on content type
    if (options.contentType) {
      switch(options.contentType) {
        case 'political':
          enhancements.push("political theme", "serious tone", "news style");
          break;
        case 'tutorial':
          enhancements.push("educational", "clear", "step-by-step");
          break;
        case 'entertainment':
          enhancements.push("fun", "engaging", "colorful");
          break;
        case 'short':
          enhancements.push("eye-catching", "dynamic", "attention-grabbing");
          break;
      }
    }

    // Add platform-specific enhancements
    if (options.platform) {
      switch(options.platform) {
        case 'youtube':
          enhancements.push("youtube thumbnail style", "clickable design");
          break;
        case 'youtube_shorts':
          enhancements.push("vertical format", "mobile-optimized", "short-form content");
          break;
        case 'linkedin':
          enhancements.push("professional", "business-oriented", "clean design");
          break;
      }
    }

    // Create enhanced prompt
    const enhancedPrompt = `${prompt}, ${enhancements.join(', ')}`;
    return enhancedPrompt;
  }

  /**
   * Generate visual concept using Whisk AI
   * @param {object} thumbnailData - Data about the thumbnail to generate
   * @param {object} options - Generation options
   * @returns {Promise<object>} Generated visual concept
   */
  async generateVisualConcept(thumbnailData, options = {}) {
    try {
      // Check if Whisk AI is enabled and within limits
      if (!this.config.whiskAI.enabled) {
        console.log('⏭️  Whisk AI is disabled, returning basic concept');
        return this.createBasicConcept(thumbnailData);
      }

      // Check if visual concept generation feature is enabled
      if (!this.config.whiskAI.features || !this.config.whiskAI.features.visualConceptGeneration) {
        console.log('⏭️  Whisk AI visual concept generation feature is disabled, returning basic concept');
        return this.createBasicConcept(thumbnailData);
      }

      // Check daily limit for visual concepts
      if (this.config.whiskAI.currentUsage >= this.config.whiskAI.limits.dailyVisualConcepts) {
        console.log('⏭️  Whisk AI daily visual concept limit reached, returning basic concept');
        return this.createBasicConcept(thumbnailData);
      }

      console.log(`🎨 Generating visual concept with Whisk AI for: "${thumbnailData.title}"`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create visual concept (in real implementation, this would call Whisk AI API)
      const visualConcept = this.createVisualConcept(thumbnailData, options);

      // Update usage counter
      this.config.whiskAI.currentUsage++;
      this.saveConfiguration();

      console.log('✅ Visual concept generated');
      return visualConcept;
    } catch (error) {
      console.error('❌ Failed to generate visual concept with Whisk AI:', error);
      return this.createBasicConcept(thumbnailData); // Return basic concept if generation fails
    }
  }

  /**
   * Create basic visual concept when Whisk AI is not available
   * @param {object} thumbnailData - Data about the thumbnail
   * @returns {object} Basic visual concept
   */
  createBasicConcept(thumbnailData) {
    return {
      subject: thumbnailData.title,
      scene: "professional studio setting",
      style: "modern and clean",
      mood: "engaging and informative",
      elements: [
        "text overlay",
        "branding elements",
        "contrasting colors"
      ]
    };
  }

  /**
   * Create visual concept for thumbnail
   * @param {object} thumbnailData - Data about the thumbnail
   * @param {object} options - Generation options
   * @returns {object} Visual concept
   */
  createVisualConcept(thumbnailData, options = {}) {
    // This is a simplified concept generation
    // In a real implementation, this would be replaced with actual Whisk AI API integration

    const concepts = {
      subject: thumbnailData.title,
      scene: this.determineScene(thumbnailData.contentType),
      style: this.determineStyle(thumbnailData.contentType),
      mood: this.determineMood(thumbnailData.contentType),
      elements: this.determineElements(thumbnailData.contentType, options.platform)
    };

    return concepts;
  }

  /**
   * Determine scene based on content type
   * @param {string} contentType - Type of content
   * @returns {string} Scene description
   */
  determineScene(contentType) {
    const scenes = {
      political: "newsroom or political debate setting",
      tutorial: "classroom or home office environment",
      entertainment: "colorful and dynamic background",
      short: "mobile-optimized vertical layout",
      default: "professional studio setting"
    };

    return scenes[contentType] || scenes.default;
  }

  /**
   * Determine style based on content type
   * @param {string} contentType - Type of content
   * @returns {string} Style description
   */
  determineStyle(contentType) {
    const styles = {
      political: "serious and professional",
      tutorial: "educational and clear",
      entertainment: "vibrant and engaging",
      short: "eye-catching and dynamic",
      default: "modern and clean"
    };

    return styles[contentType] || styles.default;
  }

  /**
   * Determine mood based on content type
   * @param {string} contentType - Type of content
   * @returns {string} Mood description
   */
  determineMood(contentType) {
    const moods = {
      political: "informative and authoritative",
      tutorial: "helpful and approachable",
      entertainment: "fun and exciting",
      short: "attention-grabbing and energetic",
      default: "engaging and informative"
    };

    return moods[contentType] || moods.default;
  }

  /**
   * Determine elements based on content type and platform
   * @param {string} contentType - Type of content
   * @param {string} platform - Target platform
   * @returns {array} List of elements
   */
  determineElements(contentType, platform) {
    let elements = ["text overlay", "branding elements"];

    if (platform === 'youtube_shorts') {
      elements.push("vertical format", "mobile-optimized");
    } else if (platform === 'linkedin') {
      elements.push("professional design", "clean layout", "business-oriented");
    }

    switch(contentType) {
      case 'political':
        elements.push("serious color scheme", "news-style graphics");
        break;
      case 'tutorial':
        elements.push("educational icons", "step-by-step indicators");
        break;
      case 'entertainment':
        elements.push("vibrant colors", "dynamic shapes");
        break;
      case 'short':
        elements.push("attention-grabbing elements", "quick-read text");
        break;
      default:
        elements.push("contrasting colors", "clear hierarchy");
    }

    return elements;
  }

  /**
   * Get Whisk AI usage statistics
   * @returns {object} Usage statistics
   */
  getUsageStats() {
    return {
      enabled: this.config.whiskAI.enabled,
      dailyLimit: this.config.whiskAI.dailyLimit,
      currentUsage: this.config.whiskAI.currentUsage,
      remainingUsage: this.config.whiskAI.dailyLimit - this.config.whiskAI.currentUsage,
      lastReset: this.config.whiskAI.lastReset,
      features: this.config.whiskAI.features,
      limits: this.config.whiskAI.limits
    };
  }

  /**
   * Reset daily usage counter
   * This method can be called manually or by a scheduled task
   */
  resetDailyUsage() {
    this.config.whiskAI.currentUsage = 0;
    this.config.whiskAI.lastReset = new Date().toISOString().split('T')[0];
    this.saveConfiguration();
    console.log('🔄 Whisk AI daily usage counter reset');
  }

  /**
   * Check if Whisk AI is available for use based on limits and budget
   * @returns {boolean} Availability status
   */
  isAvailable() {
    // Check if enabled
    if (!this.config.whiskAI.enabled) {
      return false;
    }

    // Check daily limit
    if (this.config.whiskAI.currentUsage >= this.config.whiskAI.dailyLimit) {
      return false;
    }

    // Check budget
    if (this.config.budget && this.config.budget.currentSpent >= this.config.budget.monthlyLimit) {
      return false;
    }

    return true;
  }
}

module.exports = WhiskAIService;