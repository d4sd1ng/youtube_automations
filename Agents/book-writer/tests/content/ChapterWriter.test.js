const ChapterWriter = require('../../content/ChapterWriter');

describe('ChapterWriter', () => {
  let chapterWriter;

  beforeEach(() => {
    chapterWriter = new ChapterWriter();
  });

  describe('writeChapter', () => {
    it('should write a chapter with content and quality score', async () => {
      const chapterData = {
        number: 1,
        title: 'Einführung in KI',
        topic: 'Künstliche Intelligenz',
        keyPoints: ['Definition', 'Geschichte', 'Anwendungen'],
        type: 'main'
      };

      const styleGuide = {
        tone: 'educational',
        targetAudience: 'general',
        languageLevel: 'intermediate'
      };

      const researchData = {
        items: [
          { title: 'AI Basics', content: 'Introduction to AI concepts' }
        ]
      };

      const result = await chapterWriter.writeChapter(chapterData, styleGuide, researchData);

      expect(result).toBeDefined();
      expect(result.chapter).toEqual(chapterData);
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeLessThanOrEqual(1);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should handle introduction chapter type', async () => {
      const chapterData = {
        number: 1,
        title: 'Einleitung',
        topic: 'Politik und KI',
        keyPoints: ['Zielsetzung', 'Struktur'],
        type: 'introduction'
      };

      const styleGuide = {
        tone: 'professional',
        targetAudience: 'academia',
        languageLevel: 'advanced'
      };

      const researchData = {};

      const result = await chapterWriter.writeChapter(chapterData, styleGuide, researchData);

      expect(result).toBeDefined();
      expect(result.content).toContain('Einleitung');
    });

    it('should handle conclusion chapter type', async () => {
      const chapterData = {
        number: 5,
        title: 'Fazit',
        topic: 'KI in der Gesellschaft',
        keyPoints: ['Zusammenfassung', 'Ausblick'],
        type: 'conclusion'
      };

      const styleGuide = {
        tone: 'reflective',
        targetAudience: 'general',
        languageLevel: 'intermediate'
      };

      const researchData = {};

      const result = await chapterWriter.writeChapter(chapterData, styleGuide, researchData);

      expect(result).toBeDefined();
      expect(result.content).toContain('Fazit');
    });
  });

  describe('assessQuality', () => {
    it('should assess quality of content', async () => {
      const content = 'This is a sample chapter content with sufficient length to evaluate quality metrics.';
      const chapterData = {
        keyPoints: ['Definition', 'History', 'Applications']
      };
      const styleGuide = {
        tone: 'educational',
        targetAudience: 'general'
      };

      const qualityScore = await chapterWriter.assessQuality(content, chapterData, styleGuide);

      expect(qualityScore).toBeGreaterThanOrEqual(0);
      expect(qualityScore).toBeLessThanOrEqual(1);
    });

    it('should return lower score for very short content', async () => {
      const content = 'Short content.';
      const chapterData = {
        keyPoints: ['Point 1']
      };
      const styleGuide = {
        tone: 'educational'
      };

      const qualityScore = await chapterWriter.assessQuality(content, chapterData, styleGuide);

      expect(qualityScore).toBeLessThan(0.8); // Should be below threshold
    });
  });
});