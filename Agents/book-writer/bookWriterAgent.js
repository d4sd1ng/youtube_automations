const fs = require('fs');
const path = require('path');

// Core modules
const ContentPlanner = require('./core/ContentPlanner');
const ResearchManager = require('./core/ResearchManager');
const InterviewConductor = require('./core/InterviewConductor');
const MarketAnalyzer = require('./core/MarketAnalyzer');
const PublishingCoordinator = require('./core/PublishingCoordinator');

// Content modules
const ChapterWriter = require('./content/ChapterWriter');
const RevisionManager = require('./content/RevisionManager');

// Media modules
const ImageGenerator = require('./media/ImageGenerator');
const GraphicsCoordinator = require('./media/GraphicsCoordinator');
const VisualContentPlanner = require('./media/VisualContentPlanner');

// Publishing modules
const PublisherDatabase = require('./publishing/PublisherDatabase');
const DealNegotiator = require('./publishing/DealNegotiator');
const ContractManager = require('./publishing/ContractManager');

// Utility modules
const ScraperInterface = require('./utils/ScraperInterface');
const DocumentFormatter = require('./utils/DocumentFormatter');
const CommunicationManager = require('./utils/CommunicationManager');

/**
 * Book Writer Agent
 * Main class that coordinates all book writing activities
 */
class BookWriterAgent {
  constructor(config = {}) {
    this.config = {
      dataDir: path.join(__dirname, '../../data/book-projects'),
      defaultLanguage: 'de',
      ...config
    };

    this.ensureDirectories();
    this.initializeComponents();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    console.log('🚀 Initializing Book Writer Agent components');

    // Initialize core components
    this.contentPlanner = new ContentPlanner();
    this.researchManager = new ResearchManager();
    this.interviewConductor = new InterviewConductor();
    this.marketAnalyzer = new MarketAnalyzer();
    this.publishingCoordinator = new PublishingCoordinator();

    // Initialize content components
    this.chapterWriter = new ChapterWriter();
    this.revisionManager = new RevisionManager();

    // Initialize media components
    this.imageGenerator = new ImageGenerator();
    this.graphicsCoordinator = new GraphicsCoordinator({}, this.imageGenerator);
    this.visualContentPlanner = new VisualContentPlanner();

    // Initialize publishing components
    this.publisherDatabase = new PublisherDatabase();
    this.dealNegotiator = new DealNegotiator();
    this.contractManager = new ContractManager();

    // Initialize utility components
    this.scraperInterface = new ScraperInterface();
    this.documentFormatter = new DocumentFormatter();
    this.communicationManager = new CommunicationManager();

    console.log('✅ All Book Writer Agent components initialized');
  }

  /**
   * Create a complete book from concept to publication
   * @param {string} topic - Book topic
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created book
   */
  async createBook(topic, options = {}) {
    console.log(`📚 Starting book creation process for: ${topic}`);

    try {
      // 1. Conduct initial interview
      console.log(' Phase 1: Initial Interview');
      const interviewResults = await this.conductInitialInterview(topic, options);

      // 2. Perform market analysis
      console.log(' Phase 2: Market Analysis');
      const marketAnalysis = await this.performMarketAnalysis(topic, interviewResults);

      // 3. Research content
      console.log(' Phase 3: Content Research');
      const researchData = await this.researchContent(topic, options);

      // 4. Plan content structure
      console.log(' Phase 4: Content Planning');
      const contentPlan = await this.planContent(topic, interviewResults, researchData);

      // 5. Write chapters
      console.log(' Phase 5: Chapter Writing');
      const writtenChapters = await this.writeChapters(contentPlan, researchData);

      // 6. Review and revise
      console.log(' Phase 6: Review and Revision');
      const revisedChapters = await this.reviewAndReviseChapters(writtenChapters, contentPlan);

      // 7. Create visual content plan
      console.log(' Phase 7: Visual Content Planning');
      const visualPlan = await this.createVisualContentPlan({
        title: topic,
        chapters: revisedChapters
      });

      // 8. Generate images
      console.log(' Phase 8: Image Generation');
      const generatedImages = await this.generateBookImages(visualPlan);

      // 9. Format final book
      console.log(' Phase 9: Document Formatting');
      const formattedBook = await this.formatFinalBook({
        title: topic,
        author: options.author || 'Book Writer Agent',
        chapters: revisedChapters,
        images: generatedImages
      });

      // 10. Coordinate publishing
      console.log(' Phase 10: Publishing Coordination');
      const publishingResults = await this.coordinatePublishing({
        title: topic,
        formattedBook: formattedBook,
        marketAnalysis: marketAnalysis
      });

      // Compile final result
      const bookResult = {
        title: topic,
        interviewResults: interviewResults,
        marketAnalysis: marketAnalysis,
        researchData: researchData,
        contentPlan: contentPlan,
        chapters: revisedChapters,
        visualPlan: visualPlan,
        images: generatedImages,
        formattedBook: formattedBook,
        publishing: publishingResults,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };

      // Save book project
      await this.saveBookProject(bookResult);

      console.log(`✅ Book creation completed for: ${topic}`);
      return bookResult;
    } catch (error) {
      console.error(`❌ Failed to create book "${topic}":`, error.message);

      // Save error state
      const errorResult = {
        title: topic,
        error: error.message,
        createdAt: new Date().toISOString(),
        status: 'failed'
      };

      await this.saveBookProject(errorResult);

      throw error;
    }
  }

