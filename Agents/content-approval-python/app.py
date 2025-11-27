import os
import json
import uuid
from datetime import datetime
import logging
from flask import Flask, jsonify, request

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APPROVAL_DIR = os.path.join(BASE_DIR, '../../data/approvals')
PENDING_DIR = os.path.join(APPROVAL_DIR, 'pending')
APPROVED_DIR = os.path.join(APPROVAL_DIR, 'approved')
REJECTED_DIR = os.path.join(APPROVAL_DIR, 'rejected')

# Create directories if they don't exist
os.makedirs(APPROVAL_DIR, exist_ok=True)
os.makedirs(PENDING_DIR, exist_ok=True)
os.makedirs(APPROVED_DIR, exist_ok=True)
os.makedirs(REJECTED_DIR, exist_ok=True)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "Content Approval Agent",
        "version": "1.0.0"
    }), 200

# Submit content for approval
@app.route('/submit-for-approval', methods=['POST'])
def submit_for_approval():
    """Submit content for approval"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'content' not in data:
            return jsonify({"error": "Missing content in request"}), 400

        content = data['content']
        submitter = data.get('submitter', 'Unknown')
        priority = data.get('priority', 'normal')

        # Generate approval ID
        approval_id = f"approval-{uuid.uuid4().hex[:12]}"

        # Create approval record
        approval_record = {
            'approvalId': approval_id,
            'content': content,
            'submitter': submitter,
            'priority': priority,
            'status': 'pending',
            'submittedAt': datetime.now().isoformat(),
            'reviewNotes': []
        }

        # Save to pending directory
        pending_file_path = os.path.join(PENDING_DIR, f"{approval_id}.json")
        with open(pending_file_path, 'w') as f:
            json.dump(approval_record, f, indent=2)

        logger.info(f"Content submitted for approval: {approval_id}")

        return jsonify({
            "message": "Content submitted for approval successfully",
            "approvalId": approval_id,
            "status": "pending"
        }), 201

    except Exception as e:
        logger.error(f"Error submitting content for approval: {str(e)}")
        return jsonify({"error": f"Failed to submit content for approval: {str(e)}"}), 500

# Approve content
@app.route('/approve-content', methods=['POST'])
def approve_content():
    """Approve content"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'approvalId' not in data:
            return jsonify({"error": "Missing approvalId in request"}), 400

        approval_id = data['approvalId']
        reviewer = data.get('reviewer', 'Unknown')
        review_notes = data.get('reviewNotes', [])

        # Check if approval exists in pending directory
        pending_file_path = os.path.join(PENDING_DIR, f"{approval_id}.json")
        if not os.path.exists(pending_file_path):
            return jsonify({"error": f"Approval {approval_id} not found in pending"}), 404

        # Load approval record
        with open(pending_file_path, 'r') as f:
            approval_record = json.load(f)

        # Update approval record
        approval_record['status'] = 'approved'
        approval_record['reviewer'] = reviewer
        approval_record['reviewNotes'].extend(review_notes)
        approval_record['reviewedAt'] = datetime.now().isoformat()

        # Move from pending to approved directory
        os.remove(pending_file_path)
        approved_file_path = os.path.join(APPROVED_DIR, f"{approval_id}.json")
        with open(approved_file_path, 'w') as f:
            json.dump(approval_record, f, indent=2)

        logger.info(f"Content approved: {approval_id}")

        return jsonify({
            "message": "Content approved successfully",
            "approvalId": approval_id,
            "status": "approved"
        }), 200

    except Exception as e:
        logger.error(f"Error approving content: {str(e)}")
        return jsonify({"error": f"Failed to approve content: {str(e)}"}), 500

