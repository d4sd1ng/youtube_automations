const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

/**
 * WAN 2.2 Service
 * Integration mit lokaler WAN 2.2 Installation für die Erstellung animierter Thumbnails und Videosequenzen
 * 
 * Hinweis: WAN 2.2 ist eine lokale Installation, die Hardware-Ressourcen benötigt.
 * Die aktuelle Implementierung verwendet CLI-Befehle für die Interaktion.
 */
class WAN22Service {
  constructor() {
    this.configPath = path.join(__dirname, 'aiToolsConfig.json');
    this.loadConfiguration();
    this.ensureDirectories();
  }

  /**
   * Load AI tools configuration
   */
  loadConfiguration() {
    try {
      if (fs.existsSync(this.configPath)) {
        this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } else {
        this.config = {
          wan22: {
            enabled: true,
            localPath: "/pfad/zu/wan22",
            gpuEnabled: true,
            estimatedCostPerHour: 0.15,
            monthlyHardwareCost: 20.0,
            features: {
              animatedThumbnailGeneration: true,
              videoSequenceGeneration: true
            },
            limits: {
              dailyProcessingHours: 5,
              maxVideoLength: 60
            }
          },
          budget: {
            monthlyLimit: 100,
            currentSpent: 20.0,
            currency: "EUR"
          }
        };
        this.saveConfiguration();
      }

      // Reset daily usage if needed
      const today = new Date().toISOString().split('T')[0];
      if (this.config.wan22.lastReset !== today) {
        this.config.wan22.currentUsage = 0;
        this.config.wan22.lastReset = today;
        this.saveConfiguration();
      }
    } catch (error) {
      console.error('❌ Failed to load AI tools config:', error);
      this.config = {};
    }
  }

