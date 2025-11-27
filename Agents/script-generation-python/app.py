import os
import json
import uuid
from datetime import datetime
import logging
import asyncio
import aiohttp
from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/scripts')
SCRIPTS_DIR = os.path.join(DATA_DIR, 'scripts')
TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates/scripts')
PROMPT_TEMPLATES_DIR = os.path.join(DATA_DIR, 'prompt-templates')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SCRIPTS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(PROMPT_TEMPLATES_DIR, exist_ok=True)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "Script Generation Agent",
        "version": "1.0.0"
    }), 200

# Generate script endpoint
@app.route('/generate-script', methods=['POST'])
def generate_script():
    """Generate video script using LLM with advanced prompting"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'topic' not in data:
            return jsonify({"error": "Missing topic in request"}), 400

        topic = data['topic']
        content_type = data.get('contentType', 'educational')
        target_length = data.get('targetLength', '2-3min')
        tone = data.get('tone', 'professional')
        audience = data.get('audience', 'general')
        trending_keywords = data.get('trendingKeywords', [])
        custom_instructions = data.get('customInstructions', '')
        template_name = data.get('templateName')
        use_chain_of_thought = data.get('useChainOfThought', True)
        few_shot_examples = data.get('fewShotExamples', [])
        role_play_context = data.get('rolePlayContext', '')
        enable_self_reflection = data.get('enableSelfReflection', True)

        # Generate script ID
        script_id = f"script-{uuid.uuid4().hex[:12]}"

        # Calculate max tokens based on target length
        max_tokens = calculate_max_tokens(target_length)

        # Get temperature for tone
        temperature = get_temperature_for_tone(tone)

        # Generate advanced prompt
        advanced_prompt = generate_advanced_prompt(
            topic, content_type, target_length, tone, audience,
            trending_keywords, custom_instructions, template_name,
            use_chain_of_thought, few_shot_examples, role_play_context,
            enable_self_reflection
        )

        # Generate script content (mock implementation)
        script_content = generate_script_content(
            topic, content_type, tone, target_length, advanced_prompt
        )

        # Count words and estimate reading time
        word_count = count_words(script_content)
        reading_time = estimate_reading_time(script_content)

        # Create script record
        script_record = {
            'id': script_id,
            'topic': topic,
            'contentType': content_type,
            'targetLength': target_length,
            'tone': tone,
            'audience': audience,
            'trendingKeywords': trending_keywords,
            'customInstructions': custom_instructions,
            'templateName': template_name,
            'useChainOfThought': use_chain_of_thought,
            'fewShotExamples': few_shot_examples,
            'rolePlayContext': role_play_context,
            'enableSelfReflection': enable_self_reflection,
            'content': script_content,
            'wordCount': word_count,
            'readingTime': reading_time,
            'maxTokens': max_tokens,
            'temperature': temperature,
            'advancedPrompt': advanced_prompt,
            'status': 'generated',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        # Save script
        save_script(script_record)

        logger.info(f"Script generated: {script_id}")

        return jsonify({
            "message": "Script generated successfully",
            "scriptId": script_id,
            "script": script_record
        }), 201

    except Exception as e:
        logger.error(f"Error generating script: {str(e)}")
        return jsonify({"error": f"Script generation failed: {str(e)}"}), 500

# Refine script endpoint
@app.route('/refine-script', methods=['POST'])
def refine_script():
    """Refine existing script"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'scriptId' not in data:
            return jsonify({"error": "Missing scriptId in request"}), 400

        script_id = data['scriptId']
        refinements = data.get('refinements', {})
        additional_instructions = data.get('additionalInstructions', '')

        # Load script
        script = load_script(script_id)
        if not script:
            return jsonify({"error": f"Script {script_id} not found"}), 404

        # Update script with refinements
        if 'content' in refinements:
            script['content'] = refinements['content']
            script['wordCount'] = count_words(script['content'])
            script['readingTime'] = estimate_reading_time(script['content'])

        # Add additional instructions to custom instructions
        if additional_instructions:
            script['customInstructions'] = f"{script.get('customInstructions', '')}\n{additional_instructions}".strip()

        # Update timestamp
        script['updatedAt'] = datetime.now().isoformat()
        script['status'] = 'refined'

        # Save updated script
        save_script(script)

        logger.info(f"Script refined: {script_id}")

        return jsonify({
            "message": "Script refined successfully",
            "scriptId": script_id,
            "script": script
        }), 200

    except Exception as e:
        logger.error(f"Error refining script: {str(e)}")
        return jsonify({"error": f"Script refinement failed: {str(e)}"}), 500

