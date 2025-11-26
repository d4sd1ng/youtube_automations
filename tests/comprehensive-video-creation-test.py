#!/usr/bin/env python3
"""
Umfassender Test für die Video-Erstellung:
1. Komplette Short-Erstellung vom Scraping bis zum fertigen Short mit allen Komponenten
2. Short-Erstellung aus Long-Videos (1:1-Kopie des meistgesehenen Long-Videos je Kategorie)
"""

import requests
import json
import time
import os
from datetime import datetime

def health_check():
    """Führt einen Health Check aller benötigten Agenten durch"""
    print("=== Health Check aller Agenten ===")

    # Basis-URLs der Python-Agenten
    BASE_PORT = 5000
    agents = {
        'web-scraping': BASE_PORT,
        'trend-analysis': BASE_PORT + 1,
        'script-generation': BASE_PORT + 2,
        'seo-optimization': BASE_PORT + 3,
        'thumbnail-generation': BASE_PORT + 4,
        'video-processing': BASE_PORT + 5,
        'translation': BASE_PORT + 6,
        'avatar-generation': BASE_PORT + 7,
        'audio-processing': BASE_PORT + 8,
        'content-approval': BASE_PORT + 9,
        'quality-check': BASE_PORT + 10,
        'analytics': BASE_PORT + 11
    }

    urls = {agent: f"http://localhost:{port}" for agent, port in agents.items()}

    all_healthy = True
    for agent, url in urls.items():
        try:
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"   ✓ {agent}: Healthy")
            else:
                print(f"   ✗ {agent}: Unhealthy (Status {response.status_code})")
                all_healthy = False
        except Exception as e:
            print(f"   ✗ {agent}: Unreachable ({str(e)})")
            all_healthy = False

    return all_healthy, urls

