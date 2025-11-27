const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const DatabaseService = require('../database/dbService');

/**
 * AuthService - Service für Authentifizierung und Autorisierung
 *
 * Dieser Service bietet Funktionen für:
 * - Benutzerregistrierung und -authentifizierung
 * - JWT-Token-Generierung und -Validierung
 * - Passwort-Hashing und -Validierung
 * - API-Key-Management
 */
class AuthService {
  constructor(options = {}) {
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
    this.saltRounds = 10;
    this.dbService = new DatabaseService();
  }

  /**
   * Initialisiert die Datenbankverbindung
   */
  async initDB() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DB_NAME || 'agents';
      await this.dbService.connect(mongoUri, dbName);
      console.log('✅ Auth Service: Datenbankverbindung hergestellt');
    } catch (error) {
      console.error('❌ Auth Service: Fehler bei der Datenbankverbindung:', error);
      throw error;
    }
  }

  /**
   * Registriert einen neuen Benutzer
   * @param {Object} userData - Benutzerdaten (email, password, name)
   * @returns {Object} Token und Benutzerdaten (ohne Passwort)
   */
  async registerUser(userData) {
    try {
      // Validierung der Benutzerdaten
      if (!userData.email || !userData.password) {
        throw new Error('Email und Passwort sind erforderlich');
      }

      // Prüfen ob Benutzer bereits existiert
      const existingUser = await this.dbService.findOne('users', { email: userData.email });
      if (existingUser) {
        throw new Error('Benutzer mit dieser E-Mail existiert bereits');
      }

      // Passwort hashen
      const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);

      // Benutzerobjekt erstellen
      const user = {
        id: this.generateUserId(),
        email: userData.email,
        name: userData.name || 'Anonymous',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        apiKey: this.generateAPIKey()
      };

      // Benutzer in der Datenbank speichern
      await this.dbService.insertOne('users', user);

      // JWT-Token generieren
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.jwtSecret,
        { expiresIn: this.jwtExpiration }
      );

      // Passwort aus dem Rückgabeobjekt entfernen
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Authentifiziert einen Benutzer
   * @param {string} email - Benutzer-E-Mail
   * @param {string} password - Benutzer-Passwort
   * @returns {Object} Token und Benutzerdaten
   */
  async authenticateUser(email, password) {
    try {
      // Benutzer aus der Datenbank laden
      const user = await this.findUserByEmail(email);

      if (!user) {
        throw new Error('Benutzer nicht gefunden');
      }

      // Passwort validieren
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Ungültiges Passwort');
      }

      // JWT-Token generieren
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.jwtSecret,
        { expiresIn: this.jwtExpiration }
      );

      // Passwort aus dem Rückgabeobjekt entfernen
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validiert ein JWT-Token
   * @param {string} token - JWT-Token
   * @returns {Object} Decodierte Token-Daten oder Fehler
   */
  validateToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return {
        success: true,
        decoded
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Findet einen Benutzer anhand der E-Mail
   * @param {string} email - Benutzer-E-Mail
   * @returns {Object|null} Benutzerobjekt oder null
   */
  async findUserByEmail(email) {
    // Benutzer aus der Datenbank laden
    const user = await this.dbService.findOne('users', { email: email });
    return user;
  }

  /**
   * Findet einen Benutzer anhand der ID
   * @param {string} userId - Benutzer-ID
   * @returns {Object|null} Benutzerobjekt oder null
   */
  async findUserById(userId) {
    // Benutzer aus der Datenbank laden
    const user = await this.dbService.findOne('users', { id: userId });
    return user;
  }

  /**
   * Generiert eine eindeutige Benutzer-ID
   * @returns {string} Eindeutige Benutzer-ID
   */
  generateUserId() {
    return 'user_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generiert einen API-Key
   * @returns {string} API-Key
   */
  generateAPIKey() {
    return 'api_' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validiert einen API-Key
   * @param {string} apiKey - API-Key
   * @returns {Object} Validierungsergebnis
   */
  async validateAPIKey(apiKey) {
    // API-Key aus der Datenbank laden
    const user = await this.dbService.findOne('users', { apiKey: apiKey });

    if (user) {
      return {
        success: true,
        userId: user.id
      };
    }

    return {
      success: false,
      error: 'Ungültiger API-Key'
    };
  }
}

module.exports = AuthService;