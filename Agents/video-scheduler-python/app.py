from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime, timedelta
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
SCHEDULES_DIR = os.path.join(DATA_DIR, 'schedules')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SCHEDULES_DIR, exist_ok=True)

# Supported platforms
SUPPORTED_PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'linkedin']

# Default schedule settings
DEFAULT_SCHEDULE_SETTINGS = {
    'frequency': 'daily',
    'time': '12:00',
    'timezone': 'UTC',
    'active': True
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Video Scheduler Python Agent"}), 200

@app.route('/create-schedule', methods=['POST'])
def create_schedule():
    """Create a new video schedule"""
    try:
        data = request.get_json()
        platform = data.get('platform')
        video_content = data.get('videoContent', {})
        schedule_settings = data.get('scheduleSettings', DEFAULT_SCHEDULE_SETTINGS)

        if not platform or platform not in SUPPORTED_PLATFORMS:
            return jsonify({"error": f"Valid platform is required. Supported platforms: {SUPPORTED_PLATFORMS}"}), 400

        logger.info(f"Creating schedule for platform: {platform}")

        # Create schedule
        schedule_id = str(uuid.uuid4())
        schedule = {
            'id': schedule_id,
            'platform': platform,
            'videoContent': video_content,
            'scheduleSettings': schedule_settings,
            'status': 'active',
            'nextRun': calculate_next_run(schedule_settings),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        # Save schedule
        save_schedule(schedule)

        logger.info(f"Schedule created: {schedule_id}")
        return jsonify({
            "message": "Schedule created successfully",
            "scheduleId": schedule_id,
            "schedule": schedule
        }), 201
    except Exception as e:
        logger.error(f"Error creating schedule: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/update-schedule/<schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """Update an existing schedule"""
    try:
        data = request.get_json()
        schedule = load_schedule(schedule_id)
        if not schedule:
            return jsonify({"error": "Schedule not found"}), 404

        # Update schedule fields
        if 'platform' in data and data['platform'] in SUPPORTED_PLATFORMS:
            schedule['platform'] = data['platform']
        if 'videoContent' in data:
            schedule['videoContent'] = data['videoContent']
        if 'scheduleSettings' in data:
            schedule['scheduleSettings'] = data['scheduleSettings']
            schedule['nextRun'] = calculate_next_run(data['scheduleSettings'])
        if 'status' in data:
            schedule['status'] = data['status']

        schedule['updatedAt'] = datetime.now().isoformat()

        # Save updated schedule
        save_schedule(schedule)

        logger.info(f"Schedule updated: {schedule_id}")
        return jsonify({
            "message": "Schedule updated successfully",
            "schedule": schedule
        }), 200
    except Exception as e:
        logger.error(f"Error updating schedule: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-schedule/<schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    """Get a schedule by ID"""
    try:
        schedule = load_schedule(schedule_id)
        if not schedule:
            return jsonify({"error": "Schedule not found"}), 404

        logger.info(f"Schedule retrieved: {schedule_id}")
        return jsonify({
            "message": "Schedule retrieved successfully",
            "schedule": schedule
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving schedule: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-schedules', methods=['GET'])
def list_schedules():
    """List all schedules"""
    try:
        schedules = load_all_schedules()

        logger.info(f"Retrieved {len(schedules)} schedules")
        return jsonify({
            "message": "Schedules retrieved successfully",
            "schedules": schedules
        }), 200
    except Exception as e:
        logger.error(f"Error listing schedules: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-schedule/<schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete a schedule"""
    try:
        schedule_file = os.path.join(SCHEDULES_DIR, f"{schedule_id}.json")
        if not os.path.exists(schedule_file):
            return jsonify({"error": "Schedule not found"}), 404

        os.remove(schedule_file)

        logger.info(f"Schedule deleted: {schedule_id}")
        return jsonify({
            "message": "Schedule deleted successfully"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting schedule: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/trigger-schedule/<schedule_id>', methods=['POST'])
def trigger_schedule(schedule_id):
    """Manually trigger a schedule"""
    try:
        schedule = load_schedule(schedule_id)
        if not schedule:
            return jsonify({"error": "Schedule not found"}), 404

        if schedule['status'] != 'active':
            return jsonify({"error": "Schedule is not active"}), 400

        logger.info(f"Manually triggering schedule: {schedule_id}")

        # Trigger schedule (simplified)
        execution_id = str(uuid.uuid4())
        execution = {
            'id': execution_id,
            'scheduleId': schedule_id,
            'platform': schedule['platform'],
            'videoContent': schedule['videoContent'],
            'triggeredAt': datetime.now().isoformat(),
            'status': 'completed',
            'result': 'Video scheduled for posting'
        }

        # Update next run time
        schedule['nextRun'] = calculate_next_run(schedule['scheduleSettings'])
        schedule['updatedAt'] = datetime.now().isoformat()
        save_schedule(schedule)

        logger.info(f"Schedule triggered successfully: {schedule_id}")
        return jsonify({
            "message": "Schedule triggered successfully",
            "executionId": execution_id,
            "execution": execution
        }), 200
    except Exception as e:
        logger.error(f"Error triggering schedule: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-upcoming-schedules', methods=['GET'])
def get_upcoming_schedules():
    """Get upcoming schedules"""
    try:
        schedules = load_all_schedules()
        now = datetime.now()

        # Filter upcoming schedules
        upcoming_schedules = [
            schedule for schedule in schedules
            if schedule['status'] == 'active' and
               datetime.fromisoformat(schedule['nextRun'].replace('Z', '+00:00')) > now
        ]

        # Sort by next run time
        upcoming_schedules.sort(key=lambda x: x['nextRun'])

        logger.info(f"Retrieved {len(upcoming_schedules)} upcoming schedules")
        return jsonify({
            "message": "Upcoming schedules retrieved successfully",
            "schedules": upcoming_schedules
        }), 200
    except Exception as e:
        logger.error(f"Error getting upcoming schedules: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_next_run(schedule_settings):
    """Calculate next run time based on schedule settings"""
    frequency = schedule_settings.get('frequency', 'daily')
    time_str = schedule_settings.get('time', '12:00')
    timezone = schedule_settings.get('timezone', 'UTC')

    # Parse time
    hour, minute = map(int, time_str.split(':'))

    # Calculate next run
    now = datetime.now()
    if frequency == 'daily':
        next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if next_run <= now:
            next_run += timedelta(days=1)
    elif frequency == 'weekly':
        next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        # Add days to reach next week
        days_ahead = 7 - now.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        next_run += timedelta(days=days_ahead)
    elif frequency == 'monthly':
        next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        # Add months (simplified)
        if next_run.month == 12:
            next_run = next_run.replace(year=next_run.year + 1, month=1)
        else:
            next_run = next_run.replace(month=next_run.month + 1)
    else:
        # Default to daily
        next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if next_run <= now:
            next_run += timedelta(days=1)

    return next_run.isoformat() + 'Z'

def save_schedule(schedule):
    """Save schedule to file"""
    try:
        file_path = os.path.join(SCHEDULES_DIR, f"{schedule['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(schedule, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving schedule: {str(e)}")
        raise

def load_schedule(schedule_id):
    """Load schedule from file"""
    try:
        file_path = os.path.join(SCHEDULES_DIR, f"{schedule_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading schedule: {str(e)}")
        return None

def load_all_schedules():
    """Load all schedules from file"""
    schedules = []
    try:
        for filename in os.listdir(SCHEDULES_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(SCHEDULES_DIR, filename)
                with open(file_path, 'r') as f:
                    schedules.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading schedules: {str(e)}")
    return schedules

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)