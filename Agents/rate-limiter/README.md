# Rate Limiter Service

Zentraler Service für Rate Limiting in allen Microservices.

## Übersicht

Dieser Service implementiert verschiedene Rate Limiting Strategien für unterschiedliche Anwendungsfälle:

- **General Limiter**: Allgemeine API-Anfragen (100 Anfragen pro 15 Minuten)
- **Strict Limiter**: Sensible Endpunkte (5 Anfragen pro 15 Minuten)
- **Auth Limiter**: Authentifizierungs-Endpunkte (10 Anfragen pro 15 Minuten)
- **API Limiter**: API-Endpunkte (30 Anfragen pro Minute)

## Verwendung

```javascript
const RateLimitingMiddleware = require('../rate-limiter/middleware');

// Initialize Rate Limiting Middleware
const rateLimitingMiddleware = new RateLimitingMiddleware();
const generalLimiter = rateLimitingMiddleware.generalLimiter();
const strictLimiter = rateLimitingMiddleware.strictLimiter();
const authLimiter = rateLimitingMiddleware.authLimiter();
const apiLimiter = rateLimitingMiddleware.apiLimiter();

// Anwendung auf Endpunkte
app.use(generalLimiter); // Allgemeines Rate Limiting für alle Anfragen
app.post('/sensitive-endpoint', strictLimiter, handler); // Striktes Limit für sensible Endpunkte
```

## Sicherheitsheader

Der Service fügt auch wichtige Sicherheitsheader zu allen HTTP-Antworten hinzu:

- `X-Frame-Options`: Schutz vor Clickjacking
- `X-XSS-Protection`: XSS-Schutz
- `X-Content-Type-Options`: MIME-Type-Sniffing-Schutz
- `Strict-Transport-Security`: HSTS (in Nginx konfiguriert)
- `Referrer-Policy`: Kontrolle über Referrer-Informationen
- `Permissions-Policy`: Kontrolle über Browser-Features
- `Content-Security-Policy`: Schutz vor XSS und anderen Injection-Angriffen

## HTTPS-Konfiguration

Die HTTPS-Konfiguration wird in der Nginx-Konfiguration durchgeführt:

- TLS 1.2 und 1.3 Unterstützung
- Starke Cipher Suites
- HSTS (HTTP Strict Transport Security)
- HTTP zu HTTPS Redirect

## Lizenz

ISC