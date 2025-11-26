from flask import Flask, request, jsonify
import os
import json
import uuid
from datetime import datetime
import logging
import re
import asyncio
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/seo')
TEMPLATES_DIR = os.path.join(BASE_DIR, '../../data/seo-templates')
JOBS_DIR = os.path.join(BASE_DIR, '../../data/seo-jobs')
REPORTS_DIR = os.path.join(DATA_DIR, 'reports')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Enhanced SEO configuration
CONFIG = {
    'dimensions': {
        'youtube': {'width': 1280, 'height': 720},
        'shorts': {'width': 1080, 'height': 1920},
        'standard': {'width': 1280, 'height': 720},
        'banner': {'width': 2560, 'height': 1440}
    },
    'templates': {
        'premiumClickbait': {
            'name': "Premium Clickbait",
            'description': "Hochwertiges Clickbait-Design für maximale Klickrate",
            'layers': ["background", "gradient_overlay", "text_overlay", "cta_elements", "branding"],
            'category': "monetization",
            'priority': "high"
        },
        'cinematic': {
            'name': "Cinematic Design",
            'description': "Filmisches Design für professionelle Inhalte",
            'layers': ["background", "cinematic_overlay", "text_overlay", "branding"],
            'category': "professional",
            'priority': "medium"
        },
        'boldMinimal': {
            'name': "Bold Minimal",
            'description': "Klares, reduziertes Design mit starker visueller Wirkung",
            'layers': ["background", "accent_elements", "text_overlay", "branding"],
            'category': "professional",
            'priority': "high"
        }
    },
    'colors': {
        'primary': '#FF0000',  # YouTube red
        'secondary': '#FFFFFF',  # White
        'accent': '#000000',  # Black
        'background': '#000000',  # Black
        'gradientStart': '#FF0000',
        'gradientEnd': '#000000',
        'cinematicStart': 'rgba(0, 0, 0, 0.8)',
        'cinematicEnd': 'rgba(0, 0, 0, 0.2)'
    },
    'fonts': {
        'primary': 'Arial',
        'heading': 'Arial Bold',
        'sizes': {
            'title': 72,
            'subtitle': 36,
            'tagline': 24
        }
    },
    'optimizationTypes': {
        'channel-description': {'name': 'Kanalbeschreibung', 'focus': 'Kanal-SEO'},
        'video-description': {'name': 'Video-Beschreibung', 'focus': 'Video-SEO'},
        'tags': {'name': 'Tags', 'focus': 'Keyword-Optimierung'},
        'title': {'name': 'Titel', 'focus': 'Click-Through-Rate'},
        'thumbnail': {'name': 'Thumbnail', 'focus': 'Sichtbarkeit'}
    }
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "Enhanced SEO Optimization Python Agent",
        "version": "1.0.0"
    }), 200

