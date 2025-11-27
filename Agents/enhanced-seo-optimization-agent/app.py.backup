from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
REPORTS_DIR = os.path.join(DATA_DIR, 'reports')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Enhanced SEO Optimization Python Agent"}), 200

@app.route('/analyze-seo', methods=['POST'])
def analyze_seo():
    """Analyze SEO for content"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        keywords = data.get('keywords', [])
        url = data.get('url', '')

        if not content:
            return jsonify({"error": "Content is required"}), 400

        logger.info(f"Analyzing SEO for content: {url}")

        # Perform SEO analysis
        seo_analysis = perform_seo_analysis(content, keywords, url)

        # Generate report ID
        report_id = str(uuid.uuid4())

        # Save report
        report = {
            'id': report_id,
            'url': url,
            'analysis': seo_analysis,
            'createdAt': datetime.now().isoformat()
        }
        save_report(report)

        logger.info(f"SEO analysis completed for: {url}")
        return jsonify({
            "message": "SEO analysis completed successfully",
            "reportId": report_id,
            "analysis": seo_analysis
        }), 200
    except Exception as e:
        logger.error(f"SEO analysis failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/optimize-content', methods=['POST'])
def optimize_content():
    """Optimize content for SEO"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        keywords = data.get('keywords', [])
        optimization_options = data.get('options', {})

        if not content:
            return jsonify({"error": "Content is required"}), 400

        logger.info("Optimizing content for SEO")

        # Optimize content
        optimized_content = optimize_content_for_seo(content, keywords, optimization_options)

        logger.info("Content optimization completed")
        return jsonify({
            "message": "Content optimization completed successfully",
            "optimizedContent": optimized_content
        }), 200
    except Exception as e:
        logger.error(f"Content optimization failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-seo-report/<report_id>', methods=['GET'])
def generate_seo_report(report_id):
    """Generate detailed SEO report"""
    try:
        report = load_report(report_id)
        if not report:
            return jsonify({"error": "Report not found"}), 404

        logger.info(f"SEO report retrieved: {report_id}")
        return jsonify({
            "message": "SEO report retrieved successfully",
            "report": report
        }), 200
    except Exception as e:
        logger.error(f"Failed to retrieve SEO report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/keyword-research', methods=['POST'])
def keyword_research():
    """Perform keyword research"""
    try:
        data = request.get_json()
        seed_keywords = data.get('seedKeywords', [])
        language = data.get('language', 'en')

        if not seed_keywords:
            return jsonify({"error": "Seed keywords are required"}), 400

        logger.info("Performing keyword research")

        # Perform keyword research
        keyword_data = perform_keyword_research(seed_keywords, language)

        logger.info("Keyword research completed")
        return jsonify({
            "message": "Keyword research completed successfully",
            "keywords": keyword_data
        }), 200
    except Exception as e:
        logger.error(f"Keyword research failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

def perform_seo_analysis(content, keywords, url):
    """Perform comprehensive SEO analysis"""
    # Content analysis
    word_count = len(content.split())
    char_count = len(content)

    # Keyword analysis
    keyword_density = {}
    for keyword in keywords:
        count = len(re.findall(keyword.lower(), content.lower()))
        density = (count / max(word_count, 1)) * 100
        keyword_density[keyword] = {
            'count': count,
            'density': round(density, 2)
        }

    # Readability analysis (simplified)
    sentences = len(re.split(r'[.!?]+', content))
    avg_sentence_length = word_count / max(sentences, 1)

    # Meta tags analysis (simplified)
    title_length = len(content[:60])  # Simplified title extraction
    meta_description_length = len(content[:160])  # Simplified meta description extraction

    # Heading structure analysis (simplified)
    h1_count = len(re.findall(r'<h1[^>]*>.*?</h1>', content, re.IGNORECASE | re.DOTALL))
    h2_count = len(re.findall(r'<h2[^>]*>.*?</h2>', content, re.IGNORECASE | re.DOTALL))
    h3_count = len(re.findall(r'<h3[^>]*>.*?</h3>', content, re.IGNORECASE | re.DOTALL))

    return {
        'contentAnalysis': {
            'wordCount': word_count,
            'characterCount': char_count,
            'sentenceCount': sentences,
            'avgSentenceLength': round(avg_sentence_length, 2)
        },
        'keywordAnalysis': keyword_density,
        'metaTags': {
            'titleLength': title_length,
            'metaDescriptionLength': meta_description_length
        },
        'headingStructure': {
            'h1Count': h1_count,
            'h2Count': h2_count,
            'h3Count': h3_count
        },
        'recommendations': generate_recommendations(word_count, keyword_density, h1_count, h2_count)
    }

def optimize_content_for_seo(content, keywords, options):
    """Optimize content for SEO"""
    optimized_content = content

    # Add keyword suggestions if missing
    for keyword in keywords:
        if keyword.lower() not in content.lower():
            # Add keyword to beginning of content (simplified)
            optimized_content = f"Important: {keyword}. " + optimized_content

    # Improve readability if requested
    if options.get('improveReadability', False):
        # Add paragraph breaks if content is too long (simplified)
        if len(content) > 1000:
            sentences = re.split(r'([.!?]+)', content)
            optimized_content = ''.join(
                sentence + ('<br><br>' if i % 5 == 4 else '')
                for i, sentence in enumerate(sentences)
            )

    return optimized_content

def perform_keyword_research(seed_keywords, language):
    """Perform keyword research (simplified)"""
    keyword_data = []

    for keyword in seed_keywords:
        # Generate related keywords (simplified)
        related_keywords = [
            f"{keyword} guide",
            f"{keyword} tutorial",
            f"best {keyword}",
            f"how to {keyword}",
            f"{keyword} tips"
        ]

        # Assign mock search volumes and competition levels
        for related_keyword in related_keywords:
            keyword_data.append({
                'keyword': related_keyword,
                'searchVolume': 1000 - (len(keyword_data) * 100),  # Decreasing volume
                'competition': 'Low' if len(keyword_data) < 3 else 'Medium',
                'cpc': round(2.5 - (len(keyword_data) * 0.2), 2),  # Decreasing CPC
                'related': True
            })

        # Add the original keyword
        keyword_data.append({
            'keyword': keyword,
            'searchVolume': 5000,
            'competition': 'High',
            'cpc': 3.5,
            'related': False
        })

    return keyword_data

def generate_recommendations(word_count, keyword_density, h1_count, h2_count):
    """Generate SEO recommendations"""
    recommendations = []

    # Word count recommendation
    if word_count < 300:
        recommendations.append("Content is too short. Aim for at least 300 words.")
    elif word_count > 2000:
        recommendations.append("Content is quite long. Consider breaking it into multiple pages.")

    # Keyword density recommendations
    for keyword, data in keyword_density.items():
        if data['density'] == 0:
            recommendations.append(f"Keyword '{keyword}' is missing from content.")
        elif data['density'] > 5:
            recommendations.append(f"Keyword '{keyword}' may be overused (density: {data['density']}%).")

    # Heading structure recommendations
    if h1_count == 0:
        recommendations.append("Missing H1 heading. Add one main heading.")
    elif h1_count > 1:
        recommendations.append("Too many H1 headings. Use only one main heading.")

    if h2_count == 0:
        recommendations.append("Missing H2 headings. Add subheadings to structure content.")

    return recommendations

def save_report(report):
    """Save SEO report to file"""
    try:
        file_path = os.path.join(REPORTS_DIR, f"{report['id']}_report.json")
        with open(file_path, 'w') as f:
            json.dump(report, f, indent=2)
        logger.info(f"SEO report saved: {report['id']}")
    except Exception as e:
        logger.error(f"Failed to save SEO report: {str(e)}")

def load_report(report_id):
    """Load SEO report from file"""
    try:
        file_path = os.path.join(REPORTS_DIR, f"{report_id}_report.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load SEO report: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)