#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Politics Scraper - Ruft aktuelle politische Themen aus verschiedenen Quellen ab

Refactored gemäß den Best Practices:
- Modularisierung in klare Funktionen mit einzelner Verantwortung
- Verbesserte Fehlerbehandlung und Logging
- Entkopplung von Logik und I/O-Operationen für bessere Testbarkeit
- Sicherere Handhabung von externen Abhängigkeiten
- Optimierung für Performance durch Reduzierung unnötiger Operationen
"""

import requests
import json
import logging
from datetime import datetime
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PoliticsScraper:
    """Scraper für politische Themen aus verschiedenen Quellen"""
    
    def __init__(self):
        """Initialisiert den Politics Scraper"""
        self.sources = {
            "bundestag": "https://www.bundestag.de/services/opendata",
            "landtage": "https://www.bundesrat.de/dyn/rss/feeds/br-pm.xml",
            "news": "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ5YkRCaGFXUXFLQUZxWldsUEVnWlJFU1FBUAE?hl=de&gl=DE&ceid=DE%3Ade"
        }
    
    def scrape_bundestag_topics(self) -> List[Dict]:
        """
        Ruft Themen aus Bundestagssitzungen ab
        
        Returns:
            List of dictionaries with topic information
        """
        try:
            # In Produktion würden hier echte Daten abgerufen:
            # - Bundestag Open Data API
            # - Sitzungsprotokolle
            # - Plenarprotokolle
            
            # Beispiel-Themen für Demonstration
            topics = [
                {
                    "id": "gesundheit_2025",
                    "title": "Gesundheitsreform 2025",
                    "summary": "Die Ampelregierung plant umfassende Reformen im Gesundheitssystem mit Fokus auf Pflegekräfte, Digitalisierung und Wettbewerb.",
                    "detailed_content": {
                        "SPD": "Die SPD will mehr Pflegekräfte durch bessere Arbeitsbedingungen und höhere Gehälter gewinnen. Geplant sind auch Investitionen in die Krankenhausfinanzierung und die Stärkung der öffentlichen Gesundheitsdienste.",
                        "Grüne": "Die Grünen setzen auf den Ausbau der Telemedizin und die Digitalisierung der Versorgung. Sie fordern eine bessere Vernetzung zwischen den Gesundheitsdienstleistern und den Ausbau präventiver Maßnahmen.",
                        "FDP": "Die FDP plädiert für mehr Wettbewerb im Gesundheitsmarkt und Anreize für Innovation. Sie will Bürokratie abbauen und die Eigenverantwortung der Patienten stärken."
                    },
                    "keywords": ["Gesundheitsreform", "Pflegekräfte", "Telemedizin", "Digitalisierung", "Wettbewerb"],
                    "date": "2025-04-15",
                    "source": "Bundestag",
                    "word_count": 150,
                    "sentences": 12
                },
                {
                    "id": "rente_2025",
                    "title": "Rente 2025",
                    "summary": "Die Rentenreform soll die Altersarmut bekämpfen und gleichzeitig die Generationengerechtigkeit gewährleisten.",
                    "detailed_content": {
                        "SPD": "Die SPD plant den Ausbau der Grundrente und eine bessere Absicherung für Geringverdiener. Ziel ist es, die Altersarmut zu bekämpfen und die Rentenversicherung zu stärken.",
                        "CDU": "Die CDU will die private Altersvorsorge stärken und kapitalgedeckte Elemente fördern. Sie betont die Notwendigkeit einer generationengerechten Rentenpolitik.",
                        "Grüne": "Die Grünen setzen auf flexible Rentenmodelle und eine stärkere Nachhaltigkeitskomponente. Sie fordern auch eine bessere Vereinbarkeit von Familie und Beruf.",
                        "FDP": "Die FDP plädiert für flexible Rentenmodelle und eine stärkere private Vorsorge. Sie will die staatliche Rentenversicherung entlasten und mehr Freiheit im Rentensystem schaffen."
                    },
                    "keywords": ["Rente", "Grundrente", "Altersvorsorge", "Generationengerechtigkeit", "Altersarmut"],
                    "date": "2025-04-22",
                    "source": "Bundestag",
                    "word_count": 145,
                    "sentences": 11
                }
            ]
            
            logger.info(f"Erfolgreich {len(topics)} Bundestag-Themen abgerufen")
            return topics
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Bundestag-Themen: {e}", exc_info=True)
            return []
    
    def scrape_landtag_topics(self) -> List[Dict]:
        """
        Ruft Themen aus Landtagssitzungen ab
        
        Returns:
            List of dictionaries with topic information
        """
        try:
            # Beispiel-Themen aus Landtagen
            topics = [
                {
                    "id": "bildung_2025",
                    "title": "Bildungsreform 2025",
                    "summary": "Die Bundesländer diskutieren über eine umfassende Bildungsreform mit Fokus auf Digitalisierung und Lehrkräftemangel.",
                    "detailed_content": {
                        "Bayern": "Bayern setzt auf Digitalisierung der Schulen und den Ausbau der dualen Ausbildung. Geplant sind Investitionen in moderne Lehrpläne und digitale Infrastruktur.",
                        "NRW": "NRW will den Lehrkräftemangel bekämpfen und die Inklusion in den Schulen verbessern. Ziel ist eine bessere Ausstattung der Schulen.",
                        "Baden-Württemberg": "Baden-Württemberg setzt auf Innovation in der Bildung und den Ausbau der beruflichen Bildung. Die Hochschulen sollen stärker in die Regionen integriert werden."
                    },
                    "keywords": ["Bildungsreform", "Digitalisierung", "Lehrkräftemangel", "Inklusion", "Ausbildung"],
                    "date": "2025-04-18",
                    "source": "Landtage",
                    "word_count": 130,
                    "sentences": 10
                }
            ]
            
            logger.info(f"Erfolgreich {len(topics)} Landtag-Themen abgerufen")
            return topics
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Landtag-Themen: {e}", exc_info=True)
            return []
    
    def scrape_talkshow_topics(self) -> List[Dict]:
        """
        Ruft Themen aus politischen Talkshows ab
        
        Returns:
            List of dictionaries with talkshow topics
        """
        try:
            # Beispiel-Themen aus Talkshows
            topics = [
                {
                    "id": "talkshow_gesundheit",
                    "title": "Gesundheitsreform im Fokus",
                    "show": "Maybrit Illner",
                    "date": "2025-04-10",
                    "guests": ["SPD-Minister", "Grünen-Politiker", "FDP-Abgeordneter", "Unabhängiger Experte"],
                    "discussion_points": [
                        "Mangel an Pflegekräften in deutschen Krankenhäusern",
                        "Digitalisierung im Gesundheitswesen - Chancen und Risiken",
                        "Privatisierungstendenzen im Gesundheitssektor",
                        "Wartezeiten bei ärztlichen Behandlungen"
                    ],
                    "controversies": [
                        "SPD fordert mehr staatliche Regulierung und Investitionen",
                        "FDP will Marktöffnung und Wettbewerb fördern",
                        "Grüne betonen Nachhaltigkeit und Prävention",
                        "Experte warnt vor Qualitätseinbußen durch Privatisierung"
                    ],
                    "public_reaction": "Die Sendung löste eine breite Debatte in den sozialen Medien aus, wobei besonders die Diskussion über Pflegekräftegehälter viel Aufmerksamkeit erhielt.",
                    "keywords": ["Gesundheitsreform", "Pflegekräfte", "Digitalisierung", "Privatisierung", "Wartezeiten"],
                    "source": "Talkshows",
                    "word_count": 180,
                    "sentences": 15
                }
            ]
            
            logger.info(f"Erfolgreich {len(topics)} Talkshow-Themen abgerufen")
            return topics
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Talkshow-Themen: {e}", exc_info=True)
            return []
    
    def collect_all_topics(self) -> Dict[str, List[Dict]]:
        """
        Sammelt Themen aus allen Quellen
        
        Returns:
            Dictionary with topics from all sources
        """
        try:
            if not hasattr(self, '_cached_topics') or not self._cached_topics:
                all_topics = {
                    "bundestag": self.scrape_bundestag_topics(),
                    "landtage": self.scrape_landtag_topics(),
                    "talkshows": self.scrape_talkshow_topics(),
                    "collected_at": datetime.now().isoformat()
                }
                # Cache für Performance
                self._cached_topics = all_topics
            else:
                all_topics = self._cached_topics
                # Aktualisiere Zeitstempel
                all_topics["collected_at"] = datetime.now().isoformat()
            
            # Berechne Gesamtzahl
            total_topics = sum(len(topics) for topics in all_topics.values() if isinstance(topics, list))
            logger.info(f"Insgesamt {total_topics} Themen aus allen Quellen gesammelt")
            
            return all_topics
            
        except Exception as e:
            logger.error(f"Fehler beim Sammeln aller Themen: {e}", exc_info=True)
            return {}
    
    def save_topics_to_json(self, topics_data: Dict, filename: Optional[str] = None) -> Optional[str]:
        """
        Speichert die Themen in einer JSON-Datei
        
        Args:
            topics_data: Dictionary mit allen Themen
            filename: Optionaler Dateiname
            
        Returns:
            String mit dem Dateinamen oder None bei Fehler
        """
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"politik_themen_{timestamp}.json"
            
            # Speichere im aktuellen Verzeichnis
            filepath = filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(topics_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Themen erfolgreich in {filepath} gespeichert")
            return filepath
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Themen: {e}", exc_info=True)
            return None
    
    def generate_content_structure(self, topic_data: Dict) -> Dict:
        """
        Generiert eine Inhaltsstruktur für die Erstellung von Videos
        
        Args:
            topic_data: Dictionary mit Themeninformationen
            
        Returns:
            Dictionary mit Inhaltsstruktur
        """
        try:
            content_structure = {
                "title": topic_data.get("title", ""),
                "intro": {
                    "hook": f"Die politische Debatte um '{topic_data.get('title', '')}' erreicht einen neuen Höhepunkt. Was die Regierung wirklich plant, erfahren Sie jetzt.",
                    "context": topic_data.get("summary", ""),
                    "word_count": 75,
                    "sentences": 5
                },
                "main_content": {
                    "positions": topic_data.get("detailed_content", {}),
                    "key_facts": topic_data.get("keywords", []),
                    "word_count": topic_data.get("word_count", 0),
                    "sentences": topic_data.get("sentences", 0)
                },
                "outro": {
                    "summary": f"Die Debatte um {topic_data.get('title', '')} wird die politische Landschaft 2025 prägen. Welche Position überzeugt Sie am meisten?",
                    "cta": [
                        "Teilen Sie Ihre Meinung in den Kommentaren",
                        "Abonnieren Sie unseren Kanal für mehr politische Analysen",
                        "Aktivieren Sie die Glocke, um keine Updates zu verpassen"
                    ],
                    "word_count": 75,
                    "sentences": 5
                },
                "metadata": {
                    "topic_id": topic_data.get("id", ""),
                    "source": topic_data.get("source", ""),
                    "date": topic_data.get("date", ""),
                    "keywords": topic_data.get("keywords", [])
                }
            }
            
            return content_structure
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren der Inhaltsstruktur: {e}", exc_info=True)
            return {}

def main():
    """Hauptfunktion zum Testen des Scrapers"""
    print("🏛️ Politics Scraper - Aktuelle politische Themen")
    print("=" * 55)
    
    # Initialisiere Scraper
    scraper = PoliticsScraper()
    
    # Sammle alle Themen
    print("\n🔄 Sammle Themen aus allen Quellen...")
    all_topics = scraper.collect_all_topics()
    
    if not all_topics:
        print("❌ Keine Themen gefunden")
        return
    
    # Zeige Bundestag-Themen
    print("\n📝 Bundestag-Themen:")
    bundestag_topics = all_topics.get("bundestag", [])
    for i, topic in enumerate(bundestag_topics, 1):
        print(f"\n{i}. {topic['title']}")
        print(f"   Zusammenfassung: {topic['summary']}")
        print(f"   Datum: {topic['date']}")
        print(f"   Wörter: {topic['word_count']}, Sätze: {topic['sentences']}")
        print("   Parteipositionen:")
        for party, position in topic.get('detailed_content', {}).items():
            print(f"     - {party}: {position[:100]}...")
    
    # Zeige Landtag-Themen
    print("\n🏛️ Landtag-Themen:")
    landtag_topics = all_topics.get("landtage", [])
    for i, topic in enumerate(landtag_topics, 1):
        print(f"\n{i}. {topic['title']}")
        print(f"   Zusammenfassung: {topic['summary']}")
        print(f"   Datum: {topic['date']}")
        print(f"   Wörter: {topic['word_count']}, Sätze: {topic['sentences']}")
    
    # Zeige Talkshow-Themen
    print("\n📺 Talkshow-Themen:")
    talkshow_topics = all_topics.get("talkshows", [])
    for i, topic in enumerate(talkshow_topics, 1):
        print(f"\n{i}. {topic['show']} - {topic['title']}")
        print(f"   Gäste: {', '.join(topic['guests'])}")
        print(f"   Datum: {topic['date']}")
        print(f"   Wörter: {topic['word_count']}, Sätze: {topic['sentences']}")
    
    # Speichere alle Themen
    filename = scraper.save_topics_to_json(all_topics, "aktuelle_politik_themen.json")
    if filename:
        print(f"\n💾 Alle Themen gespeichert in: {filename}")
    
    # Generiere Inhaltsstruktur für das erste Thema
    if bundestag_topics:
        print("\n📋 Inhaltsstruktur für erstes Thema:")
        content_structure = scraper.generate_content_structure(bundestag_topics[0])
        print(json.dumps(content_structure, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()