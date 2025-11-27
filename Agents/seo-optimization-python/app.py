# SEO Optimization Agent
import flask
import json
from flask import request, jsonify
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import os

app = flask.Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'SEO Optimization Agent'})

@app.route('/optimize', methods=['POST'])
def optimize_seo():
    data = request.get_json()
    
    task_type = data.get('task')
    
    try:
        if task_type == 'optimize_video':
            result = optimize_video_seo(data.get('title', ''), data.get('description', ''), data.get('tags', []))
        elif task_type == 'optimize_script':
            result = optimize_script_seo(data.get('script', ''), data.get('keywords', []))
        elif task_type == 'analyze_keywords':
            result = analyze_keywords(data.get('keywords', []), data.get('content', ''))
        else:
            return jsonify({'error': 'Unsupported task type'}), 400
        
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def optimize_video_seo(title, description, tags):
    # Placeholder for video SEO optimization logic
    # In a real implementation, this would optimize video metadata for search engines
    
    # Mock implementation
    optimized_title = title + ' #SEO' if '#SEO' not in title else title
    optimized_description = description + ' #SEO #Video' if '#SEO' not in description else description
    optimized_tags = list(set(tags + ['SEO', 'Video']))[:30]  # Limit to 30 tags
    
    return {
        'title': optimized_title,
        'description': optimized_description,
        'tags': optimized_tags,
        'message': 'Video SEO optimized successfully'
    }

def optimize_script_seo(script, keywords):
    # Placeholder for script SEO optimization logic
    # In a real implementation, this would optimize script content for search engines
    
    # Mock implementation
    # Add keywords to the beginning of the script if not already present
    keyword_string = ' '.join(keywords)
    optimized_script = keyword_string + ' ' + script if not all(kw in script for kw in keywords) else script
    
    return {
        'script': optimized_script,
        'keywords': keywords,
        'message': 'Script SEO optimized successfully'
    }

def analyze_keywords(keywords, content):
    # Placeholder for keyword analysis logic
    # In a real implementation, this would analyze keyword relevance and suggest improvements
    
    # Mock implementation
    # Use TF-IDF to analyze keyword importance
    vectorizer = TfidfVectorizer()
    try:
        # This is a simplified example - in practice, you would have more documents
        tfidf_matrix = vectorizer.fit_transform([content])
        feature_names = vectorizer.get_feature_names_out()
        
        # Get top keywords by TF-IDF score
        tfidf_scores = tfidf_matrix.toarray()[0]
        keyword_scores = [(feature_names[i], tfidf_scores[i]) for i in range(len(feature_names))]
        keyword_scores.sort(key=lambda x: x[1], reverse=True)
        top_keywords = [kw[0] for kw in keyword_scores[:10]]
        
        return {
            'originalKeywords': keywords,
            'suggestedKeywords': top_keywords,
            'message': 'Keyword analysis completed'
        }
    except Exception as e:
        # Fallback if there are issues with TF-IDF
        return {
            'originalKeywords': keywords,
            'suggestedKeywords': keywords,
            'message': f'Keyword analysis completed with fallback: {str(e)}'
        }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007)
