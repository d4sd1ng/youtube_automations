class RetryManager {
  constructor() {
    this.defaultOptions = {
      maxRetries: 3,
      baseDelay: 1000,        // 1 second
      maxDelay: 30000,        // 30 seconds
      backoffFactor: 2,       // Exponential factor
      jitter: true,           // Add randomness
      retryableErrors: [
        'ECONNRESET',
        'ECONNREFUSED', 
        'ETIMEDOUT',
        'ENOTFOUND',
        'EAI_AGAIN'
      ],
      retryableStatusCodes: [429, 500, 502, 503, 504]
    };
  }

  /**
   * Execute function with exponential backoff retry
   * @param {Function} fn - Function to execute
   * @param {Object} options - Retry options
   * @returns {Promise} - Result of function execution
   */
  async executeWithRetry(fn, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Log successful retry
        if (attempt > 0) {
          console.log(`✅ Retry succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error, config)) {
          console.log(`❌ Non-retryable error: ${error.message}`);
          throw error;
        }
        
        // Don't wait after the last attempt
        if (attempt === config.maxRetries) {
          console.log(`❌ Max retries (${config.maxRetries}) exceeded`);
          break;
        }
        
        const delay = this.calculateDelay(attempt, config);
        console.log(`⏳ Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error.message}`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @param {Object} config - Retry configuration
   * @returns {boolean} - Whether error is retryable
   */
  isRetryableError(error, config) {
    // Check HTTP status codes
    if (error.response && error.response.status) {
      return config.retryableStatusCodes.includes(error.response.status);
    }
    
    // Check error codes
    if (error.code) {
      return config.retryableErrors.includes(error.code);
    }
    
    // Check error messages for common patterns
    const message = error.message.toLowerCase();
    const retryablePatterns = [
      'timeout',
      'network error',
      'connection reset',
      'econnreset',
      'econnrefused',
      'rate limit'
    ];
    
    return retryablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Calculate exponential backoff delay
   * @param {number} attempt - Current attempt number (0-based)
   * @param {Object} config - Retry configuration
   * @returns {number} - Delay in milliseconds
   */
  calculateDelay(attempt, config) {
    // Exponential backoff: baseDelay * (backoffFactor ^ attempt)
    let delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
    
    // Cap at maximum delay
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      const jitterRange = delay * 0.1; // 10% jitter
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      delay = Math.max(0, delay + jitter);
    }
    
    return Math.round(delay);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} - Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retryable version of an async function
   * @param {Function} fn - Function to make retryable
   * @param {Object} options - Retry options
   * @returns {Function} - Retryable function
   */
  retryable(fn, options = {}) {
    return async (...args) => {
      return this.executeWithRetry(() => fn(...args), options);
    };
  }

  /**
   * Circuit breaker pattern implementation
   */
  createCircuitBreaker(fn, options = {}) {
    const config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitorTimeout: 30000, // 30 seconds
      ...options
    };
    
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    let failureCount = 0;
    let lastFailureTime = null;
    
    return async (...args) => {
      // Check if circuit should reset
      if (state === 'OPEN') {
        if (Date.now() - lastFailureTime > config.resetTimeout) {
          state = 'HALF_OPEN';
          console.log('🔄 Circuit breaker: HALF_OPEN');
        } else {
          throw new Error('Circuit breaker is OPEN');
        }
      }
      
      try {
        const result = await fn(...args);
        
        // Reset on success
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failureCount = 0;
          console.log('✅ Circuit breaker: CLOSED (reset)');
        }
        
        return result;
        
      } catch (error) {
        failureCount++;
        lastFailureTime = Date.now();
        
        // Trip circuit breaker
        if (failureCount >= config.failureThreshold) {
          state = 'OPEN';
          console.log(`🚨 Circuit breaker: OPEN (${failureCount} failures)`);
        }
        
        throw error;
      }
    };
  }

  /**
   * Rate limiter implementation
   * @param {Function} fn - Function to rate limit
   * @param {Object} options - Rate limit options
   * @returns {Function} - Rate limited function
   */
  rateLimited(fn, options = {}) {
    const config = {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      ...options
    };
    
    const requests = [];
    
    return async (...args) => {
      const now = Date.now();
      
      // Remove old requests outside the window
      while (requests.length > 0 && requests[0] < now - config.windowMs) {
        requests.shift();
      }
      
      // Check if rate limit exceeded
      if (requests.length >= config.maxRequests) {
        const oldestRequest = requests[0];
        const waitTime = oldestRequest + config.windowMs - now;
        
        console.log(`🛑 Rate limit exceeded, waiting ${waitTime}ms`);
        await this.sleep(waitTime);
        
        // Recursive call after waiting
        return this.rateLimited(fn, options)(...args);
      }
      
      // Add current request and execute
      requests.push(now);
      return fn(...args);
    };
  }
}

// Singleton instance
const retryManager = new RetryManager();

module.exports = retryManager;