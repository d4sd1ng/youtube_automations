const BookWriterAgent = require('../../BookWriterAgent');

describe('BookWriterAgent Integration Tests', () => {
  let agent;

  beforeEach(() => {
    agent = new BookWriterAgent();
  });

  describe('Complete Book Creation Workflow', () => {
    it('should execute complete book creation workflow', async () => {
      const topic = 'Integration Test: KI und Gesellschaft';
      const options = {
        author: 'Integration Test Author',
        genre: 'Sachbuch',
        targetMarket: 'germany'
      };

      // Mock all time-consuming operations to avoid long test times
      jest.spyOn(agent.interviewConductor, 'conductProfessionalInterview').mockResolvedValue({
        bookType: {
          suggestedFormats: ['Sachbuch'],
          targetLength: '200 pages'
        },
        structure: {
          chapterCount: 3,
          targetLength: '200 pages'
        },
        market: {
          targetPrice: '19.99',
          pricePositioning: 'mid-range'
        },
        marketAnalysis: {
          topic: topic,
          marketSize: { estimatedBooks: 1000 },
          competition: { directCompetitors: 50 }
        }
      });

      jest.spyOn(agent.marketAnalyzer, 'performComprehensiveAnalysis').mockResolvedValue({
        topic: topic,
        competitiveAnalysis: { directCompetitors: 50 },
        targetAudience: { primary: 'Professionals', estimatedSize: 10000 },
        pricingStrategy: { recommendedPrice: 19.99 },
        distributionChannels: { online: ['Amazon'], physical: ['Bertelsmann'] },
        monetization: { revenuePotential: 50000 },
        analyzedAt: new Date().toISOString()
      });

      jest.spyOn(agent.researchManager, 'scrapeNewContent').mockResolvedValue({
        items: [
          {
            title: 'AI and Society Research 1',
            content: 'Research content about AI and society',
            qualityScore: 85,
            relevanceScore: 90
          },
          {
            title: 'AI and Society Research 2',
            content: 'More research content about AI and society',
            qualityScore: 80,
            relevanceScore: 85
          }
        ],
        grouped: {
          'test-source': [
            { title: 'AI and Society Research 1', qualityScore: 85 }
          ]
        },
        keyInsights: [
          { type: 'trend', description: 'AI adoption is increasing' }
        ],
        statistics: {
          totalItems: 2,
          sources: ['test-source'],
          averageQuality: 82.5,
          averageRelevance: 87.5
        },
        scrapedAt: new Date().toISOString()
      });

      jest.spyOn(agent.contentPlanner, 'createContentPlan').mockResolvedValue({
        title: topic,
        chapters: [
          {
            number: 1,
            title: 'Einleitung: KI und Gesellschaft',
            topic: topic,
            keyPoints: ['Definition', 'Geschichte', 'Aktuelle Entwicklungen'],
            type: 'introduction'
          },
          {
            number: 2,
            title: 'Hauptteil: Auswirkungen',
            topic: topic,
            keyPoints: ['Wirtschaft', 'Arbeit', 'Ethik'],
            type: 'main'
          },
          {
            number: 3,
            title: 'Fazit: Zukunftsperspektiven',
            topic: topic,
            keyPoints: ['Chancen', 'Risiken', 'Handlungsempfehlungen'],
            type: 'conclusion'
          }
        ],
        styleGuide: {
          tone: 'educational',
          targetAudience: 'general',
          languageLevel: 'intermediate',
          formatting: {
            citationStyle: 'APA',
            headingStructure: 'descriptive'
          }
        },
        metadata: {
          createdAt: new Date().toISOString()
        }
      });

      jest.spyOn(agent.chapterWriter, 'writeChapter').mockImplementation(async (chapterData) => {
        return {
          chapter: chapterData,
          content: `This is the content for chapter "${chapterData.title}". It discusses ${chapterData.topic} and covers key points like ${chapterData.keyPoints.join(', ')}.`,
          qualityScore: 0.85,
          wordCount: 1500,
          needsRevision: false,
          generatedAt: new Date().toISOString()
        };
      });

      jest.spyOn(agent.revisionManager, 'handleRevision').mockImplementation(async (chapter) => {
        return {
          ...chapter,
          content: `Revised content for chapter "${chapter.chapter.title}".`,
          revisionCount: 1,
          qualityScore: 0.92,
          revisedAt: new Date().toISOString()
        };
      });

      jest.spyOn(agent.visualContentPlanner, 'createComprehensivePlan').mockResolvedValue({
        bookTitle: topic,
        totalElements: 4,
        chapters: [
          {
            chapterNumber: 0,
            chapterTitle: 'Cover',
            elements: [
              { type: 'cover', description: 'Book cover design' }
            ],
            totalElements: 1
          },
          {
            chapterNumber: 1,
            chapterTitle: 'Einleitung: KI und Gesellschaft',
            elements: [
              { type: 'illustration', description: 'Introduction illustration' }
            ],
            totalElements: 1
          },
          {
            chapterNumber: 2,
            chapterTitle: 'Hauptteil: Auswirkungen',
            elements: [
              { type: 'chart', description: 'Impact chart' }
            ],
            totalElements: 1
          },
          {
            chapterNumber: 3,
            chapterTitle: 'Fazit: Zukunftsperspektiven',
            elements: [
              { type: 'diagram', description: 'Future diagram' }
            ],
            totalElements: 1
          }
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      });

      jest.spyOn(agent.imageGenerator, 'batchGenerate').mockResolvedValue([
        {
          success: true,
          requirement: { type: 'cover' },
          result: { id: 'cover-1', url: 'https://example.com/cover.jpg', provider: 'midjourney' }
        },
        {
          success: true,
          requirement: { type: 'illustration' },
          result: { id: 'illus-1', url: 'https://example.com/illustration.jpg', provider: 'dalle3' }
        },
        {
          success: true,
          requirement: { type: 'chart' },
          result: { id: 'chart-1', url: 'https://example.com/chart.jpg', provider: 'stablediffusion' }
        },
        {
          success: true,
          requirement: { type: 'diagram' },
          result: { id: 'diag-1', url: 'https://example.com/diagram.jpg', provider: 'dalle3' }
        }
      ]);

      jest.spyOn(agent.documentFormatter, 'formatCompleteBook').mockResolvedValue({
        pdf: { format: 'pdf', fileSize: 2048, title: topic },
        epub: { format: 'epub', fileSize: 1024, title: topic },
        mobi: { format: 'mobi', fileSize: 1000, title: topic },
        docx: { format: 'docx', fileSize: 1500, title: topic },
        txt: { format: 'txt', fileSize: 800, title: topic },
        html: { format: 'html', fileSize: 1200, title: topic }
      });

      jest.spyOn(agent.publishingCoordinator, 'publishToMultiplePublishers').mockResolvedValue({
        publisherDeals: [
          {
            success: true,
            publisher: { name: 'Test Publisher' },
            finalOffer: {
              royaltyRate: 0.12,
              advance: 10000,
              territory: 'worldwide'
            }
          }
        ],
        amazonListing: {
          success: true,
          asin: 'B0123456789'
        }
      });

      // Execute the complete workflow
      const result = await agent.createBook(topic, options);

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.title).toBe(topic);
      expect(result.status).toBe('completed');

      // Verify all components were executed
      expect(result.interviewResults).toBeDefined();
      expect(result.marketAnalysis).toBeDefined();
      expect(result.researchData).toBeDefined();
      expect(result.contentPlan).toBeDefined();
      expect(result.chapters).toBeDefined();
      expect(result.chapters.length).toBe(3);
      expect(result.visualPlan).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.images.length).toBe(4);
      expect(result.formattedBook).toBeDefined();
      expect(Object.keys(result.formattedBook)).toEqual(
        expect.arrayContaining(['pdf', 'epub', 'mobi', 'docx', 'txt', 'html'])
      );
      expect(result.publishing).toBeDefined();
      expect(result.publishing.publisherDeals).toBeDefined();
      expect(result.publishing.amazonListing).toBeDefined();

      // Verify the book was saved
      const savedProject = await agent.loadBookProject(topic);
      expect(savedProject).toBeDefined();
      expect(savedProject.title).toBe(topic);
      expect(savedProject.status).toBe('completed');
    }, 30000); // 30 second timeout for integration test

    it('should handle workflow errors gracefully', async () => {
      const topic = 'Error Test Book';

      // Mock an error in the early stages
      jest.spyOn(agent.interviewConductor, 'conductProfessionalInterview').mockRejectedValue(
        new Error('Test error in interview')
      );

      await expect(agent.createBook(topic)).rejects.toThrow('Test error in interview');

      // Verify error state was saved
      const savedProject = await agent.loadBookProject(topic);
      expect(savedProject).toBeDefined();
      expect(savedProject.status).toBe('failed');
      expect(savedProject.error).toBeDefined();
    });
  });

  describe('Component Integration', () => {
    it('should integrate ContentPlanner with ChapterWriter', async () => {
      const topic = 'Integration Test Topic';
      const interviewResults = {
        structure: {
          chapterCount: 2,
          includeIntroduction: false,
          includeConclusion: false
        }
      };
      const researchData = {
        items: [{ title: 'Research Item', qualityScore: 80 }]
      };

      // Create content plan
      const contentPlan = await agent.contentPlanner.createContentPlan(topic, interviewResults, researchData);

      // Write chapters based on the plan
      const writtenChapters = await agent.writeChapters(contentPlan, researchData);

      expect(contentPlan.chapters.length).toBe(2);
      expect(writtenChapters.length).toBe(2);

      // Verify chapters have expected structure
      writtenChapters.forEach((chapter, index) => {
        expect(chapter.chapter.number).toBe(contentPlan.chapters[index].number);
        expect(chapter.chapter.title).toBe(contentPlan.chapters[index].title);
        expect(chapter.content).toBeDefined();
        expect(chapter.qualityScore).toBeDefined();
      });
    });

    it('should integrate ResearchManager with ContentPlanner', async () => {
      const topic = 'Research Integration Test';
      const interviewResults = {
        bookType: { suggestedFormats: ['Sachbuch'] },
        useExactTitle: true
      };

      // Mock research data
      const researchData = {
        items: [
          { title: 'Research 1', qualityScore: 85, relevanceScore: 90 },
          { title: 'Research 2', qualityScore: 80, relevanceScore: 85 }
        ],
        statistics: { totalItems: 2, averageQuality: 82.5, averageRelevance: 87.5 }
      };

      // Create content plan using research data
      const contentPlan = await agent.contentPlanner.createContentPlan(topic, interviewResults, researchData);

      expect(contentPlan).toBeDefined();
      expect(contentPlan.title).toBe(topic);
      expect(contentPlan.chapters).toBeDefined();
      expect(Array.isArray(contentPlan.chapters)).toBe(true);
      expect(contentPlan.chapters.length).toBeGreaterThan(0);
    });

    it('should integrate VisualContentPlanner with ImageGenerator', async () => {
      const bookContent = {
        title: 'Visual Integration Test',
        chapters: [
          { number: 1, title: 'Chapter 1', wordCount: 2000 },
          { number: 2, title: 'Chapter 2', wordCount: 1800 }
        ]
      };

      // Create visual content plan
      const visualPlan = await agent.visualContentPlanner.createComprehensivePlan(bookContent);

      // Extract image requirements
      const imageRequirements = [];
      visualPlan.chapters.forEach(chapterPlan => {
        chapterPlan.elements.forEach(element => {
          imageRequirements.push({
            chapter: chapterPlan.chapterNumber,
            description: element.description,
            type: element.type,
            style: 'professional'
          });
        });
      });

      // Generate images based on requirements
      const generatedImages = await agent.imageGenerator.batchGenerate(imageRequirements);

      expect(visualPlan).toBeDefined();
      expect(visualPlan.bookTitle).toBe(bookContent.title);
      expect(visualPlan.chapters.length).toBe(2);
      expect(generatedImages).toBeDefined();
      expect(Array.isArray(generatedImages)).toBe(true);
      expect(generatedImages.length).toBe(imageRequirements.length);
    });
  });
});