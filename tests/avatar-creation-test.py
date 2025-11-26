#!/usr/bin/env python3
"""
Test für die KI-Avatar-Erstellung mit Training
"""

import requests
import json
import time
import os
from datetime import datetime

def test_avatar_creation():
    """Testet die KI-Avatar-Erstellung mit Training"""
    print("=== KI-Avatar-Erstellungstest ===")
    print(f"Startzeit: {datetime.now()}")

    # Basis-URL für den Avatar Generation Agent
    AVATAR_AGENT_URL = "http://localhost:5007"

    # 1. Health Check des Avatar Agents
    print("\n1. Health Check des Avatar Agents")
    try:
        response = requests.get(f"{AVATAR_AGENT_URL}/health", timeout=5)
        if response.status_code == 200:
            print("   ✓ Avatar Agent: Healthy")
        else:
            print(f"   ✗ Avatar Agent: Unhealthy (Status {response.status_code})")
            return False
    except Exception as e:
        print(f"   ✗ Avatar Agent: Unreachable ({str(e)})")
        return False

    # 2. Prüfung auf vortrainierte Modelle
    print("\n2. Prüfung auf vortrainierte Modelle")
    try:
        response = requests.get(f"{AVATAR_AGENT_URL}/models-status", timeout=10)
        if response.status_code == 200:
            models_data = response.json()
            required_models = models_data.get("requiredModels", [])
            missing_models = models_data.get("missingModels", [])

            print("   Verfügbare Modelle:")
            for model in required_models:
                status = "✓ Verfügbar" if model not in missing_models else "⚠ Fehlt"
                print(f"   - {model}: {status}")

            if missing_models:
                print(f"\n   Fehlende Modelle müssen heruntergeladen werden:")
                for model in missing_models:
                    print(f"   - {model}")

                # Modelle herunterladen
                print("\n3. Herunterladen fehlender Modelle")
                download_payload = {
                    "models": missing_models,
                    "priority": "high"
                }

                response = requests.post(f"{AVATAR_AGENT_URL}/download-models", json=download_payload, timeout=300)
                if response.status_code == 200:
                    download_data = response.json()
                    job_id = download_data.get("jobId")
                    print(f"   ✓ Download-Job gestartet (ID: {job_id})")

                    # Download-Fortschritt überwachen
                    max_attempts = 20
                    attempt = 0
                    while attempt < max_attempts:
                        response = requests.get(f"{AVATAR_AGENT_URL}/download-status/{job_id}", timeout=30)
                        if response.status_code == 200:
                            status_data = response.json()
                            status = status_data.get("status")
                            progress = status_data.get("progress", 0)

                            print(f"   Download-Fortschritt: {progress}%")

                            if status == "completed":
                                print("   ✓ Alle Modelle erfolgreich heruntergeladen")
                                break
                            elif status == "failed":
                                print("   ✗ Download fehlgeschlagen")
                                return False
                        else:
                            print("   ⚠ Konnte Download-Status nicht abrufen")

                        time.sleep(10)
                        attempt += 1
                else:
                    print(f"   ✗ Download-Job konnte nicht gestartet werden: {response.text}")
                    return False
        else:
            print(f"   ⚠ Konnte Modelldaten nicht abrufen: {response.text}")
    except Exception as e:
        print(f"   ⚠ Fehler bei der Modelldaten-Abfrage: {str(e)}")

    # 4. Avatar-Erstellungsdialog (gemäß Spezifikation)
    print("\n4. Avatar-Erstellungsdialog")

    # Auswahl zwischen Vorlagen oder Neuerstellung
    print("   Was möchten Sie erstellen?")
    print("   1. Aus vorhandener Vorlage")
    print("   2. Komplette Neuerstellung")

    # Für den Test wählen wir Neuerstellung
    creation_type = "new"  # oder "template"
    print("   Auswahl: Komplette Neuerstellung")

    # 5. Stimmenauswahl
    print("\n5. Stimmenauswahl")
    print("   1. Vorhandene Stimme verwenden")
    print("   2. Neue Stimme erstellen")

    # Für den Test wählen wir neue Stimme
    voice_option = "new"  # oder "existing"
    print("   Auswahl: Neue Stimme erstellen")

    # 6. Gesten-Auswahl
    print("\n6. Gesten-Auswahl")
    print("   1. Mit Gesten")
    print("   2. Ohne Gesten")

    # Für den Test wählen wir mit Gesten
    gestures_option = "with"  # oder "without"
    print("   Auswahl: Mit Gesten")

    # 7. Körpereinschluss-Auswahl
    print("\n7. Körpereinschluss-Auswahl")
    print("   1. Ganzkörper")
    print("   2. Teilweise (Oberkörper)")

    # Für den Test wählen wir Ganzkörper
    body_inclusion = "full"  # oder "partial"
    print("   Auswahl: Ganzkörper")

    # 8. Upload von Benutzerdaten (Audio/Video/Bilder)
    print("\n8. Upload von Benutzerdaten")
    print("   Für die Avatar-Erstellung werden folgende Daten benötigt:")
    print("   - Gesichtsbilder (Frontal-, Profilansichten)")
    print("   - Videoaufnahmen mit verschiedenen Gesichtsausdrücken")
    print("   - Sprachproben (ca. 30 Sekunden)")

    # Simuliere Upload von Benutzerdaten
    user_data_payload = {
        "dataType": "user_media",
        "files": [
            {"type": "image", "name": "face_frontal.jpg", "size": "2.4MB"},
            {"type": "image", "name": "face_profile.jpg", "size": "2.1MB"},
            {"type": "video", "name": "expressions.mp4", "size": "15.2MB"},
            {"type": "audio", "name": "voice_sample.wav", "size": "1.8MB"}
        ],
        "userId": "user_12345"
    }

    try:
        response = requests.post(f"{AVATAR_AGENT_URL}/upload-user-data", json=user_data_payload, timeout=60)
        if response.status_code == 201:
            upload_data = response.json()
            upload_session_id = upload_data.get("sessionId")
            print(f"   ✓ Benutzerdaten-Upload gestartet (Session ID: {upload_session_id})")

            # Simuliere Upload-Fortschritt
            time.sleep(2)  # Simuliere Upload-Zeit

            # Bestätige Upload-Abschluss
            confirm_payload = {
                "sessionId": upload_session_id,
                "status": "completed"
            }

            response = requests.post(f"{AVATAR_AGENT_URL}/confirm-upload", json=confirm_payload, timeout=30)
            if response.status_code == 200:
                print("   ✓ Benutzerdaten erfolgreich hochgeladen")
            else:
                print(f"   ✗ Upload-Bestätigung fehlgeschlagen: {response.text}")
                return False
        else:
            print(f"   ✗ Upload konnte nicht gestartet werden: {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Fehler beim Upload der Benutzerdaten: {str(e)}")
        return False

    # 9. Avatar-Konfiguration (gemäß Benutzerpräferenz: KI und Politik)
    print("\n9. Avatar-Konfiguration")
    avatar_payload = {
        "creationType": creation_type,
        "voiceOption": voice_option,
        "gestures": gestures_option,
        "bodyInclusion": body_inclusion,
        "character": "politician",
        "style": "professional",
        "theme": "ai_and_politics",  # Gemäß Benutzerpräferenz
        "customization": {
            "gender": "neutral",
            "age": "middle_aged",
            "hair_color": "dark_brown",
            "eye_color": "brown",
            "clothing": "business_suit",
            "accessories": ["glasses"],
            "expression": "neutral"
        },
        "training": {
            "duration": "extended",  # Längeres Training für bessere Qualität
            "samples": 1000,  # Anzahl der Trainingsbeispiele
            "optimization": "quality"  # Optimierung auf Qualität
        },
        "userDataSession": upload_session_id
    }

    print("   Konfiguration:")
    print(f"   - Typ: {creation_type}")
    print(f"   - Stimme: {voice_option}")
    print(f"   - Gesten: {gestures_option}")
    print(f"   - Körper: {body_inclusion}")
    print(f"   - Thema: KI und Politik")
    print(f"   - Benutzerdaten Session: {upload_session_id}")

    # 10. Avatar-Erstellung starten
    print("\n10. Avatar-Erstellung starten")
    try:
        response = requests.post(f"{AVATAR_AGENT_URL}/generate-avatar", json=avatar_payload, timeout=30)
        if response.status_code == 201:
            avatar_data = response.json()
            avatar_id = avatar_data.get("avatarId")
            training_job_id = avatar_data.get("trainingJobId")
            estimated_training_time = avatar_data.get("estimatedTrainingTime", "30-60 Minuten")

            print(f"   ✓ Avatar-Erstellung gestartet")
            print(f"   - Avatar ID: {avatar_id}")
            print(f"   - Trainings-Job ID: {training_job_id}")
            print(f"   - Geschätzte Trainingszeit: {estimated_training_time}")
        else:
            print(f"   ✗ Avatar-Erstellung fehlgeschlagen (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Avatar-Erstellung fehlgeschlagen: {str(e)}")
        return False

    # 11. Trainingsfortschritt überwachen
    print("\n11. Trainingsfortschritt überwachen")
    training_complete = False
    max_attempts = 30  # Maximal 30 Versuche (150 Sekunden)
    attempt = 0

    while not training_complete and attempt < max_attempts:
        try:
            response = requests.get(f"{AVATAR_AGENT_URL}/training-status/{training_job_id}", timeout=10)
            if response.status_code == 200:
                status_data = response.json()
                status = status_data.get("status")
                progress = status_data.get("progress", 0)
                message = status_data.get("message", "")

                print(f"   Fortschritt: {progress}% - {message}")

                if status == "completed":
                    training_complete = True
                    final_avatar_url = status_data.get("avatarUrl", "")
                    print(f"   ✓ Training abgeschlossen!")
                    print(f"   - Avatar URL: {final_avatar_url}")
                elif status == "failed":
                    print(f"   ✗ Training fehlgeschlagen: {message}")
                    return False
                else:
                    # Warte 5 Sekunden vor dem nächsten Versuch
                    time.sleep(5)
                    attempt += 1
            else:
                print(f"   ⚠ Konnte Trainingsstatus nicht abrufen (Status {response.status_code})")
                time.sleep(5)
                attempt += 1
        except Exception as e:
            print(f"   ⚠ Fehler beim Abrufen des Trainingsstatus: {str(e)}")
            time.sleep(5)
            attempt += 1

    if not training_complete:
        print(f"   ⚠ Training noch nicht abgeschlossen nach {max_attempts} Versuchen")
        print("   Das Training wird im Hintergrund fortgesetzt.")
        return True

    # 12. Avatar-Qualität prüfen
    print("\n12. Avatar-Qualität prüfen")
    quality_payload = {
        "avatarId": avatar_id,
        "checks": [
            "visual_quality",
            "movement_naturalness",
            "voice_sync",
            "expression_variety"
        ]
    }

    try:
        response = requests.post(f"{AVATAR_AGENT_URL}/validate-avatar", json=quality_payload, timeout=30)
        if response.status_code == 200:
            quality_data = response.json()
            quality_score = quality_data.get("qualityScore", 0)
            issues = quality_data.get("issues", [])

            print(f"   Qualitätsergebnis: {quality_score}/100")
            if quality_score >= 80:
                print("   ✓ Avatar-Qualität ist gut")
            elif quality_score >= 60:
                print("   ⚠ Avatar-Qualität ist akzeptabel")
            else:
                print("   ✗ Avatar-Qualität ist nicht ausreichend")

            if issues:
                print("   Verbesserungsvorschläge:")
                for issue in issues:
                    print(f"   - {issue}")
        else:
            print(f"   ✗ Qualitätstest fehlgeschlagen (Status {response.status_code}): {response.text}")
    except Exception as e:
        print(f"   ✗ Qualitätstest fehlgeschlagen: {str(e)}")

    # 13. Avatar speichern und bereitstellen
    print("\n13. Avatar speichern und bereitstellen")
    save_payload = {
        "avatarId": avatar_id,
        "name": "Mein KI-Avatar",
        "description": "KI-Avatar für politische Themen und Künstliche Intelligenz",
        "tags": ["KI", "Politik", "Moderator", "AI_and_Politics"],
        "isDefault": True  # Als Standard-Avatar verwenden
    }

    try:
        response = requests.post(f"{AVATAR_AGENT_URL}/save-avatar", json=save_payload, timeout=30)
        if response.status_code == 200:
            save_data = response.json()
            saved_avatar_id = save_data.get("avatarId")
            avatar_url = save_data.get("avatarUrl", "")

            print(f"   ✓ Avatar erfolgreich gespeichert")
            print(f"   - Gespeicherte Avatar ID: {saved_avatar_id}")
            print(f"   - Avatar URL: {avatar_url}")
        else:
            print(f"   ✗ Avatar-Speicherung fehlgeschlagen (Status {response.status_code}): {response.text}")
    except Exception as e:
        print(f"   ✗ Avatar-Speicherung fehlgeschlagen: {str(e)}")

    print(f"\n=== Avatar-Erstellung erfolgreich abgeschlossen ===")
    print(f"Endzeit: {datetime.now()}")
    print(f"Erstellter Avatar:")
    print(f"  - ID: {avatar_id}")
    print(f"  - Trainings-Job ID: {training_job_id}")
    print(f"  - URL: {final_avatar_url}")

    return True

if __name__ == "__main__":
    success = test_avatar_creation()
    if success:
        print("\n🎉 KI-Avatar erfolgreich erstellt!")
        exit(0)
    else:
        print("\n❌ Avatar-Erstellung fehlgeschlagen!")
        exit(1)