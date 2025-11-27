from flask import Flask, jsonify, request
import json
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({"status": "healthy", "service": "content-approval-agent"}), 200

# Review content
@app.route('/review-content', methods=['POST'])
def review_content():
    """Review content for approval"""
    try:
        data = request.get_json()

        # Validate input data
        if not data or 'content' not in data:
            return jsonify({"error": "Missing content in request"}), 400

        content = data['content']
        # In a real implementation, this would perform content review using AI models
        # For now, we'll return a sample response
        review_result = {
            "content_id": "cont_12345",
            "status": "approved",
            "review_timestamp": "2025-11-26T10:30:00Z",
            "reviewer": "AI Review System",
            "flags": [],
            "suggestions": [
                "Consider adding more details to the conclusion",
                "Check grammar in the second paragraph"
            ],
            "compliance": {
                "profanity_check": "passed",
                "copyright_check": "passed",
                "policy_compliance": "passed"
            }
        }

        logger.info("Content review completed")
        return jsonify({
            "message": "Content review successful",
            "result": review_result
        }), 200

    except Exception as e:
        logger.error(f"Error in content review: {str(e)}")
        return jsonify({"error": f"Content review failed: {str(e)}"}), 500

# Get review history
@app.route('/review-history', methods=['GET'])
def get_review_history():
    """Get content review history"""
    try:
        # In a real implementation, this would retrieve review history from a database
        # For now, we'll return sample data
        history = [
            {
                "content_id": "cont_12345",
                "status": "approved",
                "review_timestamp": "2025-11-26T10:30:00Z",
                "reviewer": "AI Review System"
            },
            {
                "content_id": "cont_67890",
                "status": "rejected",
                "review_timestamp": "2025-11-25T15:45:00Z",
                "reviewer": "AI Review System"
            }
        ]

        logger.info("Review history retrieved")
        return jsonify({
            "message": "Review history retrieved successfully",
            "history": history
        }), 200

    except Exception as e:
        logger.error(f"Error retrieving review history: {str(e)}")
        return jsonify({"error": f"Failed to retrieve review history: {str(e)}"}), 500

# Update approval policy
@app.route('/update-policy', methods=['POST'])
def update_policy():
    """Update content approval policy"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "Missing policy data in request"}), 400

        policy = data
        # In a real implementation, this would update the approval policy
        # For now, we'll return a sample response
        updated_policy = {
            "policy_id": "pol_12345",
            "updated_timestamp": "2025-11-26T10:30:00Z",
            "updated_by": "admin",
            "changes": policy
        }

        logger.info("Approval policy updated")
        return jsonify({
            "message": "Approval policy updated successfully",
            "policy": updated_policy
        }), 200

    except Exception as e:
        logger.error(f"Error updating approval policy: {str(e)}")
        return jsonify({"error": f"Failed to update approval policy: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)