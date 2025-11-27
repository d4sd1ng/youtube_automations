# Web Scraping Agent

Der Web Scraping Agent ist ein Python-basierter Microservice zum Extrahieren von Inhalten aus Webseiten, Überwachen von Änderungen und Sammeln von Daten aus dem Internet.

## Funktionen

- **Webseiten-Scraping**: Extrahiert Inhalte wie Titel, Überschriften, Absätze, Links und Bilder von Webseiten
- **Datenextraktion**: Extrahiert spezifische Daten mithilfe von CSS-Selektoren oder XPath
- **Änderungsüberwachung**: Überwacht Webseiten auf Änderungen und meldet Updates

## API Endpunkte

- `GET /health` - Health Check
- `POST /scrape-content` - Scrapet Inhalte von einer Webseite
- `POST /extract-data` - Extrahiert spezifische Daten von einer Webseite
- `POST /monitor-changes` - Überwacht eine Webseite auf Änderungen

## Technologie-Stack

- Python 3.9
- Flask für die REST API
- Requests für HTTP-Anfragen
- BeautifulSoup für das Parsen von HTML

## Installation

1. Stellen Sie sicher, dass Docker installiert ist
2. Bauen Sie das Docker-Image:
   ```
   docker build -t web-scraping-agent .
   ```
3. Führen Sie den Container aus:
   ```
   docker run -p 5000:5000 web-scraping-agent
   ```

## Nutzung

Nach dem Start des Services können Sie die API-Endpunkte über HTTP-Anfragen ansprechen:

```bash
# Health Check
curl http://localhost:5000/health

# Webseite scrapen
curl -X POST http://localhost:5000/scrape-content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Abhängigkeiten

Alle erforderlichen Python-Pakete sind in der `requirements.txt` aufgeführt.