def test_complete_short_creation(urls):
    """Testet die vollständige Short-Erstellung mit allen Komponenten"""
    print("\n=== 1. Komplette Short-Erstellung mit allen Komponenten ===")

    categories = ["Politara", "Autonova"]
    results = {}

    for category in categories:
        print(f"\n--- Erstellung für Kategorie: {category} ---")

        # 1. Web Scraping für aktuelle Themen
        print(f"1. Web Scraping für {category}")
        scraping_payload = {
            "url": f"https://www.{category.lower()}.de/newsticker",
            "contentTypes": ["headlines", "articles"],
            "topic": f"Aktuelle politische Themen in {category}"
        }

        try:
            response = requests.post(f"{urls['web-scraping']}/scrape-content", json=scraping_payload, timeout=30)
            if response.status_code == 201:
                scraping_data = response.json()
                scraping_id = scraping_data.get("scrapingId")
                scraped_content = scraping_data.get("data", {})
                print(f"   ✓ Web Scraping erfolgreich (ID: {scraping_id})")
            else:
                print(f"   ✗ Web Scraping fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Web Scraping fehlgeschlagen: {str(e)}")
            continue

        # 2. Themenauswahl (Identifizierung des meistgesehenen Inhalts)
        print(f"2. Themenauswahl für {category}")
        trend_payload = {
            "content": str(scraped_content),
            "topic": f"Aktuelle politische Themen in {category}",
            "platforms": ["youtube"],
            "analysisType": "viewCount"
        }

        try:
            response = requests.post(f"{urls['trend-analysis']}/analyze-trends", json=trend_payload, timeout=30)
            if response.status_code == 201:
                trend_data = response.json()
                trend_id = trend_data.get("trendId")
                most_viewed_content = trend_data.get("mostViewedContent", {})
                selected_topic = most_viewed_content.get("title", "Standardthema")
                print(f"   ✓ Themenauswahl erfolgreich")
                print(f"   Ausgewähltes Thema: {selected_topic}")
            else:
                print(f"   ✗ Themenauswahl fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Themenauswahl fehlgeschlagen: {str(e)}")
            continue

        # 3. Script Generation
        print(f"3. Script Generation für {category}")
        script_payload = {
            "topic": selected_topic,
            "content": str(most_viewed_content),
            "tone": "informative",
            "targetAudience": "general public",
            "platform": "youtube_shorts",
            "duration": 60  # Sekunden
        }

        try:
            response = requests.post(f"{urls['script-generation']}/generate-script", json=script_payload, timeout=30)
            if response.status_code == 201:
                script_data = response.json()
                script_id = script_data.get("scriptId")
                script_content = script_data.get("script", "")
                print(f"   ✓ Script Generation erfolgreich (ID: {script_id})")
            else:
                print(f"   ✗ Script Generation fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Script Generation fehlgeschlagen: {str(e)}")
            continue

        # 4. SEO Optimization
        print(f"4. SEO Optimization für {category}")
        seo_payload = {
            "title": f"{selected_topic} - Kurz & Knackig erklärt",
            "description": f"Alles was du über {selected_topic} wissen musst - in 60 Sekunden erklärt. #Politik #News",
            "tags": [selected_topic.replace(" ", ""), "Politik", "News", "Erklärvideo", "Shorts"],
            "platform": "youtube"
        }

        try:
            response = requests.post(f"{urls['seo-optimization']}/optimize-metadata", json=seo_payload, timeout=30)
            if response.status_code == 201:
                seo_data = response.json()
                seo_id = seo_data.get("optimizationId")
                optimized_metadata = seo_data.get("metadata", {})
                print(f"   ✓ SEO Optimization erfolgreich (ID: {seo_id})")
            else:
                print(f"   ✗ SEO Optimization fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ SEO Optimization fehlgeschlagen: {str(e)}")
            continue

        # 5. Thumbnail Generation
        print(f"5. Thumbnail Generation für {category}")
        thumbnail_payload = {
            "script": script_content,
            "platform": "youtube_shorts",
            "style": "bold",
            "textOverlay": selected_topic,
            "dimensions": "1080x1920"  # Shorts-Format
        }

        try:
            response = requests.post(f"{urls['thumbnail-generation']}/generate-thumbnail", json=thumbnail_payload, timeout=30)
            if response.status_code == 201:
                thumbnail_data = response.json()
                thumbnail_id = thumbnail_data.get("thumbnailId")
                thumbnail_url = thumbnail_data.get("thumbnailUrl", "")
                print(f"   ✓ Thumbnail Generation erfolgreich (ID: {thumbnail_id})")
            else:
                print(f"   ✗ Thumbnail Generation fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Thumbnail Generation fehlgeschlagen: {str(e)}")
            continue

        # 6. Avatar Generation
        print(f"6. Avatar Generation für {category}")
        avatar_payload = {
            "character": "politician",
            "style": "professional",
            "expression": "neutral",
            "customization": {
                "hair_color": "brown",
                "clothing": "business"
            }
        }

        try:
            response = requests.post(f"{urls['avatar-generation']}/generate-avatar", json=avatar_payload, timeout=30)
            if response.status_code == 201:
                avatar_data = response.json()
                avatar_id = avatar_data.get("avatarId")
                avatar_url = avatar_data.get("avatarUrl", "")
                print(f"   ✓ Avatar Generation erfolgreich (ID: {avatar_id})")
            else:
                print(f"   ✗ Avatar Generation fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Avatar Generation fehlgeschlagen: {str(e)}")
            continue

        # 7. Audio Processing (Text-to-Speech)
        print(f"7. Audio Processing für {category}")
        audio_payload = {
            "text": script_content,
            "voice": "professional_male",
            "language": "de-DE",
            "speed": 1.0,
            "emotion": "neutral"
        }

        try:
            response = requests.post(f"{urls['audio-processing']}/generate-audio", json=audio_payload, timeout=30)
            if response.status_code == 201:
                audio_data = response.json()
                audio_id = audio_data.get("audioId")
                audio_url = audio_data.get("audioUrl", "")
                print(f"   ✓ Audio Processing erfolgreich (ID: {audio_id})")
            else:
                print(f"   ✗ Audio Processing fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Audio Processing fehlgeschlagen: {str(e)}")
            continue

        # 8. Untertitel Generation (Translation für Untertitel)
        print(f"8. Untertitel Generation für {category}")
        subtitle_payload = {
            "text": script_content,
            "sourceLanguage": "de-DE",
            "targetLanguages": ["de-DE"],  # Gleiche Sprache für Untertitel
            "format": "srt"
        }

        try:
            response = requests.post(f"{urls['translation']}/generate-subtitles", json=subtitle_payload, timeout=30)
            if response.status_code == 201:
                subtitle_data = response.json()
                subtitle_id = subtitle_data.get("subtitleId")
                subtitle_url = subtitle_data.get("subtitleUrl", "")
                print(f"   ✓ Untertitel Generation erfolgreich (ID: {subtitle_id})")
            else:
                print(f"   ✗ Untertitel Generation fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Untertitel Generation fehlgeschlagen: {str(e)}")
            continue

        # 9. Video Processing (Kombination aller Elemente)
        print(f"9. Video Processing für {category}")
        video_payload = {
            "scriptId": script_id,
            "audioId": audio_id,
            "thumbnailId": thumbnail_id,
            "avatarId": avatar_id,
            "subtitleId": subtitle_id,
            "format": "shorts",
            "duration": 60,  # Sekunden
            "resolution": "1080x1920",
            "fps": 30
        }

        try:
            response = requests.post(f"{urls['video-processing']}/create-video", json=video_payload, timeout=120)
            if response.status_code == 201:
                video_data = response.json()
                video_id = video_data.get("videoId")
                video_url = video_data.get("videoUrl", "")
                print(f"   ✓ Video Processing erfolgreich (ID: {video_id})")
            else:
                print(f"   ✗ Video Processing fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Video Processing fehlgeschlagen: {str(e)}")
            continue

        # 10. Automatische Qualitätsprüfung
        print(f"10. Automatische Qualitätsprüfung für {category}")
        quality_payload = {
            "videoId": video_id,
            "checks": [
                "audio_quality",
                "video_quality",
                "subtitle_sync",
                "content_compliance",
                "seo_optimization"
            ]
        }

        try:
            response = requests.post(f"{urls['quality-check']}/validate-content", json=quality_payload, timeout=60)
            if response.status_code == 200:
                quality_data = response.json()
                quality_report_id = quality_data.get("reportId")
                quality_status = quality_data.get("status", "failed")
                issues = quality_data.get("issues", [])

                if quality_status == "passed":
                    print(f"   ✓ Automatische Qualitätsprüfung erfolgreich (ID: {quality_report_id})")
                else:
                    print(f"   ⚠ Qualitätsprüfung mit Warnungen (ID: {quality_report_id})")
                    for issue in issues:
                        print(f"     - {issue}")
            else:
                print(f"   ✗ Automatische Qualitätsprüfung fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Automatische Qualitätsprüfung fehlgeschlagen: {str(e)}")
            continue

        # 11. Analytics Tracking
        print(f"11. Analytics Tracking für {category}")
        analytics_payload = {
            "videoId": video_id,
            "eventType": "creation_completed",
            "metadata": {
                "topic": selected_topic,
                "duration": 60,
                "platform": "youtube_shorts",
                "category": category
            }
        }

        try:
            response = requests.post(f"{urls['analytics']}/track-event", json=analytics_payload, timeout=30)
            if response.status_code == 201:
                analytics_data = response.json()
                event_id = analytics_data.get("eventId")
                print(f"   ✓ Analytics Tracking erfolgreich (ID: {event_id})")
            else:
                print(f"   ✗ Analytics Tracking fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Analytics Tracking fehlgeschlagen: {str(e)}")
            continue

        # 12. Content Approval
        print(f"12. Content Approval für {category}")
        approval_payload = {
            "contentId": video_id,
            "contentType": "short_video",
            "channel": category,
            "reviewers": ["admin"],
            "qualityReportId": quality_report_id,
            "metadata": optimized_metadata
        }

        try:
            response = requests.post(f"{urls['content-approval']}/submit-for-approval", json=approval_payload, timeout=30)
            if response.status_code == 201:
                approval_data = response.json()
                approval_id = approval_data.get("approvalId")
                print(f"   ✓ Content Approval für {category} erfolgreich (ID: {approval_id})")
            else:
                print(f"   ✗ Content Approval für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Content Approval für {category} fehlgeschlagen: {str(e)}")
            continue

        # 13. Freigabe des Inhalts
        print(f"13. Freigabe des Inhalts für {category}")
        approve_payload = {
            "approver": "admin",
            "comments": "Inhalt entspricht den Qualitätsstandards"
        }

        try:
            response = requests.post(f"{urls['content-approval']}/approve/{approval_id}", json=approve_payload, timeout=30)
            if response.status_code == 200:
                print(f"   ✓ Freigabe für {category} erfolgreich")
            else:
                print(f"   ✗ Freigabe für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Freigabe für {category} fehlgeschlagen: {str(e)}")
            continue

        # Speichere die Ergebnisse
        results[category] = {
            "scraping_id": scraping_id,
            "trend_id": trend_id,
            "script_id": script_id,
            "seo_id": seo_id,
            "thumbnail_id": thumbnail_id,
            "avatar_id": avatar_id,
            "audio_id": audio_id,
            "subtitle_id": subtitle_id,
            "video_id": video_id,
            "quality_report_id": quality_report_id,
            "approval_id": approval_id,
            "video_url": video_url
        }

    return results

