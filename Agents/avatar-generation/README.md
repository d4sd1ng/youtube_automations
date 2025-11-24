# Avatar Generation Agent

Ein eigenständiger Agent zur Erstellung und Verwaltung von KI-Avataren für YouTube-Automatisierungen.

## Funktionen

- Erstellung von Avataren aus vorgefertigten Templates
- Erstellung von Avataren von Grund auf
- Verwaltung vorhandener Avatare
- Template-Verwaltung
- Avatar-Training mit zusätzlichen Daten
- Job-Status-Überwachung

## API-Endpunkte

### Health & Status
- `GET /health` - Agent Health Check
- `GET /status` - Agent Status

### Avatar Management
- `POST /api/avatar/create` - Neuen Avatar erstellen
- `GET /api/avatar/list` - Alle Avatare auflisten
- `GET /api/avatar/:id` - Avatar nach ID abrufen
- `DELETE /api/avatar/:id` - Avatar löschen

### Template Management
- `GET /api/avatar/templates/list` - Alle Templates auflisten
- `GET /api/avatar/templates/:id` - Template nach ID abrufen

### Avatar Training
- `POST /api/avatar/:id/train` - Avatar mit zusätzlichen Daten trainieren

### Job Management
- `GET /api/avatar/jobs/:id` - Job-Status abrufen
- `GET /api/avatar/jobs` - Alle Jobs auflisten

## Umgebungsvariablen

- `PORT` - Port für den Agenten (Standard: 3011)

## Verwendung

```bash
# Installation
npm install

# Starten des Agenten
npm start

# Entwicklungsmodus
npm run dev
```