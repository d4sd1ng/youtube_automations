const connectionManager = require('./connectionManager');
const axios = require('axios');

class TokenMonitor {
  constructor() {
    this.tokenUsage = {
      daily: new Map(),
      monthly: new Map(),
      providers: new Map()
    };

    this.costTracking = {
      openai: {
        'gpt-3.5-turbo': { input: 0.001, output: 0.002 }, // per 1K tokens
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-4o': { input: 0.005, output: 0.015 },
        'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
      },
      anthropic: {
        'claude-3-sonnet': { input: 0.003, output: 0.015 },
        'claude-3-haiku': { input: 0.00025, output: 0.00125 },
        'claude-33-opus': { input: 0.015, output: 0.075 },
        'claude-3.5-sonnet': { input: 0.003, output: 0.015 }
      },
      ollama: {
        // Local models - no cost
        'llama2:7b': { input: 0, output: 0 },
        'codellama:7b': { input: 0, output: 0 },
        'mistral:7b': { input: 0, output: 0 },
        'mixtral:8x7b': { input: 0, output: 0 }
      }
    };

    this.budgetLimits = {
      daily: parseFloat(process.env.DAILY_TOKEN_BUDGET) || 50.0,   // $50 daily
      monthly: parseFloat(process.env.MONTHLY_TOKEN_BUDGET) || 1000.0, // $1000 monthly
      emergency_stop: parseFloat(process.env.EMERGENCY_BUDGET) || 100.0  // $100 emergency stop
    };

    this.alerting = {
      email: process.env.ALERT_EMAIL,
      webhook: process.env.ALERT_WEBHOOK,
      slack: process.env.SLACK_WEBHOOK,
      discord: process.env.DISCORD_WEBHOOK,
      telegram: process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
      sms: process.env.SMS_API_KEY && process.env.SMS_PHONE_NUMBER,
      thresholds: {
        warning: 0.8,   // 80% of budget
        critical: 0.95  // 95% of budget
      }
    };

    this.redisClient = null;
    this.isInitialized = false;

    // Prediction settings
    this.predictionWindow = 24; // hours
    this.predictionAccuracy = 0.9; // 90% confidence
  }

  async initialize() {
    try {
      this.redisClient = connectionManager.getRedisClient();
      await this.loadExistingUsage();
      this.startPeriodicTasks();
      this.isInitialized = true;
      console.log('📊 Token Monitor initialized');
    } catch (error) {
      console.error('❌ Token Monitor initialization failed:', error);
    }
  }

  /**
   * Track token usage for a request
   * @param {Object} usage - Usage details
   */
  async trackUsage(usage) {
    const {
      provider,
      model,
      inputTokens = 0,
      outputTokens = 0,
      totalTokens = inputTokens + outputTokens,
      requestId,
      endpoint,
      timestamp = new Date()
    } = usage;

    try {
      // Calculate cost
      const cost = this.calculateCost(provider, model, inputTokens, outputTokens);

      const usageRecord = {
        provider,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        requestId,
        endpoint,
        timestamp: timestamp.toISOString()
      };

      // Store in Redis for persistence
      await this.storeUsageRecord(usageRecord);

      // Update in-memory tracking
      this.updateInMemoryTracking(usageRecord);

      // Check budget limits
      await this.checkBudgetLimits();

      console.log(`📊 Token usage tracked: ${provider}/${model} - ${totalTokens} tokens ($${cost.toFixed(4)})`);

    } catch (error) {
      console.error('❌ Error tracking token usage:', error);
    }
  }

