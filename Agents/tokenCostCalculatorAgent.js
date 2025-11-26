const tokenMonitor = require('./tokenMonitor');

class TokenCostCalculator {
  constructor() {
    // Notification systems
    this.notificationChannels = {
      discord: process.env.DISCORD_WEBHOOK || null,
      telegram: process.env.TELEGRAM_BOT_TOKEN || null,
      webhook: process.env.WEBHOOK_URL || null,
      slack: process.env.SLACK_WEBHOOK || null
    };

    // Token costs per 1K tokens (in USD) - Updated as of 2024
    this.providerCosts = {
      openai: {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
        'whisper-1': { audio: 0.006 } // per minute
      },
      anthropic: {
        'claude-3-opus': { input: 0.015, output: 0.075 },
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 }
      },
      gemini: {
        'gemini-pro': { input: 0.00025, output: 0.0005 },
        'gemini-ultra': { input: 0.002, output: 0.006 }
      },
      ollama: {
        'llama2:7b': { input: 0, output: 0 }, // Local, no cost
        'codellama:7b': { input: 0, output: 0 },
        'mistral:7b': { input: 0, output: 0 }
      }
    };

    // Estimated token usage per content type and workflow step
    this.contentTypeEstimates = {
      // Politik Content
      political_content: {
        research: { input: 500, output: 1500, aiRequired: true },
        outline: { input: 800, output: 1200, aiRequired: true },
        script_generation: { input: 1200, output: 3000, aiRequired: true },
        fact_checking: { input: 2000, output: 800, aiRequired: true },
        tone_adjustment: { input: 1500, output: 1500, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false },
        thumbnail: { input: 300, output: 100, aiRequired: true },
        description: { input: 600, output: 400, aiRequired: true },
        tags: { input: 200, output: 150, aiRequired: true }
      },

      // AI Content
      ai_content: {
        research: { input: 600, output: 2000, aiRequired: true },
        technical_analysis: { input: 1000, output: 2500, aiRequired: true },
        script_generation: { input: 1500, output: 4000, aiRequired: true },
        code_examples: { input: 800, output: 1500, aiRequired: true },
        explanation: { input: 1200, output: 2000, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false },
        thumbnail: { input: 400, output: 150, aiRequired: true },
        description: { input: 700, output: 500, aiRequired: true },
        tags: { input: 250, output: 200, aiRequired: true }
      },

      // Viral Shorts
      viral_shorts: {
        trend_analysis: { input: 400, output: 800, aiRequired: true },
        hook_generation: { input: 300, output: 600, aiRequired: true },
        script_generation: { input: 500, output: 800, aiRequired: true },
        viral_optimization: { input: 600, output: 400, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false },
        thumbnail: { input: 200, output: 100, aiRequired: true },
        description: { input: 300, output: 200, aiRequired: true },
        hashtags: { input: 150, output: 100, aiRequired: true }
      },

      // Educational Content
      educational: {
        curriculum_planning: { input: 800, output: 1500, aiRequired: true },
        content_structuring: { input: 1000, output: 2000, aiRequired: true },
        script_generation: { input: 1500, output: 3500, aiRequired: true },
        examples_generation: { input: 700, output: 1200, aiRequired: true },
        quiz_creation: { input: 500, output: 800, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false },
        thumbnail: { input: 350, output: 120, aiRequired: true },
        description: { input: 600, output: 400, aiRequired: true },
        tags: { input: 200, output: 150, aiRequired: true }
      },

      // Audio Analysis
      audio_analysis: {
        transcription: { input: 0, output: 0, aiRequired: false, audioMinutes: 1 }, // Whisper cost
        text_analysis: { input: 2000, output: 1500, aiRequired: true },
        key_points: { input: 1500, output: 1000, aiRequired: true },
        summarization: { input: 1200, output: 800, aiRequired: true },
        categorization: { input: 800, output: 500, aiRequired: true },
        action_items: { input: 600, output: 400, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false }
      },

      // Multi-Media Analysis
      multimedia_analysis: {
        image_ocr: { input: 0, output: 500, aiRequired: false },
        image_analysis: { input: 1000, output: 800, aiRequired: true },
        video_analysis: { input: 1500, output: 1200, aiRequired: true },
        content_extraction: { input: 800, output: 1000, aiRequired: true },
        cross_media_synthesis: { input: 2000, output: 1500, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false }
      },

      // Book Writing
      book_writing: {
        research: { input: 2000, output: 3000, aiRequired: true },
        outline: { input: 1500, output: 2000, aiRequired: true },
        chapter_generation: { input: 3000, output: 8000, aiRequired: true },
        editing: { input: 5000, output: 4000, aiRequired: true },
        formatting: { input: 1000, output: 2000, aiRequired: true },
        cover_design: { input: 500, output: 300, aiRequired: true },
        verification: { input: 0, output: 0, aiRequired: false }
      }
    };

