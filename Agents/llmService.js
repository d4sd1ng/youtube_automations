const { OpenAI } = require('openai');
const axios = require('axios');
const retryManager = require('./retryManager');
const cacheManager = require('./cacheManager');
const tokenMonitor = require('./tokenMonitor');

class LLMService {
  constructor() {
    // Notification systems
    this.notificationChannels = {
      discord: process.env.DISCORD_WEBHOOK || null,
      telegram: process.env.TELEGRAM_BOT_TOKEN || null,
      webhook: process.env.WEBHOOK_URL || null,
      slack: process.env.SLACK_WEBHOOK || null
    };

    // Initialize OpenAI only if API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey && openaiApiKey !== 'your_openai_api_key_here' && openaiApiKey !== 'sk-test-placeholder-for-development' && openaiApiKey.length > 20) {
      try {
        this.openai = new OpenAI({
          apiKey: openaiApiKey
        });
        this.hasOpenAI = true;
        console.log('✅ OpenAI API initialized successfully');
      } catch (error) {
        console.warn('⚠️ OpenAI API initialization failed:', error.message);
        this.openai = null;
        this.hasOpenAI = false;
      }
    } else {
      console.warn('⚠️ OpenAI API key not configured properly');
      this.openai = null;
      this.hasOpenAI = false;
    }

