const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { v4: uuidv4 } = require('uuid');

/**
 * Premium Thumbnail Generation Service with Branding Integration
 * Erstellt hochwertige, markenkonforme Thumbnails für maximale Klickrate und Monetarisierung
 */
class ThumbnailGenerationService {
  constructor(options = {}) {
    // Allow customization of directories
    this.thumbnailsDir = options.thumbnailsDir || path.join(__dirname, 'data/thumbnails');
    this.templatesDir = path.join(this.thumbnailsDir, 'templates');
    this.generatedDir = path.join(this.thumbnailsDir, 'generated');
    this.fontsDir = path.join(this.thumbnailsDir, 'fonts');
    this.logosDir = path.join(this.thumbnailsDir, 'logos');
    this.iconsDir = path.join(this.thumbnailsDir, 'icons');

    // Premium-Konfiguration für professionelle Thumbnails mit Branding
    this.config = {
      dimensions: {
        youtube: { width: 1280, height: 720 },
        shorts: { width: 1080, height: 1920 },
        standard: { width: 1280, height: 720 },
        banner: { width: 2560, height: 1440 }
      },
      templates: {
        premiumClickbait: {
          name: "Premium Clickbait",
          description: "Hochwertiges Clickbait-Design für maximale Klickrate",
          layers: ["background", "gradient_overlay", "text_overlay", "cta_elements", "branding"],
          category: "monetization",
          priority: "high"
        },
        cinematic: {
          name: "Cinematic Design",
          description: "Filmisches Design für professionelle Inhalte",
          layers: ["background", "cinematic_overlay", "text_overlay", "branding"],
          category: "professional",
          priority: "medium"
        },
        boldMinimal: {
          name: "Bold Minimal",
          description: "Klares, reduziertes Design mit starker visueller Wirkung",
          layers: ["background", "accent_elements", "text_overlay", "branding"],
          category: "professional",
          priority: "high"
        },
        dynamicSplit: {
          name: "Dynamic Split",
          description: "Dynamisches Split-Screen-Design mit Bewegung",
          layers: ["background_left", "background_right", "divider", "text_overlay", "branding"],
          category: "entertainment",
          priority: "medium"
        },
        gradientImpact: {
          name: "Gradient Impact",
          description: "Starker Farbverlauf mit maximalem visuellem Impact",
          layers: ["gradient_background", "text_overlay", "highlight_elements", "branding"],
          category: "monetization",
          priority: "high"
        }
      },
      fonts: {
        primary: 'Helvetica',
        secondary: 'Arial',
        heading: 'Impact',
        accent: 'Georgia',
        sizes: {
          headline: 80,
          title: 65,
          subtitle: 50,
          body: 35,
          tagline: 30,
          small: 25
        }
      },
      colors: {
        // Premium-Farbpalette
        primary: '#E50914', // Netflix-Rot
        secondary: '#FFFFFF', // Reines Weiß
        accent: '#B00000', // Dunkleres Rot
        background: '#000000', // Reines Schwarz
        highlight: '#FFD700', // Gold
        success: '#00C853', // Grün
        warning: '#FFAB00', // Orange
        danger: '#D50000', // Dunkelrot
        // Gradient-Farben
        gradientStart: '#8E2DE2', // Lila
        gradientEnd: '#4A00E0', // Dunkles Lila
        cinematicStart: '#000428', // Dunkelblau
        cinematicEnd: '#004e92' // Mittelblau
      },
      effects: {
        shadow: {
          color: 'rgba(0, 0, 0, 0.8)',
          blur: 15,
          offset: 8
        },
        glow: {
          color: 'rgba(255, 215, 0, 0.6)',
          blur: 20
        },
        vignette: {
          strength: 0.4
        }
      },
      branding: {
        logo: {
          default: 'placeholder',
          position: 'top-right',
          size: 'medium',
          margin: 30
        },
        watermark: {
          enabled: true,
          text: 'CHANNEL',
          position: 'bottom-left',
          opacity: 0.7
        },
        colorScheme: 'primary'
      },
      monetization: {
        ctrThresholds: {
          high: 7.0,
          medium: 3.0,
          low: 1.0
        },
        qualityThresholds: {
          high: 85,
          medium: 70,
          low: 50
        }
      }
    };

    this.ensureDirectories();
    this.loadConfiguration();
    this.initializeFonts();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [this.thumbnailsDir, this.templatesDir, this.generatedDir, this.fontsDir, this.logosDir, this.iconsDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load thumbnail configuration
   */
  loadConfiguration() {
    try {
      const configPath = path.join(this.thumbnailsDir, 'config.json');
      if (fs.existsSync(configPath)) {
        const loadedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // Merge with default config
        this.config = { ...this.config, ...loadedConfig };
        this.saveConfiguration();
      }
    } catch (error) {
      console.error('❌ Failed to load thumbnail config:', error);
      // Keep default config
    }
  }

  /**
   * Save thumbnail configuration
   */
  saveConfiguration() {
    try {
      const configPath = path.join(this.thumbnailsDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('❌ Failed to save thumbnail config:', error);
    }
  }

  /**
   * Initialize fonts (if needed)
   */
  initializeFonts() {
    // In a real implementation, you would register actual font files
    try {
      // Check for common system fonts
      const systemFonts = [
        { name: 'Helvetica', file: 'helvetica.ttf' },
        { name: 'Arial', file: 'arial.ttf' },
        { name: 'Impact', file: 'impact.ttf' },
        { name: 'Georgia', file: 'georgia.ttf' }
      ];

      // In a standalone version, we'll skip font registration
      // In a full implementation, you would register fonts like this:
      // systemFonts.forEach(font => {
      //   const fontPath = path.join(this.fontsDir, font.file);
      //   if (fs.existsSync(fontPath)) {
      //     registerFont(fontPath, { family: font.name });
      //   }
      // });
    } catch (error) {
      console.warn('⚠️ Font initialization warning:', error);
    }
  }

  /**
   * Generate a thumbnail with text overlay
   * @param {Object} options - Generation options
   * @returns {Object} Generated thumbnail info
   */
  async generateThumbnail(options = {}) {
    try {
      const {
        title = 'Default Title',
        subtitle = '',
        template = 'boldMinimal',
        platform = 'youtube',
        outputPath = null,
        backgroundColor = this.config.colors.background,
        textColor = this.config.colors.secondary,
        accentColor = this.config.colors.primary
      } = options;

      // Get canvas dimensions
      const dimensions = this.config.dimensions[platform] || this.config.dimensions.standard;
      const canvas = createCanvas(dimensions.width, dimensions.height);
      const ctx = canvas.getContext('2d');

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Apply template-specific styling
      const templateConfig = this.config.templates[template];
      if (templateConfig) {
        this.applyTemplateStyling(ctx, dimensions, templateConfig, accentColor);
      }

      // Draw text
      this.drawText(ctx, dimensions, title, subtitle, textColor);

      // Generate output path if not provided
      const finalOutputPath = outputPath || path.join(this.generatedDir, `${uuidv4()}.png`);

      // Save the thumbnail
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(finalOutputPath, buffer);

      return {
        success: true,
        path: finalOutputPath,
        dimensions,
        template,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Apply template-specific styling
   * @param {Object} ctx - Canvas context
   * @param {Object} dimensions - Canvas dimensions
   * @param {Object} templateConfig - Template configuration
   * @param {string} accentColor - Accent color
   */
  applyTemplateStyling(ctx, dimensions, templateConfig, accentColor) {
    // Apply gradient overlay for certain templates
    if (templateConfig.name === 'Gradient Impact') {
      const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      gradient.addColorStop(0, this.config.colors.gradientStart);
      gradient.addColorStop(1, this.config.colors.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    }

    // Apply cinematic overlay for cinematic template
    if (templateConfig.name === 'Cinematic Design') {
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, this.config.colors.cinematicStart);
      gradient.addColorStop(1, this.config.colors.cinematicEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    }

    // Add accent elements for bold minimal template
    if (templateConfig.name === 'Bold Minimal') {
      ctx.fillStyle = accentColor;
      ctx.fillRect(dimensions.width * 0.1, dimensions.height * 0.85, dimensions.width * 0.8, 8);
    }
  }

  /**
   * Draw text on canvas
   * @param {Object} ctx - Canvas context
   * @param {Object} dimensions - Canvas dimensions
   * @param {string} title - Main title
   * @param {string} subtitle - Subtitle
   * @param {string} textColor - Text color
   */
  drawText(ctx, dimensions, title, subtitle, textColor) {
    // Configure text styling
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw title
    ctx.font = `bold ${this.config.fonts.sizes.title}px ${this.config.fonts.heading}`;
    ctx.fillText(title, dimensions.width / 2, dimensions.height / 2);

    // Draw subtitle if provided
    if (subtitle) {
      ctx.font = `${this.config.fonts.sizes.subtitle}px ${this.config.fonts.primary}`;
      ctx.fillText(subtitle, dimensions.width / 2, dimensions.height / 2 + 80);
    }
  }

  /**
   * Get available templates
   * @returns {Object} Available templates
   */
  getAvailableTemplates() {
    return this.config.templates;
  }

  /**
   * Get configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfiguration();
  }
}

module.exports = ThumbnailGenerationService;