@app.route('/execute-task', methods=['POST'])
def execute_task():
    """Execute enhanced SEO optimization task"""
    try:
        task_data = request.get_json()
        task_type = task_data.get('type')
        task_payload = task_data.get('payload', {})
        
        if not task_type:
            return jsonify({"error": "Task type is required"}), 400
            
        logger.info(f"Executing enhanced SEO optimization task: {task_type}")
        
        # Generate task ID
        task_id = str(uuid.uuid4())
        
        # Save job data
        job_data = {
            'id': task_id,
            'type': task_type,
            'payload': task_payload,
            'status': 'processing',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        save_job(job_data)
        
        # Process task based on type
        result = None
        if task_type == 'optimize-channel':
            result = optimize_channel(task_payload)
        elif task_type == 'optimize-video':
            result = optimize_video(task_payload)
        elif task_type == 'generate-tags':
            result = generate_tags(task_payload)
        elif task_type == 'optimize-title':
            result = optimize_title(task_payload)
        elif task_type == 'analyze-competitors':
            result = analyze_competitors(task_payload)
        elif task_type == 'analyze-trends':
            result = analyze_trends(task_payload)
        elif task_type == 'keyword-research':
            result = perform_keyword_research(task_payload)
        elif task_type == 'content-analysis':
            result = analyze_content(task_payload)
        else:
            job_data['status'] = 'failed'
            job_data['error'] = f'Unsupported task type: {task_type}'
            job_data['updatedAt'] = datetime.now().isoformat()
            save_job(job_data)
            return jsonify({"error": f"Unsupported task type: {task_type}"}), 400
        
        # Update job with result
        job_data['status'] = 'completed'
        job_data['result'] = result
        job_data['updatedAt'] = datetime.now().isoformat()
        save_job(job_data)
        
        # Save optimization data
        if result and 'optimization' in result:
            save_optimization(result['optimization'])
        
        logger.info(f"Enhanced SEO optimization task completed: {task_id}")
        
        return jsonify({
            "message": "Enhanced SEO optimization task completed successfully",
            "taskId": task_id,
            "result": result
        }), 200
    except Exception as e:
        logger.error(f"Error in enhanced SEO optimization task: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
        
        # Create report
        report = {
            'id': report_id,
            'url': url,
            'analysis': seo_analysis,
            'generatedAt': datetime.now().isoformat()
        }
        
        # Save report
        save_report(report)
        
        logger.info(f"SEO analysis completed: {report_id}")
        
        return jsonify({
            "message": "SEO analysis completed successfully",
            "reportId": report_id,
            "report": report
        }), 200
    except Exception as e:
        logger.error(f"Error in SEO analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/optimize-content', methods=['POST'])
def optimize_content():
    """Optimize content for search engines"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        keywords = data.get('keywords', [])
        url = data.get('url', '')
        options = data.get('options', {})

        if not content:
            return jsonify({"error": "Content is required"}), 400
            
        logger.info(f"Optimizing content for SEO: {url}")
        
        # Perform SEO optimization
        optimized_content = optimize_content_for_seo(content, keywords, options)
        
        # Generate optimization ID
        optimization_id = str(uuid.uuid4())
        
        # Create optimization record
        optimization = {
            'id': optimization_id,
            'url': url,
            'originalContent': content,
            'optimizedContent': optimized_content,
            'keywords': keywords,
            'options': options,
            'generatedAt': datetime.now().isoformat()
        }
        
        # Save optimization
        save_optimization(optimization)
        
        logger.info(f"Content optimization completed: {optimization_id}")
        
        return jsonify({
            "message": "Content optimized successfully",
            "optimizationId": optimization_id,
            "optimizedContent": optimized_content
        }), 200
    except Exception as e:
        logger.error(f"Error in content optimization: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/keyword-research', methods=['POST'])
def keyword_research():
    """Perform keyword research"""
    try:
        data = request.get_json()
        seed_keywords = data.get('seedKeywords', [])
        language = data.get('language', 'de')

        if not seed_keywords:
            return jsonify({"error": "Seed keywords are required"}), 400
            
        logger.info(f"Performing keyword research for: {', '.join(seed_keywords)}")
        
        # Perform keyword research
        keyword_data = perform_keyword_research({'seedKeywords': seed_keywords, 'language': language})
        
        # Generate research ID
        research_id = str(uuid.uuid4())
        
        # Create research record
        research = {
            'id': research_id,
            'seedKeywords': seed_keywords,
            'language': language,
            'results': keyword_data,
            'generatedAt': datetime.now().isoformat()
        }
        
        # Save research
        save_keyword_research(research)
        
        logger.info(f"Keyword research completed: {research_id}")
        
        return jsonify({
            "message": "Keyword research completed successfully",
            "researchId": research_id,
            "results": keyword_data
        }), 200
    except Exception as e:
        logger.error(f"Error in keyword research: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-optimizations', methods=['GET'])
def list_optimizations():
    """List all optimizations"""
    try:
        optimizations = []
        if os.path.exists(DATA_DIR):
            for file in os.listdir(DATA_DIR):
                if file.endswith('.json'):
                    with open(os.path.join(DATA_DIR, file), 'r') as f:
                        optimization_data = json.load(f)
                        optimizations.append(optimization_data)
        
        return jsonify({
            "message": "Optimizations retrieved successfully",
            "optimizations": optimizations
        }), 200
    except Exception as e:
        logger.error(f"Error listing optimizations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-optimization/<optimization_id>', methods=['GET'])
def get_optimization(optimization_id):
    """Get optimization by ID"""
    try:
        optimization_path = os.path.join(DATA_DIR, f"{optimization_id}.json")
        if os.path.exists(optimization_path):
            with open(optimization_path, 'r') as f:
                optimization_data = json.load(f)
            return jsonify({
                "message": "Optimization retrieved successfully",
                "optimization": optimization_data
            }), 200
        else:
            return jsonify({"error": "Optimization not found"}), 404
    except Exception as e:
        logger.error(f"Error getting optimization {optimization_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-optimization/<optimization_id>', methods=['DELETE'])
def delete_optimization(optimization_id):
    """Delete optimization by ID"""
    try:
        optimization_path = os.path.join(DATA_DIR, f"{optimization_id}.json")
        if os.path.exists(optimization_path):
            os.remove(optimization_path)
            return jsonify({
                "message": "Optimization deleted successfully"
            }), 200
        else:
            return jsonify({"error": "Optimization not found"}), 404
    except Exception as e:
        logger.error(f"Error deleting optimization {optimization_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-job-status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status"""
    try:
        job_path = os.path.join(JOBS_DIR, f"{job_id}.json")
        if os.path.exists(job_path):
            with open(job_path, 'r') as f:
                job_data = json.load(f)
            return jsonify({
                "message": "Job status retrieved successfully",
                "job": job_data
            }), 200
        else:
            return jsonify({"error": "Job not found"}), 404
    except Exception as e:
        logger.error(f"Error getting job status {job_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-status', methods=['GET'])
def get_status():
    """Get agent status"""
    return jsonify({
        "agentName": "EnhancedSEOOptimizationAgent",
        "version": "1.0.0",
        "isAvailable": True,
        "supportedTasks": [
            'optimize-channel',
            'optimize-video',
            'generate-tags',
            'optimize-title',
            'analyze-competitors',
            'analyze-trends',
            'keyword-research',
            'content-analysis',
            'list-optimizations',
            'get-optimization',
            'delete-optimization',
            'get-job-status'
        ]
    }), 200

def optimize_channel(payload):
    """Optimize channel for SEO with enhanced features"""
    channel_data = payload.get('channelData', {})
    config = payload.get('config', {})
    competitor_data = payload.get('competitorData', None)
    
    # Generate channel description
    description = generate_channel_description(channel_data, config)
    
    # Generate channel keywords
    keywords = generate_channel_keywords(channel_data, config)
    
    # Perform competitor analysis if data is provided
    competitor_analysis = None
    if competitor_data:
        competitor_analysis = analyze_competitors({'competitorData': competitor_data})
    
    # Perform trend analysis
    trend_analysis = analyze_trends({'contentData': channel_data})
    
    # Generate enhanced recommendations
    enhanced_recommendations = generate_enhanced_recommendations(
        [], 
        competitor_analysis.get('result', {}) if competitor_analysis else None,
        trend_analysis.get('result', {}) if trend_analysis else None
    )
    
    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'channel-description',
        'channelData': channel_data,
        'description': description,
        'keywords': keywords,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'optimization': optimization,
        'description': description,
        'keywords': keywords,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations
    }

def optimize_video(payload):
    """Optimize video for SEO with enhanced features"""
    video_data = payload.get('videoData', {})
    config = payload.get('config', {})
    video_type = payload.get('videoType', 'long-form')
    competitor_data = payload.get('competitorData', None)
    
    # Generate video description based on type
    if video_type == 'shorts':
        description = generate_shorts_video_description(video_data, config)
    else:
        description = generate_long_form_video_description(video_data, config)
    
    # Perform competitor analysis if data is provided
    competitor_analysis = None
    if competitor_data:
        competitor_analysis = analyze_competitors({'competitorData': competitor_data})
    
    # Perform trend analysis
    trend_analysis = analyze_trends({'contentData': video_data})
    
    # Generate enhanced recommendations
    enhanced_recommendations = generate_enhanced_recommendations(
        [], 
        competitor_analysis.get('result', {}) if competitor_analysis else None,
        trend_analysis.get('result', {}) if trend_analysis else None
    )
    
    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'video-description',
        'videoData': video_data,
        'description': description,
        'videoType': video_type,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'optimization': optimization,
        'description': description,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations
    }

def generate_tags(payload):
    """Generate SEO tags with enhanced features"""
    topic = payload.get('topic', '')
    options = payload.get('options', {})
    competitor_data = payload.get('competitorData', None)
    
    # Perform comprehensive SEO analysis
    analysis = perform_comprehensive_seo_analysis(topic, options)
    
    # Extract keywords from analysis
    tags = analysis.get('allKeywords', [])[:15]  # Limit to 15 tags
    
    # Perform competitor analysis if data is provided
    competitor_analysis = None
    if competitor_data:
        competitor_analysis = analyze_competitors({'competitorData': competitor_data})
    
    # Perform trend analysis
    trend_analysis = analyze_trends({'contentData': {'title': topic}})
    
    # Generate enhanced recommendations
    enhanced_recommendations = generate_enhanced_recommendations(
        [], 
        competitor_analysis.get('result', {}) if competitor_analysis else None,
        trend_analysis.get('result', {}) if trend_analysis else None
    )
    
    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'tags',
        'topic': topic,
        'tags': tags,
        'analysis': analysis,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'optimization': optimization,
        'tags': tags,
        'analysis': analysis,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations
    }

def optimize_title(payload):
    """Optimize title for SEO"""
    title_data = payload.get('titleData', {})
    config = payload.get('config', {})
    competitor_data = payload.get('competitorData', None)
    
    # Optimize title
    optimized_title = optimize_video_title(title_data.get('title', ''), config)
    
    # Perform competitor analysis if data is provided
    competitor_analysis = None
    if competitor_data:
        competitor_analysis = analyze_competitors({'competitorData': competitor_data})
    
    # Perform trend analysis
    trend_analysis = analyze_trends({'contentData': title_data})
    
    # Generate enhanced recommendations
    enhanced_recommendations = generate_enhanced_recommendations(
        [], 
        competitor_analysis.get('result', {}) if competitor_analysis else None,
        trend_analysis.get('result', {}) if trend_analysis else None
    )
    
    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'title',
        'titleData': title_data,
        'optimizedTitle': optimized_title,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'optimization': optimization,
        'optimizedTitle': optimized_title,
        'competitorAnalysis': competitor_analysis,
        'trendAnalysis': trend_analysis,
        'enhancedRecommendations': enhanced_recommendations
    }

