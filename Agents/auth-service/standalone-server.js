const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AuthService = require('./authService');
const RateLimitingMiddleware = require('../rate-limiter/middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Initialize Rate Limiting Middleware
const rateLimitingMiddleware = new RateLimitingMiddleware();
const securityHeaders = rateLimitingMiddleware.securityHeaders();
const generalLimiter = rateLimitingMiddleware.generalLimiter();
const authLimiter = rateLimitingMiddleware.authLimiter();

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityHeaders);

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Initialize Auth service
const authService = new AuthService();

// Initialize database connection
const initDatabase = async () => {
  try {
    await authService.initDB();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User registration endpoint (mit Auth Rate Limiting)
app.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.registerUser({ email, password, name });
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User authentication endpoint (mit Auth Rate Limiting)
app.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticateUser(email, password);
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Key validation endpoint
app.post('/validate-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await authService.validateAPIKey(apiKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token validation endpoint
app.post('/validate-token', (req, res) => {
  try {
    const { token } = req.body;
    const result = authService.validateToken(token);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server and initialize database
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Auth Service Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;