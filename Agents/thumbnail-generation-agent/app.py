#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Thumbnail Generation Agent
Service for creating high-quality, brand-compliant thumbnails for maximum click-through rate and monetization
"""

import os
import json
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ThumbnailGenerationAgent:
    def __init__(self):
        # Directories
        self.thumbnails_dir = Path(__file__).parent / "data" / "thumbnails"
        self.templates_dir = self.thumbnails_dir / "templates"
        self.generated_dir = self.thumbnails_dir / "generated"
        self.fonts_dir = self.thumbnails_dir / "fonts"
        self.logos_dir = self.thumbnails_dir / "logos"
        self.icons_dir = self.thumbnails_dir / "icons"

        # Create directories
        for directory in [self.thumbnails_dir, self.templates_dir, self.generated_dir, self.fonts_dir, self.logos_dir, self.icons_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        # Premium configuration for professional thumbnails with branding
        self.config = {
            "dimensions": {
                "youtube": {"width": 1280, "height": 720},
                "shorts": {"width": 1080, "height": 1920},
                "standard": {"width": 1280, "height": 720},
                "banner": {"width": 2560, "height": 1440}
            },
            "templates": {
                "premium_clickbait": {
                    "name": "Premium Clickbait",
                    "description": "High-quality clickbait design for maximum click-through rate",
                    "layers": ["background", "gradient_overlay", "text_overlay", "cta_elements", "branding"],
                    "category": "monetization",
                    "priority": "high"
                },
                "cinematic": {
                    "name": "Cinematic Design",
                    "description": "Cinematic design for professional content",
                    "layers": ["background", "cinematic_overlay", "text_overlay", "branding"],
                    "category": "professional",
                    "priority": "medium"
                },
                "bold_minimal": {
                    "name": "Bold Minimal",
                    "description": "Clear, reduced design with strong visual impact",
                    "layers": ["background", "accent_elements", "text_overlay", "branding"],
                    "category": "professional",
                    "priority": "high"
                },
                "dynamic_split": {
                    "name": "Dynamic Split",
                    "description": "Dynamic split-screen design with movement",
                    "layers": ["background_left", "background_right", "divider", "text_overlay", "branding"],
                    "category": "entertainment",
                    "priority": "medium"
                },
                "gradient_impact": {
                    "name": "Gradient Impact",
                    "description": "Strong color gradient with maximum visual impact",
                    "layers": ["gradient_background", "text_overlay", "highlight_elements", "branding"],
                    "category": "monetization",
                    "priority": "high"
                }
            },
            "fonts": {
                "primary": "arial.ttf",
                "secondary": "arial.ttf",
                "heading": "arialbd.ttf",
                "accent": "georgia.ttf",
                "sizes": {
                    "headline": 80,
                    "title": 65,
                    "subtitle": 50,
                    "body": 35,
                    "tagline": 30,
                    "small": 25
                }
            },
            "colors": {
                # Premium color palette
                "primary": "#E50914",  # Netflix Red
                "secondary": "#FFFFFF",  # Pure White
                "accent": "#B00000",  # Darker Red
                "background": "#000000",  # Pure Black
                "highlight": "#FFD700",  # Gold
                "success": "#00C853",  # Green
                "warning": "#FFAB00",  # Orange
                "danger": "#D50000",  # Dark Red
                # Gradient colors
                "gradient_start": "#8E2DE2",  # Purple
                "gradient_end": "#4A00E0",  # Dark Purple
                "cinematic_start": "#000428",  # Dark Blue
                "cinematic_end": "#004e92"  # Medium Blue
            },
            "effects": {
                "shadow": {
                    "color": "rgba(0, 0, 0, 0.8)",
                    "blur": 15,
                    "offset": 8
                },
                "glow": {
                    "color": "rgba(255, 215, 0, 0.6)",
                    "blur": 20
                },
                "vignette": {
                    "strength": 0.4
                }
            },
            "branding": {
                "logo": {
                    "default": "placeholder",
                    "position": "top-right",
                    "size": "medium",
                    "margin": 30
                },
                "watermark": {
                    "enabled": True,
                    "text": "CHANNEL",
                    "position": "bottom-left",
                    "opacity": 0.7
                },
                "color_scheme": "primary"
            },
            "monetization": {
                "ctr_thresholds": {
                    "high": 7.0,
                    "medium": 3.0,
                    "low": 1.0
                },
                "quality_thresholds": {
                    "high": 85,
                    "medium": 70,
                    "low": 50
                }
            }
        }

        # Load configuration
        self.load_configuration()

    def load_configuration(self) -> None:
        """Load thumbnail configuration"""
        try:
            config_path = self.thumbnails_dir / "config.json"
            if config_path.exists():
                with open(config_path, 'r') as f:
                    loaded_config = json.load(f)
                # Merge with default config
                self.config.update(loaded_config)
                self.save_configuration()
        except Exception as e:
            logger.error(f"Failed to load thumbnail config: {str(e)}")
            # Keep default config

    def save_configuration(self) -> None:
        """Save thumbnail configuration"""
        try:
            config_path = self.thumbnails_dir / "config.json"
            with open(config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save thumbnail config: {str(e)}")

    def hex_to_rgb(self, hex_color: str) -> tuple:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def generate_thumbnail(self, options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Generate a thumbnail with text overlay

        Args:
            options (Dict[str, Any]): Generation options

        Returns:
            Dict[str, Any]: Generated thumbnail info
        """
        try:
            # Extract options with defaults
            title = options.get("title", "Default Title")
            subtitle = options.get("subtitle", "")
            template = options.get("template", "bold_minimal")
            platform = options.get("platform", "youtube")
            output_path = options.get("output_path")
            background_color = options.get("background_color", self.config["colors"]["background"])
            text_color = options.get("text_color", self.config["colors"]["secondary"])
            accent_color = options.get("accent_color", self.config["colors"]["primary"])

            # Get canvas dimensions
            dimensions = self.config["dimensions"].get(platform, self.config["dimensions"]["standard"])
            width = dimensions["width"]
            height = dimensions["height"]

            # Create image
            img = Image.new('RGB', (width, height), self.hex_to_rgb(background_color))
            draw = ImageDraw.Draw(img)

            # Apply template-specific styling
            template_config = self.config["templates"].get(template.replace("-", "_"))
            if template_config:
                self.apply_template_styling(draw, width, height, template_config, accent_color)

            # Draw text
            self.draw_text(draw, width, height, title, subtitle, text_color)

            # Generate output path if not provided
            if output_path is None:
                output_path = self.generated_dir / f"{uuid.uuid4()}.png"
            else:
                output_path = Path(output_path)

            # Save the thumbnail
            img.save(output_path, "PNG")

            return {
                "success": True,
                "path": str(output_path),
                "dimensions": dimensions,
                "template": template,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Thumbnail generation failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def apply_template_styling(self, draw: ImageDraw.ImageDraw, width: int, height: int, template_config: Dict[str, Any], accent_color: str) -> None:
        """
        Apply template-specific styling

        Args:
            draw (ImageDraw.ImageDraw): ImageDraw object
            width (int): Image width
            height (int): Image height
            template_config (Dict[str, Any]): Template configuration
            accent_color (str): Accent color
        """
        # Apply gradient overlay for certain templates
        if template_config["name"] == "Gradient Impact":
            # For simplicity, we'll draw a rectangle with the start color
            # A full gradient implementation would be more complex
            draw.rectangle([0, 0, width, height], fill=self.hex_to_rgb(self.config["colors"]["gradient_start"]))

        # Apply cinematic overlay for cinematic template
        if template_config["name"] == "Cinematic Design":
            draw.rectangle([0, 0, width, height], fill=self.hex_to_rgb(self.config["colors"]["cinematic_start"]))

        # Add accent elements for bold minimal template
        if template_config["name"] == "Bold Minimal":
            accent_rgb = self.hex_to_rgb(accent_color)
            draw.rectangle([
                int(width * 0.1),
                int(height * 0.85),
                int(width * 0.9),
                int(height * 0.85) + 8
            ], fill=accent_rgb)

    def draw_text(self, draw: ImageDraw.ImageDraw, width: int, height: int, title: str, subtitle: str, text_color: str) -> None:
        """
        Draw text on image

        Args:
            draw (ImageDraw.ImageDraw): ImageDraw object
            width (int): Image width
            height (int): Image height
            title (str): Main title
            subtitle (str): Subtitle
            text_color (str): Text color
        """
        # For simplicity, we'll use default fonts
        # In a production environment, you would load specific font files
        title_size = self.config["fonts"]["sizes"]["title"]
        subtitle_size = self.config["fonts"]["sizes"]["subtitle"]

        # Draw title (centered)
        title_rgb = self.hex_to_rgb(text_color)
        draw.text((width/2, height/2), title, fill=title_rgb, font=None)

        # Draw subtitle if provided (below title)
        if subtitle:
            draw.text((width/2, height/2 + 80), subtitle, fill=title_rgb, font=None)

    def get_available_templates(self) -> Dict[str, Any]:
        """Get available templates"""
        return self.config["templates"]

    def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self.config

    def update_config(self, new_config: Dict[str, Any]) -> None:
        """
        Update configuration

        Args:
            new_config (Dict[str, Any]): New configuration
        """
        self.config.update(new_config)
        self.save_configuration()

# Main execution
if __name__ == "__main__":
    agent = ThumbnailGenerationAgent()
    print("Thumbnail Generation Agent initialized")