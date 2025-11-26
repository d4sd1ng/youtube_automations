const fs = require('fs');
const path = require('path');

/**
 * Path Management Service
 * Manages the organized directory structure for all content types
 */
class PathManagementService {
  constructor() {
    this.baseDir = path.join(__dirname, '../../');
    this.dataDir = path.join(this.baseDir, 'data');
    
    // Define the new organized directory structure
    this.paths = {
      // Main directories
      data: this.dataDir,
      channels: path.join(this.dataDir, 'channels'),
      content: path.join(this.dataDir, 'content'),
      templates: path.join(this.dataDir, 'templates'),
      seo: path.join(this.dataDir, 'seo'),
      monetization: path.join(this.dataDir, 'monetization'),
      analytics: path.join(this.dataDir, 'analytics'),
      logs: path.join(this.dataDir, 'logs'),
      
      // Content directories by channel
      autonova: {
        base: path.join(this.dataDir, 'content', 'autonova'),
        scripts: path.join(this.dataDir, 'content', 'autonova', 'scripts'),
        videos: path.join(this.dataDir, 'content', 'autonova', 'videos'),
        thumbnails: path.join(this.dataDir, 'content', 'autonova', 'thumbnails'),
        backgrounds: path.join(this.dataDir, 'content', 'autonova', 'backgrounds'),
        graphics: path.join(this.dataDir, 'content', 'autonova', 'graphics'),
        audio: path.join(this.dataDir, 'content', 'autonova', 'audio')
      },
      
      politara: {
        base: path.join(this.dataDir, 'content', 'politara'),
        scripts: path.join(this.dataDir, 'content', 'politara', 'scripts'),
        videos: path.join(this.dataDir, 'content', 'politara', 'videos'),
        thumbnails: path.join(this.dataDir, 'content', 'politara', 'thumbnails'),
        backgrounds: path.join(this.dataDir, 'content', 'politara', 'backgrounds'),
        graphics: path.join(this.dataDir, 'content', 'politara', 'graphics'),
        audio: path.join(this.dataDir, 'content', 'politara', 'audio')
      },
      
      shared: {
        base: path.join(this.dataDir, 'content', 'shared'),
        scripts: path.join(this.dataDir, 'content', 'shared', 'scripts'),
        videos: path.join(this.dataDir, 'content', 'shared', 'videos'),
        thumbnails: path.join(this.dataDir, 'content', 'shared', 'thumbnails'),
        backgrounds: path.join(this.dataDir, 'content', 'shared', 'backgrounds'),
        graphics: path.join(this.dataDir, 'content', 'shared', 'graphics'),
        audio: path.join(this.dataDir, 'content', 'shared', 'audio')
      },
      
      // Template directories
      templateScripts: path.join(this.dataDir, 'templates', 'scripts'),
      templateVideo: path.join(this.dataDir, 'templates', 'video'),
      templateThumbnails: path.join(this.dataDir, 'templates', 'thumbnails'),
      templateBackgrounds: path.join(this.dataDir, 'templates', 'backgrounds'),
      templateGraphics: path.join(this.dataDir, 'templates', 'graphics'),
      templateWorkflows: path.join(this.dataDir, 'templates', 'workflows'),
      templatePrompts: path.join(this.dataDir, 'templates', 'prompts'),
      
      // Other directories
      demo: path.join(this.baseDir, 'demo'),
      docs: path.join(this.baseDir, 'docs'),
      examples: path.join(this.baseDir, 'examples'),
      tests: path.join(this.baseDir, 'tests'),
      tools: path.join(this.baseDir, 'tools')
    };
    
    this.ensureDirectories();
  }

  /**
   * Ensure all required directories exist
   */
  ensureDirectories() {
    // Create main directories
    const mainDirs = [
      this.paths.data,
      this.paths.channels,
      this.paths.content,
      this.paths.templates,
      this.paths.seo,
      this.paths.monetization,
      this.paths.analytics,
      this.paths.logs,
      this.paths.demo,
      this.paths.docs,
      this.paths.examples,
      this.paths.tests,
      this.paths.tools
    ];
    
    mainDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Create channel directories
    const channelDirs = [
      // Autonova directories
      this.paths.autonova.base,
      this.paths.autonova.scripts,
      this.paths.autonova.videos,
      this.paths.autonova.thumbnails,
      this.paths.autonova.backgrounds,
      this.paths.autonova.graphics,
      this.paths.autonova.audio,
      
      // Politara directories
      this.paths.politara.base,
      this.paths.politara.scripts,
      this.paths.politara.videos,
      this.paths.politara.thumbnails,
      this.paths.politara.backgrounds,
      this.paths.politara.graphics,
      this.paths.politara.audio,
      
      // Shared directories
      this.paths.shared.base,
      this.paths.shared.scripts,
      this.paths.shared.videos,
      this.paths.shared.thumbnails,
      this.paths.shared.backgrounds,
      this.paths.shared.graphics,
      this.paths.shared.audio
    ];
    
    channelDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Create template directories
    const templateDirs = [
      this.paths.templateScripts,
      this.paths.templateVideo,
      this.paths.templateThumbnails,
      this.paths.templateBackgrounds,
      this.paths.templateGraphics,
      this.paths.templateWorkflows,
      this.paths.templatePrompts
    ];
    
    templateDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log('✅ All required directories ensured');
  }

