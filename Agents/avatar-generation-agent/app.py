import os
import json
import uuid
import logging
import asyncio
import aiohttp
from datetime import datetime
from flask import Flask, jsonify, request
import boto3
from botocore.exceptions import NoCredentialsError

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/avatars')
MODELS_DIR = os.path.join(BASE_DIR, '../../data/avatar-models')
TEMP_DIR = os.path.join(BASE_DIR, '../../data/temp/avatar-processing')
OUTPUT_DIR = os.path.join(BASE_DIR, '../../data/avatar-output')
TEMPLATES_DIR = os.path.join(BASE_DIR, '../../data/templates')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Processing queue and workers
processing_queue = []
active_jobs = {}
max_concurrent_jobs = 2

# AWS S3 integration for cloud storage
s3_client = None
use_s3 = False
s3_bucket = None

# Try to initialize AWS S3 client
try:
    if os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY'):
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
            region_name=os.environ.get('AWS_REGION', 'eu-central-1')
        )
        use_s3 = True
        s3_bucket = os.environ.get('AWS_S3_BUCKET')
except Exception as e:
    logger.warning(f"AWS S3 initialization failed: {str(e)}")

# CDN configuration for fast delivery
cdn_base_url = os.environ.get('CDN_BASE_URL')

# Avatar types with detailed specifications
avatar_types = {
    'head_only': {
        'name': 'Kopf-Avatar',
        'description': 'Realistischer Avatar nur mit Kopf und Schultern',
        'estimatedTime': 120000,  # 2 minutes in ms
        'resolution': '1080x1080',
        'features': ['lip_sync', 'facial_expressions', 'head_movement'],
        'price': 49.99
    },
    'upper_body': {
        'name': 'Oberkörper-Avatar',
        'description': 'Avatar mit Kopf, Schultern und Oberkörper',
        'estimatedTime': 180000,  # 3 minutes in ms
        'resolution': '1920x1080',
        'features': ['lip_sync', 'facial_expressions', 'head_movement', 'hand_gestures', 'upper_body_movement'],
        'price': 79.99
    },
    'full_person': {
        'name': 'Vollkörperform-Avatar',
        'description': 'Vollständiger Avatar mit allen Bewegungsmöglichkeiten',
        'estimatedTime': 300000,  # 5 minutes in ms
        'resolution': '1920x1080',
        'features': ['lip_sync', 'facial_expressions', 'full_body_movement', 'hand_gestures', 'object_interaction'],
        'price': 129.99
    }
}

# Voice options for avatar speech
voice_options = {
    'de-DE': {
        'male': ['Hans', 'Stefan', 'Klaus'],
        'female': ['Anna', 'Julia', 'Sarah']
    },
    'en-US': {
        'male': ['John', 'Michael', 'David'],
        'female': ['Emma', 'Olivia', 'Sophia']
    }
}

# Model status tracking
model_status = {
    'lip_sync': 'available',
    'facial_expressions': 'available',
    'head_movement': 'available',
    'hand_gestures': 'available',
    'full_body_movement': 'available',
    'object_interaction': 'training'
}

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "Avatar Generation Agent",
        "version": "1.0.0"
    }), 200

