# Avatar Generation Agent

Der Avatar Generation Agent ist ein Python-basierter Microservice zur Erstellung und Anpassung von Avataren basierend auf Textbeschreibungen.

## Funktionen

- **Avatar-Generierung**: Erstellt Avatare aus Textbeschreibungen
- **Avatar-Anpassung**: Passt bestehende Avatare an individuelle Vorlieben an
- **Avatar-Rendering**: Rendert Avatare als Bilddateien

## API Endpunkte

- `GET /health` - Health Check
- `POST /generate-avatar` - Generiert einen Avatar basierend auf einer Textbeschreibung
- `POST /customize-avatar` - Passt einen bestehenden Avatar an
- `POST /render-avatar` - Rendert einen Avatar als Bild

## Technologie-Stack

- Python 3.9
- Flask für die REST API
- Pillow für Bildverarbeitung

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t avatar-generation-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 avatar-generation-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Avatar generieren
curl -X POST http://localhost:5000/generate-avatar \
  -H "Content-Type: application/json" \
  -d '{"description": "Ein Cartoon-Avatar mit braunen Haaren und blauen Augen"}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.