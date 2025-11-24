const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Avatar Generation Agent
 * Manages AI avatar creation, training, and template usage for YouTube automations
 * Supports both pre-built avatar templates and custom avatar generation from scratch
 */
class AvatarGenerationAgent {
  constructor(options = {}) {
    this.agentName = 'AvatarGenerationAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Avatar storage paths
    this.avatarsDir = path.join(__dirname, '../../../data/avatars');
    this.templatesDir = path.join(__dirname, '../../../data/avatar-templates');
    this.voiceTemplatesDir = path.join(__dirname, '../../../data/voice-templates');
    this.textTemplatesDir = path.join(__dirname, '../../../data/text-templates');
    this.jobsDir = path.join(__dirname, '../../../data/avatar-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Avatar generation configuration
    this.supportedTypes = {
      'head_only': { name: 'Nur Kopf', time: '15-20 Min', timeWithTemplate: '4-6 Min', gestures: false },
      'upper_body': { name: 'Oberkörper', time: '25-30 Min', timeWithTemplate: '8-12 Min', gestures: true },
      'full_person': { name: 'Ganzkörper', time: '45-60 Min', timeWithTemplate: '15-25 Min', gestures: true }
    };

    this.voiceTypes = {
      'custom': { name: 'Eigene Stimme', provider: 'Audio-Samples' },
      'ai_voice_natural': { name: 'KI-Stimme (Natürlich)', provider: 'ElevenLabs' },
      'ai_voice_professional': { name: 'KI-Stimme (Professionell)', provider: 'ElevenLabs' },
      'ai_voice_local': { name: 'KI-Stimme (Lokal)', provider: 'Coqui TTS' }
    };

    // Initialize with default templates if they don't exist
    this.initializeDefaultTemplates();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.avatarsDir, this.templatesDir, this.voiceTemplatesDir, this.textTemplatesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialize default templates
   */
  initializeDefaultTemplates() {
    // Create default avatar templates if they don't exist
    const defaultAvatarTemplates = [
      {
        id: 'at1',
        name: 'Professioneller Sprecher',
        type: 'upper_body',
        description: 'Ideal für Business- und Bildungsinhalte',
        tags: ['Business', 'Bildung', 'Professional'],
        previewImage: ''
      },
      {
        id: 'at2',
        name: 'Freundlicher Moderator',
        type: 'head_only',
        description: 'Perfekt für Nachrichten und Erklärvideos',
        tags: ['Nachrichten', 'Erklärung', 'Freundlich'],
        previewImage: ''
      },
      {
        id: 'at3',
        name: 'Dynamischer Präsentator',
        type: 'full_person',
        description: 'Geeignet für Unterhaltung und Werbung',
        tags: ['Unterhaltung', 'Werbung', 'Dynamisch'],
        previewImage: ''
      }
    ];

    const avatarTemplatesPath = path.join(this.templatesDir, 'avatar-templates.json');
    if (!fs.existsSync(avatarTemplatesPath)) {
      fs.writeFileSync(avatarTemplatesPath, JSON.stringify(defaultAvatarTemplates, null, 2));
    }

    // Create default text templates if they don't exist
    const defaultTextTemplates = [
      'Politik & Gesellschaft',
      'Technologie & Innovation',
      'Wirtschaft & Finanzen',
      'Bildung & Wissenschaft',
      'Umwelt & Nachhaltigkeit',
      'Gesundheit & Medizin',
      'Kultur & Unterhaltung',
      'Sport & Freizeit'
    ];

    const textTemplatesPath = path.join(this.textTemplatesDir, 'text-templates.json');
    if (!fs.existsSync(textTemplatesPath)) {
      fs.writeFileSync(textTemplatesPath, JSON.stringify(defaultTextTemplates, null, 2));
    }
  }

  /**
   * Execute avatar generation task
   * @param {Object} taskData - The avatar generation task data
   * @returns {Object} Result of the avatar generation
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'create-avatar':
          result = await this.createAvatar(taskData.config);
          break;
        case 'list-avatars':
          result = await this.listAvatars();
          break;
        case 'get-avatar':
          result = await this.getAvatar(taskData.avatarId);
          break;
        case 'delete-avatar':
          result = await this.deleteAvatar(taskData.avatarId);
          break;
        case 'list-templates':
          result = await this.listTemplates();
          break;
        case 'get-template':
          result = await this.getTemplate(taskData.templateId);
          break;
        case 'list-voice-templates':
          result = await this.listVoiceTemplates();
          break;
        case 'get-voice-template':
          result = await this.getVoiceTemplate(taskData.templateId);
          break;
        case 'list-text-templates':
          result = await this.listTextTemplates();
          break;
        case 'train-avatar':
          result = await this.trainAvatar(taskData.avatarId, taskData.trainingData);
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
      console.error('AvatarGenerationAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a new avatar (from template or scratch)
   * @param {Object} config - Avatar creation configuration
   * @returns {Object} Created avatar information
   */
  async createAvatar(config) {
    const jobId = uuidv4();
    const avatarId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      avatarId: avatarId,
      name: config.name || `Avatar-${avatarId.substring(0, 8)}`,
      status: 'queued',
      type: config.avatarType || 'head_only',
      voiceType: config.voiceType || 'custom',
      enableGestures: config.enableGestures || false,
      enableBackgroundRemoval: config.enableBackgroundRemoval || true,
      useTemplate: config.useTemplate || true,
      progress: {
        currentStage: null,
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        created: new Date().toISOString(),
        estimatedDuration: this.estimateDuration(config.avatarType, config.useTemplate),
        templateUsed: config.useTemplate || false,
        userPreferences: config.userPreferences || {}
      },
      logs: []
    };

    // Save job
    this.saveJob(job);

    // Start processing in background
    this.processAvatarCreation(job, config);

    return {
      jobId: jobId,
      avatarId: avatarId,
      status: 'queued',
      message: 'Avatar creation job started'
    };
  }

  /**
   * Process avatar creation in background
   * @param {Object} job - The job to process
   * @param {Object} config - Avatar creation configuration
   */
  async processAvatarCreation(job, config) {
    try {
      // Update job status
      job.status = 'processing';
      job.progress.currentStage = 'initializing';
      job.progress.stageProgress = 0;
      job.progress.overallProgress = 0;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Avatar creation started' });
      this.saveJob(job);

      // Simulate processing steps
      const stages = [
        { name: 'video-processing', description: 'Video wird verarbeitet', duration: 20 },
        { name: 'template-selection', description: 'Template wird ausgewählt', duration: 10 },
        { name: 'voice-training', description: 'Stimme wird trainiert', duration: 30 },
        { name: 'gesture-integration', description: 'Gesten werden integriert', duration: 15 },
        { name: 'final-rendering', description: 'Avatar wird gerendert', duration: 25 }
      ];

      let totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        job.progress.currentStage = stage.name;
        job.progress.stageProgress = 0;
        job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: stage.description });
        this.saveJob(job);

        // Simulate stage processing
        for (let progress = 0; progress <= 100; progress += 10) {
          await this.sleep(stage.duration * 100); // Scale down for demo
          job.progress.stageProgress = progress;
          job.progress.overallProgress = Math.round(((i * 100) + progress) / stages.length);
          this.saveJob(job);
        }

        job.progress.completedStages.push(stage.name);
      }

