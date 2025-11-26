# Script Generation Agent

Der Script Generation Agent ist ein Python-basierter Microservice zur automatisierten Erstellung von Skripten für verschiedene Zwecke wie Bildung, Marketing und Unterhaltung.

## Funktionen

- **Script-Generierung**: Erstellt Skripte basierend auf einem Thema und Anforderungen
- **Script-Verbesserung**: Verbessert bestehende Skripte durch Feinabstimmung
- **Templates**: Bietet vordefinierte Vorlagen für verschiedene Skripttypen

## API Endpunkte

- `GET /health` - Health Check
- `POST /generate-script` - Generiert ein Skript basierend auf einem Thema und Anforderungen
- `POST /refine-script` - Verfeinert ein bestehendes Skript
- `GET /script-templates` - Ruft verfügbare Skriptvorlagen ab

## Technologie-Stack

- Python 3.9
- Flask für die REST API

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t script-generation-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 script-generation-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Script generieren
curl -X POST http://localhost:5000/generate-script \
  -H "Content-Type: application/json" \
  -d '{"topic": "Künstliche Intelligenz", "requirements": {"target_audience": "Entwickler", "tone": "technisch"}}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.