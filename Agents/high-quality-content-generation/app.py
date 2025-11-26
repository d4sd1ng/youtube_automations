#!/usr/bin/env python3
"""
High-Quality Content Generation Agent using WAN 2.2 and alternative platforms
This agent provides high-quality content generation capabilities for thumbnails, videos, and avatars
using multiple platforms including WAN 2.2, Synthesia, Runway, and online image generation services.
"""

from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import subprocess
import sys
import torch
from PIL import Image
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OUTPUTS_DIR = os.path.join(DATA_DIR, 'outputs')
TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates')
TOKENS_DIR = os.path.join(DATA_DIR, 'tokens')  # Directory for token tracking

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(TOKENS_DIR, exist_ok=True)

# Platform configurations with token costs
PLATFORMS = {
    "wan22": {
        "name": "WAN 2.2",
        "path": os.path.join(os.path.dirname(BASE_DIR), '..', 'Wan2.2', 'Wan2.2'),
        "available": False,
        "token_cost": {
            "thumbnail": 0,  # Local processing, no token cost
            "video": 0,      # Local processing, no token cost
            "avatar": 0      # Local processing, no token cost
        }
    },
    "synthesia": {
        "name": "Synthesia",
        "api_key": os.environ.get("SYNTHESIA_API_KEY", ""),
        "available": False,
        "token_cost": {
            "thumbnail": 5,   # 5 tokens per thumbnail
            "video": 50,      # 50 tokens per video
            "avatar": 200     # 200 tokens per voice avatar (higher cost due to voice synthesis)
        }
    },
    "runway": {
        "name": "Runway",
        "api_key": os.environ.get("RUNWAY_API_KEY", ""),
        "available": False,
        "token_cost": {
            "thumbnail": 10,  # 10 tokens per thumbnail
            "video": 100,     # 100 tokens per video
            "avatar": 0       # Not supported for voice avatars
        }
    },
    "stability_ai": {
        "name": "Stability AI",
        "api_key": os.environ.get("STABILITY_API_KEY", ""),
        "available": False,
        "api_host": "https://api.stability.ai",
        "token_cost": {
            "thumbnail": 3,   # 3 tokens per thumbnail
            "video": 0,       # Not supported for video
            "avatar": 0       # Not supported for voice avatars
        }
    }
}

# Token management
def load_tokens():
    """Load token balance from file"""
    tokens_file = os.path.join(TOKENS_DIR, 'balance.json')
    if os.path.exists(tokens_file):
        with open(tokens_file, 'r') as f:
            return json.load(f)
    else:
        # Initialize with default token balance
        default_balance = {
            "total_tokens": 1000,
            "used_tokens": 0,
            "remaining_tokens": 1000,
            "history": []
        }
        save_tokens(default_balance)
        return default_balance

def save_tokens(token_data):
    """Save token balance to file"""
    tokens_file = os.path.join(TOKENS_DIR, 'balance.json')
    with open(tokens_file, 'w') as f:
        json.dump(token_data, f, indent=2)

def check_token_balance(required_tokens):
    """Check if there are enough tokens for the operation"""
    tokens = load_tokens()
    return tokens["remaining_tokens"] >= required_tokens

def consume_tokens(platform, content_type, quantity=1):
    """Consume tokens for an operation"""
    tokens = load_tokens()
    cost_per_item = PLATFORMS[platform]["token_cost"].get(content_type, 0)
    total_cost = cost_per_item * quantity
    
    if tokens["remaining_tokens"] >= total_cost:
        tokens["used_tokens"] += total_cost
        tokens["remaining_tokens"] -= total_cost
        
        # Add to history
        tokens["history"].append({
            "timestamp": datetime.now().isoformat(),
            "platform": platform,
            "content_type": content_type,
            "quantity": quantity,
            "cost": total_cost,
            "operation": "consume"
        })
        
        save_tokens(tokens)
        return True, total_cost
    else:
        return False, total_cost

def add_tokens(amount):
    """Add tokens to the balance"""
    tokens = load_tokens()
    tokens["total_tokens"] += amount
    tokens["remaining_tokens"] += amount
    
    # Add to history
    tokens["history"].append({
        "timestamp": datetime.now().isoformat(),
        "amount": amount,
        "operation": "add"
    })
    
    save_tokens(tokens)
    return tokens

