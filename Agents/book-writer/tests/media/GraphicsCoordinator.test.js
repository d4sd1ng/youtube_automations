const GraphicsCoordinator = require('../../media/GraphicsCoordinator');
const ImageGenerator = require('../../media/ImageGenerator');

describe('GraphicsCoordinator', () => {
  let graphicsCoordinator;
  let mockImageGenerator;

  beforeEach(() => {
    // Create a mock image generator for testing
    mockImageGenerator = {
      batchGenerate: jest.fn(),
      getStats: jest.fn().mockReturnValue({ totalImages: 0, providerStats: {} })
    };

    graphicsCoordinator = new GraphicsCoordinator({}, mockImageGenerator);
  });

  describe('conductImageInterview', () => {
    it('should conduct image requirements interview', async () => {
      const bookContent = {
        title: 'Test Book',
        chapters: [
          {
            number: 1,
            title: 'Introduction',
            content: 'This chapter introduces concepts and includes diagrams.',
            wordCount: 1500,
            type: 'introductory'
          }
        ]
      };

      const requirements = await graphicsCoordinator.conductImageInterview(bookContent);

      expect(requirements).toBeDefined();
      expect(Array.isArray(requirements)).toBe(true);
      // Should have at least a cover requirement
      expect(requirements.length).toBeGreaterThan(0);
      // Should include cover requirement
      expect(requirements.some(req => req.type === 'cover')).toBe(true);
    });

    it('should identify image opportunities in chapter content', async () => {
      const bookContent = {
        title: 'Technical Book',
        chapters: [
          {
            number: 1,
            title: 'Data Analysis',
            content: 'This chapter includes diagrams and charts to illustrate the process.',
            wordCount: 2500,
            type: 'technical'
          }
        ]
      };

      const requirements = await graphicsCoordinator.conductImageInterview(bookContent);

      expect(requirements).toBeDefined();
      // Should identify opportunities for diagrams and charts
      expect(requirements.some(req => req.type === 'diagram' || req.type === 'chart')).toBe(true);
    });
  });

  describe('generateProfessionalImages', () => {
    it('should generate professional images based on requirements', async () => {
      const requirements = [
        { description: 'Book cover', type: 'cover', chapter: 0 },
        { description: 'Chapter illustration', type: 'illustration', chapter: 1 }
      ];

      // Mock the image generator response
      mockImageGenerator.batchGenerate.mockResolvedValue([
        { success: true, result: { id: 'img1', url: 'cover.jpg' } },
        { success: true, result: { id: 'img2', url: 'illustration.jpg' } }
      ]);

      const results = await graphicsCoordinator.generateProfessionalImages(requirements);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(mockImageGenerator.batchGenerate).toHaveBeenCalledWith(requirements);
    });
  });

  describe('createVisualContentPlan', () => {
    it('should create comprehensive visual content plan', async () => {
      const bookContent = {
        title: 'Visual Book',
        chapters: [
          { number: 1, title: 'Chapter 1', wordCount: 2000 },
          { number: 2, title: 'Chapter 2', wordCount: 1800 }
        ]
      };

      // Mock the internal methods
      jest.spyOn(graphicsCoordinator, 'conductImageInterview').mockResolvedValue([
        { description: 'Cover', type: 'cover', chapter: 0 },
        { description: 'Illustration', type: 'illustration', chapter: 1 }
      ]);

      mockImageGenerator.batchGenerate.mockResolvedValue([
        { success: true, result: { id: 'cover', url: 'cover.jpg' } },
        { success: true, result: { id: 'illus', url: 'illustration.jpg' } }
      ]);

      const plan = await graphicsCoordinator.createVisualContentPlan(bookContent);

      expect(plan).toBeDefined();
      expect(plan.bookTitle).toBe(bookContent.title);
      expect(plan.totalRequirements).toBe(2);
      expect(plan.fulfilledRequirements).toBe(2);
      expect(plan.requirements).toBeDefined();
      expect(plan.generatedImages).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return graphics coordination statistics', () => {
      const stats = graphicsCoordinator.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalPlans).toBeDefined();
      expect(stats.imageStats).toBeDefined();
      expect(stats.outputDir).toBeDefined();
    });
  });
});