  /**
   * Calculate cost for token usage
   * @param {string} provider - LLM provider
   * @param {string} model - Model name
   * @param {number} inputTokens - Input tokens
   * @param {number} outputTokens - Output tokens
   * @returns {number} - Cost in USD
   */
  calculateCost(provider, model, inputTokens, outputTokens) {
    const pricing = this.costTracking[provider]?.[model];
    if (!pricing) {
      console.warn(`⚠️ No pricing info for ${provider}/${model}`);
      return 0;
    }

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Store usage record in Redis
   * @param {Object} record - Usage record
   */
  async storeUsageRecord(record) {
    if (!this.redisClient) return;

    const date = record.timestamp.split('T')[0]; // YYYY-MM-DD
    const month = date.substring(0, 7); // YYYY-MM

    // Store daily usage
    const dailyKey = `usage:daily:${date}`;
    await this.redisClient.lPush(dailyKey, JSON.stringify(record));
    await this.redisClient.expire(dailyKey, 30 * 24 * 3600); // 30 days

    // Store monthly summary
    const monthlyKey = `usage:monthly:${month}`;
    await this.redisClient.hIncrByFloat(monthlyKey, 'cost', record.cost);
    await this.redisClient.hIncrBy(monthlyKey, 'tokens', record.totalTokens);
    await this.redisClient.expire(monthlyKey, 365 * 24 * 3600); // 1 year
  }

  /**
   * Update in-memory tracking
   * @param {Object} record - Usage record
   */
  updateInMemoryTracking(record) {
    const date = record.timestamp.split('T')[0];
    const month = date.substring(0, 7);

    // Update daily tracking
    if (!this.tokenUsage.daily.has(date)) {
      this.tokenUsage.daily.set(date, { cost: 0, tokens: 0, requests: 0 });
    }
    const daily = this.tokenUsage.daily.get(date);
    daily.cost += record.cost;
    daily.tokens += record.totalTokens;
    daily.requests += 1;

    // Update monthly tracking
    if (!this.tokenUsage.monthly.has(month)) {
      this.tokenUsage.monthly.set(month, { cost: 0, tokens: 0, requests: 0 });
    }
    const monthly = this.tokenUsage.monthly.get(month);
    monthly.cost += record.cost;
    monthly.tokens += record.totalTokens;
    monthly.requests += 1;

    // Update provider tracking
    const providerKey = `${record.provider}:${record.model}`;
    if (!this.tokenUsage.providers.has(providerKey)) {
      this.tokenUsage.providers.set(providerKey, { cost: 0, tokens: 0, requests: 0 });
    }
    const provider = this.tokenUsage.providers.get(providerKey);
    provider.cost += record.cost;
    provider.tokens += record.totalTokens;
    provider.requests += 1;
  }

  /**
   * Check budget limits and send alerts
   */
  async checkBudgetLimits() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);

    const dailyUsage = this.tokenUsage.daily.get(today)?.cost || 0;
    const monthlyUsage = this.tokenUsage.monthly.get(thisMonth)?.cost || 0;

    // Check daily budget
    const dailyPercentage = dailyUsage / this.budgetLimits.daily;
    if (dailyPercentage >= this.alerting.thresholds.critical) {
      await this.sendAlert('CRITICAL', 'daily', dailyUsage, this.budgetLimits.daily);
    } else if (dailyPercentage >= this.alerting.thresholds.warning) {
      await this.sendAlert('WARNING', 'daily', dailyUsage, this.budgetLimits.daily);
    }

    // Check monthly budget
    const monthlyPercentage = monthlyUsage / this.budgetLimits.monthly;
    if (monthlyPercentage >= this.alerting.thresholds.critical) {
      await this.sendAlert('CRITICAL', 'monthly', monthlyUsage, this.budgetLimits.monthly);
    } else if (monthlyPercentage >= this.alerting.thresholds.warning) {
      await this.sendAlert('WARNING', 'monthly', monthlyUsage, this.budgetLimits.monthly);
    }

