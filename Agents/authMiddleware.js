const AuthService = require('./authService');

const authService = new AuthService();

/**
 * Middleware zur JWT-Token-Authentifizierung
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.'
    });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      error: 'Invalid or expired token.'
    });
  }

  req.user = decoded;
  next();
};

/**
 * Middleware zur Rollenbasierten Zugriffskontrolle (RBAC)
 * @param {String|Array} roles - Erforderliche Rolle(n)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const userHasRole = requiredRoles.some(role => authService.hasRole(req.user, role));

    if (!userHasRole) {
      return res.status(403).json({
        error: 'Insufficient permissions. Required role: ' + requiredRoles.join(' or ')
      });
    }

    next();
  };
};

/**
 * Middleware zur Berechtigungsprüfung
 * @param {String|Array} permissions - Erforderliche Berechtigung(en)
 */
const requirePermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.'
      });
    }

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const userHasPermission = requiredPermissions.some(permission =>
      authService.hasPermission(req.user, permission)
    );

    if (!userHasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions. Required permission: ' + requiredPermissions.join(' or ')
      });
    }

    next();
  };
};

/**
 * Middleware für API-Key-Authentifizierung
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({
      error: 'Access denied. No API key provided.'
    });
  }

  // In einer produktiven Umgebung würden wir den API-Key gegen eine Datenbank prüfen
  // Für dieses Beispiel akzeptieren wir einen einfachen statischen Schlüssel
  const validApiKey = process.env.API_KEY || 'agents-default-api-key-change-in-production';

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Invalid API key.'
    });
  }

  // Füge eine einfache Benutzeridentität für API-Key-Zugriffe hinzu
  req.user = {
    id: 'api-client',
    username: 'api-client',
    role: 'client',
    permissions: ['read', 'write']
  };

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  authenticateApiKey
};