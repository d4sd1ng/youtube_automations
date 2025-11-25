const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Quality Check Agent
 * Performs automated quality checks on all content types (scripts, videos, audio, thumbnails)
 * Ensures high-quality output before publication
 */
class QualityCheckAgent {
  constructor(options = {}) {
    this.agentName = 'QualityCheckAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Quality check storage paths
    this.qualityReportsDir = path.join(__dirname, '../../../data/quality-reports');
    this.jobsDir = path.join(__dirname, '../../../data/quality-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Quality thresholds
    this.qualityThresholds = {
      script: {
        minWordCount: 100,
        maxWordCount: 5000,
        requiredSections: ['title', 'summary', 'chapters'],
        minChapterCount: 2,
        keywordDensityMin: 0.5,
        keywordDensityMax: 3.0
      },
      video: {
        minDuration: 30, // seconds
        maxDuration: 3600, // 1 hour in seconds
        minResolutionWidth: 720,
        minResolutionHeight: 480,
        maxFileSize: 1073741824, // 1GB
        requiredMetadata: ['title', 'description', 'duration']
      },
      audio: {
        minDuration: 30, // seconds
        maxDuration: 3600, // 1 hour in seconds
        minBitrate: 128000, // 128 kbps
        maxFileSize: 104857600, // 100MB
        requiredMetadata: ['duration', 'bitrate']
      },
      thumbnail: {
        minWidth: 1280,
        minHeight: 720,
        maxFileSize: 2097152, // 2MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        requiredTextElements: 2
      }
    };

    // Quality weights for scoring
    this.qualityWeights = {
      script: 0.3,
      video: 0.3,
      audio: 0.2,
      thumbnail: 0.2
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.qualityReportsDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute quality check task
   * @param {Object} taskData - The quality check task data
   * @returns {Object} Result of the quality check
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'check-content-quality':
          result = await this.checkContentQuality(taskData.content, taskData.contentType);
          break;
        case 'check-script-quality':
          result = await this.checkScriptQuality(taskData.script);
          break;
        case 'check-video-quality':
          result = await this.checkVideoQuality(taskData.video);
          break;
        case 'check-audio-quality':
          result = await this.checkAudioQuality(taskData.audio);
          break;
        case 'check-thumbnail-quality':
          result = await this.checkThumbnailQuality(taskData.thumbnail);
          break;
        case 'generate-quality-report':
          result = await this.generateQualityReport(taskData.contentId, taskData.checks);
          break;
        case 'get-quality-report':
          result = await this.getQualityReport(taskData.reportId);
          break;
        case 'list-quality-reports':
          result = await this.listQualityReports();
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
      console.error('QualityCheckAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check overall content quality
   * @param {Object} content - The content to check
   * @param {string} contentType - Type of content (script, video, audio, thumbnail)
   * @returns {Object} Quality check result
   */
  async checkContentQuality(content, contentType) {
    const jobId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'content-quality-check',
      status: 'processing',
      content: content,
      contentType: contentType,
      progress: {
        currentStage: 'checking',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 15000 // 15 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Starting quality check for ${contentType}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      let qualityResult;

      // Perform quality check based on content type
      job.progress.stageProgress = 25;
      job.progress.overallProgress = 25;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Performing ${contentType} quality check...` });
      this.saveJob(job);

      switch (contentType) {
        case 'script':
          qualityResult = await this.checkScriptQuality(content);
          break;
        case 'video':
          qualityResult = await this.checkVideoQuality(content);
          break;
        case 'audio':
          qualityResult = await this.checkAudioQuality(content);
          break;
        case 'thumbnail':
          qualityResult = await this.checkThumbnailQuality(content);
          break;
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }

      await this.sleep(1000);

      // Generate quality report
      job.progress.stageProgress = 75;
      job.progress.overallProgress = 75;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Generating quality report...' });
      this.saveJob(job);

      const report = await this.generateQualityReport(content.id || uuidv4(), {
        [contentType]: qualityResult
      });

      await this.sleep(500);

      // Complete job
      job.status = 'completed';
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = { qualityResult, report };
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Quality check completed successfully' });
      this.saveJob(job);

      return { qualityResult, report, jobId };
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Quality check failed: ${error.message}` });
      this.saveJob(job);
      throw error;
    }
  }

  /**
   * Check script quality
   * @param {Object} script - The script to check
   * @returns {Object} Script quality result
   */
  async checkScriptQuality(script) {
    const thresholds = this.qualityThresholds.script;
    const issues = [];
    let score = 100;

    // Check required fields
    thresholds.requiredSections.forEach(section => {
      if (!script[section]) {
        issues.push(`Missing required section: ${section}`);
        score -= 10;
      }
    });

    // Check chapter count
    if (script.chapters && script.chapters.length < thresholds.minChapterCount) {
      issues.push(`Insufficient chapter count: ${script.chapters.length}, minimum required: ${thresholds.minChapterCount}`);
      score -= 15;
    }

    // Check word count in chapters
    if (script.chapters) {
      let totalWordCount = 0;
      script.chapters.forEach(chapter => {
        if (chapter.content) {
          const wordCount = chapter.content.split(' ').length;
          totalWordCount += wordCount;
        }
      });

      if (totalWordCount < thresholds.minWordCount) {
        issues.push(`Insufficient word count: ${totalWordCount}, minimum required: ${thresholds.minWordCount}`);
        score -= 10;
      } else if (totalWordCount > thresholds.maxWordCount) {
        issues.push(`Excessive word count: ${totalWordCount}, maximum allowed: ${thresholds.maxWordCount}`);
        score -= 10;
      }
    }

    // Check keywords
    if (script.keywords && script.keywords.length < 3) {
      issues.push(`Insufficient keywords: ${script.keywords.length}, minimum recommended: 3`);
      score -= 5;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      contentType: 'script',
      score: score,
      issues: issues,
      passed: score >= 70,
      details: {
        wordCount: script.chapters ? script.chapters.reduce((total, chapter) => total + (chapter.content ? chapter.content.split(' ').length : 0), 0) : 0,
        chapterCount: script.chapters ? script.chapters.length : 0,
        keywordCount: script.keywords ? script.keywords.length : 0
      }
    };
  }

  /**
   * Check video quality
   * @param {Object} video - The video to check
   * @returns {Object} Video quality result
   */
  async checkVideoQuality(video) {
    const thresholds = this.qualityThresholds.video;
    const issues = [];
    let score = 100;

    // Check required metadata
    thresholds.requiredMetadata.forEach(field => {
      if (!video[field]) {
        issues.push(`Missing required metadata: ${field}`);
        score -= 15;
      }
    });

    // Check duration
    if (video.duration) {
      if (video.duration < thresholds.minDuration) {
        issues.push(`Video too short: ${video.duration} seconds, minimum required: ${thresholds.minDuration} seconds`);
        score -= 20;
      } else if (video.duration > thresholds.maxDuration) {
        issues.push(`Video too long: ${video.duration} seconds, maximum allowed: ${thresholds.maxDuration} seconds`);
        score -= 20;
      }
    }

    // Check resolution
    if (video.resolution) {
      const [width, height] = video.resolution.split('x').map(Number);
      if (width < thresholds.minResolutionWidth || height < thresholds.minResolutionHeight) {
        issues.push(`Low resolution: ${video.resolution}, minimum required: ${thresholds.minResolutionWidth}x${thresholds.minResolutionHeight}`);
        score -= 15;
      }
    }

    // Check file size
    if (video.size && video.size > thresholds.maxFileSize) {
      issues.push(`File too large: ${Math.round(video.size / 1024 / 1024)} MB, maximum allowed: ${Math.round(thresholds.maxFileSize / 1024 / 1024)} MB`);
      score -= 15;
    }

    // Check format
    if (video.format && !['mp4', 'mov', 'avi', 'mkv'].includes(video.format.toLowerCase())) {
      issues.push(`Unsupported format: ${video.format}, supported formats: mp4, mov, avi, mkv`);
      score -= 10;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      contentType: 'video',
      score: score,
      issues: issues,
      passed: score >= 70,
      details: {
        duration: video.duration,
        resolution: video.resolution,
        size: video.size,
        format: video.format
      }
    };
  }

  /**
   * Check audio quality
   * @param {Object} audio - The audio to check
   * @returns {Object} Audio quality result
   */
  async checkAudioQuality(audio) {
    const thresholds = this.qualityThresholds.audio;
    const issues = [];
    let score = 100;

    // Check required metadata
    thresholds.requiredMetadata.forEach(field => {
      if (!audio[field]) {
        issues.push(`Missing required metadata: ${field}`);
        score -= 15;
      }
    });

    // Check duration
    if (audio.duration) {
      if (audio.duration < thresholds.minDuration) {
        issues.push(`Audio too short: ${audio.duration} seconds, minimum required: ${thresholds.minDuration} seconds`);
        score -= 20;
      } else if (audio.duration > thresholds.maxDuration) {
        issues.push(`Audio too long: ${audio.duration} seconds, maximum allowed: ${thresholds.maxDuration} seconds`);
        score -= 20;
      }
    }

    // Check bitrate
    if (audio.bitrate && audio.bitrate < thresholds.minBitrate) {
      issues.push(`Low bitrate: ${audio.bitrate} bps, minimum required: ${thresholds.minBitrate} bps`);
      score -= 15;
    }

    // Check file size
    if (audio.size && audio.size > thresholds.maxFileSize) {
      issues.push(`File too large: ${Math.round(audio.size / 1024 / 1024)} MB, maximum allowed: ${Math.round(thresholds.maxFileSize / 1024 / 1024)} MB`);
      score -= 15;
    }

    // Check format
    if (audio.format && !['mp3', 'wav', 'aac', 'flac'].includes(audio.format.toLowerCase())) {
      issues.push(`Unsupported format: ${audio.format}, supported formats: mp3, wav, aac, flac`);
      score -= 10;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      contentType: 'audio',
      score: score,
      issues: issues,
      passed: score >= 70,
      details: {
        duration: audio.duration,
        bitrate: audio.bitrate,
        size: audio.size,
        format: audio.format
      }
    };
  }

  /**
   * Check thumbnail quality
   * @param {Object} thumbnail - The thumbnail to check
   * @returns {Object} Thumbnail quality result
   */
  async checkThumbnailQuality(thumbnail) {
    const thresholds = this.qualityThresholds.thumbnail;
    const issues = [];
    let score = 100;

    // Check dimensions
    if (thumbnail.width && thumbnail.height) {
      if (thumbnail.width < thresholds.minWidth) {
        issues.push(`Width too small: ${thumbnail.width}px, minimum required: ${thresholds.minWidth}px`);
        score -= 20;
      }
      if (thumbnail.height < thresholds.minHeight) {
        issues.push(`Height too small: ${thumbnail.height}px, minimum required: ${thresholds.minHeight}px`);
        score -= 20;
      }
    }

    // Check file size
    if (thumbnail.size && thumbnail.size > thresholds.maxFileSize) {
      issues.push(`File too large: ${Math.round(thumbnail.size / 1024)} KB, maximum allowed: ${Math.round(thresholds.maxFileSize / 1024)} KB`);
      score -= 15;
    }

    // Check format
    if (thumbnail.format && !thresholds.allowedFormats.includes(thumbnail.format.toLowerCase())) {
      issues.push(`Unsupported format: ${thumbnail.format}, allowed formats: ${thresholds.allowedFormats.join(', ')}`);
      score -= 15;
    }

    // Check text elements
    if (thumbnail.textElements && thumbnail.textElements.length < thresholds.requiredTextElements) {
      issues.push(`Insufficient text elements: ${thumbnail.textElements.length}, minimum required: ${thresholds.requiredTextElements}`);
      score -= 10;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      contentType: 'thumbnail',
      score: score,
      issues: issues,
      passed: score >= 70,
      details: {
        width: thumbnail.width,
        height: thumbnail.height,
        size: thumbnail.size,
        format: thumbnail.format,
        textElementCount: thumbnail.textElements ? thumbnail.textElements.length : 0
      }
    };
  }

  /**
   * Generate quality report
   * @param {string} contentId - Content ID
   * @param {Object} checks - Quality checks performed
   * @returns {Object} Quality report
   */
  async generateQualityReport(contentId, checks) {
    const reportId = uuidv4();
    const generatedAt = new Date().toISOString();

    // Calculate overall score
    let overallScore = 0;
    let totalWeight = 0;

    Object.keys(checks).forEach(contentType => {
      if (checks[contentType] && checks[contentType].score !== undefined) {
        const weight = this.qualityWeights[contentType] || 0;
        overallScore += checks[contentType].score * weight;
        totalWeight += weight;
      }
    });

    // Normalize overall score
    if (totalWeight > 0) {
      overallScore = Math.round(overallScore / totalWeight);
    }

    // Determine overall pass status
    const passed = overallScore >= 70;

    // Create report
    const report = {
      id: reportId,
      contentId: contentId,
      generatedAt: generatedAt,
      overallScore: overallScore,
      passed: passed,
      checks: checks,
      summary: {
        totalChecks: Object.keys(checks).length,
        passedChecks: Object.values(checks).filter(check => check && check.passed).length,
        failedChecks: Object.values(checks).filter(check => check && !check.passed).length
      }
    };

    // Save report
    this.saveQualityReport(report);

    return report;
  }

  /**
   * Get quality report by ID
   * @param {string} reportId - Report ID
   * @returns {Object} Quality report
   */
  async getQualityReport(reportId) {
    try {
      const reportPath = path.join(this.qualityReportsDir, `${reportId}.json`);
      if (fs.existsSync(reportPath)) {
        return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error getting quality report ${reportId}:`, error);
      return null;
    }
  }

  /**
   * List quality reports
   * @returns {Array} List of quality reports
   */
  async listQualityReports() {
    try {
      const reports = [];
      if (fs.existsSync(this.qualityReportsDir)) {
        const files = fs.readdirSync(this.qualityReportsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const reportData = JSON.parse(fs.readFileSync(path.join(this.qualityReportsDir, file), 'utf8'));
            reports.push(reportData);
          }
        }
      }
      return reports;
    } catch (error) {
      console.error('Error listing quality reports:', error);
      return [];
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
   * Save quality report
   * @param {Object} report - Quality report to save
   */
  saveQualityReport(report) {
    try {
      const reportPath = path.join(this.qualityReportsDir, `${report.id}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('Error saving quality report:', error);
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
        'check-content-quality',
        'check-script-quality',
        'check-video-quality',
        'check-audio-quality',
        'check-thumbnail-quality',
        'generate-quality-report',
        'get-quality-report',
        'list-quality-reports',
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

module.exports = QualityCheckAgent;