  /**
   * Get path for a specific content type and channel
   */
  getContentPath(channel, contentType) {
    if (!this.paths[channel]) {
      throw new Error(`Invalid channel: ${channel}`);
    }
    
    if (!this.paths[channel][contentType]) {
      throw new Error(`Invalid content type: ${contentType} for channel: ${channel}`);
    }
    
    return this.paths[channel][contentType];
  }

  /**
   * Get path for a specific template type
   */
  getTemplatePath(templateType) {
    const templatePathKey = `template${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`;
    
    if (!this.paths[templatePathKey]) {
      throw new Error(`Invalid template type: ${templateType}`);
    }
    
    return this.paths[templatePathKey];
  }

  /**
   * Get path for SEO data
   */
  getSEOPath() {
    return this.paths.seo;
  }

  /**
   * Get path for monetization data (highest priority)
   */
  getMonetizationPath() {
    return this.paths.monetization;
  }

  /**
   * Get path for analytics data
   */
  getAnalyticsPath() {
    return this.paths.analytics;
  }

  /**
   * Get path for logs
   */
  getLogsPath() {
    return this.paths.logs;
  }

  /**
   * Move file from old path to new organized structure
   */
  moveFileToOrganizedStructure(oldPath, channel, contentType, filename) {
    try {
      const newPath = path.join(this.getContentPath(channel, contentType), filename);
      
      // Ensure the target directory exists
      const targetDir = path.dirname(newPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(oldPath, newPath);
      
      console.log(`✅ Moved file from ${oldPath} to ${newPath}`);
      return newPath;
    } catch (error) {
      console.error(`❌ Failed to move file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Copy file to organized structure
   */
  copyFileToOrganizedStructure(sourcePath, channel, contentType, filename) {
    try {
      const targetPath = path.join(this.getContentPath(channel, contentType), filename);
      
      // Ensure the target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(sourcePath, targetPath);
      
      console.log(`✅ Copied file from ${sourcePath} to ${targetPath}`);
      return targetPath;
    } catch (error) {
      console.error(`❌ Failed to copy file: ${error.message}`);
      throw error;
    }
  }

  /**
   * List files in a specific directory
   */
  listFiles(channel, contentType) {
    try {
      const dirPath = this.getContentPath(channel, contentType);
      
      if (!fs.existsSync(dirPath)) {
        return [];
      }
      
      return fs.readdirSync(dirPath);
    } catch (error) {
      console.error(`❌ Failed to list files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a file exists in the organized structure
   */
  fileExists(channel, contentType, filename) {
    try {
      const filePath = path.join(this.getContentPath(channel, contentType), filename);
      return fs.existsSync(filePath);
    } catch (error) {
      console.error(`❌ Failed to check file existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Get the full path for a file in the organized structure
   */
  getFilePath(channel, contentType, filename) {
    return path.join(this.getContentPath(channel, contentType), filename);
  }

  /**
   * Get statistics about the directory structure
   */
  getStats() {
    const stats = {
      totalDirectories: 0,
      totalFiles: 0,
      channels: {
        autonova: {},
        politara: {},
        shared: {}
      }
    };

    // Count files in each channel directory
    ['autonova', 'politara', 'shared'].forEach(channel => {
      const contentTypes = ['scripts', 'videos', 'thumbnails', 'backgrounds', 'graphics', 'audio'];
      
      contentTypes.forEach(type => {
        try {
          const dirPath = this.paths[channel][type];
          if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            stats.channels[channel][type] = files.length;
            stats.totalFiles += files.length;
          } else {
            stats.channels[channel][type] = 0;
          }
        } catch (error) {
          stats.channels[channel][type] = 0;
        }
      });
    });

    // Count template files
    stats.templates = {};
    const templateTypes = ['Scripts', 'Video', 'Thumbnails', 'Backgrounds', 'Graphics', 'Workflows', 'Prompts'];
    
    templateTypes.forEach(type => {
      try {
        const dirPath = this.paths[`template${type}`];
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          stats.templates[type.toLowerCase()] = files.length;
          stats.totalFiles += files.length;
        } else {
          stats.templates[type.toLowerCase()] = 0;
        }
      } catch (error) {
        stats.templates[type.toLowerCase()] = 0;
      }
    });

    // Count directories
    const countDirectories = (dir) => {
      if (!fs.existsSync(dir)) return 0;
      
      let count = 1; // Count the directory itself
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          count += countDirectories(itemPath);
        }
      });
      
      return count;
    };
    
    stats.totalDirectories = countDirectories(this.dataDir);

    return stats;
  }
}

module.exports = PathManagementService;