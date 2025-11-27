const fs = require('fs');
const path = require('path');

/**
 * Visual Content Planner for Book Writer Agent
 * Plans and organizes all visual content for books
 */
class VisualContentPlanner {
  constructor(config = {}) {
    this.config = {
      defaultFormat: 'png',
      defaultDimensions: { width: 1200, height: 800 },
      outputDir: path.join(__dirname, '../../../data/media/visual-plans'),
      ...config
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Create comprehensive visual content plan
   * @param {Object} bookStructure - Book structure and content
   * @returns {Promise<Object>} Visual content plan
   */
  async createComprehensivePlan(bookStructure) {
    console.log('📋 Creating comprehensive visual content plan');

    try {
      // Analyze book structure
      const analysis = await this.analyzeBookStructure(bookStructure);

      // Plan visual elements
      const visualElements = await this.planVisualElements(analysis);

      // Organize by chapter
      const chapterPlans = await this.organizeByChapter(visualElements, bookStructure);

      // Create final plan
      const plan = {
        bookTitle: bookStructure.title,
        totalElements: visualElements.length,
        chapters: chapterPlans,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      // Save plan
      await this.savePlan(plan);

      console.log('✅ Comprehensive visual content plan created');
      return plan;
    } catch (error) {
      console.error('❌ Failed to create comprehensive visual content plan:', error.message);
      throw error;
    }
  }

  /**
   * Analyze book structure for visual opportunities
   */
  async analyzeBookStructure(bookStructure) {
    console.log('🔍 Analyzing book structure for visual opportunities');

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysis = {
      totalChapters: bookStructure.chapters ? bookStructure.chapters.length : 0,
      chapterTypes: this.identifyChapterTypes(bookStructure),
      contentThemes: this.extractContentThemes(bookStructure),
      dataOpportunities: this.identifyDataOpportunities(bookStructure),
      visualDensity: this.calculateVisualDensity(bookStructure)
    };

    return analysis;
  }

  /**
   * Identify chapter types
   */
  identifyChapterTypes(bookStructure) {
    const types = {};

    if (bookStructure.chapters && Array.isArray(bookStructure.chapters)) {
      for (const chapter of bookStructure.chapters) {
        const type = chapter.type || 'general';
        types[type] = (types[type] || 0) + 1;
      }
    }

    return types;
  }

  /**
   * Extract content themes
   */
  extractContentThemes(bookStructure) {
    // Simple theme extraction based on keywords
    const themes = [];
    const content = JSON.stringify(bookStructure).toLowerCase();

    const themeKeywords = {
      'technology': ['ai', 'artificial intelligence', 'machine learning', 'algorithm'],
      'politics': ['government', 'policy', 'legislation', 'parliament', 'bundestag'],
      'business': ['market', 'economy', 'finance', 'investment'],
      'education': ['learning', 'study', 'research', 'academic'],
      'science': ['research', 'experiment', 'discovery', 'scientific']
    };

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      if (matches > 0) {
        themes.push({ theme, relevance: matches });
      }
    }

    return themes.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Identify data visualization opportunities
   */
  identifyDataOpportunities(bookStructure) {
    const opportunities = [];
    const content = JSON.stringify(bookStructure).toLowerCase();

    if (content.includes('statistics') || content.includes('data')) {
      opportunities.push('statistical-charts');
    }

    if (content.includes('timeline') || content.includes('history')) {
      opportunities.push('timeline-diagrams');
    }

    if (content.includes('process') || content.includes('workflow')) {
      opportunities.push('process-diagrams');
    }

    if (content.includes('comparison') || content.includes('versus')) {
      opportunities.push('comparison-charts');
    }

    return opportunities;
  }

  /**
   * Calculate visual density
   */
  calculateVisualDensity(bookStructure) {
    // Simple calculation based on word count and chapter count
    let totalWords = 0;

    if (bookStructure.chapters && Array.isArray(bookStructure.chapters)) {
      totalWords = bookStructure.chapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0);
    }

    // Calculate density (images per 1000 words)
    const density = totalWords > 0 ? Math.max(1, Math.min(5, Math.round(1000 / (totalWords / 3)))) : 3;

    return {
      wordsPerImage: Math.round(totalWords / (bookStructure.chapters?.length || 1) / density),
      recommendedImages: Math.max(3, Math.min(20, bookStructure.chapters?.length || 0 * density)),
      densityLevel: density < 2 ? 'low' : density < 4 ? 'medium' : 'high'
    };
  }

  /**
   * Plan visual elements based on analysis
   */
  async planVisualElements(analysis) {
    console.log('🎨 Planning visual elements');

    // Simulate planning
    await new Promise(resolve => setTimeout(resolve, 1000));

    const elements = [];

    // Add cover image
    elements.push({
      type: 'cover',
      description: 'Professional book cover',
      purpose: 'marketing',
      priority: 'high',
      format: 'png',
      dimensions: { width: 1600, height: 2400 }
    });

    // Add chapter images based on density
    for (let i = 0; i < analysis.visualDensity.recommendedImages; i++) {
      elements.push({
        type: 'chapter-illustration',
        description: `Illustration for chapter ${i + 1}`,
        purpose: 'content-enhancement',
        priority: 'medium',
        format: this.config.defaultFormat,
        dimensions: this.config.defaultDimensions
      });
    }

    // Add data visualizations if opportunities exist
    for (const opportunity of analysis.dataOpportunities) {
      elements.push({
        type: 'data-visualization',
        description: `${opportunity.replace('-', ' ')} for data presentation`,
        purpose: 'data-communication',
        priority: 'high',
        format: 'svg',
        dimensions: { width: 800, height: 600 }
      });
    }

    return elements;
  }

  /**
   * Organize visual elements by chapter
   */
  async organizeByChapter(visualElements, bookStructure) {
    console.log('📂 Organizing visual elements by chapter');

    // Simulate organization
    await new Promise(resolve => setTimeout(resolve, 500));

    const chapterPlans = [];

    if (bookStructure.chapters && Array.isArray(bookStructure.chapters)) {
      for (const chapter of bookStructure.chapters) {
        const chapterElements = visualElements.filter(element => {
          // For now, distribute elements evenly
          // In a real implementation, this would be more sophisticated
          return Math.random() > 0.5 || element.type === 'cover';
        });

        chapterPlans.push({
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          elements: chapterElements,
          totalElements: chapterElements.length
        });
      }
    }

    return chapterPlans;
  }

  /**
   * Update existing plan
   */
  async updatePlan(bookTitle, updates) {
    console.log(`✏️ Updating visual content plan for: ${bookTitle}`);

    try {
      const existingPlan = await this.loadPlan(bookTitle);

      if (!existingPlan) {
        throw new Error(`No existing plan found for book: ${bookTitle}`);
      }

      // Apply updates
      const updatedPlan = { ...existingPlan, ...updates };
      updatedPlan.metadata.updatedAt = new Date().toISOString();

      // Save updated plan
      await this.savePlan(updatedPlan);

      console.log('✅ Visual content plan updated');
      return updatedPlan;
    } catch (error) {
      console.error('❌ Failed to update visual content plan:', error.message);
      throw error;
    }
  }

  /**
   * Save plan
   */
  async savePlan(plan) {
    try {
      const filename = `visual-plan-${this.sanitizeFilename(plan.bookTitle)}.json`;
      const filepath = path.join(this.config.outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(plan, null, 2));
      console.log(`💾 Visual content plan saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save visual content plan:', error.message);
    }
  }

  /**
   * Load plan
   */
  async loadPlan(bookTitle) {
    try {
      const filename = `visual-plan-${this.sanitizeFilename(bookTitle)}.json`;
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
   * Get visual content planning statistics
   */
  getStats() {
    try {
      const files = fs.readdirSync(this.config.outputDir)
        .filter(f => f.startsWith('visual-plan-') && f.endsWith('.json'));

      return {
        totalPlans: files.length,
        outputDir: this.config.outputDir
      };
    } catch (error) {
      console.error('❌ Failed to get visual content planning stats:', error.message);
      return { totalPlans: 0, error: error.message };
    }
  }
}

module.exports = VisualContentPlanner;