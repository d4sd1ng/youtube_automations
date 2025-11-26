#!/usr/bin/env python3
"""
Test für den Avatar Control Agenten
"""

import requests
import json
import time
import os
from datetime import datetime

def test_avatar_control():
    """Testet den Avatar Control Agenten"""
    print("=== Avatar Control Agent Test ===")
    print(f"Startzeit: {datetime.now()}")

    # Basis-URL für den Avatar Control Agent
    AVATAR_CONTROL_URL = "http://localhost:5009"
    HIGH_QUALITY_CONTENT_URL = "http://localhost:5008"

    # 1. Health Check des Agents
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

    # 2. Avatar-Steuerung testen (mit Avatar)
    print("\n2. Avatar-Steuerung testen (mit Avatar)")
    control_payload_with_avatar = {
        "avatarId": "avtr_12345678",
        "useAvatar": True,
        "speechText": "Hallo! Ich bin Ihr KI-Assistent und werde Ihnen jetzt einige wichtige Informationen präsentieren.",
        "gestures": ["wave", "point_right", "hand_gesture_natural"],
        "overlayIndicators": ["info_box", "key_points"],
        "emotion": "friendly",
        "tone": "professional",
        "speed": 1.0
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/control-avatar",
            json=control_payload_with_avatar,
            timeout=30
        )

        if response.status_code == 200:
            control_data = response.json()
            print(f"   ✓ Avatar-Steuerung erstellt: {control_data.get('controlId')}")
            print(f"   ✓ Aktion: {control_data.get('action')}")
            print(f"   ✓ Verwendeter Avatar: {control_data.get('avatarId')}")
            print(f"   ✓ Gesten: {len(control_data.get('gestures', []))}")
        else:
            print(f"   ✗ Avatar-Steuerung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Avatar-Steuerung fehlgeschlagen: {str(e)}")

    # 3. Avatar-Steuerung testen (ohne Avatar)
    print("\n3. Avatar-Steuerung testen (ohne Avatar)")
    control_payload_without_avatar = {
        "useAvatar": False,
        "speechText": "Dies ist eine Audio-only Präsentation ohne visuellen Avatar.",
        "emotion": "neutral",
        "tone": "calm",
        "speed": 0.9
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/control-avatar",
            json=control_payload_without_avatar,
            timeout=30
        )

        if response.status_code == 200:
            control_data = response.json()
            print(f"   ✓ Audio-Only-Steuerung erstellt: {control_data.get('controlId')}")
            print(f"   ✓ Aktion: {control_data.get('action')}")
            print(f"   ✓ Verwendung von Avatar: {control_data.get('useAvatar')}")
        else:
            print(f"   ✗ Audio-Only-Steuerung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Audio-Only-Steuerung fehlgeschlagen: {str(e)}")

    # 4. Gesten-Sequenz erstellen
    print("\n4. Gesten-Sequenz erstellen")
    gesture_sequence_payload = {
        "avatarId": "avtr_12345678",
        "gestureSequence": ["wave", "point_right", "thumbs_up", "hand_gesture_natural", "point_left"],
        "timing": [0, 2, 4, 6, 8],  # Sekunden
        "transitions": ["smooth", "quick", "smooth", "quick", "smooth"]
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
            print(f"   ✗ Gesten-Sequenz-Erstellung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Gesten-Sequenz-Erstellung fehlgeschlagen: {str(e)}")

    # 5. Overlay-Steuerung testen
    print("\n5. Overlay-Steuerung testen")
    overlay_control_payload = {
        "overlayElements": ["title_card", "key_points", "statistics_chart", "conclusion_box"],
        "avatarReactions": ["point_title", "gesture_keypoints", "point_chart", "hand_gesture_conclusion"],
        "timingControls": [0, 3, 6, 9]  # Sekunden
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/overlay-control",
            json=overlay_control_payload,
            timeout=30
        )

        if response.status_code == 200:
            overlay_data = response.json()
            print(f"   ✓ Overlay-Steuerung erstellt: {overlay_data.get('controlId')}")
            print(f"   ✓ Overlay-Elemente: {len(overlay_data.get('overlayElements', []))}")
            print(f"   ✓ Avatar-Reaktionen: {len(overlay_data.get('avatarReactions', []))}")
        else:
            print(f"   ✗ Overlay-Steuerung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Overlay-Steuerung fehlgeschlagen: {str(e)}")

    # 6. Skript-Ausführung testen
    print("\n6. Skript-Ausführung testen")
    script_execution_payload = {
        "scriptContent": "Willkommen zu unserer Präsentation über KI und Politik. Heute werden wir drei Hauptthemen behandeln: Erstens die Rolle von KI in der politischen Kommunikation, zweitens ethische Aspekte und drittens zukünftige Entwicklungen.",
        "avatarId": "avtr_12345678",
        "scenes": ["introduction", "main_content", "conclusion"],
        "gesturesPerScene": {
            "introduction": ["wave", "point_right"],
            "main_content": ["hand_gesture_natural", "point_left", "thumbs_up"],
            "conclusion": ["hand_gesture_conclusion", "point_conclusion"]
        },
        "overlayTriggers": {
            "introduction": ["title_card"],
            "main_content": ["key_points", "statistics_chart"],
            "conclusion": ["conclusion_box"]
        }
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/script-execution",
            json=script_execution_payload,
            timeout=30
        )

        if response.status_code == 200:
            script_data = response.json()
            print(f"   ✓ Skript-Ausführung erstellt: {script_data.get('scriptId')}")
            print(f"   ✓ Szenen: {len(script_data.get('scenes', []))}")
            print(f"   ✓ Gesten pro Szene: {list(script_data.get('gesturesPerScene', {}).keys())}")
        else:
            print(f"   ✗ Skript-Ausführung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Skript-Ausführung fehlgeschlagen: {str(e)}")

    # 7. Integrierter Avatar-Workflow testen
    print("\n7. Integrierter Avatar-Workflow testen")
    integrated_workflow_payload = {
        "workflowName": "KI und Politik Präsentation",
        "avatarConfig": {
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
            "voice_sample": "path/to/voice/sample.wav",
            "voice_tone": "professional",
            "full_body": True,
            "gesture_support": True,
            "hand_animations": True
        },
        "scriptContent": "Willkommen zu unserer Präsentation über KI und Politik. Heute werden wir drei Hauptthemen behandeln: Erstens die Rolle von KI in der politischen Kommunikation, zweitens ethische Aspekte und drittens zukünftige Entwicklungen.",
        "scenes": ["introduction", "main_content", "conclusion"],
        "gesturesPerScene": {
            "introduction": ["wave", "point_right"],
            "main_content": ["hand_gesture_natural", "point_left", "thumbs_up"],
            "conclusion": ["hand_gesture_conclusion", "point_conclusion"]
        },
        "overlayTriggers": {
            "introduction": ["title_card"],
            "main_content": ["key_points", "statistics_chart"],
            "conclusion": ["conclusion_box"]
        },
        "audioConfig": {
            "processAudio": True,
            "voiceId": "default",
            "speed": 1.0,
            "emotion": "professional"
        },
        "videoConfig": {
            "processVideo": True,
            "resolution": "1080p",
            "duration": "auto"
        }
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/integrated-avatar-workflow",
            json=integrated_workflow_payload,
            timeout=120
        )

        if response.status_code == 200:
            workflow_data = response.json()
            print(f"   ✓ Integrierter Workflow erstellt: {workflow_data.get('workflowId')}")
            print(f"   ✓ Workflow-Name: {workflow_data.get('workflowName')}")
            print(f"   ✓ Verwendeter Avatar: {workflow_data.get('avatarId')}")
            print(f"   ✓ Status: {workflow_data.get('status')}")
        else:
            print(f"   ✗ Integrierter Workflow fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Integrierter Workflow fehlgeschlagen: {str(e)}")

    # 8. Persönliche Avatar-Erstellung testen
    print("\n8. Persönliche Avatar-Erstellung testen")
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
        "gestures": ["pointing", "hand_gestures", "natural_movement"]
    }

    try:
        response = requests.post(
            f"{AVATAR_CONTROL_URL}/create-personal-avatar",
            json=personal_avatar_payload,
            timeout=120
        )

        if response.status_code == 200:
            avatar_data = response.json()
            print(f"   ✓ Persönlicher Avatar-Erstellungsprozess gestartet: {avatar_data.get('avatarId')}")
            print(f"   ✓ Status: {avatar_data.get('status')}")
            print(f"   ✓ Geschätzte Trainingszeit: {avatar_data.get('estimatedTrainingTime')}")
            print(f"   ✓ Verbrauchte Tokens: {avatar_data.get('consumedTokens', 0)}")
        else:
            print(f"   ✗ Persönliche Avatar-Erstellung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Persönliche Avatar-Erstellung fehlgeschlagen: {str(e)}")

    print(f"\n=== Test abgeschlossen um: {datetime.now()} ===")
    return True

if __name__ == "__main__":
    test_avatar_control()