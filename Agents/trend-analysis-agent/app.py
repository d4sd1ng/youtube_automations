from flask import Flask, jsonify, request
import json
import os
import uuid
from datetime import datetime, timedelta
import logging
from collections import Counter
import re

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data')
SCRAPED_CONTENT_DIR = os.path.join(DATA_DIR, 'scraped-content')
TRENDS_DIR = os.path.join(DATA_DIR, 'trends')
TREND_CACHE_DIR = os.path.join(DATA_DIR, 'trend-cache')

# Create directories if they don't exist
os.makedirs(SCRAPED_CONTENT_DIR, exist_ok=True)
os.makedirs(TRENDS_DIR, exist_ok=True)
os.makedirs(TREND_CACHE_DIR, exist_ok=True)

# Trend analysis configuration
analysis_config = {
    'minEngagement': 50,
    'trendingThreshold': 3,
    'viralThreshold': 7.5,
    'timeWindow': 72,
    'maxTrends': 50
}

# Keyword scoring weights
scoring_weights = {
    'engagement': 0.3,
    'viralPotential': 0.25,
    'recency': 0.2,
    'crossPlatform': 0.15,
    'keywordRelevance': 0.1
}

# Topic categories
categories = {
    'ai_tech': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'gpt', 'llm', 'robot'],
    'programming': ['code', 'developer', 'programming', 'software', 'github', 'python', 'javascript'],
    'startup': ['startup', 'funding', 'venture', 'ipo', 'acquisition', 'series'],
    'crypto': ['bitcoin', 'crypto', 'blockchain', 'ethereum', 'nft', 'defi'],
    'science': ['research', 'study', 'discovery', 'breakthrough', 'science', 'university'],
    'business': ['company', 'ceo', 'market', 'business', 'revenue', 'profit'],
    'politics': ['government', 'policy', 'regulation', 'law', 'congress', 'senate']
}

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({"status": "healthy", "service": "Trend Analysis Agent", "version": "1.0.0"}), 200

# Analyze trends in content
@app.route('/analyze-trends', methods=['POST'])
def analyze_trends():
    """Analyze trends in content data"""
    try:
        data = request.get_json()

        # Validate input data
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Get content data from request or load from files
        content_data = data.get('content_data')
        if not content_data:
            # Load content from scraped content directory
            content_data = load_scraped_content()

        # Perform trend analysis
        result = perform_trend_analysis(content_data)

        logger.info("Trend analysis completed")
        return jsonify({
            "message": "Trend analysis successful",
            "result": result
        }), 200

    except Exception as e:
        logger.error(f"Error in trend analysis: {str(e)}")
        return jsonify({"error": f"Trend analysis failed: {str(e)}"}), 500

# Get latest trend analysis
@app.route('/latest-trends', methods=['GET'])
def get_latest_trends():
    """Get latest trend analysis"""
    try:
        # Load latest trend analysis from file
        latest_trend_data = load_latest_trend_analysis()

        if latest_trend_data:
            # Add top trend information
            top_trend = None
            top_trend_score = 0
            if 'trends' in latest_trend_data and len(latest_trend_data['trends']) > 0:
                top_trend = latest_trend_data['trends'][0].get('keyword')
                top_trend_score = latest_trend_data['trends'][0].get('trendingScore', 0)

            result = {
                **latest_trend_data,
                'topTrend': top_trend,
                'topTrendScore': top_trend_score,
                'analysisConfig': analysis_config
            }

            return jsonify(result), 200
        else:
            return jsonify({"message": "No trend analysis data available"}), 404

    except Exception as e:
        logger.error(f"Error getting latest trends: {str(e)}")
        return jsonify({"error": f"Failed to get latest trends: {str(e)}"}), 500