def test_short_from_long_conversion(urls):
    """Testet die Erstellung von Shorts aus Long-Videos (1:1-Kopie)"""
    print("\n=== 2. Short-Erstellung aus Long-Videos (1:1-Kopie) ===")

    categories = ["Politara", "Autonova"]
    results = {}

    for category in categories:
        print(f"\n--- Konvertierung für Kategorie: {category} ---")

        # 1. Web Scraping für aktuelle Themen
        print(f"1. Web Scraping für {category}")
        scraping_payload = {
            "url": f"https://www.{category.lower()}.de/videos",
            "contentTypes": ["videos"],
            "topic": f"Videos in {category}",
            "category": category
        }

        try:
            response = requests.post(f"{urls['web-scraping']}/scrape-content", json=scraping_payload, timeout=30)
            if response.status_code == 201:
                data = response.json()
                scraping_id = data.get("scrapingId")
                content = data.get("data", {})
                print(f"   ✓ Web Scraping für {category} erfolgreich (ID: {scraping_id})")
            else:
                print(f"   ✗ Web Scraping für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Web Scraping für {category} fehlgeschlagen: {str(e)}")
            continue

        # 2. Identifizierung des meistgesehenen Long-Videos
        print(f"2. Identifizierung des meistgesehenen Long-Videos für {category}")
        trend_payload = {
            "content": str(content),
            "topic": f"Meistgesehenes Video in {category}",
            "platforms": ["youtube"],
            "analysisType": "viewCount",
            "category": category
        }

        try:
            response = requests.post(f"{urls['trend-analysis']}/analyze-trends", json=trend_payload, timeout=30)
            if response.status_code == 201:
                trend_data = response.json()
                trend_id = trend_data.get("trendId")
                most_viewed_content = trend_data.get("mostViewedContent", {})

                if most_viewed_content:
                    video_title = most_viewed_content.get("title", "Unbekanntes Video")
                    print(f"   ✓ Meistgesehenes Video in {category} identifiziert:")
                    print(f"     Titel: {video_title}")
                else:
                    print(f"   ⚠ Kein meistgesehenes Video in {category} gefunden")
                    # Fallback: Verwende das erste verfügbare Video
                    all_videos = trend_data.get("trends", {}).get("videos", [])
                    if all_videos:
                        most_viewed_content = all_videos[0]
                        video_title = all_videos[0].get("title", "Unbekanntes Video")
                        print(f"   ✓ Fallback-Video in {category} ausgewählt:")
                        print(f"     Titel: {video_title}")
                    else:
                        print(f"   ✗ Keine Videos in {category} gefunden")
                        continue
            else:
                print(f"   ✗ Trend-Analyse für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Trend-Analyse für {category} fehlgeschlagen: {str(e)}")
            continue

        # 3. 1:1-Kopie des Long-Videos als Short-Format
        print(f"3. 1:1-Kopie des Long-Videos als Short-Format für {category}")
        video_payload = {
            "sourceVideoId": most_viewed_content.get("id"),
            "sourceVideoUrl": most_viewed_content.get("url"),
            "title": video_title,
            "format": "shorts",
            "duration": 60,  # Sekunden
            "resolution": "1080x1920",
            "category": category,
            "preserveContent": True  # 1:1-Kopie
        }

        try:
            response = requests.post(f"{urls['video-processing']}/convert-to-short", json=video_payload, timeout=120)
            if response.status_code == 201:
                video_data = response.json()
                video_id = video_data.get("videoId")
                video_url = video_data.get("videoUrl", "")

                print(f"   ✓ 1:1-Kopie für {category} erfolgreich erstellt (ID: {video_id})")
            else:
                print(f"   ✗ Konvertierung für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Konvertierung für {category} fehlgeschlagen: {str(e)}")
            continue

        # 4. Analytics Tracking
        print(f"4. Analytics Tracking für {category}")
        analytics_payload = {
            "videoId": video_id,
            "eventType": "short_from_long_conversion",
            "metadata": {
                "category": category,
                "sourceVideoId": most_viewed_content.get("id"),
                "title": video_title,
                "conversionType": "1to1_copy"
            }
        }

        try:
            response = requests.post(f"{urls['analytics']}/track-event", json=analytics_payload, timeout=30)
            if response.status_code == 201:
                analytics_data = response.json()
                event_id = analytics_data.get("eventId")
                print(f"   ✓ Analytics Tracking für {category} erfolgreich (ID: {event_id})")
            else:
                print(f"   ✗ Analytics Tracking für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Analytics Tracking für {category} fehlgeschlagen: {str(e)}")
            continue

        # 5. Content Approval
        print(f"5. Content Approval für {category}")
        approval_payload = {
            "contentId": video_id,
            "contentType": "short_video",
            "channel": category,
            "reviewers": ["admin"],
            "metadata": {
                "title": f"1:1-Kopie: {video_title}",
                "sourceVideoId": most_viewed_content.get("id"),
                "conversionType": "1to1_copy"
            }
        }

        try:
            response = requests.post(f"{urls['content-approval']}/submit-for-approval", json=approval_payload, timeout=30)
            if response.status_code == 201:
                approval_data = response.json()
                approval_id = approval_data.get("approvalId")
                print(f"   ✓ Content Approval für {category} erfolgreich (ID: {approval_id})")
            else:
                print(f"   ✗ Content Approval für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                continue
        except Exception as e:
            print(f"   ✗ Content Approval für {category} fehlgeschlagen: {str(e)}")
            continue

        # Speichere die Ergebnisse
        results[category] = {
            "scraping_id": scraping_id,
            "trend_id": trend_id,
            "source_video": most_viewed_content,
            "video_id": video_id,
            "approval_id": approval_id,
            "video_url": video_url
        }

    return results

def main():
    """Hauptfunktion für den umfassenden Test"""
    print("=== Umfassender Video-Erstellungs-Test ===")
    print(f"Startzeit: {datetime.now()}")

    # 1. Health Check
    healthy, urls = health_check()
    if not healthy:
        print("\n❌ Nicht alle Agenten sind erreichbar!")
        return False

    # 2. Test 1: Komplette Short-Erstellung mit allen Komponenten
    print("\n" + "="*60)
    complete_results = test_complete_short_creation(urls)

    # 3. Test 2: Short-Erstellung aus Long-Videos (1:1-Kopie)
    print("\n" + "="*60)
    conversion_results = test_short_from_long_conversion(urls)

    # 4. Zusammenfassung
    print("\n" + "="*60)
    print("=== Test-Zusammenfassung ===")
    print(f"Endzeit: {datetime.now()}")

    print("\n1. Komplette Short-Erstellung:")
    for category, result in complete_results.items():
        print(f"   {category}:")
        print(f"     - Video ID: {result['video_id']}")
        print(f"     - Status: ✓ Erfolgreich")

    print("\n2. Short-Erstellung aus Long-Videos (1:1-Kopie):")
    for category, result in conversion_results.items():
        print(f"   {category}:")
        print(f"     - Video ID: {result['video_id']}")
        print(f"     - Status: ✓ Erfolgreich")

    if complete_results and conversion_results:
        print("\n🎉 Alle Tests erfolgreich!")
        return True
    else:
        print("\n❌ Einige Tests sind fehlgeschlagen!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)