# Create avatar endpoint
@app.route('/create-avatar', methods=['POST'])
def create_avatar():
    """Create a new AI-avatar with specified parameters"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing request data"}), 400

        avatar_type = data.get('type', 'head_only')
        name = data.get('name', 'Unbenannter Avatar')
        voice_settings = data.get('voiceSettings', {})
        appearance = data.get('appearance', {})
        user_id = data.get('userId', 'anonymous')

        # Validate avatar type
        if avatar_type not in avatar_types:
            return jsonify({"error": f"Invalid avatar type. Supported types: {list(avatar_types.keys())}"}), 400

        # Generate avatar ID
        avatar_id = f"avatar_{uuid.uuid4().hex[:12]}"

        # Create job
        job = {
            'id': avatar_id,
            'type': avatar_type,
            'name': name,
            'status': 'queued',
            'userId': user_id,
            'config': {
                'voiceSettings': voice_settings,
                'appearance': appearance,
                'templatePath': None
            },
            'progress': {
                'currentStage': 'initialization',
                'overallProgress': 0
            },
            'files': {
                'workspacePath': os.path.join(TEMP_DIR, avatar_id),
                'outputPath': os.path.join(OUTPUT_DIR, f"{avatar_id}.mp4"),
                'modelPath': os.path.join(MODELS_DIR, avatar_type)
            },
            'logs': [],
            'metadata': {
                'created': datetime.now().isoformat(),
                'estimatedDuration': avatar_types[avatar_type]['estimatedTime'],
                'templateUsed': False
            }
        }

        # Create workspace directory
        os.makedirs(job['files']['workspacePath'], exist_ok=True)

        # Add job to queue
        processing_queue.append(job)
        save_job(job)

        logger.info(f"Avatar creation job queued: {avatar_id}")

        # Start processing if we have capacity
        if len(active_jobs) < max_concurrent_jobs:
            asyncio.run(process_next_job())

        return jsonify({
            "message": "Avatar creation job started successfully",
            "avatarId": avatar_id,
            "estimatedTime": avatar_types[avatar_type]['estimatedTime'],
            "queuePosition": len(processing_queue)
        }), 201

    except Exception as e:
        logger.error(f"Error in avatar creation: {str(e)}")
        return jsonify({"error": f"Avatar creation failed: {str(e)}"}), 500

# Process avatar video endpoint
@app.route('/process-video', methods=['POST'])
def process_avatar_video():
    """Process avatar video with lip sync and background removal"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'avatarId' not in data:
            return jsonify({"error": "Missing avatarId in request"}), 400

        avatar_id = data['avatarId']
        text = data.get('text', '')
        audio_file = data.get('audioFile', '')
        output_path = data.get('outputPath', '')
        background_image = data.get('backgroundImage', '')

        # Generate job ID
        job_id = f"video_{uuid.uuid4().hex[:8]}"

        # Create video processing job
        job = {
            'id': job_id,
            'type': 'video_processing',
            'avatarId': avatar_id,
            'status': 'queued',
            'config': {
                'text': text,
                'audioFile': audio_file,
                'outputPath': output_path,
                'backgroundImage': background_image
            },
            'progress': {
                'currentStage': 'initialization',
                'overallProgress': 0
            },
            'logs': [],
            'metadata': {
                'created': datetime.now().isoformat(),
                'estimatedDuration': 8000  # 8 seconds
            }
        }

        # Add job to queue
        processing_queue.append(job)
        save_job(job)

        logger.info(f"Video processing job queued: {job_id}")

        # Start processing if we have capacity
        if len(active_jobs) < max_concurrent_jobs:
            asyncio.run(process_next_job())

        return jsonify({
            "message": "Video processing job started successfully",
            "jobId": job_id,
            "estimatedTime": 8000,
            "queuePosition": len(processing_queue)
        }), 201

    except Exception as e:
        logger.error(f"Error in video processing: {str(e)}")
        return jsonify({"error": f"Video processing failed: {str(e)}"}), 500

# Get job status endpoint
@app.route('/job-status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get status of avatar creation or processing job"""
    try:
        job_file = os.path.join(DATA_DIR, f"{job_id}.json")
        if os.path.exists(job_file):
            with open(job_file, 'r') as f:
                job = json.load(f)

            # Add template information to response
            if job.get('config', {}).get('templatePath'):
                job['templateInfo'] = {
                    'used': job['metadata'].get('templateUsed', False),
                    'path': job['config']['templatePath'],
                    'timeSaved': job['metadata'].get('templateUsed', False) and (
                        avatar_types[job['type']]['estimatedTime'] - job['metadata'].get('estimatedDuration', 0)
                    ) or 0
                }

            logger.info(f"Job status requested: {job_id}")
            return jsonify(job), 200
        else:
            return jsonify({"error": "Job not found"}), 404

    except Exception as e:
        logger.error(f"Error getting job status: {str(e)}")
        return jsonify({"error": f"Failed to get job status: {str(e)}"}), 500

# List jobs endpoint
@app.route('/list-jobs', methods=['GET'])
def list_jobs():
    """List all avatar creation jobs with optional filtering"""
    try:
        # Get filter parameters
        status_filter = request.args.get('status')
        type_filter = request.args.get('type')

        # Read all job files
        jobs = []
        for filename in os.listdir(DATA_DIR):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(DATA_DIR, filename), 'r') as f:
                        job = json.load(f)

                    # Apply filters
                    if status_filter and job.get('status') != status_filter:
                        continue
                    if type_filter and job.get('type') != type_filter:
                        continue

                    jobs.append(job)
                except Exception as e:
                    logger.warning(f"Failed to read job file {filename}: {str(e)}")

        # Sort by creation date (newest first)
        jobs.sort(key=lambda x: x['metadata']['created'], reverse=True)

        logger.info(f"Listed {len(jobs)} jobs")
        return jsonify({
            "jobs": jobs,
            "total": len(jobs)
        }), 200

    except Exception as e:
        logger.error(f"Error listing jobs: {str(e)}")
        return jsonify({"error": f"Failed to list jobs: {str(e)}"}), 500

