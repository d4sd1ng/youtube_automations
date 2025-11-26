/**
 * Media Path Manager
 * Manages paths for media assets used in the AGENTS project
 */

const path = require('path');
const fs = require('fs');

class MediaPathManager {
  constructor() {
    // Load media paths configuration
    this.configPath = path.join(__dirname, '../../media_assets/media_paths.json');
    this.paths = this.loadPaths();
    
    // Ensure all directories exist
    this.ensureDirectories();
  }
  
  /**
   * Load paths from configuration file
   */
  loadPaths() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Failed to load media paths configuration:', error);
      // Return default paths if config file cannot be loaded
      return this.getDefaultPaths();
    }
  }
  
  /**
   * Get default paths if configuration file is not available
   */
  getDefaultPaths() {
    const workspaceRoot = path.join(__dirname, '../../media_assets');
    return {
      mediaAssets: {
        root: workspaceRoot,
        channels: {
          autonova: {
            root: path.join(workspaceRoot, 'autonova'),
            graphics: path.join(workspaceRoot, 'autonova', 'graphics'),
            icons: path.join(workspaceRoot, 'autonova', 'icons'),
            images: path.join(workspaceRoot, 'autonova', 'images'),
            thumbnails: path.join(workspaceRoot, 'autonova', 'thumbnails'),
            backgrounds: path.join(workspaceRoot, 'autonova', 'backgrounds')
          },
          politara: {
            root: path.join(workspaceRoot, 'politara'),
            graphics: path.join(workspaceRoot, 'politara', 'graphics'),
            icons: path.join(workspaceRoot, 'politara', 'icons'),
            images: path.join(workspaceRoot, 'politara', 'images'),
            thumbnails: path.join(workspaceRoot, 'politara', 'thumbnails'),
            backgrounds: path.join(workspaceRoot, 'politara', 'backgrounds')
          },
          shared: {
            root: path.join(workspaceRoot, 'shared'),
            graphics: path.join(workspaceRoot, 'shared', 'graphics'),
            icons: path.join(workspaceRoot, 'shared', 'icons'),
            images: path.join(workspaceRoot, 'shared', 'images'),
            thumbnails: path.join(workspaceRoot, 'shared', 'thumbnails'),
            backgrounds: path.join(workspaceRoot, 'shared', 'backgrounds')
          }
        },
        special: {
          politicians: path.join(workspaceRoot, 'politicians'),
          logos: path.join(workspaceRoot, 'logos'),
          fonts: path.join(workspaceRoot, 'fonts')
        }
      }
    };
  }
  
  /**
   * Ensure all required directories exist
   */
  ensureDirectories() {
    const createDirIfNotExists = (dirPath) => {
      if (!fs.existsSync(dirPath)) {
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`Created directory: ${dirPath}`);
        } catch (error) {
          console.error(`Failed to create directory ${dirPath}:`, error);
        }
      }
    };
    
    // Create channel directories
    Object.values(this.paths.mediaAssets.channels).forEach(channel => {
      Object.values(channel).forEach(dirPath => {
        createDirIfNotExists(dirPath);
      });
    });
    
    // Create special directories
    Object.values(this.paths.mediaAssets.special).forEach(dirPath => {
      createDirIfNotExists(dirPath);
    });
  }
  
  /**
   * Get path for a specific channel and content type
   */
  getChannelPath(channel, contentType) {
    if (!this.paths.mediaAssets.channels[channel]) {
      throw new Error(`Invalid channel: ${channel}`);
    }
    
    if (!this.paths.mediaAssets.channels[channel][contentType]) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    return this.paths.mediaAssets.channels[channel][contentType];
  }
  
  /**
   * Get path for special media assets
   */
  getSpecialPath(assetType) {
    if (!this.paths.mediaAssets.special[assetType]) {
      throw new Error(`Invalid special asset type: ${assetType}`);
    }
    
    return this.paths.mediaAssets.special[assetType];
  }
  
  /**
   * Get all paths for a specific channel
   */
  getAllChannelPaths(channel) {
    if (!this.paths.mediaAssets.channels[channel]) {
      throw new Error(`Invalid channel: ${channel}`);
    }
    
    return this.paths.mediaAssets.channels[channel];
  }
  
  /**
   * Get root path for media assets
   */
  getRootPath() {
    return this.paths.mediaAssets.root;
  }
  
  /**
   * List all available channels
   */
  getAvailableChannels() {
    return Object.keys(this.paths.mediaAssets.channels);
  }
  
  /**
   * List all special asset types
   */
  getSpecialAssetTypes() {
    return Object.keys(this.paths.mediaAssets.special);
  }
  
  /**
   * Get usage guidelines from configuration
   */
  getUsageGuidelines() {
    return this.paths.usageGuidelines || {};
  }
  
  /**
   * Validate if a file path is within the media assets structure
   */
  isValidMediaPath(filePath) {
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve(this.paths.mediaAssets.root);
    return resolvedPath.startsWith(rootPath);
  }
  
  /**
   * Get relative path within media assets structure
   */
  getRelativePath(filePath) {
    if (!this.isValidMediaPath(filePath)) {
      throw new Error('File path is not within media assets structure');
    }
    
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve(this.paths.mediaAssets.root);
    return path.relative(rootPath, resolvedPath);
  }
}

// Export singleton instance
module.exports = new MediaPathManager();