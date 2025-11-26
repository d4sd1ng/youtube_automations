from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
ANALYTICS_DIR = os.path.join(DATA_DIR, 'analytics')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ANALYTICS_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Analytics Python Agent"}), 200

@app.route('/analyze-content', methods=['POST'])
def analyze_content():
    """Analyze content and generate insights"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_id = data.get('contentId', str(uuid.uuid4()))

        if not content:
            return jsonify({"error": "Content is required"}), 400

        logger.info(f"Analyzing content: {content_id}")

        # Perform content analysis (simplified)
        analysis_id = str(uuid.uuid4())
        word_count = len(content.split())
        char_count = len(content)

        # Simple keyword extraction (simplified)
        keywords = list(set(content.lower().split()))[:10]

        analysis = {
            'id': analysis_id,
            'contentId': content_id,
            'wordCount': word_count,
            'charCount': char_count,
            'keywords': keywords,
            'readabilityScore': min(100, word_count // 10),  # Simplified readability score
            'sentiment': 'neutral',  # Would be determined by NLP in a real implementation
            'createdAt': datetime.now().isoformat()
        }

        # Save analysis
        save_analysis(analysis)

        logger.info(f"Content analysis completed: {analysis_id}")
        return jsonify({
            "message": "Content analysis completed successfully",
            "analysisId": analysis_id,
            "analysis": analysis
        }), 201
    except Exception as e:
        logger.error(f"Error analyzing content: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-report', methods=['POST'])
def generate_report():
    """Generate analytics report"""
    try:
        data = request.get_json()
        report_type = data.get('reportType', 'content')
        date_range = data.get('dateRange', {})

        logger.info(f"Generating {report_type} report")

        # Generate report (simplified)
        report_id = str(uuid.uuid4())
        report = {
            'id': report_id,
            'type': report_type,
            'dateRange': date_range,
            'data': {
                'totalContentItems': 42,
                'averageWordCount': 523,
                'mostCommonKeywords': ['AI', 'technology', 'innovation'],
                'contentGrowth': '15%'
            },
            'createdAt': datetime.now().isoformat()
        }

        # Save report
        save_report(report)

        logger.info(f"Report generated: {report_id}")
        return jsonify({
            "message": "Report generated successfully",
            "reportId": report_id,
            "report": report
        }), 201
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-analysis/<analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """Get analysis by ID"""
    try:
        analysis = load_analysis(analysis_id)
        if not analysis:
            return jsonify({"error": "Analysis not found"}), 404

        logger.info(f"Analysis retrieved: {analysis_id}")
        return jsonify({
            "message": "Analysis retrieved successfully",
            "analysis": analysis
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-report/<report_id>', methods=['GET'])
def get_report(report_id):
    """Get report by ID"""
    try:
        report = load_report(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404

        logger.info(f"Report retrieved: {report_id}")
        return jsonify({
            "message": "Report retrieved successfully",
            "report": report
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/track-event', methods=['POST'])
def track_event():
    """Track analytics events"""
    try:
        data = request.get_json()
        event_type = data.get('eventType')
        video_id = data.get('videoId')
        metadata = data.get('metadata', {})

        if not event_type or not video_id:
            return jsonify({"error": "eventType and videoId are required"}), 400

        logger.info(f"Tracking event: {event_type} for video: {video_id}")

        # Create event tracking record
        event_id = str(uuid.uuid4())
        event_record = {
            'id': event_id,
            'eventType': event_type,
            'videoId': video_id,
            'metadata': metadata,
            'timestamp': datetime.now().isoformat()
        }

        # Save event record
        save_event(event_record)

        logger.info(f"Event tracked successfully: {event_id}")
        return jsonify({
            "message": "Event tracked successfully",
            "eventId": event_id,
            "event": event_record
        }), 201
    except Exception as e:
        logger.error(f"Error tracking event: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_event(event):
    """Save event to file"""
    try:
        file_path = os.path.join(ANALYTICS_DIR, f"{event['id']}_event.json")
        with open(file_path, 'w') as f:
            json.dump(event, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving event: {str(e)}")
        raise

def load_event(event_id):
    """Load event from file"""
    try:
        file_path = os.path.join(ANALYTICS_DIR, f"{event_id}_event.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading event: {str(e)}")
        return None

def save_analysis(analysis):
    """Save analysis to file"""
    try:
        file_path = os.path.join(ANALYTICS_DIR, f"{analysis['id']}_analysis.json")
        with open(file_path, 'w') as f:
            json.dump(analysis, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving analysis: {str(e)}")
        raise

def save_report(report):
    """Save report to file"""
    try:
        file_path = os.path.join(ANALYTICS_DIR, f"{report['id']}_report.json")
        with open(file_path, 'w') as f:
            json.dump(report, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving report: {str(e)}")
        raise

def load_analysis(analysis_id):
    """Load analysis from file"""
    try:
        file_path = os.path.join(ANALYTICS_DIR, f"{analysis_id}_analysis.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading analysis: {str(e)}")
        return None

def load_report(report_id):
    """Load report from file"""
    try:
        file_path = os.path.join(ANALYTICS_DIR, f"{report_id}_report.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading report: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)