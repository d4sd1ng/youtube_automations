const ContentPlanner = require('../../core/ContentPlanner');

describe('ContentPlanner', () => {
  let contentPlanner;

  beforeEach(() => {
    contentPlanner = new ContentPlanner();
  });

  describe('createContentPlan', () => {
    it('should create a content plan with default structure', async () => {
      const topic = 'Künstliche Intelligenz in der Politik';
      const interviewResults = {
        bookType: {
          suggestedFormats: ['Sachbuch'],
          targetLength: '200 pages'
        },
        useExactTitle: true,
        structure: {
          includeIntroduction: false,
          includeConclusion: false
        }
      };

      const researchData = {
        items: [
          { title: 'AI in Government', qualityScore: 85 },
          { title: 'Ethics of AI', qualityScore: 90 }
        ]
      };

      const plan = await contentPlanner.createContentPlan(topic, interviewResults, researchData);

      expect(plan).toBeDefined();
      expect(plan.title).toBe(topic);
      expect(plan.chapters).toBeInstanceOf(Array);
      expect(plan.chapters.length).toBeGreaterThan(0);
      expect(plan.styleGuide).toBeDefined();
    });

    it('should create appropriate number of chapters', async () => {
      const topic = 'Digitale Transformation';
      const interviewResults = {
        structure: {
          chapterCount: 5,
          includeIntroduction: false,
          includeConclusion: false
        }
      };

      const researchData = {
        items: []
      };

      const plan = await contentPlanner.createContentPlan(topic, interviewResults, researchData);

      expect(plan.chapters.length).toBe(5);
    });
  });

  describe('generateChapterStructure', () => {
    it('should generate chapter with title and key points', async () => {
      const topic = 'Blockchain Technology';
      const requirements = {
        chapterCount: 1
      };
      const template = {
        structure: {
          chapters: 1
        }
      };

      const chapters = await contentPlanner.generateChapterStructure(topic, requirements, template);

      expect(chapters).toBeDefined();
      expect(chapters.length).toBeGreaterThan(0);
      expect(chapters[0].title).toBeDefined();
      expect(chapters[0].keyPoints).toBeInstanceOf(Array);
      expect(chapters[0].keyPoints.length).toBeGreaterThan(0);
    });
  });

  describe('createStyleGuide', () => {
    it('should create a style guide with required properties', () => {
      const interviewResults = {
        bookType: {
          suggestedFormats: ['Sachbuch']
        }
      };

      const styleGuide = contentPlanner.createStyleGuide(interviewResults);

      expect(styleGuide).toBeDefined();
      expect(styleGuide.tone).toBeDefined();
      expect(styleGuide.targetAudience).toBeDefined();
      expect(styleGuide.languageLevel).toBeDefined();
      expect(styleGuide.formatting).toBeDefined();
    });
  });
});