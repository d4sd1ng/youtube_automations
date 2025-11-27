#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json

data = {
    "test": "Daten erfolgreich erstellt"
}

with open("test_output.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Test-Datei erfolgreich erstellt")