const fs = require('fs');
const path = require('path');

/**
 * Multi-Input Service
 * Handles processing of multiple input sources
 */
class MultiInputService {
  constructor() {
    this.inputsDir = path.join(__dirname, '../../data/inputs');
    this.processedDir = path.join(this.inputsDir, 'processed');
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.inputsDir, this.processedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process multiple inputs
   */
  async processMultiInput(contentId, inputData, options = {}) {
    try {
      console.log(`🔄 Processing multi-input for content: ${contentId}`);

      // Combine all input sources
      const combinedData = this.combineInputSources(inputData);

      // Analyze content structure
      const analysis = this.analyzeContentStructure(combinedData);

      // Extract key information
      const keyInfo = this.extractKeyInformation(combinedData, analysis);

      // Generate metadata
      const metadata = {
        contentId,
        sources: inputData.sources || [],
        wordCount: combinedData.text.length,
        keyThemes: keyInfo.themes,
        keyPoints: keyInfo.points,
        sentiment: keyInfo.sentiment,
        language: keyInfo.language,
        processingOptions: options,
        processedAt: new Date().toISOString()
      };

      // Save processed input
      this.saveProcessedInput(contentId, combinedData, metadata);

      console.log(`✅ Multi-input processing completed for: ${contentId}`);

      return {
        contentId,
        combinedData,
        metadata,
        analysis,
        keyInfo
      };
    } catch (error) {
      console.error('❌ Multi-input processing failed:', error);
      throw error;
    }
  }

  /**
   * Combine multiple input sources into a single data structure
   */
  combineInputSources(inputData) {
    // Mock implementation - in a real service, this would handle various input types
    const text = inputData.text || '';
    const urls = inputData.urls || [];
    const files = inputData.files || [];

    return {
      text,
      urls,
      files,
      combinedText: text + urls.join(' ') + files.join(' ')
    };
  }

  /**
   * Analyze content structure
   */
  analyzeContentStructure(combinedData) {
    // Mock implementation - in a real service, this would perform detailed analysis
    const text = combinedData.combinedText;
    const wordCount = text.split(' ').length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const paragraphCount = text.split('\n\n').length;

    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      averageWordsPerSentence: Math.round(wordCount / sentenceCount),
      averageSentencesPerParagraph: Math.round(sentenceCount / paragraphCount)
    };
  }

  /**
   * Extract key information from content
   */
  extractKeyInformation(combinedData, analysis) {
    // Mock implementation - in a real service, this would use NLP techniques
    const text = combinedData.combinedText.toLowerCase();

    // Simple theme detection (mock)
    const themes = [];
    if (text.includes('ai') || text.includes('artificial intelligence')) themes.push('AI');
    if (text.includes('blockchain')) themes.push('Blockchain');
    if (text.includes('machine learning')) themes.push('Machine Learning');
    if (text.includes('data')) themes.push('Data Science');

    // Simple point extraction (mock)
    const points = text.split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 10)
      .slice(0, 5)
      .map(sentence => sentence.trim());

    return {
      themes: themes.length > 0 ? themes : ['General'],
      points: points.length > 0 ? points : ['No key points identified'],
      sentiment: 'neutral', // Would be determined by NLP in a real implementation
      language: 'en' // Would be detected in a real implementation
    };
  }

  /**
   * Save processed input to file
   */
  saveProcessedInput(contentId, combinedData, metadata) {
    try {
      const filePath = path.join(this.processedDir, `${contentId}.json`);
      const data = {
        contentId,
        combinedData,
        metadata
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Processed input saved: ${contentId}`);
    } catch (error) {
      console.error('❌ Failed to save processed input:', error);
    }
  }

  /**
   * Load processed input from file
   */
  loadProcessedInput(contentId) {
    try {
      const filePath = path.join(this.processedDir, `${contentId}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load processed input:', error);
      return null;
    }
  }
}

module.exports = MultiInputService;