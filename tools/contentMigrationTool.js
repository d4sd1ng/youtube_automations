const PathManagementService = require('../services/agent-controller/pathManagementService');
const fs = require('fs');
const path = require('path');

/**
 * Content Migration Tool
 * Migrates existing content to the new organized directory structure
 */

class ContentMigrationTool {
  constructor() {
    this.pathService = new PathManagementService();
    this.migrationLog = [];
  }

  /**
   * Migrate scripts from old structure to new organized structure
   */
  async migrateScripts() {
    console.log('🔄 Migrating scripts to organized structure...\n');
    
    try {
      // Define source directories for existing scripts
      const sourceScriptDirs = [
        path.join(__dirname, '../data/scripts'),
        path.join(__dirname, '../data/templates/scripts')
      ];
      
      let migratedCount = 0;
      
      for (const sourceDir of sourceScriptDirs) {
        if (fs.existsSync(sourceDir)) {
          const files = fs.readdirSync(sourceDir);
          
          for (const file of files) {
            if (file.endsWith('.txt') || file.endsWith('.json')) {
              const sourcePath = path.join(sourceDir, file);
              const stats = fs.statSync(sourcePath);
              
              // Determine channel based on filename or content
              let channel = 'shared';
              if (file.includes('autonova')) {
                channel = 'autonova';
              } else if (file.includes('politara')) {
                channel = 'politara';
              }
              
              // Determine content type
              const contentType = 'scripts';
              
              try {
                // Copy file to new organized structure
                const targetPath = this.pathService.copyFileToOrganizedStructure(
                  sourcePath, 
                  channel, 
                  contentType, 
                  file
                );
                
                this.migrationLog.push({
                  type: 'script',
                  source: sourcePath,
                  target: targetPath,
                  timestamp: new Date().toISOString(),
                  status: 'success'
                });
                
                migratedCount++;
                console.log(`✅ Migrated script: ${file} -> ${channel}/${contentType}`);
              } catch (error) {
                this.migrationLog.push({
                  type: 'script',
                  source: sourcePath,
                  error: error.message,
                  timestamp: new Date().toISOString(),
                  status: 'error'
                });
                
                console.error(`❌ Failed to migrate script ${file}: ${error.message}`);
              }
            }
          }
        }
      }
      
      console.log(`\n🎉 Script migration completed. Migrated ${migratedCount} scripts.\n`);
      return migratedCount;
    } catch (error) {
      console.error(`❌ Script migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate templates from old structure to new organized structure
   */
  async migrateTemplates() {
    console.log('🔄 Migrating templates to organized structure...\n');
    
    try {
      // Define source directories for existing templates
      const sourceTemplateDirs = [
        {
          source: path.join(__dirname, '../data/templates/scripts'),
          target: this.pathService.getTemplatePath('scripts')
        },
        {
          source: path.join(__dirname, '../data/templates/workflows'),
          target: this.pathService.getTemplatePath('workflows')
        },
        {
          source: path.join(__dirname, '../data/templates/prompt-templates'),
          target: this.pathService.getTemplatePath('prompts')
        },
        {
          source: path.join(__dirname, '../data/templates/3d-animations'),
          target: this.pathService.getTemplatePath('graphics') // 3D animations go to graphics
        }
      ];
      
      let migratedCount = 0;
      
      for (const { source, target } of sourceTemplateDirs) {
        if (fs.existsSync(source)) {
          const files = fs.readdirSync(source);
          
          // Ensure target directory exists
          if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
          }
          
          for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            
            try {
              // Copy file to new location
              fs.copyFileSync(sourcePath, targetPath);
              
              this.migrationLog.push({
                type: 'template',
                source: sourcePath,
                target: targetPath,
                timestamp: new Date().toISOString(),
                status: 'success'
              });
              
              migratedCount++;
              console.log(`✅ Migrated template: ${file}`);
            } catch (error) {
              this.migrationLog.push({
                type: 'template',
                source: sourcePath,
                target: targetPath,
                error: error.message,
                timestamp: new Date().toISOString(),
                status: 'error'
              });
              
              console.error(`❌ Failed to migrate template ${file}: ${error.message}`);
            }
          }
        }
      }
      
      console.log(`\n🎉 Template migration completed. Migrated ${migratedCount} templates.\n`);
      return migratedCount;
    } catch (error) {
      console.error(`❌ Template migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate thumbnails from old structure to new organized structure
   */
  async migrateThumbnails() {
    console.log('🔄 Migrating thumbnails to organized structure...\n');
    
    try {
      // Define source directory for existing thumbnails
      const sourceThumbnailDir = path.join(__dirname, '../data/thumbnails');
      const targetThumbnailDir = this.pathService.getContentPath('shared', 'thumbnails');
      
      if (fs.existsSync(sourceThumbnailDir)) {
        const files = fs.readdirSync(sourceThumbnailDir);
        let migratedCount = 0;
        
        // Ensure target directory exists
        if (!fs.existsSync(targetThumbnailDir)) {
          fs.mkdirSync(targetThumbnailDir, { recursive: true });
        }
        
        for (const file of files) {
          // Skip directories, only migrate files
          const sourcePath = path.join(sourceThumbnailDir, file);
          const stats = fs.statSync(sourcePath);
          
          if (stats.isFile()) {
            const targetPath = path.join(targetThumbnailDir, file);
            
            try {
              // Copy file to new location
              fs.copyFileSync(sourcePath, targetPath);
              
              this.migrationLog.push({
                type: 'thumbnail',
                source: sourcePath,
                target: targetPath,
                timestamp: new Date().toISOString(),
                status: 'success'
              });
              
              migratedCount++;
              console.log(`✅ Migrated thumbnail: ${file}`);
            } catch (error) {
              this.migrationLog.push({
                type: 'thumbnail',
                source: sourcePath,
                target: targetPath,
                error: error.message,
                timestamp: new Date().toISOString(),
                status: 'error'
              });
              
              console.error(`❌ Failed to migrate thumbnail ${file}: ${error.message}`);
            }
          }
        }
        
        console.log(`\n🎉 Thumbnail migration completed. Migrated ${migratedCount} thumbnails.\n`);
        return migratedCount;
      }
      
      console.log('ℹ️  No thumbnails directory found to migrate.\n');
      return 0;
    } catch (error) {
      console.error(`❌ Thumbnail migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate SEO data from old structure to new organized structure
   */
  async migrateSEOData() {
    console.log('🔄 Migrating SEO data to organized structure...\n');
    
    try {
      // Define source directory for existing SEO data
      const sourceSEODir = path.join(__dirname, '../data/seo');
      const targetSEODir = this.pathService.getSEOPath();
      
      if (fs.existsSync(sourceSEODir)) {
        const files = fs.readdirSync(sourceSEODir);
        let migratedCount = 0;
        
        // Ensure target directory exists
        if (!fs.existsSync(targetSEODir)) {
          fs.mkdirSync(targetSEODir, { recursive: true });
        }
        
        for (const file of files) {
          const sourcePath = path.join(sourceSEODir, file);
          const targetPath = path.join(targetSEODir, file);
          
          try {
            // Copy file to new location
            fs.copyFileSync(sourcePath, targetPath);
            
            this.migrationLog.push({
              type: 'seo',
              source: sourcePath,
              target: targetPath,
              timestamp: new Date().toISOString(),
              status: 'success'
            });
            
            migratedCount++;
            console.log(`✅ Migrated SEO data: ${file}`);
          } catch (error) {
            this.migrationLog.push({
              type: 'seo',
              source: sourcePath,
              target: targetPath,
              error: error.message,
              timestamp: new Date().toISOString(),
              status: 'error'
            });
            
            console.error(`❌ Failed to migrate SEO data ${file}: ${error.message}`);
          }
        }
        
        console.log(`\n🎉 SEO data migration completed. Migrated ${migratedCount} files.\n`);
        return migratedCount;
      }
      
      console.log('ℹ️  No SEO data directory found to migrate.\n');
      return 0;
    } catch (error) {
      console.error(`❌ SEO data migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate monetization data (highest priority per user requirements)
   */
  async migrateMonetizationData() {
    console.log('🔄 Migrating monetization data to organized structure...\n');
    
    try {
      // Define source directory for existing monetization data
      const sourceMonetizationDir = path.join(__dirname, '../data/monetization');
      const targetMonetizationDir = this.pathService.getMonetizationPath();
      
      if (fs.existsSync(sourceMonetizationDir)) {
        const files = fs.readdirSync(sourceMonetizationDir);
        let migratedCount = 0;
        
        // Ensure target directory exists
        if (!fs.existsSync(targetMonetizationDir)) {
          fs.mkdirSync(targetMonetizationDir, { recursive: true });
        }
        
        for (const file of files) {
          const sourcePath = path.join(sourceMonetizationDir, file);
          const targetPath = path.join(targetMonetizationDir, file);
          
          try {
            // Copy file to new location
            fs.copyFileSync(sourcePath, targetPath);
            
            this.migrationLog.push({
              type: 'monetization',
              source: sourcePath,
              target: targetPath,
              timestamp: new Date().toISOString(),
              status: 'success'
            });
            
            migratedCount++;
            console.log(`✅ Migrated monetization data: ${file}`);
          } catch (error) {
            this.migrationLog.push({
              type: 'monetization',
              source: sourcePath,
              target: targetPath,
              error: error.message,
              timestamp: new Date().toISOString(),
              status: 'error'
            });
            
            console.error(`❌ Failed to migrate monetization data ${file}: ${error.message}`);
          }
        }
        
        console.log(`\n🎉 Monetization data migration completed. Migrated ${migratedCount} files.\n`);
        return migratedCount;
      }
      
      console.log('ℹ️  No monetization data directory found to migrate.\n');
      return 0;
    } catch (error) {
      console.error(`❌ Monetization data migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate migration report
   */
  generateMigrationReport() {
    console.log('📊 Generating migration report...\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalMigrated: this.migrationLog.length,
      successCount: this.migrationLog.filter(item => item.status === 'success').length,
      errorCount: this.migrationLog.filter(item => item.status === 'error').length,
      details: this.migrationLog
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, '../data/logs/migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Migration report saved to: ${reportPath}`);
    
    console.log('\n📈 Migration Summary:');
    console.log(`Total Items: ${report.totalMigrated}`);
    console.log(`Successful: ${report.successCount}`);
    console.log(`Errors: ${report.errorCount}`);
    
    return report;
  }

  /**
   * Run complete migration process
   */
  async runCompleteMigration() {
    console.log('🚀 Starting complete content migration...\n');
    
    try {
      // Run migrations in priority order
      // 1. Monetization data (highest priority per user requirements)
      await this.migrateMonetizationData();
      
      // 2. Scripts
      await this.migrateScripts();
      
      // 3. Templates
      await this.migrateTemplates();
      
      // 4. Thumbnails
      await this.migrateThumbnails();
      
      // 5. SEO data
      await this.migrateSEOData();
      
      // Generate final report
      const report = this.generateMigrationReport();
      
      console.log('\n🎉 Complete content migration finished!');
      return report;
    } catch (error) {
      console.error(`❌ Complete migration failed: ${error.message}`);
      throw error;
    }
  }
}

// Run the migration tool if this script is executed directly
async function runMigrationTool() {
  console.log('🔧 Content Migration Tool\n');
  
  const migrationTool = new ContentMigrationTool();
  
  try {
    await migrationTool.runCompleteMigration();
  } catch (error) {
    console.error('_migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrationTool();
}

module.exports = { ContentMigrationTool, runMigrationTool };