const express = require('express');
const AuthController = require('./authController');
const { authenticateToken, requireRole } = require('./authMiddleware');

const router = express.Router();

/**
 * User login endpoint
 */
router.post('/login', AuthController.login);

/**
 * User registration endpoint
 */
router.post('/register', AuthController.register);

/**
 * Get user profile (requires authentication)
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * Create API key (admin only)
 */
router.post('/api-keys', authenticateToken, requireRole('admin'), AuthController.createApiKey);

/**
 * List API keys (admin only)
 */
router.get('/api-keys', authenticateToken, requireRole('admin'), AuthController.listApiKeys);

/**
 * Revoke API key (admin only)
 */
router.delete('/api-keys', authenticateToken, requireRole('admin'), AuthController.revokeApiKey);

/**
 * Get all users (admin only)
 */
router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  // Mock user database (in production, this would be a real database)
  const users = [
    {
      id: 1,
      username: 'admin',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 2,
      username: 'user',
      role: 'user',
      permissions: ['read', 'write']
    }
  ];

  // Return users without passwords
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.json({
    success: true,
    users: usersWithoutPasswords,
    count: usersWithoutPasswords.length
  });
});

module.exports = router;