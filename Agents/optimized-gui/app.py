#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Optimized GUI for Agent Management
"""

import os
import sys
from pathlib import Path

# Füge das src-Verzeichnis zum Python-Pfad hinzu
sys.path.append(str(Path(__file__) / "src"))

from src.gui_manager import GUIManager
from config import GUI_CONFIG

def main():
    print("Optimized GUI for Agent Management")
    print("==================================")
    print(f"Starting {GUI_CONFIG['title']}...")

    # Initialisiere die GUI
    gui = GUIManager()
    gui.initialize()
    gui.start()

    print("GUI initialized successfully.")

if __name__ == "__main__":
    main()