# Helper functions
def load_scraped_content():
    """Load scraped content from files"""
    content = []

    # Check if directory exists
    if not os.path.exists(SCRAPED_CONTENT_DIR):
        logger.warning(f"Scraped content directory not found: {SCRAPED_CONTENT_DIR}")
        return content

    # Load JSON files from scraped content directory
    for filename in os.listdir(SCRAPED_CONTENT_DIR):
        if filename.endswith('.json'):
            filepath = os.path.join(SCRAPED_CONTENT_DIR, filename)
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    # Handle both single items and arrays
                    if isinstance(data, list):
                        content.extend(data)
                    else:
                        content.append(data)
            except Exception as e:
                logger.error(f"Error loading {filename}: {str(e)}")

    return content

def perform_trend_analysis(content):
    """Perform trend analysis on content data"""
    # Extract keywords from content
    content_with_keywords = []
    all_keywords = []

    for item in content:
        # Extract keywords from title and content
        keywords = extract_keywords(item)
        item['keywords'] = keywords
        content_with_keywords.append(item)
        all_keywords.extend(keywords)

    # Count keyword frequencies
    keyword_counts = Counter(all_keywords)

    # Filter keywords based on trending threshold
    trending_keywords = {
        keyword: count for keyword, count in keyword_counts.items()
        if count >= analysis_config['trendingThreshold']
    }

    # Group content by trending keywords
    trend_groups = {}
    for item in content_with_keywords:
        for keyword in item['keywords']:
            if keyword in trending_keywords:
                if keyword not in trend_groups:
                    trend_groups[keyword] = []
                trend_groups[keyword].append(item)

    # Create trend objects
    trends = []
    for keyword, items in trend_groups.items():
        # Calculate metrics for this trend
        total_engagement = sum(item.get('engagement', 0) for item in items)
        total_viral_potential = sum(item.get('viralPotential', 0) for item in items)

        # Time calculations
        earliest_time = float('inf')
        latest_time = 0
        item_count = 0

        for item in items:
            if 'timestamp' in item:
                timestamp = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00')).timestamp()
                earliest_time = min(earliest_time, timestamp)
                latest_time = max(latest_time, timestamp)
                item_count += 1

        avg_engagement = total_engagement / len(items) if items else 0
        avg_viral_potential = total_viral_potential / len(items) if items else 0
        time_spread = (latest_time - earliest_time) / (60 * 60) if item_count > 0 else 0  # Hours

        # Calculate trending score
        trending_score = calculate_trending_score(
            keyword, items, time_spread, avg_engagement, avg_viral_potential
        )

        trend_obj = {
            'keyword': keyword,
            'count': len(items),
            'items': items,
            'avgEngagement': round(avg_engagement),
            'avgViralPotential': round(avg_viral_potential * 10) / 10,
            'timeSpread': round(time_spread * 10) / 10,
            'trendingScore': trending_score,
            'category': categorize_content({'title': keyword, 'content': ''})
        }

        trends.append(trend_obj)

    # Sort by trending score
    trends.sort(key=lambda x: x['trendingScore'], reverse=True)
    trends = trends[:analysis_config['maxTrends']]

    # Extract topics
    topics = {}
    for item in content_with_keywords:
        category = categorize_content(item)
        if category not in topics:
            topics[category] = {'count': 0, 'engagement': 0, 'viralPotential': 0}
        topics[category]['count'] += 1
        topics[category]['engagement'] += item.get('engagement', 0)
        topics[category]['viralPotential'] += item.get('viralPotential', 0)

    # Normalize topic data
    for category, topic_data in topics.items():
        count = topic_data['count']
        if count > 0:
            topics[category] = {
                'count': count,
                'avgEngagement': round(topic_data['engagement'] / count),
                'avgViralPotential': round((topic_data['viralPotential'] / count) * 10) / 10
            }

    # Create analysis result
    analysis_result = {
        'timestamp': datetime.now().isoformat(),
        'totalContentItems': len(content),
        'totalKeywords': len(all_keywords),
        'trendingKeywords': len(trends),
        'topics': len(topics),
        'topCategories': sorted(
            [{'category': cat, **data} for cat, data in topics.items()],
            key=lambda x: x['count'],
            reverse=True
        )[:5]
    }

    # Create trend data
    trend_data = {
        'timestamp': datetime.now().isoformat(),
        'trends': trends,
        'topics': topics,
        'analysis': analysis_result
    }

    # Save trend analysis
    save_trend_analysis(trend_data)

    logger.info(f"Trend analysis complete. Found {len(trends)} trending keywords")

    return {
        'trends': trends,
        'topics': topics,
        'analysis': analysis_result
    }

