# Thumbnail Generation Agent

Der Thumbnail Generation Agent ist ein Python-basierter Microservice zur Erstellung von Vorschaubildern aus Bildern und Videos mit verschiedenen Größen und Effekten.

## Funktionen

- **Thumbnail-Generierung**: Erstellt Vorschaubilder aus Bildern
- **Mehrere Thumbnails**: Generiert mehrere Vorschaubilder mit unterschiedlichen Größen
- **Effektanwendung**: Wendet visuelle Effekte auf Vorschaubilder an

## API Endpunkte

- `GET /health` - Health Check
- `POST /generate-thumbnail` - Generiert ein Vorschaubild aus einem Bild
- `POST /generate-multiple` - Generiert mehrere Vorschaubilder mit verschiedenen Größen
- `POST /apply-effects` - Wendet visuelle Effekte auf ein Vorschaubild an

## Technologie-Stack

- Python 3.9
- Flask für die REST API

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t thumbnail-generation-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 thumbnail-generation-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Thumbnail generieren
curl -X POST http://localhost:5000/generate-thumbnail \
  -H "Content-Type: application/json" \
  -d '{"image_path": "/path/to/image.jpg"}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.