import os
import json
import uuid
from datetime import datetime
import logging
import asyncio
import aiohttp
from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '../../data/book-projects')
BOOKS_DIR = os.path.join(DATA_DIR, 'books')
CHAPTERS_DIR = os.path.join(DATA_DIR, 'chapters')
TEMPLATES_DIR = os.path.join(DATA_DIR, 'templates')
JOBS_DIR = os.path.join(DATA_DIR, 'jobs')
RESEARCH_DIR = os.path.join(DATA_DIR, 'research')
INTERVIEWS_DIR = os.path.join(DATA_DIR, 'interviews')
MARKET_ANALYSIS_DIR = os.path.join(DATA_DIR, 'market-analysis')
IMAGES_DIR = os.path.join(DATA_DIR, 'images')
PUBLISHING_DIR = os.path.join(DATA_DIR, 'publishing')

# Create directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(BOOKS_DIR, exist_ok=True)
os.makedirs(CHAPTERS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)
os.makedirs(RESEARCH_DIR, exist_ok=True)
os.makedirs(INTERVIEWS_DIR, exist_ok=True)
os.makedirs(MARKET_ANALYSIS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(PUBLISHING_DIR, exist_ok=True)

# Processing queue and workers
processing_queue = []
active_jobs = {}
max_concurrent_jobs = 2

# Supported book formats
BOOK_FORMATS = {
    'ebook': 'E-Book',
    'pdf': 'PDF',
    'mobi': 'MOBI',
    'epub': 'EPUB',
    'audiobook': 'Hörbuch'
}

# Supported content types
CONTENT_TYPES = {
    'fiction': 'Fiktion',
    'non-fiction': 'Sachbuch',
    'technical': 'Technisches Buch',
    'educational': 'Bildungsbuch',
    'biography': 'Biografie',
    'self-help': 'Selbsthilfe'
}

# Book structure templates
STRUCTURE_TEMPLATES = {
    'standard': {
        'name': 'Standardstruktur',
        'chapters': [
            'Einleitung',
            'Hintergrund und Kontext',
            'Hauptthema 1',
            'Hauptthema 2',
            'Hauptthema 3',
            'Fallstudien und Beispiele',
            'Zusammenfassung und Ausblick',
            'Anhang'
        ]
    },
    'academic': {
        'name': 'Akademische Struktur',
        'chapters': [
            'Abstract',
            'Einleitung',
            'Literaturübersicht',
            'Methodik',
            'Ergebnisse',
            'Diskussion',
            'Schlussfolgerung',
            'Referenzen',
            'Anhang'
        ]
    },
    'fiction': {
        'name': 'Fiktive Struktur',
        'chapters': [
            'Prolog',
            'Kapitel 1',
            'Kapitel 2',
            'Kapitel 3',
            'Klimax',
            'Fallende Handlung',
            'Lösung',
            'Epilog'
        ]
    }
}

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy", 
        "service": "Book Writer Agent",
        "version": "1.0.0"
    }), 200

# Create book project endpoint
@app.route('/create-book-project', methods=['POST'])
def create_book_project():
    """Create a new book project"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'title' not in data:
            return jsonify({"error": "Missing title in request"}), 400
            
        title = data['title']
        author = data.get('author', 'Unbekannter Autor')
        genre = data.get('genre', 'non-fiction')
        description = data.get('description', '')
        target_audience = data.get('targetAudience', 'Allgemeine Leserschaft')
        language = data.get('language', 'de')
        word_count_target = data.get('wordCountTarget', 50000)
        
        # Generate project ID
        project_id = f"book-project-{sanitize_filename(title)}-{int(datetime.now().timestamp())}"
        
        # Create book project
        book_project = {
            'id': project_id,
            'title': title,
            'author': author,
            'genre': genre,
            'description': description,
            'targetAudience': target_audience,
            'language': language,
            'wordCountTarget': word_count_target,
            'status': 'initialized',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'progress': 0
        }
        
        # Save project
        save_book_project(book_project)
        
        logger.info(f"Book project created: {project_id}")
        
        return jsonify({
            "message": "Book project created successfully",
            "projectId": project_id,
            "project": book_project
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating book project: {str(e)}")
        return jsonify({"error": f"Book project creation failed: {str(e)}"}), 500

# Plan book content endpoint
@app.route('/plan-book-content', methods=['POST'])
def plan_book_content():
    """Plan book content structure"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        template = data.get('template', 'standard')
        custom_chapters = data.get('customChapters', [])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'content_planning'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Generate content plan
        if custom_chapters:
            content_plan = custom_chapters
        else:
            template_config = STRUCTURE_TEMPLATES.get(template, STRUCTURE_TEMPLATES['standard'])
            content_plan = []
            for i, chapter_title in enumerate(template_config['chapters']):
                content_plan.append({
                    'id': f"chapter-{uuid.uuid4().hex[:8]}",
                    'number': i + 1,
                    'title': chapter_title,
                    'description': f'Dieses Kapitel behandelt {chapter_title.lower()} im Kontext von {book_project["title"]}',
                    'estimatedWordCount': 2000,
                    'status': 'planned',
                    'createdAt': datetime.now().isoformat()
                })
        
        # Update project with content plan
        book_project['contentPlan'] = content_plan
        book_project['progress'] = 20
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        logger.info(f"Book content planned: {project_id}")
        
        return jsonify({
            "message": "Book content planned successfully",
            "projectId": project_id,
            "contentPlan": content_plan
        }), 200
        
    except Exception as e:
        logger.error(f"Error planning book content: {str(e)}")
        return jsonify({"error": f"Book content planning failed: {str(e)}"}), 500

