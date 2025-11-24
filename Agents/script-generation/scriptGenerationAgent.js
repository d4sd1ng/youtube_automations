const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Script Generation Agent
 * Generates scripts for YouTube videos based on topics and requirements
 * Supports various content types and formats
 */
class ScriptGenerationAgent {
  constructor(options = {}) {
    this.agentName = 'ScriptGenerationAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Script storage paths
    this.scriptsDir = path.join(__dirname, '../../../data/scripts');
    this.templatesDir = path.join(__dirname, '../../../data/script-templates');
    this.jobsDir = path.join(__dirname, '../../../data/script-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Script types
    this.scriptTypes = {
      'long-form': { name: 'Langform-Video', duration: '8-15 Minuten', structure: ['Einleitung', 'Hauptteil', 'Fazit'] },
      'shorts': { name: 'Shorts', duration: '30-60 Sekunden', structure: ['Hook', 'Inhalt', 'Call-to-Action'] },
      'tutorial': { name: 'Tutorial', duration: '5-10 Minuten', structure: ['Problem', 'Lösung', 'Schritt-für-Schritt', 'Zusammenfassung'] },
      'review': { name: 'Review', duration: '5-8 Minuten', structure: ['Einleitung', 'Vorstellung', 'Test', 'Fazit'] },
      'news': { name: 'News', duration: '3-5 Minuten', structure: ['Headline', 'Hintergrund', 'Details', 'Ausblick'] }
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.scriptsDir, this.templatesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute script generation task
   * @param {Object} taskData - The script generation task data
   * @returns {Object} Result of the script generation
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'generate-script':
          result = await this.generateScript(taskData.topic, taskData.options);
          break;
        case 'generate-script-from-template':
          result = await this.generateScriptFromTemplate(taskData.templateId, taskData.data);
          break;
        case 'list-scripts':
          result = await this.listScripts();
          break;
        case 'get-script':
          result = await this.getScript(taskData.scriptId);
          break;
        case 'delete-script':
          result = await this.deleteScript(taskData.scriptId);
          break;
        case 'list-templates':
          result = await this.listTemplates();
          break;
        case 'get-template':
          result = await this.getTemplate(taskData.templateId);
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
      console.error('ScriptGenerationAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate script based on topic and options
   * @param {string} topic - The topic for the script
   * @param {Object} options - Generation options
   * @returns {Object} Generated script
   */
  async generateScript(topic, options = {}) {
    const jobId = uuidv4();
    const scriptId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'script-generation',
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
        estimatedDuration: 30000 // 30 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting script generation for topic: ${topic}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Simulate script generation process
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Analyzing topic and requirements...' });
      this.saveJob(job);

      await this.sleep(500);

      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating content structure...' });
      this.saveJob(job);

      await this.sleep(1000);

      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating detailed script content...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock generated script
      const scriptType = options.scriptType || 'long-form';
      const scriptTypeInfo = this.scriptTypes[scriptType] || this.scriptTypes['long-form'];

      const generatedScript = {
        id: scriptId,
        topic: topic,
        title: options.title || `Alles über ${topic}`,
        summary: `Ein umfassender Leitfaden zu ${topic}`,
        scriptType: scriptType,
        typeName: scriptTypeInfo.name,
        estimatedDuration: options.duration || 600, // 10 minutes default
        chapters: [
          { id: 'intro', title: 'Einleitung', content: `Willkommen zu diesem Video über ${topic}. Heute werden wir uns eingehend mit diesem Thema beschäftigen.` },
          { id: 'main', title: 'Hauptteil', content: `Im Hauptteil werden wir die wichtigsten Aspekte von ${topic} behandeln.` },
          { id: 'conclusion', title: 'Fazit', content: `Zusammenfassend lässt sich sagen, dass ${topic} ein wichtiges Thema ist.` }
        ],
        keyPoints: [
          `Wichtigste Erkenntnisse über ${topic}`,
          'Praktische Anwendungen',
          'Zukünftige Entwicklungen'
        ],
        keywords: [topic, `${topic} Erklärung`, `${topic} Tutorial`],
        callToAction: 'Wenn Ihnen dieses Video gefallen hat, abonnieren Sie unseren Kanal und aktivieren Sie die Glocke.',
        createdAt: new Date().toISOString(),
        options: options
      };

      // Save generated script
      this.saveScript(generatedScript);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = generatedScript;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Script generation completed successfully' });
      this.saveJob(job);

      return { script: generatedScript, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Script generation failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Generate script from template
   * @param {string} templateId - Template ID
   * @param {Object} data - Data to fill template
   * @returns {Object} Generated script
   */
  async generateScriptFromTemplate(templateId, data = {}) {
    const jobId = uuidv4();
    const scriptId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'template-script-generation',
      status: 'processing',
      templateId: templateId,
      data: data,
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
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting script generation from template: ${templateId}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Load template
      job.progress.stageProgress = 30;
      job.progress.overallProgress = 30;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Loading template...' });
      this.saveJob(job);

      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      await this.sleep(500);

      // Fill template with data
      job.progress.stageProgress = 60;
      job.progress.overallProgress = 60;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Filling template with data...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Mock generated script from template
      const generatedScript = {
        id: scriptId,
        templateId: templateId,
        title: template.titleTemplate.replace('{{topic}}', data.topic || 'Thema'),
        summary: template.summaryTemplate.replace('{{topic}}', data.topic || 'Thema'),
        scriptType: template.scriptType,
        typeName: this.scriptTypes[template.scriptType]?.name || template.scriptType,
        estimatedDuration: template.estimatedDuration,
        chapters: template.chapterTemplates.map((chapter, index) => ({
          id: `chapter-${index}`,
          title: chapter.titleTemplate.replace('{{topic}}', data.topic || 'Thema'),
          content: chapter.contentTemplate.replace('{{topic}}', data.topic || 'Thema')
        })),
        keyPoints: template.keyPointTemplates.map(point => point.replace('{{topic}}', data.topic || 'Thema')),
        keywords: template.keywordTemplates.map(keyword => keyword.replace('{{topic}}', data.topic || 'Thema')),
        callToAction: template.callToActionTemplate,
        createdAt: new Date().toISOString(),
        templateData: data
      };

      // Save generated script
      this.saveScript(generatedScript);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = generatedScript;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Template-based script generation completed successfully' });
      this.saveJob(job);

      return { script: generatedScript, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Template-based script generation failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * List all scripts
   * @returns {Array} List of scripts
   */
  async listScripts() {
    try {
      const scripts = [];
      if (fs.existsSync(this.scriptsDir)) {
        const files = fs.readdirSync(this.scriptsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const scriptData = JSON.parse(fs.readFileSync(path.join(this.scriptsDir, file), 'utf8'));
            scripts.push(scriptData);
          }
        }
      }
      return scripts;
    } catch (error) {
      console.error('Error listing scripts:', error);
      return [];
    }
  }

  /**
   * Get script by ID
   * @param {string} scriptId - Script ID
   * @returns {Object} Script data
   */
  async getScript(scriptId) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${scriptId}.json`);
      if (fs.existsSync(scriptPath)) {
        return JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting script ${scriptId}:`, error);
      return null;
    }
  }

  /**
   * Delete script by ID
   * @param {string} scriptId - Script ID
   * @returns {boolean} Success status
   */
  async deleteScript(scriptId) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${scriptId}.json`);
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting script ${scriptId}:`, error);
      return false;
    }
  }

  /**
   * List all templates
   * @returns {Array} List of templates
   */
  async listTemplates() {
    try {
      const templates = [];
      if (fs.existsSync(this.templatesDir)) {
        const files = fs.readdirSync(this.templatesDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const templateData = JSON.parse(fs.readFileSync(path.join(this.templatesDir, file), 'utf8'));
            templates.push(templateData);
          }
        }
      }
      return templates;
    } catch (error) {
      console.error('Error listing templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Object} Template data
   */
  async getTemplate(templateId) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateId}.json`);
      if (fs.existsSync(templatePath)) {
        return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * Get job status
   * @param {string} jobId - Job ID
   * @returns {Object} Job status
   */
  async getJobStatus(jobId) {
    try {
      const jobPath = path.join(this.jobsDir, `${jobId}.json`);
      if (fs.existsSync(jobPath)) {
        return JSON.parse(fs.readFileSync(jobPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting job status ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Save script data
   * @param {Object} script - Script data to save
   */
  saveScript(script) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${script.id}.json`);
      fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));
    } catch (error) {
      console.error('Error saving script:', error);
    }
  }

  /**
   * Save job data
   * @param {Object} job - Job data to save
   */
  saveJob(job) {
    try {
      const jobPath = path.join(this.jobsDir, `${job.id}.json`);
      fs.writeFileSync(jobPath, JSON.stringify(job, null, 2));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  /**
   * Simple sleep function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after ms milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get agent status
   * @returns {Object} Agent status information
   */
  getStatus() {
    return {
      agentName: this.agentName,
      version: this.version,
      isAvailable: this.isAvailable,
      lastExecution: this.lastExecution,
      supportedTasks: [
        'generate-script',
        'generate-script-from-template',
        'list-scripts',
        'get-script',
        'delete-script',
        'list-templates',
        'get-template',
        'get-job-status'
      ]
    };
  }

  /**
   * Set agent availability
   * @param {boolean} available - Availability status
   */
  setAvailability(available) {
    this.isAvailable = available;
  }
}

module.exports = ScriptGenerationAgent;