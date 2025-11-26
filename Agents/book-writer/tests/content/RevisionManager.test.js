const RevisionManager = require('../../content/RevisionManager');

describe('RevisionManager', () => {
  let revisionManager;

  beforeEach(() => {
    revisionManager = new RevisionManager();
  });

  describe('handleRevision', () => {
    it('should handle chapter revision with feedback', async () => {
      const chapter = {
        content: 'Original chapter content that needs improvement',
        qualityScore: 0.6,
        chapter: { title: 'Test Chapter' }
      };
      const feedback = { qualityScore: 0.6 };
      const styleGuide = { tone: 'educational' };

      const result = await revisionManager.handleRevision(chapter, feedback, styleGuide);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.revisionCount).toBe(1);
      expect(result.qualityScore).toBeDefined();
      // The quality score should be higher after revision
      expect(result.qualityScore).toBeGreaterThan(chapter.qualityScore);
    });

    it('should handle multiple revision rounds', async () => {
      const chapter = {
        content: 'Poor quality content that needs significant improvement',
        qualityScore: 0.3,
        chapter: { title: 'Poor Quality Chapter' }
      };
      const feedback = { qualityScore: 0.3 };
      const styleGuide = { tone: 'professional' };

      const result = await revisionManager.handleRevision(chapter, feedback, styleGuide);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.revisionCount).toBeGreaterThanOrEqual(1);
      expect(result.qualityScore).toBeGreaterThan(chapter.qualityScore);
    });
  });

  describe('assessQuality', () => {
    it('should assess content quality', async () => {
      const content = 'This is a well-structured chapter with good content and appropriate length.';
      const chapterData = { keyPoints: ['Point 1', 'Point 2'] };
      const styleGuide = { tone: 'educational' };

      const qualityScore = await revisionManager.assessQuality(content, chapterData, styleGuide);

      expect(qualityScore).toBeDefined();
      expect(qualityScore).toBeGreaterThanOrEqual(0);
      expect(qualityScore).toBeLessThanOrEqual(1);
    });

    it('should return lower score for poor quality content', async () => {
      const content = 'Bad content.';
      const chapterData = { keyPoints: [] };
      const styleGuide = { tone: 'educational' };

      const qualityScore = await revisionManager.assessQuality(content, chapterData, styleGuide);

      expect(qualityScore).toBeLessThan(0.7); // Should be below revision threshold
    });
  });

  describe('generateRevisionFeedback', () => {
    it('should generate revision feedback based on quality score', () => {
      const qualityScore = 0.5;
      const content = 'Content that needs improvement';
      const chapterData = { title: 'Test Chapter' };

      const feedback = revisionManager.generateRevisionFeedback(qualityScore, content, chapterData);

      expect(feedback).toBeDefined();
      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
    });

    it('should generate specific feedback for different issues', () => {
      const qualityScore = 0.3; // Low quality
      const content = 'Very short content';
      const chapterData = {
        title: 'Short Chapter',
        keyPoints: ['Point 1', 'Point 2', 'Point 3']
      };

      const feedback = revisionManager.generateRevisionFeedback(qualityScore, content, chapterData);

      expect(feedback).toContainEqual(expect.stringContaining('expansion'));
      expect(feedback).toContainEqual(expect.stringContaining('short'));
    });
  });

  describe('applyRevisions', () => {
    it('should apply revisions to content based on feedback', () => {
      const content = 'Original content';
      const feedback = ['Content needs more details', 'Add examples'];
      const chapterData = { title: 'Test Chapter' };

      const revisedContent = revisionManager.applyRevisions(content, feedback, chapterData);

      expect(revisedContent).toBeDefined();
      expect(typeof revisedContent).toBe('string');
      // The revised content should be different from original
      expect(revisedContent).not.toBe(content);
    });
  });

  describe('needsRevision', () => {
    it('should correctly determine if revision is needed', () => {
      // Below threshold
      expect(revisionManager.needsRevision(0.6)).toBe(true);
      expect(revisionManager.needsRevision(0.7)).toBe(true);

      // Above threshold
      expect(revisionManager.needsRevision(0.85)).toBe(false);
      expect(revisionManager.needsRevision(0.95)).toBe(false);
    });
  });
});