from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
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

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Integration with other agents
HIGH_QUALITY_CONTENT_AGENT_URL = "http://localhost:5008"
VIDEO_PROCESSING_AGENT_URL = "http://localhost:5003"
AUDIO_PROCESSING_AGENT_URL = "http://localhost:5002"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "avatar-control-agent",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/control-avatar', methods=['POST'])
def control_avatar():
    """Control avatar behavior including speech and gestures"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        # Extract control parameters
        avatar_id = data.get('avatarId')
        use_avatar = data.get('useAvatar', True)
        speech_text = data.get('speechText', '')
        gestures = data.get('gestures', [])
        overlay_indicators = data.get('overlayIndicators', [])
        emotion = data.get('emotion', 'neutral')
        tone = data.get('tone', 'normal')
        speed = data.get('speed', 1.0)

        # Generate unique ID for this control session
        control_id = f"ctrl_{uuid.uuid4().hex[:8]}"

        # Process avatar control
        if use_avatar and avatar_id:
            control_action = {
                "controlId": control_id,
                "avatarId": avatar_id,
                "useAvatar": use_avatar,
                "speechText": speech_text,
                "gestures": gestures,
                "overlayIndicators": overlay_indicators,
                "emotion": emotion,
                "tone": tone,
                "speed": speed,
                "action": "avatar_speech_with_gestures",
                "status": "processed",
                "timestamp": datetime.now().isoformat()
            }

            # Integrate with high-quality content agent for avatar control
            try:
                avatar_control_payload = {
                    "avatarId": avatar_id,
                    "action": "execute_gestures",
                    "gestures": gestures,
                    "emotion": emotion,
                    "tone": tone
                }

                requests.post(
                    f"{HIGH_QUALITY_CONTENT_AGENT_URL}/execute-avatar-control",
                    json=avatar_control_payload,
                    timeout=10
                )
            except Exception as e:
                logger.warning(f"Failed to integrate with high-quality content agent: {str(e)}")
        else:
            # Speech without avatar
            control_action = {
                "controlId": control_id,
                "useAvatar": use_avatar,
                "speechText": speech_text,
                "emotion": emotion,
                "tone": tone,
                "speed": speed,
                "action": "audio_only_speech",
                "status": "processed",
                "timestamp": datetime.now().isoformat()
            }

        # Save control metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{control_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(control_action, f, indent=2)

        return jsonify(control_action), 200

    except Exception as e:
        logger.error(f"Error controlling avatar: {str(e)}")
        return jsonify({"error": f"Failed to control avatar: {str(e)}"}), 500

@app.route('/create-gesture-sequence', methods=['POST'])
def create_gesture_sequence():
    """Create a sequence of gestures for avatar performance"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        # Extract gesture sequence parameters
        avatar_id = data.get('avatarId')
        gesture_sequence = data.get('gestureSequence', [])
        timing = data.get('timing', [])
        transitions = data.get('transitions', [])

        # Generate unique ID for this gesture sequence
        sequence_id = f"seq_{uuid.uuid4().hex[:8]}"

        # Create gesture sequence
        gesture_action = {
            "sequenceId": sequence_id,
            "avatarId": avatar_id,
            "gestureSequence": gesture_sequence,
            "timing": timing,
            "transitions": transitions,
            "action": "gesture_sequence_creation",
            "status": "created",
            "timestamp": datetime.now().isoformat()
        }

        # Save gesture sequence metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{sequence_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(gesture_action, f, indent=2)

        return jsonify(gesture_action), 200

    except Exception as e:
        logger.error(f"Error creating gesture sequence: {str(e)}")
        return jsonify({"error": f"Failed to create gesture sequence: {str(e)}"}), 500

@app.route('/overlay-control', methods=['POST'])
def overlay_control():
    """Control overlay elements and avatar reactions to them"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        # Extract overlay control parameters
        overlay_elements = data.get('overlayElements', [])
        avatar_reactions = data.get('avatarReactions', [])
        timing_controls = data.get('timingControls', [])

        # Generate unique ID for this overlay control
        control_id = f"ovl_{uuid.uuid4().hex[:8]}"

        # Create overlay control
        overlay_action = {
            "controlId": control_id,
            "overlayElements": overlay_elements,
            "avatarReactions": avatar_reactions,
            "timingControls": timing_controls,
            "action": "overlay_control",
            "status": "configured",
            "timestamp": datetime.now().isoformat()
        }

        # Save overlay control metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{control_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(overlay_action, f, indent=2)

        return jsonify(overlay_action), 200

    except Exception as e:
        logger.error(f"Error controlling overlays: {str(e)}")
        return jsonify({"error": f"Failed to control overlays: {str(e)}"}), 500

@app.route('/script-execution', methods=['POST'])
def script_execution():
    """Execute a complete script with avatar speech and gestures"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        # Extract script parameters
        script_content = data.get('scriptContent', '')
        avatar_id = data.get('avatarId')
        scenes = data.get('scenes', [])
        gestures_per_scene = data.get('gesturesPerScene', {})
        overlay_triggers = data.get('overlayTriggers', {})

        # Generate unique ID for this script execution
        script_id = f"scr_{uuid.uuid4().hex[:8]}"

        # Create script execution
        script_action = {
            "scriptId": script_id,
            "avatarId": avatar_id,
            "scriptContent": script_content,
            "scenes": scenes,
            "gesturesPerScene": gestures_per_scene,
            "overlayTriggers": overlay_triggers,
            "action": "script_execution",
            "status": "initiated",
            "timestamp": datetime.now().isoformat()
        }

        # Save script execution metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{script_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(script_action, f, indent=2)

        return jsonify(script_action), 200

    except Exception as e:
        logger.error(f"Error executing script: {str(e)}")
        return jsonify({"error": f"Failed to execute script: {str(e)}"}), 500

