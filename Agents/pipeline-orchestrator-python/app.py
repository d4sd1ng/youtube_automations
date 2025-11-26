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
PIPELINES_DIR = os.path.join(DATA_DIR, 'pipelines')
EXECUTIONS_DIR = os.path.join(DATA_DIR, 'executions')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PIPELINES_DIR, exist_ok=True)
os.makedirs(EXECUTIONS_DIR, exist_ok=True)

# Pipeline statuses
PIPELINE_STATUSES = ['active', 'inactive', 'paused', 'completed', 'failed']

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Pipeline Orchestrator Python Agent"}), 200

@app.route('/create-pipeline', methods=['POST'])
def create_pipeline():
    """Create a new pipeline"""
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        steps = data.get('steps', [])
        schedule = data.get('schedule', {})

        if not name or not steps:
            return jsonify({"error": "Name and steps are required"}), 400

        logger.info(f"Creating pipeline: {name}")

        # Create pipeline
        pipeline_id = str(uuid.uuid4())
        pipeline = {
            'id': pipeline_id,
            'name': name,
            'description': description,
            'steps': steps,
            'schedule': schedule,
            'status': 'active',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        # Save pipeline
        save_pipeline(pipeline)

        logger.info(f"Pipeline created: {name}")
        return jsonify({
            "message": "Pipeline created successfully",
            "pipelineId": pipeline_id,
            "pipeline": pipeline
        }), 201
    except Exception as e:
        logger.error(f"Failed to create pipeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/update-pipeline/<pipeline_id>', methods=['PUT'])
def update_pipeline(pipeline_id):
    """Update an existing pipeline"""
    try:
        data = request.get_json()
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        # Update pipeline fields
        if 'name' in data:
            pipeline['name'] = data['name']
        if 'description' in data:
            pipeline['description'] = data['description']
        if 'steps' in data:
            pipeline['steps'] = data['steps']
        if 'schedule' in data:
            pipeline['schedule'] = data['schedule']
        if 'status' in data and data['status'] in PIPELINE_STATUSES:
            pipeline['status'] = data['status']

        pipeline['updatedAt'] = datetime.now().isoformat()

        # Save updated pipeline
        save_pipeline(pipeline)

        logger.info(f"Pipeline updated: {pipeline_id}")
        return jsonify({
            "message": "Pipeline updated successfully",
            "pipeline": pipeline
        }), 200
    except Exception as e:
        logger.error(f"Failed to update pipeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-pipeline/<pipeline_id>', methods=['GET'])
def get_pipeline(pipeline_id):
    """Get pipeline by ID"""
    try:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        logger.info(f"Pipeline retrieved: {pipeline_id}")
        return jsonify({
            "message": "Pipeline retrieved successfully",
            "pipeline": pipeline
        }), 200
    except Exception as e:
        logger.error(f"Failed to retrieve pipeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-pipelines', methods=['GET'])
def list_pipelines():
    """List all pipelines"""
    try:
        pipelines = load_all_pipelines()

        logger.info(f"Retrieved {len(pipelines)} pipelines")
        return jsonify({
            "message": "Pipelines retrieved successfully",
            "pipelines": pipelines
        }), 200
    except Exception as e:
        logger.error(f"Failed to list pipelines: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-pipeline/<pipeline_id>', methods=['DELETE'])
def delete_pipeline(pipeline_id):
    """Delete a pipeline"""
    try:
        pipeline_file = os.path.join(PIPELINES_DIR, f"{pipeline_id}.json")
        if not os.path.exists(pipeline_file):
            return jsonify({"error": "Pipeline not found"}), 404

        os.remove(pipeline_file)

        logger.info(f"Pipeline deleted: {pipeline_id}")
        return jsonify({
            "message": "Pipeline deleted successfully"
        }), 200
    except Exception as e:
        logger.error(f"Failed to delete pipeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/execute-pipeline/<pipeline_id>', methods=['POST'])
def execute_pipeline(pipeline_id):
    """Execute a pipeline"""
    try:
        pipeline = load_pipeline(pipeline_id)
        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        if pipeline['status'] != 'active':
            return jsonify({"error": "Pipeline is not active"}), 400

        logger.info(f"Executing pipeline: {pipeline_id}")

        # Create execution record
        execution_id = str(uuid.uuid4())
        execution = {
            'id': execution_id,
            'pipelineId': pipeline_id,
            'pipelineName': pipeline['name'],
            'status': 'running',
            'startTime': datetime.now().isoformat(),
            'steps': []
        }

        # Save execution
        save_execution(execution)

        # Execute pipeline steps (simplified)
        for i, step in enumerate(pipeline['steps']):
            step_execution = {
                'stepNumber': i + 1,
                'stepName': step.get('name', f'Step {i + 1}'),
                'status': 'completed',
                'startTime': datetime.now().isoformat(),
                'endTime': datetime.now().isoformat(),
                'result': 'Step executed successfully'
            }
            execution['steps'].append(step_execution)

            # Simulate processing time
            import time
            time.sleep(1)

        # Update execution status
        execution['status'] = 'completed'
        execution['endTime'] = datetime.now().isoformat()

        # Save updated execution
        save_execution(execution)

        logger.info(f"Pipeline execution completed: {pipeline_id}")
        return jsonify({
            "message": "Pipeline executed successfully",
            "executionId": execution_id,
            "execution": execution
        }), 200
    except Exception as e:
        logger.error(f"Failed to execute pipeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-execution/<execution_id>', methods=['GET'])
def get_execution(execution_id):
    """Get execution by ID"""
    try:
        execution = load_execution(execution_id)
        if not execution:
            return jsonify({"error": "Execution not found"}), 404

        logger.info(f"Execution retrieved: {execution_id}")
        return jsonify({
            "message": "Execution retrieved successfully",
            "execution": execution
        }), 200
    except Exception as e:
        logger.error(f"Failed to retrieve execution: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_pipeline(pipeline):
    """Save pipeline to file"""
    try:
        file_path = os.path.join(PIPELINES_DIR, f"{pipeline['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(pipeline, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save pipeline: {str(e)}")
        raise

def load_pipeline(pipeline_id):
    """Load pipeline from file"""
    try:
        file_path = os.path.join(PIPELINES_DIR, f"{pipeline_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load pipeline: {str(e)}")
        return None

def load_all_pipelines():
    """Load all pipelines from file"""
    pipelines = []
    try:
        for filename in os.listdir(PIPELINES_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(PIPELINES_DIR, filename)
                with open(file_path, 'r') as f:
                    pipelines.append(json.load(f))
    except Exception as e:
        logger.error(f"Failed to load pipelines: {str(e)}")
    return pipelines

def save_execution(execution):
    """Save execution to file"""
    try:
        file_path = os.path.join(EXECUTIONS_DIR, f"{execution['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(execution, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save execution: {str(e)}")
        raise

def load_execution(execution_id):
    """Load execution from file"""
    try:
        file_path = os.path.join(EXECUTIONS_DIR, f"{execution_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load execution: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)