const crypto = require('crypto');

class ApiKeyManager {
  constructor() {
    // In production, this would be stored in a database
    this.apiKeys = new Map();

    // Load default API key from environment variables
    const defaultApiKey = process.env.API_KEY || this.generateApiKey();
    this.apiKeys.set(defaultApiKey, {
      id: 'default',
      name: 'Default API Key',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      lastUsed: null
    });
  }

  /**
   * Generates a new API key
   * @returns {string} New API key
   */
  generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a new API key
   * @param {Object} options - Key options
   * @returns {Object} New API key and metadata
   */
  createApiKey(options = {}) {
    const apiKey = this.generateApiKey();
    const keyData = {
      id: options.id || crypto.randomBytes(8).toString('hex'),
      name: options.name || 'Unnamed API Key',
      permissions: options.permissions || ['read'],
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    this.apiKeys.set(apiKey, keyData);

    return {
      apiKey,
      ...keyData
    };
  }

  /**
   * Validates an API key
   * @param {string} apiKey - API key to validate
   * @returns {Object|null} Key metadata or null if invalid
   */
  validateApiKey(apiKey) {
    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) {
      return null;
    }

    // Update last used timestamp
    keyData.lastUsed = new Date().toISOString();
    this.apiKeys.set(apiKey, keyData);

    return keyData;
  }

  /**
   * Revokes an API key
   * @param {string} apiKey - API key to revoke
   * @returns {boolean} True if key was revoked
   */
  revokeApiKey(apiKey) {
    return this.apiKeys.delete(apiKey);
  }

  /**
   * Gets all API keys (without exposing the actual keys)
   * @returns {Array} Key metadata
   */
  listApiKeys() {
    const keys = [];
    for (const [key, value] of this.apiKeys.entries()) {
      keys.push({
        id: value.id,
        name: value.name,
        permissions: value.permissions,
        createdAt: value.createdAt,
        lastUsed: value.lastUsed
      });
    }
    return keys;
  }

  /**
   * Updates an API key
   * @param {string} apiKey - API key to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} True if updated
   */
  updateApiKey(apiKey, updates) {
    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) {
      return false;
    }

    // Apply updates
    Object.assign(keyData, updates);
    this.apiKeys.set(apiKey, keyData);

    return true;
  }
}

module.exports = ApiKeyManager;