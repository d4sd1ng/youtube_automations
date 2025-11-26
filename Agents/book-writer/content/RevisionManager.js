const fs = require('fs');
const path = require('path');

/**
 * Revision Manager for Book Writer Agent
 * Manages the revision process and tracks changes to book content
 */
class RevisionManager {
  constructor(config = {}) {
    this.config = {
      maxRevisions: 5,
      autoSaveRevisions: true,
      ...config
    };

    this.revisionsDir = path.join(__dirname, '../../../data/content/revisions');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.revisionsDir)) {
      fs.mkdirSync(this.revisionsDir, { recursive: true });
    }
  }

  /**
   * Handle revision process for book content
   * @param {Object} content - The content to revise
   * @param {Object} feedback - Feedback for revision
   * @param {Object} revisionConfig - Configuration for revision
   * @returns {Promise<Object>} Revised content with revision history
   */
  async handleRevision(content, feedback, revisionConfig = {}) {
    console.log(`🔄 Handling revision for content: ${content.title || 'Untitled'}`);

    // Create revision record
    const revisionRecord = await this.createRevisionRecord(content, feedback, revisionConfig);

    // Apply revisions
    const revisedContent = await this.applyRevisions(content, feedback, revisionConfig);

    // Assess quality after revision
    const qualityScore = await this.assessQualityAfterRevision(revisedContent, content, feedback);

    // Update revision record
    revisionRecord.revisedContent = revisedContent;
    revisionRecord.qualityScore = qualityScore;
    revisionRecord.revisionCompletedAt = new Date().toISOString();

    // Save revision
    await this.saveRevision(revisionRecord);

    // Compile revision result
    const revisionResult = {
      originalContent: content,
      revisedContent: revisedContent,
      revisionRecord: revisionRecord,
      qualityScore: qualityScore,
      approved: qualityScore >= 0.8, // 80% quality threshold
      revisionCompletedAt: new Date().toISOString()
    };

    console.log(`✅ Revision handled with quality score: ${qualityScore.toFixed(2)}`);
    return revisionResult;
  }

  /**
   * Create revision record
   */
  async createRevisionRecord(content, feedback, revisionConfig) {
    const revisionRecord = {
      id: this.generateRevisionId(),
      contentId: content.id || this.generateContentId(content),
      title: content.title || 'Untitled',
      feedback: feedback,
      revisionConfig: revisionConfig,
      revisionNumber: await this.getNextRevisionNumber(content),
      changesRequested: this.extractChangesFromFeedback(feedback),
      revisionStartedAt: new Date().toISOString(),
      author: revisionConfig.author || 'Book Writer Agent'
    };

    console.log(`📝 Revision record created: ${revisionRecord.id}`);
    return revisionRecord;
  }

  /**
   * Apply revisions to content
   */
  async applyRevisions(content, feedback, revisionConfig) {
    console.log(`🔧 Applying revisions to content: ${content.title || 'Untitled'}`);

    // Simulate revision process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real implementation, this would use AI to apply specific revisions
    // For now, we'll simulate the process

    let revisedContent = { ...content };

    // Apply structural changes
    if (feedback.structured) {
      revisedContent = this.applyStructuralRevisions(revisedContent, feedback.structured);
    }

    // Apply content changes
    if (feedback.content) {
      revisedContent = this.applyContentRevisions(revisedContent, feedback.content);
    }

    // Apply style changes
    if (feedback.style) {
      revisedContent = this.applyStyleRevisions(revisedContent, feedback.style);
    }

    // Apply technical changes
    if (feedback.technical) {
      revisedContent = this.applyTechnicalRevisions(revisedContent, feedback.technical);
    }

    console.log(`✅ Revisions applied to content: ${content.title || 'Untitled'}`);
    return revisedContent;
  }

  /**
   * Apply structural revisions
   */
  applyStructuralRevisions(content, structuralFeedback) {
    let revisedContent = { ...content };

    // Add missing sections
    if (structuralFeedback.missingSections) {
      structuralFeedback.missingSections.forEach(section => {
        if (!revisedContent.sections) revisedContent.sections = [];
        revisedContent.sections.push({
          title: section,
          content: `[Content for ${section} to be added]`
        });
      });
    }

    // Reorganize sections
    if (structuralFeedback.reorganizeSections) {
      // This would implement section reorganization logic
      console.log('🔄 Reorganizing sections based on feedback');
    }

    // Adjust section length
    if (structuralFeedback.sectionLength) {
      // This would implement section length adjustments
      console.log('📏 Adjusting section lengths based on feedback');
    }

    return revisedContent;
  }

  /**
   * Apply content revisions
   */
  applyContentRevisions(content, contentFeedback) {
    let revisedContent = { ...content };

    // Expand content
    if (contentFeedback.expandContent) {
      revisedContent.body = revisedContent.body + '\\n\\n[Additional content added based on feedback]';
    }

    // Clarify content
    if (contentFeedback.clarifyPoints) {
      contentFeedback.clarifyPoints.forEach(point => {
        // This would implement point clarification logic
        console.log(`💡 Clarifying point: ${point}`);
      });
    }

    // Add examples
    if (contentFeedback.addExamples) {
      revisedContent.body = revisedContent.body + '\\n\\n[Examples added based on feedback]';
    }

    // Remove redundant content
    if (contentFeedback.removeRedundant) {
      // This would implement redundant content removal
      console.log('✂️ Removing redundant content based on feedback');
    }

    return revisedContent;
  }

  /**
   * Apply style revisions
   */
  applyStyleRevisions(content, styleFeedback) {
    let revisedContent = { ...content };

    // Adjust tone
    if (styleFeedback.tone) {
      // This would implement tone adjustment logic
      console.log(`🎭 Adjusting tone to: ${styleFeedback.tone}`);
    }

    // Improve flow
    if (styleFeedback.flow) {
      // This would implement flow improvement logic
      console.log('🌊 Improving content flow based on feedback');
    }

    // Adjust language level
    if (styleFeedback.languageLevel) {
      // This would implement language level adjustment
      console.log(`🎓 Adjusting language level to: ${styleFeedback.languageLevel}`);
    }

    return revisedContent;
  }

  /**
   * Apply technical revisions
   */
  applyTechnicalRevisions(content, technicalFeedback) {
    let revisedContent = { ...content };

    // Correct facts
    if (technicalFeedback.correctFacts) {
      technicalFeedback.correctFacts.forEach(correction => {
        // This would implement fact correction logic
        console.log(`✅ Correcting fact: ${correction.original} -> ${correction.corrected}`);
      });
    }

    // Update references
    if (technicalFeedback.updateReferences) {
      // This would implement reference update logic
      console.log('📚 Updating references based on feedback');
    }

    // Add citations
    if (technicalFeedback.addCitations) {
      revisedContent.body = revisedContent.body + '\\n\\n[Citations added based on feedback]';
    }

    return revisedContent;
  }

  /**
   * Assess quality after revision
   */
  async assessQualityAfterRevision(revisedContent, originalContent, feedback) {
    console.log(`🔍 Assessing quality after revision`);

    // Simulate quality assessment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate improvement metrics
    const originalScore = originalContent.qualityScore || 0.5;
    const feedbackComplexity = this.calculateFeedbackComplexity(feedback);
    const revisionEffort = this.calculateRevisionEffort(feedback);

    // Estimate quality improvement
    const improvementFactor = Math.min(1, 0.2 + (feedbackComplexity * 0.3) + (revisionEffort * 0.5));
    const revisedScore = Math.min(1, originalScore + improvementFactor);

    console.log(`✅ Quality assessed after revision (Score: ${revisedScore.toFixed(2)})`);
    return revisedScore;
  }

  /**
   * Calculate feedback complexity
   */
  calculateFeedbackComplexity(feedback) {
    let complexity = 0;

    if (feedback.structured) complexity += 0.2;
    if (feedback.content) complexity += 0.3;
    if (feedback.style) complexity += 0.2;
    if (feedback.technical) complexity += 0.3;

    // Count feedback items
    const totalItems = Object.keys(feedback).length;
    complexity *= Math.min(1, totalItems / 10); // Normalize by number of items

    return complexity;
  }

  /**
   * Calculate revision effort
   */
  calculateRevisionEffort(feedback) {
    let effort = 0;

    // Count major revision items
    if (feedback.structured && feedback.structured.missingSections) {
      effort += feedback.structured.missingSections.length * 0.1;
    }

    if (feedback.content) {
      if (feedback.content.expandContent) effort += 0.2;
      if (feedback.content.addExamples) effort += 0.1;
    }

    if (feedback.technical) {
      if (feedback.technical.correctFacts) {
        effort += feedback.technical.correctFacts.length * 0.15;
      }
    }

    return Math.min(1, effort);
  }

  /**
   * Extract changes from feedback
   */
  extractChangesFromFeedback(feedback) {
    const changes = [];

    if (feedback.structured) {
      if (feedback.structured.missingSections) {
        changes.push(`Add sections: ${feedback.structured.missingSections.join(', ')}`);
      }
    }

    if (feedback.content) {
      if (feedback.content.expandContent) changes.push('Expand content');
      if (feedback.content.addExamples) changes.push('Add examples');
    }

    if (feedback.style) {
      if (feedback.style.tone) changes.push(`Adjust tone to ${feedback.style.tone}`);
    }

    if (feedback.technical) {
      if (feedback.technical.correctFacts) {
        changes.push(`Correct ${feedback.technical.correctFacts.length} facts`);
      }
    }

    return changes;
  }

  /**
   * Get next revision number
   */
  async getNextRevisionNumber(content) {
    try {
      const contentId = content.id || this.generateContentId(content);
      const revisionFiles = fs.readdirSync(this.revisionsDir)
        .filter(f => f.startsWith(`revision-${contentId}-`) && f.endsWith('.json'))
        .map(f => {
          const match = f.match(/revision-${contentId}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => b - a);

      return revisionFiles.length > 0 ? revisionFiles[0] + 1 : 1;
    } catch (error) {
      console.warn(`⚠️ Failed to get next revision number: ${error.message}`);
      return 1;
    }
  }

  /**
   * Save revision
   */
  async saveRevision(revisionRecord) {
    try {
      const filename = `revision-${revisionRecord.contentId}-${revisionRecord.revisionNumber}-${revisionRecord.id}.json`;
      const filepath = path.join(this.revisionsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(revisionRecord, null, 2));
      console.log(`💾 Revision saved: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error(`❌ Failed to save revision: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load revision
   */
  async loadRevision(contentId, revisionNumber) {
    try {
      const files = fs.readdirSync(this.revisionsDir)
        .filter(f => f.startsWith(`revision-${contentId}-${revisionNumber}-`) && f.endsWith('.json'));

      if (files.length > 0) {
        const filepath = path.join(this.revisionsDir, files[0]);
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to load revision: ${error.message}`);
      return null;
    }
  }

  /**
   * Get revision history
   */
  async getRevisionHistory(contentId) {
    try {
      const files = fs.readdirSync(this.revisionsDir)
        .filter(f => f.startsWith(`revision-${contentId}-`) && f.endsWith('.json'))
        .sort();

      const history = [];
      for (const file of files) {
        try {
          const filepath = path.join(this.revisionsDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const revision = JSON.parse(content);
          history.push({
            id: revision.id,
            revisionNumber: revision.revisionNumber,
            title: revision.title,
            changesRequested: revision.changesRequested,
            qualityScore: revision.qualityScore,
            createdAt: revision.revisionStartedAt
          });
        } catch (error) {
          console.warn(`⚠️ Failed to load revision file ${file}: ${error.message}`);
        }
      }

      return history;
    } catch (error) {
      console.error(`❌ Failed to get revision history: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate revision ID
   */
  generateRevisionId() {
    return 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate content ID
   */
  generateContentId(content) {
    if (content.id) return content.id;

    // Generate ID based on content title
    const title = content.title || 'untitled';
    return title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + Date.now();
  }

  /**
   * Get revision summary
   */
  async getRevisionSummary(contentId) {
    try {
      const history = await this.getRevisionHistory(contentId);

      if (history.length > 0) {
        const latest = history[history.length - 1];
        return {
          contentId: contentId,
          revisionCount: history.length,
          latestRevision: latest.revisionNumber,
          latestQualityScore: latest.qualityScore,
          lastRevised: latest.createdAt
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get revision summary: ${error.message}`);
      return null;
    }
  }
}

module.exports = RevisionManager;