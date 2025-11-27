const RateLimiterService = require('./rateLimiter');
const rateLimiterService = new RateLimiterService();

/**
 * Rate Limiting Middleware
 * Zentrale Middleware für Rate Limiting in allen Services
 */
class RateLimitingMiddleware {
  constructor() {
    this.rateLimiterService = rateLimiterService;
  }

  /**
   * Allgemeiner Rate Limiter für API-Anfragen
   */
  generalLimiter() {
    return this.rateLimiterService.getGeneralLimiter();
  }

  /**
   * Strikter Rate Limiter für sensible Endpunkte
   */
  strictLimiter() {
    return this.rateLimiterService.getStrictLimiter();
  }

  /**
   * Rate Limiter für Authentifizierungs-Endpunkte
   */
  authLimiter() {
    return this.rateLimiterService.getAuthLimiter();
  }

  /**
   * Rate Limiter für API-Endpunkte
   */
  apiLimiter() {
    return this.rateLimiterService.getApiLimiter();
  }

  /**
   * Benutzerdefinierter Rate Limiter
   * @param {number} windowMs - Zeitfenster in Millisekunden
   * @param {number} max - Maximale Anzahl von Anfragen
   * @param {string} message - Fehlermeldung
   */
  customLimiter(windowMs, max, message) {
    return this.rateLimiterService.createCustomLimiter(windowMs, max, message);
  }

  /**
   * Sicherheitsheader Middleware
   * Fügt wichtige Sicherheitsheader zu allen HTTP-Antworten hinzu
   */
  securityHeaders() {
    return (req, res, next) => {
      // Schutz vor Clickjacking
      res.setHeader('X-Frame-Options', 'DENY');

      // XSS-Schutz
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // MIME-Type-Sniffing-Schutz
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Strict Transport Security (nur für HTTPS)
      // Wird in der Nginx-Konfiguration hinzugefügt, da wir HTTPS dort terminieren

      // Referrer Policy
      res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

      // Permissions Policy
      res.setHeader('Permissions-Policy', "geolocation=(), microphone=(), camera=()");

      // Content Security Policy (grundlegend)
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");

      next();
    };
  }
}

module.exports = RateLimitingMiddleware;