  /**
   * Conduct initial interview for book planning
   */
  async conductInitialInterview(topic, options) {
    console.log(' Conducting initial interview');
    return await this.interviewConductor.conductProfessionalInterview(topic, options);
  }

  /**
   * Perform market analysis for book topic
   */
  async performMarketAnalysis(topic, interviewResults) {
    console.log(' Performing market analysis');
    return await this.marketAnalyzer.performComprehensiveAnalysis(topic, interviewResults);
  }

  /**
   * Research content for book topic
   */
  async researchContent(topic, options) {
    console.log(' Researching content');

    // Check for existing content first
    let existingContent = await this.researchManager.checkExistingContent(topic);

    if (!existingContent) {
      // Scrape new content if none exists
      existingContent = await this.researchManager.scrapeNewContent(topic, options);
    }

    return existingContent;
  }

  /**
   * Plan content structure
   */
  async planContent(topic, interviewResults, researchData) {
    console.log(' Planning content structure');
    return await this.contentPlanner.createContentPlan(topic, interviewResults, researchData);
  }

  /**
   * Write book chapters
   */
  async writeChapters(contentPlan, researchData) {
    console.log(' Writing chapters');

    const writtenChapters = [];

    for (const chapter of contentPlan.chapters) {
      try {
        const writtenChapter = await this.chapterWriter.writeChapter(
          chapter,
          contentPlan.styleGuide,
          researchData
        );

        writtenChapters.push(writtenChapter);
      } catch (error) {
        console.error(` Failed to write chapter "${chapter.title}":`, error.message);
        // Continue with other chapters even if one fails
      }
    }

    return writtenChapters;
  }

  /**
   * Review and revise chapters
   */
  async reviewAndReviseChapters(chapters, contentPlan) {
    console.log(' Reviewing and revising chapters');

    const revisedChapters = [];

    for (const chapter of chapters) {
      if (chapter.needsRevision) {
        try {
          const revisedChapter = await this.revisionManager.handleRevision(
            chapter,
            { qualityScore: chapter.qualityScore },
            contentPlan.styleGuide
          );

          revisedChapters.push(revisedChapter);
        } catch (error) {
          console.error(` Failed to revise chapter "${chapter.chapter.title}":`, error.message);
          // Keep original chapter if revision fails
          revisedChapters.push(chapter);
        }
      } else {
        revisedChapters.push(chapter);
      }
    }

    return revisedChapters;
  }

  /**
   * Create visual content plan
   */
  async createVisualContentPlan(bookContent) {
    console.log(' Creating visual content plan');
    return await this.visualContentPlanner.createComprehensivePlan(bookContent);
  }

