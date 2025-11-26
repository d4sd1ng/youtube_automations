#!/usr/bin/env python3
"""
Test des vollständigen Workflows vom Scraping bis zur Erstellung von Shorts
für beide Kanäle (Politara und Autonova)
"""

import requests
import json
import time
import os
from datetime import datetime

def test_complete_workflow():
    """Testet den vollständigen Workflow für beide Kanäle"""
    print("=== Vollständiger Workflow Test ===")
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
        'approval': BASE_PORT + 10,
        'content-planning': BASE_PORT + 11,
        'analytics': BASE_PORT + 12
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
        "url": "https://www.tagesschau.de/thema/kuenstliche-intelligenz",
        "contentTypes": ["articles", "videos"],
        "topic": "Künstliche Intelligenz in der Politik"
    }

    try:
        response = requests.post(f"{urls['web-scraping']}/scrape-content", json=scraping_payload, timeout=30)
        if response.status_code == 201:
            scraping_data = response.json()
            scraping_id = scraping_data.get("scrapingId")
            content = scraping_data.get("data", {})
            print(f"   ✓ Web Scraping erfolgreich (ID: {scraping_id})")
        else:
            print(f"   ✗ Web Scraping fehlgeschlagen (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Web Scraping fehlgeschlagen: {str(e)}")
        return False

    # 3. Trend Analysis
    print("\n3. Trend Analysis")
    trend_payload = {
        "content": str(content),
        "topic": "Künstliche Intelligenz in der Politik",
        "platforms": ["Politara", "Autonova"]
    }

    try:
        response = requests.post(f"{urls['trend-analysis']}/analyze-trends", json=trend_payload, timeout=30)
        if response.status_code == 201:
            trend_data = response.json()
            trend_id = trend_data.get("trendId")
            trends = trend_data.get("trends", {})
            print(f"   ✓ Trend Analysis erfolgreich (ID: {trend_id})")
        else:
            print(f"   ✗ Trend Analysis fehlgeschlagen (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Trend Analysis fehlgeschlagen: {str(e)}")
        return False

    # 4. Script Generation
    print("\n4. Script Generation")
    script_payload = {
        "topic": "Künstliche Intelligenz in der Politik",
        "content": str(content),
        "tone": "informative",
        "targetAudience": "general public",
        "platform": "youtube_shorts"
    }

    try:
        response = requests.post(f"{urls['script-generation']}/generate-script", json=script_payload, timeout=30)
        if response.status_code == 201:
            script_data = response.json()
            script_id = script_data.get("scriptId")
            script = script_data.get("script", "")
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
        "title": "KI in der Politik: Was steckt hinter den Algorithmen?",
        "description": "Wie beeinflusst Künstliche Intelligenz politische Entscheidungen? Ein Blick hinter die Kulissen.",
        "tags": ["KI", "Politik", "Algorithmus", "Demokratie", "Technologie"],
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
        "script": script,
        "platform": "youtube_shorts",
        "style": "modern",
        "textOverlay": "KI in der Politik"
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

    # 7. Video Processing (Umwandlung in Short-Format)
    print("\n7. Video Processing (Umwandlung in Short-Format)")
    video_payload = {
        "scriptId": script_id,
        "thumbnailId": thumbnail_id,
        "format": "shorts",
        "duration": 60,  # Sekunden
        "platforms": ["Politara", "Autonova"]
    }

    try:
        response = requests.post(f"{urls['video-processing']}/process-video", json=video_payload, timeout=60)
        if response.status_code == 201:
            video_data = response.json()
            video_id = video_data.get("videoId")
            video_urls = video_data.get("videoUrls", {})
            print(f"   ✓ Video Processing erfolgreich (ID: {video_id})")
        else:
            print(f"   ✗ Video Processing fehlgeschlagen (Status {response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Video Processing fehlgeschlagen: {str(e)}")
        return False

    # 8. Content Approval für beide Kanäle
    print("\n8. Content Approval für beide Kanäle")
    for channel in ["Politara", "Autonova"]:
        approval_payload = {
            "contentId": video_id,
            "contentType": "short_video",
            "channel": channel,
            "reviewers": ["admin"]
        }

        try:
            response = requests.post(f"{urls['content-approval']}/submit-for-approval", json=approval_payload, timeout=30)
            if response.status_code == 201:
                approval_data = response.json()
                approval_id = approval_data.get("approvalId")
                print(f"   ✓ Content Approval für {channel} erfolgreich (ID: {approval_id})")
            else:
                print(f"   ✗ Content Approval für {channel} fehlgeschlagen (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"   ✗ Content Approval für {channel} fehlgeschlagen: {str(e)}")
            return False

    print(f"\n=== Test erfolgreich abgeschlossen ===")
    print(f"Endzeit: {datetime.now()}")
    print(f"Erstellte Inhalte:")
    print(f"  - Scraping ID: {scraping_id}")
    print(f"  - Trend ID: {trend_id}")
    print(f"  - Script ID: {script_id}")
    print(f"  - SEO ID: {seo_id}")
    print(f"  - Thumbnail ID: {thumbnail_id}")
    print(f"  - Video ID: {video_id}")
    print(f"  - Video URLs: {video_urls}")

    return True

if __name__ == "__main__":
    success = test_complete_workflow()
    if success:
        print("\n🎉 Alle Tests erfolgreich!")
        exit(0)
    else:
        print("\n❌ Test fehlgeschlagen!")
        exit(1)