# Conduct research endpoint
@app.route('/conduct-research', methods=['POST'])
def conduct_research():
    """Conduct research for book content"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        topics = data.get('topics', [])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'researching'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Generate research data (mock implementation)
        research_data = []
        for topic in topics:
            research_data.append({
                'topic': topic,
                'sources': [
                    f'https://example.com/source-{uuid.uuid4().hex[:8]}',
                    f'https://example.com/source-{uuid.uuid4().hex[:8]}'
                ],
                'summary': f'Dies ist eine Zusammenfassung der Forschung zu {topic}',
                'keyPoints': [
                    f'Wichtiger Punkt 1 über {topic}',
                    f'Wichtiger Punkt 2 über {topic}',
                    f'Wichtiger Punkt 3 über {topic}'
                ],
                'researchedAt': datetime.now().isoformat()
            })
        
        # Update project with research data
        book_project['researchData'] = research_data
        book_project['progress'] = 35
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        # Save research data to file
        research_file_path = os.path.join(RESEARCH_DIR, f'{project_id}_research.json')
        with open(research_file_path, 'w') as f:
            json.dump(research_data, f, indent=2)
        
        logger.info(f"Research conducted: {project_id}")
        
        return jsonify({
            "message": "Research conducted successfully",
            "projectId": project_id,
            "researchData": research_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error conducting research: {str(e)}")
        return jsonify({"error": f"Research failed: {str(e)}"}), 500

# Conduct interviews endpoint
@app.route('/conduct-interviews', methods=['POST'])
def conduct_interviews():
    """Conduct interviews for book content"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        interviewees = data.get('interviewees', [])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'interviewing'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Generate interview results (mock implementation)
        interview_results = []
        for interviewee in interviewees:
            interview_results.append({
                'interviewee': interviewee,
                'questions': [
                    'Frage 1',
                    'Frage 2',
                    'Frage 3'
                ],
                'responses': [
                    f'Dies ist die Antwort von {interviewee} auf Frage 1',
                    f'Dies ist die Antwort von {interviewee} auf Frage 2',
                    f'Dies ist die Antwort von {interviewee} auf Frage 3'
                ],
                'keyInsights': [
                    f'Wichtige Erkenntnis 1 von {interviewee}',
                    f'Wichtige Erkenntnis 2 von {interviewee}',
                    f'Wichtige Erkenntnis 3 von {interviewee}'
                ],
                'interviewedAt': datetime.now().isoformat()
            })
        
        # Update project with interview results
        book_project['interviewResults'] = interview_results
        book_project['progress'] = 50
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        # Save interview results to file
        interviews_file_path = os.path.join(INTERVIEWS_DIR, f'{project_id}_interviews.json')
        with open(interviews_file_path, 'w') as f:
            json.dump(interview_results, f, indent=2)
        
        logger.info(f"Interviews conducted: {project_id}")
        
        return jsonify({
            "message": "Interviews conducted successfully",
            "projectId": project_id,
            "interviewResults": interview_results
        }), 200
        
    except Exception as e:
        logger.error(f"Error conducting interviews: {str(e)}")
        return jsonify({"error": f"Interviews failed: {str(e)}"}), 500

