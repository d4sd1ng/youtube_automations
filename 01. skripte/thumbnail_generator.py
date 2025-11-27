#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Thumbnail Generator - Erstellt professionelle YouTube Shorts Thumbnails
"""

import os
import json
import logging
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ThumbnailGenerator:
    """Generator für professionelle YouTube Shorts Thumbnails"""
    
    def __init__(self):
        """Initialisiert den Thumbnail Generator"""
        self.canvas_width = 1080
        self.canvas_height = 1920
        self.output_dir = "generated_thumbnails"
        
        # Erstelle Ausgabeverzeichnis
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    def create_shorts_template(self, topic_data):
        """
        Erstellt ein professionelles Shorts-Thumbnail basierend auf den Design-Vorgaben
        
        Args:
            topic_data: Dictionary mit Themeninformationen
            
        Returns:
            String mit dem Pfad zum erstellten Thumbnail
        """
        try:
            # Erstelle Leinwand
            canvas = Image.new('RGB', (self.canvas_width, self.canvas_height), color='#000000')
            draw = ImageDraw.Draw(canvas)
            
            # 1. Hintergrund mit Farbverlauf
            self._draw_background_gradient(draw)
            
            # 2. Halbtransparentes Hintergrundbild (symbolisch)
            self._add_background_image(canvas, topic_data.get("category", "politik"))
            
            # 3. Headline/Schlagzeile
            self._add_headline(canvas, topic_data)
            
            # 4. Symbole/Icons
            self._add_icons(canvas, topic_data)
            
            # 5. Branding/Logo
            self._add_branding(canvas)
            
            # Speichere Thumbnail
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            topic_name = topic_data.get("title", "thumbnail").lower().replace(" ", "_")
            filename = f"short_{topic_name}_{timestamp}.png"
            filepath = os.path.join(self.output_dir, filename)
            
            canvas.save(filepath, 'PNG')
            
            logger.info(f"Thumbnail erfolgreich erstellt: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Thumbnails: {e}")
            return None
    
    def _draw_background_gradient(self, draw):
        """Zeichnet den Hintergrundfarbverlauf"""
        # Farbverlauf von Dunkelgrau zu Schwarz
        for y in range(self.canvas_height):
            # Berechne Farbinterpolation
            ratio = y / self.canvas_height
            r = int(26 * (1 - ratio) + 0 * ratio)  # 26 -> 0
            g = int(26 * (1 - ratio) + 0 * ratio)  # 26 -> 0
            b = int(26 * (1 - ratio) + 0 * ratio)  # 26 -> 0
            
            draw.line([(0, y), (self.canvas_width, y)], fill=(r, g, b))
    
    def _add_background_image(self, canvas, category):
        """Fügt ein halbtransparentes Hintergrundbild hinzu"""
        try:
            # Erstelle ein symbolisches Hintergrundbild
            bg_overlay = Image.new('RGBA', (self.canvas_width, self.canvas_height), (0, 0, 0, 0))
            bg_draw = ImageDraw.Draw(bg_overlay)
            
            # Zeichne symbolische Elemente basierend auf Kategorie
            if category == "politik":
                # Zeichne symbolische politische Elemente
                # Gebäude-Silhouette
                bg_draw.rectangle([100, 800, 980, 1200], fill=(100, 100, 100, 64))
                # Fenster
                for i in range(5):
                    for j in range(8):
                        x = 150 + i * 180
                        y = 850 + j * 50
                        bg_draw.rectangle([x, y, x+100, y+30], fill=(200, 200, 200, 32))
            elif category == "ki":
                # Zeichne symbolische KI-Elemente
                # Kreise für neuronale Netzwerke
                for i in range(15):
                    x = random.randint(100, 980)
                    y = random.randint(600, 1400)
                    radius = random.randint(10, 50)
                    bg_draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=(100, 150, 255, 32))
            
            # Füge Overlay zum Canvas hinzu
            canvas.paste(bg_overlay, (0, 0), bg_overlay)
        except Exception as e:
            logger.warning(f"Fehler beim Hinzufügen des Hintergrundbilds: {e}")
    
    def _add_headline(self, canvas, topic_data):
        """Fügt die Headline/Schlagzeile hinzu"""
        try:
            # Roter Balken
            bar_height = 120
            bar_y = 150
            draw = ImageDraw.Draw(canvas)
            draw.rectangle([0, bar_y, self.canvas_width, bar_y + bar_height], fill='#e50914')
            
            # Schlagwort über der Hauptüberschrift
            try:
                font_small = ImageFont.truetype("BebasNeue-Regular.ttf", 120)
            except:
                font_small = ImageFont.load_default()
            
            schlagwort = topic_data.get("tag", "ENTHÜLLUNG")
            schlagwort_bbox = draw.textbbox((0, 0), schlagwort, font=font_small)
            schlagwort_width = schlagwort_bbox[2] - schlagwort_bbox[0]
            schlagwort_x = (self.canvas_width - schlagwort_width) // 2
            
            # Weißer Text mit schwarzem Rand
            self._draw_text_with_outline(draw, schlagwort, schlagwort_x, bar_y + 10, font_small, (255, 255, 255), (0, 0, 0))
            
            # Hauptüberschrift
            try:
                font_large = ImageFont.truetype("Anton-Regular.ttf", 220)
            except:
                try:
                    font_large = ImageFont.truetype("Impact.ttf", 220)
                except:
                    font_large = ImageFont.load_default()
            
            title = topic_data.get("title", "THEMA")
            title_lines = self._wrap_text(title, font_large, self.canvas_width - 100)
            
            y_offset = bar_y + bar_height + 50
            line_height = 240
            
            for line in title_lines[:2]:  # Maximal 2 Zeilen
                line_bbox = draw.textbbox((0, 0), line, font=font_large)
                line_width = line_bbox[2] - line_bbox[0]
                line_x = (self.canvas_width - line_width) // 2
                
                # Weißer Text mit schwarzem Rand
                self._draw_text_with_outline(draw, line, line_x, y_offset, font_large, (255, 255, 255), (0, 0, 0))
                
                y_offset += line_height
            
        except Exception as e:
            logger.warning(f"Fehler beim Hinzufügen der Headline: {e}")
    
    def _add_icons(self, canvas, topic_data):
        """Fügt Symbole/Icons hinzu"""
        try:
            draw = ImageDraw.Draw(canvas)
            
            # Erstelle einfache Symbole
            icon_size = 80
            icon_y = self.canvas_height - 200
            
            # Dokumentensymbol
            doc_x = 100
            draw.rectangle([doc_x, icon_y, doc_x + icon_size, icon_y + icon_size], fill=(255, 255, 255, 128))
            draw.rectangle([doc_x + 20, icon_y + 20, doc_x + icon_size - 20, icon_y + 40], fill=(0, 0, 0, 128))
            draw.rectangle([doc_x + 20, icon_y + 50, doc_x + icon_size - 20, icon_y + 70], fill=(0, 0, 0, 128))
            
            # Schlosssymbol
            lock_x = 250
            # Außenring
            draw.ellipse([lock_x, icon_y + 20, lock_x + icon_size, icon_y + icon_size], fill=(255, 255, 255, 128))
            # Inneres
            draw.rectangle([lock_x + 20, icon_y + 50, lock_x + icon_size - 20, icon_y + icon_size - 10], fill=(0, 0, 0, 128))
            
            # Warnsymbol
            warn_x = 400
            # Dreieck
            draw.polygon([
                (warn_x + icon_size//2, icon_y + 10),
                (warn_x + 10, icon_y + icon_size - 10),
                (warn_x + icon_size - 10, icon_y + icon_size - 10)
            ], fill=(255, 255, 255, 128))
            # Ausrufezeichen
            draw.rectangle([warn_x + icon_size//2 - 10, icon_y + 30, warn_x + icon_size//2 + 10, icon_y + icon_size - 30], fill=(0, 0, 0, 128))
            
        except Exception as e:
            logger.warning(f"Fehler beim Hinzufügen der Icons: {e}")
    
    def _add_branding(self, canvas):
        """Fügt Branding/Logo hinzu"""
        try:
            draw = ImageDraw.Draw(canvas)
            
            # Logo-Kreis
            logo_size = 120
            logo_x = self.canvas_width - logo_size - 50
            logo_y = self.canvas_height - logo_size - 50
            
            # Weißer Kreis
            draw.ellipse([logo_x, logo_y, logo_x + logo_size, logo_y + logo_size], fill=(255, 255, 255))
            
            # Schwarzer Text im Kreis
            try:
                font = ImageFont.truetype("Arial.ttf", 24)
            except:
                font = ImageFont.load_default()
            
            text = "TINO"
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            text_x = logo_x + (logo_size - text_width) // 2
            text_y = logo_y + (logo_size - text_height) // 2
            
            draw.text((text_x, text_y), text, font=font, fill=(0, 0, 0))
            
        except Exception as e:
            logger.warning(f"Fehler beim Hinzufügen des Brandings: {e}")
    
    def _draw_text_with_outline(self, draw, text, x, y, font, fill_color, outline_color):
        """Zeichnet Text mit Umriss"""
        # Zeichne Umriss
        for dx in [-3, -2, -1, 0, 1, 2, 3]:
            for dy in [-3, -2, -1, 0, 1, 2, 3]:
                if dx != 0 or dy != 0:
                    draw.text((x + dx, y + dy), text, font=font, fill=outline_color)
        
        # Zeichne Haupttext
        draw.text((x, y), text, font=font, fill=fill_color)
    
    def _wrap_text(self, text, font, max_width):
        """Umbricht Text in mehrere Zeilen"""
        lines = []
        words = text.split(' ')
        current_line = []
        
        for word in words:
            current_line.append(word)
            line_text = ' '.join(current_line)
            try:
                bbox = font.getbbox(line_text)
                line_width = bbox[2] - bbox[0]
            except:
                line_width = len(line_text) * 20  # Fallback
            
            if line_width > max_width and len(current_line) > 1:
                # Entferne das letzte Wort und füge die Zeile hinzu
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
        
        # Füge die letzte Zeile hinzu
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def generate_multiple_thumbnails(self, topics_data):
        """
        Generiert mehrere Thumbnails für eine Liste von Themen
        
        Args:
            topics_data: Liste von Themen-Dictionaries
            
        Returns:
            Liste mit Pfaden zu den erstellten Thumbnails
        """
        thumbnail_paths = []
        
        for topic_data in topics_data:
            path = self.create_shorts_template(topic_data)
            if path:
                thumbnail_paths.append(path)
        
        return thumbnail_paths

def main():
    """Hauptfunktion zum Testen des Thumbnail Generators"""
    print("🎨 Thumbnail Generator - Professionelle YouTube Shorts Thumbnails")
    print("=" * 60)
    
    # Initialisiere Generator
    generator = ThumbnailGenerator()
    
    # Beispiel-Themen
    sample_topics = [
        {
            "title": "BLACKROCK IN DER UKRAINE",
            "tag": "ENTHÜLLUNG",
            "category": "politik",
            "description": "Geheime Investitionen aufgedeckt"
        },
        {
            "title": "KI KONTROLLIERT ALLES",
            "tag": "GEHEIM",
            "category": "ki",
            "description": "Die Wahrheit über KI-Überwachung"
        },
        {
            "title": "GEHEIMPROTOKOLL BUNDESTAG",
            "tag": "EXKLUSIV",
            "category": "politik",
            "description": "Versteckte Abstimmungen enthüllt"
        }
    ]
    
    # Generiere Thumbnails
    print("\n🖼️ Generiere Thumbnails...")
    thumbnail_paths = generator.generate_multiple_thumbnails(sample_topics)
    
    for i, path in enumerate(thumbnail_paths, 1):
        print(f"✅ Thumbnail {i} erstellt: {path}")
    
    print(f"\n📁 Alle Thumbnails gespeichert in: {generator.output_dir}")

if __name__ == "__main__":
    main()