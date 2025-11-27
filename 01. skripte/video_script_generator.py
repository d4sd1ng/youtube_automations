#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Video Script Generator - Erstellt vollständige YouTube Shorts und Longs Scripts

Refactored gemäß den Best Practices:
- Modularisierung in klare Funktionen mit einzelner Verantwortung
- Verbesserte Fehlerbehandlung und Logging
- Entkopplung von Logik und I/O-Operationen für bessere Testbarkeit
- Sicherere Handhabung von externen Abhängigkeiten
- Optimierung für Performance durch Reduzierung unnötiger Operationen
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class VideoScriptGenerator:
    """Generator für vollständige Video-Scripts"""
    
    def __init__(self):
        """Initialisiert den Video Script Generator"""
        pass
    
    def generate_short_script(self, topic_data: Dict) -> Dict:
        """
        Generiert ein vollständiges Script für einen YouTube Short
        
        Args:
            topic_data: Dictionary mit Themeninformationen
            
        Returns:
            Dictionary mit vollständigem Script und Metadaten
        """
        try:
            title = topic_data.get("title", "Thema")
            category = topic_data.get("category", "allgemein")
            intro_text = topic_data.get("intro", {}).get("text", "")
            main_content = topic_data.get("main_content", {})
            outro_text = topic_data.get("outro", {}).get("text", "")
            
            # Erstelle strukturiertes Script
            script = {
                "header": {
                    "title": f"SHORT: {title}",
                    "format": "YouTube Short",
                    "duration": "60 seconds",
                    "category": category,
                    "created_at": datetime.now().isoformat()
                },
                "content": {
                    "intro": {
                        "timestamp": "0:00-0:08",
                        "text": intro_text,
                        "word_count": len(intro_text.split()),
                        "sentence_count": intro_text.count('.') + intro_text.count('!') + intro_text.count('?')
                    },
                    "main_content": {
                        "timestamp": "0:08-0:48",
                        "text": self._format_main_content(main_content),
                        "word_count": self._count_words_main_content(main_content),
                        "sentence_count": self._count_sentences_main_content(main_content)
                    },
                    "outro": {
                        "timestamp": "0:48-1:00",
                        "text": outro_text,
                        "word_count": len(outro_text.split()),
                        "sentence_count": outro_text.count('.') + outro_text.count('!') + outro_text.count('?')
                    }
                },
                "metadata": {
                    "total_words": self._calculate_total_words(topic_data),
                    "total_sentences": self._calculate_total_sentences(topic_data),
                    "keywords": topic_data.get("keywords", []),
                    "cta_suggestions": self._generate_cta_suggestions(category)
                }
            }
            
            return script
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Short-Scripts: {e}", exc_info=True)
            return {}
    
    def generate_long_script(self, topic_data: Dict) -> Dict:
        """
        Generiert ein vollständiges Script für ein Long-Video
        
        Args:
            topic_data: Dictionary mit Themeninformationen
            
        Returns:
            Dictionary mit vollständigem Script und Metadaten
        """
        try:
            title = topic_data.get("title", "Thema")
            category = topic_data.get("category", "allgemein")
            
            # Erstelle strukturiertes Long-Script
            script = {
                "header": {
                    "title": f"LONG: {title}",
                    "format": "YouTube Long Video",
                    "estimated_duration": "8-15 minutes",
                    "category": category,
                    "created_at": datetime.now().isoformat()
                },
                "content": {
                    "intro": {
                        "timestamp": "0:00-0:30",
                        "text": self._generate_long_intro(topic_data),
                        "word_count": 0,  # Wird später berechnet
                        "sentence_count": 0  # Wird später berechnet
                    },
                    "main_sections": self._generate_long_main_sections(topic_data),
                    "outro": {
                        "timestamp": "End",
                        "text": self._generate_long_outro(topic_data),
                        "word_count": 0,  # Wird später berechnet
                        "sentence_count": 0  # Wird später berechnet
                    }
                },
                "metadata": {
                    "total_words": 0,  # Wird später berechnet
                    "total_sentences": 0,  # Wird später berechnet
                    "keywords": topic_data.get("keywords", []),
                    "cta_suggestions": self._generate_cta_suggestions(category, is_long=True)
                }
            }
            
            # Berechne Wort- und Satzanzahlen
            self._calculate_long_script_stats(script)
            
            return script
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Long-Scripts: {e}", exc_info=True)
            return {}
    
    def _format_main_content(self, main_content: Dict) -> str:
        """Formatiert den Hauptinhalt für Shorts"""
        if "positions" in main_content:
            # Politik-Format mit Parteipositionen
            positions = main_content["positions"]
            formatted_text = ""
            for party, position in positions.items():
                formatted_text += f"{party}: {position}\n\n"
            return formatted_text.strip()
        elif "facts" in main_content:
            # Fakten-basiertes Format
            facts = main_content["facts"]
            return "\n".join([f"{i+1}. {fact}" for i, fact in enumerate(facts)])
        else:
            # Allgemeines Format
            return str(main_content.get("text", ""))
    
    def _count_words_main_content(self, main_content: Dict) -> int:
        """Zählt die Wörter im Hauptinhalt"""
        text = self._format_main_content(main_content)
        return len(text.split())
    
    def _count_sentences_main_content(self, main_content: Dict) -> int:
        """Zählt die Sätze im Hauptinhalt"""
        text = self._format_main_content(main_content)
        return text.count('.') + text.count('!') + text.count('?')
    
    def _calculate_total_words(self, topic_data: Dict) -> int:
        """Berechnet die Gesamtwortzahl"""
        intro_words = len(topic_data.get("intro", {}).get("text", "").split())
        main_words = self._count_words_main_content(topic_data.get("main_content", {}))
        outro_words = len(topic_data.get("outro", {}).get("text", "").split())
        return intro_words + main_words + outro_words
    
    def _calculate_total_sentences(self, topic_data: Dict) -> int:
        """Berechnet die Gesamtsatzzahl"""
        intro_sentences = topic_data.get("intro", {}).get("text", "").count('.') + \
                         topic_data.get("intro", {}).get("text", "").count('!') + \
                         topic_data.get("intro", {}).get("text", "").count('?')
        main_sentences = self._count_sentences_main_content(topic_data.get("main_content", {}))
        outro_sentences = topic_data.get("outro", {}).get("text", "").count('.') + \
                          topic_data.get("outro", {}).get("text", "").count('!') + \
                          topic_data.get("outro", {}).get("text", "").count('?')
        return intro_sentences + main_sentences + outro_sentences
    
    def _generate_cta_suggestions(self, category: str, is_long: bool = False) -> List[str]:
        """Generiert CTA-Vorschläge"""
        base_ctas = {
            "politik": [
                "Welche Partei hat Ihre Stimme verdient?",
                "Teilen Sie Ihre Meinung in den Kommentaren!",
                "Abonnieren Sie für mehr politische Analysen!"
            ],
            "ki": [
                "Wie wird KI Ihren Job verändern?",
                "Teilen Sie Ihre Erfahrungen mit KI!",
                "Abonnieren Sie für mehr Tech-Trends!"
            ]
        }
        
        ctas = base_ctas.get(category, [
            "Abonnieren Sie jetzt für mehr Inhalte!",
            "Aktivieren Sie die Glocke für Updates!",
            "Teilen Sie dieses Video mit Freunden!"
        ])
        
        if is_long:
            ctas.extend([
                "Schauen Sie sich auch unsere anderen Videos an!",
                "Besuchen Sie unsere Website für weitere Informationen!"
            ])
        
        return ctas
    
    def _generate_long_intro(self, topic_data: Dict) -> str:
        """Generiert die Intro-Sektion für Long-Videos"""
        title = topic_data.get("title", "Thema")
        summary = topic_data.get("summary", "")
        
        return f"Herzlich willkommen zu unserem heutigen Video über {title}! In den nächsten Minuten werden wir {summary.lower()} detailliert analysieren und verschiedene Perspektiven beleuchten."
    
    def _generate_long_main_sections(self, topic_data: Dict) -> List[Dict]:
        """Generiert die Hauptsektionen für Long-Videos"""
        main_content = topic_data.get("main_content", {})
        sections = []
        
        if "positions" in main_content:
            positions = main_content["positions"]
            for i, (party, position) in enumerate(positions.items()):
                sections.append({
                    "title": f"Position der {party}",
                    "content": position,
                    "timestamp": f"Section {i+1}"
                })
        elif "facts" in main_content:
            facts = main_content["facts"]
            # Gruppiere Fakten in Abschnitte
            for i in range(0, len(facts), 5):  # 5 Fakten pro Abschnitt
                section_facts = facts[i:i+5]
                sections.append({
                    "title": f"Faktenabschnitt {i//5 + 1}",
                    "content": "\n".join([f"{j+1}. {fact}" for j, fact in enumerate(section_facts)]),
                    "timestamp": f"Section {i//5 + 1}"
                })
        
        return sections
    
    def _generate_long_outro(self, topic_data: Dict) -> str:
        """Generiert die Outro-Sektion für Long-Videos"""
        title = topic_data.get("title", "Thema")
        return f"Das war unser Video über {title}. Wir hoffen, Sie haben neue Erkenntnisse gewonnen. Teilen Sie Ihre Meinung in den Kommentaren und abonnieren Sie unseren Kanal für weitere Inhalte!"
    
    def _calculate_long_script_stats(self, script: Dict):
        """Berechnet Statistiken für Long-Scripts"""
        total_words = 0
        total_sentences = 0
        
        # Intro
        intro_text = script["content"]["intro"]["text"]
        intro_words = len(intro_text.split())
        intro_sentences = intro_text.count('.') + intro_text.count('!') + intro_text.count('?')
        script["content"]["intro"]["word_count"] = intro_words
        script["content"]["intro"]["sentence_count"] = intro_sentences
        total_words += intro_words
        total_sentences += intro_sentences
        
        # Hauptsektionen
        for section in script["content"]["main_sections"]:
            section_text = section["content"]
            section_words = len(section_text.split())
            section_sentences = section_text.count('.') + section_text.count('!') + section_text.count('?')
            section["word_count"] = section_words
            section["sentence_count"] = section_sentences
            total_words += section_words
            total_sentences += section_sentences
        
        # Outro
        outro_text = script["content"]["outro"]["text"]
        outro_words = len(outro_text.split())
        outro_sentences = outro_text.count('.') + outro_text.count('!') + outro_text.count('?')
        script["content"]["outro"]["word_count"] = outro_words
        script["content"]["outro"]["sentence_count"] = outro_sentences
        total_words += outro_words
        total_sentences += outro_sentences
        
        # Gesamtstatistiken
        script["metadata"]["total_words"] = total_words
        script["metadata"]["total_sentences"] = total_sentences
    
    def save_script_to_file(self, script_data: Dict, filename: Optional[str] = None) -> Optional[str]:
        """
        Speichert das Script in einer JSON-Datei
        
        Args:
            script_data: Dictionary mit Script-Daten
            filename: Optionaler Dateiname
            
        Returns:
            String mit dem Dateinamen oder None bei Fehler
        """
        try:
            if not filename:
                title = script_data.get("header", {}).get("title", "script").replace(" ", "_").lower()
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{title}_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(script_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Script erfolgreich in {filename} gespeichert")
            return filename
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Scripts: {e}", exc_info=True)
            return None

def main():
    """Hauptfunktion zum Testen des Video Script Generators"""
    print("🎬 Video Script Generator - YouTube Shorts und Longs")
    print("=" * 55)
    
    # Initialisiere Generator
    generator = VideoScriptGenerator()
    
    # Beispiel-Thema für Short
    short_topic = {
        "title": "Gesundheitsreform 2025",
        "category": "politik",
        "keywords": ["Gesundheit", "Reform", "Pflege", "Digitalisierung"],
        "intro": {
            "text": "Die politische Debatte um die Gesundheitsreform 2025 erreicht einen neuen Höhepunkt. Was die Regierung wirklich plant, erfahren Sie jetzt."
        },
        "main_content": {
            "positions": {
                "SPD": "Die SPD will mehr Pflegekräfte durch bessere Arbeitsbedingungen und höhere Gehälter gewinnen.",
                "Grüne": "Die Grünen setzen auf den Ausbau der Telemedizin und die Digitalisierung der Versorgung.",
                "FDP": "Die FDP plädiert für mehr Wettbewerb im Gesundheitsmarkt und Anreize für Innovation."
            }
        },
        "outro": {
            "text": "Die Debatte um die Gesundheitsreform 2025 wird die politische Landschaft prägen. Welche Position überzeugt Sie am meisten?"
        }
    }
    
    # Generiere Short-Script
    print("\n📝 Generiere Short-Script...")
    short_script = generator.generate_short_script(short_topic)
    
    if short_script:
        print("✅ Short-Script erfolgreich generiert!")
        filename = generator.save_script_to_file(short_script, "gesundheitsreform_short.json")
        if filename:
            print(f"💾 Short-Script gespeichert in: {filename}")
        
        # Zeige einige Metadaten an
        header = short_script.get("header", {})
        metadata = short_script.get("metadata", {})
        print(f"📺 Titel: {header.get('title', '')}")
        print(f"⏱️ Dauer: {header.get('duration', '')}")
        print(f"📊 Wörter: {metadata.get('total_words', 0)}")
        print(f"🔤 Sätze: {metadata.get('total_sentences', 0)}")
    
    # Beispiel-Thema für Long
    long_topic = {
        "title": "KI und Arbeitsplätze",
        "category": "ki",
        "summary": "wie KI unsere Arbeitswelt revolutioniert",
        "keywords": ["KI", "Arbeitsplätze", "Zukunft", "Technologie"],
        "main_content": {
            "facts": [
                "Bis 2025 werden über 300 Millionen Arbeitsplätze weltweit durch KI transformiert.",
                "Nur 5% aller Berufe verschwinden komplett.",
                "70% der Jobs werden sich verändern.",
                "Neue Berufsfelder entstehen in Echtzeit.",
                "KI-Trainer und Ethik-Compliance-Manager sind gut bezahlt.",
                "Hybrid-Kooperation zwischen Mensch und KI ist der Schlüssel zum Erfolg."
            ]
        }
    }
    
    # Generiere Long-Script
    print("\n🎬 Generiere Long-Script...")
    long_script = generator.generate_long_script(long_topic)
    
    if long_script:
        print("✅ Long-Script erfolgreich generiert!")
        filename = generator.save_script_to_file(long_script, "ki_arbeitsplaetze_long.json")
        if filename:
            print(f"💾 Long-Script gespeichert in: {filename}")
        
        # Zeige einige Metadaten an
        header = long_script.get("header", {})
        metadata = long_script.get("metadata", {})
        print(f"📺 Titel: {header.get('title', '')}")
        print(f"⏱️ Geschätzte Dauer: {header.get('estimated_duration', '')}")
        print(f"📊 Wörter: {metadata.get('total_words', 0)}")
        print(f"🔤 Sätze: {metadata.get('total_sentences', 0)}")

if __name__ == "__main__":
    main()