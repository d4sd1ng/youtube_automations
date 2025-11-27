const fs = require('fs');
const path = require('path');

/**
 * Graphics Coordinator for Book Writer Agent
 * Coordinates professional graphics integration for books
 */
class GraphicsCoordinator {
  constructor(config = {}, imageGenerator = null) {
    this.config = {
      defaultStyle: 'professional',
      outputDir: path.join(__dirname, '../../../data/media/graphics'),
      ...config
    };

    // Inject or create ImageGenerator instance
    this.imageGenerator = imageGenerator || new (require('./ImageGenerator'))();

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Conduct image requirements interview
   * @param {Object} bookContent - Book content to analyze for image requirements
   * @returns {Promise<Array>} Image requirements
   */
  async conductImageInterview(bookContent) {
    console.log('🖼️ Conducting image requirements interview');

    try {
      const requirements = await this.analyzeBookForImageRequirements(bookContent);

      console.log(`✅ Image interview completed: ${requirements.length} requirements identified`);
      return requirements;
    } catch (error) {
      console.error('❌ Failed to conduct image interview:', error.message);
      throw error;
    }
  }

  /**
   * Analyze book content for image requirements
   */
  async analyzeBookForImageRequirements(bookContent) {
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const requirements = [];

    // Analyze chapters for image opportunities
    if (bookContent.chapters && Array.isArray(bookContent.chapters)) {
      for (const chapter of bookContent.chapters) {
        // Identify image opportunities based on chapter content
        const opportunities = this.identifyImageOpportunities(chapter);

        for (const opportunity of opportunities) {
          requirements.push({
            chapter: chapter.number,
            chapterTitle: chapter.title,
            description: opportunity.description,
            type: opportunity.type,
            style: this.determineImageStyle(chapter),
            quality: 'standard',
            context: opportunity.context
          });
        }
      }
    }

    // Add book cover requirement
    requirements.push({
      chapter: 0,
      description: `Book cover for "${bookContent.title}"`,
      type: 'cover',
      style: 'professional',
      quality: 'premium',
      context: 'Book cover design'
    });

    return requirements;
  }

  /**
   * Identify image opportunities in chapter content
   */
  identifyImageOpportunities(chapter) {
    const opportunities = [];

    // Simple keyword-based identification
    const content = (chapter.content || '').toLowerCase();

    if (content.includes('diagram') || content.includes('chart')) {
      opportunities.push({
        description: `Diagram illustrating concepts from "${chapter.title}"`,
        type: 'diagram',
        context: 'Data visualization'
      });
    }

    if (content.includes('process') || content.includes('workflow')) {
      opportunities.push({
        description: `Workflow diagram for process described in "${chapter.title}"`,
        type: 'workflow',
        context: 'Process visualization'
      });
    }

    if (content.includes('comparison') || content.includes('contrast')) {
      opportunities.push({
        description: `Comparison chart for concepts in "${chapter.title}"`,
        type: 'chart',
        context: 'Comparative analysis'
      });
    }

    // Add a generic image if the chapter is substantial
    if (chapter.wordCount > 1000) {
      opportunities.push({
        description: `Illustrative image for "${chapter.title}"`,
        type: 'illustration',
        context: 'Chapter visualization'
      });
    }

    return opportunities;
  }

  /**
   * Determine appropriate image style based on chapter
   */
  determineImageStyle(chapter) {
    // Simple style determination based on chapter type
    if (chapter.type === 'technical') {
      return 'technical';
    } else if (chapter.type === 'introductory') {
      return 'illustrative';
    } else {
      return this.config.defaultStyle;
    }
  }

  /**
   * Generate professional images based on requirements
   * @param {Array} requirements - Image requirements
   * @returns {Promise<Array>} Generated images
   */
  async generateProfessionalImages(requirements) {
    console.log(`🎨 Generating ${requirements.length} professional images`);

    try {
      const generatedImages = await this.imageGenerator.batchGenerate(requirements);

      // Save graphics coordination data
      await this.saveGraphicsData({
        requirements,
        generatedImages,
        generatedAt: new Date().toISOString()
      });

      console.log(`✅ Professional images generated: ${generatedImages.filter(img => img.success).length}/${generatedImages.length} successful`);
      return generatedImages;
    } catch (error) {
      console.error('❌ Failed to generate professional images:', error.message);
      throw error;
    }
  }

  /**
   * Create visual content plan
   * @param {Object} bookContent - Book content
   * @returns {Promise<Object>} Visual content plan
   */
  async createVisualContentPlan(bookContent) {
    console.log('📋 Creating visual content plan');

    try {
      // Conduct image interview
      const requirements = await this.conductImageInterview(bookContent);

      // Generate images
      const generatedImages = await this.generateProfessionalImages(requirements);

      // Create plan
      const plan = {
        bookTitle: bookContent.title,
        totalRequirements: requirements.length,
        fulfilledRequirements: generatedImages.filter(img => img.success).length,
        requirements: requirements,
        generatedImages: generatedImages,
        createdAt: new Date().toISOString()
      };

      // Save plan
      await this.saveVisualContentPlan(plan);

      console.log('✅ Visual content plan created');
      return plan;
    } catch (error) {
      console.error('❌ Failed to create visual content plan:', error.message);
      throw error;
    }
  }

  /**
   * Save graphics data
   */
  async saveGraphicsData(data) {
    try {
      const filename = `graphics-coordination-${Date.now()}.json`;
      const filepath = path.join(this.config.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Graphics data saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save graphics data:', error.message);
    }
  }

  /**
   * Save visual content plan
   */
  async saveVisualContentPlan(plan) {
    try {
      const filename = `visual-content-plan-${this.sanitizeFilename(plan.bookTitle)}.json`;
      const filepath = path.join(this.config.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(plan, null, 2));
      console.log(`💾 Visual content plan saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save visual content plan:', error.message);
    }
  }

  /**
   * Load visual content plan
   */
  async loadVisualContentPlan(bookTitle) {
    try {
      const filename = `visual-content-plan-${this.sanitizeFilename(bookTitle)}.json`;
      const filepath = path.join(this.config.outputDir, filename);

      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load visual content plan:', error.message);
      return null;
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get graphics coordination statistics
   */
  getStats() {
    try {
      const files = fs.readdirSync(this.config.outputDir)
        .filter(f => f.startsWith('visual-content-plan-') && f.endsWith('.json'));

      const imageStats = this.imageGenerator.getStats();

      return {
        totalPlans: files.length,
        imageStats: imageStats,
        outputDir: this.config.outputDir
      };
    } catch (error) {
      console.error('❌ Failed to get graphics coordination stats:', error.message);
      return { totalPlans: 0, imageStats: {}, error: error.message };
    }
  }
}

module.exports = GraphicsCoordinator;