    // Initialize Anthropic (Claude) if API key is available
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey && anthropicApiKey.length > 20) {
      try {
        this.anthropic = axios.create({
          baseURL: 'https://api.anthropic.com/v1',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        });
        this.hasAnthropic = true;
        console.log('✅ Anthropic API initialized successfully');
      } catch (error) {
        console.warn('⚠️ Anthropic API initialization failed:', error.message);
        this.anthropic = null;
        this.hasAnthropic = false;
      }
    } else {
      console.warn('⚠️ Anthropic API key not configured properly');
      this.anthropic = null;
      this.hasAnthropic = false;
    }

    // Initialize Google Gemini if API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey && geminiApiKey.length > 20) {
      try {
        this.gemini = axios.create({
          baseURL: 'https://generativelanguage.googleapis.com/v1beta',
          headers: {
            'content-type': 'application/json'
          }
        });
        this.hasGemini = true;
        this.geminiApiKey = geminiApiKey;
        console.log('✅ Google Gemini API initialized successfully');
      } catch (error) {
        console.warn('⚠️ Google Gemini API initialization failed:', error.message);
        this.gemini = null;
        this.hasGemini = false;
      }
    } else {
      console.warn('⚠️ Google Gemini API key not configured properly');
      this.gemini = null;
      this.hasGemini = false;
    }

    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.defaultProvider = process.env.DEFAULT_LLM_PROVIDER || (this.hasOpenAI ? 'openai' : 'ollama');
    this.defaultModel = process.env.DEFAULT_MODEL || (this.hasOpenAI ? 'gpt-3.5-turbo' : 'llama2:7b');

    // Initialize retry functions with backoff
    if (this.hasOpenAI) {
      this.generateWithOpenAIRetry = retryManager.retryable(
        this.generateWithOpenAI.bind(this),
        { maxRetries: 3, baseDelay: 2000 }
      );
    }

    if (this.hasAnthropic) {
      this.generateWithAnthropicRetry = retryManager.retryable(
        this.generateWithAnthropic.bind(this),
        { maxRetries: 3, baseDelay: 2000 }
      );
    }

    if (this.hasGemini) {
      this.generateWithGeminiRetry = retryManager.retryable(
        this.generateWithGemini.bind(this),
        { maxRetries: 3, baseDelay: 2000 }
      );
    }

    this.generateWithOllamaRetry = retryManager.retryable(
      this.generateWithOllama.bind(this),
      { maxRetries: 2, baseDelay: 1000 }
    );

    console.log(`🔧 Default LLM Provider: ${this.defaultProvider}`);
    console.log(`🔧 Default Model: ${this.defaultModel}`);

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

  async generateContent(topic, type, parameters = {}) {
    const prompt = this.buildPrompt(topic, type, parameters);
    const model = this.defaultModel;

    try {
      // Send notification about content generation start
      await this.sendNotification(`Starting content generation for: ${topic} (${type})`, 'info');

      // Check cache first
      const cachedResponse = await cacheManager.getCachedLLMResponse(prompt, model);
      if (cachedResponse) {
        console.log('⚡ Using cached LLM response');
        await this.sendNotification(`Using cached response for: ${topic} (${type})`, 'info');
        return cachedResponse;
      }

      let result;
      if (this.defaultProvider === 'openai' && this.hasOpenAI) {
        try {
          result = await this.generateWithOpenAIRetry(prompt, parameters);
        } catch (error) {
          // If OpenAI fails, fall back to other providers if available
          console.warn('⚠️ OpenAI failed:', error.message);
          await this.sendNotification(`OpenAI failed for: ${topic} (${type}) - ${error.message}`, 'warn');

          if (this.hasAnthropic && this.defaultProvider !== 'anthropic') {
            console.log('🔄 Falling back to Anthropic (Claude)');
            await this.sendNotification(`Falling back to Anthropic for: ${topic} (${type})`, 'info');
            result = await this.generateWithAnthropicRetry(prompt, parameters);
          } else if (this.hasGemini && this.defaultProvider !== 'gemini') {
            console.log('🔄 Falling back to Google Gemini');
            await this.sendNotification(`Falling back to Google Gemini for: ${topic} (${type})`, 'info');
            result = await this.generateWithGeminiRetry(prompt, parameters);
          } else if (this.defaultProvider === 'ollama') {
            console.log('🔄 Falling back to Ollama');
            await this.sendNotification(`Falling back to Ollama for: ${topic} (${type})`, 'info');
            result = await this.generateWithOllamaRetry(prompt, parameters);
          } else {
            // Fallback to mock response for development
            console.log('🤖 Using mock LLM response (APIs not configured)');
            await this.sendNotification(`Using mock response for: ${topic} (${type})`, 'warn');
            result = {
              content: `Mock content for "${topic}" (${type}):\n\nThis is a sample response for development and testing purposes. The system is working correctly but using mock data since external APIs are not configured.\n\nKey points:\n- Feature 1: Detailed explanation\n- Feature 2: Technical aspects\n- Feature 3: Practical applications\n\nConclusion: This demonstrates the system functionality.`,
              provider: 'mock',
              model: 'development',
              tokens: 150
            };
          }
        }
      } else if (this.defaultProvider === 'anthropic' && this.hasAnthropic) {
        try {
          result = await this.generateWithAnthropicRetry(prompt, parameters);
        } catch (error) {
          // If Anthropic fails, fall back to other providers if available
          console.warn('⚠️ Anthropic failed:', error.message);
          await this.sendNotification(`Anthropic failed for: ${topic} (${type}) - ${error.message}`, 'warn');

          if (this.hasOpenAI && this.defaultProvider !== 'openai') {
            console.log('🔄 Falling back to OpenAI');
            await this.sendNotification(`Falling back to OpenAI for: ${topic} (${type})`, 'info');
            result = await this.generateWithOpenAIRetry(prompt, parameters);
          } else if (this.hasGemini && this.defaultProvider !== 'gemini') {
            console.log('🔄 Falling back to Google Gemini');
            await this.sendNotification(`Falling back to Google Gemini for: ${topic} (${type})`, 'info');
            result = await this.generateWithGeminiRetry(prompt, parameters);
          } else if (this.defaultProvider === 'ollama') {
            console.log('🔄 Falling back to Ollama');
            await this.sendNotification(`Falling back to Ollama for: ${topic} (${type})`, 'info');
            result = await this.generateWithOllamaRetry(prompt, parameters);
          } else {
            // Fallback to mock response for development
            console.log('🤖 Using mock LLM response (APIs not configured)');
            await this.sendNotification(`Using mock response for: ${topic} (${type})`, 'warn');
            result = {
              content: `Mock content for "${topic}" (${type}):\n\nThis is a sample response for development and testing purposes. The system is working correctly but using mock data since external APIs are not configured.\n\nKey points:\n- Feature 1: Detailed explanation\n- Feature 2: Technical aspects\n- Feature 3: Practical applications\n\nConclusion: This demonstrates the system functionality.`,
              provider: 'mock',
              model: 'development',
              tokens: 150
            };
          }
        }
      } else if (this.defaultProvider === 'gemini' && this.hasGemini) {
        try {
          result = await this.generateWithGeminiRetry(prompt, parameters);
        } catch (error) {
          // If Gemini fails, fall back to other providers if available
          console.warn('⚠️ Google Gemini failed:', error.message);
          await this.sendNotification(`Google Gemini failed for: ${topic} (${type}) - ${error.message}`, 'warn');

          if (this.hasOpenAI && this.defaultProvider !== 'openai') {
            console.log('🔄 Falling back to OpenAI');
            await this.sendNotification(`Falling back to OpenAI for: ${topic} (${type})`, 'info');
            result = await this.generateWithOpenAIRetry(prompt, parameters);
          } else if (this.hasAnthropic && this.defaultProvider !== 'anthropic') {
            console.log('🔄 Falling back to Anthropic');
            await this.sendNotification(`Falling back to Anthropic for: ${topic} (${type})`, 'info');
            result = await this.generateWithAnthropicRetry(prompt, parameters);
          } else if (this.defaultProvider === 'ollama') {
            console.log('🔄 Falling back to Ollama');
            await this.sendNotification(`Falling back to Ollama for: ${topic} (${type})`, 'info');
            result = await this.generateWithOllamaRetry(prompt, parameters);
          } else {
            // Fallback to mock response for development
            console.log('🤖 Using mock LLM response (APIs not configured)');
            await this.sendNotification(`Using mock response for: ${topic} (${type})`, 'warn');
            result = {
              content: `Mock content for "${topic}" (${type}):\n\nThis is a sample response for development and testing purposes. The system is working correctly but using mock data since external APIs are not configured.\n\nKey points:\n- Feature 1: Detailed explanation\n- Feature 2: Technical aspects\n- Feature 3: Practical applications\n\nConclusion: This demonstrates the system functionality.`,
              provider: 'mock',
              model: 'development',
              tokens: 150
            };
          }
        }
      } else if (this.defaultProvider === 'ollama') {
        try {
          result = await this.generateWithOllamaRetry(prompt, parameters);
        } catch (error) {
          // If Ollama fails, fall back to mock
          console.warn('⚠️ Ollama failed, using mock response:', error.message);
          await this.sendNotification(`Ollama failed for: ${topic} (${type}) - ${error.message}`, 'warn');
          console.log('🤖 Using mock LLM response (APIs not configured)');
          await this.sendNotification(`Using mock response for: ${topic} (${type})`, 'warn');
          result = {
            content: `Mock content for "${topic}" (${type}):\n\nThis is a sample response for development and testing purposes. The system is working correctly but using mock data since external APIs are not configured.\n\nKey points:\n- Feature 1: Detailed explanation\n- Feature 2: Technical aspects\n- Feature 3: Practical applications\n\nConclusion: This demonstrates the system functionality.`,
            provider: 'mock',
            model: 'development',
            tokens: 150
          };
        }
      } else {
        // Fallback to mock response for development
        console.log('🤖 Using mock LLM response (APIs not configured)');
        await this.sendNotification(`Using mock response for: ${topic} (${type})`, 'warn');
        result = {
          content: `Mock content for "${topic}" (${type}):\n\nThis is a sample response for development and testing purposes. The system is working correctly but using mock data since external APIs are not configured.\n\nKey points:\n- Feature 1: Detailed explanation\n- Feature 2: Technical aspects\n- Feature 3: Practical applications\n\nConclusion: This demonstrates the system functionality.`,
          provider: 'mock',
          model: 'development',
          tokens: 150
        };
      }

      // Track token usage
      await tokenMonitor.trackUsage({
        provider: result.provider,
        model: result.model,
        inputTokens: this.estimateTokens(prompt),
        outputTokens: result.tokens || this.estimateTokens(result.content),
        requestId: this.generateRequestId(),
        endpoint: 'generateContent'
      });

      // Cache the response
      await cacheManager.cacheLLMResponse(prompt, model, result);

      // Send notification about successful completion
      await this.sendNotification(`Content generation completed for: ${topic} (${type}) using ${result.provider}`, 'success');

      return result;

    } catch (error) {
      console.error('LLM Generation Error:', error);
      await this.sendNotification(`Content generation failed for: ${topic} (${type}) - ${error.message}`, 'error');
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async generateWithOpenAI(prompt, parameters = {}) {
    if (!this.hasOpenAI) {
      throw new Error('OpenAI not properly configured');
    }

    const {
      maxTokens = 2000,
      temperature = 0.7
    } = parameters;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are a professional YouTube content creator and scriptwriter.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      });

      return {
        content: response.choices[0].message.content,
        provider: 'openai',
        model: this.defaultModel,
        tokens: response.usage.total_tokens
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      throw error;
    }
  }

  async generateWithAnthropic(prompt, parameters = {}) {
    if (!this.hasAnthropic) {
      throw new Error('Anthropic not properly configured');
    }

    const {
      maxTokens = 2000,
      temperature = 0.7
    } = parameters;

    try {
      const response = await this.anthropic.post('/messages', {
        model: this.defaultModel || 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return {
        content: response.data.content[0].text,
        provider: 'anthropic',
        model: this.defaultModel || 'claude-3-haiku-20240307',
        tokens: response.data.usage.output_tokens
      };
    } catch (error) {
      console.error('Anthropic API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateWithGemini(prompt, parameters = {}) {
    if (!this.hasGemini) {
      throw new Error('Google Gemini not properly configured');
    }

    const {
      maxTokens = 2000,
      temperature = 0.7
    } = parameters;

    try {
      const response = await this.gemini.post(`/models/${this.defaultModel || 'gemini-pro'}:generateContent?key=${this.geminiApiKey}`, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature
        }
      });

      return {
        content: response.data.candidates[0].content.parts[0].text,
        provider: 'gemini',
        model: this.defaultModel || 'gemini-pro',
        tokens: response.data.candidates[0].tokenCount || 0
      };
    } catch (error) {
      console.error('Google Gemini API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateWithOllama(prompt, parameters = {}) {
    const {
      maxTokens = 2000,
      temperature = 0.7
    } = parameters;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: this.defaultModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature,
          top_p: 0.9
        }
      });

      return {
        content: response.data.response,
        provider: 'ollama',
        model: this.defaultModel,
        tokens: response.data.eval_count || 0
      };
    } catch (error) {
      console.error('Ollama API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  buildPrompt(topic, type, parameters) {
    const basePrompts = {
      ai_content: `Create an engaging YouTube video script about "${topic}".
                   Include: Hook, main content, call-to-action.
                   Target audience: Tech enthusiasts and AI interested viewers.
                   Length: 8-12 minutes estimated speaking time.`,

      political_content: `Create a balanced political analysis video script about "${topic}".
                         Include: Introduction, key points analysis, conclusion.
                         Maintain neutrality and fact-based approach.
                         Length: 10-15 minutes estimated speaking time.`,

      viral_shorts: `Create a viral YouTube Shorts script about "${topic}".
                    Requirements: Hook in first 3 seconds, engaging content, trending elements.
                    Format: 60 seconds maximum, punchy and entertaining.`,

      educational: `Create an educational video script about "${topic}".
                   Structure: Learning objectives, step-by-step explanation, summary.
                   Make it accessible for beginners while being comprehensive.`,

      analysis: `Analyze the topic "${topic}" for YouTube content creation.
                Provide: Target audience, key themes, trending aspects, content opportunities.`,

      structure: `Create a detailed video structure for "${topic}".
                 Include: Introduction hook, main sections, transitions, conclusion.
                 Optimize for viewer retention and engagement.`,

      hook: `Create 3 viral hook options for "${topic}".
            Each hook should: Grab attention in first 3 seconds, create curiosity, promise value.
            Format for different platforms: YouTube, TikTok, Instagram.`,

      trends: `Analyze current trends related to "${topic}".
              Identify: Trending keywords, popular formats, audience interests, timing opportunities.`,

      script_review: `Review the following YouTube video script for quality and provide improvement suggestions.
                     Evaluate on: Content quality and accuracy, Structure and flow, Engagement factors, Tone and language, Keyword integration, Length and timing.
                     Provide a overall rating from 1-10 and a recommendation for video production (approve, revise, reject).`,

      seo_optimization: `Optimize the following content for SEO with focus on "${topic}".
                        Provide: SEO title, meta description, keywords, content structure suggestions.
                        Include: LSI keywords, semantic SEO elements, internal linking suggestions.`,

      content_cluster: `Create a content cluster strategy around "${topic}".
                       Include: Pillar content topic, 5 cluster content topics, internal linking structure.
                       For each topic: Content angle, target keywords, content type suggestion.`
    };

    // Use custom prompt if provided
    if (parameters.prompt) {
      return parameters.prompt;
    }

    return basePrompts[type] || basePrompts.ai_content;
  }

  async generateVideoOutline(script) {
    const prompt = `Based on this video script, create a detailed video production outline:

Script: ${script}

Create an outline with:
1. Scene breakdown
2. Visual suggestions
3. Audio/music recommendations
4. Editing notes
5. Thumbnail ideas`;

    return await this.generateContent('Video Outline', 'ai_content', { prompt });
  }

  /**
   * Estimate token count for text
   * @param {string} text - Text to count tokens for
   * @returns {number} - Estimated token count
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate unique request ID
   * @returns {string} - Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get LLM service statistics
   * @returns {Object} - Service statistics
   */
  async getStats() {
    const tokenStats = tokenMonitor.getUsageStats();
    const cacheStats = cacheManager.getStats();

    return {
      provider: this.defaultProvider,
      model: this.defaultModel,
      tokenUsage: tokenStats,
      cacheStats,
      notificationSystems: this.notificationSystems,
      providers: {
        openai: this.hasOpenAI,
        anthropic: this.hasAnthropic,
        gemini: this.hasGemini,
        ollama: true // Ollama is always available as fallback
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = LLMService;