# Get statistics endpoint
@app.route('/stats', methods=['GET'])
def get_stats():
    """Get avatar generation statistics"""
    try:
        # Read all job files
        all_jobs = []
        for filename in os.listdir(DATA_DIR):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(DATA_DIR, filename), 'r') as f:
                        job = json.load(f)
                        all_jobs.append(job)
                except Exception as e:
                    logger.warning(f"Failed to read job file {filename}: {str(e)}")

        # Calculate statistics
        stats = {
            'totalJobs': len(all_jobs),
            'activeJobs': len(active_jobs),
            'queueLength': len(processing_queue),
            'modelStatus': model_status,
            'jobsByStatus': {
                'queued': len([j for j in all_jobs if j.get('status') == 'queued']),
                'processing': len([j for j in all_jobs if j.get('status') == 'processing']),
                'completed': len([j for j in all_jobs if j.get('status') == 'completed']),
                'failed': len([j for j in all_jobs if j.get('status') == 'failed'])
            },
            'jobsByType': {
                'head_only': len([j for j in all_jobs if j.get('type') == 'head_only']),
                'upper_body': len([j for j in all_jobs if j.get('type') == 'upper_body']),
                'full_person': len([j for j in all_jobs if j.get('type') == 'full_person'])
            },
            'averageProcessingTime': calculate_average_processing_time(all_jobs),
            'supportedTypes': avatar_types,
            'supportedVoices': voice_options
        }

        logger.info("Statistics requested")
        return jsonify(stats), 200

    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({"error": f"Failed to get statistics: {str(e)}"}), 500

# Get available avatar types endpoint
@app.route('/avatar-types', methods=['GET'])
def get_avatar_types():
    """Get list of available avatar types"""
    try:
        logger.info("Avatar types requested")
        return jsonify(avatar_types), 200
    except Exception as e:
        logger.error(f"Error getting avatar types: {str(e)}")
        return jsonify({"error": f"Failed to get avatar types: {str(e)}"}), 500

# Get voice options endpoint
@app.route('/voice-options', methods=['GET'])
def get_voice_options():
    """Get available voice options"""
    try:
        logger.info("Voice options requested")
        return jsonify(voice_options), 200
    except Exception as e:
        logger.error(f"Error getting voice options: {str(e)}")
        return jsonify({"error": f"Failed to get voice options: {str(e)}"}), 500

# Get model status endpoint
@app.route('/model-status', methods=['GET'])
def get_model_status():
    """Get status of pre-trained models"""
    try:
        logger.info("Model status requested")
        return jsonify(model_status), 200
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        return jsonify({"error": f"Failed to get models status: {str(e)}"}), 500

# Download models endpoint
@app.route('/download-models', methods=['POST'])
def download_models():
    """Download missing pre-trained models"""
    try:
        data = request.get_json()

        if not data or 'models' not in data:
            return jsonify({"error": "Missing models list in request"}), 400

        models_to_download = data['models']
        priority = data.get('priority', 'normal')

        # Generate job ID
        job_id = f"download_{uuid.uuid4().hex[:8]}"

        # In a real implementation, this would start actual downloads
        # For now, we'll return a sample response
        download_response = {
            "jobId": job_id,
            "models": models_to_download,
            "priority": priority,
            "status": "started",
            "estimatedTime": f"{len(models_to_download) * 5}-10 Minuten",
            "timestamp": datetime.now().isoformat()
        }

        logger.info(f"Model download job started: {job_id}")
        return jsonify({
            "message": "Model download job started successfully",
            "jobId": job_id,
            "estimatedTime": download_response["estimatedTime"]
        }), 200

    except Exception as e:
        logger.error(f"Error starting model download: {str(e)}")
        return jsonify({"error": f"Failed to start model download: {str(e)}"}), 500

