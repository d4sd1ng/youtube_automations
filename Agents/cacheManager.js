const connectionManager = require('./connectionManager');

class CacheManager {
  constructor() {
    this.redisClient = null;
    this.localCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    
    // Default TTL values (in seconds)
    this.defaultTTL = {
      specifications: 3600,     // 1 hour
      api_responses: 300,       // 5 minutes
      llm_prompts: 1800,       // 30 minutes
      user_sessions: 7200,     // 2 hours
      predictive_content: 7200, // 2 hours
      system_config: 86400     // 24 hours
    };
  }

  async initialize() {
    try {
      this.redisClient = connectionManager.getRedisClient();
      console.log('✅ Cache Manager initialized with Redis');
    } catch (error) {
      console.warn('⚠️ Redis not available, using local cache only');
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @param {Object} options - Cache options
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key, options = {}) {
    try {
      let value = null;
      
      // Try Redis first
      if (this.redisClient) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue) {
          value = JSON.parse(redisValue);
          this.cacheStats.hits++;
          return value;
        }
      }
      
      // Fallback to local cache
      if (this.localCache.has(key)) {
        const cached = this.localCache.get(key);
        if (cached.expiry > Date.now()) {
          this.cacheStats.hits++;
          return cached.value;
        } else {
          this.localCache.delete(key);
        }
      }
      
      this.cacheStats.misses++;
      return null;
      
    } catch (error) {
      console.error('Cache get error:', error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} options - Cache options
   */
  async set(key, value, options = {}) {
    const { ttl, type = 'default' } = options;
    const finalTTL = ttl || this.defaultTTL[type] || this.defaultTTL.default || 3600;
    
    try {
      const serializedValue = JSON.stringify(value);
      
      // Set in Redis
      if (this.redisClient) {
        await this.redisClient.setEx(key, finalTTL, serializedValue);
      }
      
      // Set in local cache as backup
      this.localCache.set(key, {
        value,
        expiry: Date.now() + (finalTTL * 1000)
      });
      
      this.cacheStats.sets++;
      
    } catch (error) {
      console.error('Cache set error:', error);
      this.cacheStats.errors++;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      if (this.redisClient) {
        await this.redisClient.del(key);
      }
      
      this.localCache.delete(key);
      this.cacheStats.deletes++;
      
    } catch (error) {
      console.error('Cache delete error:', error);
      this.cacheStats.errors++;
    }
  }

  /**
   * Cache common specifications to reduce API costs
   * @param {string} specType - Type of specification
   * @param {string} identifier - Unique identifier
   * @param {any} specification - Specification data
   */
  async cacheSpecification(specType, identifier, specification) {
    const key = `spec:${specType}:${identifier}`;
    await this.set(key, {
      specification,
      cached_at: new Date().toISOString(),
      spec_type: specType
    }, { type: 'specifications' });
  }

  /**
   * Get cached specification
   * @param {string} specType - Type of specification
   * @param {string} identifier - Unique identifier
   * @returns {Promise<any>} - Cached specification or null
   */
  async getSpecification(specType, identifier) {
    const key = `spec:${specType}:${identifier}`;
    const cached = await this.get(key);
    return cached ? cached.specification : null;
  }

  /**
   * Cache API responses
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @param {any} response - API response
   */
  async cacheApiResponse(endpoint, params, response) {
    const key = `api:${endpoint}:${this.hashParams(params)}`;
    await this.set(key, {
      response,
      cached_at: new Date().toISOString(),
      endpoint,
      params
    }, { type: 'api_responses' });
  }

  /**
   * Get cached API response
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {Promise<any>} - Cached response or null
   */
  async getCachedApiResponse(endpoint, params) {
    const key = `api:${endpoint}:${this.hashParams(params)}`;
    const cached = await this.get(key);
    return cached ? cached.response : null;
  }

  /**
   * Cache LLM prompts and responses
   * @param {string} prompt - LLM prompt
   * @param {string} model - Model used
   * @param {any} response - LLM response
   */
  async cacheLLMResponse(prompt, model, response) {
    const key = `llm:${model}:${this.hashString(prompt)}`;
    await this.set(key, {
      prompt,
      response,
      model,
      cached_at: new Date().toISOString()
    }, { type: 'llm_prompts' });
  }

  /**
   * Get cached LLM response
   * @param {string} prompt - LLM prompt
   * @param {string} model - Model used
   * @returns {Promise<any>} - Cached response or null
   */
  async getCachedLLMResponse(prompt, model) {
    const key = `llm:${model}:${this.hashString(prompt)}`;
    const cached = await this.get(key);
    return cached ? cached.response : null;
  }

  /**
   * Warm up cache with common specifications
   */
  async warmUpCache() {
    console.log('🔥 Warming up cache with common specifications...');
    
    const commonSpecs = {
      video_formats: {
        '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
        '720p': { width: 1280, height: 720, bitrate: '2500k' },
        '480p': { width: 854, height: 480, bitrate: '1000k' }
      },
      content_types: {
        'ai_content': { duration: '8-12min', target: 'tech enthusiasts' },
        'viral_shorts': { duration: '60s', target: 'general audience' },
        'educational': { duration: '10-15min', target: 'learners' }
      },
      prompt_templates: {
        'script_generation': 'Create an engaging YouTube video script about \"{topic}\"...',
        'thumbnail_ideas': 'Generate 3 compelling thumbnail concepts for \"{topic}\"...',
        'seo_optimization': 'Optimize this content for YouTube SEO: \"{content}\"...'
      }
    };
    
    for (const [specType, specs] of Object.entries(commonSpecs)) {
      for (const [identifier, spec] of Object.entries(specs)) {
        await this.cacheSpecification(specType, identifier, spec);
      }
    }
    
    console.log('✅ Cache warmed up with common specifications');
  }

  /**
   * Hash function for parameters
   * @param {Object} params - Parameters to hash
   * @returns {string} - Hashed string
   */
  hashParams(params) {
    return this.hashString(JSON.stringify(params, Object.keys(params).sort()));
  }

  /**
   * Simple hash function
   * @param {string} str - String to hash
   * @returns {string} - Hashed string
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.cacheStats,
      hitRate: parseFloat(hitRate),
      localCacheSize: this.localCache.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear expired entries from local cache
   */
  cleanupLocalCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.localCache.entries()) {
      if (value.expiry <= now) {
        this.localCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired entries from local cache`);
    }
  }

  /**
   * Start periodic cleanup
   */
  startCleanup() {
    // Cleanup every 5 minutes
    setInterval(() => {
      this.cleanupLocalCache();
    }, 5 * 60 * 1000);
  }
}

// Singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;