def analyze_competitors(payload):
    """Analyze competitors for SEO"""
    competitor_data = payload.get('competitorData', [])
    
    # Extract top competitor keywords
    top_competitor_keywords = []
    engagement_rates = []
    content_lengths = []
    
    for competitor in competitor_data:
        # Extract keywords from competitor data
        if 'keywords' in competitor:
            top_competitor_keywords.extend(competitor['keywords'][:5])  # Top 5 keywords per competitor
        
        # Extract engagement rates
        if 'engagementRate' in competitor:
            engagement_rates.append(competitor['engagementRate'])
        
        # Extract content lengths
        if 'contentLength' in competitor:
            content_lengths.append(competitor['contentLength'])
    
    # Calculate averages
    avg_content_length = sum(content_lengths) / len(content_lengths) if content_lengths else 0
    avg_engagement_rate = sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0
    
    analysis_result = {
        'topKeywords': top_competitor_keywords,
        'averageContentLength': avg_content_length,
        'averageEngagementRate': avg_engagement_rate,
        'competitorCount': len(competitor_data)
    }
    
    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'competitor-analysis',
        'competitorData': competitor_data,
        'analysis': analysis_result,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'optimization': optimization,
        'result': analysis_result
    }

def analyze_trends(payload):
    """Analyze trends for SEO insights"""
    content_data = payload.get('contentData', {})
    
    # Extract keywords from content data
    title = content_data.get('title', '')
    tags = content_data.get('tags', [])
    all_keywords = ' '.join([title] + tags).lower()
    
    # Simple trend detection based on common trending terms
    trending_terms = ['ai', 'artificial intelligence', 'machine learning', 'blockchain', 'crypto', 'nft', 'metaverse']
    detected_trends = [term for term in trending_terms if term in all_keywords]
    
    analysis_result = {
        'detectedTrends': detected_trends,
        'analysisDate': datetime.now().isoformat(),
        'confidence': 'medium' if detected_trends else 'low'
    }
    
    # Create optimization record
    optimization_id = str(uuid.uuid4())
    optimization = {
        'id': optimization_id,
        'type': 'trend-analysis',
        'contentData': content_data,
        'analysis': analysis_result,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'optimization': optimization,
        'result': analysis_result
    }

