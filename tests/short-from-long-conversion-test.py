#!/usr/bin/env python3
"""
Test für die Erstellung von Shorts aus Long-Videos:
1. Scraping nach aktuellen Themen
2. Identifizierung des meistgesehenen Long-Videos je Kategorie
3. 1:1-Kopie als Short-Format
"""

import requests
import json
import time
import os
from datetime import datetime

def test_short_from_long_conversion():
    """Testet die Erstellung von Shorts aus Long-Videos für beide Kanäle"""
    print("=== Short aus Long-Video Konvertierungstest ===")
    print(f"Startzeit: {datetime.now()}")

    # Basis-URLs der Python-Agenten
    BASE_PORT = 5000
    agents = {
        'web-scraping': BASE_PORT,
        'trend-analysis': BASE_PORT + 1,
        'video-processing': BASE_PORT + 5,
        'content-approval': BASE_PORT + 9,
        'analytics': BASE_PORT + 11
    }

    urls = {agent: f"http://localhost:{port}" for agent, port in agents.items()}

    # 1. Health Check der benötigten Agenten
    print("\n1. Health Check der benötigten Agenten")
    required_agents = ['web-scraping', 'trend-analysis', 'video-processing', 'content-approval', 'analytics']
    for agent in required_agents:
        try:
            response = requests.get(f"{urls[agent]}/health", timeout=5)
            if response.status_code == 200:
                print(f"   ✓ {agent}: Healthy")
            else:
                print(f"   ✗ {agent}: Unhealthy (Status {response.status_code})")
        except Exception as e:
            print(f"   ✗ {agent}: Unreachable ({str(e)})")

    # 2. Web Scraping für aktuelle Themen in beiden Kategorien
    print("\n2. Web Scraping für aktuelle Themen")
    categories = ["Politara", "Autonova"]
    scraped_data = {}

    for category in categories:
        print(f"\n   Scraping für Kategorie: {category}")
        scraping_payload = {
            "url": f"https://www.{category.lower()}.de/newsticker",
            "contentTypes": ["videos", "articles"],
            "topic": f"Aktuelle Themen in {category}",
            "category": category
        }

        try:
            response = requests.post(f"{urls['web-scraping']}/scrape-content", json=scraping_payload, timeout=30)
            if response.status_code == 201:
                data = response.json()
                scraping_id = data.get("scrapingId")
                content = data.get("data", {})
                scraped_data[category] = {
                    "scrapingId": scraping_id,
                    "content": content
                }
                print(f"   ✓ Web Scraping für {category} erfolgreich (ID: {scraping_id})")
            else:
                print(f"   ✗ Web Scraping für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Web Scraping für {category} fehlgeschlagen: {str(e)}")
            return False

    # 3. Identifizierung des meistgesehenen Long-Videos je Kategorie
    print("\n3. Identifizierung des meistgesehenen Long-Videos je Kategorie")
    most_viewed_videos = {}

    for category in categories:
        print(f"\n   Analyse für Kategorie: {category}")
        trend_payload = {
            "content": str(scraped_data[category]["content"]),
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
                    most_viewed_videos[category] = {
                        "trendId": trend_id,
                        "video": most_viewed_content,
                        "title": most_viewed_content.get("title", "Unbekanntes Video")
                    }
                    print(f"   ✓ Meistgesehenes Video in {category} identifiziert:")
                    print(f"     Titel: {most_viewed_videos[category]['title']}")
                else:
                    print(f"   ⚠ Kein meistgesehenes Video in {category} gefunden")
                    # Fallback: Verwende das erste verfügbare Video
                    all_videos = trend_data.get("trends", {}).get("videos", [])
                    if all_videos:
                        most_viewed_videos[category] = {
                            "trendId": trend_id,
                            "video": all_videos[0],
                            "title": all_videos[0].get("title", "Unbekanntes Video")
                        }
                        print(f"   ✓ Fallback-Video in {category} ausgewählt:")
                        print(f"     Titel: {most_viewed_videos[category]['title']}")
                    else:
                        print(f"   ✗ Keine Videos in {category} gefunden")
                        return False
            else:
                print(f"   ✗ Trend-Analyse für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Trend-Analyse für {category} fehlgeschlagen: {str(e)}")
            return False

    # 4. 1:1-Kopie des Long-Videos als Short-Format
    print("\n4. 1:1-Kopie des Long-Videos als Short-Format")
    short_videos = {}

    for category in categories:
        print(f"\n   Konvertierung für Kategorie: {category}")
        video_payload = {
            "sourceVideoId": most_viewed_videos[category]["video"].get("id"),
            "sourceVideoUrl": most_viewed_videos[category]["video"].get("url"),
            "title": most_viewed_videos[category]["title"],
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

                short_videos[category] = {
                    "videoId": video_id,
                    "videoUrl": video_url,
                    "sourceVideo": most_viewed_videos[category]
                }
                print(f"   ✓ 1:1-Kopie für {category} erfolgreich erstellt (ID: {video_id})")
            else:
                print(f"   ✗ Konvertierung für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Konvertierung für {category} fehlgeschlagen: {str(e)}")
            return False

    # 5. Analytics Tracking
    print("\n5. Analytics Tracking")
    for category in categories:
        analytics_payload = {
            "videoId": short_videos[category]["videoId"],
            "eventType": "short_from_long_conversion",
            "metadata": {
                "category": category,
                "sourceVideoId": short_videos[category]["sourceVideo"]["video"].get("id"),
                "title": short_videos[category]["sourceVideo"]["title"],
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
        except Exception as e:
            print(f"   ✗ Analytics Tracking für {category} fehlgeschlagen: {str(e)}")

    # 6. Content Approval für beide Kanäle
    print("\n6. Content Approval für beide Kanäle")
    approval_ids = []

    for category in categories:
        approval_payload = {
            "contentId": short_videos[category]["videoId"],
            "contentType": "short_video",
            "channel": category,
            "reviewers": ["admin"],
            "metadata": {
                "title": f"1:1-Kopie: {short_videos[category]['sourceVideo']['title']}",
                "sourceVideoId": short_videos[category]["sourceVideo"]["video"].get("id"),
                "conversionType": "1to1_copy"
            }
        }

        try:
            response = requests.post(f"{urls['content-approval']}/submit-for-approval", json=approval_payload, timeout=30)
            if response.status_code == 201:
                approval_data = response.json()
                approval_id = approval_data.get("approvalId")
                approval_ids.append(approval_id)
                print(f"   ✓ Content Approval für {category} erfolgreich (ID: {approval_id})")
            else:
                print(f"   ✗ Content Approval für {category} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Content Approval für {category} fehlgeschlagen: {str(e)}")
            return False

    print(f"\n=== Test erfolgreich abgeschlossen ===")
    print(f"Endzeit: {datetime.now()}")
    print(f"Ergebnisse:")

    for category in categories:
        print(f"\n  {category}:")
        print(f"    - Scraping ID: {scraped_data[category]['scrapingId']}")
        print(f"    - Trend ID: {most_viewed_videos[category]['trendId']}")
        print(f"    - Source Video: {most_viewed_videos[category]['title']}")
        print(f"    - Short Video ID: {short_videos[category]['videoId']}")
        print(f"    - Short Video URL: {short_videos[category]['videoUrl']}")

    print(f"\n  Allgemein:")
    print(f"    - Approval IDs: {approval_ids}")

    return True

if __name__ == "__main__":
    success = test_short_from_long_conversion()
    if success:
        print("\n🎉 Alle Tests erfolgreich!")
        exit(0)
    else:
        print("\n❌ Test fehlgeschlagen!")
        exit(1)