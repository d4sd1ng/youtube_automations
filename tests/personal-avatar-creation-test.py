#!/usr/bin/env python3
"""
Test für die persönliche KI-Avatar-Erstellung mit vorhandener Stimmprobe
"""

import requests
import json
import time
import os
from datetime import datetime

def test_personal_avatar_creation():
    """Testet die persönliche KI-Avatar-Erstellung mit vorhandener Stimmprobe"""
    print("=== Persönliche KI-Avatar-Erstellungstest ===")
    print(f"Startzeit: {datetime.now()}")

    # Basis-URL für den Avatar Control Agent
    AVATAR_CONTROL_URL = "http://localhost:5009"

    # 1. Health Check des Avatar Control Agents
    print("\n1. Health Check des Avatar Control Agents")
    try:
        response = requests.get(f"{AVATAR_CONTROL_URL}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✓ Avatar Control Agent: Healthy")
        else:
            print(f"   ✗ Avatar Control Agent: Unhealthy (Status {response.status_code})")
            return False
    except Exception as e:
        print(f"   ✗ Avatar Control Agent: Unreachable ({str(e)})")
        return False

    # 2. Persönliche Avatar-Erstellung starten
    print("\n2. Persönliche Avatar-Erstellung mit vorhandener Stimmprobe starten")
    personal_avatar_payload = {
        "character": "politician",
        "style": "professional",
        "theme": "ai_and_politics",
        "customization": {
            "gender": "neutral",
            "age": "middle_aged",
            "hair_color": "dark_brown",
            "eye_color": "brown",
            "clothing": "business_suit",
            "accessories": ["glasses"],
            "expression": "neutral"
        },
        "voiceSample": "user_voice_sample.wav",  # Verwendung Ihrer vorhandenen Stimmprobe
        "voiceTone": "professional",
        "voiceSpeed": 1.0,
        "language": "de",
        "fullBody": True,
        "gestureSupport": True,
        "handAnimations": True,
        "bodyLanguage": "professional",
        "gestures": ["pointing", "hand_gestures", "natural_movement"],
        "personal_avatar": True
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/create-personal-avatar",
            json=personal_avatar_payload,
            timeout=120
        )

        if response.status_code == 200:
            avatar_data = response.json()
            print(f"   ✓ Persönlicher Avatar-Erstellungsprozess gestartet!")
            print(f"   ✓ Avatar-ID: {avatar_data.get('avatarId')}")
            print(f"   ✓ Status: {avatar_data.get('status')}")
            print(f"   ✓ Geschätzte Trainingszeit: {avatar_data.get('estimatedTrainingTime')}")
            print(f"   ✓ Verbrauchte Tokens: {avatar_data.get('consumedTokens', 0)}")
            print(f"   ✓ Token-Kosten: {avatar_data.get('tokenCost', 0)}")

            # Avatar-ID für weitere Tests speichern
            avatar_id = avatar_data.get('avatarId')
        else:
            print(f"   ✗ Persönliche Avatar-Erstellung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Persönliche Avatar-Erstellung fehlgeschlagen: {str(e)}")
        return False

    # 3. Token-Balance nach der Erstellung prüfen
    print("\n3. Token-Balance nach der Avatar-Erstellung prüfen")
    try:
        # Zuerst müssen wir den High-Quality Content Agent kontaktieren, da der Token-Endpoint dort ist
        HIGH_QUALITY_CONTENT_URL = "http://localhost:5008"
        response = requests.get(f"{HIGH_QUALITY_CONTENT_URL}/tokens/balance", timeout=5)
        if response.status_code == 200:
            token_data = response.json()
            print(f"   ✓ Aktuelle Token-Balance: {token_data.get('remaining_tokens', 0)} Tokens")
            print(f"   ✓ Verbrauchte Tokens insgesamt: {token_data.get('used_tokens', 0)} Tokens")
        else:
            print(f"   ⚠ Token-Balance konnte nicht abgerufen werden (Status {response.status_code})")
    except Exception as e:
        print(f"   ⚠ Token-Balance-Check fehlgeschlagen: {str(e)}")

    # 4. Avatar-Steuerung testen
    print("\n4. Avatar-Steuerung mit Gesten testen")
    control_payload = {
        "avatarId": avatar_id,
        "useAvatar": True,
        "speechText": "Hallo! Ich bin Ihr persönlicher KI-Assistent. Der Trainingsprozess für meinen Avatar ist gestartet und wird in Kürze abgeschlossen sein.",
        "gestures": ["wave", "point_right", "hand_gesture_natural"],
        "overlayIndicators": ["info_box", "training_status"],
        "emotion": "friendly",
        "tone": "professional",
        "speed": 1.0
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/control-avatar",
            json=control_payload,
            timeout=30
        )

        if response.status_code == 200:
            control_data = response.json()
            print(f"   ✓ Avatar-Steuerung erfolgreich: {control_data.get('controlId')}")
            print(f"   ✓ Aktion: {control_data.get('action')}")
            print(f"   ✓ Verwendete Gesten: {len(control_data.get('gestures', []))}")
        else:
            print(f"   ⚠ Avatar-Steuerung fehlgeschlagen (Status {response.status_code})")
            print(f"   ⚠ Fehler: {response.text}")
    except Exception as e:
        print(f"   ⚠ Avatar-Steuerung fehlgeschlagen: {str(e)}")

    # 5. Gesten-Sequenz für Präsentation erstellen
    print("\n5. Gesten-Sequenz für zukünftige Präsentationen erstellen")
    gesture_sequence_payload = {
        "avatarId": avatar_id,
        "gestureSequence": ["wave", "point_right", "thumbs_up", "hand_gesture_natural", "point_left", "hand_gesture_conclusion"],
        "timing": [0, 2, 4, 6, 8, 10],  # Sekunden
        "transitions": ["smooth", "quick", "smooth", "quick", "smooth", "smooth"]
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/create-gesture-sequence",
            json=gesture_sequence_payload,
            timeout=30
        )

        if response.status_code == 200:
            sequence_data = response.json()
            print(f"   ✓ Gesten-Sequenz erstellt: {sequence_data.get('sequenceId')}")
            print(f"   ✓ Anzahl Gesten: {len(sequence_data.get('gestureSequence', []))}")
            print(f"   ✓ Timing-Punkte: {len(sequence_data.get('timing', []))}")
        else:
            print(f"   ⚠ Gesten-Sequenz-Erstellung fehlgeschlagen (Status {response.status_code})")
            print(f"   ⚠ Fehler: {response.text}")
    except Exception as e:
        print(f"   ⚠ Gesten-Sequenz-Erstellung fehlgeschlagen: {str(e)}")

    print(f"\n=== Test abgeschlossen um: {datetime.now()} ===")
    print("\n📋 Nächste Schritte:")
    print("   1. Der Avatar-Trainingsprozess läuft jetzt im Hintergrund")
    print("   2. Geschätzte Trainingszeit: 30-60 Minuten")
    print("   3. Nach Abschluss können Sie den Avatar für Voiceover und Präsentationen verwenden")
    print("   4. Die Gesten-Sequenz ist bereit für zukünftige Videos")

    return True

if __name__ == "__main__":
    test_personal_avatar_creation()