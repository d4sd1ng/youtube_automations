# Billing Service API Reference

## Base URL
```
http://localhost:3002
```

## Endpoints

### Health Check
```
GET /health
```
Returns the health status of the service.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Get Available Plans
```
GET /plans
```
Returns the available subscription plans.

**Response:**
```json
{
  "success": true,
  "plans": {
    "free": {
      "name": "Free",
      "price": 0,
      "requestsPerDay": 100,
      "features": ["string"]
    },
    "pro": {
      "name": "Pro",
      "price": 29.99,
      "requestsPerDay": 1000,
      "features": ["string"]
    },
    "enterprise": {
      "name": "Enterprise",
      "price": 99.99,
      "requestsPerDay": 10000,
      "features": ["string"]
    }
  }
}
```

### Create Customer
```
POST /customers
```
Creates a new customer.

**Request Body:**
```json
{
  "email": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": "string",
    "email": "string",
    "name": "string",
    "subscription": {
      "plan": "string",
      "startDate": "string",
      "endDate": "string",
      "status": "string"
    },
    "usage": {
      "currentDay": "string",
      "requests": "number",
      "limit": "number"
    },
    "paymentMethods": ["string"],
    "invoices": ["string"],
    "createdAt": "string"
  }
}
```

### Update Subscription
```
PUT /customers/{customerId}/subscription
```
Updates a customer's subscription.

**Request Body:**
```json
{
  "plan": "string"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "plan": "string",
    "startDate": "string",
    "endDate": "string",
    "status": "string"
  }
}
```

### Check Usage Limit
```
GET /customers/{customerId}/usage
```
Checks a customer's usage limit.

**Response:**
```json
{
  "success": true,
  "usage": {
    "current": "number",
    "limit": "number",
    "remaining": "number",
    "resetDate": "string"
  },
  "isOverLimit": "boolean"
}
```

### Increment Usage
```
POST /customers/{customerId}/usage
```
Increments a customer's usage.

**Response:**
```json
{
  "success": true,
  "usage": {
    "current": "number",
    "limit": "number",
    "remaining": "number",
    "resetDate": "string"
  },
  "isOverLimit": "boolean"
}
```

### Create Invoice
```
POST /customers/{customerId}/invoices
```
Creates an invoice for a customer.

**Request Body:**
```json
{
  "amount": "number",
  "currency": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {
    "id": "string",
    "customerId": "string",
    "amount": "number",
    "currency": "string",
    "description": "string",
    "status": "string",
    "createdAt": "string",
    "dueDate": "string"
  }
}
```

### Process Payment
```
POST /customers/{customerId}/payments
```
Processes a payment for a customer.

**Request Body:**
```json
{
  "amount": "number",
  "currency": "string",
  "method": "string"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "string",
    "customerId": "string",
    "amount": "number",
    "currency": "string",
    "method": "string",
    "status": "string",
    "processedAt": "string"
  }
}
```