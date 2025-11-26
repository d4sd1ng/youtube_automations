const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Genspark Service
 * Integration mit Genspark API für die Erstellung von Thumbnails und Bildverbesserung
 *
 * Hinweis: Genspark ist ein kommerzieller Service, der je nach Tarif unterschiedliche Funktionen bietet.
 * Die aktuelle Implementierung verwendet die API für statische Thumbnail-Generierung.
 */
class GensparkService {
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
          genspark: {
            enabled: true,
            baseUrl: "https://api.genspark.ai",
            apiKey: "",
            tier: "free",
            monthlyLimit: 100,
            currentUsage: 0,
            costPerThumbnail: 0.05,
            dailyLimit: 50,
            features: {
              staticThumbnailGeneration: true,
              imageEnhancement: true
            },
            limits: {
              dailyStaticThumbnails: 30,
              dailyImageEnhancements: 20
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
      if (this.config.genspark.lastReset !== today) {
        this.config.genspark.currentUsage = 0;
        this.config.genspark.lastReset = today;
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
   * Generate thumbnail using Genspark API
   * @param {string} prompt - Description for thumbnail generation
   * @param {object} options - Additional options for generation
   * @returns {Promise<object>} Generated thumbnail data
   */
  async generateThumbnail(prompt, options = {}) {
    try {
      // Check if Genspark is enabled and within limits
      if (!this.config.genspark.enabled) {
        console.log('⏭️  Genspark is disabled, returning fallback');
        return this.createFallbackThumbnail(prompt);
      }

      // Check if thumbnail generation feature is enabled
      if (!this.config.genspark.features || !this.config.genspark.features.staticThumbnailGeneration) {
        console.log('⏭️  Genspark thumbnail generation feature is disabled, returning fallback');
        return this.createFallbackThumbnail(prompt);
      }

      // Check daily limit for thumbnail generation
      if (this.config.genspark.currentUsage >= this.config.genspark.limits.dailyStaticThumbnails) {
        console.log('⏭️  Genspark daily thumbnail limit reached, returning fallback');
        return this.createFallbackThumbnail(prompt);
      }

      // Check budget
      if (this.config.budget && this.config.budget.currentSpent >= this.config.budget.monthlyLimit) {
        console.log('⏭️  Monthly budget limit reached, returning fallback');
        return this.createFallbackThumbnail(prompt);
      }

      console.log(`🎨 Generating thumbnail with Genspark: "${prompt}"`);

      // Prepare API request
      const apiUrl = `${this.config.genspark.baseUrl}/v1/images/generations`;
      const headers = {
        'Authorization': `Bearer ${this.config.genspark.apiKey}`,
        'Content-Type': 'application/json'
      };

      const requestData = {
        prompt: prompt,
        n: 1,
        size: options.size || "1024x1024",
        response_format: "url"
      };

      // Make API call
      const response = await axios.post(apiUrl, requestData, { headers });

      // Update usage counter and budget
      this.config.genspark.currentUsage++;
      if (this.config.budget) {
        this.config.budget.currentSpent += this.config.genspark.costPerThumbnail;
      }
      this.saveConfiguration();

      console.log('✅ Thumbnail generated with Genspark');

      // Return thumbnail data
      return {
        success: true,
        imageUrl: response.data.data[0].url,
        prompt: prompt,
        cost: this.config.genspark.costPerThumbnail,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to generate thumbnail with Genspark:', error.message);
      return this.createFallbackThumbnail(prompt);
    }
  }

  /**
   * Enhance image using Genspark API
   * @param {string} imageUrl - URL of image to enhance
   * @param {object} options - Enhancement options
   * @returns {Promise<object>} Enhanced image data
   */
  async enhanceImage(imageUrl, options = {}) {
    try {
      // Check if Genspark is enabled and within limits
      if (!this.config.genspark.enabled) {
        console.log('⏭️  Genspark is disabled, returning original image');
        return { imageUrl: imageUrl, enhanced: false };
      }

      // Check if image enhancement feature is enabled
      if (!this.config.genspark.features || !this.config.genspark.features.imageEnhancement) {
        console.log('⏭️  Genspark image enhancement feature is disabled, returning original image');
        return { imageUrl: imageUrl, enhanced: false };
      }

      // Check daily limit for image enhancements
      if (this.config.genspark.currentUsage >= this.config.genspark.limits.dailyImageEnhancements) {
        console.log('⏭️  Genspark daily image enhancement limit reached, returning original image');
        return { imageUrl: imageUrl, enhanced: false };
      }

      // Check budget
      if (this.config.budget && this.config.budget.currentSpent >= this.config.budget.monthlyLimit) {
        console.log('⏭️  Monthly budget limit reached, returning original image');
        return { imageUrl: imageUrl, enhanced: false };
      }

      console.log(`✨ Enhancing image with Genspark: "${imageUrl}"`);

      // Prepare API request
      const apiUrl = `${this.config.genspark.baseUrl}/v1/images/enhancements`;
      const headers = {
        'Authorization': `Bearer ${this.config.genspark.apiKey}`,
        'Content-Type': 'application/json'
      };

      const requestData = {
        image: imageUrl,
        enhancement_type: options.enhancementType || "upscale",
        scale_factor: options.scaleFactor || 2
      };

      // Make API call
      const response = await axios.post(apiUrl, requestData, { headers });

      // Update usage counter and budget
      this.config.genspark.currentUsage++;
      if (this.config.budget) {
        this.config.budget.currentSpent += this.config.genspark.costPerThumbnail; // Same cost as thumbnail
      }
      this.saveConfiguration();

      console.log('✅ Image enhanced with Genspark');

      // Return enhanced image data
      return {
        success: true,
        imageUrl: response.data.data[0].url,
        originalUrl: imageUrl,
        enhancementType: options.enhancementType || "upscale",
        cost: this.config.genspark.costPerThumbnail,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to enhance image with Genspark:', error.message);
      return { imageUrl: imageUrl, enhanced: false };
    }
  }

  /**
   * Create fallback thumbnail when Genspark is not available
   * @param {string} prompt - Prompt for thumbnail
   * @returns {object} Fallback thumbnail data
   */
  createFallbackThumbnail(prompt) {
    return {
      success: false,
      imageUrl: null,
      prompt: prompt,
      fallback: true,
      message: "Genspark nicht verfügbar, Fallback verwendet"
    };
  }

  /**
   * Get Genspark usage statistics
   * @returns {object} Usage statistics
   */
  getUsageStats() {
    return {
      enabled: this.config.genspark.enabled,
      tier: this.config.genspark.tier,
      dailyLimit: this.config.genspark.dailyLimit,
      currentUsage: this.config.genspark.currentUsage,
      remainingUsage: this.config.genspark.limits.dailyStaticThumbnails - this.config.genspark.currentUsage,
      lastReset: this.config.genspark.lastReset,
      features: this.config.genspark.features,
      limits: this.config.genspark.limits,
      budget: this.config.budget
    };
  }

  /**
   * Reset daily usage counter
   * This method can be called manually or by a scheduled task
   */
  resetDailyUsage() {
    this.config.genspark.currentUsage = 0;
    this.config.genspark.lastReset = new Date().toISOString().split('T')[0];
    this.saveConfiguration();
    console.log('🔄 Genspark daily usage counter reset');
  }

  /**
   * Check if Genspark is available for use based on limits and budget
   * @returns {boolean} Availability status
   */
  isAvailable() {
    // Check if enabled
    if (!this.config.genspark.enabled) {
      return false;
    }

    // Check daily limit
    if (this.config.genspark.currentUsage >= this.config.genspark.dailyLimit) {
      return false;
    }

    // Check budget
    if (this.config.budget && this.config.budget.currentSpent >= this.config.budget.monthlyLimit) {
      return false;
    }

    // Check if API key is set
    if (!this.config.genspark.apiKey || this.config.genspark.apiKey === "") {
      return false;
    }

    return true;
  }
}

module.exports = GensparkService;