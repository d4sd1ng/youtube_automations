const AuthService = require('./authService');
const ApiKeyManager = require('./apiKeys');

const authService = new AuthService();
const apiKeyManager = new ApiKeyManager();

class AuthController {
  /**
   * User login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Username and password are required'
        });
      }

      // In a real application, this would query a database
      // For this example, we're using a mock user
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // 'password' hashed
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin']
        },
        {
          id: 2,
          username: 'user',
          password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // 'password' hashed
          role: 'user',
          permissions: ['read', 'write']
        }
      ];

      const user = mockUsers.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      const isPasswordValid = await authService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      const token = authService.generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions
        },
        message: 'Login successful'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * User registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      // Registration is not implemented in this example
      res.status(501).json({
        error: 'Registration not implemented',
        message: 'User registration is not available in this demo'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static getProfile(req, res) {
    res.json({
      success: true,
      user: req.user,
      message: 'Profile retrieved successfully'
    });
  }

  /**
   * Create a new API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static createApiKey(req, res) {
    try {
      const { name, permissions } = req.body;

      // Only admins can create API keys in this example
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'Only administrators can create API keys'
        });
      }

      const newKey = apiKeyManager.createApiKey({
        name,
        permissions
      });

      res.status(201).json({
        success: true,
        apiKey: newKey.apiKey,
        keyData: {
          id: newKey.id,
          name: newKey.name,
          permissions: newKey.permissions,
          createdAt: newKey.createdAt
        },
        message: 'API key created successfully'
      });

    } catch (error) {
      console.error('API key creation error:', error);
      res.status(500).json({
        error: 'API key creation failed',
        message: error.message
      });
    }
  }

  /**
   * List all API keys
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static listApiKeys(req, res) {
    try {
      // Only admins can list API keys
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'Only administrators can list API keys'
        });
      }

      const keys = apiKeyManager.listApiKeys();

      res.json({
        success: true,
        keys,
        count: keys.length,
        message: 'API keys retrieved successfully'
      });

    } catch (error) {
      console.error('API key listing error:', error);
      res.status(500).json({
        error: 'Failed to retrieve API keys',
        message: error.message
      });
    }
  }

  /**
   * Revoke an API key
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static revokeApiKey(req, res) {
    try {
      const { apiKey } = req.body;

      // Only admins can revoke API keys
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'Only administrators can revoke API keys'
        });
      }

      if (!apiKey) {
        return res.status(400).json({
          error: 'API key is required',
          message: 'Please provide an API key to revoke'
        });
      }

      const result = apiKeyManager.revokeApiKey(apiKey);

      if (!result) {
        return res.status(404).json({
          error: 'API key not found',
          message: 'The specified API key does not exist'
        });
      }

      res.json({
        success: true,
        message: 'API key revoked successfully'
      });

    } catch (error) {
      console.error('API key revocation error:', error);
      res.status(500).json({
        error: 'Failed to revoke API key',
        message: error.message
      });
    }
  }
}

module.exports = AuthController;