const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Script Generation Service
 * Generates video scripts using LLMs with advanced prompting
 */
class ScriptGenerationService {
  constructor(options = {}) {
    // Allow customization of directories
    this.scriptsDir = options.scriptsDir || path.join(__dirname, 'data/scripts');
    this.templatesDir = options.templatesDir || path.join(__dirname, 'data/templates/scripts');
    this.promptTemplatesDir = options.promptTemplatesDir || path.join(__dirname, 'data/prompt-templates');

    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.scriptsDir, this.templatesDir, this.promptTemplatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate video script using LLM with advanced prompting
   */
  async generateScript(scriptData) {
    try {
      console.log('📝 Generating video script with advanced prompting...');

      const {
        topic,
        contentType,
        targetLength,
        tone,
        audience,
        trendingKeywords = [],
        customInstructions = '',
        templateName = null,
        useChainOfThought = true,
        fewShotExamples = [],
        rolePlayContext = '',
        enableSelfReflection = true,
        sourceContent = ''
      } = scriptData;

      // Generate prompt using advanced template system
      let promptData;

      // In a standalone version, we'll create a simplified prompt
      promptData = {
        prompt: this.generateAdvancedScriptPrompt({
          topic,
          contentType,
          targetLength,
          tone,
          audience,
          trendingKeywords,
          customInstructions,
          templateName,
          useChainOfThought,
          fewShotExamples,
          rolePlayContext,
          enableSelfReflection
        }),
        metadata: {
          qualityScore: 85 // Simulated quality score
        }
      };

      console.log(`🤖 Sending prompt to LLM for "${topic}"`);

      // Simulate LLM service response
      const llmResponse = {
        content: this.generateSampleScriptContent(topic, contentType, tone, targetLength),
        model: 'gpt-4-turbo'
      };

      // Process and format the response
      const formattedScript = this.formatScriptResponse(llmResponse.content, contentType);

      // Assess script quality with enhanced metrics
      const qualityAssessment = this.assessScriptQuality(formattedScript, {
        contentType,
        targetLength,
        tone,
        audience,
        useChainOfThought,
        enableSelfReflection,
        qualityScore: promptData.metadata?.qualityScore || 0
      });

      // Save script
      const scriptId = uuidv4();
      const scriptMetadata = {
        scriptId,
        topic,
        contentType,
        targetLength,
        tone,
        audience,
        trendingKeywords,
        qualityAssessment,
        wordCount: this.countWords(formattedScript),
        estimatedReadingTime: this.estimateReadingTime(formattedScript),
        generatedAt: new Date().toISOString(),
        modelUsed: llmResponse.model,
        promptingTechniques: {
          useChainOfThought,
          fewShotExamples: fewShotExamples.length,
          rolePlayContext: rolePlayContext ? true : false,
          enableSelfReflection,
          advancedPrompting: useChainOfThought || enableSelfReflection
        },
        promptMetadata: promptData.metadata || {}
      };

      // Qualitätsschwellenprüfung
      if (qualityAssessment.overallScore < 58) {
        console.warn(`⚠️ Script quality below threshold (${qualityAssessment.overallScore}), consider regeneration`);
      }

      this.saveScript(scriptId, formattedScript, scriptMetadata);

      console.log(`✅ Script generated successfully: ${scriptId}`);

      return {
        scriptId,
        content: formattedScript,
        metadata: scriptMetadata
      };
    } catch (error) {
      console.error('❌ Failed to generate script:', error);
      throw error;
    }
  }

  /**
   * Generate scripts for multiple channels
   */
  async generateScriptsForChannels(channelsData) {
    try {
      console.log('📝 Generating scripts for multiple channels...');

      const results = {};

      for (const channel in channelsData) {
        const channelData = channelsData[channel];
        console.log(`📝 Generating script for channel: ${channel}`);

        const scriptData = {
          topic: channelData.topic || `${channel} Channel Introduction`,
          contentType: channelData.contentType || 'trailer',
          targetLength: channelData.targetLength || '45-60s',
          tone: channelData.tone || 'professional',
          audience: channelData.audience || 'target audience',
          trendingKeywords: channelData.trendingKeywords || [],
          customInstructions: channelData.customInstructions || '',
          channelName: channel,
          templateName: channelData.templateName || `${channel}-trailer-template`
        };

        const result = await this.generateScript(scriptData);
        results[channel] = result;
      }

      return {
        success: true,
        scripts: results,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to generate scripts for channels:', error);
      throw error;
    }
  }

  /**
   * Generate advanced script prompt
   */
  generateAdvancedScriptPrompt(options) {
    const {
      topic,
      contentType,
      targetLength,
      tone,
      audience,
      trendingKeywords = [],
      customInstructions = '',
      templateName = null,
      useChainOfThought = false,
      fewShotExamples = [],
      rolePlayContext = '',
      enableSelfReflection = false
    } = options;

    let prompt = `You are an expert video scriptwriter. Create a compelling ${contentType} script about "${topic}" with the following specifications:

Target Length: ${targetLength}
Tone: ${tone}
Audience: ${audience}`;

    if (trendingKeywords.length > 0) {
      prompt += `\nTrending Keywords: ${trendingKeywords.join(', ')}`;
    }

    if (customInstructions) {
      prompt += `\n\nSpecial Instructions:\n${customInstructions}`;
    }

    if (useChainOfThought) {
      prompt += `\n\nThink step by step about how to structure this script for maximum engagement.`;
    }

    if (rolePlayContext) {
      prompt += `\n\nRole Context: ${rolePlayContext}`;
    }

    if (enableSelfReflection) {
      prompt += `\n\nAfter writing, reflect on whether this script effectively addresses the topic and audience needs.`;
    }

    prompt += `\n\nPlease provide the script in a clear, engaging format.`;

    return prompt;
  }

  /**
   * Format script response
   */
  formatScriptResponse(content, contentType) {
    // Simple formatting - in a real implementation, this would be more sophisticated
    return content.trim();
  }

  /**
   * Assess script quality
   */
  assessScriptQuality(script, options) {
    const {
      contentType,
      targetLength,
      tone,
      audience,
      useChainOfThought,
      enableSelfReflection,
      qualityScore
    } = options;

    // Simple quality assessment - in a real implementation, this would analyze the content
    return {
      overallScore: qualityScore || 85,
      contentRelevance: 90,
      engagementPotential: 85,
      toneConsistency: 80,
      structureQuality: 88,
      keywordOptimization: trendingKeywords.length > 0 ? 75 : 60,
      technicalAspects: {
        chainOfThought: useChainOfThought ? 95 : 70,
        selfReflection: enableSelfReflection ? 90 : 65
      }
    };
  }

  /**
   * Save script to file
   */
  saveScript(scriptId, content, metadata) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${scriptId}.txt`);
      const metadataPath = path.join(this.scriptsDir, `${scriptId}-metadata.json`);

      fs.writeFileSync(scriptPath, content);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      console.log(`💾 Script saved: ${scriptId}`);
    } catch (error) {
      console.error('❌ Failed to save script:', error);
      throw error;
    }
  }

  /**
   * Load script from file
   */
  loadScript(scriptId) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${scriptId}.txt`);
      const metadataPath = path.join(this.scriptsDir, `${scriptId}-metadata.json`);

      if (!fs.existsSync(scriptPath) || !fs.existsSync(metadataPath)) {
        throw new Error(`Script ${scriptId} not found`);
      }

      const content = fs.readFileSync(scriptPath, 'utf8');
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      return {
        scriptId,
        content,
        metadata
      };
    } catch (error) {
      console.error('❌ Failed to load script:', error);
      throw error;
    }
  }

  /**
   * List all generated scripts
   */
  listScripts() {
    try {
      const scripts = [];
      const files = fs.readdirSync(this.scriptsDir);

      files.forEach(file => {
        if (file.endsWith('.txt') && !file.includes('-metadata')) {
          const scriptId = file.replace('.txt', '');
          scripts.push(scriptId);
        }
      });

      return scripts;
    } catch (error) {
      console.error('❌ Failed to list scripts:', error);
      throw error;
    }
  }

  /**
   * Delete script
   */
  deleteScript(scriptId) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${scriptId}.txt`);
      const metadataPath = path.join(this.scriptsDir, `${scriptId}-metadata.json`);

      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }

      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }

      console.log(`🗑️ Script deleted: ${scriptId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete script:', error);
      throw error;
    }
  }

  /**
   * Calculate max tokens based on target length
   */
  calculateMaxTokens(targetLength) {
    // Simplified calculation - in a real implementation, this would be more precise
    const lengthMap = {
      '15-30s': 1000,
      '30-45s': 1500,
      '45-60s': 2000,
      '1-2min': 3000,
      '2-3min': 4000,
      '3-5min': 6000,
      '5-10min': 10000
    };

    return lengthMap[targetLength] || 2000;
  }

  /**
   * Get temperature for tone
   */
  getTemperatureForTone(tone) {
    // Simplified mapping - in a real implementation, this would be more nuanced
    const toneMap = {
      'professional': 0.7,
      'casual': 0.8,
      'humorous': 0.9,
      'serious': 0.6,
      'educational': 0.7,
      'entertaining': 0.8
    };

    return toneMap[tone] || 0.7;
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Estimate reading time
   */
  estimateReadingTime(text) {
    const wordsPerMinute = 150; // Average speaking rate
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Generate sample script content (for standalone version)
   */
  generateSampleScriptContent(topic, contentType, tone, targetLength) {
    // This is a simplified version for the standalone module
    // In a real implementation, this would call an actual LLM service

    return `[INTRO]
Welcome to today's video about ${topic}.

[MAIN CONTENT]
In this ${contentType}, we'll explore the fascinating world of ${topic}.
Whether you're a beginner or expert, there's something here for everyone.

[KEY POINTS]
1. First important aspect of ${topic}
2. Second key element to consider
3. Final thoughts on the matter

[OUTRO]
Thanks for watching! Don't forget to like, subscribe, and hit the notification bell for more content on ${topic}.`;
  }
}

module.exports = ScriptGenerationService;