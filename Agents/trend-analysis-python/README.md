# Trend Analysis Agent

Der Trend Analysis Agent ist ein Python-basierter Microservice, der Inhalte analysiert, Trends vorhersagt und aktuelle Themen identifiziert.

## Funktionen

- **Trend-Analyse**: Analysiert Inhaltsdaten, um aktuelle Trends zu erkennen
- **Trend-Vorhersage**: Nutzt maschinelles Lernen zur Vorhersage zukünftiger Trends
- **Hot Topic Identifikation**: Identifiziert aktuell beliebte Themen in Echtzeit

## API Endpunkte

- `GET /health` - Health Check
- `POST /analyze-trends` - Analysiert Trends in bereitgestellten Inhaltsdaten
- `POST /predict-trends` - Sagt zukünftige Trends basierend auf historischen Daten voraus
- `POST /identify-hot-topics` - Identifiziert aktuell heiß diskutierte Themen

## Technologie-Stack

- Python 3.9
- Flask für die REST API
- scikit-learn für maschinelles Lernen
- pandas und numpy für Datenanalyse

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t trend-analysis-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 trend-analysis-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Trend-Analyse
curl -X POST http://localhost:5000/analyze-trends \
  -H "Content-Type: application/json" \
  -d '{"content_data": [...]}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.