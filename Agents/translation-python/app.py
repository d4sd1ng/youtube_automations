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
TRANSLATIONS_DIR = os.path.join(DATA_DIR, 'translations')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TRANSLATIONS_DIR, exist_ok=True)

# Supported languages
SUPPORTED_LANGUAGES = [
    'en', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'
]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Translation Python Agent"}), 200

@app.route('/translate', methods=['POST'])
def translate_text():
    """Translate text from one language to another"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_language = data.get('targetLanguage', 'en')
        source_language = data.get('sourceLanguage', 'auto')

        if not text:
            return jsonify({"error": "Text is required"}), 400

        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({"error": f"Target language {target_language} not supported"}), 400

        logger.info(f"Translating text to {target_language}")

        # Perform translation (simplified)
        translation_id = str(uuid.uuid4())
        translation = {
            'id': translation_id,
            'originalText': text,
            'translatedText': f"[Translated to {target_language}] {text}",
            'sourceLanguage': source_language,
            'targetLanguage': target_language,
            'confidenceScore': 0.95,
            'createdAt': datetime.now().isoformat()
        }

        # Save translation
        save_translation(translation)

        logger.info(f"Text translated successfully: {translation_id}")
        return jsonify({
            "message": "Text translated successfully",
            "translationId": translation_id,
            "translation": translation
        }), 201
    except Exception as e:
        logger.error(f"Error translating text: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/detect-language', methods=['POST'])
def detect_language():
    """Detect the language of given text"""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({"error": "Text is required"}), 400

        logger.info("Detecting language")

        # Perform language detection (simplified)
        detection = {
            'text': text,
            'detectedLanguage': 'en',
            'confidenceScore': 0.98,
            'alternativeLanguages': ['en', 'de', 'fr'],
            'createdAt': datetime.now().isoformat()
        }

        logger.info("Language detected successfully")
        return jsonify({
            "message": "Language detected successfully",
            "detection": detection
        }), 200
    except Exception as e:
        logger.error(f"Error detecting language: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/translate-batch', methods=['POST'])
def translate_batch():
    """Translate a batch of texts"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        target_language = data.get('targetLanguage', 'en')

        if not texts:
            return jsonify({"error": "Texts are required"}), 400

        if target_language not in SUPPORTED_LANGUAGES:
            return jsonify({"error": f"Target language {target_language} not supported"}), 400

        logger.info(f"Translating batch of {len(texts)} texts to {target_language}")

        # Perform batch translation (simplified)
        translations = []
        for text in texts:
            translation_id = str(uuid.uuid4())
            translation = {
                'id': translation_id,
                'originalText': text,
                'translatedText': f"[Translated to {target_language}] {text}",
                'sourceLanguage': 'auto',
                'targetLanguage': target_language,
                'confidenceScore': 0.95,
                'createdAt': datetime.now().isoformat()
            }
            translations.append(translation)

            # Save translation
            save_translation(translation)

        batch_result = {
            'translations': translations,
            'totalTexts': len(texts),
            'successfulTranslations': len(texts),
            'failedTranslations': 0,
            'createdAt': datetime.now().isoformat()
        }

        logger.info(f"Batch translation completed successfully")
        return jsonify({
            "message": "Batch translation completed successfully",
            "batchResult": batch_result
        }), 201
    except Exception as e:
        logger.error(f"Error in batch translation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-translation/<translation_id>', methods=['GET'])
def get_translation(translation_id):
    """Get a translation by ID"""
    try:
        translation = load_translation(translation_id)
        if not translation:
            return jsonify({"error": "Translation not found"}), 404

        logger.info(f"Translation retrieved: {translation_id}")
        return jsonify({
            "message": "Translation retrieved successfully",
            "translation": translation
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving translation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-translations', methods=['GET'])
def list_translations():
    """List all translations"""
    try:
        translations = load_all_translations()

        logger.info(f"Retrieved {len(translations)} translations")
        return jsonify({
            "message": "Translations retrieved successfully",
            "translations": translations
        }), 200
    except Exception as e:
        logger.error(f"Error listing translations: {str(e)}")
        return jsonify({"error": str(e)}), 500

def save_translation(translation):
    """Save translation to file"""
    try:
        file_path = os.path.join(TRANSLATIONS_DIR, f"{translation['id']}.json")
        with open(file_path, 'w') as f:
            json.dump(translation, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving translation: {str(e)}")
        raise

def load_translation(translation_id):
    """Load translation from file"""
    try:
        file_path = os.path.join(TRANSLATIONS_DIR, f"{translation_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading translation: {str(e)}")
        return None

def load_all_translations():
    """Load all translations from file"""
    translations = []
    try:
        for filename in os.listdir(TRANSLATIONS_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(TRANSLATIONS_DIR, filename)
                with open(file_path, 'r') as f:
                    translations.append(json.load(f))
    except Exception as e:
        logger.error(f"Error loading translations: {str(e)}")
    return translations

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)