const fs = require('fs');
const path = require('path');

/**
 * Document Formatter for Book Writer Agent
 * Handles formatting of book content for various output formats
 */
class DocumentFormatter {
  constructor(config = {}) {
    this.config = {
      outputDir: path.join(__dirname, '../../../data/formatted'),
      defaultFormat: 'pdf',
      supportedFormats: ['pdf', 'epub', 'mobi', 'docx', 'txt', 'html'],
      ...config
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Format book content for specific output format
   * @param {Object} bookContent - Book content to format
   * @param {string} format - Output format
   * @param {Object} options - Formatting options
   * @returns {Promise<Object>} Formatted document
   */
  async formatDocument(bookContent, format = this.config.defaultFormat, options = {}) {
    console.log(`📐 Formatting document as ${format.toUpperCase()}: ${bookContent.title}`);

    try {
      // Validate format
      if (!this.config.supportedFormats.includes(format.toLowerCase())) {
        throw new Error(`Unsupported format: ${format}. Supported formats: ${this.config.supportedFormats.join(', ')}`);
      }

      // Format document based on format type
      let formattedDocument;

      switch (format.toLowerCase()) {
        case 'pdf':
          formattedDocument = await this.formatAsPDF(bookContent, options);
          break;
        case 'epub':
          formattedDocument = await this.formatAsEPUB(bookContent, options);
          break;
        case 'mobi':
          formattedDocument = await this.formatAsMOBI(bookContent, options);
          break;
        case 'docx':
          formattedDocument = await this.formatAsDOCX(bookContent, options);
          break;
        case 'txt':
          formattedDocument = await this.formatAsTXT(bookContent, options);
          break;
        case 'html':
          formattedDocument = await this.formatAsHTML(bookContent, options);
          break;
        default:
          throw new Error(`Formatting not implemented for format: ${format}`);
      }

      // Save formatted document
      await this.saveFormattedDocument(formattedDocument, bookContent.title, format);

      console.log(`✅ Document formatted as ${format.toUpperCase()}`);
      return formattedDocument;
    } catch (error) {
      console.error(`❌ Failed to format document as ${format.toUpperCase()}:`, error.message);
      throw error;
    }
  }

  /**
   * Format as PDF
   */
  async formatAsPDF(bookContent, options = {}) {
    // Simulate PDF formatting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real implementation, this would use a library like pdfkit or puppeteer
    const pdfData = {
      format: 'pdf',
      title: bookContent.title,
      author: bookContent.author,
      pages: bookContent.chapters ? bookContent.chapters.length + 10 : 200, // Estimate
      fileSize: this.estimateFileSize(bookContent, 'pdf'),
      contentPreview: this.generateContentPreview(bookContent, 500),
      metadata: {
        formattedAt: new Date().toISOString(),
        formatter: 'DocumentFormatter',
        formatVersion: '1.0'
      }
    };

    return pdfData;
  }

  /**
   * Format as EPUB
   */
  async formatAsEPUB(bookContent, options = {}) {
    // Simulate EPUB formatting
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, this would create proper EPUB structure
    const epubData = {
      format: 'epub',
      title: bookContent.title,
      author: bookContent.author,
      chapters: bookContent.chapters ? bookContent.chapters.length : 10,
      fileSize: this.estimateFileSize(bookContent, 'epub'),
      contentPreview: this.generateContentPreview(bookContent, 500),
      metadata: {
        formattedAt: new Date().toISOString(),
        formatter: 'DocumentFormatter',
        formatVersion: '1.0',
        epubVersion: '3.0'
      }
    };

    return epubData;
  }

  /**
   * Format as MOBI
   */
  async formatAsMOBI(bookContent, options = {}) {
    // Simulate MOBI formatting
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, this would convert to MOBI format
    const mobiData = {
      format: 'mobi',
      title: bookContent.title,
      author: bookContent.author,
      chapters: bookContent.chapters ? bookContent.chapters.length : 10,
      fileSize: this.estimateFileSize(bookContent, 'mobi'),
      contentPreview: this.generateContentPreview(bookContent, 500),
      metadata: {
        formattedAt: new Date().toISOString(),
        formatter: 'DocumentFormatter',
        formatVersion: '1.0',
        mobiVersion: '7'
      }
    };

    return mobiData;
  }

  /**
   * Format as DOCX
   */
  async formatAsDOCX(bookContent, options = {}) {
    // Simulate DOCX formatting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would use a library like docxtemplater
    const docxData = {
      format: 'docx',
      title: bookContent.title,
      author: bookContent.author,
      wordCount: bookContent.wordCount || 50000,
      fileSize: this.estimateFileSize(bookContent, 'docx'),
      contentPreview: this.generateContentPreview(bookContent, 500),
      metadata: {
        formattedAt: new Date().toISOString(),
        formatter: 'DocumentFormatter',
        formatVersion: '1.0'
      }
    };

    return docxData;
  }

  /**
   * Format as TXT
   */
  async formatAsTXT(bookContent, options = {}) {
    // Simulate TXT formatting
    await new Promise(resolve => setTimeout(resolve, 500));

    const txtData = {
      format: 'txt',
      title: bookContent.title,
      author: bookContent.author,
      wordCount: bookContent.wordCount || 50000,
      fileSize: this.estimateFileSize(bookContent, 'txt'),
      contentPreview: this.generateContentPreview(bookContent, 500),
      metadata: {
        formattedAt: new Date().toISOString(),
        formatter: 'DocumentFormatter',
        formatVersion: '1.0'
      }
    };

    return txtData;
  }

  /**
   * Format as HTML
   */
  async formatAsHTML(bookContent, options = {}) {
    // Simulate HTML formatting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate HTML structure
    let htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bookContent.title}</title>
</head>
<body>
    <header>
        <h1>${bookContent.title}</h1>
        <p>Author: ${bookContent.author}</p>
    </header>
    <main>`;

    if (bookContent.chapters && Array.isArray(bookContent.chapters)) {
      for (const chapter of bookContent.chapters) {
        htmlContent += `
        <section>
            <h2>${chapter.title}</h2>
            <div>${chapter.content.substring(0, 1000)}...</div>
        </section>`;
      }
    }

    htmlContent += `
    </main>
</body>
</html>`;

    const htmlData = {
      format: 'html',
      title: bookContent.title,
      author: bookContent.author,
      content: htmlContent,
      fileSize: this.estimateFileSize({ content: htmlContent }, 'html'),
      contentPreview: this.generateContentPreview({ content: htmlContent }, 500),
      metadata: {
        formattedAt: new Date().toISOString(),
        formatter: 'DocumentFormatter',
        formatVersion: '1.0'
      }
    };

    return htmlData;
  }

  /**
   * Estimate file size based on content
   */
  estimateFileSize(bookContent, format) {
    // Rough estimation based on word count and format
    const wordCount = bookContent.wordCount ||
                     (bookContent.chapters ?
                      bookContent.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) :
                      50000);

    // Format multipliers (approximate)
    const formatMultipliers = {
      'txt': 1,
      'html': 1.5,
      'docx': 1.2,
      'pdf': 1.3,
      'epub': 1.1,
      'mobi': 1.0
    };

    const baseSize = wordCount * 6; // Average 6 characters per word
    const formatSize = baseSize * (formatMultipliers[format] || 1);

    // Return in KB
    return Math.round(formatSize / 1024);
  }

  /**
   * Generate content preview
   */
  generateContentPreview(bookContent, maxLength = 500) {
    let content = '';

    if (bookContent.chapters && bookContent.chapters.length > 0) {
      // Take content from first chapter
      content = bookContent.chapters[0].content || '';
    } else if (bookContent.content) {
      content = bookContent.content;
    }

    // Truncate to max length
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }

    return content;
  }

  /**
   * Format complete book with all supported formats
   * @param {Object} bookContent - Book content to format
   * @param {Object} options - Formatting options
   * @returns {Promise<Object>} All formatted documents
   */
  async formatCompleteBook(bookContent, options = {}) {
    console.log(`📚 Formatting complete book in all formats: ${bookContent.title}`);

    const formattedDocuments = {};

    for (const format of this.config.supportedFormats) {
      try {
        formattedDocuments[format] = await this.formatDocument(bookContent, format, options);
      } catch (error) {
        console.error(`❌ Failed to format as ${format.toUpperCase()}:`, error.message);
        formattedDocuments[format] = { error: error.message };
      }
    }

    // Save complete book data
    await this.saveCompleteBookData(bookContent, formattedDocuments);

    console.log('✅ Complete book formatting finished');
    return formattedDocuments;
  }

  /**
   * Apply style guide to book content
   * @param {Object} bookContent - Book content
   * @param {Object} styleGuide - Style guide to apply
   * @returns {Promise<Object>} Styled book content
   */
  async applyStyleGuide(bookContent, styleGuide) {
    console.log(`💅 Applying style guide to book: ${bookContent.title}`);

    try {
      // Simulate style guide application
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, this would apply formatting rules from the style guide
      const styledContent = {
        ...bookContent,
        styledAt: new Date().toISOString(),
        styleGuideApplied: styleGuide.id || 'custom',
        formattingChanges: this.simulateFormattingChanges(bookContent, styleGuide)
      };

      console.log('✅ Style guide applied');
      return styledContent;
    } catch (error) {
      console.error('❌ Failed to apply style guide:', error.message);
      throw error;
    }
  }

  /**
   * Simulate formatting changes
   */
  simulateFormattingChanges(bookContent, styleGuide) {
    // Simple simulation of formatting changes
    return {
      fontSize: styleGuide.fontSize || '12pt',
      fontFamily: styleGuide.fontFamily || 'Times New Roman',
      lineHeight: styleGuide.lineHeight || 1.5,
      margins: styleGuide.margins || '1 inch',
      changesCount: Math.floor(Math.random() * 20) + 5
    };
  }

  /**
   * Save formatted document
   */
  async saveFormattedDocument(formattedDocument, bookTitle, format) {
    try {
      const filename = `formatted-${this.sanitizeFilename(bookTitle)}.${format}`;
      const filepath = path.join(this.config.outputDir, filename);

      // For binary formats, we would save actual files
      // For text formats, we save as JSON with metadata
      if (['pdf', 'epub', 'mobi'].includes(format)) {
        // Simulate saving binary file
        fs.writeFileSync(filepath, `Binary content for ${format} format of "${bookTitle}"`);
      } else {
        // Save as JSON for text formats
        fs.writeFileSync(filepath + '.json', JSON.stringify(formattedDocument, null, 2));
      }

      console.log(`💾 Formatted document saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save formatted document:', error.message);
    }
  }