# Reject content
@app.route('/reject-content', methods=['POST'])
def reject_content():
    """Reject content"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'approvalId' not in data:
            return jsonify({"error": "Missing approvalId in request"}), 400

        approval_id = data['approvalId']
        reviewer = data.get('reviewer', 'Unknown')
        review_notes = data.get('reviewNotes', [])

        # Check if approval exists in pending directory
        pending_file_path = os.path.join(PENDING_DIR, f"{approval_id}.json")
        if not os.path.exists(pending_file_path):
            return jsonify({"error": f"Approval {approval_id} not found in pending"}), 404

        # Load approval record
        with open(pending_file_path, 'r') as f:
            approval_record = json.load(f)

        # Update approval record
        approval_record['status'] = 'rejected'
        approval_record['reviewer'] = reviewer
        approval_record['reviewNotes'].extend(review_notes)
        approval_record['reviewedAt'] = datetime.now().isoformat()

        # Move from pending to rejected directory
        os.remove(pending_file_path)
        rejected_file_path = os.path.join(REJECTED_DIR, f"{approval_id}.json")
        with open(rejected_file_path, 'w') as f:
            json.dump(approval_record, f, indent=2)

        logger.info(f"Content rejected: {approval_id}")

        return jsonify({
            "message": "Content rejected successfully",
            "approvalId": approval_id,
            "status": "rejected"
        }), 200

    except Exception as e:
        logger.error(f"Error rejecting content: {str(e)}")
        return jsonify({"error": f"Failed to reject content: {str(e)}"}), 500

# Get approval status
@app.route('/approval-status/<approval_id>', methods=['GET'])
def get_approval_status(approval_id):
    """Get approval status"""
    try:
        # Check in all directories
        approval_path = None
        approval_record = None

        # Check pending
        pending_path = os.path.join(PENDING_DIR, f"{approval_id}.json")
        if os.path.exists(pending_path):
            approval_path = pending_path

        # Check approved
        approved_path = os.path.join(APPROVED_DIR, f"{approval_id}.json")
        if os.path.exists(approved_path):
            approval_path = approved_path

        # Check rejected
        rejected_path = os.path.join(REJECTED_DIR, f"{approval_id}.json")
        if os.path.exists(rejected_path):
            approval_path = rejected_path

        if approval_path:
            with open(approval_path, 'r') as f:
                approval_record = json.load(f)

            logger.info(f"Approval status retrieved: {approval_id}")

            return jsonify({
                "message": "Approval status retrieved successfully",
                "approval": approval_record
            }), 200
        else:
            return jsonify({"error": f"Approval {approval_id} not found"}), 404

    except Exception as e:
        logger.error(f"Error getting approval status: {str(e)}")
        return jsonify({"error": f"Failed to get approval status: {str(e)}"}), 500

# List pending approvals
@app.route('/pending-approvals', methods=['GET'])
def list_pending_approvals():
    """List pending approvals"""
    try:
        pending_approvals = []

        if os.path.exists(PENDING_DIR):
            for filename in os.listdir(PENDING_DIR):
                if filename.endswith('.json'):
                    file_path = os.path.join(PENDING_DIR, filename)
                    try:
                        with open(file_path, 'r') as f:
                            approval_data = json.load(f)
                            pending_approvals.append({
                                'approvalId': approval_data['approvalId'],
                                'status': approval_data['status'],
                                'submittedAt': approval_data['submittedAt'],
                                'contentPreview': approval_data.get('content', {}).get('title') or
                                                 approval_data.get('content', {}).get('topic') or
                                                 'Untitled',
                                'submitter': approval_data.get('submitter', 'Unknown'),
                                'priority': approval_data.get('priority', 'normal')
                            })
                    except Exception as e:
                        logger.warning(f"Failed to read pending approval file {filename}: {str(e)}")

        # Sort by submission date (newest first)
        pending_approvals.sort(key=lambda x: x['submittedAt'], reverse=True)

        logger.info(f"Listed {len(pending_approvals)} pending approvals")

        return jsonify({
            "message": "Pending approvals retrieved successfully",
            "approvals": pending_approvals,
            "total": len(pending_approvals)
        }), 200

    except Exception as e:
        logger.error(f"Error listing pending approvals: {str(e)}")
        return jsonify({"error": f"Failed to list pending approvals: {str(e)}"}), 500

# List approved content
@app.route('/approved-content', methods=['GET'])
def list_approved_content():
    """List approved content"""
    try:
        approved_content = []

        if os.path.exists(APPROVED_DIR):
            for filename in os.listdir(APPROVED_DIR):
                if filename.endswith('.json'):
                    file_path = os.path.join(APPROVED_DIR, filename)
                    try:
                        with open(file_path, 'r') as f:
                            approval_data = json.load(f)
                            approved_content.append({
                                'approvalId': approval_data['approvalId'],
                                'status': approval_data['status'],
                                'submittedAt': approval_data['submittedAt'],
                                'reviewedAt': approval_data.get('reviewedAt'),
                                'reviewNotes': approval_data.get('reviewNotes', []),
                                'contentPreview': approval_data.get('content', {}).get('title') or
                                                 approval_data.get('content', {}).get('topic') or
                                                 'Untitled',
                                'reviewer': approval_data.get('reviewer', 'Unknown')
                            })
                    except Exception as e:
                        logger.warning(f"Failed to read approved content file {filename}: {str(e)}")

        # Sort by review date (newest first)
        approved_content.sort(key=lambda x: x['reviewedAt'] or x['submittedAt'], reverse=True)

        logger.info(f"Listed {len(approved_content)} approved content items")

        return jsonify({
            "message": "Approved content retrieved successfully",
            "content": approved_content,
            "total": len(approved_content)
        }), 200

    except Exception as e:
        logger.error(f"Error listing approved content: {str(e)}")
        return jsonify({"error": f"Failed to list approved content: {str(e)}"}), 500

# List rejected content
@app.route('/rejected-content', methods=['GET'])
def list_rejected_content():
    """List rejected content"""
    try:
        rejected_content = []

        if os.path.exists(REJECTED_DIR):
            for filename in os.listdir(REJECTED_DIR):
                if filename.endswith('.json'):
                    file_path = os.path.join(REJECTED_DIR, filename)
                    try:
                        with open(file_path, 'r') as f:
                            approval_data = json.load(f)
                            rejected_content.append({
                                'approvalId': approval_data['approvalId'],
                                'status': approval_data['status'],
                                'submittedAt': approval_data['submittedAt'],
                                'reviewedAt': approval_data.get('reviewedAt'),
                                'reviewNotes': approval_data.get('reviewNotes', []),
                                'contentPreview': approval_data.get('content', {}).get('title') or
                                                 approval_data.get('content', {}).get('topic') or
                                                 'Untitled',
                                'reviewer': approval_data.get('reviewer', 'Unknown')
                            })
                    except Exception as e:
                        logger.warning(f"Failed to read rejected content file {filename}: {str(e)}")

        # Sort by review date (newest first)
        rejected_content.sort(key=lambda x: x['reviewedAt'] or x['submittedAt'], reverse=True)

        logger.info(f"Listed {len(rejected_content)} rejected content items")

        return jsonify({
            "message": "Rejected content retrieved successfully",
            "content": rejected_content,
            "total": len(rejected_content)
        }), 200

    except Exception as e:
        logger.error(f"Error listing rejected content: {str(e)}")
        return jsonify({"error": f"Failed to list rejected content: {str(e)}"}), 500

# Get agent status
@app.route('/agent-status', methods=['GET'])
def get_agent_status():
    """Get agent status"""
    try:
        # Count items in each directory
        pending_count = len([f for f in os.listdir(PENDING_DIR) if f.endswith('.json')]) if os.path.exists(PENDING_DIR) else 0
        approved_count = len([f for f in os.listdir(APPROVED_DIR) if f.endswith('.json')]) if os.path.exists(APPROVED_DIR) else 0
        rejected_count = len([f for f in os.listdir(REJECTED_DIR) if f.endswith('.json')]) if os.path.exists(REJECTED_DIR) else 0

        status = {
            "agentName": "ContentApprovalAgent",
            "version": "1.0.0",
            "isAvailable": True,
            "supportedTasks": [
                'submit-for-approval',
                'approve-content',
                'reject-content',
                'get-approval-status',
                'list-pending-approvals',
                'list-approved-content',
                'list-rejected-content'
            ],
            "statistics": {
                "pendingApprovals": pending_count,
                "approvedContent": approved_count,
                "rejectedContent": rejected_count,
                "totalProcessed": approved_count + rejected_count
            }
        }

        logger.info("Agent status requested")

        return jsonify(status), 200

    except Exception as e:
        logger.error(f"Error getting agent status: {str(e)}")
        return jsonify({"error": f"Failed to get agent status: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)