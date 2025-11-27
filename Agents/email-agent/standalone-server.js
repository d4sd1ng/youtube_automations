const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const EmailAgentService = require('./emailAgentService');
const RateLimitingMiddleware = require('../rate-limiter/middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.EMAIL_AGENT_PORT || 3007;

// Initialize Rate Limiting Middleware
const rateLimitingMiddleware = new RateLimitingMiddleware();
const securityHeaders = rateLimitingMiddleware.securityHeaders();
const generalLimiter = rateLimitingMiddleware.generalLimiter();
const apiLimiter = rateLimitingMiddleware.apiLimiter();

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityHeaders);

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Initialize Email Agent service
const emailAgentService = new EmailAgentService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test SMTP connection endpoint
app.get('/test-connection', async (req, res) => {
  try {
    const result = await emailAgentService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate email content endpoint (mit API Rate Limiting)
app.post('/generate-content', apiLimiter, async (req, res) => {
  try {
    const params = req.body;
    const result = await emailAgentService.generateEmailContent(params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send email endpoint (mit API Rate Limiting)
app.post('/send', apiLimiter, async (req, res) => {
  try {
    const emailData = req.body;
    const result = await emailAgentService.sendEmail(emailData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send bulk email endpoint (mit striktem Rate Limiting)
app.post('/send-bulk', rateLimitingMiddleware.strictLimiter(), async (req, res) => {
  try {
    const { recipients, template } = req.body;
    const result = await emailAgentService.sendBulkEmail(recipients, template);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save template endpoint
app.post('/templates', async (req, res) => {
  try {
    const template = req.body;
    const result = await emailAgentService.saveTemplate(template);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get template endpoint
app.get('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const result = await emailAgentService.getTemplate(templateId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auto-send email endpoint (für automatisierte E-Mail-Versandprozesse)
app.post('/auto-send', apiLimiter, async (req, res) => {
  try {
    const { trigger, context } = req.body;
    const result = await emailAgentService.autoSendEmail(trigger, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Email Agent Service running on port ${PORT}`);
});

module.exports = app;