# Check platform availability
def check_platform_availability():
    """Check availability of all platforms"""
    # Check WAN 2.2
    wan22_path = PLATFORMS["wan22"]["path"]
    PLATFORMS["wan22"]["available"] = (
        os.path.exists(wan22_path) and 
        os.path.exists(os.path.join(wan22_path, 'generate.py')) and
        os.path.isdir(os.path.join(wan22_path, 'examples'))
    )
    
    # Check Synthesia
    PLATFORMS["synthesia"]["available"] = bool(PLATFORMS["synthesia"]["api_key"])
    
    # Check Runway
    PLATFORMS["runway"]["available"] = bool(PLATFORMS["runway"]["api_key"])
    
    # Check Stability AI
    PLATFORMS["stability_ai"]["available"] = bool(PLATFORMS["stability_ai"]["api_key"])
    
    return PLATFORMS

def run_wan22_command(cmd_args):
    """Run WAN 2.2 generation command"""
    if not PLATFORMS["wan22"]["available"]:
        raise Exception("WAN 2.2 is not available or properly configured")
    
    wan22_path = PLATFORMS["wan22"]["path"]
    generate_script = os.path.join(wan22_path, 'generate.py')
    
    # Construct the full command
    cmd = [sys.executable, generate_script] + cmd_args
    
    # Run the command
    try:
        result = subprocess.run(
            cmd,
            cwd=wan22_path,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode != 0:
            raise Exception(f"WAN 2.2 command failed: {result.stderr}")
            
        return result.stdout
    except subprocess.TimeoutExpired:
        raise Exception("WAN 2.2 command timed out")
    except Exception as e:
        raise Exception(f"Failed to run WAN 2.2 command: {str(e)}")

def call_synthesia_api(endpoint, payload):
    """Call Synthesia API"""
    if not PLATFORMS["synthesia"]["available"]:
        raise Exception("Synthesia API key not configured")
    
    url = f"https://api.synthesia.io/v2/{endpoint}"
    headers = {
        "Authorization": f"Bearer {PLATFORMS['synthesia']['api_key']}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=300)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Failed to call Synthesia API: {str(e)}")

def call_runway_api(endpoint, payload):
    """Call Runway API"""
    if not PLATFORMS["runway"]["available"]:
        raise Exception("Runway API key not configured")
    
    url = f"https://api.runwayml.com/v1/{endpoint}"
    headers = {
        "Authorization": f"Bearer {PLATFORMS['runway']['api_key']}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=300)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"Failed to call Runway API: {str(e)}")

def call_stability_api(endpoint, payload, image_data=None):
    """Call Stability AI API for image generation"""
    if not PLATFORMS["stability_ai"]["available"]:
        raise Exception("Stability AI API key not configured")
    
    url = f"{PLATFORMS['stability_ai']['api_host']}/v1/{endpoint}"
    headers = {
        "Authorization": f"Bearer {PLATFORMS['stability_ai']['api_key']}"
    }
    
    try:
        if image_data:
            # For image-to-image requests
            files = {
                "init_image": image_data
            }
            response = requests.post(url, data=payload, headers=headers, files=files, timeout=300)
        else:
            # For text-to-image requests
            headers["Content-Type"] = "application/json"
            response = requests.post(url, json=payload, headers=headers, timeout=300)
        
        response.raise_for_status()
        return response
    except Exception as e:
        raise Exception(f"Failed to call Stability AI API: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    platforms = check_platform_availability()
    tokens = load_tokens()
    
    return jsonify({
        "status": "healthy",
        "service": "high-quality-content-generation",
        "platforms": platforms,
        "tokens": tokens,
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/tokens/balance', methods=['GET'])
def get_token_balance():
    """Get current token balance"""
    tokens = load_tokens()
    return jsonify(tokens), 200

@app.route('/tokens/add', methods=['POST'])
def add_tokens_endpoint():
    """Add tokens to balance"""
    try:
        data = request.get_json()
        amount = data.get('amount', 0)
        
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
            
        tokens = add_tokens(amount)
        return jsonify(tokens), 200
    except Exception as e:
        return jsonify({"error": f"Failed to add tokens: {str(e)}"}), 500

@app.route('/tokens/history', methods=['GET'])
def get_token_history():
    """Get token consumption history"""
    tokens = load_tokens()
    limit = request.args.get('limit', 50, type=int)
    history = tokens["history"][-limit:]  # Get last N entries
    return jsonify(history), 200

@app.route('/execute-avatar-control', methods=['POST'])
def execute_avatar_control():
    """Execute avatar control commands from avatar control agent"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400
            
        # Extract control parameters
        avatar_id = data.get('avatarId')
        action = data.get('action', 'execute_gestures')
        gestures = data.get('gestures', [])
        emotion = data.get('emotion', 'neutral')
        tone = data.get('tone', 'normal')
        
        # Generate unique ID for this control execution
        execution_id = f"exec_{uuid.uuid4().hex[:8]}"
        
        # Execute avatar control
        control_execution = {
            "executionId": execution_id,
            "avatarId": avatar_id,
            "action": action,
            "gestures": gestures,
            "emotion": emotion,
            "tone": tone,
            "status": "executed",
            "timestamp": datetime.now().isoformat()
        }
        
        # In a real implementation, this would send commands to the actual avatar system
        # For now, we'll just log the execution
        logger.info(f"Avatar control executed: {control_execution}")
        
        # Save control execution metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{execution_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(control_execution, f, indent=2)
            
        return jsonify(control_execution), 200
        
    except Exception as e:
        logger.error(f"Error executing avatar control: {str(e)}")
        return jsonify({"error": f"Failed to execute avatar control: {str(e)}"}), 500

@app.route('/generate-thumbnail', methods=['POST'])
def generate_thumbnail():
    """Generate high-quality thumbnail using specified platform"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400
            
        prompt = data.get('prompt', '')
        style = data.get('style', 'cinematic')
        size = data.get('size', '1280*720')
        theme = data.get('theme', 'ai_and_politics')
        platform = data.get('platform', 'wan22')  # Default to WAN 2.2
        check_tokens = data.get('checkTokens', True)  # Whether to check token balance
        
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400
            
        # Check token balance if requested
        if check_tokens and platform != "wan22":
            token_cost = PLATFORMS[platform]["token_cost"]["thumbnail"]
            if not check_token_balance(token_cost):
                return jsonify({
                    "error": "Insufficient tokens",
                    "required_tokens": token_cost,
                    "available_tokens": load_tokens()["remaining_tokens"]
                }), 402  # Payment required
        
        # Generate unique ID for this thumbnail
        thumbnail_id = f"thumb_{uuid.uuid4().hex[:8]}"
        
        # Prepare output path
        output_filename = f"{thumbnail_id}.png"
        output_path = os.path.join(OUTPUTS_DIR, output_filename)
        
        # Platform-specific generation
        if platform == "wan22" and PLATFORMS["wan22"]["available"]:
            # For demonstration purposes, we'll create a sample thumbnail
            # In a real implementation, this would call WAN 2.2 to generate the actual thumbnail
            sample_image = Image.new('RGB', (1280, 720), color=(73, 109, 137))
            sample_image.save(output_path)
            generation_method = "WAN 2.2"
            token_cost = 0
        elif platform == "synthesia" and PLATFORMS["synthesia"]["available"]:
            # In a real implementation, this would call Synthesia API
            sample_image = Image.new('RGB', (1280, 720), color=(150, 75, 200))
            sample_image.save(output_path)
            generation_method = "Synthesia"
            token_cost = PLATFORMS[platform]["token_cost"]["thumbnail"]
        elif platform == "runway" and PLATFORMS["runway"]["available"]:
            # In a real implementation, this would call Runway API
            sample_image = Image.new('RGB', (1280, 720), color=(200, 100, 50))
            sample_image.save(output_path)
            generation_method = "Runway"
            token_cost = PLATFORMS[platform]["token_cost"]["thumbnail"]
        elif platform == "stability_ai" and PLATFORMS["stability_ai"]["available"]:
            # In a real implementation, this would call Stability AI API
            sample_image = Image.new('RGB', (1280, 720), color=(50, 150, 100))
            sample_image.save(output_path)
            generation_method = "Stability AI"
            token_cost = PLATFORMS[platform]["token_cost"]["thumbnail"]
        else:
            # Fallback to default (WAN 2.2 if available, otherwise sample)
            if PLATFORMS["wan22"]["available"]:
                sample_image = Image.new('RGB', (1280, 720), color=(73, 109, 137))
                sample_image.save(output_path)
                generation_method = "WAN 2.2 (fallback)"
                token_cost = 0
            else:
                sample_image = Image.new('RGB', (1280, 720), color=(100, 100, 100))
                sample_image.save(output_path)
                generation_method = "Sample (fallback)"
                token_cost = 0
        
        # Consume tokens if not WAN 2.2
        if platform != "wan22" and check_tokens:
            success, consumed_tokens = consume_tokens(platform, "thumbnail")
            if not success:
                return jsonify({"error": "Token consumption failed"}), 500
        else:
            consumed_tokens = 0
        
        thumbnail_response = {
            "thumbnailId": thumbnail_id,
            "prompt": prompt,
            "style": style,
            "size": size,
            "theme": theme,
            "platform": platform,
            "generationMethod": generation_method,
            "tokenCost": token_cost,
            "consumedTokens": consumed_tokens,
            "outputPath": output_path,
            "outputFilename": output_filename,
            "status": "generated",
            "timestamp": datetime.now().isoformat()
        }
        
        # Save thumbnail metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{thumbnail_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(thumbnail_response, f, indent=2)
            
        return jsonify(thumbnail_response), 200
        
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        return jsonify({"error": f"Failed to generate thumbnail: {str(e)}"}), 500

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate high-quality video using specified platform"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400
            
        prompt = data.get('prompt', '')
        task_type = data.get('taskType', 't2v-A14B')  # t2v, i2v, ti2v, s2v
        size = data.get('size', '1280*720')
        frame_num = data.get('frameNum', 24)
        style = data.get('style', 'cinematic')
        theme = data.get('theme', 'ai_and_politics')
        audio_path = data.get('audioPath')
        image_path = data.get('imagePath')
        platform = data.get('platform', 'wan22')  # Default to WAN 2.2
        check_tokens = data.get('checkTokens', True)  # Whether to check token balance
        
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400
            
        # Check token balance if requested
        if check_tokens and platform != "wan22":
            token_cost = PLATFORMS[platform]["token_cost"]["video"]
            if not check_token_balance(token_cost):
                return jsonify({
                    "error": "Insufficient tokens",
                    "required_tokens": token_cost,
                    "available_tokens": load_tokens()["remaining_tokens"]
                }), 402  # Payment required
        
        # Generate unique ID for this video
        video_id = f"video_{uuid.uuid4().hex[:8]}"
        
        # Prepare output path
        output_filename = f"{video_id}.mp4"
        output_path = os.path.join(OUTPUTS_DIR, output_filename)
        
        # Platform-specific generation
        if platform == "wan22" and PLATFORMS["wan22"]["available"]:
            # For demonstration purposes, we'll create a sample video metadata
            # In a real implementation, this would call WAN 2.2 to generate the actual video
            generation_method = "WAN 2.2"
            token_cost = 0
        elif platform == "synthesia" and PLATFORMS["synthesia"]["available"]:
            # In a real implementation, this would call Synthesia API
            generation_method = "Synthesia"
            token_cost = PLATFORMS[platform]["token_cost"]["video"]
        elif platform == "runway" and PLATFORMS["runway"]["available"]:
            # In a real implementation, this would call Runway API
            generation_method = "Runway"
            token_cost = PLATFORMS[platform]["token_cost"]["video"]
        else:
            # Fallback to default (WAN 2.2 if available, otherwise sample)
            if PLATFORMS["wan22"]["available"]:
                generation_method = "WAN 2.2 (fallback)"
                token_cost = 0
            else:
                generation_method = "Sample (fallback)"
                token_cost = 0
        
        # Consume tokens if not WAN 2.2
        if platform != "wan22" and check_tokens:
            success, consumed_tokens = consume_tokens(platform, "video")
            if not success:
                return jsonify({"error": "Token consumption failed"}), 500
        else:
            consumed_tokens = 0
        
        # Create a placeholder file to indicate generation
        with open(output_path, 'w') as f:
            f.write(f"Video placeholder generated by {generation_method}\nPrompt: {prompt}\nTheme: {theme}")
        
        video_response = {
            "videoId": video_id,
            "prompt": prompt,
            "taskType": task_type,
            "size": size,
            "frameNum": frame_num,
            "style": style,
            "theme": theme,
            "audioPath": audio_path,
            "imagePath": image_path,
            "platform": platform,
            "generationMethod": generation_method,
            "tokenCost": token_cost,
            "consumedTokens": consumed_tokens,
            "outputPath": output_path,
            "outputFilename": output_filename,
            "status": "generated",
            "timestamp": datetime.now().isoformat()
        }
        
        # Save video metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{video_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(video_response, f, indent=2)
            
        return jsonify(video_response), 200
        
    except Exception as e:
        logger.error(f"Error generating video: {str(e)}")
        return jsonify({"error": f"Failed to generate video: {str(e)}"}), 500

@app.route('/generate-avatar', methods=['POST'])
def generate_avatar():
    """Generate high-quality avatar using specified platform"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400
            
        character = data.get('character', 'politician')
        style = data.get('style', 'professional')
        theme = data.get('theme', 'ai_and_politics')
        customization = data.get('customization', {})
        platform = data.get('platform', 'synthesia')  # Default to Synthesia for voice avatars
        check_tokens = data.get('checkTokens', True)  # Whether to check token balance
        enable_gesture_control = data.get('enableGestureControl', False)  # Enable gesture control
        
        # For voice avatars, only Synthesia is suitable
        if platform != "synthesia":
            return jsonify({
                "error": "For voice avatar creation, only Synthesia platform is supported",
                "supported_platforms": ["synthesia"]
            }), 400
        
        # Check if platform supports avatar generation
        if not PLATFORMS[platform]["available"]:
            return jsonify({"error": f"Platform {platform} is not available"}), 400
            
        # Check token balance if requested
        if check_tokens and platform != "wan22":
            token_cost = PLATFORMS[platform]["token_cost"]["avatar"]
            if not check_token_balance(token_cost):
                return jsonify({
                    "error": "Insufficient tokens",
                    "required_tokens": token_cost,
                    "available_tokens": load_tokens()["remaining_tokens"]
                }), 402  # Payment required
        
        # Generate unique ID for this avatar
        avatar_id = f"avtr_{uuid.uuid4().hex[:8]}"
        
        # Prepare output path
        output_filename = f"{avatar_id}.png"
        output_path = os.path.join(OUTPUTS_DIR, output_filename)
        
        # For voice avatars, we need to use Synthesia
        if platform == "synthesia" and PLATFORMS["synthesia"]["available"]:
            # In a real implementation, this would call Synthesia API to create a voice avatar
            # For now, we'll create a sample avatar
            sample_image = Image.new('RGB', (512, 512), color=(150, 75, 200))
            sample_image.save(output_path)
            generation_method = "Synthesia Voice Avatar"
            token_cost = PLATFORMS[platform]["token_cost"]["avatar"]
            
            # Extract voice-related parameters
            voice_parameters = {
                "voice_sample": data.get("voice_sample"),
                "voice_tone": data.get("voice_tone", "neutral"),
                "voice_speed": data.get("voice_speed", 1.0),
                "language": data.get("language", "de")
            }
            
            # Extract gesture and body parameters
            gesture_parameters = {
                "full_body": data.get("full_body", True),  # Kopf, OberkÃ¶rper, Arme und HÃ¤nde
                "gesture_support": data.get("gesture_support", True),
                "hand_animations": data.get("hand_animations", True),
                "body_language": data.get("body_language", "professional"),
                "gestures": data.get("gestures", ["pointing", "hand_gestures", "natural_movement"]),
                "enableGestureControl": enable_gesture_control
            }
            
            # Personal avatar creation with existing voice sample
            personal_avatar = data.get("personal_avatar", False)
            if personal_avatar:
                logger.info(f"Creating personal avatar with existing voice sample: {data.get('voice_sample')}")
        else:
            return jsonify({"error": "Synthesia is required for voice avatar creation"}), 400
        
        # Consume tokens if not WAN 2.2
        if platform != "wan22" and check_tokens:
            success, consumed_tokens = consume_tokens(platform, "avatar")
            if not success:
                return jsonify({"error": "Token consumption failed"}), 500
        else:
            consumed_tokens = 0
        
        avatar_response = {
            "avatarId": avatar_id,
            "character": character,
            "style": style,
            "theme": theme,
            "customization": customization,
            "voiceParameters": voice_parameters if platform == "synthesia" else {},
            "gestureParameters": gesture_parameters if platform == "synthesia" else {},
            "platform": platform,
            "generationMethod": generation_method,
            "tokenCost": token_cost,
            "consumedTokens": consumed_tokens,
            "outputPath": output_path,
            "outputFilename": output_filename,
            "status": "generated",
            "timestamp": datetime.now().isoformat()
        }
        
        # Save avatar metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{avatar_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(avatar_response, f, indent=2)
            
        return jsonify(avatar_response), 200
        
    except Exception as e:
        logger.error(f"Error generating avatar: {str(e)}")
        return jsonify({"error": f"Failed to generate avatar: {str(e)}"}), 500

@app.route('/batch-generate', methods=['POST'])
def batch_generate():
    """Generate multiple high-quality content items in batch using specified platforms"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Missing request data"}), 400
            
        items = data.get('items', [])
        batch_id = f"batch_{uuid.uuid4().hex[:8]}"
        check_tokens = data.get('checkTokens', True)  # Whether to check token balance
        
        # Validate items - check if voice avatars use correct platform
        for item in items:
            if item.get('type') == 'avatar' and item.get('voice_sample'):
                # This is a voice avatar, must use Synthesia
                if item.get('platform') != 'synthesia':
                    return jsonify({
                        "error": f"Voice avatar (item index {items.index(item)}) must use Synthesia platform",
                        "item_index": items.index(item),
                        "required_platform": "synthesia"
                    }), 400
        
        # Calculate total token cost if checking tokens
        total_token_cost = 0
        if check_tokens:
            for item in items:
                item_type = item.get('type')
                platform = item.get('platform', 'wan22')
                if platform != "wan22":
                    token_cost = PLATFORMS[platform]["token_cost"].get(item_type, 0)
                    total_token_cost += token_cost
            
            # Check if we have enough tokens
            if not check_token_balance(total_token_cost):
                return jsonify({
                    "error": "Insufficient tokens for batch operation",
                    "required_tokens": total_token_cost,
                    "available_tokens": load_tokens()["remaining_tokens"]
                }), 402  # Payment required
        
        results = []
        
        for item in items:
            item_type = item.get('type')
            platform = item.get('platform', 'wan22')
            
            if item_type == 'thumbnail':
                # Generate thumbnail
                result = {
                    "type": "thumbnail",
                    "status": "generated",
                    "platform": platform,
                    "itemId": f"thumb_{uuid.uuid4().hex[:8]}"
                }
            elif item_type == 'video':
                # Generate video
                result = {
                    "type": "video",
                    "status": "generated",
                    "platform": platform,
                    "itemId": f"video_{uuid.uuid4().hex[:8]}"
                }
            elif item_type == 'avatar':
                # Generate avatar
                result = {
                    "type": "avatar",
                    "status": "generated",
                    "platform": platform,
                    "itemId": f"avtr_{uuid.uuid4().hex[:8]}"
                }
            else:
                result = {
                    "type": item_type,
                    "status": "error",
                    "error": "Unsupported item type"
                }
                
            results.append(result)
        
        # Consume tokens for the entire batch
        if check_tokens and total_token_cost > 0:
            tokens = load_tokens()
            tokens["used_tokens"] += total_token_cost
            tokens["remaining_tokens"] -= total_token_cost
            
            # Add to history
            tokens["history"].append({
                "timestamp": datetime.now().isoformat(),
                "platform": "batch",
                "content_types": [item.get('type') for item in items],
                "quantity": len(items),
                "cost": total_token_cost,
                "operation": "consume"
            })
            
            save_tokens(tokens)
        
        batch_response = {
            "batchId": batch_id,
            "items": results,
            "totalTokenCost": total_token_cost,
            "consumedTokens": total_token_cost if check_tokens and total_token_cost > 0 else 0,
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }
        
        # Save batch metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{batch_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(batch_response, f, indent=2)
            
        return jsonify(batch_response), 200
        
    except Exception as e:
        logger.error(f"Error in batch generation: {str(e)}")
        return jsonify({"error": f"Failed to generate batch: {str(e)}"}), 500

if __name__ == '__main__':
    # Check platform availability on startup
    check_platform_availability()
    app.run(host='0.0.0.0', port=5008, debug=True)
