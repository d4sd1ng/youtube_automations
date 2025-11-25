const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Translation Agent
 * Handles translation of content for multilingual YouTube automations
 * Supports various languages and content types
 */
class TranslationAgent {
  constructor(options = {}) {
    this.agentName = 'TranslationAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Translation storage paths
    this.translationsDir = path.join(__dirname, '../../../data/translations');
    this.jobsDir = path.join(__dirname, '../../../data/translation-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported languages
    this.languages = {
      'en': { name: 'English', code: 'en' },
      'de': { name: 'Deutsch', code: 'de' },
      'es': { name: 'Español', code: 'es' },
      'fr': { name: 'Français', code: 'fr' },
      'it': { name: 'Italiano', code: 'it' },
      'pt': { name: 'Português', code: 'pt' },
      'ru': { name: 'Русский', code: 'ru' },
      'zh': { name: '中文', code: 'zh' },
      'ja': { name: '日本語', code: 'ja' },
      'ko': { name: '한국어', code: 'ko' }
    };

    // Supported content types
    this.contentTypes = {
      'title': 'Titel',
      'description': 'Beschreibung',
      'script': 'Skript',
      'tags': 'Tags',
      'social-media': 'Social Media Posts'
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.translationsDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute translation task
   * @param {Object} taskData - The translation task data
   * @returns {Object} Result of the translation
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'translate-content':
          result = await this.translateContent(taskData.content, taskData.sourceLanguage, taskData.targetLanguage, taskData.options);
          break;
        case 'translate-batch':
          result = await this.translateBatch(taskData.contents, taskData.sourceLanguage, taskData.targetLanguage, taskData.options);
          break;
        case 'detect-language':
          result = await this.detectLanguage(taskData.text);
          break;
        case 'list-translations':
          result = await this.listTranslations();
          break;
        case 'get-translation':
          result = await this.getTranslation(taskData.translationId);
          break;
        case 'delete-translation':
          result = await this.deleteTranslation(taskData.translationId);
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
      console.error('TranslationAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Translate content from source language to target language
   * @param {string|Object} content - The content to translate
   * @param {string} sourceLanguage - The source language code
   * @param {string} targetLanguage - The target language code
   * @param {Object} options - Translation options
   * @returns {Object} Translated content
   */
  async translateContent(content, sourceLanguage, targetLanguage, options = {}) {
    const jobId = uuidv4();
    const translationId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'content-translation',
      status: 'processing',
      content: content,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      options: options,
      progress: {
        currentStage: 'translating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 10000 // 10 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting translation from ${sourceLanguage} to ${targetLanguage}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Validate languages
      if (!this.languages[sourceLanguage]) {
        throw new Error(`Unsupported source language: ${sourceLanguage}`);
      }

      if (!this.languages[targetLanguage]) {
        throw new Error(`Unsupported target language: ${targetLanguage}`);
      }

      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Validating languages and content...' });
      this.saveJob(job);

      await this.sleep(500);

      // Perform translation
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Translating content...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Mock translation - in a real implementation, this would use a translation API
      let translatedContent;
      if (typeof content === 'string') {
        translatedContent = this.mockTranslateText(content, sourceLanguage, targetLanguage);
      } else if (typeof content === 'object') {
        translatedContent = this.mockTranslateObject(content, sourceLanguage, targetLanguage);
      } else {
        throw new Error('Unsupported content type for translation');
      }

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Finalizing translation...' });
      this.saveJob(job);

      await this.sleep(500);

      // Create translation result
      const translationResult = {
        id: translationId,
        content: translatedContent,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        sourceLanguageName: this.languages[sourceLanguage].name,
        targetLanguageName: this.languages[targetLanguage].name,
        translatedAt: new Date().toISOString(),
        options: options
      };

      // Save translation
      this.saveTranslation(translationResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = translationResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Translation completed successfully' });
      this.saveJob(job);

      return translationResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Translation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Translate batch of contents
   * @param {Array} contents - Array of contents to translate
   * @param {string} sourceLanguage - The source language code
   * @param {string} targetLanguage - The target language code
   * @param {Object} options - Translation options
   * @returns {Object} Batch translation result
   */
  async translateBatch(contents, sourceLanguage, targetLanguage, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'batch-translation',
      status: 'processing',
      contents: contents,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      options: options,
      progress: {
        currentStage: 'translating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: [],
        totalItems: contents.length,
        completedItems: 0
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: contents.length * 5000 // 5 seconds per item
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting batch translation of ${contents.length} items from ${sourceLanguage} to ${targetLanguage}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Validate languages
      if (!this.languages[sourceLanguage]) {
        throw new Error(`Unsupported source language: ${sourceLanguage}`);
      }

      if (!this.languages[targetLanguage]) {
        throw new Error(`Unsupported target language: ${targetLanguage}`);
      }

      // Update job progress
      job.progress.stageProgress = 10;
      job.progress.overallProgress = 10;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Validating languages and contents...' });
      this.saveJob(job);

      await this.sleep(500);

      // Translate each content item
      const translations = [];
      for (let i = 0; i < contents.length; i++) {
        const content = contents[i];

        // Update job progress
        job.progress.completedItems = i;
        job.progress.stageProgress = 10 + (i / contents.length) * 80;
        job.progress.overallProgress = 10 + (i / contents.length) * 80;
        job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Translating item ${i + 1} of ${contents.length}` });
        this.saveJob(job);

        // Perform translation
        let translatedContent;
        if (typeof content === 'string') {
          translatedContent = this.mockTranslateText(content, sourceLanguage, targetLanguage);
        } else if (typeof content === 'object') {
          translatedContent = this.mockTranslateObject(content, sourceLanguage, targetLanguage);
        } else {
          throw new Error('Unsupported content type for translation');
        }

        translations.push({
          original: content,
          translated: translatedContent,
          index: i
        });

        await this.sleep(1000);
      }

      // Update job progress
      job.progress.stageProgress = 90;
      job.progress.overallProgress = 90;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Finalizing batch translation...' });
      this.saveJob(job);

      await this.sleep(500);

      // Create batch translation result
      const batchResult = {
        id: uuidv4(),
        translations: translations,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        sourceLanguageName: this.languages[sourceLanguage].name,
        targetLanguageName: this.languages[targetLanguage].name,
        itemCount: contents.length,
        translatedAt: new Date().toISOString(),
        options: options
      };

      // Save batch translation
      this.saveTranslation(batchResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.progress.completedItems = contents.length;
      job.result = batchResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Batch translation completed successfully' });
      this.saveJob(job);

      return batchResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Batch translation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Detect language of text
   * @param {string} text - The text to analyze
   * @returns {Object} Detected language
   */
  async detectLanguage(text) {
    // Mock language detection - in a real implementation, this would use a language detection API
    // For now, we'll just return German as default since that's the primary language
    return {
      detectedLanguage: 'de',
      confidence: 0.95,
      detectedLanguageName: this.languages['de'].name
    };
  }

  /**
   * Mock text translation
   * @param {string} text - The text to translate
   * @param {string} sourceLanguage - The source language code
   * @param {string} targetLanguage - The target language code
   * @returns {string} Translated text
   */
  mockTranslateText(text, sourceLanguage, targetLanguage) {
    // This is a mock implementation - in a real scenario, you would use a translation API
    const translations = {
      'de-en': {
        'Willkommen': 'Welcome',
        'Aktuelle Themen': 'Current Topics',
        'Technologie': 'Technology',
        'Politik': 'Politics',
        'KI': 'AI',
        'Innovation': 'Innovation',
        'Entwicklung': 'Development',
        'Trends': 'Trends',
        'News': 'News',
        'Video': 'Video'
      },
      'en-de': {
        'Welcome': 'Willkommen',
        'Current Topics': 'Aktuelle Themen',
        'Technology': 'Technologie',
        'Politics': 'Politik',
        'AI': 'KI',
        'Innovation': 'Innovation',
        'Development': 'Entwicklung',
        'Trends': 'Trends',
        'News': 'News',
        'Video': 'Video'
      }
    };

    const langPair = `${sourceLanguage}-${targetLanguage}`;
    if (translations[langPair]) {
      // Simple word replacement for demo purposes
      let translated = text;
      Object.keys(translations[langPair]).forEach(key => {
        translated = translated.replace(new RegExp(key, 'gi'), translations[langPair][key]);
      });
      return translated;
    }

    // If no specific translation found, just return the original text
    return text;
  }

  /**
   * Mock object translation
   * @param {Object} obj - The object to translate
   * @param {string} sourceLanguage - The source language code
   * @param {string} targetLanguage - The target language code
   * @returns {Object} Translated object
   */
  mockTranslateObject(obj, sourceLanguage, targetLanguage) {
    const translatedObj = {};

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        translatedObj[key] = this.mockTranslateText(obj[key], sourceLanguage, targetLanguage);
      } else if (Array.isArray(obj[key])) {
        translatedObj[key] = obj[key].map(item => {
          if (typeof item === 'string') {
            return this.mockTranslateText(item, sourceLanguage, targetLanguage);
          } else if (typeof item === 'object') {
            return this.mockTranslateObject(item, sourceLanguage, targetLanguage);
          } else {
            return item;
          }
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        translatedObj[key] = this.mockTranslateObject(obj[key], sourceLanguage, targetLanguage);
      } else {
        translatedObj[key] = obj[key];
      }
    });

    return translatedObj;
  }

  /**
   * Save translation to file system
   * @param {Object} translation - The translation data
   */
  saveTranslation(translation) {
    try {
      const filePath = path.join(this.translationsDir, `${translation.id}_translation.json`);
      fs.writeFileSync(filePath, JSON.stringify(translation, null, 2));
    } catch (error) {
      console.error('Error saving translation:', error);
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
   * List translations
   * @returns {Array} List of translations
   */
  async listTranslations() {
    try {
      const files = fs.readdirSync(this.translationsDir);
      const translations = files.filter(file => file.endsWith('_translation.json'))
        .map(file => {
          const filePath = path.join(this.translationsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        });
      return translations;
    } catch (error) {
      console.error('Error listing translations:', error);
      return [];
    }
  }

  /**
   * Get translation by ID
   * @param {string} translationId - The translation ID
   * @returns {Object} Translation data
   */
  async getTranslation(translationId) {
    try {
      const filePath = path.join(this.translationsDir, `${translationId}_translation.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting translation:', error);
      return null;
    }
  }

  /**
   * Delete translation by ID
   * @param {string} translationId - The translation ID
   * @returns {boolean} Success status
   */
  async deleteTranslation(translationId) {
    try {
      const filePath = path.join(this.translationsDir, `${translationId}_translation.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting translation:', error);
      return false;
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

module.exports = TranslationAgent;