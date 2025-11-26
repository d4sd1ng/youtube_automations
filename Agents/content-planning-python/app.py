from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
PLANS_DIR = os.path.join(DATA_DIR, 'plans')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PLANS_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Content Planning Python Agent"}), 200

@app.route('/create-content-plan', methods=['POST'])
def create_content_plan():
    """Create a content plan"""
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        duration_days = data.get('durationDays', 30)
        content_types = data.get('contentTypes', ['blog', 'video', 'social'])
        goals = data.get('goals', [])

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        logger.info(f"Creating content plan for topic: {topic}")

        # Create content plan
        plan_id = str(uuid.uuid4())

        # Generate content items (simplified)
        content_items = []
        for i in range(duration_days):
            date = (datetime.now() + timedelta(days=i)).isoformat()
            content_type = content_types[i % len(content_types)]

            content_item = {
                'id': str(uuid.uuid4()),
                'date': date,
                'type': content_type,
                'title': f"{topic} - Day {i+1}",
                'description': f"Content about {topic} for {content_type}",
                'status': 'planned',
                'createdAt': datetime.now().isoformat()
            }
            content_items.append(content_item)

        plan = {
            'id': plan_id,
            'topic': topic,
            'durationDays': duration_days,
            'contentTypes': content_types,
            'goals': goals,
            'contentItems': content_items,
            'status': 'active',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        # Save plan
        save_plan(plan)

        logger.info(f"Content plan created: {plan_id}")
        return jsonify({
            "message": "Content plan created successfully",
            "planId": plan_id,
            "plan": plan
        }), 201
    except Exception as e:
        logger.error(f"Error creating content plan: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/update-content-plan/<plan_id>', methods=['PUT'])
def update_content_plan(plan_id):
    """Update a content plan"""
    try:
        data = request.get_json()

        # Load plan
        plan = load_plan(plan_id)
        if not plan:
            return jsonify({"error": "Content plan not found"}), 404

        # Update plan fields
        if 'topic' in data:
            plan['topic'] = data['topic']
        if 'durationDays' in data:
            plan['durationDays'] = data['durationDays']
        if 'contentTypes' in data:
            plan['contentTypes'] = data['contentTypes']
        if 'goals' in data:
            plan['goals'] = data['goals']
        if 'status' in data:
            plan['status'] = data['status']

        plan['updatedAt'] = datetime.now().isoformat()

        # Save updated plan
        save_plan(plan)

        logger.info(f"Content plan updated: {plan_id}")
        return jsonify({
            "message": "Content plan updated successfully",
            "plan": plan
        }), 200
    except Exception as e:
        logger.error(f"Error updating content plan: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-content-plan/<plan_id>', methods=['GET'])
def get_content_plan(plan_id):
    """Get a content plan by ID"""
    try:
        plan = load_plan(plan_id)
        if not plan:
            return jsonify({"error": "Content plan not found"}), 404

        logger.info(f"Content plan retrieved: {plan_id}")
        return jsonify({
            "message": "Content plan retrieved successfully",
            "plan": plan
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving content plan: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-content-plans', methods=['GET'])
def list_content_plans():
    """List all content plans"""
    try:
        plans = load_all_plans()

        logger.info(f"Retrieved {len(plans)} content plans")
        return jsonify({
            "message": "Content plans retrieved successfully",
            "plans": plans
        }), 200
    except Exception as e:
        logger.error(f"Error listing content plans: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/schedule-content-item/<plan_id>', methods=['POST'])
def schedule_content_item(plan_id):
    """Schedule a content item"""
    try:
        data = request.get_json()
        content_item_id = data.get('contentItemId')

        # Load plan
        plan = load_plan(plan_id)
        if not plan:
            return jsonify({"error": "Content plan not found"}), 404

        # Find content item
        content_item = None
        for item in plan['contentItems']:
            if item['id'] == content_item_id:
                content_item = item
                break

        if not content_item:
            return jsonify({"error": "Content item not found"}), 404

        # Update content item status
        content_item['status'] = 'scheduled'
        content_item['scheduledAt'] = datetime.now().isoformat()
        plan['updatedAt'] = datetime.now().isoformat()

        # Save updated plan
        save_plan(plan)

        logger.info(f"Content item scheduled: {content_item_id}")
        return jsonify({
            "message": "Content item scheduled successfully",
            "contentItem": content_item
        }), 200
    except Exception as e:
        logger.error(f"Error scheduling content item: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_plan(plan):
    """Save plan to file"""
    try:
        file_path = os.path.join(PLANS_DIR, f"{plan['id']}_plan.json")
        with open(file_path, 'w') as f:
            json.dump(plan, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving plan: {str(e)}")
        raise

def load_plan(plan_id):
    """Load plan from file"""
    try:
        file_path = os.path.join(PLANS_DIR, f"{plan_id}_plan.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading plan: {str(e)}")
        return None

def load_all_plans():
    """Load all plans from file"""
    plans = []
    try:
        for filename in os.listdir(PLANS_DIR):
            if filename.endswith('_plan.json'):
                file_path = os.path.join(PLANS_DIR, filename)
                with open(file_path, 'r') as f:
                    plans.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading plans: {str(e)}")
    return plans

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)