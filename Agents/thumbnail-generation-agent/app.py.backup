from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
THUMBNAILS_DIR = os.path.join(DATA_DIR, 'thumbnails')
TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(THUMBNAILS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Default thumbnail sizes
DEFAULT_SIZES = [
    {'width': 150, 'height': 150},
    {'width': 300, 'height': 200},
    {'width': 600, 'height': 400},
    {'width': 1200, 'height': 630}  # Social media size
]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Thumbnail Generation Python Agent"}), 200

@app.route('/generate-thumbnail', methods=['POST'])
def generate_thumbnail():
    """Generate a thumbnail from an image"""
    try:
        data = request.get_json()
        image_path = data.get('imagePath')
        image_data = data.get('imageData')
        width = data.get('width', 300)
        height = data.get('height', 200)
        format_type = data.get('format', 'jpg')

        if not image_path and not image_data:
            return jsonify({"error": "Image path or data is required"}), 400

        logger.info(f"Generating thumbnail with dimensions {width}x{height}")

        # Generate thumbnail (simplified)
        thumbnail_id = str(uuid.uuid4())
        thumbnail = {
            'id': thumbnail_id,
            'originalSource': image_path or 'base64_data',
            'path': f"/thumbnails/{thumbnail_id}.{format_type}",
            'dimensions': {
                'width': width,
                'height': height
            },
            'format': format_type,
            'size': f"{width * height // 1000}KB",  # Simplified size calculation
            'createdAt': datetime.now().isoformat()
        }

        # Save thumbnail metadata
        save_thumbnail(thumbnail)

        logger.info(f"Thumbnail generated successfully: {thumbnail_id}")
        return jsonify({
            "message": "Thumbnail generated successfully",
            "thumbnailId": thumbnail_id,
            "thumbnail": thumbnail
        }), 201
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-multiple-thumbnails', methods=['POST'])
def generate_multiple_thumbnails():
    """Generate multiple thumbnails with different sizes"""
    try:
        data = request.get_json()
        image_path = data.get('imagePath')
        image_data = data.get('imageData')
        sizes = data.get('sizes', DEFAULT_SIZES)

        if not image_path and not image_data:
            return jsonify({"error": "Image path or data is required"}), 400

        logger.info(f"Generating {len(sizes)} thumbnails")

        # Generate multiple thumbnails
        thumbnails = []
        for size in sizes:
            thumbnail_id = str(uuid.uuid4())
            thumbnail = {
                'id': thumbnail_id,
                'originalSource': image_path or 'base64_data',
                'path': f"/thumbnails/{thumbnail_id}.jpg",
                'dimensions': size,
                'format': 'jpg',
                'size': f"{size['width'] * size['height'] // 1000}KB",  # Simplified size calculation
                'createdAt': datetime.now().isoformat()
            }
            thumbnails.append(thumbnail)

            # Save thumbnail metadata
            save_thumbnail(thumbnail)

        logger.info(f"Generated {len(thumbnails)} thumbnails successfully")
        return jsonify({
            "message": "Thumbnails generated successfully",
            "thumbnails": thumbnails
        }), 201
    except Exception as e:
        logger.error(f"Error generating multiple thumbnails: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/apply-template', methods=['POST'])
def apply_template():
    """Apply a template to create a thumbnail"""
    try:
        data = request.get_json()
        template_id = data.get('templateId')
        content = data.get('content', {})

        if not template_id:
            return jsonify({"error": "Template ID is required"}), 400

        logger.info(f"Applying template: {template_id}")

        # Apply template (simplified)
        thumbnail_id = str(uuid.uuid4())
        thumbnail = {
            'id': thumbnail_id,
            'templateId': template_id,
            'content': content,
            'path': f"/thumbnails/{thumbnail_id}.jpg",
            'dimensions': {'width': 1200, 'height': 630},  # Social media size
            'format': 'jpg',
            'size': '75KB',
            'createdAt': datetime.now().isoformat()
        }

        # Save thumbnail metadata
        save_thumbnail(thumbnail)

        logger.info(f"Template applied successfully: {thumbnail_id}")
        return jsonify({
            "message": "Template applied successfully",
            "thumbnailId": thumbnail_id,
            "thumbnail": thumbnail
        }), 201
    except Exception as e:
        logger.error(f"Error applying template: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-thumbnail/<thumbnail_id>', methods=['GET'])
def get_thumbnail(thumbnail_id):
    """Get a thumbnail by ID"""
    try:
        thumbnail = load_thumbnail(thumbnail_id)
        if not thumbnail:
            return jsonify({"error": "Thumbnail not found"}), 404

        logger.info(f"Thumbnail retrieved: {thumbnail_id}")
        return jsonify({
            "message": "Thumbnail retrieved successfully",
            "thumbnail": thumbnail
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving thumbnail: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-thumbnails', methods=['GET'])
def list_thumbnails():
    """List all thumbnails"""
    try:
        thumbnails = load_all_thumbnails()

        logger.info(f"Retrieved {len(thumbnails)} thumbnails")
        return jsonify({
            "message": "Thumbnails retrieved successfully",
            "thumbnails": thumbnails
        }), 200
    except Exception as e:
        logger.error(f"Error listing thumbnails: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_thumbnail(thumbnail):
    """Save thumbnail metadata to file"""
    try:
        file_path = os.path.join(THUMBNAILS_DIR, f"{thumbnail['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(thumbnail, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving thumbnail: {str(e)}")
        raise

def load_thumbnail(thumbnail_id):
    """Load thumbnail metadata from file"""
    try:
        file_path = os.path.join(THUMBNAILS_DIR, f"{thumbnail_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading thumbnail: {str(e)}")
        return None

def load_all_thumbnails():
    """Load all thumbnails metadata from file"""
    thumbnails = []
    try:
        for filename in os.listdir(THUMBNAILS_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(THUMBNAILS_DIR, filename)
                with open(file_path, 'r') as f:
                    thumbnails.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading thumbnails: {str(e)}")
    return thumbnails

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)