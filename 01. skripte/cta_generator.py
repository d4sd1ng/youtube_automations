#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CTA Generator - Erstellt effektive Calls-to-Action für YouTube Shorts und Longs
"""

import json
import logging
from datetime import datetime
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CTAGenerator:
    """Generator für effektive Calls-to-Action"""
    
    def __init__(self):
        """Initialisiert den CTA Generator"""
        self.political_ctas = [
            "Welche Partei hat Ihre Stimme verdient?",
            "Teilen Sie Ihre Meinung in den Kommentaren!",
            "Abonnieren Sie für mehr politische Analysen!",
            "Aktivieren Sie die Glocke - keine Updates verpassen!",
            "Welche Position überzeugt Sie am meisten?",
            "Stimmen Sie mit einem Like zu!",
            "Diskutieren Sie mit anderen Zuschauern!",
            "Teilen Sie dieses Video mit Freunden!",
            "Was denken Sie über diese Position?",
            "Schreiben Sie Ihren Kommentar!",
            "Unterstützen Sie unseren Kanal mit einem Abo!",
            "Verpassen Sie keine politischen Enthüllungen!",
            "Wie würde Ihre Partei das lösen?",
            "Tragen Sie zur Diskussion bei!",
            "Machen Sie dieses Video viral!"
        ]
        
        self.ki_ctas = [
            "Wie wird KI Ihren Job verändern?",
            "Teilen Sie Ihre Erfahrungen mit KI!",
            "Abonnieren Sie für mehr Tech-Trends!",
            "Aktivieren Sie die Glocke - Zukunftswissen direkt!",
            "Welcher Punkt hat Sie am meisten überrascht?",
            "Stimmen Sie mit einem Like zu!",
            "Diskutieren Sie mit anderen Zuschauern!",
            "Teilen Sie dieses Video mit Kollegen!",
            "Was denken Sie über die Zukunft der KI?",
            "Schreiben Sie Ihren Kommentar!",
            "Unterstützen Sie unseren Kanal mit einem Abo!",
            "Verpassen Sie keine Tech-Enthüllungen!",
            "Wie nutzen Sie bereits KI im Alltag?",
            "Tragen Sie zur Diskussion bei!",
            "Machen Sie dieses Video viral!"
        ]
        
        self.general_ctas = [
            "Abonnieren Sie jetzt für mehr Inhalte!",
            "Aktivieren Sie die Glocke für Updates!",
            "Teilen Sie dieses Video mit Freunden!",
            "Kommentieren Sie Ihre Meinung!",
            "Stimmen Sie mit einem Like zu!",
            "Besuchen Sie unsere Website für mehr!",
            "Folgen Sie uns auf Social Media!",
            "Teilen Sie Ihre Erfahrungen!",
            "Unterstützen Sie unseren Kanal!",
            "Verpassen Sie keine neuen Videos!"
        ]
    
    def generate_ctas_for_topic(self, topic_category, count=5):
        """
        Generiert CTAs für ein bestimmtes Themen-Kategorie
        
        Args:
            topic_category: Kategorie ("politik", "ki" oder "general")
            count: Anzahl der zu generierenden CTAs
            
        Returns:
            Liste mit CTA-Texten
        """
        try:
            if topic_category.lower() == "politik":
                available_ctas = self.political_ctas
            elif topic_category.lower() == "ki":
                available_ctas = self.ki_ctas
            else:
                available_ctas = self.general_ctas
            
            # Wähle zufällige CTAs
            selected_ctas = random.sample(available_ctas, min(count, len(available_ctas)))
            
            logger.info(f"Erfolgreich {len(selected_ctas)} CTAs für Kategorie '{topic_category}' generiert")
            return selected_ctas
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren der CTAs: {e}")
            return []
    
    def generate_structured_ctas(self, topic_data):
        """
        Generiert strukturierte CTAs basierend auf Themen-Daten
        
        Args:
            topic_data: Dictionary mit Themeninformationen
            
        Returns:
            Dictionary mit strukturierten CTA-Daten
        """
        try:
            category = topic_data.get("category", "general")
            title = topic_data.get("title", "Thema")
            
            # Generiere verschiedene CTA-Typen
            ctas = {
                "primary": self.generate_ctas_for_topic(category, 3),
                "secondary": self.generate_ctas_for_topic("general", 2),
                "engagement": [
                    "Kommentieren Sie mit #DeineMeinung",
                    "Teilen Sie dieses Video mit jemandem, der das sehen sollte!",
                    f"Was denken Sie über {title}?",
                    "Stimmen Sie mit einem Daumen nach oben zu!"
                ],
                "channel_growth": [
                    "Abonnieren Sie für wöchentliche Updates!",
                    "Aktivieren Sie die Glocke für keine Ankündigungen zu verpassen!",
                    "Teilen Sie unseren Kanal mit Freunden!"
                ]
            }
            
            # Erstelle Metadaten
            metadata = {
                "topic": title,
                "category": category,
                "generated_at": datetime.now().isoformat(),
                "cta_types": list(ctas.keys())
            }
            
            result = {
                "ctas": ctas,
                "metadata": metadata
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren strukturierter CTAs: {e}")
            return {}
    
    def save_ctas_to_file(self, cta_data, filename=None):
        """
        Speichert CTAs in einer JSON-Datei
        
        Args:
            cta_data: Dictionary mit CTA-Daten
            filename: Optionaler Dateiname
            
        Returns:
            String mit dem Dateinamen oder None bei Fehler
        """
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"ctas_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cta_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"CTAs erfolgreich in {filename} gespeichert")
            return filename
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der CTAs: {e}")
            return None

def main():
    """Hauptfunktion zum Testen des CTA Generators"""
    print("📢 CTA Generator - Effektive Calls-to-Action für YouTube")
    print("=" * 55)
    
    # Initialisiere Generator
    generator = CTAGenerator()
    
    # Beispiel-Themen
    sample_topics = [
        {
            "title": "Gesundheitsreform 2025",
            "category": "politik",
            "description": "Die große Reform des Gesundheitssystems"
        },
        {
            "title": "KI und Arbeitsplätze",
            "category": "ki",
            "description": "Wie KI unsere Arbeitswelt verändert"
        }
    ]
    
    # Generiere CTAs für jedes Thema
    for i, topic in enumerate(sample_topics, 1):
        print(f"\n📋 CTA-Vorschläge für Thema {i}: {topic['title']}")
        print("-" * 40)
        
        cta_result = generator.generate_structured_ctas(topic)
        
        # Zeige die CTAs an
        ctas = cta_result.get("ctas", {})
        for cta_type, cta_list in ctas.items():
            print(f"\n{cta_type.upper()}:")
            for j, cta in enumerate(cta_list, 1):
                print(f"  {j}. {cta}")
        
        # Speichere die CTAs
        filename = generator.save_ctas_to_file(cta_result, f"ctas_{topic['category']}_{i}.json")
        if filename:
            print(f"\n💾 CTA-Vorschläge gespeichert in: {filename}")

if __name__ == "__main__":
    main()