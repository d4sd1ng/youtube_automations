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
SCRIPTS_DIR = os.path.join(DATA_DIR, 'scripts')
TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SCRIPTS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Default templates
DEFAULT_TEMPLATES = [
    {
        "id": "educational",
        "name": "Educational Script",
        "description": "Template for educational content",
        "sections": [
            "Introduction",
            "Learning Objectives",
            "Main Content",
            "Examples",
            "Summary",
            "Quiz"
        ]
    },
    {
        "id": "marketing",
        "name": "Marketing Script",
        "description": "Template for marketing and promotional content",
        "sections": [
            "Hook",
            "Problem Statement",
            "Solution Presentation",
            "Benefits",
            "Call to Action"
        ]
    },
    {
        "id": "storytelling",
        "name": "Storytelling Script",
        "description": "Template for narrative and storytelling content",
        "sections": [
            "Setup",
            "Conflict",
            "Rising Action",
            "Climax",
            "Falling Action",
            "Resolution"
        ]
    }
]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Script Generation Python Agent"}), 200

@app.route('/generate-script', methods=['POST'])
def generate_script():
    """Generate a new script based on topic and requirements"""
    try:
        data = request.get_json()
        topic = data.get('topic')
        template_id = data.get('templateId', 'educational')
        requirements = data.get('requirements', {})

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        logger.info(f"Generating script for topic: {topic}")

        # Find template
        template = next((t for t in DEFAULT_TEMPLATES if t['id'] == template_id), DEFAULT_TEMPLATES[0])

        # Generate script
        script_id = str(uuid.uuid4())
        script = {
            'id': script_id,
            'topic': topic,
            'templateId': template_id,
            'templateName': template['name'],
            'sections': [],
            'metadata': {
                'targetAudience': requirements.get('targetAudience', 'general'),
                'tone': requirements.get('tone', 'informative'),
                'estimatedDuration': requirements.get('estimatedDuration', '5 minutes'),
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
        }

        # Generate content for each section
        for section_name in template['sections']:
            section = {
                'id': str(uuid.uuid4()),
                'name': section_name,
                'content': generate_section_content(section_name, topic, requirements),
                'wordCount': 0
            }
            section['wordCount'] = len(section['content'].split())
            script['sections'].append(section)

        # Save script
        save_script(script)

        logger.info(f"Script generated successfully: {script_id}")
        return jsonify({
            "message": "Script generated successfully",
            "scriptId": script_id,
            "script": script
        }), 201
    except Exception as e:
        logger.error(f"Error generating script: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/refine-script/<script_id>', methods=['POST'])
def refine_script(script_id):
    """Refine an existing script"""
    try:
        data = request.get_json()
        refinements = data.get('refinements', {})

        # Load script
        script = load_script(script_id)
        if not script:
            return jsonify({"error": "Script not found"}), 404

        logger.info(f"Refining script: {script_id}")

        # Apply refinements
        for section in script['sections']:
            if section['id'] in refinements:
                section['content'] = refinements[section['id']]
                section['wordCount'] = len(section['content'].split())

        script['metadata']['updatedAt'] = datetime.now().isoformat()

        # Save updated script
        save_script(script)

        logger.info(f"Script refined successfully: {script_id}")
        return jsonify({
            "message": "Script refined successfully",
            "script": script
        }), 200
    except Exception as e:
        logger.error(f"Error refining script: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-script/<script_id>', methods=['GET'])
def get_script(script_id):
    """Get a script by ID"""
    try:
        script = load_script(script_id)
        if not script:
            return jsonify({"error": "Script not found"}), 404

        logger.info(f"Script retrieved: {script_id}")
        return jsonify({
            "message": "Script retrieved successfully",
            "script": script
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving script: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-scripts', methods=['GET'])
def list_scripts():
    """List all scripts"""
    try:
        scripts = load_all_scripts()

        logger.info(f"Retrieved {len(scripts)} scripts")
        return jsonify({
            "message": "Scripts retrieved successfully",
            "scripts": scripts
        }), 200
    except Exception as e:
        logger.error(f"Error listing scripts: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-script/<script_id>', methods=['DELETE'])
def delete_script(script_id):
    """Delete a script by ID"""
    try:
        script_file = os.path.join(SCRIPTS_DIR, f"{script_id}.json")
        if not os.path.exists(script_file):
            return jsonify({"error": "Script not found"}), 404

        os.remove(script_file)

        logger.info(f"Script deleted: {script_id}")
        return jsonify({
            "message": "Script deleted successfully"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting script: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/script-templates', methods=['GET'])
def get_script_templates():
    """Get available script templates"""
    try:
        logger.info("Script templates retrieved")
        return jsonify({
            "message": "Script templates retrieved successfully",
            "templates": DEFAULT_TEMPLATES
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving script templates: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_section_content(section_name, topic, requirements):
    """Generate content for a script section"""
    # This is a simplified content generation
    # In a real implementation, this would use AI models

    content_templates = {
        'Introduction': f"Welcome to our discussion about {topic}. Today we'll explore various aspects of this fascinating subject.",
        'Learning Objectives': f"By the end of this script on {topic}, you should understand the key concepts and be able to apply them.",
        'Main Content': f"Let's dive into the details of {topic}. We'll cover the fundamental principles and provide practical examples.",
        'Examples': f"To better understand {topic}, let's look at some real-world examples and case studies.",
        'Summary': f"To summarize our discussion on {topic}, we've covered the essential points and key takeaways.",
        'Quiz': f"Test your knowledge of {topic} with these questions.",
        'Hook': f"Did you know that {topic} can transform the way you think? Let's find out how.",
        'Problem Statement': f"Many people struggle with {topic}, leading to frustration and missed opportunities.",
        'Solution Presentation': f"Our approach to {topic} provides a clear and effective solution to these challenges.",
        'Benefits': f"By implementing our solution for {topic}, you'll experience significant improvements and results.",
        'Call to Action': f"Ready to get started with {topic}? Take action today and see the difference.",
        'Setup': f"In a world where {topic} matters, our story begins with an important discovery.",
        'Conflict': f"However, challenges with {topic} create tension and obstacles for our protagonist.",
        'Rising Action': f"As we explore {topic} further, the stakes get higher and the journey becomes more intense.",
        'Climax': f"The turning point in our {topic} story reveals a crucial insight or breakthrough.",
        'Falling Action': f"With the revelation about {topic}, we see the consequences and beginning of resolution.",
        'Resolution': f"Our journey with {topic} concludes with a satisfying conclusion and new understanding."
    }

    return content_templates.get(section_name, f"Content for section '{section_name}' in the context of {topic}.")

def save_script(script):
    """Save script to file"""
    try:
        file_path = os.path.join(SCRIPTS_DIR, f"{script['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(script, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving script: {str(e)}")
        raise

def load_script(script_id):
    """Load script from file"""
    try:
        file_path = os.path.join(SCRIPTS_DIR, f"{script_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading script: {str(e)}")
        return None

def load_all_scripts():
    """Load all scripts from file"""
    scripts = []
    try:
        for filename in os.listdir(SCRIPTS_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(SCRIPTS_DIR, filename)
                with open(file_path, 'r') as f:
                    scripts.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading scripts: {str(e)}")
    return scripts

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)