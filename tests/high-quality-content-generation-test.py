#!/usr/bin/env python3
"""
Test für die hochqualitative Inhalteerstellung mit WAN 2.2 und alternativen Plattformen
"""

import requests
import json
import time
import os
from datetime import datetime

def test_high_quality_content_generation():
    """Testet die hochqualitative Inhalteerstellung mit WAN 2.2 und alternativen Plattformen"""
    print("=== Hochqualitative Inhalteerstellungstest ===")
    print(f"Startzeit: {datetime.now()}")

    # Basis-URL für den High-Quality Content Generation Agent
    HQ_CONTENT_AGENT_URL = "http://localhost:5008"

    # 1. Health Check des Agents
    print("\n1. Health Check des High-Quality Content Generation Agents")
    try:
        response = requests.get(f"{HQ_CONTENT_AGENT_URL}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✓ High-Quality Content Agent: Healthy")
            platforms = health_data.get('platforms', {})
            for platform_key, platform_info in platforms.items():
                print(f"   ✓ {platform_info['name']}: {'Verfügbar' if platform_info['available'] else 'Nicht verfügbar'}")

            # Token balance
            tokens = health_data.get('tokens', {})
            print(f"   ✓ Verfügbare Tokens: {tokens.get('remaining_tokens', 0)}")
        else:
            print(f"   ✗ High-Quality Content Agent: Unhealthy (Status {response.status_code})")
            return False
    except Exception as e:
        print(f"   ✗ High-Quality Content Agent: Unreachable ({str(e)})")
        return False

    # 2. Token Management testen
    print("\n2. Token Management testen")
    try:
        # Token balance abrufen
        response = requests.get(f"{HQ_CONTENT_AGENT_URL}/tokens/balance", timeout=5)
        if response.status_code == 200:
            token_data = response.json()
            print(f"   ✓ Aktuelle Token-Balance: {token_data.get('remaining_tokens', 0)}")
        else:
            print(f"   ✗ Token-Balance konnte nicht abgerufen werden (Status {response.status_code})")

        # Token History abrufen
        response = requests.get(f"{HQ_CONTENT_AGENT_URL}/tokens/history", timeout=5)
        if response.status_code == 200:
            history = response.json()
            print(f"   ✓ Token-History Einträge: {len(history)}")
        else:
            print(f"   ✗ Token-History konnte nicht abgerufen werden (Status {response.status_code})")
    except Exception as e:
        print(f"   ✗ Token Management fehlgeschlagen: {str(e)}")

    # 3. Thumbnail-Erstellung mit Token-Check testen
    print("\n3. Thumbnail-Erstellung mit Token-Check testen")

    # Test WAN 2.2 (keine Token benötigt)
    thumbnail_payload_wan22 = {
        "prompt": "Professional politician avatar with AI theme, high quality, cinematic lighting",
        "style": "cinematic",
        "size": "1280*720",
        "theme": "ai_and_politics",
        "platform": "wan22",
        "checkTokens": True
    }

    try:
        response = requests.post(
            f"{HQ_CONTENT_AGENT_URL}/generate-thumbnail",
            json=thumbnail_payload_wan22,
            timeout=30
        )

        if response.status_code == 200:
            thumbnail_data = response.json()
            print(f"   ✓ Thumbnail (WAN 2.2) erstellt: {thumbnail_data.get('thumbnailId')}")
            print(f"   ✓ Methode: {thumbnail_data.get('generationMethod')}")
            print(f"   ✓ Token-Kosten: {thumbnail_data.get('tokenCost', 0)}")
        else:
            print(f"   ✗ Thumbnail-Erstellung (WAN 2.2) fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Thumbnail-Erstellung (WAN 2.2) fehlgeschlagen: {str(e)}")

    # Test Stability AI (mit Token-Check)
    thumbnail_payload_stability = {
        "prompt": "Professional politician avatar with AI theme, high quality, cinematic lighting",
        "style": "cinematic",
        "size": "1280*720",
        "theme": "ai_and_politics",
        "platform": "stability_ai",
        "checkTokens": True
    }

    try:
        response = requests.post(
            f"{HQ_CONTENT_AGENT_URL}/generate-thumbnail",
            json=thumbnail_payload_stability,
            timeout=30
        )

        if response.status_code == 200:
            thumbnail_data = response.json()
            print(f"   ✓ Thumbnail (Stability AI) erstellt: {thumbnail_data.get('thumbnailId')}")
            print(f"   ✓ Methode: {thumbnail_data.get('generationMethod')}")
            print(f"   ✓ Token-Kosten: {thumbnail_data.get('tokenCost', 0)}")
            print(f"   ✓ Verbrauchte Tokens: {thumbnail_data.get('consumedTokens', 0)}")
        else:
            print(f"   ⚠ Thumbnail-Erstellung (Stability AI) nicht verfügbar (Status {response.status_code})")
            print(f"   ⚠ Fehler: {response.text}")
    except Exception as e:
        print(f"   ⚠ Thumbnail-Erstellung (Stability AI) nicht verfügbar: {str(e)}")

    # 4. Video-Erstellung mit Token-Check testen
    print("\n4. Video-Erstellung mit Token-Check testen")

    # Test WAN 2.2 (keine Token benötigt)
    video_payload_wan22 = {
        "prompt": "AI politician discussing future technology trends in a professional setting",
        "taskType": "t2v-A14B",
        "size": "1280*720",
        "frameNum": 24,
        "style": "cinematic",
        "theme": "ai_and_politics",
        "platform": "wan22",
        "checkTokens": True
    }

    try:
        response = requests.post(
            f"{HQ_CONTENT_AGENT_URL}/generate-video",
            json=video_payload_wan22,
            timeout=30
        )

        if response.status_code == 200:
            video_data = response.json()
            print(f"   ✓ Video (WAN 2.2) erstellt: {video_data.get('videoId')}")
            print(f"   ✓ Methode: {video_data.get('generationMethod')}")
            print(f"   ✓ Token-Kosten: {video_data.get('tokenCost', 0)}")
        else:
            print(f"   ✗ Video-Erstellung (WAN 2.2) fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Video-Erstellung (WAN 2.2) fehlgeschlagen: {str(e)}")

    # 5. Avatar-Erstellung mit Token-Check testen
    print("\n5. Avatar-Erstellung mit Token-Check testen")

    # Test Synthesia (für Sprach-Avatar mit Gesten und vollem Körper)
    avatar_payload_synthesia = {
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
        "voice_speed": 1.0,
        "language": "de",
        "full_body": True,  # Kopf, Oberkörper, Arme und Hände
        "gesture_support": True,
        "hand_animations": True,
        "body_language": "professional",
        "gestures": ["pointing", "hand_gestures", "natural_movement"],
        "platform": "synthesia",
        "checkTokens": True
    }

    try:
        response = requests.post(
            f"{HQ_CONTENT_AGENT_URL}/generate-avatar",
            json=avatar_payload_synthesia,
            timeout=30
        )

        if response.status_code == 200:
            avatar_data = response.json()
            print(f"   ✓ Sprach-Avatar mit Gesten (Synthesia) erstellt: {avatar_data.get('avatarId')}")
            print(f"   ✓ Methode: {avatar_data.get('generationMethod')}")
            print(f"   ✓ Token-Kosten: {avatar_data.get('tokenCost', 0)}")
            print(f"   ✓ Verbrauchte Tokens: {avatar_data.get('consumedTokens', 0)}")

            voice_params = avatar_data.get('voiceParameters', {})
            if voice_params:
                print(f"   ✓ Sprachparameter: Ton={voice_params.get('voice_tone')}, Geschwindigkeit={voice_params.get('voice_speed')}")

            gesture_params = avatar_data.get('gestureParameters', {})
            if gesture_params:
                print(f"   ✓ Gestenparameter: Vollkörper={gesture_params.get('full_body')}, Gesten={len(gesture_params.get('gestures', []))}")
        else:
            print(f"   ⚠ Sprach-Avatar-Erstellung (Synthesia) nicht verfügbar (Status {response.status_code})")
            print(f"   ⚠ Fehler: {response.text}")
    except Exception as e:
        print(f"   ⚠ Sprach-Avatar-Erstellung (Synthesia) nicht verfügbar: {str(e)}")

    # Test mit falscher Plattform (sollte Fehler werfen)
    avatar_payload_wrong_platform = {
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
        "platform": "wan22",  # Falsche Plattform für Sprach-Avatar
        "checkTokens": True
    }

    try:
        response = requests.post(
            f"{HQ_CONTENT_AGENT_URL}/generate-avatar",
            json=avatar_payload_wrong_platform,
            timeout=30
        )

        if response.status_code == 400:
            error_data = response.json()
            print(f"   ✓ Korrekte Fehlermeldung für falsche Plattform: {error_data.get('error')}")
        else:
            print(f"   ⚠ Unerwarteter Statuscode für falsche Plattform: {response.status_code}")
    except Exception as e:
        print(f"   ⚠ Fehler bei Test mit falscher Plattform: {str(e)}")

    # 6. Batch-Erstellung mit Token-Check testen
    print("\n6. Batch-Erstellung mit Token-Check testen")
    batch_payload = {
        "items": [
            {
                "type": "thumbnail",
                "prompt": "AI and politics theme thumbnail",
                "style": "cinematic",
                "platform": "wan22"
            },
            {
                "type": "video",
                "prompt": "AI politician discussing technology",
                "taskType": "t2v-A14B",
                "platform": "wan22"
            },
            {
                "type": "avatar",
                "character": "politician",
                "style": "professional",
                "voice_sample": "path/to/voice/sample.wav",
                "voice_tone": "professional",
                "full_body": True,  # Kopf, Oberkörper, Arme und Hände
                "gesture_support": True,
                "hand_animations": True,
                "body_language": "professional",
                "gestures": ["pointing", "hand_gestures", "natural_movement"],
                "platform": "synthesia"  # Sprach-Avatar benötigt Synthesia
            },
            {
                "type": "thumbnail",
                "prompt": "Alternative thumbnail",
                "style": "cinematic",
                "platform": "stability_ai"
            }
        ],
        "checkTokens": True
    }

    try:
        response = requests.post(
            f"{HQ_CONTENT_AGENT_URL}/batch-generate",
            json=batch_payload,
            timeout=30
        )

        if response.status_code == 200:
            batch_data = response.json()
            print(f"   ✓ Batch mit Sprach-Avatar und Gesten erstellt: {batch_data.get('batchId')}")
            print(f"   ✓ Items erstellt: {len(batch_data.get('items', []))}")
            print(f"   ✓ Gesamtkosten: {batch_data.get('totalTokenCost', 0)} Tokens")
            print(f"   ✓ Verbrauchte Tokens: {batch_data.get('consumedTokens', 0)}")
            for item in batch_data.get('items', []):
                print(f"     - {item.get('type')} ({item.get('platform', 'default')}): {item.get('status')}")
        else:
            print(f"   ✗ Batch-Erstellung fehlgeschlagen (Status {response.status_code})")
            print(f"   ✗ Fehler: {response.text}")
    except Exception as e:
        print(f"   ✗ Batch-Erstellung fehlgeschlagen: {str(e)}")

    print(f"\n=== Test abgeschlossen um: {datetime.now()} ===")
    return True

if __name__ == "__main__":
    test_high_quality_content_generation()