# Daily Scraper Service

Der Daily Scraper Service führt automatisch täglich das Scraping von Inhalten zu den Themen KI, AfD und Politik durch.

## Funktionen

- Tägliches Scraping von Social Media Plattformen und anderen Quellen
- Extrahiert Keywords und Themen zu den Bereichen KI, AfD und Politik
- Speichert Ergebnisse in JSON-Dateien
- Identifiziert Video-Themen für die Content-Erstellung

## Verwendung

### Täglichen Scraper starten

```bash
npm run daily-scrape
```

Der Scraper wird dann alle 24 Stunden automatisch ausgeführt und die Ergebnisse in `./data/scraping-results/` gespeichert.

### Einmaliges Scraping durchführen

```bash
node test-scraping-run.js
```

## Gespeicherte Daten

Die Ergebnisse werden im Verzeichnis `./data/scraping-results/` als JSON-Dateien gespeichert:
- `daily-scraping-results-YYYY-MM-DD.json` - Tägliche Ergebnisse

Jede Datei enthält:
- Klassifizierte Themen mit Punktzahlen
- Themenspezifische Inhalte
- Video-Themen für die Content-Erstellung
- Relevante Keywords
- Top-Keywords des Tages

## Konfiguration

Die folgenden Parameter können in `dailyScraper.js` angepasst werden:

- `keywords` - Suchbegriffe für das Scraping
- `sources` - Quellen für das Scraping
- `resultsDirectory` - Verzeichnis für die Speicherung der Ergebnisse

## Genehmigte Quellen

Der Scraper verwendet nur genehmigte Quellen:
- YouTube
- Twitter/X
- TikTok
- Instagram
- Bundestag
- Landtage
- Politische Talkshows