  /**
   * Save complete book data
   */
  async saveCompleteBookData(bookContent, formattedDocuments) {
    try {
      const filename = `complete-book-${this.sanitizeFilename(bookContent.title)}.json`;
      const filepath = path.join(this.config.outputDir, filename);

      const completeData = {
        book: bookContent,
        formattedDocuments: formattedDocuments,
        savedAt: new Date().toISOString()
      };

      fs.writeFileSync(filepath, JSON.stringify(completeData, null, 2));
      console.log(`💾 Complete book data saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save complete book data:', error.message);
    }
  }

  /**
   * Load formatted document
   */
  async loadFormattedDocument(bookTitle, format) {
    try {
      const filename = `formatted-${this.sanitizeFilename(bookTitle)}.${format}`;
      const filepath = path.join(this.config.outputDir, filename);

      // For binary formats, check if file exists
      // For text formats, load JSON
      if (['pdf', 'epub', 'mobi'].includes(format)) {
        if (fs.existsSync(filepath)) {
          return { format: format, filePath: filepath };
        }
      } else {
        const jsonPath = filepath + '.json';
        if (fs.existsSync(jsonPath)) {
          const content = fs.readFileSync(jsonPath, 'utf8');
          return JSON.parse(content);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load formatted document:', error.message);
      return null;
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get document formatting statistics
   */
  getStats() {
    try {
      const files = fs.readdirSync(this.config.outputDir);

      const formatStats = {};
      let totalFiles = 0;

      for (const file of files) {
        const ext = path.extname(file).toLowerCase().replace('.', '');
        if (this.config.supportedFormats.includes(ext) || ext === 'json') {
          formatStats[ext] = (formatStats[ext] || 0) + 1;
          totalFiles++;
        }
      }

      return {
        totalFiles,
        formatStats,
        outputDir: this.config.outputDir
      };
    } catch (error) {
      console.error('❌ Failed to get document formatting stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = DocumentFormatter;