# Get script endpoint
@app.route('/script/<script_id>', methods=['GET'])
def get_script(script_id):
    """Get script by ID"""
    try:
        # Load script
        script = load_script(script_id)
        if not script:
            return jsonify({"error": f"Script {script_id} not found"}), 404

        logger.info(f"Script retrieved: {script_id}")

        return jsonify({
            "message": "Script retrieved successfully",
            "script": script
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving script: {str(e)}")
        return jsonify({"error": f"Failed to retrieve script: {str(e)}"}), 500

# List scripts endpoint
@app.route('/scripts', methods=['GET'])
def list_scripts():
    """List all generated scripts"""
    try:
        scripts = []

        if os.path.exists(SCRIPTS_DIR):
            for filename in os.listdir(SCRIPTS_DIR):
                if filename.endswith('.json'):
                    file_path = os.path.join(SCRIPTS_DIR, filename)
                    try:
                        with open(file_path, 'r') as f:
                            script_data = json.load(f)
                            scripts.append({
                                'id': script_data['id'],
                                'topic': script_data['topic'],
                                'contentType': script_data['contentType'],
                                'status': script_data['status'],
                                'wordCount': script_data['wordCount'],
                                'createdAt': script_data['createdAt'],
                                'updatedAt': script_data['updatedAt']
                            })
                    except Exception as e:
                        logger.warning(f"Failed to read script file {filename}: {str(e)}")

        # Sort by creation date (newest first)
        scripts.sort(key=lambda x: x['createdAt'], reverse=True)

        logger.info(f"Listed {len(scripts)} scripts")

        return jsonify({
            "message": "Scripts retrieved successfully",
            "scripts": scripts,
            "total": len(scripts)
        }), 200

    except Exception as e:
        logger.error(f"Error listing scripts: {str(e)}")
        return jsonify({"error": f"Failed to list scripts: {str(e)}"}), 500

# Delete script endpoint
@app.route('/script/<script_id>', methods=['DELETE'])
def delete_script(script_id):
    """Delete script by ID"""
    try:
        script_file_path = os.path.join(SCRIPTS_DIR, f"{script_id}.json")

        if not os.path.exists(script_file_path):
            return jsonify({"error": f"Script {script_id} not found"}), 404

        os.remove(script_file_path)

        logger.info(f"Script deleted: {script_id}")

        return jsonify({
            "message": "Script deleted successfully"
        }), 200

    except Exception as e:
        logger.error(f"Error deleting script: {str(e)}")
        return jsonify({"error": f"Failed to delete script: {str(e)}"}), 500

# Get script templates endpoint
@app.route('/script-templates', methods=['GET'])
def get_script_templates():
    """Get available script templates"""
    try:
        templates = [
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
                "description": "Template for narrative content",
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

        logger.info("Script templates retrieved")

        return jsonify({
            "message": "Script templates retrieved successfully",
            "templates": templates
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving script templates: {str(e)}")
        return jsonify({"error": f"Failed to retrieve script templates: {str(e)}"}), 500

# Get agent status endpoint
@app.route('/agent-status', methods=['GET'])
def get_agent_status():
    """Get agent status"""
    try:
        # Count scripts
        script_count = 0
        if os.path.exists(SCRIPTS_DIR):
            script_count = len([f for f in os.listdir(SCRIPTS_DIR) if f.endswith('.json')])

        status = {
            "agentName": "ScriptGenerationAgent",
            "version": "1.0.0",
            "isAvailable": True,
            "supportedTasks": [
                'generate-script',
                'refine-script',
                'get-script',
                'list-scripts',
                'delete-script'
            ],
            "statistics": {
                "totalScripts": script_count
            }
        }

        logger.info("Agent status requested")

        return jsonify(status), 200

    except Exception as e:
        logger.error(f"Error getting agent status: {str(e)}")
        return jsonify({"error": f"Failed to get agent status: {str(e)}"}), 500

# Helper functions
def generate_advanced_prompt(topic, content_type, target_length, tone, audience,
                           trending_keywords, custom_instructions, template_name,
                           use_chain_of_thought, few_shot_examples, role_play_context,
                           enable_self_reflection):
    """Generate advanced prompt for LLM"""
    prompt = f"Generate a {content_type} script about '{topic}' with a {tone} tone for {audience} audience."

    if trending_keywords:
        prompt += f" Incorporate these trending keywords: {', '.join(trending_keywords)}."

    if custom_instructions:
        prompt += f" Additional instructions: {custom_instructions}"

    if template_name:
        prompt += f" Follow the '{template_name}' template structure."

    if use_chain_of_thought:
        prompt += " Use chain-of-thought reasoning to structure the content logically."

    if few_shot_examples:
        prompt += f" Reference these examples: {', '.join(few_shot_examples)}"

    if role_play_context:
        prompt += f" Context: {role_play_context}"

    if enable_self_reflection:
        prompt += " Include self-reflection questions for the audience."

    prompt += f" Target length: {target_length}."

    return prompt

def generate_script_content(topic, content_type, tone, target_length, advanced_prompt):
    """Generate script content (mock implementation)"""
    # This is a simplified version for the standalone module
    # In a real implementation, this would call an actual LLM service

    content = f"[INTRO]\nWelcome to today's video about {topic}.\n\n"
    content += f"[MAIN CONTENT]\nIn this {content_type}, we'll explore the fascinating world of {topic}.\n"
    content += f"Whether you're a beginner or expert, there's something here for everyone.\n\n"
    content += f"[KEY POINTS]\n1. First important aspect of {topic}\n"
    content += f"2. Second key element to consider\n"
    content += f"3. Final thoughts on the matter\n\n"
    content += f"[OUTRO]\nThanks for watching! Don't forget to like, subscribe, and hit the notification bell for more content on {topic}."

    return content

def calculate_max_tokens(target_length):
    """Calculate max tokens based on target length"""
    # Simplified calculation - in a real implementation, this would be more precise
    length_map = {
        '15-30s': 1000,
        '30-45s': 1500,
        '45-60s': 2000,
        '1-2min': 3000,
        '2-3min': 4000,
        '3-5min': 6000,
        '5-10min': 10000
    }

    return length_map.get(target_length, 2000)

def get_temperature_for_tone(tone):
    """Get temperature for tone"""
    # Simplified mapping - in a real implementation, this would be more nuanced
    tone_map = {
        'professional': 0.7,
        'casual': 0.8,
        'humorous': 0.9,
        'serious': 0.6,
        'educational': 0.7,
        'entertaining': 0.8
    }

    return tone_map.get(tone, 0.7)

def count_words(text):
    """Count words in text"""
    return len(text.strip().split())

def estimate_reading_time(text):
    """Estimate reading time"""
    words_per_minute = 150  # Average speaking rate
    word_count = count_words(text)
    return round(word_count / words_per_minute)

def save_script(script):
    """Save script to file"""
    try:
        file_path = os.path.join(SCRIPTS_DIR, f"{script['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(script, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save script {script['id']}: {str(e)}")
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
        logger.error(f"Failed to load script {script_id}: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)