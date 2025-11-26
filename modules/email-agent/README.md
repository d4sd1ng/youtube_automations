# @agents/email-agent

E-Mail Agent für automatische E-Mail-Generierung und Versand mit KI-Unterstützung.

## Übersicht

Dieser Service bietet Funktionen für:
- KI-gestützte E-Mail-Inhaltsgenerierung (selbständig und nach Vorgabe)
- Automatischer E-Mail-Versand
- E-Mail-Vorlagenverwaltung
- Tracking von E-Mail-Aktivitäten
- Automatisierte E-Mail-Prozesse

## Installation

```bash
npm install @agents/email-agent
```

## Verwendung

### Als Library

```javascript
const EmailAgentService = require('@agents/email-agent');

const emailAgent = new EmailAgentService({
  smtpConfig: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  }
});

// E-Mail-Inhalt eigenständig generieren
const content = await emailAgent.generateEmailContent({
  topic: 'Neues Produktangebot',
  recipientType: 'Kunde',
  tone: 'freundlich',
  language: 'de'
});

// E-Mail-Inhalt nach Vorlage generieren
const templateContent = await emailAgent.generateEmailContent({
  topic: 'Neues Produktangebot',
  recipientType: 'Kunde',
  tone: 'freundlich',
  language: 'de',
  template: {
    subject: 'Exklusives Angebot für {{name}}',
    body: 'Sehr geehrte/r {{name}},\n\nwir haben ein exklusives Angebot für Sie...'
  }
});

// E-Mail senden
const result = await emailAgent.sendEmail({
  to: 'empfaenger@example.com',
  subject: content.subject,
  body: content.body
});

// Automatischer E-Mail-Versand
const autoResult = await emailAgent.autoSendEmail(
  { type: 'welcome' },
  { user: { name: 'Max Mustermann', email: 'max@example.com' } }
);
```

### Als Standalone-Service

```bash
npm start
```

Der Service wird auf Port 3007 gestartet.

## API-Endpunkte

- `GET /health` - Health Check
- `GET /test-connection` - SMTP-Verbindung testen
- `POST /generate-content` - E-Mail-Inhalt generieren (selbständig und nach Vorgabe)
- `POST /send` - E-Mail senden
- `POST /send-bulk` - Massen-E-Mail-Versand
- `POST /templates` - E-Mail-Vorlage speichern
- `GET /templates/:templateId` - E-Mail-Vorlage abrufen
- `POST /auto-send` - Automatischer E-Mail-Versand

## Umgebungsvariablen

Der Service kann mit folgenden Umgebungsvariablen konfiguriert werden:

- `EMAIL_AGENT_PORT` - Port für den Service (Standard: 3007)
- `SMTP_HOST` - SMTP-Server-Host (Standard: smtp.gmail.com)
- `SMTP_PORT` - SMTP-Server-Port (Standard: 587)
- `SMTP_SECURE` - Sichere Verbindung (Standard: false)
- `SMTP_USER` - SMTP-Benutzername
- `SMTP_PASS` - SMTP-Passwort
- `AI_API_ENDPOINT` - API-Endpunkt für KI-Inhaltsgenerierung
- `AI_API_KEY` - API-Schlüssel für KI-Service
- `DEFAULT_LANGUAGE` - Standardsprache (Standard: de)

## Lizenz

ISC