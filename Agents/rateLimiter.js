const rateLimit = require('express-rate-limit');
const Redis = require('redis');

class RateLimiter {
  constructor() {
    this.redisClient = null;
    this.isEnabled = process.env.ENABLE_RATE_LIMITING === 'true';

    if (this.isEnabled && process.env.REDIS_URL) {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis error:', err);
      });

      this.redisClient.connect().catch(console.error);
    }
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

    // Wenn Redis aktiv ist, verwenden wir Redis-basiertes Rate-Limiting
    if (this.redisClient && this.isEnabled) {
      return this.createRedisLimiter(config);
    }

    // Andernfalls verwenden wir das standardmäßige Memory-basierte Rate-Limiting
    return rateLimit(config);
  }

  /**
   * Erstellt eine Redis-basierte Rate-Limit-Middleware
   * @param {Object} config - Rate-Limit-Konfiguration
   * @returns {Function} Express-Middleware
   */
  createRedisLimiter(config) {
    return async (req, res, next) => {
      if (!this.isEnabled) {
        return next();
      }

      try {
        const key = config.keyGenerator
          ? config.keyGenerator(req)
          : req.ip + req.originalUrl;

        const redisKey = `rate-limit:${key}`;
        const current = await this.redisClient.incr(redisKey);

        if (current === 1) {
          await this.redisClient.expire(redisKey, config.windowMs / 1000);
        }

        const ttl = await this.redisClient.ttl(redisKey);

        res.set({
          'X-RateLimit-Limit': config.max,
          'X-RateLimit-Remaining': Math.max(0, config.max - current),
          'X-RateLimit-Reset': new Date(Date.now() + ttl * 1000)
        });

        if (current > config.max) {
          return res.status(429).json(config.message);
        }

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // Im Fehlerfall erlauben wir die Anfrage, um die Verfügbarkeit nicht zu beeinträchtigen
        next();
      }
    };
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