def perform_keyword_research(payload):
    """Perform keyword research (enhanced)"""
    seed_keywords = payload.get('seedKeywords', [])
    language = payload.get('language', 'de')
    
    keyword_data = []
    
    for keyword in seed_keywords:
        # Generate related keywords
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
    
    # Create research record
    research_id = str(uuid.uuid4())
    research = {
        'id': research_id,
        'seedKeywords': seed_keywords,
        'language': language,
        'results': keyword_data,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'research': research,
        'results': keyword_data
    }

def analyze_content(payload):
    """Analyze content for semantic SEO factors"""
    content_data = payload.get('contentData', {})
    content = content_data.get('content', '')
    
    # Simple entity extraction (mock)
    entities = re.findall(r'[A-Z][a-z]+ [A-Z][a-z]+', content) or []  # Simple name detection
    
    # Simple topic modeling (mock)
    topics = []
    tech_terms = ['AI', 'machine learning', 'blockchain', 'algorithm', 'data science']
    for term in tech_terms:
        if term.lower() in content.lower():
            topics.append(term)
    
    analysis_result = {
        'entities': list(set(entities)),  # Remove duplicates
        'topics': topics,
        'semanticAnalysisDate': datetime.now().isoformat()
    }
    
    # Create analysis record
    analysis_id = str(uuid.uuid4())
    analysis_record = {
        'id': analysis_id,
        'type': 'content-analysis',
        'contentData': content_data,
        'analysis': analysis_result,
        'createdAt': datetime.now().isoformat()
    }
    
    return {
        'analysis': analysis_record,
        'result': analysis_result
    }

