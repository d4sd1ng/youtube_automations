const WebScrapingService = require('./webScrapingService');
const TextAnalysisService = require('./textAnalysisService');
const AdvancedPromptingService = require('./advancedPromptingService');
const fs = require('fs');
const path = require('path');

/**
 * Book Writer Agent
 * Creates books in multiple formats (paperback, novel, biography, non-fiction, etc.)
 * Follows a complete workflow from topic selection to publisher search
 */
class BookWriterAgent {
  constructor() {
    this.scraper = new WebScrapingService();
    this.textAnalyzer = new TextAnalysisService();
    this.prompter = new AdvancedPromptingService();
    this.booksDir = path.join(__dirname, '../../data/books');

    // Ensure books directory exists
    if (!fs.existsSync(this.booksDir)) {
      fs.mkdirSync(this.booksDir, { recursive: true });
    }

    // Book formats supported
    this.supportedFormats = [
      'paperback',     // Taschenbuch
      'novel',         // Roman
      'biography',     // Biographie
      'non-fiction',   // Fachbuch
      'ebook',         // E-Book
      'audiobook'      // Hörbuch
    ];
  }

  /**
   * Main workflow for book creation
   * @param {Object} options - Book creation options
   * @param {string} options.topic - Book topic
   * @param {string} options.format - Book format
   * @param {boolean} options.useScraper - Whether to use scraper for research
   * @returns {Promise<Object>} Book creation result
   */
  async createBook(options = {}) {
    const { topic, format = 'novel', useScraper = true } = options;

    console.log(`📚 Starting Book Writer Agent for topic: ${topic}`);
    console.log(`📋 Format: ${format}`);
    console.log(`🔍 Using scraper: ${useScraper}`);

    try {
      // Step 1: Validate format
      if (!this.supportedFormats.includes(format)) {
        throw new Error(`Unsupported format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`);
      }

      // Step 2: Research phase
      console.log('\n🔍 Starting research phase...');
      const researchData = await this.researchTopic(topic, useScraper);

      // Step 3: Interview phase
      console.log('\n🗣️ Starting interview phase...');
      const bookSpecs = await this.conductInterview(topic, format, researchData);

      // Step 4: Writing phase
      console.log('\n✍️ Starting writing phase...');
      const bookContent = await this.writeBook(bookSpecs, researchData);

      // Step 5: Review phase
      console.log('\n🧐 Starting review phase...');
      const finalBook = await this.reviewAndRevise(bookContent, bookSpecs);

      // Step 6: Publisher search
      console.log('\n🔎 Starting publisher search...');
      const publisherResults = await this.searchPublishers(finalBook, bookSpecs);

      // Step 7: Save book
      const bookPath = await this.saveBook(finalBook, bookSpecs);

      console.log('\n🎉 Book creation completed successfully!');

      return {
        success: true,
        bookPath,
        bookSpecs,
        publisherResults,
        message: 'Book created successfully'
      };
    } catch (error) {
      console.error('❌ Book creation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Book creation failed'
      };
    }
  }

  /**
   * Research topic using scraper or keyword search
   * @param {string} topic - Book topic
   * @param {boolean} useScraper - Whether to use scraper
   * @returns {Promise<Object>} Research data
   */
  async researchTopic(topic, useScraper) {
    console.log(`🔍 Researching topic: ${topic}`);

    if (useScraper) {
      try {
        // Try to find relevant content using existing scrapers
        const scrapeResults = await this.scraper.scrapeContentWithKeywords([topic]);
        console.log(`✅ Found ${scrapeResults.contentItems.length} relevant items`);
        return {
          scrapedContent: scrapeResults.contentItems.slice(0, 10), // Top 10 items
          keywords: [topic],
          source: 'scraper'
        };
      } catch (error) {
        console.warn('⚠️ Scraper failed, falling back to keyword search:', error.message);
      }
    }

    // Fallback to keyword extraction
    const keywords = await this.textAnalyzer.extractKeywords(topic, '');
    console.log(`🔑 Extracted keywords: ${keywords.join(', ')}`);

    return {
      scrapedContent: [],
      keywords,
      source: 'keywords'
    };
  }

  /**
   * Conduct interview to determine book specifications
   * @param {string} topic - Book topic
   * @param {string} format - Book format
   * @param {Object} researchData - Research data
   * @returns {Promise<Object>} Book specifications
   */
  async conductInterview(topic, format, researchData) {
    console.log('🗣️ Conducting book specification interview...');

    // In a real implementation, this would be an interactive interview
    // For now, we'll generate specifications based on the format and topic
    const specifications = await this.generateBookSpecifications(topic, format, researchData);

    console.log('✅ Interview completed, book specifications determined');
    return specifications;
  }

