from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import base64
from PIL import Image, ImageDraw, ImageFont
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/thumbnails')
TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates')
GENERATED_DIR = os.path.join(DATA_DIR, 'generated')
FONTS_DIR = os.path.join(DATA_DIR, 'fonts')
LOGOS_DIR = os.path.join(DATA_DIR, 'logos')
ICONS_DIR = os.path.join(DATA_DIR, 'icons')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)
os.makedirs(FONTS_DIR, exist_ok=True)
os.makedirs(LOGOS_DIR, exist_ok=True)
os.makedirs(ICONS_DIR, exist_ok=True)

# Premium configuration for professional thumbnails with branding
CONFIG = {
    'dimensions': {
        'youtube': {'width': 1280, 'height': 720},
        'shorts': {'width': 1080, 'height': 1920},
        'standard': {'width': 1280, 'height': 720},
        'banner': {'width': 2560, 'height': 1440}
    },
    'templates': {
        'premiumClickbait': {
            'name': "Premium Clickbait",
            'description': "Hochwertiges Clickbait-Design für maximale Klickrate",
            'layers': ["background", "gradient_overlay", "text_overlay", "cta_elements", "branding"],
            'category': "monetization",
            'priority': "high"
        },
        'cinematic': {
            'name': "Cinematic Design",
            'description': "Filmisches Design für professionelle Inhalte",
            'layers': ["background", "cinematic_overlay", "text_overlay", "branding"],
            'category': "professional",
            'priority': "medium"
        },
        'boldMinimal': {
            'name': "Bold Minimal",
            'description': "Klares, reduziertes Design mit starker visueller Wirkung",
            'layers': ["background", "accent_elements", "text_overlay", "branding"],
            'category': "professional",
            'priority': "high"
        },
        'gradientImpact': {
            'name': "Gradient Impact",
            'description': "Farbverlauf-Design für maximale Aufmerksamkeit",
            'layers': ["background", "gradient_overlay", "text_overlay", "branding"],
            'category': "clickbait",
            'priority': "high"
        },
        'cleanProfessional': {
            'name': "Clean Professional",
            'description': "Sauberer professioneller Look für seriöse Inhalte",
            'layers': ["background", "text_overlay", "logo_placement", "branding"],
            'category': "professional",
            'priority': "medium"
        }
    },
    'colors': {
        'primary': '#FF0000',  # YouTube red
        'secondary': '#FFFFFF',  # White
        'accent': '#000000',  # Black
        'background': '#000000',  # Black
        'gradientStart': '#FF0000',
        'gradientEnd': '#000000',
        'cinematicStart': 'rgba(0, 0, 0, 0.8)',
        'cinematicEnd': 'rgba(0, 0, 0, 0.2)'
    },
    'fonts': {
        'primary': 'Arial',
        'heading': 'Arial Bold',
        'sizes': {
            'title': 72,
            'subtitle': 36,
            'tagline': 24
        }
    }
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "Thumbnail Generation Python Agent",
        "version": "1.0.0"
    }), 200

@app.route('/generate-thumbnail', methods=['POST'])
def generate_thumbnail():
    """Generate a thumbnail with text overlay"""
    try:
        data = request.get_json()
        
        # Extract parameters
        title = data.get('title', 'Default Title')
        subtitle = data.get('subtitle', '')
        template = data.get('template', 'boldMinimal')
        platform = data.get('platform', 'youtube')
        background_color = data.get('backgroundColor', CONFIG['colors']['background'])
        text_color = data.get('textColor', CONFIG['colors']['secondary'])
        accent_color = data.get('accentColor', CONFIG['colors']['primary'])
        
        # Get canvas dimensions
        dimensions = CONFIG['dimensions'].get(platform, CONFIG['dimensions']['standard'])
        
        # Create image
        img = Image.new('RGB', (dimensions['width'], dimensions['height']), background_color)
        draw = ImageDraw.Draw(img)
        
        # Apply template-specific styling
        template_config = CONFIG['templates'].get(template)
        if template_config:
            apply_template_styling(draw, dimensions, template_config, accent_color)
        
        # Draw text
        draw_text(draw, dimensions, title, subtitle, text_color)
        
        # Generate output path
        thumbnail_id = str(uuid.uuid4())
        output_path = os.path.join(GENERATED_DIR, f"{thumbnail_id}.png")
        
        # Save the thumbnail
        img.save(output_path, 'PNG')
        
        # Create thumbnail record
        thumbnail_record = {
            'id': thumbnail_id,
            'title': title,
            'subtitle': subtitle,
            'template': template,
            'platform': platform,
            'dimensions': dimensions,
            'path': output_path,
            'createdAt': datetime.now().isoformat()
        }
        
        # Save thumbnail metadata
        save_thumbnail(thumbnail_record)
        
        logger.info(f"Thumbnail generated successfully: {thumbnail_id}")
        
        return jsonify({
            "message": "Thumbnail generated successfully",
            "thumbnailId": thumbnail_id,
            "thumbnail": thumbnail_record
        }), 201
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-multiple-thumbnails', methods=['POST'])
def generate_multiple_thumbnails():
    """Generate multiple thumbnails with different templates"""
    try:
        data = request.get_json()
        title = data.get('title', 'Default Title')
        subtitle = data.get('subtitle', '')
        templates = data.get('templates', ['boldMinimal', 'cinematic', 'gradientImpact'])
        platform = data.get('platform', 'youtube')
        
        logger.info(f"Generating {len(templates)} thumbnails")
        
        # Generate multiple thumbnails
        thumbnails = []
        for template in templates:
            try:
                # Create image
                dimensions = CONFIG['dimensions'].get(platform, CONFIG['dimensions']['standard'])
                img = Image.new('RGB', (dimensions['width'], dimensions['height']), CONFIG['colors']['background'])
                draw = ImageDraw.Draw(img)
                
                # Apply template-specific styling
                template_config = CONFIG['templates'].get(template)
                if template_config:
                    apply_template_styling(draw, dimensions, template_config, CONFIG['colors']['primary'])
                
                # Draw text
                draw_text(draw, dimensions, title, subtitle, CONFIG['colors']['secondary'])
                
                # Generate output path
                thumbnail_id = str(uuid.uuid4())
                output_path = os.path.join(GENERATED_DIR, f"{thumbnail_id}.png")
                
                # Save the thumbnail
                img.save(output_path, 'PNG')
                
                # Create thumbnail record
                thumbnail_record = {
                    'id': thumbnail_id,
                    'title': title,
                    'subtitle': subtitle,
                    'template': template,
                    'platform': platform,
                    'dimensions': dimensions,
                    'path': output_path,
                    'createdAt': datetime.now().isoformat()
                }
                
                # Save thumbnail metadata
                save_thumbnail(thumbnail_record)
                
                thumbnails.append(thumbnail_record)
            except Exception as e:
                logger.error(f"Error generating thumbnail with template {template}: {str(e)}")
                continue
        
        logger.info(f"Generated {len(thumbnails)} thumbnails successfully")
        
        return jsonify({
            "message": "Thumbnails generated successfully",
            "thumbnails": thumbnails
        }), 201
    except Exception as e:
        logger.error(f"Error generating multiple thumbnails: {str(e)}")
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

