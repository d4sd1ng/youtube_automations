const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Service
 * Implementiert Rate Limiting für verschiedene Arten von Anfragen
 */
class RateLimiterService {
  constructor() {
    // Standard Rate Limit für allgemeine API-Anfragen
    this.generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 100, // Limitiert auf 100 Anfragen pro Fenster pro IP
      message: {
        error: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Strict Rate Limit für sensible Endpunkte (z.B. Auth, Zahlungen)
    this.strictLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 5, // Limitiert auf 5 Anfragen pro Fenster pro IP
      message: {
        error: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Auth Rate Limit
    this.authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 Minuten
      max: 10, // Limitiert auf 10 Anfragen pro Fenster pro IP
      message: {
        error: 'Zu viele Authentifizierungsversuche. Bitte versuchen Sie es später erneut.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // API-Endpunkt Rate Limit
    this.apiLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 Minute
      max: 30, // Limitiert auf 30 Anfragen pro Fenster pro IP
      message: {
        error: 'API-Rate-Limit überschritten. Bitte reduzieren Sie die Anfragen.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * Gibt den allgemeinen Rate Limiter zurück
   */
  getGeneralLimiter() {
    return this.generalLimiter;
  }

  /**
   * Gibt den strikten Rate Limiter zurück
   */
  getStrictLimiter() {
    return this.strictLimiter;
  }

  /**
   * Gibt den Auth Rate Limiter zurück
   */
  getAuthLimiter() {
    return this.authLimiter;
  }

  /**
   * Gibt den API Rate Limiter zurück
   */
  getApiLimiter() {
    return this.apiLimiter;
  }

  /**
   * Erstellt einen benutzerdefinierten Rate Limiter
   * @param {number} windowMs - Zeitfenster in Millisekunden
   * @param {number} max - Maximale Anzahl von Anfragen
   * @param {string} message - Fehlermeldung
   */
  createCustomLimiter(windowMs, max, message = 'Rate limit überschritten') {
    return rateLimit({
      windowMs,
      max,
      message: {
        error: message
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
}

module.exports = RateLimiterService;