    // Emergency stop
    if (dailyUsage >= this.budgetLimits.emergency_stop) {
      await this.emergencyStop('Daily budget exceeded emergency threshold');
    }
  }

  /**
   * Send alert via Discord
   * @param {string} message - Alert message
   */
  async sendDiscordAlert(message) {
    if (!this.alerting.discord) return;

    try {
      await axios.post(this.alerting.discord, {
        content: message
      });
      console.log('✅ Discord alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Discord alert:', error.message);
    }
  }

  /**
   * Send alert via Telegram
   * @param {string} message - Alert message
   */
  async sendTelegramAlert(message) {
    if (!this.alerting.telegram) return;

    try {
      const [botToken, chatId] = this.alerting.telegram.split(':');
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: message
      });
      console.log('✅ Telegram alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Telegram alert:', error.message);
    }
  }

  /**
   * Send alert via SMS
   * @param {string} message - Alert message
   */
  async sendSMSAlert(message) {
    if (!this.alerting.sms) return;

    try {
      const [apiKey, phoneNumber] = this.alerting.sms.split(':');
      const url = `https://api.smsprovider.com/send`;
      await axios.post(url, {
        api_key: apiKey,
        to: phoneNumber,
        message: message
      });
      console.log('✅ SMS alert sent successfully');
    } catch (error) {
      console.error('❌ Failed to send SMS alert:', error.message);
    }
  }

  /**
   * Send budget alert through all configured channels
   * @param {string} level - Alert level (WARNING/CRITICAL)
   * @param {string} period - Period (daily/monthly)
   * @param {number} current - Current usage
   * @param {number} limit - Budget limit
   */
  async sendAlert(level, period, current, limit) {
    const percentage = ((current / limit) * 100).toFixed(1);
    const message = `🚨 ${level}: ${period} token budget at ${percentage}% ($${current.toFixed(2)}/$${limit})`;

    console.log(message);

    // Send webhook alert
    if (this.alerting.webhook) {
      try {
        await axios.post(this.alerting.webhook, {
          level,
          period,
          current,
          limit,
          percentage: parseFloat(percentage),
          message,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Failed to send webhook alert:', error.message);
      }
    }

    // Send Slack alert
    if (this.alerting.slack) {
      try {
        await axios.post(this.alerting.slack, {
          text: message,
          attachments: [{
            color: level === 'CRITICAL' ? 'danger' : 'warning',
            fields: [
              { title: 'Period', value: period, short: true },
              { title: 'Usage', value: `$${current.toFixed(2)}`, short: true },
              { title: 'Limit', value: `$${limit}`, short: true },
              { title: 'Percentage', value: `${percentage}%`, short: true }
            ]
          }]
        });
      } catch (error) {
        console.error('❌ Failed to send Slack alert:', error.message);
      }
    }

    // Send Discord alert
    await this.sendDiscordAlert(message);

    // Send Telegram alert
    await this.sendTelegramAlert(message);

    // Send SMS alert
    await this.sendSMSAlert(message);
  }

  /**
   * Emergency stop system
   * @param {string} reason - Reason for emergency stop
   */
  async emergencyStop(reason) {
    console.error(`🚨 EMERGENCY STOP: ${reason}`);

    // Stop all AI processing
    if (global.agentPool) {
      global.agentPool.pauseAllProcessing();
    }

    await this.sendAlert('EMERGENCY', 'system', 0, 0);

    // Store emergency stop flag
    if (this.redisClient) {
      await this.redisClient.set('emergency_stop', JSON.stringify({
        reason,
        timestamp: new Date().toISOString()
      }), 'EX', 3600); // 1 hour
    }
  }

  /**
   * Predict future token usage based on historical data
   * @param {string} period - Prediction period (daily/weekly/monthly)
   * @returns {Object} - Prediction results
   */
  async predictUsage(period = 'daily') {
    try {
      // Get historical data
      const historicalData = this.getHistoricalUsageData();

      // Simple moving average prediction (in a real implementation, this would use ML)
      const prediction = this.calculateMovingAverage(historicalData, period);

      // Calculate confidence based on data consistency
      const confidence = this.calculatePredictionConfidence(historicalData, prediction);

      const result = {
        period,
        predictedUsage: prediction,
        confidence: Math.min(confidence, this.predictionAccuracy),
        timestamp: new Date().toISOString(),
        nextPrediction: new Date(Date.now() + this.predictionWindow * 60 * 60 * 1000).toISOString()
      };

      console.log(`🔮 Usage prediction for ${period}: ${prediction.tokens} tokens (confidence: ${confidence.toFixed(2)})`);
      return result;
    } catch (error) {
      console.error('❌ Failed to predict usage:', error.message);
      return null;
    }
  }

  /**
   * Get historical usage data
   * @returns {Array} - Historical usage data
   */
  getHistoricalUsageData() {
    const data = [];
    const now = new Date();

    // Get last 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      if (this.tokenUsage.daily.has(dateStr)) {
        const daily = this.tokenUsage.daily.get(dateStr);
        data.push({
          date: dateStr,
          tokens: daily.tokens,
          cost: daily.cost,
          requests: daily.requests
        });
      }
    }

    return data.reverse(); // Chronological order
  }

  /**
   * Calculate moving average prediction
   * @param {Array} data - Historical data
   * @param {string} period - Prediction period
   * @returns {Object} - Prediction result
   */
  calculateMovingAverage(data, period) {
    if (data.length === 0) return { tokens: 0, cost: 0 };

    // Calculate 7-day moving average
    const windowSize = Math.min(7, data.length);
    const recentData = data.slice(-windowSize);

    const avgTokens = recentData.reduce((sum, day) => sum + day.tokens, 0) / recentData.length;
    const avgCost = recentData.reduce((sum, day) => sum + day.cost, 0) / recentData.length;

    // Adjust based on period
    let multiplier = 1;
    switch (period) {
      case 'weekly':
        multiplier = 7;
        break;
      case 'monthly':
        multiplier = 30;
        break;
    }

    return {
      tokens: Math.round(avgTokens * multiplier),
      cost: parseFloat((avgCost * multiplier).toFixed(2))
    };
  }

  /**
   * Calculate prediction confidence
   * @param {Array} data - Historical data
   * @param {Object} prediction - Prediction result
   * @returns {number} - Confidence level (0-1)
   */
  calculatePredictionConfidence(data, prediction) {
    if (data.length < 7) return 0.5; // Low confidence with insufficient data

    // Calculate standard deviation of recent data
    const recentData = data.slice(-7);
    const mean = recentData.reduce((sum, day) => sum + day.tokens, 0) / recentData.length;
    const variance = recentData.reduce((sum, day) => sum + Math.pow(day.tokens - mean, 2), 0) / recentData.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation means higher confidence
    const cv = mean > 0 ? stdDev / mean : 1; // Coefficient of variation
    return Math.max(0, Math.min(1, 1 - cv)); // Normalize to 0-1 range
  }

  /**
   * Get usage statistics
   * @param {string} period - Period (daily/monthly/all)
   * @returns {Object} - Usage statistics
   */
  getUsageStats(period = 'all') {
    const stats = {
      timestamp: new Date().toISOString(),
      budgetLimits: this.budgetLimits
    };

    if (period === 'daily' || period === 'all') {
      stats.daily = Object.fromEntries(this.tokenUsage.daily);
    }

    if (period === 'monthly' || period === 'all') {
      stats.monthly = Object.fromEntries(this.tokenUsage.monthly);
    }

    if (period === 'providers' || period === 'all') {
      stats.providers = Object.fromEntries(this.tokenUsage.providers);
    }

    return stats;
  }

  /**
   * Get detailed usage statistics
   * @param {string} period - Period (daily/monthly/all)
   * @returns {Object} - Detailed usage statistics
   */
  getDetailedStats(period = 'all') {
    const stats = {
      timestamp: new Date().toISOString(),
      budgetLimits: this.budgetLimits,
      predictions: {}
    };

    // Get current usage stats
    if (period === 'daily' || period === 'all') {
      stats.daily = Object.fromEntries(this.tokenUsage.daily);
    }

    if (period === 'monthly' || period === 'all') {
      stats.monthly = Object.fromEntries(this.tokenUsage.monthly);
    }

    if (period === 'providers' || period === 'all') {
      stats.providers = Object.fromEntries(this.tokenUsage.providers);
    }

    // Add predictions
    stats.predictions.daily = this.predictUsage('daily');
    stats.predictions.weekly = this.predictUsage('weekly');
    stats.predictions.monthly = this.predictUsage('monthly');

    return stats;
  }

  /**
   * Load existing usage from Redis
   */
  async loadExistingUsage() {
    if (!this.redisClient) return;

    try {
      // Load recent daily usage (last 30 days)
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today.getTime() - i * 24 * 3600 * 1000)
          .toISOString().split('T')[0];

        const dailyKey = `usage:daily:${date}`;
        const records = await this.redisClient.lRange(dailyKey, 0, -1);

        if (records.length > 0) {
          let dailyCost = 0;
          let dailyTokens = 0;

          records.forEach(record => {
            const parsed = JSON.parse(record);
            dailyCost += parsed.cost;
            dailyTokens += parsed.totalTokens;
          });

          this.tokenUsage.daily.set(date, {
            cost: dailyCost,
            tokens: dailyTokens,
            requests: records.length
          });
        }
      }

      console.log('✅ Loaded existing token usage from Redis');

    } catch (error) {
      console.error('❌ Failed to load existing usage:', error);
    }
  }

  /**
   * Start periodic tasks
   */
  startPeriodicTasks() {
    // Check budget every 5 minutes
    setInterval(() => {
      this.checkBudgetLimits();
    }, 5 * 60 * 1000);

    // Clean old data every hour
    setInterval(() => {
      this.cleanOldData();
    }, 60 * 60 * 1000);

    console.log('⏰ Token monitor periodic tasks started');
  }

  /**
   * Clean old in-memory data
   */
  cleanOldData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
      .toISOString().split('T')[0];

    // Clean old daily data
    for (const date of this.tokenUsage.daily.keys()) {
      if (date < thirtyDaysAgo) {
        this.tokenUsage.daily.delete(date);
      }
    }

    console.log('🧹 Cleaned old token usage data');
  }

  /**
   * Get content types for cost estimation
   * @returns {Object} - Content types with average token usage
   */
  getContentTypes() {
    return {
      political_content: {
        description: 'Political analysis and commentary videos',
        steps: 9,
        avgTokens: 9450
      },
      ai_content: {
        description: 'AI and technology focused content',
        steps: 9,
        avgTokens: 11850
      },
      viral_shorts: {
        description: 'Short-form viral content',
        steps: 8,
        avgTokens: 3450
      },
      educational: {
        description: 'Educational and instructional content',
        steps: 9,
        avgTokens: 8650
      },
      audio_analysis: {
        description: 'Audio transcription and analysis',
        steps: 7,
        avgTokens: 7300
      },
      multimedia_analysis: {
        description: 'Multi-media content analysis',
        steps: 6,
        avgTokens: 6500
      }
    };
  }

  /**
   * Estimate cost for content type
   * @param {string} contentType - Type of content
   * @param {string} provider - LLM provider
   * @param {string} model - Model name
   * @returns {Object} - Cost estimation
   */
  estimateContentCost(contentType, provider, model) {
    const contentTypes = this.getContentTypes();
    const contentInfo = contentTypes[contentType];

    if (!contentInfo) {
      throw new Error(`Unknown content type: ${contentType}`);
    }

    const pricing = this.costTracking[provider]?.[model];
    if (!pricing) {
      throw new Error(`Unknown provider/model: ${provider}/${model}`);
    }

    // Estimate based on average tokens for content type
    const avgTokens = contentInfo.avgTokens;
    const inputTokens = Math.round(avgTokens * 0.6); // 60% input
    const outputTokens = avgTokens - inputTokens;   // 40% output

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;

    return {
      contentType,
      provider,
      model,
      estimatedTokens: avgTokens,
      inputTokens,
      outputTokens,
      estimatedCost: parseFloat(totalCost.toFixed(4)),
      contentInfo
    };
  }

  /**
   * Analyze usage patterns and trends
   * @returns {Object} - Analysis results
   */
  analyzeUsagePatterns() {
    const analysis = {
      timestamp: new Date().toISOString(),
      totalUsage: {
        tokens: 0,
        cost: 0,
        requests: 0
      },
      byProvider: {},
      byModel: {},
      trends: {},
      recommendations: []
    };

    // Aggregate data
    for (const [key, data] of this.tokenUsage.providers.entries()) {
      const [provider, model] = key.split(':');

      // By provider
      if (!analysis.byProvider[provider]) {
        analysis.byProvider[provider] = { tokens: 0, cost: 0, requests: 0 };
      }
      analysis.byProvider[provider].tokens += data.tokens;
      analysis.byProvider[provider].cost += data.cost;
      analysis.byProvider[provider].requests += data.requests;

      // By model
      if (!analysis.byModel[model]) {
        analysis.byModel[model] = { tokens: 0, cost: 0, requests: 0 };
      }
      analysis.byModel[model].tokens += data.tokens;
      analysis.byModel[model].cost += data.cost;
      analysis.byModel[model].requests += data.requests;

      // Total
      analysis.totalUsage.tokens += data.tokens;
      analysis.totalUsage.cost += data.cost;
      analysis.totalUsage.requests += data.requests;
    }

    // Identify trends
    analysis.trends = this.identifyUsageTrends();

    // Generate recommendations
    analysis.recommendations = this.generateOptimizationRecommendations(analysis);

    return analysis;
  }

  /**
   * Identify usage trends
   * @returns {Object} - Trend analysis
   */
  identifyUsageTrends() {
    const trends = {
      highestUsageProvider: null,
      highestUsageModel: null,
      costEfficiency: null,
      growthRate: null
    };

    // Find highest usage provider
    let maxProviderTokens = 0;
    for (const [provider, data] of Object.entries(this.getStats().providers || {})) {
      if (data.tokens > maxProviderTokens) {
        maxProviderTokens = data.tokens;
        trends.highestUsageProvider = { provider, tokens: data.tokens };
      }
    }

    // Find highest usage model
    let maxModelTokens = 0;
    for (const [model, data] of Object.entries(this.getStats().providers || {})) {
      if (data.tokens > maxModelTokens) {
        maxModelTokens = data.tokens;
        trends.highestUsageModel = { model, tokens: data.tokens };
      }
    }

    // Calculate cost efficiency (tokens per dollar)
    if (this.getStats().providers) {
      let bestEfficiency = 0;
      let bestProvider = null;

      for (const [key, data] of Object.entries(this.getStats().providers)) {
        if (data.cost > 0) {
          const efficiency = data.tokens / data.cost;
          if (efficiency > bestEfficiency) {
            bestEfficiency = efficiency;
            const [provider] = key.split(':');
            bestProvider = { provider, efficiency: Math.round(efficiency) };
          }
        }
      }

      trends.costEfficiency = bestProvider;
    }

    return trends;
  }

  /**
   * Generate optimization recommendations
   * @param {Object} analysis - Usage analysis
   * @returns {Array} - Recommendations
   */
  generateOptimizationRecommendations(analysis) {
    const recommendations = [];

    // Check if any provider is dominating usage
    if (analysis.byProvider) {
      const providers = Object.entries(analysis.byProvider);
      if (providers.length > 1) {
        const sortedProviders = providers.sort((a, b) => b[1].tokens - a[1].tokens);
        const dominantProvider = sortedProviders[0];
        const totalTokens = providers.reduce((sum, [, data]) => sum + data.tokens, 0);

        if (dominantProvider[1].tokens / totalTokens > 0.7) {
          recommendations.push({
            type: 'provider_diversification',
            priority: 'medium',
            message: `Provider ${dominantProvider[0]} dominates usage (${Math.round(dominantProvider[1].tokens/totalTokens*100)}%). Consider diversifying to reduce dependency.`
          });
        }
      }
    }

    // Check for cost optimization opportunities
    if (analysis.byModel) {
      const expensiveModels = Object.entries(analysis.byModel)
        .filter(([, data]) => data.cost > 0 && data.tokens > 0)
        .map(([model, data]) => ({
          model,
          costPerToken: data.cost / data.tokens
        }))
        .sort((a, b) => b.costPerToken - a.costPerToken)
        .slice(0, 3);

      if (expensiveModels.length > 0) {
        recommendations.push({
          type: 'cost_optimization',
          priority: 'high',
          message: `High-cost models identified: ${expensiveModels.map(m => m.model).join(', ')}. Consider alternatives for cost reduction.`
        });
      }
    }

    // Budget utilization recommendations
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = this.tokenUsage.daily.get(today)?.cost || 0;
    const dailyPercentage = dailyUsage / this.budgetLimits.daily;

    if (dailyPercentage > 0.8) {
      recommendations.push({
        type: 'budget_management',
        priority: 'high',
        message: `Daily budget utilization is high (${Math.round(dailyPercentage*100)}%). Consider adjusting usage or increasing budget.`
      });
    }

    return recommendations;
  }

  /**
   * Generate detailed usage report
   * @param {string} format - Report format (json/csv)
   * @returns {string|Object} - Report data
   */
  generateUsageReport(format = 'json') {
    const analysis = this.analyzeUsagePatterns();

    if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Provider,Model,Tokens,Cost,Requests\n';

      for (const [key, data] of this.tokenUsage.providers.entries()) {
        const [provider, model] = key.split(':');
        csv += `${provider},${model},${data.tokens},${data.cost.toFixed(4)},${data.requests}\n`;
      }

      return csv;
    }

    // JSON format (default)
    return {
      report: 'Token Usage Report',
      generatedAt: new Date().toISOString(),
      analysis: analysis
    };
  }

  /**
   * Get service statistics
   * @returns {Object} - Service statistics
   */
  getStats() {
    try {
      const trendFiles = []; // In a real implementation, this would read from the trends directory

      const latest = null; // In a real implementation, this would get the latest trend analysis

      return {
        totalAnalyses: trendFiles.length,
        latestAnalysis: latest?.analysis?.analysisTime || null,
        currentTrends: latest?.trends?.length || 0,
        currentTopics: latest?.topics?.length || 0,
        topTrend: latest?.trends?.[0]?.keyword || null,
        topTrendScore: latest?.trends?.[0]?.trendingScore || 0,
        analysisConfig: this.analysisConfig
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return {
        error: error.message
      };
    }
  }
}

// Singleton instance
const tokenMonitor = new TokenMonitor();

module.exports = tokenMonitor;