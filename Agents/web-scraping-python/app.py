from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import requests
from bs4 import BeautifulSoup
import re
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data')
SCRAPING_DIR = os.path.join(DATA_DIR, 'scraping')
JOBS_DIR = os.path.join(DATA_DIR, 'jobs')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SCRAPING_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)

# Last execution timestamp
last_execution = None

# Supported platforms
supported_platforms = {
    'youtube': 'YouTube',
    'twitter': 'Twitter',
    'tiktok': 'TikTok',
    'instagram': 'Instagram',
    'political': 'Political Content',
    'AI': 'AI Content'
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Web Scraping Python Agent",
        "version": "1.0.0"
    }), 200

@app.route('/scrape-content', methods=['POST'])
def scrape_content():
    """Scrape content from a webpage"""
    try:
        data = request.get_json()
        url = data.get('url')
        content_types = data.get('contentTypes', ['text', 'images', 'links', 'tables', 'metadata'])

        if not url:
            return jsonify({"error": "URL is required"}), 400

        logger.info(f"Scraping content from: {url}")

        # Perform web scraping (simplified)
        scraping_id = str(uuid.uuid4())
        scraped_data = {
            'id': scraping_id,
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'contentType': 'webpage',
            'content': {
                'title': 'Sample Page Title',
                'text': 'This is sample scraped text content...',
                'images': ['/images/sample1.jpg', '/images/sample2.jpg'],
                'links': ['/link1', '/link2', '/link3'],
                'tables': [],
                'metadata': {
                    'description': 'Sample page description',
                    'keywords': ['sample', 'scraping', 'web'],
                    'author': 'Sample Author'
                }
            }
        }

        # Save scraped data
        save_scraped_data(scraped_data)

        logger.info(f"Content scraping completed: {scraping_id}")
        return jsonify({
            "message": "Content scraping completed successfully",
            "scrapingId": scraping_id,
            "data": scraped_data
        }), 201
    except Exception as e:
        logger.error(f"Error in content scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/extract-data', methods=['POST'])
def extract_data():
    """Extract structured data from a webpage"""
    try:
        data = request.get_json()
        url = data.get('url')
        selectors = data.get('selectors', {})

        if not url:
            return jsonify({"error": "URL is required"}), 400

        logger.info(f"Extracting data from: {url}")

        # Perform data extraction (simplified)
        extraction_id = str(uuid.uuid4())
        extracted_data = {
            'id': extraction_id,
            'url': url,
            'extractionTime': datetime.now().isoformat(),
            'results': {
                'titles': ['Extracted Title 1', 'Extracted Title 2'],
                'prices': ['$19.99', '$29.99', '$39.99'],
                'ratings': ['4.5/5', '4.2/5', '4.8/5']
            }
        }

        # Save extracted data
        save_extracted_data(extracted_data)

        logger.info(f"Data extraction completed: {extraction_id}")
        return jsonify({
            "message": "Data extraction completed successfully",
            "extractionId": extraction_id,
            "data": extracted_data
        }), 201
    except Exception as e:
        logger.error(f"Error in data extraction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/monitor-changes', methods=['POST'])
def monitor_changes():
    """Monitor a website for changes"""
    try:
        data = request.get_json()
        url = data.get('url')

        if not url:
            return jsonify({"error": "URL is required"}), 400

        logger.info(f"Monitoring changes for: {url}")

        # Perform website monitoring (simplified)
        monitoring_id = str(uuid.uuid4())
        monitoring_result = {
            'id': monitoring_id,
            'url': url,
            'lastChecked': datetime.now().isoformat(),
            'changesDetected': True,
            'changeSummary': {
                'newLinks': 3,
                'removedLinks': 1,
                'contentUpdates': 5
            }
        }

        # Save monitoring result
        save_monitoring_result(monitoring_result)

        logger.info(f"Website monitoring completed: {monitoring_id}")
        return jsonify({
            "message": "Website monitoring completed successfully",
            "monitoringId": monitoring_id,
            "result": monitoring_result
        }), 201
    except Exception as e:
        logger.error(f"Error in website monitoring: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Platform-specific scraping endpoints
@app.route('/scrape-youtube', methods=['POST'])
def scrape_youtube():
    """Scrape YouTube content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-youtube",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting YouTube scraping for keywords: {', '.join(keywords)}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Fetching search results..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting video information..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(3):  # Generate 3 mock videos
            video = {
                "id": str(uuid.uuid4()),
                "title": f"Sample YouTube Video {i+1} about {keywords[0] if keywords else 'Topic'}",
                "description": f"This is a sample YouTube video description about {keywords[0] if keywords else 'various topics'}.",
                "url": f"https://youtube.com/watch?v={uuid.uuid4()}",
                "thumbnail": f"/thumbnails/youtube_{i+1}.jpg",
                "duration": f"00:0{i%5+1}:00",
                "views": (i+1) * 10000,
                "likes": (i+1) * 1000,
                "channel": f"Sample Channel {i+1}",
                "publishedAt": datetime.now().isoformat(),
                "tags": keywords
            }
            results.append(video)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"YouTube scraping completed. Found {len(results)} videos."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-youtube",
            "jobId": job_id,
            "keywords": keywords,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"YouTube scraping completed: {job_id}")
        return jsonify({
            "message": "YouTube scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in YouTube scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/scrape-twitter', methods=['POST'])
def scrape_twitter():
    """Scrape Twitter content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-twitter",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting Twitter scraping for keywords: {', '.join(keywords)}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Fetching tweets..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting tweet information..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(5):  # Generate 5 mock tweets
            tweet = {
                "id": str(uuid.uuid4()),
                "text": f"This is a sample tweet about {keywords[0] if keywords else 'various topics'}. #{''.join(keywords)[:10] if keywords else 'sample'} #{'topic'+str(i+1)}",
                "url": f"https://twitter.com/user/status/{uuid.uuid4()}",
                "author": f"SampleUser{i+1}",
                "timestamp": datetime.now().isoformat(),
                "retweets": (i+1) * 50,
                "likes": (i+1) * 100,
                "replies": (i+1) * 25,
                "hashtags": [f"#{''.join(keywords)[:10] if keywords else 'sample'}", f"#topic{i+1}"],
                "mentions": [f"@mentionedUser{i+1}"]
            }
            results.append(tweet)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Twitter scraping completed. Found {len(results)} tweets."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-twitter",
            "jobId": job_id,
            "keywords": keywords,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Twitter scraping completed: {job_id}")
        return jsonify({
            "message": "Twitter scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in Twitter scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/scrape-tiktok', methods=['POST'])
def scrape_tiktok():
    """Scrape TikTok content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-tiktok",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting TikTok scraping for keywords: {', '.join(keywords)}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Fetching TikTok videos..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting video information..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(4):  # Generate 4 mock TikTok videos
            video = {
                "id": str(uuid.uuid4()),
                "description": f"Check out this cool TikTok about {keywords[0] if keywords else 'various topics'}! #{''.join(keywords)[:10] if keywords else 'sample'} #{'tiktok'+str(i+1)}",
                "url": f"https://tiktok.com/@user/video/{uuid.uuid4()}",
                "author": f"@SampleUser{i+1}",
                "timestamp": datetime.now().isoformat(),
                "views": (i+1) * 100000,
                "likes": (i+1) * 10000,
                "comments": (i+1) * 500,
                "shares": (i+1) * 1000,
                "hashtags": [f"#{''.join(keywords)[:10] if keywords else 'sample'}", f"#tiktok{i+1}"],
                "music": f"Original Sound {i+1}",
                "duration": f"00:00:1{i%5}"
            }
            results.append(video)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"TikTok scraping completed. Found {len(results)} videos."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-tiktok",
            "jobId": job_id,
            "keywords": keywords,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"TikTok scraping completed: {job_id}")
        return jsonify({
            "message": "TikTok scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in TikTok scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/scrape-instagram', methods=['POST'])
def scrape_instagram():
    """Scrape Instagram content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-instagram",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting Instagram scraping for keywords: {', '.join(keywords)}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Fetching Instagram posts..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting post information..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(3):  # Generate 3 mock Instagram posts
            post = {
                "id": str(uuid.uuid4()),
                "caption": f"Check out this amazing post about {keywords[0] if keywords else 'various topics'}! #{''.join(keywords)[:10] if keywords else 'sample'} #{'insta'+str(i+1)}",
                "url": f"https://instagram.com/p/{uuid.uuid4()}",
                "author": f"@SampleUser{i+1}",
                "timestamp": datetime.now().isoformat(),
                "likes": (i+1) * 1000,
                "comments": (i+1) * 50,
                "hashtags": [f"#{''.join(keywords)[:10] if keywords else 'sample'}", f"#insta{i+1}"],
                "mentions": [f"@mentionedUser{i+1}"],
                "mediaType": "image" if i % 2 == 0 else "video",
                "views": (i+1) * 5000 if i % 2 == 1 else None
            }
            results.append(post)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Instagram scraping completed. Found {len(results)} posts."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-instagram",
            "jobId": job_id,
            "keywords": keywords,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Instagram scraping completed: {job_id}")
        return jsonify({
            "message": "Instagram scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in Instagram scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/scrape-political-content', methods=['POST'])
def scrape_political_content():
    """Scrape political content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-political-content",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting political content scraping for keywords: {', '.join(keywords)}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Fetching political articles and news..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting article information..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(3):  # Generate 3 mock political articles
            article = {
                "id": str(uuid.uuid4()),
                "title": f"Political Analysis: {keywords[0] if keywords else 'Current Events'} in {datetime.now().year}",
                "summary": f"This is a sample political analysis about {keywords[0] if keywords else 'current events'}. It discusses various aspects of policy and governance.",
                "url": f"https://news.example.com/politics/article/{uuid.uuid4()}",
                "source": f"Sample News Source {i+1}",
                "timestamp": datetime.now().isoformat(),
                "author": f"Political Analyst {i+1}",
                "keywords": keywords,
                "sentiment": "neutral" if i == 1 else ("positive" if i == 0 else "negative"),
                "biasScore": 0.3 + (i * 0.2)
            }
            results.append(article)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Political content scraping completed. Found {len(results)} articles."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-political-content",
            "jobId": job_id,
            "keywords": keywords,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Political content scraping completed: {job_id}")
        return jsonify({
            "message": "Political content scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in political content scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/scrape-business-content', methods=['POST'])
def scrape_business_content():
    """Scrape business content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-business-content",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting business content scraping for keywords: {', '.join(keywords)}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Fetching business articles and news..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting article information..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(4):  # Generate 4 mock business articles
            article = {
                "id": str(uuid.uuid4()),
                "title": f"Business Insights: {keywords[0] if keywords else 'Market Trends'} in {datetime.now().year}",
                "summary": f"This is a sample business analysis about {keywords[0] if keywords else 'market trends'}. It discusses various aspects of commerce and industry.",
                "url": f"https://business.example.com/article/{uuid.uuid4()}",
                "source": f"Sample Business Source {i+1}",
                "timestamp": datetime.now().isoformat(),
                "author": f"Business Analyst {i+1}",
                "keywords": keywords,
                "sentiment": "positive" if i % 2 == 0 else "neutral",
                "relevanceScore": 0.7 + (i * 0.05)
            }
            results.append(article)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Business content scraping completed. Found {len(results)} articles."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-business-content",
            "jobId": job_id,
            "keywords": keywords,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Business content scraping completed: {job_id}")
        return jsonify({
            "message": "Business content scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in business content scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/scrape-keywords', methods=['POST'])
def scrape_keywords():
    """Scrape content for specific keywords"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        keywords = data.get('keywords', [])
        sources = data.get('sources', [])
        options = data.get('options', {})

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "scrape-keywords",
            "status": "processing",
            "progress": 0,
            "keywords": keywords,
            "sources": sources,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate scraping process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting keyword scraping for: {', '.join(keywords)} from {len(sources)} sources"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Searching for keywords across sources..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Extracting relevant content..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for keyword in keywords[:3]:  # Limit to first 3 keywords for demo
            for i in range(2):  # 2 results per keyword
                result = {
                    "id": str(uuid.uuid4()),
                    "keyword": keyword,
                    "content": f"This is sample content containing the keyword '{keyword}'. It's relevant to the topic being researched.",
                    "url": f"https://example.com/content/{uuid.uuid4()}",
                    "source": sources[i] if i < len(sources) else f"Sample Source {i+1}",
                    "timestamp": datetime.now().isoformat(),
                    "relevanceScore": 0.8 - (i * 0.1)
                }
                results.append(result)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Keyword scraping completed. Found {len(results)} relevant pieces of content."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "scrape-keywords",
            "jobId": job_id,
            "keywords": keywords,
            "sources": sources,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Keyword scraping completed: {job_id}")
        return jsonify({
            "message": "Keyword scraping completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in keyword scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/search-web', methods=['POST'])
def search_web():
    """Search the web for content"""
    try:
        global last_execution
        last_execution = datetime.now().isoformat()

        data = request.get_json()
        query = data.get('query')
        options = data.get('options', {})

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Create job
        job_id = str(uuid.uuid4())
        job = {
            "id": job_id,
            "type": "search-web",
            "status": "processing",
            "progress": 0,
            "query": query,
            "options": options,
            "startedAt": datetime.now().isoformat(),
            "logs": []
        }

        # Save job
        save_job(job)

        # Simulate search process
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Starting web search for: {query}"
        })

        # Update progress
        job['progress'] = 25
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Executing search query..."
        })

        # Update progress
        job['progress'] = 50
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Processing search results..."
        })

        # Update progress
        job['progress'] = 75
        save_job(job)
        time.sleep(0.5)  # Simulate processing time

        # Generate mock results
        results = []
        for i in range(5):  # Generate 5 mock search results
            result = {
                "id": str(uuid.uuid4()),
                "title": f"Search Result {i+1} for '{query}'",
                "snippet": f"This is a sample search result snippet for the query '{query}'. It contains relevant information about the topic.",
                "url": f"https://example.com/search-result/{uuid.uuid4()}",
                "source": f"Sample Search Engine {i+1}",
                "timestamp": datetime.now().isoformat(),
                "relevanceScore": 1.0 - (i * 0.1)
            }
            results.append(result)

        # Complete job
        job['status'] = 'completed'
        job['progress'] = 100
        job['results'] = results
        job['completedAt'] = datetime.now().isoformat()
        job['logs'].append({
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": f"Web search completed. Found {len(results)} results."
        })

        # Save job and results
        save_job(job)
        save_scraping_result({
            "id": str(uuid.uuid4()),
            "type": "search-web",
            "jobId": job_id,
            "query": query,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Web search completed: {job_id}")
        return jsonify({
            "message": "Web search completed successfully",
            "jobId": job_id,
            "results": results
        }), 201

    except Exception as e:
        logger.error(f"Error in web search: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-scraping-result/<result_id>', methods=['GET'])
def get_scraping_result(result_id):
    """Get scraping result by ID"""
    try:
        result = load_scraping_result(result_id)
        if not result:
            return jsonify({"error": "Scraping result not found"}), 404

        logger.info(f"Scraping result retrieved: {result_id}")
        return jsonify({
            "message": "Scraping result retrieved successfully",
            "result": result
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving scraping result: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-scraping-results', methods=['GET'])
def list_scraping_results():
    """List all scraping results"""
    try:
        results = load_all_scraping_results()

        logger.info(f"Retrieved {len(results)} scraping results")
        return jsonify({
            "message": "Scraping results retrieved successfully",
            "results": results
        }), 200
    except Exception as e:
        logger.error(f"Error listing scraping results: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-scraping-result/<result_id>', methods=['DELETE'])
def delete_scraping_result(result_id):
    """Delete scraping result by ID"""
    try:
        success = remove_scraping_result(result_id)
        if not success:
            return jsonify({"error": "Scraping result not found"}), 404

        logger.info(f"Scraping result deleted: {result_id}")
        return jsonify({
            "message": "Scraping result deleted successfully"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting scraping result: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-job-status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status by ID"""
    try:
        job = load_job(job_id)
        if not job:
            return jsonify({"error": "Job not found"}), 404

        logger.info(f"Job status retrieved: {job_id}")
        return jsonify({
            "message": "Job status retrieved successfully",
            "job": job
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving job status: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-scraped-data/<scraping_id>', methods=['GET'])
def get_scraped_data(scraping_id):
    """Get scraped data by ID"""
    try:
        scraped_data = load_scraped_data(scraping_id)
        if not scraped_data:
            return jsonify({"error": "Scraped data not found"}), 404

        logger.info(f"Scraped data retrieved: {scraping_id}")
        return jsonify({
            "message": "Scraped data retrieved successfully",
            "data": scraped_data
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving scraped data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-scraped-data', methods=['GET'])
def list_scraped_data():
    """List all scraped data"""
    try:
        scraped_data_list = load_all_scraped_data()

        logger.info(f"Retrieved {len(scraped_data_list)} scraped data entries")
        return jsonify({
            "message": "Scraped data retrieved successfully",
            "data": scraped_data_list
        }), 200
    except Exception as e:
        logger.error(f"Error listing scraped data: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_scraped_data(scraped_data):
    """Save scraped data to file"""
    try:
        file_path = os.path.join(SCRAPING_DIR, f"{scraped_data['id']}_scraped.json")
        with open(file_path, 'w') as f:
            json.dump(scraped_data, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving scraped data: {str(e)}")
        raise

def save_extracted_data(extracted_data):
    """Save extracted data to file"""
    try:
        file_path = os.path.join(SCRAPING_DIR, f"{extracted_data['id']}_extracted.json")
        with open(file_path, 'w') as f:
            json.dump(extracted_data, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving extracted data: {str(e)}")
        raise

def save_monitoring_result(monitoring_result):
    """Save monitoring result to file"""
    try:
        file_path = os.path.join(SCRAPING_DIR, f"{monitoring_result['id']}_monitoring.json")
        with open(file_path, 'w') as f:
            json.dump(monitoring_result, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving monitoring result: {str(e)}")
        raise

def load_scraped_data(scraping_id):
    """Load scraped data from file"""
    try:
        file_path = os.path.join(SCRAPING_DIR, f"{scraping_id}_scraped.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading scraped data: {str(e)}")
        return None

def load_all_scraped_data():
    """Load all scraped data from file"""
    scraped_data_list = []
    try:
        for filename in os.listdir(SCRAPING_DIR):
            if filename.endswith('_scraped.json'):
                file_path = os.path.join(SCRAPING_DIR, filename)
                with open(file_path, 'r') as f:
                    scraped_data_list.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading scraped data: {str(e)}")
    return scraped_data_list

def save_job(job):
    """Save job record"""
    try:
        job_path = os.path.join(JOBS_DIR, f"{job['id']}.json")
        with open(job_path, 'w') as f:
            json.dump(job, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving job: {str(e)}")
        raise

def load_job(job_id):
    """Load job record"""
    try:
        job_path = os.path.join(JOBS_DIR, f"{job_id}.json")
        if not os.path.exists(job_path):
            return None
        with open(job_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading job: {str(e)}")
        return None

def save_scraping_result(result):
    """Save scraping result"""
    try:
        result_path = os.path.join(SCRAPING_DIR, f"{result['id']}_result.json")
        with open(result_path, 'w') as f:
            json.dump(result, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving scraping result: {str(e)}")
        raise

def load_scraping_result(result_id):
    """Load scraping result"""
    try:
        # Look for result file
        for filename in os.listdir(SCRAPING_DIR):
            if filename.endswith('_result.json') and result_id in filename:
                file_path = os.path.join(SCRAPING_DIR, filename)
                with open(file_path, 'r') as f:
                    return json.load(f)
        return None
    except Exception as e:
        logger.error(f"Error loading scraping result: {str(e)}")
        return None

def load_all_scraping_results():
    """Load all scraping results"""
    results = []
    try:
        for filename in os.listdir(SCRAPING_DIR):
            if filename.endswith('_result.json'):
                file_path = os.path.join(SCRAPING_DIR, filename)
                with open(file_path, 'r') as f:
                    result = json.load(f)
                    results.append({
                        'id': result.get('id'),
                        'type': result.get('type'),
                        'timestamp': result.get('timestamp')
                    })
    except Exception as e:
        logger.error(f"Error loading scraping results: {str(e)}")
    return results

def remove_scraping_result(result_id):
    """Remove scraping result"""
    try:
        # Look for result file
        for filename in os.listdir(SCRAPING_DIR):
            if filename.endswith('_result.json') and result_id in filename:
                file_path = os.path.join(SCRAPING_DIR, filename)
                os.remove(file_path)
                return True
        return False
    except Exception as e:
        logger.error(f"Error removing scraping result: {str(e)}")
        return False

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)