# Analyze market endpoint
@app.route('/analyze-market', methods=['POST'])
def analyze_market():
    """Analyze market for book content"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        competitors = data.get('competitors', [])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'market_analysis'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Generate market analysis (mock implementation)
        market_analysis = {
            'targetMarketSize': '100.000 Leser',
            'growthRate': '5% jährlich',
            'competitorAnalysis': [],
            'pricingAnalysis': {
                'ebook': '9,99 €',
                'paperback': '14,99 €',
                'hardcover': '24,99 €',
                'audiobook': '19,99 €'
            },
            'distributionChannels': [
                'Amazon Kindle',
                'Apple Books',
                'Google Play Books',
                'Physical Bookstores'
            ],
            'marketingOpportunities': [
                'Social Media Marketing',
                'Book Blog Reviews',
                'Podcast Appearances',
                'Book Signings'
            ],
            'analyzedAt': datetime.now().isoformat()
        }
        
        # Add competitor analysis
        for competitor in competitors:
            market_analysis['competitorAnalysis'].append({
                'title': competitor,
                'price': '12,99 €',
                'reviews': 150,
                'rating': 4.2,
                'strengths': ['Stärke 1', 'Stärke 2'],
                'weaknesses': ['Schwäche 1', 'Schwäche 2']
            })
        
        # Update project with market analysis
        book_project['marketAnalysis'] = market_analysis
        book_project['progress'] = 60
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        # Save market analysis to file
        market_analysis_file_path = os.path.join(MARKET_ANALYSIS_DIR, f'{project_id}_market_analysis.json')
        with open(market_analysis_file_path, 'w') as f:
            json.dump(market_analysis, f, indent=2)
        
        logger.info(f"Market analyzed: {project_id}")
        
        return jsonify({
            "message": "Market analysis completed successfully",
            "projectId": project_id,
            "marketAnalysis": market_analysis
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing market: {str(e)}")
        return jsonify({"error": f"Market analysis failed: {str(e)}"}), 500

# Write chapters endpoint
@app.route('/write-chapters', methods=['POST'])
def write_chapters():
    """Write book chapters"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        chapter_ids = data.get('chapterIds', [])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'writing'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Get content plan
        content_plan = book_project.get('contentPlan', [])
        
        # Filter chapters if specific chapter IDs are provided
        if chapter_ids:
            content_plan = [chapter for chapter in content_plan if chapter['id'] in chapter_ids]
        
        # Write chapters
        written_chapters = []
        total_word_count = 0
        
        for chapter in content_plan:
            # Generate chapter content (mock implementation)
            paragraphs = []
            paragraph_count = 10
            
            for i in range(paragraph_count):
                paragraphs.append(f"Dies ist Absatz {i + 1} des Kapitels \"{chapter['title']}\". Hier wird der Inhalt ausführlich behandelt und wichtige Punkte erläutert. Die Informationen sind gut strukturiert und leicht verständlich.")
            
            chapter_content = '\n\n'.join(paragraphs)
            
            # Create chapter object
            written_chapter = {
                'id': chapter['id'],
                'projectId': project_id,
                'number': chapter['number'],
                'title': chapter['title'],
                'content': chapter_content,
                'wordCount': len(chapter_content.split()),
                'status': 'completed',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            # Save chapter
            save_chapter(written_chapter)
            
            written_chapters.append(written_chapter)
            total_word_count += written_chapter['wordCount']
            
            # Update chapter status in content plan
            for plan_chapter in book_project['contentPlan']:
                if plan_chapter['id'] == chapter['id']:
                    plan_chapter['status'] = 'completed'
                    plan_chapter['updatedAt'] = datetime.now().isoformat()
                    break
        
        # Update project with written chapters
        book_project['chapters'] = written_chapters
        book_project['wordCount'] = total_word_count
        book_project['progress'] = 80
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        logger.info(f"Chapters written: {project_id}")
        
        return jsonify({
            "message": "Chapters written successfully",
            "projectId": project_id,
            "chapters": written_chapters,
            "totalWordCount": total_word_count
        }), 200
        
    except Exception as e:
        logger.error(f"Error writing chapters: {str(e)}")
        return jsonify({"error": f"Chapter writing failed: {str(e)}"}), 500

# Generate visual content endpoint
@app.route('/generate-visual-content', methods=['POST'])
def generate_visual_content():
    """Generate visual content for book"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        visual_elements = data.get('visualElements', ['cover', 'chapter_images'])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'generating_visuals'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Generate visual content (mock implementation)
        visual_plan = []
        images = []
        
        for element in visual_elements:
            visual_plan.append({
                'type': element,
                'description': f'Visuelles Element: {element}',
                'status': 'planned',
                'createdAt': datetime.now().isoformat()
            })
            
            # Generate mock image data
            images.append({
                'id': f"image-{uuid.uuid4().hex[:8]}",
                'type': element,
                'description': f'Bild für {element}',
                'filePath': f'/images/{project_id}/{element}.png',
                'generatedAt': datetime.now().isoformat()
            })
        
        # Update project with visual content
        book_project['visualPlan'] = visual_plan
        book_project['images'] = images
        book_project['progress'] = 90
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        # Save images to file
        images_file_path = os.path.join(IMAGES_DIR, f'{project_id}_images.json')
        with open(images_file_path, 'w') as f:
            json.dump(images, f, indent=2)
        
        logger.info(f"Visual content generated: {project_id}")
        
        return jsonify({
            "message": "Visual content generated successfully",
            "projectId": project_id,
            "visualPlan": visual_plan,
            "images": images
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating visual content: {str(e)}")
        return jsonify({"error": f"Visual content generation failed: {str(e)}"}), 500

# Format book endpoint
@app.route('/format-book', methods=['POST'])
def format_book():
    """Format book for publication"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        formats = data.get('formats', ['pdf', 'epub'])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'formatting'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Get chapters
        chapters = get_book_chapters(project_id)
        
        # Format book for each requested format
        formatted_books = []
        
        for format_type in formats:
            # Format content (mock implementation)
            formatted_content = f"# {book_project['title']}\n\n"
            formatted_content += f"**Autor:** {book_project['author']}\n\n"
            formatted_content += f"**Beschreibung:** {book_project['description']}\n\n"
            formatted_content += "---\n\n"
            
            for chapter in chapters:
                formatted_content += f"## {chapter['title']}\n\n"
                formatted_content += f"{chapter['content']}\n\n"
                formatted_content += "---\n\n"
            
            # Create formatted book object
            formatted_book = {
                'id': f"formatted-{book_project['id']}-{format_type}",
                'projectId': project_id,
                'format': format_type,
                'content': formatted_content,
                'filePath': f'/books/{project_id}/{book_project["title"]}.{format_type}',
                'status': 'completed',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            # Save formatted book
            save_formatted_book(formatted_book)
            
            formatted_books.append(formatted_book)
        
        # Update project with formatted books
        book_project['formattedBooks'] = formatted_books
        book_project['progress'] = 95
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        logger.info(f"Book formatted: {project_id}")
        
        return jsonify({
            "message": "Book formatted successfully",
            "projectId": project_id,
            "formattedBooks": formatted_books
        }), 200
        
    except Exception as e:
        logger.error(f"Error formatting book: {str(e)}")
        return jsonify({"error": f"Book formatting failed: {str(e)}"}), 500

# Publish book endpoint
@app.route('/publish-book', methods=['POST'])
def publish_book():
    """Publish book to various platforms"""
    try:
        data = request.get_json()
        
        # Validate input data
        if not data or 'projectId' not in data:
            return jsonify({"error": "Missing projectId in request"}), 400
            
        project_id = data['projectId']
        platforms = data.get('platforms', ['amazon'])
        
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        # Update project status
        book_project['status'] = 'publishing'
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Get formatted books
        formatted_books = book_project.get('formattedBooks', [])
        
        # Publish to platforms (mock implementation)
        publishing_info = []
        
        for platform in platforms:
            platform_info = {
                'platform': platform,
                'status': 'published',
                'publishedAt': datetime.now().isoformat(),
                'links': []
            }
            
            for formatted_book in formatted_books:
                platform_info['links'].append({
                    'format': formatted_book['format'],
                    'link': f'https://{platform}.com/book/{book_project["id"]}/{formatted_book["format"]}'
                })
            
            publishing_info.append(platform_info)
        
        # Update project with publishing info
        book_project['publishing'] = publishing_info
        book_project['status'] = 'completed'
        book_project['progress'] = 100
        book_project['completedAt'] = datetime.now().isoformat()
        book_project['updatedAt'] = datetime.now().isoformat()
        
        # Save project
        save_book_project(book_project)
        
        # Save publishing info to file
        publishing_file_path = os.path.join(PUBLISHING_DIR, f'{project_id}_publishing.json')
        with open(publishing_file_path, 'w') as f:
            json.dump(publishing_info, f, indent=2)
        
        logger.info(f"Book published: {project_id}")
        
        return jsonify({
            "message": "Book published successfully",
            "projectId": project_id,
            "publishingInfo": publishing_info
        }), 200
        
    except Exception as e:
        logger.error(f"Error publishing book: {str(e)}")
        return jsonify({"error": f"Book publishing failed: {str(e)}"}), 500

# Get book project status endpoint
@app.route('/project-status/<project_id>', methods=['GET'])
def get_project_status(project_id):
    """Get book project status"""
    try:
        # Load project
        book_project = load_book_project_by_id(project_id)
        if not book_project:
            return jsonify({"error": "Project not found"}), 404
            
        logger.info(f"Project status requested: {project_id}")
        
        return jsonify({
            "message": "Project status retrieved successfully",
            "project": book_project
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting project status: {str(e)}")
        return jsonify({"error": f"Failed to get project status: {str(e)}"}), 500

# List book projects endpoint
@app.route('/list-projects', methods=['GET'])
def list_projects():
    """List all book projects"""
    try:
        projects = []
        
        # Read all project files
        for filename in os.listdir(DATA_DIR):
            if filename.startswith('book-project-') and filename.endswith('.json'):
                try:
                    with open(os.path.join(DATA_DIR, filename), 'r') as f:
                        project = json.load(f)
                        projects.append(project)
                except Exception as e:
                    logger.warning(f"Failed to read project file {filename}: {str(e)}")
        
        # Sort by creation date (newest first)
        projects.sort(key=lambda x: x['createdAt'], reverse=True)
        
        logger.info(f"Listed {len(projects)} projects")
        
        return jsonify({
            "message": "Projects listed successfully",
            "projects": projects,
            "total": len(projects)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing projects: {str(e)}")
        return jsonify({"error": f"Failed to list projects: {str(e)}"}), 500

# Get statistics endpoint
@app.route('/stats', methods=['GET'])
def get_stats():
    """Get book writer statistics"""
    try:
        # Read all project files
        all_projects = []
        for filename in os.listdir(DATA_DIR):
            if filename.startswith('book-project-') and filename.endswith('.json'):
                try:
                    with open(os.path.join(DATA_DIR, filename), 'r') as f:
                        project = json.load(f)
                        all_projects.append(project)
                except Exception as e:
                    logger.warning(f"Failed to read project file {filename}: {str(e)}")
        
        # Calculate statistics
        total_projects = len(all_projects)
        completed_projects = len([p for p in all_projects if p.get('status') == 'completed'])
        failed_projects = len([p for p in all_projects if p.get('status') == 'failed'])
        
        stats = {
            'totalProjects': total_projects,
            'completedProjects': completed_projects,
            'failedProjects': failed_projects,
            'successRate': total_projects > 0 and (completed_projects / total_projects) * 100 or 0,
            'activeJobs': len(active_jobs),
            'queueLength': len(processing_queue),
            'supportedFormats': BOOK_FORMATS,
            'supportedContentTypes': CONTENT_TYPES,
            'structureTemplates': {k: v['name'] for k, v in STRUCTURE_TEMPLATES.items()}
        }
        
        logger.info("Statistics requested")
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({"error": f"Failed to get statistics: {str(e)}"}), 500

# Helper functions
def sanitize_filename(filename):
    """Sanitize filename"""
    return filename.replace('/', '_').replace('\\', '_').replace(':', '_').replace('*', '_').replace('?', '_').replace('"', '_').replace('<', '_').replace('>', '_').replace('|', '_')

def save_book_project(book_project):
    """Save book project to file"""
    try:
        filename = f"{book_project['id']}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        with open(filepath, 'w') as f:
            json.dump(book_project, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save book project {book_project['id']}: {str(e)}")

def load_book_project_by_id(project_id):
    """Load book project by ID"""
    try:
        filename = f"{project_id}.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
        
        return None
    except Exception as e:
        logger.error(f"Failed to load book project {project_id}: {str(e)}")
        return None

def save_chapter(chapter):
    """Save chapter to file"""
    try:
        filename = f"{chapter['id']}_chapter.json"
        filepath = os.path.join(CHAPTERS_DIR, filename)
        
        with open(filepath, 'w') as f:
            json.dump(chapter, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save chapter {chapter['id']}: {str(e)}")

def get_book_chapters(project_id):
    """Get book chapters"""
    chapters = []
    
    try:
        for filename in os.listdir(CHAPTERS_DIR):
            if filename.startswith(f"{project_id}_") and filename.endswith('_chapter.json'):
                try:
                    with open(os.path.join(CHAPTERS_DIR, filename), 'r') as f:
                        chapter = json.load(f)
                        chapters.append(chapter)
                except Exception as e:
                    logger.warning(f"Failed to read chapter file {filename}: {str(e)}")
        
        # Sort chapters by number
        chapters.sort(key=lambda x: x['number'])
    except Exception as e:
        logger.error(f"Error getting book chapters: {str(e)}")
    
    return chapters

def save_formatted_book(formatted_book):
    """Save formatted book to file"""
    try:
        filename = f"{formatted_book['id']}_formatted.json"
        filepath = os.path.join(BOOKS_DIR, filename)
        
        with open(filepath, 'w') as f:
            json.dump(formatted_book, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save formatted book {formatted_book['id']}: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)