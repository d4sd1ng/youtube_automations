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
INPUTS_DIR = os.path.join(BASE_DIR, 'data', 'inputs')
PROCESSED_DIR = os.path.join(INPUTS_DIR, 'processed')

# Create directories if they don't exist
os.makedirs(INPUTS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "MultiInput Python Agent"}), 200

@app.route('/process-multi-input', methods=['POST'])
def process_multi_input():
    """Process multiple inputs"""
    try:
        data = request.get_json()
        content_id = data.get('contentId')
        input_data = data.get('inputData', {})
        options = data.get('options', {})

        if not content_id:
            return jsonify({"error": "contentId is required"}), 400

        logger.info(f"Processing multi-input for content: {content_id}")

        # Combine all input sources
        combined_data = combine_input_sources(input_data)

        # Analyze content structure
        analysis = analyze_content_structure(combined_data)

        # Extract key information
        key_info = extract_key_information(combined_data, analysis)

        # Generate metadata
        metadata = {
            'contentId': content_id,
            'sources': input_data.get('sources', []),
            'wordCount': len(combined_data['text']),
            'keyThemes': key_info['themes'],
            'keyPoints': key_info['points'],
            'sentiment': key_info['sentiment'],
            'language': key_info['language'],
            'processingOptions': options,
            'processedAt': datetime.now().isoformat()
        }

        # Save processed input
        save_processed_input(content_id, combined_data, metadata)

        result = {
            'contentId': content_id,
            'combinedData': combined_data,
            'metadata': metadata,
            'analysis': analysis,
            'keyInfo': key_info
        }

        logger.info(f"Multi-input processing completed for: {content_id}")
        return jsonify({
            "message": "Multi-input processing completed successfully",
            "result": result
        }), 200
    except Exception as e:
        logger.error(f"Multi-input processing failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-processed-input/<content_id>', methods=['GET'])
def get_processed_input(content_id):
    """Get processed input by content ID"""
    try:
        processed_input = load_processed_input(content_id)
        if not processed_input:
            return jsonify({"error": "Processed input not found"}), 404

        logger.info(f"Processed input retrieved successfully: {content_id}")
        return jsonify({
            "message": "Processed input retrieved successfully",
            "data": processed_input
        }), 200
    except Exception as e:
        logger.error(f"Failed to retrieve processed input: {str(e)}")
        return jsonify({"error": str(e)}), 500

def combine_input_sources(input_data):
    """Combine multiple input sources into a single data structure"""
    text = input_data.get('text', '')
    urls = input_data.get('urls', [])
    files = input_data.get('files', [])

    return {
        'text': text,
        'urls': urls,
        'files': files,
        'combinedText': text + ' ' + ' '.join(urls) + ' ' + ' '.join(files)
    }

def analyze_content_structure(combined_data):
    """Analyze content structure"""
    text = combined_data['combinedText']
    word_count = len(text.split())
    sentence_count = len(text.split('.'))
    paragraph_count = len(text.split('\n\n'))

    return {
        'wordCount': word_count,
        'sentenceCount': sentence_count,
        'paragraphCount': paragraph_count,
        'averageWordsPerSentence': round(word_count / max(sentence_count, 1)),
        'averageSentencesPerParagraph': round(sentence_count / max(paragraph_count, 1))
    }

def extract_key_information(combined_data, analysis):
    """Extract key information from content"""
    text = combined_data['combinedText'].lower()

    # Simple theme detection (mock)
    themes = []
    if 'ai' in text or 'artificial intelligence' in text:
        themes.append('AI')
    if 'blockchain' in text:
        themes.append('Blockchain')
    if 'machine learning' in text:
        themes.append('Machine Learning')
    if 'data' in text:
        themes.append('Data Science')

    # Simple point extraction (mock)
    points = [sentence.strip() for sentence in text.split('.') if len(sentence.strip()) > 10][:5]

    return {
        'themes': themes if themes else ['General'],
        'points': points if points else ['No key points identified'],
        'sentiment': 'neutral',  # Would be determined by NLP in a real implementation
        'language': 'en'  # Would be detected in a real implementation
    }

def save_processed_input(content_id, combined_data, metadata):
    """Save processed input to file"""
    try:
        file_path = os.path.join(PROCESSED_DIR, f'{content_id}.json')
        data = {
            'contentId': content_id,
            'combinedData': combined_data,
            'metadata': metadata
        }

        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

        logger.info(f"Processed input saved: {content_id}")
    except Exception as e:
        logger.error(f"Failed to save processed input: {str(e)}")

def load_processed_input(content_id):
    """Load processed input from file"""
    try:
        file_path = os.path.join(PROCESSED_DIR, f'{content_id}.json')
        if not os.path.exists(file_path):
            return None

        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load processed input: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)