def extract_keywords(item):
    """Extract keywords from content item"""
    keywords = set()

    # Combine title and content for keyword extraction
    text = f"{item.get('title', '')} {item.get('content', '')}".lower()

    # Extract words (simple approach)
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text)

    # Filter out common stop words
    stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'it', 'its', 'if', 'so', 'than', 'too', 'very', 'just', 'now'}

    for word in words:
        if word not in stop_words and len(word) > 2:
            keywords.add(word)

    return list(keywords)

def calculate_trending_score(keyword, items, time_spread, avg_engagement, avg_viral_potential):
    """Calculate trending score for a keyword"""
    # Calculate recency score (more recent = higher score)
    recency_score = 1.0
    if time_spread > 0:
        # Normalize time spread to 0-1 range (newer = higher score)
        recency_score = max(0.1, 1.0 - (time_spread / analysis_config['timeWindow']))

    # Calculate cross-platform score (more sources = higher score)
    sources = set(item.get('source', '') for item in items)
    cross_platform_score = min(1.0, len(sources) / 3.0)

    # Calculate keyword relevance score (more mentions = higher score)
    keyword_relevance_score = min(1.0, len(items) / 10.0)

    # Weighted score calculation
    score = (
        scoring_weights['engagement'] * min(1.0, avg_engagement / 1000) +
        scoring_weights['viralPotential'] * min(1.0, avg_viral_potential / 10) +
        scoring_weights['recency'] * recency_score +
        scoring_weights['crossPlatform'] * cross_platform_score +
        scoring_weights['keywordRelevance'] * keyword_relevance_score
    ) * 100

    return round(score, 2)

def categorize_content(item):
    """Categorize content based on keywords"""
    title = item.get('title', '').lower()
    content = item.get('content', '').lower()
    text = f"{title} {content}"

    category_scores = {}

    for category, keywords in categories.items():
        score = 0
        for keyword in keywords:
            if keyword in text:
                score += 1
        category_scores[category] = score

    # Return category with highest score, or 'general' if no matches
    if category_scores:
        best_category = max(category_scores, key=category_scores.get)
        if category_scores[best_category] > 0:
            return best_category

    return 'general'

def save_trend_analysis(data):
    """Save trend analysis to file"""
    try:
        timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
        filename = f"trend-analysis-{timestamp}.json"
        filepath = os.path.join(TRENDS_DIR, filename)

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        logger.info(f"Trend analysis saved: {filename}")
    except Exception as e:
        logger.error(f"Failed to save trend analysis: {str(e)}")

def load_latest_trend_analysis():
    """Load latest trend analysis from file"""
    try:
        # Get all trend analysis files
        files = []
        if os.path.exists(TRENDS_DIR):
            for f in os.listdir(TRENDS_DIR):
                if f.startswith('trend-analysis-') and f.endswith('.json'):
                    filepath = os.path.join(TRENDS_DIR, f)
                    mtime = os.path.getmtime(filepath)
                    files.append({'name': f, 'path': filepath, 'mtime': mtime})

        # Sort by modification time (newest first)
        files.sort(key=lambda x: x['mtime'], reverse=True)

        # Load latest file
        if files:
            with open(files[0]['path'], 'r') as f:
                return json.load(f)

        return None
    except Exception as e:
        logger.error(f"Failed to load trend analysis: {str(e)}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)