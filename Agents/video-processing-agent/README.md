# Video Processing Agent

Der Video Processing Agent ist ein Python-basierter Microservice zur Verarbeitung von Videodateien, Extraktion von Audiospuren und Generierung von Vorschaubildern.

## Funktionen

- **Videoverarbeitung**: Komprimiert, skaliert und konvertiert Videodateien in verschiedene Formate
- **Audioextraktion**: Extrahiert Audiospuren aus Videodateien
- **Thumbnail-Generierung**: Erstellt Vorschaubilder aus Videodateien

## API Endpunkte

- `GET /health` - Health Check
- `POST /process-video` - Verarbeitet eine Videodatei (Komprimierung, Skalierung, Formatkonvertierung)
- `POST /extract-audio` - Extrahiert die Audiospur aus einer Videodatei
- `POST /generate-thumbnails` - Generiert Vorschaubilder aus einer Videodatei

## Technologie-Stack

- Python 3.9
- Flask für die REST API

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t video-processing-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 video-processing-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Video verarbeiten
curl -X POST http://localhost:5000/process-video \
  -H "Content-Type: application/json" \
  -d '{"video_path": "/path/to/video.mp4", "options": {"resolution": "1080p", "format": "mp4"}}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.