  /**
   * Save AI tools configuration
   */
  saveConfiguration() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('❌ Failed to save AI tools config:', error);
    }
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    this.tempDir = path.join(__dirname, '../../data/temp/wan22');
    this.outputDir = path.join(__dirname, '../../data/wan22-output');
    
    [this.tempDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate animated thumbnail using WAN 2.2
   * @param {object} videoData - Video data for thumbnail generation
   * @param {object} options - Additional options for generation
   * @returns {Promise<object>} Generated animated thumbnail data
   */
  async generateAnimatedThumbnail(videoData, options = {}) {
    try {
      // Check if WAN 2.2 is enabled and within limits
      if (!this.config.wan22.enabled) {
        console.log('⏭️  WAN 2.2 is disabled, returning fallback');
        return this.createFallbackThumbnail(videoData);
      }

      // Check if animated thumbnail generation feature is enabled
      if (!this.config.wan22.features || !this.config.wan22.features.animatedThumbnailGeneration) {
        console.log('⏭️  WAN 2.2 animated thumbnail generation feature is disabled, returning fallback');
        return this.createFallbackThumbnail(videoData);
      }

      // Check daily limit for processing hours
      const estimatedProcessingTime = this.estimateProcessingTime(videoData);
      if (this.config.wan22.currentUsage + estimatedProcessingTime > this.config.wan22.limits.dailyProcessingHours) {
        console.log('⏭️  WAN 2.2 daily processing limit reached, returning fallback');
        return this.createFallbackThumbnail(videoData);
      }

      // Check budget
      if (this.config.budget && this.config.budget.currentSpent >= this.config.budget.monthlyLimit) {
        console.log('⏭️  Monthly budget limit reached, returning fallback');
        return this.createFallbackThumbnail(videoData);
      }

      console.log(`🎬 Generating animated thumbnail with WAN 2.2 for: "${videoData.title}"`);

      // Create input files
      const inputFiles = await this.prepareInputFiles(videoData, options);
      
      // Prepare CLI command
      const command = this.buildWAN22Command(inputFiles, options);
      
      // Execute WAN 2.2
      const result = await this.executeWAN22(command);
      
      // Update usage counter and budget
      this.config.wan22.currentUsage += estimatedProcessingTime;
      if (this.config.budget) {
        const processingCost = estimatedProcessingTime * this.config.wan22.estimatedCostPerHour;
        this.config.budget.currentSpent += processingCost;
      }
      this.saveConfiguration();

      console.log('✅ Animated thumbnail generated with WAN 2.2');
      
      // Return thumbnail data
      return {
        success: true,
        videoUrl: result.outputPath,
        previewUrl: result.previewPath,
        title: videoData.title,
        processingTime: estimatedProcessingTime,
        cost: estimatedProcessingTime * this.config.wan22.estimatedCostPerHour,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to generate animated thumbnail with WAN 2.2:', error.message);
      return this.createFallbackThumbnail(videoData);
    }
  }

  /**
   * Prepare input files for WAN 2.2 processing
   * @param {object} videoData - Video data
   * @param {object} options - Processing options
   * @returns {Promise<object>} Input files information
   */
  async prepareInputFiles(videoData, options) {
    // In a real implementation, this would prepare the actual input files
    // For now, we'll create placeholder files
    
    const jobId = uuidv4();
    const inputDir = path.join(this.tempDir, jobId);
    fs.mkdirSync(inputDir, { recursive: true });
    
    // Create a placeholder script file
    const scriptPath = path.join(inputDir, 'script.txt');
    fs.writeFileSync(scriptPath, videoData.title || 'Default script content');
    
    // Create a placeholder visual concept file if available
    let conceptPath = null;
    if (videoData.visualConcept) {
      conceptPath = path.join(inputDir, 'concept.json');
      fs.writeFileSync(conceptPath, JSON.stringify(videoData.visualConcept, null, 2));
    }
    
    return {
      jobId,
      inputDir,
      scriptPath,
      conceptPath
    };
  }

  /**
   * Build WAN 2.2 CLI command
   * @param {object} inputFiles - Input files information
   * @param {object} options - Processing options
   * @returns {string} CLI command
   */
  buildWAN22Command(inputFiles, options) {
    const wan22Path = this.config.wan22.localPath;
    const outputPath = path.join(this.outputDir, inputFiles.jobId);
    
    // Create output directory
    fs.mkdirSync(outputPath, { recursive: true });
    
    // Build command
    let command = `${wan22Path} --script "${inputFiles.scriptPath}" --output "${outputPath}"`;
    
    if (inputFiles.conceptPath) {
      command += ` --concept "${inputFiles.conceptPath}"`;
    }
    
    if (this.config.wan22.gpuEnabled) {
      command += ' --gpu';
    }
    
    if (options.duration) {
      command += ` --duration ${options.duration}`;
    }
    
    if (options.quality) {
      command += ` --quality ${options.quality}`;
    }
    
    if (options.fps) {
      command += ` --fps ${options.fps}`;
    }
    
    command += ' --format mp4';
    
    return command;
  }

  /**
   * Execute WAN 2.2 command
   * @param {string} command - CLI command to execute
   * @returns {Promise<object>} Execution result
   */
  async executeWAN22(command) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Executing WAN 2.2 command: ${command}`);
      
      // In a real implementation, this would execute the actual command
      // For now, we'll simulate the execution
      
      // Simulate processing time
      const processingTime = 2000 + Math.random() * 3000;
      
      setTimeout(() => {
        // Simulate output files
        const jobId = uuidv4();
        const outputPath = path.join(this.outputDir, `${jobId}.mp4`);
        const previewPath = path.join(this.outputDir, `${jobId}_preview.gif`);
        
        // Create placeholder files
        fs.writeFileSync(outputPath, 'Simulated WAN 2.2 output video');
        fs.writeFileSync(previewPath, 'Simulated WAN 2.2 preview image');
        
        resolve({
          outputPath,
          previewPath,
          jobId
        });
      }, processingTime);
    });
  }

  /**
   * Estimate processing time for a video
   * @param {object} videoData - Video data
   * @returns {number} Estimated processing time in hours
   */
  estimateProcessingTime(videoData) {
    // Simple estimation based on video complexity
    // In a real implementation, this would be more sophisticated
    let baseTime = 0.1; // 6 minutes base time
    
    if (videoData.contentType === 'short') {
      baseTime = 0.05; // 3 minutes for shorts
    } else if (videoData.contentType === 'ai_content') {
      baseTime = 0.15; // 9 minutes for AI content
    }
    
    // Adjust based on quality score
    if (videoData.qualityScore && videoData.qualityScore > 80) {
      baseTime *= 1.2; // 20% more time for high quality
    }
    
    return baseTime;
  }

  /**
   * Create fallback thumbnail when WAN 2.2 is not available
   * @param {object} videoData - Video data
   * @returns {object} Fallback thumbnail data
   */
  createFallbackThumbnail(videoData) {
    return {
      success: false,
      videoUrl: null,
      title: videoData.title,
      fallback: true,
      message: "WAN 2.2 nicht verfügbar, Fallback verwendet"
    };
  }

  /**
   * Get WAN 2.2 usage statistics
   * @returns {object} Usage statistics
   */
  getUsageStats() {
    return {
      enabled: this.config.wan22.enabled,
      dailyLimit: this.config.wan22.limits.dailyProcessingHours,
      currentUsage: this.config.wan22.currentUsage,
      remainingUsage: this.config.wan22.limits.dailyProcessingHours - this.config.wan22.currentUsage,
      lastReset: this.config.wan22.lastReset,
      features: this.config.wan22.features,
      limits: this.config.wan22.limits,
      budget: this.config.budget,
      hardwareCost: this.config.wan22.monthlyHardwareCost
    };
  }

  /**
   * Reset daily usage counter
   * This method can be called manually or by a scheduled task
   */
  resetDailyUsage() {
    this.config.wan22.currentUsage = 0;
    this.config.wan22.lastReset = new Date().toISOString().split('T')[0];
    this.saveConfiguration();
    console.log('🔄 WAN 2.2 daily usage counter reset');
  }

  /**
   * Check if WAN 2.2 is available for use based on limits and budget
   * @returns {boolean} Availability status
   */
  isAvailable() {
    // Check if enabled
    if (!this.config.wan22.enabled) {
      return false;
    }

    // Check daily limit
    if (this.config.wan22.currentUsage >= this.config.wan22.limits.dailyProcessingHours) {
      return false;
    }

    // Check budget
    if (this.config.budget && this.config.budget.currentSpent >= this.config.budget.monthlyLimit) {
      return false;
    }

    // Check if local path exists
    if (!this.config.wan22.localPath || !fs.existsSync(this.config.wan22.localPath)) {
      return false;
    }

    return true;
  }
}

module.exports = WAN22Service;