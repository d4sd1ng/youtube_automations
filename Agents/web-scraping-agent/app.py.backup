from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import requests
from bs4 import BeautifulSoup
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
SCRAPING_DIR = os.path.join(DATA_DIR, 'scraping')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SCRAPING_DIR, exist_ok=True)

# Supported content types
SUPPORTED_CONTENT_TYPES = ['text', 'images', 'links', 'tables', 'metadata']

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Web Scraping Python Agent"}), 200

@app.route('/scrape-content', methods=['POST'])
def scrape_content():
    """Scrape content from a webpage"""
    try:
        data = request.get_json()
        url = data.get('url')
        content_types = data.get('contentTypes', SUPPORTED_CONTENT_TYPES)

        if not url:
            return jsonify({"error": "URL is required"}), 400

        logger.info(f"Scraping content from: {url}")

        # Perform web scraping (simplified)
        scraping_id = str(uuid.uuid4())
        scraped_data = {
            'id': scraping_id,
            'url': url,
            'title': 'Sample Webpage Title',
            'headings': ['Heading 1', 'Heading 2', 'Heading 3'],
            'paragraphs': [
                'This is the first paragraph of content.',
                'This is the second paragraph with more information.',
                'This is the final paragraph of the sample content.'
            ],
            'links': [
                {'text': 'Link 1', 'url': 'https://example.com/link1'},
                {'text': 'Link 2', 'url': 'https://example.com/link2'}
            ],
            'images': [
                {'alt': 'Image 1', 'src': 'https://example.com/image1.jpg'},
                {'alt': 'Image 2', 'src': 'https://example.com/image2.jpg'}
            ],
            'scrapedAt': datetime.now().isoformat()
        }

        # Save scraped data
        save_scraped_data(scraped_data)

        logger.info(f"Web scraping completed: {scraping_id}")
        return jsonify({
            "message": "Web scraping completed successfully",
            "scrapingId": scraping_id,
            "data": scraped_data
        }), 201
    except Exception as e:
        logger.error(f"Error in web scraping: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/extract-data', methods=['POST'])
def extract_data():
    """Extract specific data from a webpage using CSS selectors or XPath"""
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)