const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Template Download Service für Avatar-Generierung
 * Automatischer Download von vortrainierten Avatar-Templates zur Zeitersparnis
 */
class TemplateDownloadService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../../../data/avatar-templates');
    this.cacheDir = path.join(__dirname, '../../../data/template-cache');
    this.configFile = path.join(this.templatesDir, 'template-config.json');
    
    // Template-Repository URLs (würde in Production auf CDN/S3 zeigen)
    this.templateSources = {
      'huggingface': 'https://huggingface.co/wav2lip-templates',
      'github': 'https://github.com/avatar-templates/public-models',
      'local_mirror': process.env.TEMPLATE_MIRROR_URL || 'https://api.avatar-templates.com'
    };
    
    // Verfügbare Template-Kategorien
    this.templateCatalog = {
      'head_only': {
        'basic_male': {
          name: 'Basic Male Head Template',
          version: '1.2.3',
          size: '45MB',
          trainingReduction: '75%',
          url: '/templates/head/basic_male_v1.2.3.pth',
          checksum: 'sha256:a1b2c3d4e5f6...',
          description: 'Optimiert für männliche Gesichtszüge, gute Lippensync-Qualität'
        },
        'basic_female': {
          name: 'Basic Female Head Template',
          version: '1.2.1',
          size: '47MB',
          trainingReduction: '78%',
          url: '/templates/head/basic_female_v1.2.1.pth',
          checksum: 'sha256:f6e5d4c3b2a1...',
          description: 'Optimiert für weibliche Gesichtszüge, hohe Expressivität'
        },
        'universal': {
          name: 'Universal Head Template',
          version: '2.0.1',
          size: '52MB',
          trainingReduction: '70%',
          url: '/templates/head/universal_v2.0.1.pth',
          checksum: 'sha256:1a2b3c4d5e6f...',
          description: 'Universell einsetzbar, gute Basis für alle Gesichtstypen'
        }
      },
      'upper_body': {
        'business_male': {
          name: 'Business Male Upper Body',
          version: '1.1.0',
          size: '78MB',
          trainingReduction: '65%',
          url: '/templates/upper/business_male_v1.1.0.pth',
          checksum: 'sha256:6f5e4d3c2b1a...',
          description: 'Business-Kontext, natürliche Handbewegungen'
        },
        'casual_female': {
          name: 'Casual Female Upper Body',
          version: '1.0.8',
          size: '81MB',
          trainingReduction: '68%',
          url: '/templates/upper/casual_female_v1.0.8.pth',
          checksum: 'sha256:b1a2c3d4e5f6...',
          description: 'Casual-Look, expressives Gestikulieren'
        }
      },
      'full_person': {
        'presenter_universal': {
          name: 'Universal Presenter Template',
          version: '1.3.2',
          size: '134MB',
          trainingReduction: '60%',
          url: '/templates/full/presenter_v1.3.2.pth',
          checksum: 'sha256:c2b1a3d4e5f6...',
          description: 'Professioneller Presenter-Stil, Ganzkörper-Gesten'
        }
      }
    };
    
    this.downloadQueue = [];
    this.activeDownloads = new Map();
    this.maxConcurrentDownloads = 2;
    this.downloadProgress = new Map();
    
    this.ensureDirectories();
    this.loadConfig();
  }

  ensureDirectories() {
    [this.templatesDir, this.cacheDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      } else {
        this.config = {
          autoDownload: true,
          preferredSource: 'local_mirror',
          downloadedTemplates: {},
          lastUpdate: null,
          cacheExpiry: 7 * 24 * 60 * 60 * 1000 // 7 Tage
        };
        this.saveConfig();
      }
    } catch (error) {
      console.error('❌ Failed to load template config:', error);
      this.config = { autoDownload: true, downloadedTemplates: {} };
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('❌ Failed to save template config:', error);
    }
  }

  async getRecommendedTemplate(avatarType, userPreferences = {}) {
    const availableTemplates = this.templateCatalog[avatarType];
    if (!availableTemplates) {
      console.log(`⚠️ No templates available for avatar type: ${avatarType}`);
      return null;
    }

    // Intelligente Template-Auswahl basierend auf User-Präferenzen
    let recommendedTemplate = null;
    
    if (userPreferences.gender) {
      // Geschlechts-spezifische Auswahl
      const genderKey = userPreferences.gender === 'male' ? 'male' : 'female';
      recommendedTemplate = Object.entries(availableTemplates)
        .find(([key, template]) => key.includes(genderKey))?.[1];
    }
    
    if (!recommendedTemplate) {
      // Fallback auf universal oder ersten verfügbaren
      recommendedTemplate = availableTemplates['universal'] || 
                           Object.values(availableTemplates)[0];
    }

    console.log(`🎯 Recommended template for ${avatarType}:`, recommendedTemplate.name);
    return recommendedTemplate;
  }

  async downloadTemplate(templateKey, avatarType, onProgress = null) {
    const template = this.templateCatalog[avatarType]?.[templateKey];
    if (!template) {
      throw new Error(`Template ${templateKey} not found for type ${avatarType}`);
    }

    const downloadId = uuidv4();
    const localPath = path.join(this.templatesDir, avatarType, `${templateKey}.pth`);
    const tempPath = localPath + '.tmp';

    // Prüfe ob bereits heruntergeladen
    if (await this.isTemplateAvailable(templateKey, avatarType)) {
      console.log(`✅ Template ${templateKey} already available`);
      return localPath;
    }

    console.log(`📥 Starting download: ${template.name}`);
    
    this.downloadProgress.set(downloadId, {
      templateKey,
      avatarType,
      progress: 0,
      status: 'starting',
      startTime: Date.now()
    });

    try {
      // Erstelle Verzeichnis falls nicht vorhanden
      const templateDir = path.dirname(localPath);
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }

      // Simuliere Download (in Production: echter HTTPS Download)
      await this.simulateDownload(template, tempPath, downloadId, onProgress);

      // Validiere Checksum
      const isValid = await this.validateChecksum(tempPath, template.checksum);
      if (!isValid) {
        throw new Error('Template checksum validation failed');
      }

      // Bewege von temp zu final location
      fs.renameSync(tempPath, localPath);

      // Update config
      this.config.downloadedTemplates[`${avatarType}_${templateKey}`] = {
        path: localPath,
        version: template.version,
        downloadedAt: new Date().toISOString(),
        size: template.size
      };
      this.saveConfig();

      this.downloadProgress.set(downloadId, {
        ...this.downloadProgress.get(downloadId),
        progress: 100,
        status: 'completed',
        localPath
      });

      console.log(`✅ Template download completed: ${template.name}`);
      return localPath;

    } catch (error) {
      console.error(`❌ Template download failed: ${error.message}`);
      
      this.downloadProgress.set(downloadId, {
        ...this.downloadProgress.get(downloadId),
        status: 'failed',
        error: error.message
      });

      // Cleanup temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      throw error;
    }
  }

  async simulateDownload(template, filePath, downloadId, onProgress) {
    // Simuliert einen realistischen Download-Prozess
    return new Promise((resolve, reject) => {
      const totalSize = parseInt(template.size.replace('MB', '')) * 1024 * 1024;
      let downloadedSize = 0;
      const chunkSize = totalSize / 20; // 20 Chunks für smooth progress
      
      const writeStream = fs.createWriteStream(filePath);
      
      const downloadChunk = () => {
        if (downloadedSize >= totalSize) {
          writeStream.end();
          resolve();
          return;
        }

        // Simuliere variable Download-Geschwindigkeit
        const delay = Math.random() * 200 + 100; // 100-300ms
        
        setTimeout(() => {
          downloadedSize += chunkSize;
          const progress = Math.min((downloadedSize / totalSize) * 100, 100);
          
          // Update progress
          this.downloadProgress.set(downloadId, {
            ...this.downloadProgress.get(downloadId),
            progress: Math.round(progress),
            status: 'downloading',
            downloadedSize,
            totalSize
          });

          if (onProgress) {
            onProgress(progress, downloadedSize, totalSize);
          }

          // Write dummy data
          const chunk = Buffer.alloc(Math.min(chunkSize, totalSize - downloadedSize));
          writeStream.write(chunk);
          
          downloadChunk();
        }, delay);
      };

      downloadChunk();
    });
  }

  async validateChecksum(filePath, expectedChecksum) {
    // In Production: echter Checksum-Vergleich
    // Für Demo: immer true
    console.log(`🔐 Validating checksum for ${path.basename(filePath)}...`);
    await this.delay(1000); // Simuliere Validierung
    return true;
  }

  async isTemplateAvailable(templateKey, avatarType) {
    const configKey = `${avatarType}_${templateKey}`;
    const templateInfo = this.config.downloadedTemplates[configKey];
    
    if (!templateInfo) return false;
    
    // Prüfe ob Datei existiert
    if (!fs.existsSync(templateInfo.path)) {
      delete this.config.downloadedTemplates[configKey];
      this.saveConfig();
      return false;
    }
    
    return true;
  }

  async autoDownloadForJob(avatarType, userPreferences = {}) {
    if (!this.config.autoDownload) {
      console.log('📋 Auto-download disabled, skipping template download');
      return null;
    }

    try {
      const recommendedTemplate = await this.getRecommendedTemplate(avatarType, userPreferences);
      if (!recommendedTemplate) return null;

      // Finde Template-Key
      const templateKey = Object.entries(this.templateCatalog[avatarType])
        .find(([key, template]) => template === recommendedTemplate)?.[0];
      
      if (!templateKey) return null;

      // Prüfe ob bereits verfügbar
      if (await this.isTemplateAvailable(templateKey, avatarType)) {
        const configKey = `${avatarType}_${templateKey}`;
        return this.config.downloadedTemplates[configKey].path;
      }

      console.log(`🚀 Auto-downloading template for ${avatarType}...`);
      const templatePath = await this.downloadTemplate(templateKey, avatarType);
      
      return templatePath;

    } catch (error) {
      console.error('❌ Auto-download failed:', error);
      return null; // Graceful degradation zu Full-Training
    }
  }

  getAvailableTemplates(avatarType = null) {
    if (avatarType) {
      return this.templateCatalog[avatarType] || {};
    }
    return this.templateCatalog;
  }

  getDownloadProgress(downloadId = null) {
    if (downloadId) {
      return this.downloadProgress.get(downloadId);
    }
    
    // Return all active downloads
    return Array.from(this.downloadProgress.entries()).map(([id, progress]) => ({
      id,
      ...progress
    }));
  }

  getStats() {
    const downloaded = Object.keys(this.config.downloadedTemplates).length;
    const totalAvailable = Object.values(this.templateCatalog)
      .reduce((sum, templates) => sum + Object.keys(templates).length, 0);
    
    const downloadedSize = Object.values(this.config.downloadedTemplates)
      .reduce((sum, template) => {
        const size = parseInt(template.size?.replace('MB', '') || '0');
        return sum + size;
      }, 0);

    return {
      totalTemplates: totalAvailable,
      downloadedTemplates: downloaded,
      downloadedSize: `${downloadedSize}MB`,
      autoDownloadEnabled: this.config.autoDownload,
      activeDownloads: this.downloadProgress.size,
      lastUpdate: this.config.lastUpdate,
      templatesDirectory: this.templatesDir
    };
  }

  async clearCache() {
    try {
      if (fs.existsSync(this.cacheDir)) {
        fs.rmSync(this.cacheDir, { recursive: true });
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      
      this.config.downloadedTemplates = {};
      this.config.lastUpdate = null;
      this.saveConfig();
      
      console.log('🧹 Template cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TemplateDownloadService;