@app.route('/integrated-avatar-workflow', methods=['POST'])
def integrated_avatar_workflow():
    """Execute an integrated avatar workflow with all agents"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        # Extract workflow parameters
        workflow_name = data.get('workflowName', 'default_workflow')
        avatar_config = data.get('avatarConfig', {})
        script_content = data.get('scriptContent', '')
        scenes = data.get('scenes', [])
        gestures_per_scene = data.get('gesturesPerScene', {})
        overlay_triggers = data.get('overlayTriggers', {})
        audio_config = data.get('audioConfig', {})
        video_config = data.get('videoConfig', {})

        # Generate unique ID for this workflow
        workflow_id = f"wfl_{uuid.uuid4().hex[:8]}"

        # Step 1: Create avatar if not exists
        avatar_id = avatar_config.get('avatarId')
        if not avatar_id:
            # Create avatar using high-quality content agent
            try:
                avatar_payload = {
                    "character": avatar_config.get('character', 'politician'),
                    "style": avatar_config.get('style', 'professional'),
                    "theme": avatar_config.get('theme', 'ai_and_politics'),
                    "customization": avatar_config.get('customization', {}),
                    "voice_sample": avatar_config.get('voice_sample'),
                    "voice_tone": avatar_config.get('voice_tone', 'professional'),
                    "full_body": avatar_config.get('full_body', True),
                    "gesture_support": avatar_config.get('gesture_support', True),
                    "hand_animations": avatar_config.get('hand_animations', True),
                    "platform": "synthesia"
                }

                avatar_response = requests.post(
                    f"{HIGH_QUALITY_CONTENT_AGENT_URL}/generate-avatar",
                    json=avatar_payload,
                    timeout=60
                )

                if avatar_response.status_code == 200:
                    avatar_data = avatar_response.json()
                    avatar_id = avatar_data.get('avatarId')
                else:
                    return jsonify({
                        "error": "Failed to create avatar",
                        "details": avatar_response.text
                    }), 500
            except Exception as e:
                return jsonify({
                    "error": "Failed to communicate with high-quality content agent",
                    "details": str(e)
                }), 500

        # Step 2: Process audio if needed
        if audio_config.get('processAudio', False):
            try:
                audio_payload = {
                    "text": script_content,
                    "voiceId": audio_config.get('voiceId', 'default'),
                    "speed": audio_config.get('speed', 1.0),
                    "emotion": audio_config.get('emotion', 'neutral')
                }

                audio_response = requests.post(
                    f"{AUDIO_PROCESSING_AGENT_URL}/generate-speech",
                    json=audio_payload,
                    timeout=30
                )

                if audio_response.status_code != 200:
                    logger.warning(f"Audio processing failed: {audio_response.text}")
            except Exception as e:
                logger.warning(f"Failed to communicate with audio processing agent: {str(e)}")

        # Step 3: Process video if needed
        if video_config.get('processVideo', False):
            try:
                video_payload = {
                    "script": script_content,
                    "avatarId": avatar_id,
                    "resolution": video_config.get('resolution', '1080p'),
                    "duration": video_config.get('duration', 'auto')
                }

                video_response = requests.post(
                    f"{VIDEO_PROCESSING_AGENT_URL}/generate-video",
                    json=video_payload,
                    timeout=120
                )

                if video_response.status_code != 200:
                    logger.warning(f"Video processing failed: {video_response.text}")
            except Exception as e:
                logger.warning(f"Failed to communicate with video processing agent: {str(e)}")

        # Step 4: Execute script with avatar control
        script_execution_payload = {
            "scriptContent": script_content,
            "avatarId": avatar_id,
            "scenes": scenes,
            "gesturesPerScene": gestures_per_scene,
            "overlayTriggers": overlay_triggers
        }

        try:
            script_response = requests.post(
                f"{request.url_root.rstrip('/')}/script-execution",
                json=script_execution_payload,
                timeout=30
            )

            if script_response.status_code == 200:
                script_data = script_response.json()
                script_id = script_data.get('scriptId')
            else:
                logger.warning(f"Script execution failed: {script_response.text}")
        except Exception as e:
            logger.warning(f"Failed to execute script: {str(e)}")

        # Create integrated workflow
        workflow_action = {
            "workflowId": workflow_id,
            "workflowName": workflow_name,
            "avatarId": avatar_id,
            "scriptId": script_id if 'script_id' in locals() else None,
            "avatarConfig": avatar_config,
            "scriptContent": script_content,
            "scenes": scenes,
            "gesturesPerScene": gestures_per_scene,
            "overlayTriggers": overlay_triggers,
            "audioConfig": audio_config,
            "videoConfig": video_config,
            "action": "integrated_avatar_workflow",
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }

        # Save workflow metadata
        metadata_path = os.path.join(OUTPUTS_DIR, f"{workflow_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(workflow_action, f, indent=2)

        return jsonify(workflow_action), 200

    except Exception as e:
        logger.error(f"Error executing integrated workflow: {str(e)}")
        return jsonify({"error": f"Failed to execute integrated workflow: {str(e)}"}), 500

@app.route('/create-personal-avatar', methods=['POST'])
def create_personal_avatar():
    """Create personal avatar with voice using existing voice sample"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        # Extract avatar parameters
        character = data.get('character', 'politician')
        style = data.get('style', 'professional')
        theme = data.get('theme', 'ai_and_politics')
        customization = data.get('customization', {})

        # Voice parameters (using existing voice sample)
        voice_sample = data.get('voiceSample', 'user_voice_sample.wav')  # Default to existing sample
        voice_tone = data.get('voiceTone', 'professional')
        voice_speed = data.get('voiceSpeed', 1.0)
        language = data.get('language', 'de')

        # Gesture parameters
        full_body = data.get('fullBody', True)
        gesture_support = data.get('gestureSupport', True)
        hand_animations = data.get('handAnimations', True)
        body_language = data.get('bodyLanguage', 'professional')
        gestures = data.get('gestures', ['pointing', 'hand_gestures', 'natural_movement'])

        # Generate unique ID for this avatar
        avatar_id = f"avtr_{uuid.uuid4().hex[:8]}"

        # Create avatar using high-quality content agent
        try:
            avatar_payload = {
                "character": character,
                "style": style,
                "theme": theme,
                "customization": customization,
                "voice_sample": voice_sample,
                "voice_tone": voice_tone,
                "voice_speed": voice_speed,
                "language": language,
                "full_body": full_body,
                "gesture_support": gesture_support,
                "hand_animations": hand_animations,
                "body_language": body_language,
                "gestures": gestures,
                "platform": "synthesia",
                "checkTokens": True
            }

            avatar_response = requests.post(
                f"{HIGH_QUALITY_CONTENT_AGENT_URL}/generate-avatar",
                json=avatar_payload,
                timeout=120
            )

            if avatar_response.status_code == 200:
                avatar_data = avatar_response.json()
                avatar_id = avatar_data.get('avatarId')

                # Create personal avatar record
                personal_avatar = {
                    "avatarId": avatar_id,
                    "character": character,
                    "style": style,
                    "theme": theme,
                    "customization": customization,
                    "voiceSample": voice_sample,
                    "voiceTone": voice_tone,
                    "voiceSpeed": voice_speed,
                    "language": language,
                    "fullBody": full_body,
                    "gestureSupport": gesture_support,
                    "handAnimations": hand_animations,
                    "bodyLanguage": body_language,
                    "gestures": gestures,
                    "creationTimestamp": datetime.now().isoformat(),
                    "status": "created"
                }

                # Save personal avatar metadata
                metadata_path = os.path.join(OUTPUTS_DIR, f"{avatar_id}_personal_metadata.json")
                with open(metadata_path, 'w') as f:
                    json.dump(personal_avatar, f, indent=2)

                return jsonify({
                    "message": "Personal avatar creation initiated",
                    "avatarId": avatar_id,
                    "status": "training_started",
                    "estimatedTrainingTime": "30-60 minutes",
                    "tokenCost": avatar_data.get('tokenCost', 0),
                    "consumedTokens": avatar_data.get('consumedTokens', 0)
                }), 200
            else:
                return jsonify({
                    "error": "Failed to create avatar",
                    "details": avatar_response.text
                }), avatar_response.status_code
        except Exception as e:
            return jsonify({
                "error": "Failed to communicate with high-quality content agent",
                "details": str(e)
            }), 500

    except Exception as e:
        logger.error(f"Error creating personal avatar: {str(e)}")
        return jsonify({"error": f"Failed to create personal avatar: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5009, debug=True)