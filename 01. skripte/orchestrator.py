#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Orchestrator - Koordiniert alle Module für die automatische Content-Erstellung

Refactored gemäß den Best Practices:
- Modularisierung in klare Funktionen mit einzelner Verantwortung
- Verbesserte Fehlerbehandlung und Logging
- Entkopplung von Logik und I/O-Operationen für bessere Testbarkeit
- Sicherere Handhabung von externen Abhängigkeiten
"""

import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importiere alle Module
try:
    from politics_scraper import PoliticsScraper
    from thumbnail_generator import ThumbnailGenerator
    from cta_generator import CTAGenerator
    from video_script_generator import VideoScriptGenerator
    SCRAPER_AVAILABLE = True
    THUMBNAIL_AVAILABLE = True
    CTA_AVAILABLE = True
    SCRIPT_AVAILABLE = True
except ImportError as e:
    logger.error(f"Fehler beim Importieren der Module: {e}")
    SCRAPER_AVAILABLE = False
    THUMBNAIL_AVAILABLE = False
    CTA_AVAILABLE = False
    SCRIPT_AVAILABLE = False

class ContentOrchestrator:
    """Orchestrator für die automatische Content-Erstellung"""
    
    def __init__(self):
        """Initialisiert den Orchestrator"""
        self.output_dir = Path("generated_content")
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialisiere alle Module
        self.scraper = PoliticsScraper() if SCRAPER_AVAILABLE else None
        self.thumbnail_generator = ThumbnailGenerator() if THUMBNAIL_AVAILABLE else None
        self.cta_generator = CTAGenerator() if CTA_AVAILABLE else None
        self.script_generator = VideoScriptGenerator() if SCRIPT_AVAILABLE else None
    
    def run_full_pipeline(self):
        """
        Führt die vollständige Pipeline für beide Kanäle aus
        
        Returns:
            Boolean ob der Prozess erfolgreich war
        """
        try:
            logger.info("🚀 Starte vollständige Content-Erstellungs-Pipeline")
            
            # 1. Scrape Themen für beide Kanäle
            logger.info("📊 Schritt 1: Scrape Themen für beide Kanäle")
            all_topics = self._scrape_all_topics()
            if not all_topics:
                logger.error("Keine Themen gefunden")
                return False
            
            # 2. Generiere Inhalte für jeden Kanal
            logger.info("📝 Schritt 2: Generiere Inhalte für beide Kanäle")
            results = []
            
            for channel, topics in all_topics.items():
                if isinstance(topics, list) and topics:
                    logger.info(f"🎬 Erstelle Inhalte für Kanal: {channel}")
                    channel_results = self._process_channel_content(channel, topics)
                    results.extend(channel_results)
                elif isinstance(topics, dict):
                    # Einzelnes Thema
                    logger.info(f"🎬 Erstelle Inhalte für Kanal: {channel}")
                    channel_results = self._process_channel_content(channel, [topics])
                    results.extend(channel_results)
            
            # 3. Erstelle Zusammenfassung
            logger.info("📋 Schritt 3: Erstelle Zusammenfassung")
            self._create_summary(results)
            
            logger.info("✅ Vollständige Pipeline erfolgreich abgeschlossen")
            return True
            
        except Exception as e:
            logger.error(f"Fehler in der Pipeline: {e}")
            return False
    
    def _scrape_all_topics(self):
        """
        Scraped Themen für beide Kanäle
        
        Returns:
            Dictionary mit Themen für beide Kanäle
        """
        try:
            if not self.scraper:
                logger.warning("Scraper nicht verfügbar")
                return {}
            
            # Hole alle Themen
            all_topics = self.scraper.collect_all_topics()
            
            # Organisiere nach Kanälen
            organized_topics = {
                "politik": [],
                "ki": []
            }
            
            # Bundestag-Themen (Politik)
            bundestag_topics = all_topics.get("bundestag", [])
            organized_topics["politik"].extend(bundestag_topics)
            
            # Landtag-Themen (Politik)
            landtag_topics = all_topics.get("landtage", [])
            organized_topics["politik"].extend(landtag_topics)
            
            # Talkshow-Themen (Politik)
            talkshow_topics = all_topics.get("talkshows", [])
            organized_topics["politik"].extend(talkshow_topics)
            
            # Für KI-Themen könnten wir später einen eigenen Scraper hinzufügen
            # vorerst verwenden wir einige der politischen Themen auch für KI
            organized_topics["ki"].extend([
                {
                    "title": "KI in der Politik",
                    "category": "ki",
                    "keywords": ["KI", "Politik", "Digitalisierung"],
                    "intro": {"text": "Wie KI die politische Landschaft verändert"},
                    "main_content": {
                        "facts": [
                            "KI analysiert politische Reden in Echtzeit",
                            "Algorithmen beeinflussen Wahlkampfstrategien",
                            "Chatbots beantworten Bürgeranfragen automatisch"
                        ]
                    },
                    "outro": {"text": "KI wird die Demokratie der Zukunft prägen"}
                }
            ])
            
            logger.info(f"Gefundene Themen - Politik: {len(organized_topics['politik'])}, KI: {len(organized_topics['ki'])}")
            return organized_topics
            
        except Exception as e:
            logger.error(f"Fehler beim Scrapen der Themen: {e}")
            return {}
    
    def _process_channel_content(self, channel, topics):
        """
        Verarbeitet Inhalte für einen bestimmten Kanal
        
        Args:
            channel: Kanalname ("politik" oder "ki")
            topics: Liste von Themen
            
        Returns:
            Liste mit Ergebnissen
        """
        results = []
        
        for i, topic in enumerate(topics):
            try:
                logger.info(f"🔧 Verarbeite Thema {i+1}/{len(topics)} für Kanal {channel}: {topic.get('title', 'Unbenannt')}")
                
                # Füge Kategorie hinzu, falls nicht vorhanden
                if "category" not in topic:
                    topic["category"] = channel
                
                # 1. Generiere Short-Script
                short_script = self._generate_short_script(topic)
                
                # 2. Generiere Long-Script
                long_script = self._generate_long_script(topic)
                
                # 3. Generiere Thumbnail
                thumbnail_path = self._generate_thumbnail(topic)
                
                # 4. Generiere CTAs
                ctas = self._generate_ctas(topic)
                
                # 5. Speichere alle Ergebnisse
                result = {
                    "channel": channel,
                    "topic": topic.get("title", f"Thema_{i}"),
                    "short_script": short_script,
                    "long_script": long_script,
                    "thumbnail": thumbnail_path,
                    "ctas": ctas,
                    "processed_at": datetime.now().isoformat()
                }
                
                results.append(result)
                
                # Speichere individuelle Dateien
                self._save_channel_result(result, channel, i)
                
            except Exception as e:
                logger.error(f"Fehler beim Verarbeiten von Thema {topic.get('title', 'Unbekannt')}: {e}")
                continue
        
        return results
    
    def _generate_short_script(self, topic):
        """Generiert ein Short-Script für ein Thema"""
        try:
            if not self.script_generator:
                return None
            
            return self.script_generator.generate_short_script(topic)
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Short-Scripts: {e}")
            return None
    
    def _generate_long_script(self, topic):
        """Generiert ein Long-Script für ein Thema"""
        try:
            if not self.script_generator:
                return None
            
            return self.script_generator.generate_long_script(topic)
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Long-Scripts: {e}")
            return None
    
    def _generate_thumbnail(self, topic):
        """Generiert ein Thumbnail für ein Thema"""
        try:
            if not self.thumbnail_generator:
                return None
            
            return self.thumbnail_generator.create_shorts_template(topic)
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Thumbnails: {e}")
            return None
    
    def _generate_ctas(self, topic):
        """Generiert CTAs für ein Thema"""
        try:
            if not self.cta_generator:
                return None
            
            return self.cta_generator.generate_structured_ctas(topic)
        except Exception as e:
            logger.error(f"Fehler beim Generieren der CTAs: {e}")
            return None
    
    def _save_channel_result(self, result, channel, index):
        """
        Speichert die Ergebnisse für einen Kanal
        
        Args:
            result: Ergebnis-Dictionary
            channel: Kanalname
            index: Index des Themas
        """
        try:
            channel_dir = self.output_dir / channel
            channel_dir.mkdir(exist_ok=True)
            
            topic_name = result["topic"].lower().replace(" ", "_")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Speichere Short-Script
            if result["short_script"]:
                short_filename = channel_dir / f"{topic_name}_short_{timestamp}.json"
                with open(short_filename, 'w', encoding='utf-8') as f:
                    json.dump(result["short_script"], f, indent=2, ensure_ascii=False)
                logger.info(f"💾 Short-Script gespeichert: {short_filename}")
            
            # Speichere Long-Script
            if result["long_script"]:
                long_filename = channel_dir / f"{topic_name}_long_{timestamp}.json"
                with open(long_filename, 'w', encoding='utf-8') as f:
                    json.dump(result["long_script"], f, indent=2, ensure_ascii=False)
                logger.info(f"💾 Long-Script gespeichert: {long_filename}")
            
            # Speichere CTA-Daten
            if result["ctas"]:
                cta_filename = channel_dir / f"{topic_name}_ctas_{timestamp}.json"
                with open(cta_filename, 'w', encoding='utf-8') as f:
                    json.dump(result["ctas"], f, indent=2, ensure_ascii=False)
                logger.info(f"💾 CTAs gespeichert: {cta_filename}")
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Kanal-Ergebnisse: {e}")
    
    def _create_summary(self, results):
        """
        Erstellt eine Zusammenfassung aller Ergebnisse
        
        Args:
            results: Liste mit allen Ergebnissen
        """
        try:
            summary = {
                "generated_at": datetime.now().isoformat(),
                "total_channels": len(set(r["channel"] for r in results)),
                "total_topics": len(results),
                "channels": {},
                "files_created": []
            }
            
            # Zähle Ergebnisse pro Kanal
            for result in results:
                channel = result["channel"]
                if channel not in summary["channels"]:
                    summary["channels"][channel] = {
                        "topics": 0,
                        "short_scripts": 0,
                        "long_scripts": 0,
                        "thumbnails": 0,
                        "cta_sets": 0
                    }
                
                summary["channels"][channel]["topics"] += 1
                if result["short_script"]:
                    summary["channels"][channel]["short_scripts"] += 1
                if result["long_script"]:
                    summary["channels"][channel]["long_scripts"] += 1
                if result["thumbnail"]:
                    summary["channels"][channel]["thumbnails"] += 1
                if result["ctas"]:
                    summary["channels"][channel]["cta_sets"] += 1
            
            # Speichere Zusammenfassung
            summary_file = self.output_dir / f"content_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            
            logger.info(f"📋 Zusammenfassung gespeichert: {summary_file}")
            
            # Zeige Zusammenfassung an
            print("\n" + "="*60)
            print("📊 CONTENT ERSTELLUNGS-ZUSAMMENFASSUNG")
            print("="*60)
            print(f"📅 Erstellt am: {summary['generated_at']}")
            print(f"📺 Kanäle: {summary['total_channels']}")
            print(f"📝 Themen insgesamt: {summary['total_topics']}")
            print()
            
            for channel, stats in summary["channels"].items():
                print(f"🎬 Kanal: {channel.upper()}")
                print(f"   Themen: {stats['topics']}")
                print(f"   Short-Scripts: {stats['short_scripts']}")
                print(f"   Long-Scripts: {stats['long_scripts']}")
                print(f"   Thumbnails: {stats['thumbnails']}")
                print(f"   CTA-Sets: {stats['cta_sets']}")
                print()
            
            print(f"📁 Alle Dateien gespeichert in: {self.output_dir}")
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Zusammenfassung: {e}")

def main():
    """Hauptfunktion des Orchestrators"""
    print("🤖 Content Orchestrator - Automatische Content-Erstellung")
    print("=" * 60)
    
    # Initialisiere Orchestrator
    orchestrator = ContentOrchestrator()
    
    # Führe vollständige Pipeline aus
    print("\n🚀 Starte automatische Content-Erstellung für beide Kanäle...")
    success = orchestrator.run_full_pipeline()
    
    if success:
        print("\n✅ Automatische Content-Erstellung erfolgreich abgeschlossen!")
        print("📁 Die erstellten Inhalte finden Sie im Verzeichnis 'generated_content'")
    else:
        print("\n❌ Fehler bei der Content-Erstellung!")
        sys.exit(1)

if __name__ == "__main__":
    main()