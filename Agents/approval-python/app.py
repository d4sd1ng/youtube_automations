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
APPROVALS_DIR = os.path.join(DATA_DIR, 'approvals')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(APPROVALS_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Approval Python Agent"}), 200

@app.route('/submit-for-approval', methods=['POST'])
def submit_for_approval():
    """Submit content for approval"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_id = data.get('contentId', str(uuid.uuid4()))
        submitter = data.get('submitter', 'unknown')
        approvers = data.get('approvers', [])

        if not content:
            return jsonify({"error": "Content is required"}), 400

        logger.info(f"Submitting content for approval: {content_id}")

        # Create approval request
        approval_id = str(uuid.uuid4())
        approval = {
            'id': approval_id,
            'contentId': content_id,
            'content': content,
            'submitter': submitter,
            'approvers': approvers,
            'status': 'pending',
            'submittedAt': datetime.now().isoformat(),
            'approvedAt': None,
            'rejectedAt': None,
            'comments': []
        }

        # Save approval request
        save_approval(approval)

        logger.info(f"Content submitted for approval: {approval_id}")
        return jsonify({
            "message": "Content submitted for approval successfully",
            "approvalId": approval_id,
            "approval": approval
        }), 201
    except Exception as e:
        logger.error(f"Error submitting content for approval: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/approve/<approval_id>', methods=['POST'])
def approve_content(approval_id):
    """Approve content"""
    try:
        data = request.get_json()
        approver = data.get('approver', 'unknown')
        comments = data.get('comments', '')

        # Load approval request
        approval = load_approval(approval_id)
        if not approval:
            return jsonify({"error": "Approval request not found"}), 404

        if approval['status'] != 'pending':
            return jsonify({"error": "Approval request is not pending"}), 400

        # Update approval status
        approval['status'] = 'approved'
        approval['approvedAt'] = datetime.now().isoformat()
        if comments:
            approval['comments'].append({
                'approver': approver,
                'comment': comments,
                'timestamp': datetime.now().isoformat()
            })

        # Save updated approval request
        save_approval(approval)

        logger.info(f"Content approved: {approval_id}")
        return jsonify({
            "message": "Content approved successfully",
            "approval": approval
        }), 200
    except Exception as e:
        logger.error(f"Error approving content: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reject/<approval_id>', methods=['POST'])
def reject_content(approval_id):
    """Reject content"""
    try:
        data = request.get_json()
        approver = data.get('approver', 'unknown')
        comments = data.get('comments', '')

        # Load approval request
        approval = load_approval(approval_id)
        if not approval:
            return jsonify({"error": "Approval request not found"}), 404

        if approval['status'] != 'pending':
            return jsonify({"error": "Approval request is not pending"}), 400

        # Update approval status
        approval['status'] = 'rejected'
        approval['rejectedAt'] = datetime.now().isoformat()
        if comments:
            approval['comments'].append({
                'approver': approver,
                'comment': comments,
                'timestamp': datetime.now().isoformat()
            })

        # Save updated approval request
        save_approval(approval)

        logger.info(f"Content rejected: {approval_id}")
        return jsonify({
            "message": "Content rejected successfully",
            "approval": approval
        }), 200
    except Exception as e:
        logger.error(f"Error rejecting content: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-approval/<approval_id>', methods=['GET'])
def get_approval(approval_id):
    """Get approval by ID"""
    try:
        approval = load_approval(approval_id)
        if not approval:
            return jsonify({"error": "Approval request not found"}), 404

        logger.info(f"Approval retrieved: {approval_id}")
        return jsonify({
            "message": "Approval retrieved successfully",
            "approval": approval
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving approval: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-approvals', methods=['GET'])
def list_approvals():
    """List all approvals"""
    try:
        approvals = load_all_approvals()

        logger.info(f"Retrieved {len(approvals)} approvals")
        return jsonify({
            "message": "Approvals retrieved successfully",
            "approvals": approvals
        }), 200
    except Exception as e:
        logger.error(f"Error listing approvals: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_approval(approval):
    """Save approval to file"""
    try:
        file_path = os.path.join(APPROVALS_DIR, f"{approval['id']}_approval.json")
        with open(file_path, 'w') as f:
            json.dump(approval, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving approval: {str(e)}")
        raise

def load_approval(approval_id):
    """Load approval from file"""
    try:
        file_path = os.path.join(APPROVALS_DIR, f"{approval_id}_approval.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading approval: {str(e)}")
        return None

def load_all_approvals():
    """Load all approvals from file"""
    approvals = []
    try:
        for filename in os.listdir(APPROVALS_DIR):
            if filename.endswith('_approval.json'):
                file_path = os.path.join(APPROVALS_DIR, filename)
                with open(file_path, 'r') as f:
                    approvals.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading approvals: {str(e)}")
    return approvals

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)