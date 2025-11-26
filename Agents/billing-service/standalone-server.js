const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const BillingService = require('./billingService');
const RateLimitingMiddleware = require('../rate-limiter/middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BILLING_SERVICE_PORT || 3002;

// Initialize Rate Limiting Middleware
const rateLimitingMiddleware = new RateLimitingMiddleware();
const securityHeaders = rateLimitingMiddleware.securityHeaders();
const generalLimiter = rateLimitingMiddleware.generalLimiter();
const strictLimiter = rateLimitingMiddleware.strictLimiter();

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityHeaders);

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Initialize Billing service
const billingService = new BillingService();

// Initialize database connection
const initDatabase = async () => {
  try {
    await billingService.initDB();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get available plans
app.get('/plans', (req, res) => {
  try {
    const plans = billingService.getPlans();
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create customer (mit striktem Rate Limiting)
app.post('/customers', strictLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;
    const result = await billingService.createCustomer({ email, name });
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add payment method to customer
app.post('/customers/:customerId/payment-methods', strictLimiter, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { paymentMethod } = req.body;
    const result = await billingService.addPaymentMethod(customerId, paymentMethod);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Set default payment method
app.put('/customers/:customerId/payment-methods/:paymentMethodId/default', strictLimiter, async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.params;
    const result = await billingService.setDefaultPaymentMethod(customerId, paymentMethodId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove payment method from customer
app.delete('/customers/:customerId/payment-methods/:paymentMethodId', strictLimiter, async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.params;
    const result = await billingService.removePaymentMethod(customerId, paymentMethodId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update subscription (mit striktem Rate Limiting)
app.put('/customers/:customerId/subscription', strictLimiter, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { plan } = req.body;
    const result = await billingService.updateSubscription(customerId, plan);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check usage limit
app.get('/customers/:customerId/usage', async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await billingService.checkUsageLimit(customerId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Increment usage (mit striktem Rate Limiting)
app.post('/customers/:customerId/usage', strictLimiter, async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await billingService.incrementUsage(customerId);
    if (result.success) {
      res.json(result);
    } else {
      // Wenn das Limit erreicht ist, senden wir einen 429 Status (Too Many Requests)
      if (result.error === 'Nutzungslimit erreicht') {
        res.status(429).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create invoice (mit striktem Rate Limiting)
app.post('/customers/:customerId/invoices', strictLimiter, async (req, res) => {
  try {
    const { customerId } = req.params;
    const invoiceData = req.body;
    const result = await billingService.createInvoice(customerId, invoiceData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process payment (mit striktem Rate Limiting)
app.post('/customers/:customerId/payments', strictLimiter, async (req, res) => {
  try {
    const { customerId } = req.params;
    const paymentData = req.body;
    const result = await billingService.processPayment(customerId, paymentData);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
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

// Start server and initialize database
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Billing Service Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;