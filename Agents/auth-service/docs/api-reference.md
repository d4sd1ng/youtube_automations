# Auth Service API Reference

## Base URL
```
http://localhost:3001
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

### User Registration
```
POST /register
```
Registers a new user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "createdAt": "string",
    "apiKey": "string"
  }
}
```

### User Authentication
```
POST /login
```
Authenticates a user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "createdAt": "string",
    "apiKey": "string"
  }
}
```

### API Key Validation
```
POST /validate-api-key
```
Validates an API key.

**Request Body:**
```json
{
  "apiKey": "string"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "string"
}
```

### Token Validation
```
POST /validate-token
```
Validates a JWT token.

**Request Body:**
```json
{
  "token": "string"
}
```

**Response:**
```json
{
  "success": true,
  "decoded": {
    "userId": "string",
    "email": "string",
    "iat": "number",
    "exp": "number"
  }
}
```