def perform_seo_analysis(content, keywords, url):
    """Perform SEO analysis (enhanced)"""
    # Content analysis
    word_count = len(content.split())
    char_count = len(content)
    
    # Keyword density analysis
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
    """Optimize content for SEO (enhanced)"""
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

def generate_enhanced_recommendations(base_recommendations, competitor_analysis, trend_analysis):
    """Generate enhanced recommendations based on additional analyses"""
    enhanced_recommendations = base_recommendations.copy()
    
    if competitor_analysis:
        # Add competitor-based recommendations
        if 'topKeywords' in competitor_analysis and competitor_analysis['topKeywords']:
            competitor_keywords = ', '.join([kw for kw in competitor_analysis['topKeywords'][:5]])
            enhanced_recommendations.append(f"Competitor analysis shows these popular keywords: {competitor_keywords}")
        
        if 'averageContentLength' in competitor_analysis and competitor_analysis['averageContentLength'] > 0:
            enhanced_recommendations.append(f"Competitors average {competitor_analysis['averageContentLength']} words per piece. Consider adjusting your content length.")
    
    if trend_analysis and 'detectedTrends' in trend_analysis and trend_analysis['detectedTrends']:
        trends = ', '.join(trend_analysis['detectedTrends'])
        enhanced_recommendations.append(f"Current trends detected: {trends}. Consider incorporating these into your content.")
    
    return enhanced_recommendations

def generate_channel_description(channel_data, config):
    """Generate SEO-optimized channel description"""
    channel_name = channel_data.get('name', 'Unsere Channel')
    channel_topic = channel_data.get('topic', 'verschiedene Themen')
    target_audience = channel_data.get('targetAudience', 'ein breites Publikum')
    
    description = f"Willkommen bei {channel_name}! Wir behandeln {channel_topic} für {target_audience}. "
    description += "Abonnieren Sie für regelmäßige Updates und wertvolle Inhalte. "
    description += "#SEO #YouTube #Content"
    
    return description

def generate_channel_keywords(channel_data, config):
    """Generate channel keywords"""
    topic = channel_data.get('topic', '')
    
    # Generate primary keywords
    primary_keywords = [
        topic,
        f"{topic} Anleitung",
        f"{topic} Tutorial",
        f"{topic} Erklärung",
        f"{topic} Guide"
    ]
    
    # Generate related keywords
    related_keywords = [
        f"Was ist {topic}",
        f"Wie funktioniert {topic}",
        f"{topic} Vorteile",
        f"{topic} Nachteile"
    ]
    
    # Combine and deduplicate
    all_keywords = list(set(primary_keywords + related_keywords))
    
    return {
        'primaryKeywords': primary_keywords,
        'relatedKeywords': related_keywords,
        'allKeywords': all_keywords
    }

