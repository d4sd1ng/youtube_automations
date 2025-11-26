const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'agents-default-secret-key-change-in-production';
    this.tokenExpiry = process.env.JWT_EXPIRY || '24h';
  }

  /**
   * Generiert ein JWT-Token für einen Benutzer
   * @param {Object} user - Benutzerobjekt
   * @returns {String} JWT-Token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions || []
    };

    return jwt.sign(payload, this.secret, { expiresIn: this.tokenExpiry });
  }

  /**
   * Verifiziert ein JWT-Token
   * @param {String} token - JWT-Token
   * @returns {Object|null} Decodiertes Token oder null bei Fehler
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Hash ein Passwort
   * @param {String} password - Klartext-Passwort
   * @returns {String} Gehashtes Passwort
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Vergleicht ein Klartext-Passwort mit einem Hash
   * @param {String} password - Klartext-Passwort
   * @param {String} hash - Gehashtes Passwort
   * @returns {Boolean} True wenn Passwörter übereinstimmen
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Überprüft, ob ein Benutzer eine bestimmte Berechtigung hat
   * @param {Object} user - Benutzerobjekt
   * @param {String} permission - Erforderliche Berechtigung
   * @returns {Boolean} True wenn Benutzer die Berechtigung hat
   */
  hasPermission(user, permission) {
    return user.permissions && user.permissions.includes(permission);
  }

  /**
   * Überprüft, ob ein Benutzer eine bestimmte Rolle hat
   * @param {Object} user - Benutzerobjekt
   * @param {String} role - Erforderliche Rolle
   * @returns {Boolean} True wenn Benutzer die Rolle hat
   */
  hasRole(user, role) {
    return user.role === role;
  }
}

module.exports = AuthService;