# Download status endpoint
@app.route('/download-status/<job_id>', methods=['GET'])
def get_download_status(job_id):
    """Get status of model download job"""
    try:
        # In a real implementation, this would check actual download progress
        # For now, we'll simulate progress
        import random

        # Simulate download completion
        progress = random.randint(80, 100)

        if progress >= 100:
            status = "completed"
            message = "All models downloaded successfully"
        else:
            status = "downloading"
            message = "Downloading pre-trained models"

        status_response = {
            "jobId": job_id,
            "status": status,
            "progress": progress,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }

        logger.info(f"Download status requested: {job_id} - {progress}%")
        return jsonify(status_response), 200

    except Exception as e:
        logger.error(f"Error getting download status: {str(e)}")
        return jsonify({"error": f"Failed to get download status: {str(e)}"}), 500

# Upload user data endpoint
@app.route('/upload-user-data', methods=['POST'])
def upload_user_data():
    """Upload user media data for avatar creation"""
    try:
        data = request.get_json()

        if not data or 'dataType' not in data:
            return jsonify({"error": "Missing dataType in request"}), 400

        data_type = data['dataType']
        files = data.get('files', [])
        user_id = data.get('userId', 'anonymous')

        # Generate session ID
        session_id = f"upload_{uuid.uuid4().hex[:8]}"

        # In a real implementation, this would handle actual file uploads
        # For now, we'll return a sample response
        upload_response = {
            "sessionId": session_id,
            "dataType": data_type,
            "files": files,
            "userId": user_id,
            "status": "upload_started",
            "expectedFiles": len(files),
            "timestamp": datetime.now().isoformat()
        }

        logger.info(f"User data upload session started: {session_id}")
        return jsonify({
            "message": "Upload session started successfully",
            "sessionId": session_id
        }), 201

    except Exception as e:
        logger.error(f"Error starting user data upload: {str(e)}")
        return jsonify({"error": f"Failed to start user data upload: {str(e)}"}), 500

# Confirm upload endpoint
@app.route('/confirm-upload', methods=['POST'])
def confirm_upload():
    """Confirm user data upload completion"""
    try:
        data = request.get_json()

        if not data or 'sessionId' not in data:
            return jsonify({"error": "Missing sessionId in request"}), 400

        session_id = data['sessionId']
        status = data.get('status', 'unknown')

        # In a real implementation, this would confirm actual file uploads
        # For now, we'll return a sample response
        confirm_response = {
            "sessionId": session_id,
            "status": status,
            "confirmedAt": datetime.now().isoformat()
        }

        logger.info(f"User data upload confirmed: {session_id} - {status}")
        return jsonify({
            "message": "Upload session confirmed successfully",
            "sessionId": session_id
        }), 200

    except Exception as e:
        logger.error(f"Error confirming user data upload: {str(e)}")
        return jsonify({"error": f"Failed to confirm user data upload: {str(e)}"}), 500

