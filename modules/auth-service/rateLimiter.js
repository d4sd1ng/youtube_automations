const rateLimit = require('express-rate-limit');

class RateLimiter {
  constructor() {
    this.redisClient = null;
    this.isEnabled = process.env.ENABLE_RATE_LIMITING === 'true';

    // Note: Redis support would require additional dependencies
    // For standalone version, we're using memory-based rate limiting
  }

  /**
   * Erstellt eine Rate-Limit-Middleware für einen bestimmten Endpunkt
   * @param {Object} options - Konfigurationsoptionen
   * @returns {Function} Express-Middleware
   */
  createLimiter(options = {}) {
    const config = {
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 Minuten
      max: options.max || 100, // Max 100 Anfragen
      message: options.message || {
        error: 'Too many requests, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: false,
      skipSuccessfulRequests: false,
      keyGenerator: options.keyGenerator || null,
      handler: options.handler || null,
      ...options
    };

    // Using express-rate-limit for memory-based rate limiting
    return rateLimit(config);
  }

  /**
   * Rate-Limiter für authentifizierte Benutzer
   */
  getUserLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 100, // Max 100 Anfragen pro 15 Minuten
      keyGenerator: (req) => req.user ? req.user.id : req.ip,
      message: {
        error: 'Too many requests from this user, please try again later.'
      }
    });
  }

  /**
   * Rate-Limiter für strenge API-Endpunkte
   */
  getStrictLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 10, // Nur 10 Anfragen pro 15 Minuten
      message: {
        error: 'Too many requests to this endpoint, please try again later.'
      }
    });
  }

  /**
   * Rate-Limiter für öffentliche Endpunkte
   */
  getPublicLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 200, // Max 200 Anfragen pro 15 Minuten
      message: {
        error: 'Too many requests, please try again later.'
      }
    });
  }
}

module.exports = RateLimiter;