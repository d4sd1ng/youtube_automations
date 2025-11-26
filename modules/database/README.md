# Database Service

Zentraler Datenbankdienst für alle Microservices der Anwendung.

## Übersicht

Dieser Service bietet eine einheitliche Schnittstelle für alle Datenbankoperationen und verwendet MongoDB als zugrunde liegende Datenbanktechnologie.

## Funktionen

- Verbindung mit MongoDB
- CRUD-Operationen (Create, Read, Update, Delete)
- Collection-Management
- Fehlerbehandlung und Logging

## Verwendung

```javascript
const DatabaseService = require('@agents/database');

// Initialisierung
const dbService = new DatabaseService();

// Verbindung herstellen
await dbService.connect('mongodb://localhost:27017', 'agents');

// Dokument einfügen
await dbService.insertOne('users', { name: 'Max Mustermann', email: 'max@example.com' });

// Dokument suchen
const user = await dbService.findOne('users', { email: 'max@example.com' });

// Dokument aktualisieren
await dbService.updateOne('users', { email: 'max@example.com' }, { $set: { name: 'Maximilian Mustermann' } });

// Verbindung trennen
await dbService.disconnect();
```

## Umgebungsvariablen

- `MONGODB_URI` - MongoDB Verbindungs-URI
- `MONGODB_DB_NAME` - Name der Datenbank

## Lizenz

ISC