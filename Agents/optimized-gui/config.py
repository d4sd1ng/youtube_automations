#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Configuration for Optimized GUI
"""

import os
from pathlib import Path

# Basisverzeichnis
BASE_DIR = Path(__file__).parent

# GUI-Einstellungen
GUI_CONFIG = {
    "title": "Optimized Agent Management",
    "width": 1200,
    "height": 800,
    "theme": "dark",
    "language": "de"
}

# Agenten-Einstellungen
AGENT_CONFIG = {
    "scan_interval": 30,  # Sekunden
    "auto_refresh": True
}

# Logging-Einstellungen
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
}