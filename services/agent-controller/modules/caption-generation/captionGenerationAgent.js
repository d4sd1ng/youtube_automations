const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Caption Generation Agent
 * Handles caption creation and optimization for video content
 * Supports various platforms and content types
 */
class CaptionGenerationAgent {
  constructor(options = {}) {
    this.agentName = 'CaptionGenerationAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Caption generation storage paths
    this.captionsDir = path.join(__dirname, '../../../data/captions');
    this.templatesDir = path.join(__dirname, '../../../data/caption-templates');
    this.jobsDir = path.join(__dirname, '../../../data/caption-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Supported platforms
    this.platforms = {
      'youtube': 'YouTube',
      'instagram': 'Instagram',
      'twitter': 'Twitter/X',
      'tiktok': 'TikTok',
      'linkedin': 'LinkedIn'
    };

    // Caption types
    this.captionTypes = {
      'descriptive': 'Beschreibende Untertitel',
      'dialogue': 'Dialog-Untertitel',
      'singing': 'Gesangs-Untertitel',
      'sound-effects': 'Soundeffekt-Untertitel',
      'translation': 'Übersetzungs-Untertitel'
    };

    // Caption styles
    this.captionStyles = {
      'standard': 'Standard',
      'karaoke': 'Karaoke',
      'pop-on': 'Pop-On',
      'paint-on': 'Paint-On',
      'roll-up': 'Roll-Up'
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.captionsDir, this.templatesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute caption generation task
   * @param {Object} taskData - The caption generation task data
   * @returns {Object} Result of the caption generation
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'generate-captions':
          result = await this.generateCaptions(taskData.content, taskData.options);
          break;
        case 'optimize-captions':
          result = await this.optimizeCaptions(taskData.captionId, taskData.options);
          break;
        case 'translate-captions':
          result = await this.translateCaptions(taskData.captionId, taskData.targetLanguage, taskData.options);
          break;
        case 'format-captions':
          result = await this.formatCaptions(taskData.captionId, taskData.format, taskData.options);
          break;
        case 'get-caption':
          result = await this.getCaption(taskData.captionId);
          break;
        case 'list-captions':
          result = await this.listCaptions(taskData.options);
          break;
        case 'delete-caption':
          result = await this.deleteCaption(taskData.captionId);
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
      console.error('CaptionGenerationAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate captions for content
   * @param {Object} content - The content to generate captions for
   * @param {Object} options - Generation options
   * @returns {Object} Generated captions
   */
  async generateCaptions(content, options = {}) {
    const jobId = uuidv4();
    const captionId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'caption-generation',
      status: 'processing',
      content: content,
      options: options,
      progress: {
        currentStage: 'generating',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 25000 // 25 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Generating captions for content: ${content.title || content.id}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Analyze content for caption generation
      const contentAnalysis = this.analyzeContentForCaptions(content);

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating caption text...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Generate caption text
      const captionText = await this.generateCaptionText(contentAnalysis, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Formatting captions...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Format captions based on platform
      const formattedCaptions = this.formatCaptionsForPlatform(captionText, options.platform || 'youtube', options);

      // Create caption result
      const captionResult = {
        id: captionId,
        content: content,
        analysis: contentAnalysis,
        rawText: captionText,
        formattedCaptions: formattedCaptions,
        platform: options.platform || 'youtube',
        language: options.language || 'de',
        style: options.style || 'standard',
        wordCount: captionText.split(' ').length,
        characterCount: captionText.length,
        generatedAt: new Date().toISOString(),
        options: options
      };

      // Save caption
      this.saveCaption(captionResult);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = captionResult;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Caption generation completed successfully' });
      this.saveJob(job);

      return captionResult;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Caption generation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Optimize existing captions
   * @param {string} captionId - The caption ID
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized captions
   */
  async optimizeCaptions(captionId, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'caption-optimization',
      status: 'processing',
      captionId: captionId,
      options: options,
      progress: {
        currentStage: 'optimizing',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 15000 // 15 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Optimizing captions: ${captionId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Loading captions...' });
      this.saveJob(job);

      await this.sleep(500);

      // Get existing captions
      const caption = await this.getCaption(captionId);
      if (!caption) {
        throw new Error(`Caption with ID ${captionId} not found`);
      }

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing for optimization...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Analyze for optimization
      const optimizationAnalysis = this.analyzeForOptimization(caption, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Applying optimizations...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Apply optimizations
      const optimizedCaptions = this.applyOptimizations(caption, optimizationAnalysis, options);

      // Update caption
      const updatedCaption = {
        ...caption,
        ...optimizedCaptions,
        optimizedAt: new Date().toISOString(),
        options: {
          ...caption.options,
          ...options
        }
      };

      // Save updated caption
      this.saveCaption(updatedCaption);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = updatedCaption;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Caption optimization completed successfully' });
      this.saveJob(job);

      return updatedCaption;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Caption optimization failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Translate captions
   * @param {string} captionId - The caption ID
   * @param {string} targetLanguage - The target language
   * @param {Object} options - Translation options
   * @returns {Object} Translated captions
   */
  async translateCaptions(captionId, targetLanguage, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'caption-translation',
      status: 'processing',
      captionId: captionId,
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
        estimatedDuration: 20000 // 20 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Translating captions ${captionId} to ${targetLanguage}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Loading captions...' });
      this.saveJob(job);

      await this.sleep(500);

      // Get existing captions
      const caption = await this.getCaption(captionId);
      if (!caption) {
        throw new Error(`Caption with ID ${captionId} not found`);
      }

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Translating content...' });
      this.saveJob(job);

      await this.sleep(2000);

      // Translate caption content
      const translatedContent = await this.translateCaptionContent(caption, targetLanguage, options);

      // Update job progress
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Formatting translated captions...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Format translated captions
      const formattedCaptions = this.formatCaptionsForPlatform(translatedContent, caption.platform, options);

      // Create translated caption result
      const translatedCaption = {
        id: `translated-${captionId}`,
        originalCaptionId: captionId,
        content: caption.content,
        analysis: caption.analysis,
        rawText: translatedContent,
        formattedCaptions: formattedCaptions,
        platform: caption.platform,
        language: targetLanguage,
        style: caption.style,
        wordCount: translatedContent.split(' ').length,
        characterCount: translatedContent.length,
        translatedAt: new Date().toISOString(),
        options: {
          ...caption.options,
          ...options
        }
      };

      // Save translated caption
      this.saveCaption(translatedCaption);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = translatedCaption;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Caption translation completed successfully' });
      this.saveJob(job);

      return translatedCaption;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Caption translation failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Format captions
   * @param {string} captionId - The caption ID
   * @param {string} format - The output format
   * @param {Object} options - Formatting options
   * @returns {Object} Formatted captions
   */
  async formatCaptions(captionId, format, options = {}) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'caption-formatting',
      status: 'processing',
      captionId: captionId,
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
        estimatedDuration: 10000 // 10 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Formatting captions ${captionId} as ${format}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Loading captions...' });
      this.saveJob(job);

      await this.sleep(500);

      // Get existing captions
      const caption = await this.getCaption(captionId);
      if (!caption) {
        throw new Error(`Caption with ID ${captionId} not found`);
      }

      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Formatting captions...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Format captions
      const formattedCaptions = this.formatCaptionsForOutput(caption, format, options);

      // Create formatted caption result
      const formattedCaption = {
        id: `formatted-${captionId}`,
        originalCaptionId: captionId,
        content: caption.content,
        formattedCaptions: formattedCaptions,
        format: format,
        fileName: `${captionId}.${format}`,
        fileSize: JSON.stringify(formattedCaptions).length,
        formattedAt: new Date().toISOString(),
        options: options
      };

      // Save formatted caption
      this.saveCaption(formattedCaption);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = formattedCaption;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Caption formatting completed successfully' });
      this.saveJob(job);

      return formattedCaption;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Caption formatting failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Analyze content for caption generation
   * @param {Object} content - The content to analyze
   * @returns {Object} Content analysis
   */
  analyzeContentForCaptions(content) {
    // Mock content analysis
    return {
      title: content.title || 'Untitled Content',
      description: content.description || '',
      duration: content.duration || 300, // Default 5 minutes
      keyPoints: content.keyPoints || [],
      tone: content.tone || 'neutral',
      audience: content.audience || 'general',
      complexity: content.complexity || 'medium',
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Generate caption text
   * @param {Object} contentAnalysis - The content analysis
   * @param {Object} options - Generation options
   * @returns {string} Generated caption text
   */
  async generateCaptionText(contentAnalysis, options = {}) {
    // Mock caption text generation
    const paragraphs = [];
    const paragraphCount = Math.max(3, Math.floor(contentAnalysis.duration / 60)); // At least 3 paragraphs, more for longer content

    for (let i = 0; i < paragraphCount; i++) {
      paragraphs.push(`Dies ist Absatz ${i + 1} der Untertitel für "${contentAnalysis.title}". Hier wird der Inhalt des Videos klar und präzise wiedergegeben. Die Untertitel sind optimiert für bessere Zugänglichkeit und Verständnis.`);
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Format captions for platform
   * @param {string} captionText - The caption text
   * @param {string} platform - The platform
   * @param {Object} options - Formatting options
   * @returns {Array} Formatted captions
   */
  formatCaptionsForPlatform(captionText, platform, options = {}) {
    // Mock platform-specific formatting
    const lines = captionText.split('\n');
    const captions = [];

    let startTime = 0;
    const durationPerLine = 5; // 5 seconds per line default

    lines.forEach((line, index) => {
      if (line.trim()) {
        const endTime = startTime + durationPerLine;
        captions.push({
          id: `caption-${index}`,
          text: line.trim(),
          startTime: startTime,
          endTime: endTime,
          position: options.position || 'bottom',
          style: options.style || 'standard'
        });
        startTime = endTime;
      }
    });

    return captions;
  }

  /**
   * Analyze for optimization
   * @param {Object} caption - The caption
   * @param {Object} options - Optimization options
   * @returns {Object} Optimization analysis
   */
  analyzeForOptimization(caption, options = {}) {
    // Mock optimization analysis
    return {
      readabilityScore: Math.floor(Math.random() * 40) + 60, // 60-100 scale
      keywordDensity: (Math.random() * 5 + 1).toFixed(2),
      sentenceLength: Math.floor(Math.random() * 15) + 10, // Average sentence length
      complexity: caption.content.complexity || 'medium',
      suggestions: this.generateOptimizationSuggestions(caption)
    };
  }

  /**
   * Generate optimization suggestions
   * @param {Object} caption - The caption
   * @returns {Array} Optimization suggestions
   */
  generateOptimizationSuggestions(caption) {
    const suggestions = [];

    // Mock suggestions based on caption analysis
    if (caption.wordCount > 500) {
      suggestions.push({
        type: 'improvement',
        message: 'Zu viele Wörter - kürzen für bessere Lesbarkeit',
        priority: 'high'
      });
    }

    if (caption.characterCount > 3000) {
      suggestions.push({
        type: 'improvement',
        message: 'Zu viele Zeichen - aufteilen in mehrere Untertitel',
        priority: 'medium'
      });
    }

    suggestions.push({
      type: 'info',
      message: 'Untertitel wurden analysiert',
      priority: 'low'
    });

    return suggestions;
  }

  /**
   * Apply optimizations
   * @param {Object} caption - The caption
   * @param {Object} optimizationAnalysis - The optimization analysis
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized captions
   */
  applyOptimizations(caption, optimizationAnalysis, options = {}) {
    // Mock optimization application
    let optimizedText = caption.rawText;

    // Apply some basic optimizations
    if (optimizationAnalysis.suggestions.some(s => s.type === 'improvement' && s.priority === 'high')) {
      // Simplify text if needed
      optimizedText = this.simplifyText(optimizedText);
    }

    // Format optimized captions
    const formattedCaptions = this.formatCaptionsForPlatform(optimizedText, caption.platform, options);

    return {
      rawText: optimizedText,
      formattedCaptions: formattedCaptions,
      optimizationsApplied: optimizationAnalysis.suggestions.filter(s => s.type === 'improvement').length
    };
  }

  /**
   * Simplify text
   * @param {string} text - The text to simplify
   * @returns {string} Simplified text
   */
  simplifyText(text) {
    // Mock text simplification
    return text.replace(/komplex/g, 'einfach')
               .replace(/ausführlich/g, 'kurz')
               .replace(/detailliert/g, 'grundlegend');
  }

  /**
   * Translate caption content
   * @param {Object} caption - The caption
   * @param {string} targetLanguage - The target language
   * @param {Object} options - Translation options
   * @returns {string} Translated content
   */
  async translateCaptionContent(caption, targetLanguage, options = {}) {
    // Mock translation
    const translations = {
      'de-en': {
        'Dies ist': 'This is',
        'Absatz': 'Paragraph',
        'der Untertitel': 'of the subtitles',
        'für': 'for',
        'Hier wird': 'Here is',
        'der Inhalt': 'the content',
        'des Videos': 'of the video',
        'klar und präzise': 'clearly and precisely',
        'wiedergegeben': 'presented',
        'Die Untertitel': 'The subtitles',
        'sind optimiert': 'are optimized',
        'für bessere': 'for better',
        'Zugänglichkeit': 'accessibility',
        'und Verständnis': 'and understanding'
      }
    };

    const langPair = `de-${targetLanguage}`;
    if (translations[langPair]) {
      let translated = caption.rawText;
      Object.keys(translations[langPair]).forEach(key => {
        translated = translated.replace(new RegExp(key, 'gi'), translations[langPair][key]);
      });
      return translated;
    }

    // If no specific translation found, just return the original text
    return caption.rawText;
  }

  /**
   * Format captions for output
   * @param {Object} caption - The caption
   * @param {string} format - The output format
   * @param {Object} options - Formatting options
   * @returns {Object} Formatted captions
   */
  formatCaptionsForOutput(caption, format, options = {}) {
    // Mock output formatting
    switch (format) {
      case 'srt':
        return this.formatAsSRT(caption.formattedCaptions);
      case 'vtt':
        return this.formatAsVTT(caption.formattedCaptions);
      case 'txt':
        return this.formatAsTXT(caption.formattedCaptions);
      default:
        return caption.formattedCaptions;
    }
  }

  /**
   * Format as SRT
   * @param {Array} captions - The captions
   * @returns {string} SRT formatted captions
   */
  formatAsSRT(captions) {
    return captions.map((caption, index) => {
      const startTime = this.formatTime(caption.startTime);
      const endTime = this.formatTime(caption.endTime);
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    }).join('\n');
  }

  /**
   * Format as VTT
   * @param {Array} captions - The captions
   * @returns {string} VTT formatted captions
   */
  formatAsVTT(captions) {
    const header = 'WEBVTT FILE\n\n';
    const body = captions.map((caption, index) => {
      const startTime = this.formatTime(caption.startTime);
      const endTime = this.formatTime(caption.endTime);
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    }).join('\n');
    return header + body;
  }

  /**
   * Format as TXT
   * @param {Array} captions - The captions
   * @returns {string} TXT formatted captions
   */
  formatAsTXT(captions) {
    return captions.map(caption => caption.text).join('\n\n');
  }

  /**
   * Format time as HH:MM:SS,mmm
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 12).replace('.', ',');
  }

  /**
   * Get caption by ID
   * @param {string} captionId - The caption ID
   * @returns {Object} Caption data
   */
  async getCaption(captionId) {
    try {
      const filePath = path.join(this.captionsDir, `${captionId}_caption.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting caption:', error);
      return null;
    }
  }

  /**
   * List captions
   * @param {Object} options - Listing options
   * @returns {Array} List of captions
   */
  async listCaptions(options = {}) {
    try {
      const files = fs.readdirSync(this.captionsDir);
      const captions = files.filter(file => file.endsWith('_caption.json'))
        .map(file => {
          const filePath = path.join(this.captionsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        });

      // Apply sorting and filtering options
      if (options.sortBy === 'title') {
        captions.sort((a, b) => (a.content.title || '').localeCompare(b.content.title));
      } else if (options.sortBy === 'createdAt') {
        captions.sort((a, b) => new Date(b.generatedAt || b.translatedAt || b.formattedAt) - new Date(a.generatedAt || a.translatedAt || a.formattedAt));
      }

      // Apply limit
      if (options.limit) {
        return captions.slice(0, options.limit);
      }

      return captions;
    } catch (error) {
      console.error('Error listing captions:', error);
      return [];
    }
  }

  /**
   * Delete caption
   * @param {string} captionId - The caption ID
   * @returns {boolean} Success status
   */
  async deleteCaption(captionId) {
    try {
      const filePath = path.join(this.captionsDir, `${captionId}_caption.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting caption:', error);
      return false;
    }
  }

  /**
   * Save caption to file system
   * @param {Object} caption - The caption data
   */
  saveCaption(caption) {
    try {
      const filePath = path.join(this.captionsDir, `${caption.id}_caption.json`);
      fs.writeFileSync(filePath, JSON.stringify(caption, null, 2));
    } catch (error) {
      console.error('Error saving caption:', error);
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

module.exports = CaptionGenerationAgent;