def generate_long_form_video_description(video_data, config):
    """Generate long-form video description"""
    title = video_data.get('title', 'Unsere Inhalte')
    topic = video_data.get('topic', 'interessante Themen')
    
    description = f"In diesem Video behandeln wir {topic}. {title} - ein wichtiges Thema, "
    description += "das viele Menschen interessiert. Wenn Sie diesen Inhalt hilfreich finden, "
    description += "lassen Sie bitte ein Like da und abonnieren Sie unseren Kanal für weitere Videos.\n\n"
    description += "Inhaltsverzeichnis:\n"
    description += "00:00 - Einleitung\n"
    description += "02:30 - Hauptteil\n"
    description += "08:45 - Zusammenfassung\n\n"
    description += "Weitere Links:\n"
    description += "- Unsere Website: [Link]\n"
    description += "- Social Media: [Links]\n\n"
    description += "#SEO #YouTube #Video"
    
    return description

def generate_shorts_video_description(video_data, config):
    """Generate shorts video description"""
    title = video_data.get('title', 'Kurzvideo')
    topic = video_data.get('topic', 'spannende Inhalte')
    
    description = f"{title} - {topic} in Kurzform! "
    description += "Mehr davon auf unserem Kanal. #Shorts #YouTube"
    
    return description

def perform_comprehensive_seo_analysis(topic, options):
    """Perform comprehensive SEO analysis"""
    # Generate primary keywords
    primary_keywords = [
        topic,
        f"{topic} Anleitung",
        f"{topic} Tutorial",
        f"{topic} Erklärung",
        f"{topic} Guide"
    ]

    # Generate related keywords
    related_keywords = [
        f"Was ist {topic}",
        f"Wie funktioniert {topic}",
        f"{topic} Vorteile",
        f"{topic} Nachteile",
        f"{topic} Vergleich",
        f"{topic} Test",
        f"{topic} Bewertung",
        f"{topic} Erfahrungen",
        f"{topic} Tipps",
        f"{topic} Tricks"
    ]

    # Generate Long-Tail keywords
    long_tail_keywords = [
        f"Wie man {topic} richtig verwendet",
        f"{topic} für Anfänger erklärt",
        f"Beste {topic} im Jahr 2024",
        f"{topic} vs Alternativen",
        f"Kosten von {topic} verglichen"
    ]

    # Combine all keywords
    all_keywords = list(set(primary_keywords + related_keywords + long_tail_keywords))

    return {
        'success': True,
        'primaryKeywords': primary_keywords,
        'relatedKeywords': related_keywords,
        'longTailKeywords': long_tail_keywords,
        'allKeywords': all_keywords[:50],  # Limit to 50 keywords
        'metadata': {
            'generatedAt': datetime.now().isoformat(),
            'topic': topic,
            'keywordCount': len(all_keywords[:50])
        }
    }

def optimize_video_title(title, config):
    """Optimize the video title"""
    # Remove unnecessary characters and truncate to maximum length
    return re.sub(r'[^\w\s\-äöüÄÖÜß]', '', title).strip()[:config.get('maxTitleLength', 60)]

def save_optimization(optimization):
    """Save optimization data"""
    try:
        optimization_path = os.path.join(DATA_DIR, f"{optimization['id']}.json")
        with open(optimization_path, 'w') as f:
            json.dump(optimization, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving optimization: {str(e)}")

def save_job(job):
    """Save job data"""
    try:
        job_path = os.path.join(JOBS_DIR, f"{job['id']}.json")
        with open(job_path, 'w') as f:
            json.dump(job, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving job: {str(e)}")

def save_report(report):
    """Save SEO report to file"""
    try:
        file_path = os.path.join(REPORTS_DIR, f"{report['id']}_report.json")
        with open(file_path, 'w') as f:
            json.dump(report, f, indent=2)
        logger.info(f"SEO report saved: {report['id']}")
    except Exception as e:
        logger.error(f"Failed to save SEO report: {str(e)}")

def save_keyword_research(research):
    """Save keyword research to file"""
    try:
        file_path = os.path.join(DATA_DIR, f"{research['id']}_research.json")
        with open(file_path, 'w') as f:
            json.dump(research, f, indent=2)
        logger.info(f"Keyword research saved: {research['id']}")
    except Exception as e:
        logger.error(f"Failed to save keyword research: {str(e)}")

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