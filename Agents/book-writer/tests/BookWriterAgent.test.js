const BookWriterAgent = require('../BookWriterAgent');

describe('BookWriterAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new BookWriterAgent();
  });

  describe('Initialization', () => {
    it('should initialize all components correctly', () => {
      expect(agent.contentPlanner).toBeDefined();
      expect(agent.researchManager).toBeDefined();
      expect(agent.interviewConductor).toBeDefined();
      expect(agent.marketAnalyzer).toBeDefined();
      expect(agent.publishingCoordinator).toBeDefined();
      expect(agent.chapterWriter).toBeDefined();
      expect(agent.revisionManager).toBeDefined();
      expect(agent.imageGenerator).toBeDefined();
      expect(agent.graphicsCoordinator).toBeDefined();
      expect(agent.visualContentPlanner).toBeDefined();
      expect(agent.publisherDatabase).toBeDefined();
      expect(agent.dealNegotiator).toBeDefined();
      expect(agent.contractManager).toBeDefined();
      expect(agent.scraperInterface).toBeDefined();
      expect(agent.documentFormatter).toBeDefined();
      expect(agent.communicationManager).toBeDefined();
    });

    it('should create required directories', () => {
      const fs = require('fs');
      expect(fs.existsSync(agent.config.dataDir)).toBe(true);
    });
  });

  describe('createBook', () => {
    it('should create a complete book with all components', async () => {
      const topic = 'Testbuch über KI';
      const options = {
        author: 'Test Author',
        genre: 'Sachbuch'
      };

      // Mock all the internal methods to avoid long processing times
      jest.spyOn(agent, 'conductInitialInterview').mockResolvedValue({
        bookType: { suggestedFormats: ['Sachbuch'] },
        structure: { chapterCount: 3 }
      });

      jest.spyOn(agent, 'performMarketAnalysis').mockResolvedValue({
        marketSize: { estimatedBooks: 100 },
        competition: { directCompetitors: 10 }
      });

      jest.spyOn(agent, 'researchContent').mockResolvedValue({
        items: [{ title: 'Test Research', qualityScore: 80 }]
      });

      jest.spyOn(agent, 'planContent').mockResolvedValue({
        title: topic,
        chapters: [
          { number: 1, title: 'Einleitung', type: 'introduction' },
          { number: 2, title: 'Hauptteil', type: 'main' },
          { number: 3, title: 'Fazit', type: 'conclusion' }
        ],
        styleGuide: { tone: 'educational' }
      });

      jest.spyOn(agent, 'writeChapters').mockResolvedValue([
        { content: 'Chapter 1 content', qualityScore: 0.9 },
        { content: 'Chapter 2 content', qualityScore: 0.85 },
        { content: 'Chapter 3 content', qualityScore: 0.88 }
      ]);

      jest.spyOn(agent, 'reviewAndReviseChapters').mockResolvedValue([
        { content: 'Revised Chapter 1 content', qualityScore: 0.95 },
        { content: 'Revised Chapter 2 content', qualityScore: 0.92 },
        { content: 'Revised Chapter 3 content', qualityScore: 0.93 }
      ]);

      jest.spyOn(agent, 'createVisualContentPlan').mockResolvedValue({
        chapters: [
          { chapterNumber: 1, elements: [{ type: 'cover' }] },
          { chapterNumber: 2, elements: [{ type: 'illustration' }] },
          { chapterNumber: 3, elements: [{ type: 'chart' }] }
        ]
      });

      jest.spyOn(agent, 'generateBookImages').mockResolvedValue([
        { success: true, result: { url: 'image1.jpg' } },
        { success: true, result: { url: 'image2.jpg' } },
        { success: true, result: { url: 'image3.jpg' } }
      ]);

      jest.spyOn(agent, 'formatFinalBook').mockResolvedValue({
        pdf: { format: 'pdf', fileSize: 1024 },
        epub: { format: 'epub', fileSize: 512 }
      });

      jest.spyOn(agent, 'coordinatePublishing').mockResolvedValue({
        publisherDeals: [{ success: true, publisher: 'Test Publisher' }],
        amazonListing: { success: true }
      });

      const result = await agent.createBook(topic, options);

      expect(result).toBeDefined();
      expect(result.title).toBe(topic);
      expect(result.interviewResults).toBeDefined();
      expect(result.marketAnalysis).toBeDefined();
      expect(result.researchData).toBeDefined();
      expect(result.contentPlan).toBeDefined();
      expect(result.chapters).toBeDefined();
      expect(result.visualPlan).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.formattedBook).toBeDefined();
      expect(result.publishing).toBeDefined();
      expect(result.status).toBe('completed');
    }, 30000); // Increase timeout for this test

    it('should handle errors during book creation', async () => {
      const topic = 'Fehlerhaftes Buch';

      // Mock an error in one of the components
      jest.spyOn(agent, 'conductInitialInterview').mockRejectedValue(new Error('Test error'));

      await expect(agent.createBook(topic)).rejects.toThrow('Test error');

      // Check that the error state was saved
      const savedProject = await agent.loadBookProject(topic);
      expect(savedProject).toBeDefined();
      expect(savedProject.status).toBe('failed');
      expect(savedProject.error).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return comprehensive statistics', () => {
      const stats = agent.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalProjects).toBeDefined();
      expect(stats.completedProjects).toBeDefined();
      expect(stats.failedProjects).toBeDefined();
      expect(stats.successRate).toBeDefined();
      expect(stats.components).toBeDefined();

      // Check that all component stats are included
      expect(stats.components.contentPlanner).toBeDefined();
      expect(stats.components.researchManager).toBeDefined();
      expect(stats.components.interviewConductor).toBeDefined();
      expect(stats.components.marketAnalyzer).toBeDefined();
      expect(stats.components.chapterWriter).toBeDefined();
      expect(stats.components.revisionManager).toBeDefined();
      expect(stats.components.imageGenerator).toBeDefined();
      expect(stats.components.graphicsCoordinator).toBeDefined();
      expect(stats.components.visualContentPlanner).toBeDefined();
      expect(stats.components.publisherDatabase).toBeDefined();
      expect(stats.components.dealNegotiator).toBeDefined();
      expect(stats.components.contractManager).toBeDefined();
      expect(stats.components.scraperInterface).toBeDefined();
      expect(stats.components.documentFormatter).toBeDefined();
      expect(stats.components.communicationManager).toBeDefined();
    });
  });
});