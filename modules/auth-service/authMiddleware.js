const AuthService = require('./authService');
const ApiKeyManager = require('./apiKeys');

const authService = new AuthService();
const apiKeyManager = new ApiKeyManager();

/**
 * Middleware zur Token-Authentifizierung
 * @param {Object} req - Express Request-Objekt
 * @param {Object} res - Express Response-Objekt
 * @param {Function} next - Nächste Middleware-Funktion
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware zur Rollenprüfung
 * @param {String} role - Erforderliche Rolle
 * @returns {Function} Express Middleware
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!authService.hasRole(req.user, role)) {
      return res.status(403).json({ error: `Role '${role}' required` });
    }

    next();
  };
}

/**
 * Middleware zur Berechtigungsprüfung
 * @param {String} permission - Erforderliche Berechtigung
 * @returns {Function} Express Middleware
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!authService.hasPermission(req.user, permission)) {
      return res.status(403).json({ error: `Permission '${permission}' required` });
    }

    next();
  };
}

/**
 * Middleware zur API-Key-Authentifizierung
 * @param {Object} req - Express Request-Objekt
 * @param {Object} res - Express Response-Objekt
 * @param {Function} next - Nächste Middleware-Funktion
 */
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyData = apiKeyManager.validateApiKey(apiKey);
  if (!keyData) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.apiKey = keyData;
  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  authenticateApiKey
};