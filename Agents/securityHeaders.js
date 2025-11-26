/**
 * Security Headers Middleware
 * Adds additional security headers to all responses
 */

const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control where scripts can be loaded from
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;");

  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Permissions Policy
  res.setHeader('Permissions-Policy', "geolocation=(), microphone=(), camera=()");

  next();
};

module.exports = securityHeaders;