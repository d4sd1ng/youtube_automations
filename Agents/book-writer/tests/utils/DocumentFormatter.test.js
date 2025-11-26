const DocumentFormatter = require('../../utils/DocumentFormatter');

describe('DocumentFormatter', () => {
  let documentFormatter;

  beforeEach(() => {
    documentFormatter = new DocumentFormatter();
  });

  describe('formatDocument', () => {
    const bookContent = {
      title: 'Test Book',
      author: 'Test Author',
      wordCount: 50000,
      chapters: [
        { title: 'Chapter 1', content: 'Content 1', wordCount: 25000 },
        { title: 'Chapter 2', content: 'Content 2', wordCount: 25000 }
      ]
    };

    it('should format document as PDF', async () => {
      const result = await documentFormatter.formatDocument(bookContent, 'pdf');

      expect(result).toBeDefined();
      expect(result.format).toBe('pdf');
      expect(result.title).toBe(bookContent.title);
      expect(result.author).toBe(bookContent.author);
      expect(result.pages).toBeDefined();
      expect(result.fileSize).toBeDefined();
      expect(result.contentPreview).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should format document as EPUB', async () => {
      const result = await documentFormatter.formatDocument(bookContent, 'epub');

      expect(result).toBeDefined();
      expect(result.format).toBe('epub');
      expect(result.title).toBe(bookContent.title);
      expect(result.author).toBe(bookContent.author);
      expect(result.chapters).toBeDefined();
      expect(result.fileSize).toBeDefined();
      expect(result.contentPreview).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should format document as MOBI', async () => {
      const result = await documentFormatter.formatDocument(bookContent, 'mobi');

      expect(result).toBeDefined();
      expect(result.format).toBe('mobi');
      expect(result.title).toBe(bookContent.title);
      expect(result.author).toBe(bookContent.author);
      expect(result.chapters).toBeDefined();
      expect(result.fileSize).toBeDefined();
      expect(result.contentPreview).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should format document as DOCX', async () => {
      const result = await documentFormatter.formatDocument(bookContent, 'docx');

      expect(result).toBeDefined();
      expect(result.format).toBe('docx');
      expect(result.title).toBe(bookContent.title);
      expect(result.author).toBe(bookContent.author);
      expect(result.wordCount).toBe(bookContent.wordCount);
      expect(result.fileSize).toBeDefined();
      expect(result.contentPreview).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should format document as TXT', async () => {
      const result = await documentFormatter.formatDocument(bookContent, 'txt');

      expect(result).toBeDefined();
      expect(result.format).toBe('txt');
      expect(result.title).toBe(bookContent.title);
      expect(result.author).toBe(bookContent.author);
      expect(result.wordCount).toBe(bookContent.wordCount);
      expect(result.fileSize).toBeDefined();
      expect(result.contentPreview).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should format document as HTML', async () => {
      const result = await documentFormatter.formatDocument(bookContent, 'html');

      expect(result).toBeDefined();
      expect(result.format).toBe('html');
      expect(result.title).toBe(bookContent.title);
      expect(result.author).toBe(bookContent.author);
      expect(result.content).toBeDefined();
      expect(result.fileSize).toBeDefined();
      expect(result.contentPreview).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should throw error for unsupported format', async () => {
      await expect(documentFormatter.formatDocument(bookContent, 'unsupported'))
        .rejects
        .toThrow('Unsupported format: unsupported');
    });
  });

  describe('formatCompleteBook', () => {
    const bookContent = {
      title: 'Complete Test Book',
      author: 'Test Author',
      wordCount: 60000
    };

    it('should format complete book in all supported formats', async () => {
      const results = await documentFormatter.formatCompleteBook(bookContent);

      expect(results).toBeDefined();
      expect(results.pdf).toBeDefined();
      expect(results.epub).toBeDefined();
      expect(results.mobi).toBeDefined();
      expect(results.docx).toBeDefined();
      expect(results.txt).toBeDefined();
      expect(results.html).toBeDefined();

      // Check that all formats have the expected structure
      Object.keys(results).forEach(format => {
        if (!results[format].error) {
          expect(results[format].format).toBe(format);
          expect(results[format].title).toBe(bookContent.title);
          expect(results[format].author).toBe(bookContent.author);
        }
      });
    }, 20000); // Longer timeout for complete book formatting
  });

  describe('applyStyleGuide', () => {
    it('should apply style guide to book content', async () => {
      const bookContent = {
        title: 'Styled Book',
        author: 'Test Author',
        content: 'Book content'
      };

      const styleGuide = {
        fontSize: '12pt',
        fontFamily: 'Times New Roman',
        lineHeight: 1.5
      };

      const styledContent = await documentFormatter.applyStyleGuide(bookContent, styleGuide);

      expect(styledContent).toBeDefined();
      expect(styledContent.title).toBe(bookContent.title);
      expect(styledContent.author).toBe(bookContent.author);
      expect(styledContent.styledAt).toBeDefined();
      expect(styledContent.styleGuideApplied).toBeDefined();
      expect(styledContent.formattingChanges).toBeDefined();
    });
  });

  describe('estimateFileSize', () => {
    it('should estimate file size based on content', () => {
      const bookContent = { wordCount: 50000 };

      const pdfSize = documentFormatter.estimateFileSize(bookContent, 'pdf');
      const epubSize = documentFormatter.estimateFileSize(bookContent, 'epub');
      const txtSize = documentFormatter.estimateFileSize(bookContent, 'txt');

      expect(pdfSize).toBeDefined();
      expect(epubSize).toBeDefined();
      expect(txtSize).toBeDefined();

      // All should be numbers
      expect(typeof pdfSize).toBe('number');
      expect(typeof epubSize).toBe('number');
      expect(typeof txtSize).toBe('number');
    });
  });

  describe('generateContentPreview', () => {
    it('should generate content preview from book content', () => {
      const bookContent = {
        chapters: [
          { content: 'This is a very long content that should be truncated for the preview. '.repeat(20) }
        ]
      };

      const preview = documentFormatter.generateContentPreview(bookContent, 200);

      expect(preview).toBeDefined();
      expect(typeof preview).toBe('string');
      expect(preview.length).toBeLessThanOrEqual(200 + 3); // +3 for "..."
    });

    it('should handle book content without chapters', () => {
      const bookContent = {
        content: 'Direct content without chapters. '.repeat(10)
      };

      const preview = documentFormatter.generateContentPreview(bookContent, 100);

      expect(preview).toBeDefined();
      expect(typeof preview).toBe('string');
      expect(preview.length).toBeLessThanOrEqual(100 + 3); // +3 for "..."
    });
  });

  describe('getStats', () => {
    it('should return document formatting statistics', () => {
      const stats = documentFormatter.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalFiles).toBeDefined();
      expect(stats.formatStats).toBeDefined();
      expect(stats.outputDir).toBeDefined();
    });
  });
});