@app.route('/get-available-templates', methods=['GET'])
def get_available_templates():
    """Get available templates"""
    try:
        return jsonify({
            "message": "Templates retrieved successfully",
            "templates": CONFIG['templates']
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving templates: {str(e)}")
        return jsonify({"error": str(e)}), 500

def apply_template_styling(draw, dimensions, template_config, accent_color):
    """Apply template-specific styling"""
    # Apply gradient overlay for certain templates
    if template_config['name'] == 'Gradient Impact':
        # For simplicity, we'll draw a rectangle with the primary color
        draw.rectangle([0, 0, dimensions['width'], dimensions['height']], fill=CONFIG['colors']['primary'])
    
    # Apply cinematic overlay for cinematic template
    if template_config['name'] == 'Cinematic Design':
        # For simplicity, we'll draw a dark overlay
        draw.rectangle([0, 0, dimensions['width'], dimensions['height']], fill="#333333")
    
    # Add accent elements for bold minimal template
    if template_config['name'] == 'Bold Minimal':
        draw.rectangle([
            dimensions['width'] * 0.1, 
            dimensions['height'] * 0.85,
            dimensions['width'] * 0.9,
            dimensions['height'] * 0.85 + 8
        ], fill=accent_color)

def draw_text(draw, dimensions, title, subtitle, text_color):
    """Draw text on image"""
    try:
        # For simplicity, we'll use default fonts
        # In a production environment, you would load specific fonts
        
        # Draw title (centered)
        title_bbox = draw.textbbox((0, 0), title)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        
        title_x = (dimensions['width'] - title_width) / 2
        title_y = (dimensions['height'] / 2) - (title_height / 2)
        
        draw.text((title_x, title_y), title, fill=text_color)
        
        # Draw subtitle if provided (below title)
        if subtitle:
            subtitle_bbox = draw.textbbox((0, 0), subtitle)
            subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
            subtitle_height = subtitle_bbox[3] - subtitle_bbox[1]
            
            subtitle_x = (dimensions['width'] - subtitle_width) / 2
            subtitle_y = title_y + title_height + 20  # 20 pixels below title
            
            draw.text((subtitle_x, subtitle_y), subtitle, fill=text_color)
    except Exception as e:
        logger.error(f"Error drawing text: {str(e)}")

def save_thumbnail(thumbnail):
    """Save thumbnail metadata to file"""
    try:
        file_path = os.path.join(DATA_DIR, f"{thumbnail['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(thumbnail, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving thumbnail: {str(e)}")
        raise

def load_thumbnail(thumbnail_id):
    """Load thumbnail metadata from file"""
    try:
        file_path = os.path.join(DATA_DIR, f"{thumbnail_id}.json")
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
        if os.path.exists(DATA_DIR):
            for filename in os.listdir(DATA_DIR):
                if filename.endswith('.json') and filename != 'config.json':
                    file_path = os.path.join(DATA_DIR, filename)
                    with open(file_path, 'r') as f:
                        thumbnail_data = json.load(f)
                        # Only include actual thumbnail records, not config files
                        if 'title' in thumbnail_data or 'template' in thumbnail_data:
                            thumbnails.append(thumbnail_data)
    except Exception as e:
        logger.error(f"Error loading thumbnails: {str(e)}")
    return thumbnails

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)