const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Book Writer Agent
 * Handles book creation and content generation for automated publishing
 * Supports various book formats and content types
 */
class BookWriterAgent {
  constructor(options = {}) {
    this.agentName = 'BookWriterAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Book writer storage paths
    this.booksDir = path.join(__dirname, '../../../data/books');
    this.chaptersDir = path.join(__dirname, '../../../data/book-chapters');
    this.templatesDir = path.join(__dirname, '../../../data/book-templates');
    this.jobsDir = path.join(__dirname, '../../../data/book-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported book formats
    this.bookFormats = {
      'ebook': 'E-Book',
      'pdf': 'PDF',
      'mobi': 'MOBI',
      'epub': 'EPUB',
      'audiobook': 'Hörbuch'
    };

    // Supported content types
    this.contentTypes = {
      'fiction': 'Fiktion',
      'non-fiction': 'Sachbuch',
      'technical': 'Technisches Buch',
      'educational': 'Bildungsbuch',
      'biography': 'Biografie',
      'self-help': 'Selbsthilfe'
    };

    // Book structure templates
    this.structureTemplates = {
      'standard': {
        name: 'Standardstruktur',
        chapters: [
          'Einleitung',
          'Hauptteil Kapitel 1',
          'Hauptteil Kapitel 2',
          'Hauptteil Kapitel 3',
          'Fazit',
          'Anhang'
        ]
      },
      'technical': {
        name: 'Technische Struktur',
        chapters: [
          'Vorwort',
          'Einführung',
          'Grundlagen',
          'Konzepte',
          'Implementierung',
          'Best Practices',
          'Fallstudien',
          'Zukunft',
          'Glossar',
          'Literaturverzeichnis'
        ]
      },
      'educational': {
        name: 'Bildungsstruktur',
        chapters: [
          'Lernziele',
          'Einführung',
          'Theorie',
          'Praxisbeispiele',
          'Übungen',
          'Zusammenfassung',
          'Selbsttest',
          'Weiterführende Literatur'
        ]
      }
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.booksDir, this.chaptersDir, this.templatesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute book writing task
   * @param {Object} taskData - The book writing task data
   * @returns {Object} Result of the book writing
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'create-book':
          result = await this.createBook(taskData.title, taskData.options);
          break;
        case 'generate-chapter':
          result = await this.generateChapter(taskData.bookId, taskData.chapterData, taskData.options);
          break;
        case 'format-book':
          result = await this.formatBook(taskData.bookId, taskData.format, taskData.options);
          break;
        case 'generate-book-outline':
          result = await this.generateBookOutline(taskData.topic, taskData.options);
          break;
        case 'get-book':
          result = await this.getBook(taskData.bookId);
          break;
        case 'list-books':
          result = await this.listBooks(taskData.options);
          break;
        case 'delete-book':
          result = await this.deleteBook(taskData.bookId);
          break;
        case 'get-job-status':
          result = await this.getJobStatus(taskData.jobId);
          break;
        default:
          throw new Error(`Unsupported task type: ${taskData.type}`);
      }

      return {
        success: true,
        agent: this.agentName,
        result: result,
        timestamp: this.lastExecution
      };
    } catch (error) {
      console.error('BookWriterAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a new book
   * @param {string} title - The book title
   * @param {Object} options - Creation options
   * @returns {Object} Created book
   */
  async createBook(title, options = {}) {
    const jobId = uuidv4();
    const bookId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'book-creation',
      status: 'processing',
      title: title,
      options: options,
      progress: {
        currentStage: 'creating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 10000 // 10 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Creating book: ${title}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Initializing book structure...' });
      this.saveJob(job);

      await this.sleep(500);

      // Generate book outline
      const outline = await this.generateBookOutline(title, options);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating book metadata...' });
      this.saveJob(job);

      await this.sleep(500);

      // Create book metadata
      const book = {
        id: bookId,
        title: title,
        author: options.author || 'Automated Author',
        description: options.description || `Ein Buch über ${title}`,
        contentType: options.contentType || 'non-fiction',
        structure: outline.structure,
        wordCount: 0,
        chapterCount: outline.structure.length,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        options: options
      };

      // Save book
      this.saveBook(book);

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = book;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Book created successfully' });
      this.saveJob(job);

      return book;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Book creation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Generate book outline
   * @param {string} topic - The book topic
   * @param {Object} options - Generation options
   * @returns {Object} Book outline
   */
  async generateBookOutline(topic, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'outline-generation',
      status: 'processing',
      topic: topic,
      options: options,
      progress: {
        currentStage: 'generating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 15000 // 15 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Generating outline for: ${topic}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing topic...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Determine structure template
      const template = this.structureTemplates[options.template || 'standard'];

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating chapter structure...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Generate detailed chapter descriptions
      const chapters = await this.generateChapterDescriptions(template.chapters, topic, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Finalizing outline...' });
      this.saveJob(job);

      await this.sleep(500);

      // Create outline
      const outline = {
        topic: topic,
        template: template.name,
        structure: chapters,
        estimatedWordCount: chapters.length * 2000, // Rough estimate
        generatedAt: new Date().toISOString(),
        options: options
      };

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = outline;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Outline generated successfully' });
      this.saveJob(job);

      return outline;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Outline generation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Generate chapter descriptions
   * @param {Array} chapterTitles - Chapter titles
   * @param {string} topic - The book topic
   * @param {Object} options - Generation options
   * @returns {Array} Chapter descriptions
   */
  async generateChapterDescriptions(chapterTitles, topic, options = {}) {
    const chapters = [];

    for (let i = 0; i < chapterTitles.length; i++) {
      const chapter = {
        id: `chapter-${uuidv4()}`,
        number: i + 1,
        title: chapterTitles[i],
        description: `Dieses Kapitel behandelt ${chapterTitles[i].toLowerCase()} im Kontext von ${topic}`,
        estimatedWordCount: 2000,
        status: 'planned',
        createdAt: new Date().toISOString()
      };

      chapters.push(chapter);
    }

    return chapters;
  }

  /**
   * Generate a chapter
   * @param {string} bookId - The book ID
   * @param {Object} chapterData - Chapter data
   * @param {Object} options - Generation options
   * @returns {Object} Generated chapter
   */
  async generateChapter(bookId, chapterData, options = {}) {
    const jobId = uuidv4();
    const chapterId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'chapter-generation',
      status: 'processing',
      bookId: bookId,
      chapterData: chapterData,
      options: options,
      progress: {
        currentStage: 'generating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 20000 // 20 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Generating chapter for book: ${bookId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating chapter content...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Generate chapter content
      const content = await this.generateChapterContent(chapterData, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Finalizing chapter...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Create chapter
      const chapter = {
        id: chapterId,
        bookId: bookId,
        ...chapterData,
        content: content,
        wordCount: content.split(' ').length,
        status: 'completed',
        generatedAt: new Date().toISOString(),
        options: options
      };

      // Save chapter
      this.saveChapter(chapter);

      // Update book word count
      await this.updateBookWordCount(bookId, chapter.wordCount);

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = chapter;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Chapter generated successfully' });
      this.saveJob(job);

      return chapter;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Chapter generation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Generate chapter content
   * @param {Object} chapterData - Chapter data
   * @param {Object} options - Generation options
   * @returns {string} Chapter content
   */
  async generateChapterContent(chapterData, options = {}) {
    // Mock chapter content generation
    const paragraphs = [];
    const paragraphCount = options.paragraphCount || 10;

    for (let i = 0; i < paragraphCount; i++) {
      paragraphs.push(`Dies ist Absatz ${i + 1} des Kapitels "${chapterData.title}". Hier wird der Inhalt ausführlich behandelt und wichtige Punkte erläutert. Die Informationen sind gut strukturiert und leicht verständlich.`);
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Format book
   * @param {string} bookId - The book ID
   * @param {string} format - The output format
   * @param {Object} options - Formatting options
   * @returns {Object} Formatted book
   */
  async formatBook(bookId, format, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'book-formatting',
      status: 'processing',
      bookId: bookId,
      format: format,
      options: options,
      progress: {
        currentStage: 'formatting',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 15000 // 15 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Formatting book ${bookId} as ${format}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Loading book content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Get book and chapters
      const book = await this.getBook(bookId);
      const chapters = await this.getBookChapters(bookId);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Formatting content...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Format book content
      const formattedContent = await this.formatBookContent(book, chapters, format, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating output file...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Create formatted book
      const formattedBook = {
        id: `formatted-${bookId}`,
        bookId: bookId,
        format: format,
        content: formattedContent,
        fileName: `${book.title.replace(/\s+/g, '_')}.${format}`,
        fileSize: formattedContent.length,
        formattedAt: new Date().toISOString(),
        options: options
      };

      // Save formatted book
      this.saveFormattedBook(formattedBook);

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = formattedBook;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Book formatted successfully' });
      this.saveJob(job);

      return formattedBook;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Book formatting failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Format book content
   * @param {Object} book - The book
   * @param {Array} chapters - The chapters
   * @param {string} format - The output format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted content
   */
  async formatBookContent(book, chapters, format, options = {}) {
    // Mock formatting based on format type
    let content = `# ${book.title}\n\n`;
    content += `**Autor:** ${book.author}\n\n`;
    content += `**Beschreibung:** ${book.description}\n\n`;
    content += `---\n\n`;

    for (const chapter of chapters) {
      content += `## ${chapter.title}\n\n`;
      content += `${chapter.content}\n\n`;
      content += `---\n\n`;
    }

    return content;
  }

  /**
   * Update book word count
   * @param {string} bookId - The book ID
   * @param {number} wordCount - Word count to add
   */
  async updateBookWordCount(bookId, wordCount) {
    try {
      const book = await this.getBook(bookId);
      if (book) {
        book.wordCount = (book.wordCount || 0) + wordCount;
        book.updatedAt = new Date().toISOString();
        this.saveBook(book);
      }
    } catch (error) {
      console.error('Error updating book word count:', error);
    }
  }

  /**
   * Get book by ID
   * @param {string} bookId - The book ID
   * @returns {Object} Book data
   */
  async getBook(bookId) {
    try {
      const filePath = path.join(this.booksDir, `${bookId}_book.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting book:', error);
      return null;
    }
  }

  /**
   * Get book chapters
   * @param {string} bookId - The book ID
   * @returns {Array} Book chapters
   */
  async getBookChapters(bookId) {
    try {
      const files = fs.readdirSync(this.chaptersDir);
      const chapters = files.filter(file => file.startsWith(`${bookId}_`) && file.endsWith('_chapter.json'))
        .map(file => {
          const filePath = path.join(this.chaptersDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        })
        .sort((a, b) => a.number - b.number);

      return chapters;
    } catch (error) {
      console.error('Error getting book chapters:', error);
      return [];
    }
  }

  /**
   * List books
   * @param {Object} options - Listing options
   * @returns {Array} List of books
   */
  async listBooks(options = {}) {
    try {
      const files = fs.readdirSync(this.booksDir);
      const books = files.filter(file => file.endsWith('_book.json'))
        .map(file => {
          const filePath = path.join(this.booksDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        });

      // Apply sorting and filtering options
      if (options.sortBy === 'title') {
        books.sort((a, b) => a.title.localeCompare(b.title));
      } else if (options.sortBy === 'createdAt') {
        books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Apply limit
      if (options.limit) {
        return books.slice(0, options.limit);
      }

      return books;
    } catch (error) {
      console.error('Error listing books:', error);
      return [];
    }
  }

  /**
   * Delete book
   * @param {string} bookId - The book ID
   * @returns {boolean} Success status
   */
  async deleteBook(bookId) {
    try {
      // Delete book file
      const bookFilePath = path.join(this.booksDir, `${bookId}_book.json`);
      if (fs.existsSync(bookFilePath)) {
        fs.unlinkSync(bookFilePath);
      }

      // Delete chapter files
      const files = fs.readdirSync(this.chaptersDir);
      files.filter(file => file.startsWith(`${bookId}_`) && file.endsWith('_chapter.json'))
        .forEach(file => {
          const filePath = path.join(this.chaptersDir, file);
          fs.unlinkSync(filePath);
        });

      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  /**
   * Save book to file system
   * @param {Object} book - The book data
   */
  saveBook(book) {
    try {
      const filePath = path.join(this.booksDir, `${book.id}_book.json`);
      fs.writeFileSync(filePath, JSON.stringify(book, null, 2));
    } catch (error) {
      console.error('Error saving book:', error);
    }
  }

  /**
   * Save chapter to file system
   * @param {Object} chapter - The chapter data
   */
  saveChapter(chapter) {
    try {
      const filePath = path.join(this.chaptersDir, `${chapter.id}_chapter.json`);
      fs.writeFileSync(filePath, JSON.stringify(chapter, null, 2));
    } catch (error) {
      console.error('Error saving chapter:', error);
    }
  }

  /**
   * Save formatted book to file system
   * @param {Object} formattedBook - The formatted book data
   */
  saveFormattedBook(formattedBook) {
    try {
      const filePath = path.join(this.booksDir, `${formattedBook.id}_formatted.json`);
      fs.writeFileSync(filePath, JSON.stringify(formattedBook, null, 2));
    } catch (error) {
      console.error('Error saving formatted book:', error);
    }
  }

  /**
   * Save job to file system
   * @param {Object} job - The job data
   */
  saveJob(job) {
    try {
      const filePath = path.join(this.jobsDir, `${job.id}_job.json`);
      fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  /**
   * Get job status
   * @param {string} jobId - The job ID
   * @returns {Object} Job status
   */
  async getJobStatus(jobId) {
    try {
      const filePath = path.join(this.jobsDir, `${jobId}_job.json`);
      if (fs.existsSync(filePath)) {
        const jobData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jobData);
      }
      return null;
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after specified time
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BookWriterAgent;