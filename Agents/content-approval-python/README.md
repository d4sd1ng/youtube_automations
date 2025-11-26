# Content Approval Agent

Der Content Approval Agent ist ein Python-basierter Microservice zur automatisierten Überprüfung und Genehmigung von Inhalten auf Grundlage vordefinierter Richtlinien.

## Funktionen

- **Inhaltsüberprüfung**: Überprüft Inhalte auf Einhaltung von Richtlinien und Standards
- **Überprüfungsverlauf**: Verfolgt den Verlauf aller Inhaltsüberprüfungen
- **Richtlinienaktualisierung**: Ermöglicht die Aktualisierung von Genehmigungsrichtlinien

## API Endpunkte

- `GET /health` - Health Check
- `POST /review-content` - Überprüft Inhalte auf Genehmigung
- `GET /review-history` - Ruft den Verlauf der Inhaltsüberprüfungen ab
- `POST /update-policy` - Aktualisiert die Genehmigungsrichtlinien

## Technologie-Stack

- Python 3.9
- Flask für die REST API

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t content-approval-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 content-approval-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Inhalt überprüfen
curl -X POST http://localhost:5000/review-content \
  -H "Content-Type: application/json" \
  -d '{"content": "Dies ist ein Beispielinhalt zur Überprüfung."}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.