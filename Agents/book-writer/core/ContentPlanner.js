const fs = require('fs');
const path = require('path');

/**
 * Content Planner for Book Writer Agent
 * Plans the structure and content of books
 */
class ContentPlanner {
  constructor(config = {}) {
    this.config = {
      defaultChapters: 10,
      maxChapters: 20,
      minChapters: 5,
      ...config
    };

    this.templatesDir = path.join(__dirname, '../../../data/templates/book-structures');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  /**
   * Create content plan based on topic, interview results and research data
   * @param {string} topic - The main topic of the book
   * @param {Object} interviewResults - Results from professional interview
   * @param {Object} researchData - Research data
   * @returns {Promise<Object>} Content plan
   */
  async createContentPlan(topic, interviewResults, researchData) {
    console.log(`📝 Creating content plan for topic: ${topic}`);

    try {
      // Extract requirements from interview results
      const requirements = {
        chapterCount: interviewResults.structure?.chapterCount || this.config.defaultChapters,
        targetLength: interviewResults.structure?.targetLength || '200 pages',
        audience: interviewResults.bookType?.audience || 'General',
        genre: interviewResults.bookType?.suggestedFormats?.[0] || 'Non-fiction',
        needAppendices: interviewResults.content?.needAppendices || false,
        includeIntroduction: interviewResults.structure?.includeIntroduction !== false,
        includeConclusion: interviewResults.structure?.includeConclusion !== false,
        useExactTitle: interviewResults.useExactTitle === true || interviewResults.structure?.useExactTitle === true
      };

      // Plan book structure
      const bookStructure = await this.planBookStructure(topic, requirements);

      // Create style guide based on interview results
      const styleGuide = this.createStyleGuide(interviewResults);

      // Compile content plan
      const contentPlan = {
        title: bookStructure.title,
        subtitle: bookStructure.subtitle,
        chapters: bookStructure.chapters,
        styleGuide: styleGuide,
        targetLength: bookStructure.targetLength,
        targetAudience: bookStructure.targetAudience,
        genre: bookStructure.genre,
        estimatedCompletionTime: bookStructure.estimatedCompletionTime,
        metadata: {
          createdAt: new Date().toISOString(),
          source: 'content-planner'
        }
      };

      console.log(`✅ Content plan created with ${bookStructure.chapters.length} chapters`);
      return contentPlan;
    } catch (error) {
      console.error(`❌ Failed to create content plan: ${error.message}`);
      throw error;
    }
  }

  /**
   * Plan book structure based on topic and requirements
   * @param {string} topic - The main topic of the book
   * @param {Object} requirements - Book requirements from interview
   * @returns {Promise<Object>} Planned book structure
   */
  async planBookStructure(topic, requirements = {}) {
    console.log(`📝 Planning book structure for topic: ${topic}`);

    // Load existing templates or create new structure
    const template = await this.loadOrCreateTemplate(topic, requirements);

    // Generate chapter structure
    const chapters = await this.generateChapterStructure(topic, requirements, template);

    // Create content plan
    const contentPlan = {
      title: this.generateBookTitle(topic, requirements),
      subtitle: this.generateBookSubtitle(topic, requirements),
      chapters: chapters,
      targetLength: requirements.targetLength || '200 pages',
      targetAudience: requirements.audience || 'General',
      genre: requirements.genre || 'Non-fiction',
      estimatedCompletionTime: this.estimateCompletionTime(chapters.length),
      createdAt: new Date().toISOString()
    };

    console.log(`✅ Book structure planned with ${chapters.length} chapters`);
    return contentPlan;
  }

  /**
   * Create style guide based on interview results
   * @param {Object} interviewResults - Results from professional interview
   * @returns {Object} Style guide
   */
  createStyleGuide(interviewResults) {
    return {
      tone: interviewResults.content?.toneStyle || 'educational',
      targetAudience: interviewResults.bookType?.audience || 'general',
      languageLevel: this.determineLanguageLevel(interviewResults.bookType?.audience),
      formatting: {
        citationStyle: 'APA',
        headingStructure: 'descriptive'
      }
    };
  }

  /**
   * Determine language level based on audience
   * @param {string} audience - Target audience
   * @returns {string} Language level
   */
  determineLanguageLevel(audience) {
    const levels = {
      'Einsteiger': 'beginner',
      'Fortgeschrittene': 'intermediate',
      'Experten': 'advanced',
      'Gemischte Zielgruppe': 'intermediate',
      'General': 'intermediate'
    };

    return levels[audience] || 'intermediate';
  }

  /**
   * Load existing template or create new one
   */
  async loadOrCreateTemplate(topic, requirements) {
    try {
      const templateFile = path.join(this.templatesDir, `${this.sanitizeFilename(topic)}.json`);

      if (fs.existsSync(templateFile)) {
        const templateData = fs.readFileSync(templateFile, 'utf8');
        return JSON.parse(templateData);
      } else {
        // Create new template based on requirements
        const newTemplate = this.createTemplate(topic, requirements);
        fs.writeFileSync(templateFile, JSON.stringify(newTemplate, null, 2));
        return newTemplate;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load template, creating new one:', error.message);
      return this.createTemplate(topic, requirements);
    }
  }

  /**
   * Create new template
   */
  createTemplate(topic, requirements) {
    return {
      topic: topic,
      type: requirements.bookType || 'Sachbuch',
      structure: {
        introduction: true,
        chapters: requirements.chapterCount || this.config.defaultChapters,
        conclusion: true,
        appendices: requirements.needAppendices || false
      },
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate chapter structure
   */
  async generateChapterStructure(topic, requirements, template) {
    // Use chapter count from requirements, or from template, or default
    const chapterCount = requirements.chapterCount || template?.structure?.chapters || this.config.defaultChapters;
    const chapters = [];

    // Add introduction if explicitly requested
    const includeIntroduction = requirements.includeIntroduction === true;
    if (includeIntroduction) {
      chapters.push({
        number: 0,
        title: 'Einleitung',
        type: 'introduction',
        estimatedLength: '5-10 pages',
        keyPoints: [`Einführung in ${topic}`, 'Zielsetzung des Buches', 'Überblick über die Kapitelstruktur']
      });
    }

    // Generate main chapters
    for (let i = 1; i <= chapterCount; i++) {
      const chapterNumber = includeIntroduction ? i : i - 1;
      chapters.push({
        number: chapterNumber,
        title: await this.generateChapterTitle(topic, i, chapterCount, requirements),
        type: 'main',
        estimatedLength: '10-20 pages',
        keyPoints: await this.generateChapterKeyPoints(topic, i, requirements)
      });
    }

    // Add conclusion if explicitly requested
    const includeConclusion = requirements.includeConclusion === true;
    if (includeConclusion) {
      const conclusionNumber = includeIntroduction ? chapterCount + 1 : chapterCount;
      chapters.push({
        number: conclusionNumber,
        title: 'Fazit',
        type: 'conclusion',
        estimatedLength: '5-10 pages',
        keyPoints: ['Zusammenfassung der wichtigsten Erkenntnisse', 'Ausblick auf zukünftige Entwicklungen', 'Handlungsempfehlungen']
      });
    }

    return chapters;
  }

  /**
   * Generate book title
   */
  generateBookTitle(topic, requirements) {
    // If no special formatting is requested, return the topic as is
    if (requirements.useExactTitle === true || requirements.structure?.useExactTitle === true) {
      return topic;
    }

    const prefixes = [
      'Das Kompendium',
      'Der Leitfaden',
      'Die Enzyklopädie',
      'Das Handbuch',
      'Die Strategie'
    ];

    const suffixes = [
      'für die moderne Welt',
      'im 21. Jahrhundert',
      'aus interdisziplinärer Sicht',
      'mit praktischen Anwendungen',
      'für Einsteiger und Fortgeschrittene'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${topic} ${suffix}`;
  }

  /**
   * Generate book subtitle
   */
  generateBookSubtitle(topic, requirements) {
    const subtitles = [
      `Ein umfassender Leitfaden zu ${topic}`,
      `Alle wichtigen Aspekte von ${topic} im Überblick`,
      `Praxiswissen und aktuelle Entwicklungen zu ${topic}`,
      `Von den Grundlagen bis zu fortgeschrittenen Anwendungen`
    ];

    return subtitles[Math.floor(Math.random() * subtitles.length)];
  }

  /**
   * Generate chapter title
   */
  async generateChapterTitle(topic, chapterNumber, totalChapters, requirements) {
    const chapterTitles = [
      `Grundlagen und Einführung in ${topic}`,
      `Historische Entwicklung von ${topic}`,
      `Aktuelle Trends und Entwicklungen`,
      `Theoretische Ansätze und Modelle`,
      `Praktische Anwendungen und Beispiele`,
      `Fallstudien und Praxisbeispiele`,
      `Herausforderungen und Probleme`,
      `Lösungsansätze und Strategien`,
      `Zukunftsperspektiven und Prognosen`,
      `Fazit und Ausblick`
    ];

    // For books with more chapters, generate additional titles
    if (chapterNumber > chapterTitles.length) {
      return `Fortgeschrittene Aspekte - Teil ${chapterNumber - chapterTitles.length}`;
    }

    return chapterTitles[chapterNumber - 1] || `Kapitel ${chapterNumber}: ${topic} Teil ${chapterNumber}`;
  }

  /**
   * Generate chapter key points
   */
  async generateChapterKeyPoints(topic, chapterNumber, requirements) {
    // This would typically integrate with an AI service to generate relevant key points
    // For now, we'll use mock data
    const keyPointsTemplates = [
      [`Definition und grundlegende Konzepte von ${topic}`, `Historische Entwicklung und Meilensteine`, `Wichtige Persönlichkeiten und Institutionen`],
      [`Aktuelle Forschungsansätze`, `Neueste Erkenntnisse und Entwicklungen`, `Internationale Perspektiven`],
      [`Praktische Anwendungsbereiche`, `Fallbeispiele aus der Praxis`, `Best Practices und Erfolgsfaktoren`],
      [`Herausforderungen und offene Fragen`, `Kritische Betrachtung bestehender Ansätze`, `Grenzen und Schwächen`],
      [`Innovative Lösungsansätze`, `Technologische Fortschritte`, `Zukünftige Entwicklungen`]
    ];

    if (chapterNumber <= keyPointsTemplates.length) {
      return keyPointsTemplates[chapterNumber - 1];
    }

    return [`Spezifische Aspekte von ${topic}`, `Detaillierte Analyse des Themas`, `Praktische Implikationen`];
  }

  /**
   * Estimate completion time
   */
  estimateCompletionTime(chapterCount) {
    // Rough estimate: 2 days per chapter + 5 days for editing
    const writingDays = chapterCount * 2;
    const editingDays = 5;
    const totalDays = writingDays + editingDays;

    return {
      writingDays: writingDays,
      editingDays: editingDays,
      totalDays: totalDays,
      weeks: Math.ceil(totalDays / 7)
    };
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Save content plan
   */
  async saveContentPlan(plan, bookId) {
    try {
      const plansDir = path.join(__dirname, '../../../data/research/content-plans');
      if (!fs.existsSync(plansDir)) {
        fs.mkdirSync(plansDir, { recursive: true });
      }

      const planFile = path.join(plansDir, `${bookId}-content-plan.json`);
      fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));

      console.log(`💾 Content plan saved: ${planFile}`);
      return planFile;
    } catch (error) {
      console.error('❌ Failed to save content plan:', error);
      throw error;
    }
  }
}

module.exports = ContentPlanner;