  /**
   * Generate book images
   */
  async generateBookImages(visualPlan) {
    console.log(' Generating book images');

    // Extract image requirements from visual plan
    const imageRequirements = [];

    if (visualPlan.chapters && Array.isArray(visualPlan.chapters)) {
      for (const chapterPlan of visualPlan.chapters) {
        if (chapterPlan.elements && Array.isArray(chapterPlan.elements)) {
          for (const element of chapterPlan.elements) {
            imageRequirements.push({
              chapter: chapterPlan.chapterNumber,
              description: element.description,
              type: element.type,
              style: 'professional'
            });
          }
        }
      }
    }

    // Generate images
    const generatedImages = await this.imageGenerator.batchGenerate(imageRequirements);

    return generatedImages;
  }

  /**
   * Format final book
   */
  async formatFinalBook(bookContent) {
    console.log(' Formatting final book');
    return await this.documentFormatter.formatCompleteBook(bookContent);
  }

  /**
   * Coordinate publishing
   */
  async coordinatePublishing(bookData) {
    console.log(' Coordinating publishing');
    return await this.publishingCoordinator.publishToMultiplePublishers(bookData);
  }

  /**
   * Save book project
   */
  async saveBookProject(bookData) {
    try {
      const filename = `book-project-${this.sanitizeFilename(bookData.title)}-${Date.now()}.json`;
      const filepath = path.join(this.config.dataDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(bookData, null, 2));
      console.log(`💾 Book project saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save book project:', error.message);
    }
  }

  /**
   * Load book project
   */
  async loadBookProject(title) {
    try {
      const files = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith(`book-project-${this.sanitizeFilename(title)}`) && f.endsWith('.json'))
        .sort()
        .reverse(); // Get most recent

      if (files.length > 0) {
        const filepath = path.join(this.config.dataDir, files[0]);
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load book project:', error.message);
      return null;
    }
  }

  /**
   * Get book project status
   */
  async getBookProjectStatus(title) {
    try {
      const project = await this.loadBookProject(title);

      if (project) {
        return {
          title: project.title,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt || project.createdAt,
          progress: this.calculateProjectProgress(project)
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get book project status:', error.message);
      return null;
    }
  }

  /**
   * Calculate project progress
   */
  calculateProjectProgress(project) {
    if (project.status === 'completed') {
      return 100;
    }

    if (project.status === 'failed') {
      return 0;
    }

    // Estimate progress based on completed phases
    let progress = 0;

    if (project.interviewResults) progress += 10;
    if (project.marketAnalysis) progress += 10;
    if (project.researchData) progress += 15;
    if (project.contentPlan) progress += 15;
    if (project.chapters) progress += 20;
    if (project.visualPlan) progress += 10;
    if (project.images) progress += 10;
    if (project.formattedBook) progress += 5;
    if (project.publishing) progress += 5;

    return Math.min(100, progress);
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get agent statistics
   */
  getStats() {
    try {
      const projectFiles = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith('book-project-') && f.endsWith('.json'));

      let completedProjects = 0;
      let failedProjects = 0;

      for (const file of projectFiles) {
        try {
          const filepath = path.join(this.config.dataDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const project = JSON.parse(content);

          if (project.status === 'completed') {
            completedProjects++;
          } else if (project.status === 'failed') {
            failedProjects++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse project file for stats: ${file}`);
        }
      }

      return {
        totalProjects: projectFiles.length,
        completedProjects: completedProjects,
        failedProjects: failedProjects,
        successRate: projectFiles.length > 0 ? (completedProjects / projectFiles.length) * 100 : 0,
        components: {
          contentPlanner: this.contentPlanner.getStats(),
          researchManager: this.researchManager.getStats(),
          interviewConductor: this.interviewConductor.getStats(),
          marketAnalyzer: this.marketAnalyzer.getStats(),
          chapterWriter: this.chapterWriter.getStats(),
          revisionManager: this.revisionManager.getStats(),
          imageGenerator: this.imageGenerator.getStats(),
          graphicsCoordinator: this.graphicsCoordinator.getStats(),
          visualContentPlanner: this.visualContentPlanner.getStats(),
          publisherDatabase: this.publisherDatabase.getStats(),
          dealNegotiator: this.dealNegotiator.getStats(),
          contractManager: this.contractManager.getStats(),
          scraperInterface: this.scraperInterface.getStats(),
          documentFormatter: this.documentFormatter.getStats(),
          communicationManager: this.communicationManager.getStats()
        }
      };
    } catch (error) {
      console.error('❌ Failed to get agent stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = BookWriterAgent;