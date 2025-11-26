from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import re
import asyncio
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/seo')
TEMPLATES_DIR = os.path.join(BASE_DIR, '../../data/seo-templates')
JOBS_DIR = os.path.join(BASE_DIR, '../../data/seo-jobs')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)

# SEO optimization types
OPTIMIZATION_TYPES = {
    'channel-description': {'name': 'Kanalbeschreibung', 'focus': 'Kanal-SEO'},
    'video-description': {'name': 'Video-Beschreibung', 'focus': 'Video-SEO'},
    'tags': {'name': 'Tags', 'focus': 'Keyword-Optimierung'},
    'title': {'name': 'Titel', 'focus': 'Click-Through-Rate'},
    'thumbnail': {'name': 'Thumbnail', 'focus': 'Sichtbarkeit'}
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "SEO Optimization Python Agent",
        "version": "1.0.0"
    }), 200

@app.route('/execute-task', methods=['POST'])
def execute_task():
    """Execute SEO optimization task"""
    try:
        task_data = request.get_json()
        task_type = task_data.get('type')
        task_payload = task_data.get('payload', {})

        if not task_type:
            return jsonify({"error": "Task type is required"}), 400

        logger.info(f"Executing SEO optimization task: {task_type}")

        # Generate task ID
        task_id = str(uuid.uuid4())

        # Save job data
        job_data = {
            'id': task_id,
            'type': task_type,
            'payload': task_payload,
            'status': 'processing',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        save_job(job_data)

        # Process task based on type
        result = None
        if task_type == 'optimize-channel':
            result = optimize_channel(task_payload)
        elif task_type == 'optimize-video':
            result = optimize_video(task_payload)
        elif task_type == 'generate-tags':
            result = generate_tags(task_payload)
        elif task_type == 'optimize-title':
            result = optimize_title(task_payload)
        elif task_type == 'analyze-competitors':
            result = analyze_competitors(task_payload)
        else:
            job_data['status'] = 'failed'
            job_data['error'] = f'Unsupported task type: {task_type}'
            job_data['updatedAt'] = datetime.now().isoformat()
            save_job(job_data)
            return jsonify({"error": f"Unsupported task type: {task_type}"}), 400

        # Update job with result
        job_data['status'] = 'completed'
        job_data['result'] = result
        job_data['updatedAt'] = datetime.now().isoformat()
        save_job(job_data)

        # Save optimization data
        if result and 'optimization' in result:
            save_optimization(result['optimization'])

        logger.info(f"SEO optimization task completed: {task_id}")

        return jsonify({
            "message": "SEO optimization task completed successfully",
            "taskId": task_id,
            "result": result
        }), 200
    except Exception as e:
        logger.error(f"Error in SEO optimization task: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-optimizations', methods=['GET'])
def list_optimizations():
    """List all optimizations"""
    try:
        optimizations = []
        if os.path.exists(DATA_DIR):
            for file in os.listdir(DATA_DIR):
                if file.endswith('.json'):
                    with open(os.path.join(DATA_DIR, file), 'r') as f:
                        optimization_data = json.load(f)
                        optimizations.append(optimization_data)

        return jsonify({
            "message": "Optimizations retrieved successfully",
            "optimizations": optimizations
        }), 200
    except Exception as e:
        logger.error(f"Error listing optimizations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-optimization/<optimization_id>', methods=['GET'])
def get_optimization(optimization_id):
    """Get optimization by ID"""
    try:
        optimization_path = os.path.join(DATA_DIR, f"{optimization_id}.json")
        if os.path.exists(optimization_path):
            with open(optimization_path, 'r') as f:
                optimization_data = json.load(f)
            return jsonify({
                "message": "Optimization retrieved successfully",
                "optimization": optimization_data
            }), 200
        else:
            return jsonify({"error": "Optimization not found"}), 404
    except Exception as e:
        logger.error(f"Error getting optimization {optimization_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-optimization/<optimization_id>', methods=['DELETE'])
def delete_optimization(optimization_id):
    """Delete optimization by ID"""
    try:
        optimization_path = os.path.join(DATA_DIR, f"{optimization_id}.json")
        if os.path.exists(optimization_path):
            os.remove(optimization_path)
            return jsonify({
                "message": "Optimization deleted successfully"
            }), 200
        else:
            return jsonify({"error": "Optimization not found"}), 404
    except Exception as e:
        logger.error(f"Error deleting optimization {optimization_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-job-status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status"""
    try:
        job_path = os.path.join(JOBS_DIR, f"{job_id}.json")
        if os.path.exists(job_path):
            with open(job_path, 'r') as f:
                job_data = json.load(f)
            return jsonify({
                "message": "Job status retrieved successfully",
                "job": job_data
            }), 200
        else:
            return jsonify({"error": "Job not found"}), 404
    except Exception as e:
        logger.error(f"Error getting job status {job_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-status', methods=['GET'])
def get_status():
    """Get agent status"""
    return jsonify({
        "agentName": "SEOOptimizationAgent",
        "version": "1.0.0",
        "isAvailable": True,
        "supportedTasks": [
            'optimize-channel',
            'optimize-video',
            'generate-tags',
            'optimize-title',
            'analyze-competitors',
            'list-optimizations',
            'get-optimization',
            'delete-optimization',
            'get-job-status'
        ]
    }), 200

def optimize_channel(payload):
    """Optimize channel for SEO"""
    channel_data = payload.get('channelData', {})
    config = payload.get('config', {})

    # Generate channel description
    description = generate_channel_description(channel_data, config)

    # Generate channel keywords
    keywords = generate_channel_keywords(channel_data, config)

    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'channel-description',
        'channelData': channel_data,
        'description': description,
        'keywords': keywords,
        'createdAt': datetime.now().isoformat()
    }

    return {
        'optimization': optimization,
        'description': description,
        'keywords': keywords
    }

def optimize_video(payload):
    """Optimize video for SEO"""
    video_data = payload.get('videoData', {})
    config = payload.get('config', {})
    video_type = payload.get('videoType', 'long-form')

    # Generate video description based on type
    if video_type == 'shorts':
        description = generate_shorts_video_description(video_data, config)
    else:
        description = generate_long_form_video_description(video_data, config)

    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'video-description',
        'videoData': video_data,
        'description': description,
        'videoType': video_type,
        'createdAt': datetime.now().isoformat()
    }

    return {
        'optimization': optimization,
        'description': description
    }

def generate_tags(payload):
    """Generate SEO tags"""
    topic = payload.get('topic', '')
    options = payload.get('options', {})

    # Perform comprehensive SEO analysis
    analysis = perform_comprehensive_seo_analysis(topic, options)

    # Extract keywords from analysis
    tags = analysis.get('allKeywords', [])[:15]  # Limit to 15 tags

    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'tags',
        'topic': topic,
        'tags': tags,
        'analysis': analysis,
        'createdAt': datetime.now().isoformat()
    }

    return {
        'optimization': optimization,
        'tags': tags,
        'analysis': analysis
    }

def optimize_title(payload):
    """Optimize title for SEO"""
    title_data = payload.get('titleData', {})
    config = payload.get('config', {})

    # For now, we'll just return the data as-is
    # In a real implementation, this would optimize the title

    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'title',
        'titleData': title_data,
        'createdAt': datetime.now().isoformat()
    }

    return {
        'optimization': optimization,
        'titleData': title_data
    }

def analyze_competitors(payload):
    """Analyze competitors for SEO"""
    topic = payload.get('topic', '')
    options = payload.get('options', {})

    # For now, we'll just return placeholder data
    # In a real implementation, this would analyze competitors

    analysis_result = {
        'competitorCount': 5,
        'topCompetitors': [
            {'name': 'Competitor 1', 'strength': 85},
            {'name': 'Competitor 2', 'strength': 78},
            {'name': 'Competitor 3', 'strength': 72}
        ],
        'marketOpportunity': 'High',
        'recommendedStrategy': 'Focus on long-tail keywords'
    }

    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'competitor-analysis',
        'topic': topic,
        'analysis': analysis_result,
        'createdAt': datetime.now().isoformat()
    }

    return {
        'optimization': optimization,
        'analysis': analysis_result
    }

def generate_channel_description(channel_data, config):
    """Generate SEO-optimized channel description"""
    channel_name = channel_data.get('name', 'Unsere Channel')
    channel_topic = channel_data.get('topic', 'verschiedene Themen')
    target_audience = channel_data.get('targetAudience', 'ein breites Publikum')

    description = f"Willkommen bei {channel_name}! Wir behandeln {channel_topic} für {target_audience}. "
    description += "Abonnieren Sie für regelmäßige Updates und wertvolle Inhalte. "
    description += "#SEO #YouTube #Content"

    return description

def generate_channel_keywords(channel_data, config):
    """Generate channel keywords"""
    topic = channel_data.get('topic', '')

    # Generate primary keywords
    primary_keywords = [
        topic,
        f"{topic} Anleitung",
        f"{topic} Tutorial",
        f"{topic} Erklärung",
        f"{topic} Guide"
    ]

    # Generate related keywords
    related_keywords = [
        f"Was ist {topic}",
        f"Wie funktioniert {topic}",
        f"{topic} Vorteile",
        f"{topic} Nachteile"
    ]

    # Combine and deduplicate
    all_keywords = list(set(primary_keywords + related_keywords))

    return {
        'primaryKeywords': primary_keywords,
        'relatedKeywords': related_keywords,
        'allKeywords': all_keywords
    }

def generate_long_form_video_description(video_data, config):
    """Generate long-form video description"""
    title = video_data.get('title', 'Unsere Inhalte')
    topic = video_data.get('topic', 'interessante Themen')

    description = f"In diesem Video behandeln wir {topic}. {title} - ein wichtiges Thema, "
    description += "das viele Menschen interessiert. Wenn Sie diesen Inhalt hilfreich finden, "
    description += "lassen Sie bitte ein Like da und abonnieren Sie unseren Kanal für weitere Videos.\n\n"
    description += "Inhaltsverzeichnis:\n"
    description += "00:00 - Einleitung\n"
    description += "02:30 - Hauptteil\n"
    description += "08:45 - Zusammenfassung\n\n"
    description += "Weitere Links:\n"
    description += "- Unsere Website: [Link]\n"
    description += "- Social Media: [Links]\n\n"
    description += "#SEO #YouTube #Video"

    return description

def generate_shorts_video_description(video_data, config):
    """Generate shorts video description"""
    title = video_data.get('title', 'Kurzvideo')
    topic = video_data.get('topic', 'spannende Inhalte')

    description = f"{title} - {topic} in Kurzform! "
    description += "Mehr davon auf unserem Kanal. #Shorts #YouTube"

    return description

def perform_comprehensive_seo_analysis(topic, options):
    """Perform comprehensive SEO analysis"""
    # Generate primary keywords
    primary_keywords = [
        topic,
        f"{topic} Anleitung",
        f"{topic} Tutorial",
        f"{topic} Erklärung",
        f"{topic} Guide"
    ]

    # Generate related keywords
    related_keywords = [
        f"Was ist {topic}",
        f"Wie funktioniert {topic}",
        f"{topic} Vorteile",
        f"{topic} Nachteile",
        f"{topic} Vergleich",
        f"{topic} Test",
        f"{topic} Bewertung",
        f"{topic} Erfahrungen",
        f"{topic} Tipps",
        f"{topic} Tricks"
    ]

    # Generate Long-Tail keywords
    long_tail_keywords = [
        f"Wie man {topic} richtig verwendet",
        f"{topic} für Anfänger erklärt",
        f"Beste {topic} im Jahr 2024",
        f"{topic} vs Alternativen",
        f"Kosten von {topic} verglichen"
    ]

    # Combine all keywords
    all_keywords = list(set(primary_keywords + related_keywords + long_tail_keywords))

    return {
        'success': True,
        'primaryKeywords': primary_keywords,
        'relatedKeywords': related_keywords,
        'longTailKeywords': long_tail_keywords,
        'allKeywords': all_keywords[:50],  # Limit to 50 keywords
        'metadata': {
            'generatedAt': datetime.now().isoformat(),
            'topic': topic,
            'keywordCount': len(all_keywords[:50])
        }
    }

def save_optimization(optimization):
    """Save optimization data"""
    try:
        optimization_path = os.path.join(DATA_DIR, f"{optimization['id']}.json")
        with open(optimization_path, 'w') as f:
            json.dump(optimization, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving optimization: {str(e)}")

def save_job(job):
    """Save job data"""
    try:
        job_path = os.path.join(JOBS_DIR, f"{job['id']}.json")
        with open(job_path, 'w') as f:
            json.dump(job, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving job: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)