  /**
   * Generate book specifications
   * @param {string} topic - Book topic
   * @param {string} format - Book format
   * @param {Object} researchData - Research data
   * @returns {Promise<Object>} Book specifications
   */
  async generateBookSpecifications(topic, format, researchData) {
    // Default specifications based on format
    const baseSpecs = {
      topic,
      format,
      writingStyle: 'formal',
      chapterCount: 10,
      wordCount: 70000,
      hasPreface: true,
      hasIntroduction: true,
      hasConclusion: true,
      hasBibliography: format === 'non-fiction' || format === 'biography',
      hasIndex: format === 'non-fiction',
      targetAudience: 'general',
      language: 'de' // German as default
    };

    // Adjust specifications based on format
    switch (format) {
      case 'paperback':
        baseSpecs.wordCount = 80000;
        baseSpecs.chapterCount = 12;
        break;
      case 'novel':
        baseSpecs.writingStyle = 'narrative';
        baseSpecs.wordCount = 90000;
        baseSpecs.chapterCount = 15;
        baseSpecs.hasPreface = false;
        baseSpecs.hasIntroduction = false;
        baseSpecs.hasConclusion = false;
        baseSpecs.hasBibliography = false;
        baseSpecs.hasIndex = false;
        break;
      case 'biography':
        baseSpecs.writingStyle = 'biographical';
        baseSpecs.wordCount = 60000;
        baseSpecs.chapterCount = 8;
        baseSpecs.hasBibliography = true;
        break;
      case 'non-fiction':
        baseSpecs.writingStyle = 'informative';
        baseSpecs.wordCount = 50000;
        baseSpecs.chapterCount = 10;
        baseSpecs.hasBibliography = true;
        baseSpecs.hasIndex = true;
        break;
      case 'ebook':
        baseSpecs.wordCount = 40000;
        baseSpecs.chapterCount = 8;
        break;
      case 'audiobook':
        baseSpecs.wordCount = 60000;
        baseSpecs.chapterCount = 10;
        break;
    }

    // Enhance with research data if available
    if (researchData.keywords && researchData.keywords.length > 0) {
      baseSpecs.keywords = researchData.keywords;
    }

    return baseSpecs;
  }

  /**
   * Write the book chapter by chapter
   * @param {Object} bookSpecs - Book specifications
   * @param {Object} researchData - Research data
   * @returns {Promise<Object>} Book content
   */
  async writeBook(bookSpecs, researchData) {
    console.log(`✍️ Writing book: ${bookSpecs.topic} (${bookSpecs.format})`);
    console.log(`챕 Chapter count: ${bookSpecs.chapterCount}`);
    console.log(`낱 Word count: ${bookSpecs.wordCount}`);

    const bookContent = {
      title: bookSpecs.topic,
      format: bookSpecs.format,
      chapters: [],
      preface: '',
      introduction: '',
      conclusion: '',
      bibliography: '',
      index: ''
    };

    // Write preface if needed
    if (bookSpecs.hasPreface) {
      console.log('✍️ Writing preface...');
      bookContent.preface = await this.writePreface(bookSpecs, researchData);
    }

    // Write introduction if needed
    if (bookSpecs.hasIntroduction) {
      console.log('✍️ Writing introduction...');
      bookContent.introduction = await this.writeIntroduction(bookSpecs, researchData);
    }

    // Write chapters
    for (let i = 1; i <= bookSpecs.chapterCount; i++) {
      console.log(`✍️ Writing chapter ${i}/${bookSpecs.chapterCount}...`);
      const chapter = await this.writeChapter(i, bookSpecs, researchData);
      bookContent.chapters.push(chapter);
    }

    // Write conclusion if needed
    if (bookSpecs.hasConclusion) {
      console.log('✍️ Writing conclusion...');
      bookContent.conclusion = await this.writeConclusion(bookSpecs, researchData);
    }

    // Write bibliography if needed
    if (bookSpecs.hasBibliography) {
      console.log('✍️ Writing bibliography...');
      bookContent.bibliography = await this.writeBibliography(bookSpecs, researchData);
    }

    // Write index if needed
    if (bookSpecs.hasIndex) {
      console.log('✍️ Writing index...');
      bookContent.index = await this.writeIndex(bookSpecs, bookContent.chapters);
    }

    console.log('✅ Book writing completed');
    return bookContent;
  }

  /**
   * Write preface
   * @param {Object} bookSpecs - Book specifications
   * @param {Object} researchData - Research data
   * @returns {Promise<string>} Preface content
   */
  async writePreface(bookSpecs, researchData) {
    // In a real implementation, this would generate actual content
    // For now, we'll return a placeholder
    return `Preface for ${bookSpecs.topic}\n\nThis book explores the fascinating topic of ${bookSpecs.topic}...`;
  }

  /**
   * Write introduction
   * @param {Object} bookSpecs - Book specifications
   * @param {Object} researchData - Research data
   * @returns {Promise<string>} Introduction content
   */
  async writeIntroduction(bookSpecs, researchData) {
    // In a real implementation, this would generate actual content
    // For now, we'll return a placeholder
    return `Introduction to ${bookSpecs.topic}\n\nIn this book, we will explore...`;
  }