# Helper functions
def save_job(job):
    """Save job data to file"""
    try:
        job_file = os.path.join(DATA_DIR, f"{job['id']}.json")
        with open(job_file, 'w') as f:
            json.dump(job, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save job {job['id']}: {str(e)}")

def calculate_average_processing_time(jobs):
    """Calculate average processing time for completed jobs"""
    completed_jobs = [j for j in jobs if j.get('status') == 'completed' and 'metadata' in j and 'actualDuration' in j['metadata']]
    if not completed_jobs:
        return 0

    total_time = sum(j['metadata']['actualDuration'] for j in completed_jobs)
    return round(total_time / len(completed_jobs))

async def process_next_job():
    """Process the next job in the queue"""
    if not processing_queue or len(active_jobs) >= max_concurrent_jobs:
        return

    # Get next job from queue
    job = processing_queue.pop(0)
    job_id = job['id']

    # Mark as active
    active_jobs[job_id] = job
    job['status'] = 'processing'
    job['metadata']['started'] = datetime.now().isoformat()
    save_job(job)

    try:
        # Process based on job type
        if job['type'] in avatar_types:
            # Avatar creation job
            await process_avatar_creation(job)
        elif job['type'] == 'video_processing':
            # Video processing job
            await process_video_generation(job)

        # Mark as completed
        job['status'] = 'completed'
        job['metadata']['completed'] = datetime.now().isoformat()
        job['metadata']['actualDuration'] = (
            datetime.fromisoformat(job['metadata']['completed']) -
            datetime.fromisoformat(job['metadata']['started'])
        ).total_seconds() * 1000

    except Exception as e:
        # Mark as failed
        job['status'] = 'failed'
        job['error'] = str(e)
        job['metadata']['failed'] = datetime.now().isoformat()
        logger.error(f"Job {job_id} failed: {str(e)}")

    finally:
        # Save final job state and remove from active jobs
        save_job(job)
        del active_jobs[job_id]

        # Process next job if available
        if processing_queue:
            await process_next_job()

async def process_avatar_creation(job):
    """Process avatar creation job"""
    job_id = job['id']
    avatar_type = job['type']

    # Update progress
    job['progress']['currentStage'] = 'workspace_setup'
    job['progress']['overallProgress'] = 10
    save_job(job)

    # Simulate workspace setup
    await asyncio.sleep(2)

    # Update progress
    job['progress']['currentStage'] = 'model_loading'
    job['progress']['overallProgress'] = 30
    save_job(job)

    # Simulate model loading
    await asyncio.sleep(3)

    # Update progress
    job['progress']['currentStage'] = 'avatar_generation'
    job['progress']['overallProgress'] = 70
    save_job(job)

    # Simulate avatar generation
    estimated_time = avatar_types[avatar_type]['estimatedTime'] / 1000  # Convert to seconds
    await asyncio.sleep(min(estimated_time, 10))  # Cap at 10 seconds for demo

    # Update progress
    job['progress']['currentStage'] = 'finalizing'
    job['progress']['overallProgress'] = 90
    save_job(job)

    # Simulate finalizing
    await asyncio.sleep(1)

    # Complete
    job['progress']['currentStage'] = 'completed'
    job['progress']['overallProgress'] = 100
    job['result'] = {
        'avatarId': job_id,
        'type': avatar_type,
        'outputPath': job['files']['outputPath'],
        'duration': estimated_time * 1000,  # Convert back to ms
        'resolution': avatar_types[avatar_type]['resolution']
    }
    save_job(job)

async def process_video_generation(job):
    """Process video generation job"""
    job_id = job['id']

    # Update progress
    job['progress']['currentStage'] = 'loading_avatar'
    job['progress']['overallProgress'] = 10
    save_job(job)

    # Simulate loading avatar
    await asyncio.sleep(1)

    # Update progress
    job['progress']['currentStage'] = 'processing_audio'
    job['progress']['overallProgress'] = 30
    save_job(job)

    # Simulate audio processing
    await asyncio.sleep(2)

    # Update progress
    job['progress']['currentStage'] = 'lip_sync_generation'
    job['progress']['overallProgress'] = 60
    save_job(job)

    # Simulate lip sync generation
    await asyncio.sleep(3)

    # Update progress
    job['progress']['currentStage'] = 'background_processing'
    job['progress']['overallProgress'] = 80
    save_job(job)

    # Simulate background processing
    await asyncio.sleep(1)

    # Update progress
    job['progress']['currentStage'] = 'finalizing'
    job['progress']['overallProgress'] = 90
    save_job(job)

    # Simulate finalizing
    await asyncio.sleep(1)

    # Complete
    job['progress']['currentStage'] = 'completed'
    job['progress']['overallProgress'] = 100
    job['result'] = {
        'jobId': job_id,
        'outputPath': job['config'].get('outputPath', f"{job_id}_output.mp4"),
        'duration': 30000,  # 30 seconds
        'resolution': '1920x1080',
        'fileSize': '15.2 MB'
    }
    save_job(job)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)