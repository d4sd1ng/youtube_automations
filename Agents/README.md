# Daily Scraper Service

Der Daily Scraper Service führt automatisch täglich das Scraping von Inhalten zu den Themen KI, AfD und Politik durch.

## Funktionen

- Tägliches Scraping von Social Media Plattformen und anderen Quellen
- Extrahiert Keywords und Themen zu den Bereichen KI, AfD und Politik
- Speichert Ergebnisse in JSON-Dateien
- Identifiziert Video-Themen für die Content-Erstellung
- Automatische Erstellung von Daily und Weekly Videos für beide Kanäle

## Verwendung

### Täglichen Scraper starten

```bash
npm run daily-scrape
```

Der Scraper wird dann alle 24 Stunden automatisch ausgeführt und die Ergebnisse in `./data/scraping-results/` gespeichert.

### Videoplaner starten

```bash
node videoScheduler.js
```

Der Videoplaner erstellt automatisch tägliche und wöchentliche Videos basierend auf den gescrapten Inhalten.

### Einmaliges Scraping durchführen

```bash
node test-scraping-run.js
```

### Testen des Videoplaners

```bash
node testVideoScheduler.js
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

## Automatische Videoerstellung

Der Service erstellt automatisch:

### Tägliche Videos
- 1-2 Short-Videos am Morgen (8:00 Uhr)
- 1-2 Short-Videos am Nachmittag (14:00 Uhr)
- Pro Kanal (Senara und Neurova)

### Wöchentliche Videos
- 1 Long-Form Video pro Kanal
- 3 Short-Kopien des Long-Videos
- Erstellt jeden Montag