      // Complete job
      job.status = 'completed';
      job.progress.currentStage = null;
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.metadata.actualDuration = totalDuration;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Avatar creation completed successfully' });

      // Create avatar record
      const avatar = {
        id: job.avatarId,
        name: job.name,
        type: job.type,
        voiceType: job.voiceType,
        createdAt: job.metadata.created,
        trainedAt: new Date().toISOString(),
        enabled: true,
        templateUsed: job.metadata.templateUsed,
        gestureEnabled: job.enableGestures,
        backgroundRemoval: job.enableBackgroundRemoval
      };

      this.saveAvatar(avatar);
      this.saveJob(job);

      return avatar;
    } catch (error) {
      job.status = 'failed';
      job.progress.currentStage = null;
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Avatar creation failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * List all avatars
   * @returns {Array} List of avatars
   */
  async listAvatars() {
    try {
      const avatars = [];
      if (fs.existsSync(this.avatarsDir)) {
        const files = fs.readdirSync(this.avatarsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const avatarData = JSON.parse(fs.readFileSync(path.join(this.avatarsDir, file), 'utf8'));
            avatars.push(avatarData);
          }
        }
      }
      return avatars;
    } catch (error) {
      console.error('Error listing avatars:', error);
      return [];
    }
  }

  /**
   * Get avatar by ID
   * @param {string} avatarId - The avatar ID
   * @returns {Object} Avatar data
   */
  async getAvatar(avatarId) {
    try {
      const avatarPath = path.join(this.avatarsDir, `${avatarId}.json`);
      if (fs.existsSync(avatarPath)) {
        return JSON.parse(fs.readFileSync(avatarPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting avatar ${avatarId}:`, error);
      return null;
    }
  }

  /**
   * Delete avatar by ID
   * @param {string} avatarId - The avatar ID
   * @returns {boolean} Success status
   */
  async deleteAvatar(avatarId) {
    try {
      const avatarPath = path.join(this.avatarsDir, `${avatarId}.json`);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting avatar ${avatarId}:`, error);
      return false;
    }
  }

  /**
   * List all templates
   * @returns {Array} List of templates
   */
  async listTemplates() {
    try {
      const templatesPath = path.join(this.templatesDir, 'avatar-templates.json');
      if (fs.existsSync(templatesPath)) {
        return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
      }
      return [];
    } catch (error) {
      console.error('Error listing templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   * @param {string} templateId - The template ID
   * @returns {Object} Template data
   */
  async getTemplate(templateId) {
    try {
      const templates = await this.listTemplates();
      const template = templates.find(t => t.id === templateId);
      return template || null;
    } catch (error) {
      console.error(`Error getting template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * List all voice templates
   * @returns {Array} List of voice templates
   */
  async listVoiceTemplates() {
    try {
      // For now, we'll return a static list, but this could be loaded from a file
      return [
        { id: 'vt1', name: 'Professionell (Männlich)', type: 'ai_voice_professional', description: 'Klar und autoritär' },
        { id: 'vt2', name: 'Freundlich (Weiblich)', type: 'ai_voice_natural', description: 'Warm und einladend' },
        { id: 'vt3', name: 'Sachlich (Neutral)', type: 'ai_voice_professional', description: 'Objektiv und informativ' }
      ];
    } catch (error) {
      console.error('Error listing voice templates:', error);
      return [];
    }
  }

  /**
   * Get voice template by ID
   * @param {string} templateId - The voice template ID
   * @returns {Object} Voice template data
   */
  async getVoiceTemplate(templateId) {
    try {
      const templates = await this.listVoiceTemplates();
      const template = templates.find(t => t.id === templateId);
      return template || null;
    } catch (error) {
      console.error(`Error getting voice template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * List all text templates
   * @returns {Array} List of text templates
   */
  async listTextTemplates() {
    try {
      const textTemplatesPath = path.join(this.textTemplatesDir, 'text-templates.json');
      if (fs.existsSync(textTemplatesPath)) {
        return JSON.parse(fs.readFileSync(textTemplatesPath, 'utf8'));
      }
      return [];
    } catch (error) {
      console.error('Error listing text templates:', error);
      return [];
    }
  }

  /**
   * Train avatar with additional data
   * @param {string} avatarId - The avatar ID
   * @param {Object} trainingData - Training data
   * @returns {Object} Training result
   */
  async trainAvatar(avatarId, trainingData) {
    const avatar = await this.getAvatar(avatarId);
    if (!avatar) {
      throw new Error(`Avatar ${avatarId} not found`);
    }

    // Simulate training process
    const jobId = uuidv4();
    const job = {
      id: jobId,
      avatarId: avatarId,
      type: 'training',
      status: 'processing',
      progress: {
        currentStage: 'training',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 300 // 5 minutes
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Training started' }]
    };

    this.saveJob(job);

    // Simulate training
    for (let progress = 0; progress <= 100; progress += 10) {
      await this.sleep(300); // 30 seconds total
      job.progress.stageProgress = progress;
      job.progress.overallProgress = progress;
      this.saveJob(job);
    }

    job.status = 'completed';
    job.progress.stageProgress = 100;
    job.progress.overallProgress = 100;
    job.metadata.completedAt = new Date().toISOString();
    job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Training completed successfully' });

    this.saveJob(job);

    // Update avatar
    avatar.trainedAt = new Date().toISOString();
    this.saveAvatar(avatar);

    return {
      jobId: jobId,
      avatarId: avatarId,
      status: 'completed',
      message: 'Avatar training completed successfully'
    };
  }

  /**
   * Get job status
   * @param {string} jobId - The job ID
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
   * Save avatar data
   * @param {Object} avatar - Avatar data to save
   */
  saveAvatar(avatar) {
    try {
      const avatarPath = path.join(this.avatarsDir, `${avatar.id}.json`);
      fs.writeFileSync(avatarPath, JSON.stringify(avatar, null, 2));
    } catch (error) {
      console.error('Error saving avatar:', error);
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
   * Estimate duration for avatar creation
   * @param {string} avatarType - Avatar type
   * @param {boolean} useTemplate - Whether using template
   * @returns {number} Estimated duration in milliseconds
   */
  estimateDuration(avatarType, useTemplate) {
    const config = this.supportedTypes[avatarType] || this.supportedTypes['head_only'];
    const timeStr = useTemplate ? config.timeWithTemplate : config.time;

    // Simple parsing of time string (e.g., "15-20 Min" -> average in minutes)
    const match = timeStr.match(/(\d+)-?(\d+)?\s*(Min|Minuten|s|sek)/i);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      const unit = match[3].toLowerCase();
      const avg = (min + max) / 2;

      if (unit.startsWith('m')) {
        return avg * 60 * 1000; // minutes to milliseconds
      } else {
        return avg * 1000; // seconds to milliseconds
      }
    }

    return 300000; // default 5 minutes
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
        'create-avatar',
        'list-avatars',
        'get-avatar',
        'delete-avatar',
        'list-templates',
        'get-template',
        'list-voice-templates',
        'get-voice-template',
        'list-text-templates',
        'train-avatar',
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

module.exports = AvatarGenerationAgent;