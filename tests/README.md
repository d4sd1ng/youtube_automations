# Workflow-Test

Dieses Verzeichnis enthält Tests für den vollständigen Workflow vom Scraping bis zur Erstellung von Shorts für beide Kanäle.

## Verfügbare Tests

### [workflow-test.py](file:///E:/Projects/AGENTS/tests/workflow-test.py)
Testet den vollständigen Workflow:
1. Web Scraping für aktuelle Themen
2. Trend Analysis
3. Script Generation
4. SEO Optimization
5. Thumbnail Generation
6. Video Processing (Umwandlung in Short-Format)
7. Content Approval für beide Kanäle

## Ausführung

```bash
python tests/workflow-test.py
```

## Voraussetzungen

Alle Python-Agenten müssen gestartet sein:
- web-scraping-python (Port 5000)
- trend-analysis-python (Port 5001)
- script-generation-python (Port 5002)
- seo-optimization-python (Port 5003)
- thumbnail-generation-python (Port 5004)
- video-processing-python (Port 5005)
- translation-python (Port 5006)
- avatar-generation-python (Port 5007)
- audio-processing-python (Port 5008)
- content-approval-python (Port 5009)
- approval-python (Port 5010)
- content-planning-python (Port 5011)
- analytics-python (Port 5012)

## Erwartete Ergebnisse

Der Test sollte alle Schritte erfolgreich durchlaufen und am Ende anzeigen:
```
🎉 Alle Tests erfolgreich!
```