  /**
   * Write a chapter
   * @param {number} chapterNumber - Chapter number
   * @param {Object} bookSpecs - Book specifications
   * @param {Object} researchData - Research data
   * @returns {Promise<Object>} Chapter content
   */
  async writeChapter(chapterNumber, bookSpecs, researchData) {
    // In a real implementation, this would generate actual content
    // For now, we'll return a placeholder
    return {
      number: chapterNumber,
      title: `Chapter ${chapterNumber}: ${bookSpecs.topic} - Part ${chapterNumber}`,
      content: `Content for chapter ${chapterNumber} about ${bookSpecs.topic}...\n\nThis is where the detailed content would go.`
    };
  }

  /**
   * Write conclusion
   * @param {Object} bookSpecs - Book specifications
   * @param {Object} researchData - Research data
   * @returns {Promise<string>} Conclusion content
   */
  async writeConclusion(bookSpecs, researchData) {
    // In a real implementation, this would generate actual content
    // For now, we'll return a placeholder
    return `Conclusion for ${bookSpecs.topic}\n\nIn conclusion, we have explored...`;
  }

  /**
   * Write bibliography
   * @param {Object} bookSpecs - Book specifications
   * @param {Object} researchData - Research data
   * @returns {Promise<string>} Bibliography content
   */
  async writeBibliography(bookSpecs, researchData) {
    // In a real implementation, this would generate actual content
    // For now, we'll return a placeholder
    return `Bibliography for ${bookSpecs.topic}\n\n1. Source 1\n2. Source 2\n3. Source 3`;
  }

  /**
   * Write index
   * @param {Object} bookSpecs - Book specifications
   * @param {Array} chapters - Book chapters
   * @returns {Promise<string>} Index content
   */
  async writeIndex(bookSpecs, chapters) {
    // In a real implementation, this would generate actual content
    // For now, we'll return a placeholder
    let indexContent = `Index for ${bookSpecs.topic}\n\n`;
    chapters.forEach((chapter, index) => {
      indexContent += `${chapter.title} ... ${index + 1}\n`;
    });
    return indexContent;
  }

  /**
   * Review and revise book content
   * @param {Object} bookContent - Book content
   * @param {Object} bookSpecs - Book specifications
   * @returns {Promise<Object>} Reviewed book content
   */
  async reviewAndRevise(bookContent, bookSpecs) {
    console.log('🧐 Reviewing and revising book content...');

    // In a real implementation, this would perform actual review and revision
    // For now, we'll just return the content as is
    console.log('✅ Review and revision completed');
    return bookContent;
  }

  /**
   * Search for publishers
   * @param {Object} bookContent - Book content
   * @param {Object} bookSpecs - Book specifications
   * @returns {Promise<Object>} Publisher search results
   */
  async searchPublishers(bookContent, bookSpecs) {
    console.log('🔎 Searching for publishers...');

    // In a real implementation, this would search for actual publishers
    // For now, we'll return placeholder results
    const publishers = [
      { name: 'Publisher A', contact: 'contact@publishera.com', suitable: true },
      { name: 'Publisher B', contact: 'info@publisherb.com', suitable: false },
      { name: 'Publisher C', contact: 'hello@publisherc.com', suitable: true }
    ];

    console.log(`✅ Found ${publishers.length} potential publishers`);
    return {
      publishers,
      recommended: publishers.filter(p => p.suitable)
    };
  }

  /**
   * Save book to file
   * @param {Object} bookContent - Book content
   * @param {Object} bookSpecs - Book specifications
   * @returns {Promise<string>} Path to saved book
   */
  async saveBook(bookContent, bookSpecs) {
    console.log('💾 Saving book to file...');

    // Create book directory
    const bookDir = path.join(this.booksDir, `${bookSpecs.topic.replace(/\s+/g, '_')}_${Date.now()}`);
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    // Save main book content
    const bookPath = path.join(bookDir, 'book.txt');
    let bookText = `# ${bookContent.title}\n\n`;

    if (bookContent.preface) {
      bookText += `## Preface\n\n${bookContent.preface}\n\n`;
    }

    if (bookContent.introduction) {
      bookText += `## Introduction\n\n${bookContent.introduction}\n\n`;
    }

    bookContent.chapters.forEach(chapter => {
      bookText += `## ${chapter.title}\n\n${chapter.content}\n\n`;
    });

    if (bookContent.conclusion) {
      bookText += `## Conclusion\n\n${bookContent.conclusion}\n\n`;
    }

    if (bookContent.bibliography) {
      bookText += `## Bibliography\n\n${bookContent.bibliography}\n\n`;
    }

    if (bookContent.index) {
      bookText += `## Index\n\n${bookContent.index}\n\n`;
    }

    fs.writeFileSync(bookPath, bookText);

    // Save book specifications
    const specsPath = path.join(bookDir, 'specifications.json');
    fs.writeFileSync(specsPath, JSON.stringify(bookSpecs, null, 2));

    console.log(`✅ Book saved to: ${bookPath}`);
    return bookPath;
  }
}

module.exports = BookWriterAgent;