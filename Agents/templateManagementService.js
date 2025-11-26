const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Template Management Agent
 * Manages templates for prompts, scripts, and workflows with advanced features
 * Bewertung: 9/10
 */
class TemplateManagementAgent {
  constructor() {
    this.templatesDir = path.join(__dirname, '../../data/templates');
    this.metadataDir = path.join(this.templatesDir, 'metadata');
    this.versionsDir = path.join(this.templatesDir, 'versions');
    this.categoriesDir = path.join(this.templatesDir, 'categories');

    // Initialize PathManagementService for organized structure
    this.pathService = new (require('./pathManagementService'))();

    // Erweiterte unterstützte Template-Typen
    this.supportedTemplateTypes = [
      'prompt',
      'script',
      'workflow',
      'trailer',
      'video',
      'thumbnail',
      'background',
      'graphic',
      'seo',
      'monetization'
    ];

    // Template-Kategorien für bessere Organisation
    this.templateCategories = {
      content: ['script', 'trailer', 'video'],
      visual: ['thumbnail', 'background', 'graphic'],
      ai: ['prompt'],
      process: ['workflow'],
      optimization: ['seo', 'monetization']
    };

    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [
      this.templatesDir,
      this.metadataDir,
      this.versionsDir,
      this.categoriesDir
    ];

    // Füge Template-Typ-Verzeichnisse hinzu
    this.supportedTemplateTypes.forEach(type => {
      dirs.push(path.join(this.templatesDir, `${type}s`));
    });

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load a specific template with validation
   */
  loadTemplate(templateType, templateName) {
    try {
      // Validate template type
      if (!this.supportedTemplateTypes.includes(templateType)) {
        throw new Error(`Unsupported template type: ${templateType}`);
      }

      const templatePath = this.getTemplatePath(templateType, templateName);

      if (!fs.existsSync(templatePath)) {
        console.warn(`Template not found: ${templatePath}`);
        return null;
      }

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const templateData = JSON.parse(templateContent);

      // Validiere Template-Struktur
      this.validateTemplateStructure(templateType, templateData);

      // Füge Metadaten hinzu
      const metadata = this.loadTemplateMetadata(templateType, templateName);

      return {
        ...templateData,
        metadata: metadata || {},
        loadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to load ${templateType} template "${templateName}":`, error);
      return null;
    }
  }

  /**
   * Save a template with versioning and metadata
   */
  saveTemplate(templateType, templateName, templateData, options = {}) {
    try {
      // Validate template type
      if (!this.supportedTemplateTypes.includes(templateType)) {
        throw new Error(`Unsupported template type: ${templateType}`);
      }

      // Validiere Template-Struktur vor dem Speichern
      this.validateTemplateStructure(templateType, templateData);

      const templatePath = this.getTemplatePath(templateType, templateName);

      // Erstelle Versionsverzeichnis falls es nicht existiert
      const versionDir = path.join(this.versionsDir, templateType, templateName);
      if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir, { recursive: true });
      }

      // Speichere aktuelle Version
      fs.writeFileSync(templatePath, JSON.stringify(templateData, null, 2));

      // Erstelle neue Version wenn gewünscht
      if (options.createVersion !== false) {
        const versionPath = path.join(versionDir, `v${Date.now()}.json`);
        fs.writeFileSync(versionPath, JSON.stringify(templateData, null, 2));
      }

      // Speichere Metadaten
      const metadata = {
        id: uuidv4(),
        name: templateName,
        type: templateType,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        versionCount: options.createVersion !== false ? 1 : 0,
        category: options.category || this.determineTemplateCategory(templateType),
        tags: options.tags || [],
        description: options.description || '',
        author: options.author || 'system',
        usageCount: 0
      };

      this.saveTemplateMetadata(templateType, templateName, metadata);

      console.log(`✅ Template saved: ${templatePath}`);
      return {
        success: true,
        path: templatePath,
        metadata: metadata
      };
    } catch (error) {
      console.error(`Failed to save ${templateType} template "${templateName}":`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a template is available
   */
  isTemplateAvailable(templateType, templateName) {
    try {
      // Validate template type
      if (!this.supportedTemplateTypes.includes(templateType)) {
        return false;
      }

      const templatePath = this.getTemplatePath(templateType, templateName);
      return fs.existsSync(templatePath);
    } catch (error) {
      console.error(`Failed to check template availability "${templateName}":`, error);
      return false;
    }
  }

  /**
   * List all available templates of a specific type
   */
  listTemplates(templateType) {
    try {
      // Validate template type
      if (!this.supportedTemplateTypes.includes(templateType)) {
        throw new Error(`Unsupported template type: ${templateType}`);
      }

      const templateDir = path.join(this.templatesDir, `${templateType}s`);

      if (!fs.existsSync(templateDir)) {
        return [];
      }

      const files = fs.readdirSync(templateDir);
      return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
    } catch (error) {
      console.error(`Failed to list ${templateType} templates:`, error);
      return [];
    }
  }

  /**
   * Erweiterte Template-Operationen
   */

  /**
   * Search templates by name, category, or tags
   */
  searchTemplates(query, filters = {}) {
    try {
      const results = [];

      // Durchsuche alle Template-Typen
      this.supportedTemplateTypes.forEach(templateType => {
        const templates = this.listTemplates(templateType);

        templates.forEach(templateName => {
          const metadata = this.loadTemplateMetadata(templateType, templateName);

          // Prüfe auf Übereinstimmung mit Suchkriterien
          let matches = false;

          // Name-Suche
          if (query && templateName.toLowerCase().includes(query.toLowerCase())) {
            matches = true;
          }

          // Kategorie-Filter
          if (filters.category && metadata && metadata.category === filters.category) {
            matches = true;
          }

          // Tag-Filter
          if (filters.tags && metadata && metadata.tags) {
            const hasTag = filters.tags.some(tag => metadata.tags.includes(tag));
            if (hasTag) matches = true;
          }

          // Typ-Filter
          if (filters.type && templateType === filters.type) {
            matches = true;
          }

          if (matches || (!query && !filters.category && !filters.tags && !filters.type)) {
            results.push({
              name: templateName,
              type: templateType,
              metadata: metadata || {}
            });
          }
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Get template versions
   */
  getTemplateVersions(templateType, templateName) {
    try {
      const versionDir = path.join(this.versionsDir, templateType, templateName);

      if (!fs.existsSync(versionDir)) {
        return [];
      }

      const versions = fs.readdirSync(versionDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const versionNumber = file.replace('.json', '');
          const versionPath = path.join(versionDir, file);
          const stats = fs.statSync(versionPath);

          return {
            version: versionNumber,
            createdAt: stats.birthtime.toISOString(),
            size: stats.size
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return versions;
    } catch (error) {
      console.error(`Failed to get versions for ${templateType} template "${templateName}":`, error);
      return [];
    }
  }

  /**
   * Load a specific template version
   */
  loadTemplateVersion(templateType, templateName, version) {
    try {
      const versionPath = path.join(this.versionsDir, templateType, templateName, `${version}.json`);

      if (!fs.existsSync(versionPath)) {
        console.warn(`Template version not found: ${versionPath}`);
        return null;
      }

      const templateContent = fs.readFileSync(versionPath, 'utf8');
      return JSON.parse(templateContent);
    } catch (error) {
      console.error(`Failed to load version ${version} of ${templateType} template "${templateName}":`, error);
      return null;
    }
  }

  /**
   * Delete a template
   */
  deleteTemplate(templateType, templateName) {
    try {
      // Validate template type
      if (!this.supportedTemplateTypes.includes(templateType)) {
        throw new Error(`Unsupported template type: ${templateType}`);
      }

      const templatePath = this.getTemplatePath(templateType, templateName);

      if (fs.existsSync(templatePath)) {
        fs.unlinkSync(templatePath);

        // Lösche auch Metadaten
        const metadataPath = this.getMetadataPath(templateType, templateName);
        if (fs.existsSync(metadataPath)) {
          fs.unlinkSync(metadataPath);
        }

        console.log(`✅ Template deleted: ${templatePath}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to delete ${templateType} template "${templateName}":`, error);
      return false;
    }
  }

  /**
   * Update template metadata
   */
  updateTemplateMetadata(templateType, templateName, metadataUpdates) {
    try {
      const currentMetadata = this.loadTemplateMetadata(templateType, templateName) || {};
      const updatedMetadata = {
        ...currentMetadata,
        ...metadataUpdates,
        lastModified: new Date().toISOString()
      };

      this.saveTemplateMetadata(templateType, templateName, updatedMetadata);
      return updatedMetadata;
    } catch (error) {
      console.error(`Failed to update metadata for ${templateType} template "${templateName}":`, error);
      return null;
    }
  }

  /**
   * Validate template structure
   */
  validateTemplateStructure(templateType, templateData) {
    // Grundlegende Validierung
    if (!templateData) {
      throw new Error('Template data is required');
    }

    // Spezifische Validierung basierend auf Template-Typ
    switch (templateType) {
      case 'prompt':
        if (!templateData.content && !templateData.messages) {
          throw new Error('Prompt template must have content or messages');
        }
        break;
      case 'script':
        if (!templateData.title || !templateData.content) {
          throw new Error('Script template must have title and content');
        }
        break;
      case 'workflow':
        if (!templateData.steps || !Array.isArray(templateData.steps)) {
          throw new Error('Workflow template must have steps array');
        }
        break;
      // Weitere Validierungen für andere Typen können hier hinzugefügt werden
    }

    return true;
  }

  /**
   * Hilfsfunktionen
   */

  /**
   * Get template path using organized structure
   */
  getTemplatePath(templateType, templateName) {
    return path.join(this.templatesDir, `${templateType}s`, `${templateName}.json`);
  }

  /**
   * Get metadata path
   */
  getMetadataPath(templateType, templateName) {
    return path.join(this.metadataDir, templateType, `${templateName}.json`);
  }

  /**
   * Save template metadata
   */
  saveTemplateMetadata(templateType, templateName, metadata) {
    try {
      const metadataPath = this.getMetadataPath(templateType, templateName);
      const metadataDir = path.dirname(metadataPath);

      if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
      }

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error(`Failed to save metadata for ${templateType} template "${templateName}":`, error);
    }
  }

  /**
   * Load template metadata
   */
  loadTemplateMetadata(templateType, templateName) {
    try {
      const metadataPath = this.getMetadataPath(templateType, templateName);

      if (!fs.existsSync(metadataPath)) {
        return null;
      }

      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      return JSON.parse(metadataContent);
    } catch (error) {
      console.error(`Failed to load metadata for ${templateType} template "${templateName}":`, error);
      return null;
    }
  }

  /**
   * Determine template category based on type
   */
  determineTemplateCategory(templateType) {
    for (const [category, types] of Object.entries(this.templateCategories)) {
      if (types.includes(templateType)) {
        return category;
      }
    }
    return 'other';
  }

  /**
   * Get template statistics
   */
  getStats() {
    try {
      const stats = {
        totalTemplates: 0,
        templatesByType: {},
        totalVersions: 0,
        categories: {}
      };

      // Zähle Templates nach Typ
      this.supportedTemplateTypes.forEach(templateType => {
        const templates = this.listTemplates(templateType);
        stats.templatesByType[templateType] = templates.length;
        stats.totalTemplates += templates.length;
      });

      // Zähle Kategorien
      Object.keys(this.templateCategories).forEach(category => {
        stats.categories[category] = 0;
        this.templateCategories[category].forEach(type => {
          stats.categories[category] += stats.templatesByType[type] || 0;
        });
      });

      // Zähle Versionen
      if (fs.existsSync(this.versionsDir)) {
        const versionTypes = fs.readdirSync(this.versionsDir);
        versionTypes.forEach(type => {
          const typeDir = path.join(this.versionsDir, type);
          if (fs.existsSync(typeDir)) {
            const templates = fs.readdirSync(typeDir);
            templates.forEach(template => {
              const templateDir = path.join(typeDir, template);
              if (fs.existsSync(templateDir)) {
                const versions = fs.readdirSync(templateDir);
                stats.totalVersions += versions.length;
              }
            });
          }
        });
      }

      return stats;
    } catch (error) {
      console.error('Failed to get template management stats:', error);
      return {
        totalTemplates: 0,
        templatesByType: {},
        totalVersions: 0,
        error: error.message
      };
    }
  }

  /**
   * Export templates
   */
  exportTemplates(exportPath, templateFilters = {}) {
    try {
      const exportedTemplates = [];

      // Durchsuche alle Template-Typen
      this.supportedTemplateTypes.forEach(templateType => {
        // Filtere nach Typ wenn angegeben
        if (templateFilters.type && templateFilters.type !== templateType) {
          return;
        }

        const templates = this.listTemplates(templateType);

        templates.forEach(templateName => {
          // Filtere nach anderen Kriterien
          if (templateFilters.category || templateFilters.tags) {
            const metadata = this.loadTemplateMetadata(templateType, templateName);

            if (templateFilters.category && metadata && metadata.category !== templateFilters.category) {
              return;
            }

            if (templateFilters.tags && metadata && metadata.tags) {
              const hasTag = templateFilters.tags.some(tag => metadata.tags.includes(tag));
              if (!hasTag) return;
            }
          }

          const templateData = this.loadTemplate(templateType, templateName);
          if (templateData) {
            exportedTemplates.push({
              name: templateName,
              type: templateType,
              data: templateData
            });
          }
        });
      });

      // Speichere exportierte Templates
      fs.writeFileSync(exportPath, JSON.stringify(exportedTemplates, null, 2));

      console.log(`✅ Exported ${exportedTemplates.length} templates to ${exportPath}`);
      return {
        success: true,
        count: exportedTemplates.length,
        path: exportPath
      };
    } catch (error) {
      console.error('Failed to export templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Import templates
   */
  importTemplates(importPath) {
    try {
      if (!fs.existsSync(importPath)) {
        throw new Error(`Import file not found: ${importPath}`);
      }

      const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));
      let importedCount = 0;

      importData.forEach(template => {
        const result = this.saveTemplate(
          template.type,
          template.name,
          template.data,
          { createVersion: false }
        );

        if (result.success) {
          importedCount++;
        }
      });

      console.log(`✅ Imported ${importedCount}/${importData.length} templates from ${importPath}`);
      return {
        success: true,
        total: importData.length,
        imported: importedCount
      };
    } catch (error) {
      console.error('Failed to import templates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TemplateManagementAgent;