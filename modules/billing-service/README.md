# @agents/billing-service

Billing and monetization service for the AGENTS SaaS platform.

## Installation

```bash
npm install @agents/billing-service
```

## Usage

### As a Library

```javascript
const BillingService = require('@agents/billing-service');

const billingService = new BillingService();

// Create a new customer
const customerResult = await billingService.createCustomer({
  email: 'user@example.com',
  name: 'John Doe'
});

// Update customer subscription
const subscriptionResult = await billingService.updateSubscription(customerId, 'pro');

// Check usage limit
const usageResult = await billingService.checkUsageLimit(customerId);

// Increment usage
const incrementResult = await billingService.incrementUsage(customerId);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3002.

## API Endpoints

- `GET /health` - Health check
- `GET /plans` - Get available subscription plans
- `POST /customers` - Create a new customer
- `PUT /customers/:customerId/subscription` - Update customer subscription
- `GET /customers/:customerId/usage` - Check customer usage limit
- `POST /customers/:customerId/usage` - Increment customer usage
- `POST /customers/:customerId/invoices` - Create an invoice
- `POST /customers/:customerId/payments` - Process a payment

## Configuration

The service can be configured with the following environment variables:

- `BILLING_SERVICE_PORT` - Port for the standalone server (default: 3002)

## License

ISC