    this.initializeNotificationSystems();
  }

  /**
   * Initialize notification systems
   */
  initializeNotificationSystems() {
    console.log('🔔 Initializing notification systems...');
    this.notificationSystems = {
      discord: !!this.notificationChannels.discord,
      telegram: !!this.notificationChannels.telegram,
      webhook: !!this.notificationChannels.webhook,
      slack: !!this.notificationChannels.slack
    };
    console.log('✅ Notification systems initialized');
  }

  /**
   * Send notification
   */
  async sendNotification(message, level = 'info') {
    // In a real implementation, this would send notifications through various channels
    console.log(`[${level.toUpperCase()}] ${message}`);

    // Discord notification
    if (this.notificationSystems.discord && this.notificationChannels.discord) {
      console.log(`📤 Discord notification: ${message}`);
    }

    // Telegram notification
    if (this.notificationSystems.telegram && this.notificationChannels.telegram) {
      console.log(`📤 Telegram notification: ${message}`);
    }

    // Webhook notification
    if (this.notificationSystems.webhook && this.notificationChannels.webhook) {
      console.log(`📤 Webhook notification: ${message}`);
    }

    // Slack notification
    if (this.notificationSystems.slack && this.notificationChannels.slack) {
      console.log(`📤 Slack notification: ${message}`);
    }
  }

  /**
   * Calculate estimated cost for a content type
   * @param {string} contentType - Type of content
   * @param {string} provider - LLM provider
   * @param {string} model - Model name
   * @param {object} options - Additional options
   * @returns {object} - Cost breakdown
   */
  calculateEstimatedCost(contentType, provider = 'ollama', model = 'llama2:7b', options = {}) {
    const estimates = this.contentTypeEstimates[contentType];
    if (!estimates) {
      throw new Error(`Unknown content type: ${contentType}`);
    }

    const modelCosts = this.providerCosts[provider] && this.providerCosts[provider][model];
    if (!modelCosts) {
      throw new Error(`Unknown provider/model: ${provider}/${model}`);
    }

    const breakdown = {};
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalInputCost = 0;
    let totalOutputCost = 0;
    let totalAudioMinutes = 0;
    let totalAudioCost = 0;

    // Calculate cost for each step
    Object.entries(estimates).forEach(([step, estimate]) => {
      const stepCost = {
        step,
        aiRequired: estimate.aiRequired,
        inputTokens: estimate.input || 0,
        outputTokens: estimate.output || 0,
        audioMinutes: estimate.audioMinutes || 0,
        inputCost: 0,
        outputCost: 0,
        audioCost: 0,
        totalCost: 0
      };

      if (estimate.aiRequired) {
        // Calculate token costs
        if (modelCosts && modelCosts.input && modelCosts.output) {
          stepCost.inputCost = (estimate.input / 1000) * modelCosts.input;
          stepCost.outputCost = (estimate.output / 1000) * modelCosts.output;
          totalInputTokens += estimate.input;
          totalOutputTokens += estimate.output;
          totalInputCost += stepCost.inputCost;
          totalOutputCost += stepCost.outputCost;
        }
      }

      // Calculate audio costs (for Whisper)
      if (estimate.audioMinutes && modelCosts && modelCosts.audio) {
        const audioMinutes = options.audioDuration || estimate.audioMinutes;
        stepCost.audioCost = audioMinutes * modelCosts.audio;
        totalAudioMinutes += audioMinutes;
        totalAudioCost += stepCost.audioCost;
      }

      stepCost.totalCost = stepCost.inputCost + stepCost.outputCost + stepCost.audioCost;
      breakdown[step] = stepCost;
    });

    const totalCost = totalInputCost + totalOutputCost + totalAudioCost;

    return {
      contentType,
      provider,
      model,
      summary: {
        totalSteps: Object.keys(estimates).length,
        aiRequiredSteps: Object.values(estimates).filter(e => e.aiRequired).length,
        totalInputTokens,
        totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        totalAudioMinutes,
        totalInputCost: Math.round(totalInputCost * 10000) / 10000,
        totalOutputCost: Math.round(totalOutputCost * 10000) / 10000,
        totalAudioCost: Math.round(totalAudioCost * 10000) / 10000,
        totalCost: Math.round(totalCost * 10000) / 10000
      },
      breakdown,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate actual cost from token usage data
   * @param {Array} usageData - Array of token usage records
   * @returns {object} - Actual cost breakdown
   */
  calculateActualCost(usageData) {
    const costByProvider = {};
    let totalCost = 0;

    usageData.forEach(record => {
      const { provider, model, inputTokens, outputTokens, audioMinutes } = record;

      if (!costByProvider[provider]) {
        costByProvider[provider] = {};
      }

      if (!costByProvider[provider][model]) {
        costByProvider[provider][model] = {
          inputTokens: 0,
          outputTokens: 0,
          audioMinutes: 0,
          inputCost: 0,
          outputCost: 0,
          audioCost: 0,
          totalCost: 0,
          requests: 0
        };
      }

      const modelData = costByProvider[provider][model];
      const modelCosts = this.providerCosts[provider] && this.providerCosts[provider][model] || {};

      // Accumulate usage
      modelData.inputTokens += inputTokens || 0;
      modelData.outputTokens += outputTokens || 0;
      modelData.audioMinutes += audioMinutes || 0;
      modelData.requests += 1;

      // Calculate costs
      if (modelCosts.input && inputTokens) {
        modelData.inputCost += (inputTokens / 1000) * modelCosts.input;
      }
      if (modelCosts.output && outputTokens) {
        modelData.outputCost += (outputTokens / 1000) * modelCosts.output;
      }
      if (modelCosts.audio && audioMinutes) {
        modelData.audioCost += audioMinutes * modelCosts.audio;
      }

      modelData.totalCost = modelData.inputCost + modelData.outputCost + modelData.audioCost;
      totalCost += modelData.inputCost + modelData.outputCost + modelData.audioCost;
    });

    return {
      totalCost: Math.round(totalCost * 10000) / 10000,
      breakdown: costByProvider,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get cost comparison between different providers for same content
   * @param {string} contentType - Type of content
   * @param {object} options - Additional options
   * @returns {object} - Provider cost comparison
   */
  getProviderComparison(contentType, options = {}) {
    const comparisons = {};

    // Compare major providers
    const providersToCompare = [
      { provider: 'ollama', model: 'llama2:7b' },
      { provider: 'openai', model: 'gpt-3.5-turbo' },
      { provider: 'openai', model: 'gpt-4-turbo' },
      { provider: 'anthropic', model: 'claude-3-haiku' },
      { provider: 'anthropic', model: 'claude-3-sonnet' },
      { provider: 'gemini', model: 'gemini-pro' }
    ];

    providersToCompare.forEach(({ provider, model }) => {
      try {
        const cost = this.calculateEstimatedCost(contentType, provider, model, options);
        comparisons[`${provider}/${model}`] = {
          totalCost: cost.summary.totalCost,
          totalTokens: cost.summary.totalTokens,
          costPerToken: cost.summary.totalTokens > 0 ?
            cost.summary.totalCost / cost.summary.totalTokens * 1000 : 0
        };
      } catch (error) {
        // Skip if provider/model not available
      }
    });

    // Sort by total cost
    const sorted = Object.entries(comparisons)
      .sort(([,a], [,b]) => a.totalCost - b.totalCost)
      .reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});

    return {
      contentType,
      options,
      comparison: sorted,
      cheapest: Object.keys(sorted)[0],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get monthly cost projection based on usage patterns
   * @param {string} contentType - Type of content
   * @param {number} videosPerWeek - Number of videos per week
   * @param {string} provider - LLM provider
   * @param {string} model - Model name
   * @returns {object} - Monthly projection
   */
  getMonthlyProjection(contentType, videosPerWeek, provider = 'ollama', model = 'llama2:7b') {
    const costPerVideo = this.calculateEstimatedCost(contentType, provider, model);
    const videosPerMonth = videosPerWeek * 4.33; // Average weeks per month

    return {
      contentType,
      provider,
      model,
      videosPerWeek,
      videosPerMonth: Math.round(videosPerMonth * 100) / 100,
      costPerVideo: costPerVideo.summary.totalCost,
      monthlyTotal: Math.round(costPerVideo.summary.totalCost * videosPerMonth * 100) / 100,
      breakdown: {
        inputTokensPerMonth: costPerVideo.summary.totalInputTokens * videosPerMonth,
        outputTokensPerMonth: costPerVideo.summary.totalOutputTokens * videosPerMonth,
        totalTokensPerMonth: costPerVideo.summary.totalTokens * videosPerMonth
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get available content types with descriptions
   * @returns {object} - Available content types
   */
  getAvailableContentTypes() {
    return {
      political_content: {
        description: 'Political analysis and commentary videos',
        steps: Object.keys(this.contentTypeEstimates.political_content).length,
        avgTokens: this.calculateEstimatedCost('political_content').summary.totalTokens
      },
      ai_content: {
        description: 'AI and technology focused content',
        steps: Object.keys(this.contentTypeEstimates.ai_content).length,
        avgTokens: this.calculateEstimatedCost('ai_content').summary.totalTokens
      },
      viral_shorts: {
        description: 'Short-form viral content',
        steps: Object.keys(this.contentTypeEstimates.viral_shorts).length,
        avgTokens: this.calculateEstimatedCost('viral_shorts').summary.totalTokens
      },
      educational: {
        description: 'Educational and instructional content',
        steps: Object.keys(this.contentTypeEstimates.educational).length,
        avgTokens: this.calculateEstimatedCost('educational').summary.totalTokens
      },
      audio_analysis: {
        description: 'Audio transcription and analysis',
        steps: Object.keys(this.contentTypeEstimates.audio_analysis).length,
        avgTokens: this.calculateEstimatedCost('audio_analysis').summary.totalTokens
      },
      multimedia_analysis: {
        description: 'Multi-media content analysis',
        steps: Object.keys(this.contentTypeEstimates.multimedia_analysis).length,
        avgTokens: this.calculateEstimatedCost('multimedia_analysis').summary.totalTokens
      },
      book_writing: {
        description: 'Book writing and publishing',
        steps: Object.keys(this.contentTypeEstimates.book_writing).length,
        avgTokens: this.calculateEstimatedCost('book_writing').summary.totalTokens
      }
    };
  }

  /**
   * Update provider costs (for dynamic pricing)
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @param {object} costs - New cost structure
   */
  updateProviderCosts(provider, model, costs) {
    if (!this.providerCosts[provider]) {
      this.providerCosts[provider] = {};
    }
    this.providerCosts[provider][model] = costs;
  }

  /**
   * Get current provider costs
   * @returns {object} - Current provider costs
   */
  getProviderCosts() {
    return this.providerCosts;
  }

  /**
   * Predict future costs based on usage trends
   * @param {Array} historicalData - Historical usage data
   * @param {number} monthsAhead - Months to predict ahead
   * @returns {object} - Cost predictions
   */
  predictFutureCosts(historicalData, monthsAhead = 3) {
    // Simple linear regression for cost prediction
    if (!historicalData || historicalData.length < 2) {
      return {
        prediction: 'Insufficient data for prediction',
        confidence: 0
      };
    }

    // Calculate trend
    const totalCosts = historicalData.map(data => data.totalCost);
    const months = historicalData.map((_, index) => index);

    // Simple linear regression calculation
    const n = months.length;
    const sumX = months.reduce((a, b) => a + b, 0);
    const sumY = totalCosts.reduce((a, b) => a + b, 0);
    const sumXY = months.map((x, i) => x * totalCosts[i]).reduce((a, b) => a + b, 0);
    const sumXX = months.map(x => x * x).reduce((a, b) => a + b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict future costs
    const predictions = [];
    const lastMonth = months[months.length - 1];

    for (let i = 1; i <= monthsAhead; i++) {
      const futureMonth = lastMonth + i;
      const predictedCost = slope * futureMonth + intercept;
      predictions.push({
        month: futureMonth,
        predictedCost: Math.max(0, Math.round(predictedCost * 100) / 100)
      });
    }

    // Calculate confidence (simplified)
    const avgCost = sumY / n;
    const variance = totalCosts.reduce((sum, cost) => sum + Math.pow(cost - avgCost, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(1, 1 - (stdDev / avgCost)));

    return {
      predictions,
      confidence: Math.round(confidence * 100) / 100,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      slope: Math.round(slope * 100) / 100
    };
  }

  /**
   * Get cost optimization recommendations
   * @param {string} contentType - Type of content
   * @param {string} currentProvider - Current provider
   * @param {string} currentModel - Current model
   * @returns {object} - Optimization recommendations
   */
  getOptimizationRecommendations(contentType, currentProvider = 'ollama', currentModel = 'llama2:7b') {
    const currentCost = this.calculateEstimatedCost(contentType, currentProvider, currentModel);
    const comparison = this.getProviderComparison(contentType);

    // Find cheaper alternatives
    const alternatives = Object.entries(comparison.comparison)
      .filter(([key]) => key !== `${currentProvider}/${currentModel}`)
      .slice(0, 3);

    // Calculate potential savings
    const cheapest = Object.entries(comparison.comparison)[0];
    const savings = cheapest ? currentCost.summary.totalCost - cheapest[1].totalCost : 0;

    return {
      currentCost: currentCost.summary.totalCost,
      cheapestAlternative: cheapest ? {
        provider: cheapest[0],
        cost: cheapest[1].totalCost,
        savings: Math.round(savings * 100) / 100,
        percentageSavings: Math.round((savings / currentCost.summary.totalCost) * 100)
      } : null,
      alternatives,
      recommendations: [
        savings > 0 ? `Switch to ${cheapest[0]} to save $${Math.round(savings * 100) / 100} per video` : 'Current provider is cost-effective',
        'Consider using local models (Ollama) for non-critical tasks',
        'Batch process similar content to reduce overhead'
      ]
    };
  }

  /**
   * Get statistics and service information
   * @returns {object} - Service statistics
   */
  getStats() {
    return {
      service: 'TokenCostCalculator',
      supportedProviders: Object.keys(this.providerCosts),
      supportedContentTypes: Object.keys(this.contentTypeEstimates),
      notificationSystems: this.notificationSystems,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TokenCostCalculator;