const VisualContentPlanner = require('../../media/VisualContentPlanner');

describe('VisualContentPlanner', () => {
  let visualContentPlanner;

  beforeEach(() => {
    visualContentPlanner = new VisualContentPlanner();
  });

  describe('createComprehensivePlan', () => {
    it('should create comprehensive visual content plan', async () => {
      const bookStructure = {
        title: 'Test Book with Visuals',
        chapters: [
          { number: 1, title: 'Introduction', wordCount: 1500, type: 'introductory' },
          { number: 2, title: 'Main Content', wordCount: 3000, type: 'main' },
          { number: 3, title: 'Conclusion', wordCount: 1000, type: 'conclusion' }
        ]
      };

      const plan = await visualContentPlanner.createComprehensivePlan(bookStructure);

      expect(plan).toBeDefined();
      expect(plan.bookTitle).toBe(bookStructure.title);
      expect(plan.totalElements).toBeDefined();
      expect(plan.chapters).toBeDefined();
      expect(Array.isArray(plan.chapters)).toBe(true);
      expect(plan.metadata).toBeDefined();
      expect(plan.metadata.createdAt).toBeDefined();
    });

    it('should create plan with appropriate number of elements', async () => {
      const bookStructure = {
        title: 'Short Book',
        chapters: [
          { number: 1, title: 'Only Chapter', wordCount: 2000 }
        ]
      };

      const plan = await visualContentPlanner.createComprehensivePlan(bookStructure);

      expect(plan.totalElements).toBeGreaterThan(0);
      expect(plan.chapters.length).toBe(1);
    });
  });

  describe('analyzeBookStructure', () => {
    it('should analyze book structure for visual opportunities', async () => {
      const bookStructure = {
        title: 'Analysis Test Book',
        chapters: [
          { number: 1, title: 'Tech Chapter', wordCount: 2500, type: 'technical' },
          { number: 2, title: 'Intro Chapter', wordCount: 1000, type: 'introductory' }
        ]
      };

      const analysis = await visualContentPlanner.analyzeBookStructure(bookStructure);

      expect(analysis).toBeDefined();
      expect(analysis.totalChapters).toBe(2);
      expect(analysis.chapterTypes).toBeDefined();
      expect(analysis.contentThemes).toBeDefined();
      expect(analysis.dataOpportunities).toBeDefined();
      expect(analysis.visualDensity).toBeDefined();
    });
  });

  describe('planVisualElements', () => {
    it('should plan visual elements based on analysis', async () => {
      const analysis = {
        visualDensity: {
          recommendedImages: 5,
          densityLevel: 'medium'
        },
        dataOpportunities: ['statistical-charts', 'comparison-charts']
      };

      const elements = await visualContentPlanner.planVisualElements(analysis);

      expect(elements).toBeDefined();
      expect(Array.isArray(elements)).toBe(true);
      // Should include cover image
      expect(elements.some(el => el.type === 'cover')).toBe(true);
      // Should include chapter illustrations
      expect(elements.some(el => el.type === 'chapter-illustration')).toBe(true);
      // Should include data visualizations
      expect(elements.some(el => el.type === 'data-visualization')).toBe(true);
    });
  });

  describe('organizeByChapter', () => {
    it('should organize visual elements by chapter', async () => {
      const visualElements = [
        { type: 'cover', description: 'Book cover' },
        { type: 'chapter-illustration', description: 'Chapter 1 illustration' },
        { type: 'chapter-illustration', description: 'Chapter 2 illustration' }
      ];

      const bookStructure = {
        chapters: [
          { number: 1, title: 'Chapter 1' },
          { number: 2, title: 'Chapter 2' }
        ]
      };

      const chapterPlans = await visualContentPlanner.organizeByChapter(visualElements, bookStructure);

      expect(chapterPlans).toBeDefined();
      expect(Array.isArray(chapterPlans)).toBe(true);
      expect(chapterPlans.length).toBe(2);

      // Each chapter plan should have elements
      chapterPlans.forEach(plan => {
        expect(plan.chapterNumber).toBeDefined();
        expect(plan.chapterTitle).toBeDefined();
        expect(plan.elements).toBeDefined();
        expect(plan.totalElements).toBeDefined();
      });
    });
  });

  describe('updatePlan', () => {
    it('should update existing visual content plan', async () => {
      const bookTitle = 'Update Test Book';
      const initialPlan = {
        bookTitle: bookTitle,
        totalElements: 3,
        chapters: [],
        metadata: { createdAt: new Date().toISOString() }
      };

      // Save initial plan
      await visualContentPlanner.savePlan(initialPlan);

      // Update plan
      const updates = { totalElements: 5 };
      const updatedPlan = await visualContentPlanner.updatePlan(bookTitle, updates);

      expect(updatedPlan).toBeDefined();
      expect(updatedPlan.totalElements).toBe(5);
      expect(updatedPlan.metadata.updatedAt).toBeDefined();
    });

    it('should throw error when updating non-existent plan', async () => {
      const bookTitle = 'Non-existent Book';

      await expect(visualContentPlanner.updatePlan(bookTitle, {}))
        .rejects
        .toThrow(`No existing plan found for book: ${bookTitle}`);
    });
  });

  describe('getStats', () => {
    it('should return visual content planning statistics', () => {
      const stats = visualContentPlanner.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalPlans).toBeDefined();
      expect(stats.outputDir).toBeDefined();
    });
  });
});