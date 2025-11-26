#!/usr/bin/env python3
"""
Vollständiger Test der Short-Erstellung:
Vom Scraping über alle benötigten Komponenten (Thumbnails, Untertitel, Avatar)
bis zum fertigen Short mit allen Prüfungen, Qualitätschecks und Freigaben
"""

import requests
import json
import time
import os
from datetime import datetime

def test_complete_short_creation():
    """Testet die vollständige Short-Erstellung für beide Kanäle"""
    print("=== Vollständiger Short-Erstellungs-Test ===")
    print(f"Startzeit: {datetime.now()}")

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

    # 1. Health Check aller Agenten
    print("\n1. Health Check aller Agenten")
    for agent, url in urls.items():
        try:
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"   ✓ {agent}: Healthy")
            else:
                print(f"   ✗ {agent}: Unhealthy (Status {response.status_code})")
        except Exception as e:
            print(f"   ✗ {agent}: Unreachable ({str(e)})")

    # 2. Web Scraping für aktuelle Themen
    print("\n2. Web Scraping für aktuelle Themen")
    scraping_payload = {
        "url": "https://www.tagesschau.de/newsticker",
        "contentTypes": ["headlines", "articles"],
        "topic": "Aktuelle politische Themen"
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
            return False
    except Exception as e:
        print(f"   ✗ Web Scraping fehlgeschlagen: {str(e)}")
        return False

    # 3. Themenauswahl (Identifizierung des meistgesehenen Inhalts)
    print("\n3. Themenauswahl (Identifizierung des meistgesehenen Inhalts)")
    trend_payload = {
        "content": str(scraped_content),
        "topic": "Aktuelle politische Themen",
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
            return False
    except Exception as e:
        print(f"   ✗ Themenauswahl fehlgeschlagen: {str(e)}")
        return False

    # 4. Script Generation
    print("\n4. Script Generation")
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
            return False
    except Exception as e:
        print(f"   ✗ Script Generation fehlgeschlagen: {str(e)}")
        return False

    # 5. SEO Optimization
    print("\n5. SEO Optimization")
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
            return False
    except Exception as e:
        print(f"   ✗ SEO Optimization fehlgeschlagen: {str(e)}")
        return False

    # 6. Thumbnail Generation
    print("\n6. Thumbnail Generation")
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
            return False
    except Exception as e:
        print(f"   ✗ Thumbnail Generation fehlgeschlagen: {str(e)}")
        return False

    # 7. Avatar Generation
    print("\n7. Avatar Generation")
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
            return False
    except Exception as e:
        print(f"   ✗ Avatar Generation fehlgeschlagen: {str(e)}")
        return False

    # 8. Audio Processing (Text-to-Speech)
    print("\n8. Audio Processing (Text-to-Speech)")
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
            return False
    except Exception as e:
        print(f"   ✗ Audio Processing fehlgeschlagen: {str(e)}")
        return False

    # 9. Untertitel Generation (Translation für Untertitel)
    print("\n9. Untertitel Generation")
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
            return False
    except Exception as e:
        print(f"   ✗ Untertitel Generation fehlgeschlagen: {str(e)}")
        return False

    # 10. Video Processing (Kombination aller Elemente)
    print("\n10. Video Processing (Kombination aller Elemente)")
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
            return False
    except Exception as e:
        print(f"   ✗ Video Processing fehlgeschlagen: {str(e)}")
        return False

    # 11. Automatische Qualitätsprüfung
    print("\n11. Automatische Qualitätsprüfung")
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
            return False
    except Exception as e:
        print(f"   ✗ Automatische Qualitätsprüfung fehlgeschlagen: {str(e)}")
        return False

    # 12. Analytics Tracking
    print("\n12. Analytics Tracking")
    analytics_payload = {
        "videoId": video_id,
        "eventType": "creation_completed",
        "metadata": {
            "topic": selected_topic,
            "duration": 60,
            "platform": "youtube_shorts"
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
            return False
    except Exception as e:
        print(f"   ✗ Analytics Tracking fehlgeschlagen: {str(e)}")
        return False

    # 13. Content Approval für beide Kanäle
    print("\n13. Content Approval für beide Kanäle")
    channels = ["Politara", "Autonova"]
    approval_ids = []

    for channel in channels:
        approval_payload = {
            "contentId": video_id,
            "contentType": "short_video",
            "channel": channel,
            "reviewers": ["admin"],
            "qualityReportId": quality_report_id,
            "metadata": optimized_metadata
        }

        try:
            response = requests.post(f"{urls['content-approval']}/submit-for-approval", json=approval_payload, timeout=30)
            if response.status_code == 201:
                approval_data = response.json()
                approval_id = approval_data.get("approvalId")
                approval_ids.append(approval_id)
                print(f"   ✓ Content Approval für {channel} erfolgreich (ID: {approval_id})")
            else:
                print(f"   ✗ Content Approval für {channel} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Content Approval für {channel} fehlgeschlagen: {str(e)}")
            return False

    # 14. Freigabe der Inhalte
    print("\n14. Freigabe der Inhalte")
    for i, approval_id in enumerate(approval_ids):
        channel = channels[i]
        approve_payload = {
            "approver": "admin",
            "comments": "Inhalt entspricht den Qualitätsstandards"
        }

        try:
            response = requests.post(f"{urls['content-approval']}/approve/{approval_id}", json=approve_payload, timeout=30)
            if response.status_code == 200:
                print(f"   ✓ Freigabe für {channel} erfolgreich")
            else:
                print(f"   ✗ Freigabe für {channel} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Freigabe für {channel} fehlgeschlagen: {str(e)}")
            return False

    print(f"\n=== Test erfolgreich abgeschlossen ===")
    print(f"Endzeit: {datetime.now()}")
    print(f"Erstellte Inhalte:")
    print(f"  - Scraping ID: {scraping_id}")
    print(f"  - Trend ID: {trend_id}")
    print(f"  - Script ID: {script_id}")
    print(f"  - SEO ID: {seo_id}")
    print(f"  - Thumbnail ID: {thumbnail_id}")
    print(f"  - Avatar ID: {avatar_id}")
    print(f"  - Audio ID: {audio_id}")
    print(f"  - Untertitel ID: {subtitle_id}")
    print(f"  - Video ID: {video_id}")
    print(f"  - Quality Report ID: {quality_report_id}")
    print(f"  - Approval IDs: {approval_ids}")
    print(f"  - Video URL: {video_url}")

    return True

if __name__ == "__main__":
    success = test_complete_short_creation()
    if success:
        print("\n🎉 Alle Tests erfolgreich!")
        exit(0)
    else:
        print("\n❌ Test fehlgeschlagen!")
        exit(1)