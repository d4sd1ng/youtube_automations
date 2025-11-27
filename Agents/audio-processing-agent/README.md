# Audio Processing Agent

Der Audio Processing Agent ist ein Python-basierter Microservice zur Verarbeitung von Audiodateien, Extraktion von Audio-Merkmalen und Generierung von Wellenformdaten.

## Funktionen

- **Audioverarbeitung**: Komprimiert, konvertiert und passt Audiodateien an
- **Merkmalextraktion**: Extrahiert Merkmale wie Tempo, Tonart und Lautstärke aus Audiodateien
- **Wellenformgenerierung**: Erstellt Wellenformdaten aus Audiodateien

## API Endpunkte

- `GET /health` - Health Check
- `POST /process-audio` - Verarbeitet eine Audiodatei (Komprimierung, Formatkonvertierung, Lautstärkeanpassung)
- `POST /extract-features` - Extrahiert Merkmale aus einer Audiodatei (Tempo, Tonart, Lautstärke)
- `POST /generate-waveform` - Generiert Wellenformdaten aus einer Audiodatei

## Technologie-Stack

- Python 3.9
- Flask für die REST API

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t audio-processing-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 audio-processing-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Audio verarbeiten
curl -X POST http://localhost:5000/process-audio \
  -H "Content-Type: application/json" \
  -d '{"audio_path": "/path/to/audio.mp3", "options": {"bitrate": "128k", "format": "mp3"}}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.