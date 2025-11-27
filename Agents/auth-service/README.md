# @agents/auth-service

Authentication and authorization service for the AGENTS SaaS platform.

## Installation

```bash
npm install @agents/auth-service
```

## Usage

### As a Library

```javascript
const AuthService = require('@agents/auth-service');

const authService = new AuthService({
  jwtSecret: 'your-secret-key',
  jwtExpiration: '24h'
});

// Register a new user
const registrationResult = await authService.registerUser({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe'
});

// Authenticate a user
const authResult = await authService.authenticateUser('user@example.com', 'securepassword');

// Validate a JWT token
const validationResult = authService.validateToken(token);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3001.

## API Endpoints

- `GET /health` - Health check
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /validate-api-key` - API key validation
- `POST /validate-token` - JWT token validation

## Configuration

The service can be configured with the following environment variables:

- `JWT_SECRET` - Secret key for JWT token signing (default: 'default_secret')
- `JWT_EXPIRATION` - JWT token expiration time (default: '24h')
- `AUTH_SERVICE_PORT` - Port for the standalone server (default: 3001)

## License

ISC