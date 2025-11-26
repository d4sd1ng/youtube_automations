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
BOOKS_DIR = os.path.join(BASE_DIR, 'data', 'books')
CHAPTERS_DIR = os.path.join(BASE_DIR, 'data', 'chapters')
TEMPLATES_DIR = os.path.join(BASE_DIR, 'data', 'templates')
JOBS_DIR = os.path.join(BASE_DIR, 'data', 'jobs')

# Create directories if they don't exist
os.makedirs(BOOKS_DIR, exist_ok=True)
os.makedirs(CHAPTERS_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)

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
            'Hauptteil Kapitel 1',
            'Hauptteil Kapitel 2',
            'Hauptteil Kapitel 3',
            'Fazit',
            'Anhang'
        ]
    },
    'technical': {
        'name': 'Technische Struktur',
        'chapters': [
            'Vorwort',
            'Einführung',
            'Grundlagen',
            'Konzepte',
            'Implementierung',
            'Best Practices',
            'Fallstudien',
            'Zukunft',
            'Glossar',
            'Literaturverzeichnis'
        ]
    },
    'educational': {
        'name': 'Bildungsstruktur',
        'chapters': [
            'Lernziele',
            'Einführung',
            'Theorie',
            'Praxisbeispiele',
            'Übungen',
            'Zusammenfassung',
            'Selbsttest',
            'Weiterführende Literatur'
        ]
    }
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Book Writer Python Agent"}), 200

@app.route('/create-book', methods=['POST'])
def create_book():
    """Create a new book"""
    try:
        data = request.get_json()
        title = data.get('title')
        options = data.get('options', {})

        if not title:
            return jsonify({"error": "Title is required"}), 400

        job_id = str(uuid.uuid4())
        book_id = str(uuid.uuid4())

        # Create job record
        job = {
            'id': job_id,
            'type': 'book-creation',
            'status': 'processing',
            'title': title,
            'options': options,
            'progress': {
                'currentStage': 'creating',
                'stageProgress': 0,
                'overallProgress': 0,
                'completedStages': []
            },
            'metadata': {
                'startedAt': datetime.now().isoformat(),
                'estimatedDuration': 10000
            },
            'logs': [{'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': f'Creating book: {title}'}]
        }

        # Save job
        save_job(job)

        # Update job progress
        job['progress']['stageProgress'] = 25
        job['progress']['overallProgress'] = 25
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Initializing book structure...'})
        save_job(job)

        # Generate book outline
        outline = generate_book_outline(title, options)

        # Update job progress
        job['progress']['stageProgress'] = 50
        job['progress']['overallProgress'] = 50
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Creating book metadata...'})
        save_job(job)

        # Create book metadata
        book = {
            'id': book_id,
            'title': title,
            'author': options.get('author', 'Automated Author'),
            'description': options.get('description', f'Ein Buch über {title}'),
            'contentType': options.get('contentType', 'non-fiction'),
            'structure': outline['structure'],
            'wordCount': 0,
            'chapterCount': len(outline['structure']),
            'status': 'draft',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'options': options
        }

        # Save book
        save_book(book)

        # Update job progress
        job['progress']['stageProgress'] = 100
        job['progress']['overallProgress'] = 100
        job['result'] = book
        job['metadata']['completedAt'] = datetime.now().isoformat()
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Book created successfully'})
        save_job(job)

        logger.info(f"Book created successfully: {title}")
        return jsonify({
            "message": "Book created successfully",
            "book": book,
            "jobId": job_id
        }), 201
    except Exception as e:
        logger.error(f"Error creating book: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-chapter', methods=['POST'])
def generate_chapter():
    """Generate a chapter for a book"""
    try:
        data = request.get_json()
        book_id = data.get('bookId')
        chapter_data = data.get('chapterData')
        options = data.get('options', {})

        if not book_id or not chapter_data:
            return jsonify({"error": "bookId and chapterData are required"}), 400

        job_id = str(uuid.uuid4())
        chapter_id = str(uuid.uuid4())

        # Create job record
        job = {
            'id': job_id,
            'type': 'chapter-generation',
            'status': 'processing',
            'bookId': book_id,
            'chapterData': chapter_data,
            'options': options,
            'progress': {
                'currentStage': 'generating',
                'stageProgress': 0,
                'overallProgress': 0,
                'completedStages': []
            },
            'metadata': {
                'startedAt': datetime.now().isoformat(),
                'estimatedDuration': 20000
            },
            'logs': [{'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': f'Generating chapter for book: {book_id}'}]
        }

        # Save job
        save_job(job)

        # Update job progress
        job['progress']['stageProgress'] = 25
        job['progress']['overallProgress'] = 25
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Creating chapter content...'})
        save_job(job)

        # Generate chapter content
        content = generate_chapter_content(chapter_data, options)

        # Update job progress
        job['progress']['stageProgress'] = 75
        job['progress']['overallProgress'] = 75
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Finalizing chapter...'})
        save_job(job)

        # Create chapter
        chapter = {
            'id': chapter_id,
            'bookId': book_id,
            **chapter_data,
            'content': content,
            'wordCount': len(content.split()),
            'status': 'completed',
            'generatedAt': datetime.now().isoformat(),
            'options': options
        }

        # Save chapter
        save_chapter(chapter)

        # Update book word count
        update_book_word_count(book_id, chapter['wordCount'])

        # Update job progress
        job['progress']['stageProgress'] = 100
        job['progress']['overallProgress'] = 100
        job['result'] = chapter
        job['metadata']['completedAt'] = datetime.now().isoformat()
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Chapter generated successfully'})
        save_job(job)

        logger.info(f"Chapter generated successfully for book: {book_id}")
        return jsonify({
            "message": "Chapter generated successfully",
            "chapter": chapter,
            "jobId": job_id
        }), 201
    except Exception as e:
        logger.error(f"Error generating chapter: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/format-book', methods=['POST'])
def format_book():
    """Format a book in a specific format"""
    try:
        data = request.get_json()
        book_id = data.get('bookId')
        format_type = data.get('format')
        options = data.get('options', {})

        if not book_id or not format_type:
            return jsonify({"error": "bookId and format are required"}), 400

        job_id = str(uuid.uuid4())

        # Create job record
        job = {
            'id': job_id,
            'type': 'book-formatting',
            'status': 'processing',
            'bookId': book_id,
            'format': format_type,
            'options': options,
            'progress': {
                'currentStage': 'formatting',
                'stageProgress': 0,
                'overallProgress': 0,
                'completedStages': []
            },
            'metadata': {
                'startedAt': datetime.now().isoformat(),
                'estimatedDuration': 15000
            },
            'logs': [{'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': f'Formatting book {book_id} as {format_type}'}]
        }

        # Save job
        save_job(job)

        # Update job progress
        job['progress']['stageProgress'] = 25
        job['progress']['overallProgress'] = 25
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Loading book content...'})
        save_job(job)

        # Get book and chapters
        book = get_book(book_id)
        chapters = get_book_chapters(book_id)

        # Update job progress
        job['progress']['stageProgress'] = 50
        job['progress']['overallProgress'] = 50
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Formatting content...'})
        save_job(job)

        # Format book content
        formatted_content = format_book_content(book, chapters, format_type, options)

        # Update job progress
        job['progress']['stageProgress'] = 75
        job['progress']['overallProgress'] = 75
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Generating output file...'})
        save_job(job)

        # Create formatted book
        formatted_book = {
            'id': f'formatted-{book_id}',
            'bookId': book_id,
            'format': format_type,
            'content': formatted_content,
            'fileName': f"{book['title'].replace(' ', '_')}.{format_type}",
            'fileSize': len(formatted_content),
            'formattedAt': datetime.now().isoformat(),
            'options': options
        }

        # Save formatted book
        save_formatted_book(formatted_book)

        # Update job progress
        job['progress']['stageProgress'] = 100
        job['progress']['overallProgress'] = 100
        job['result'] = formatted_book
        job['metadata']['completedAt'] = datetime.now().isoformat()
        job['logs'].append({'timestamp': datetime.now().isoformat(), 'level': 'info', 'message': 'Book formatted successfully'})
        save_job(job)

        logger.info(f"Book formatted successfully: {book_id} as {format_type}")
        return jsonify({
            "message": "Book formatted successfully",
            "formattedBook": formatted_book,
            "jobId": job_id
        }), 200
    except Exception as e:
        logger.error(f"Error formatting book: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-book-outline', methods=['POST'])
def generate_book_outline_endpoint():
    """Generate a book outline"""
    try:
        data = request.get_json()
        topic = data.get('topic')
        options = data.get('options', {})

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        outline = generate_book_outline(topic, options)

        logger.info(f"Book outline generated successfully for topic: {topic}")
        return jsonify({
            "message": "Book outline generated successfully",
            "outline": outline
        }), 200
    except Exception as e:
        logger.error(f"Error generating book outline: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-book/<book_id>', methods=['GET'])
def get_book_endpoint(book_id):
    """Get a book by ID"""
    try:
        book = get_book(book_id)
        if not book:
            return jsonify({"error": "Book not found"}), 404

        logger.info(f"Book retrieved successfully: {book_id}")
        return jsonify({
            "message": "Book retrieved successfully",
            "book": book
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving book: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/list-books', methods=['GET'])
def list_books():
    """List all books"""
    try:
        books = []
        for filename in os.listdir(BOOKS_DIR):
            if filename.endswith('_book.json'):
                with open(os.path.join(BOOKS_DIR, filename), 'r') as f:
                    book = json.load(f)
                    books.append(book)

        logger.info(f"Retrieved {len(books)} books")
        return jsonify({
            "message": "Books retrieved successfully",
            "books": books
        }), 200
    except Exception as e:
        logger.error(f"Error listing books: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete-book/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Delete a book by ID"""
    try:
        # Delete book file
        book_file_path = os.path.join(BOOKS_DIR, f'{book_id}_book.json')
        if os.path.exists(book_file_path):
            os.remove(book_file_path)

        # Delete chapter files
        for filename in os.listdir(CHAPTERS_DIR):
            if filename.startswith(f'{book_id}_') and filename.endswith('_chapter.json'):
                os.remove(os.path.join(CHAPTERS_DIR, filename))

        logger.info(f"Book deleted successfully: {book_id}")
        return jsonify({
            "message": "Book deleted successfully"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting book: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-job-status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status by ID"""
    try:
        job_file_path = os.path.join(JOBS_DIR, f'{job_id}_job.json')
        if not os.path.exists(job_file_path):
            return jsonify({"error": "Job not found"}), 404

        with open(job_file_path, 'r') as f:
            job = json.load(f)

        logger.info(f"Job status retrieved successfully: {job_id}")
        return jsonify({
            "message": "Job status retrieved successfully",
            "job": job
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving job status: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_book_outline(topic, options={}):
    """Generate book outline"""
    # Determine structure template
    template_key = options.get('template', 'standard')
    template = STRUCTURE_TEMPLATES.get(template_key, STRUCTURE_TEMPLATES['standard'])

    # Generate detailed chapter descriptions
    chapters = []
    for i, title in enumerate(template['chapters']):
        chapter = {
            'id': f'chapter-{str(uuid.uuid4())}',
            'number': i + 1,
            'title': title,
            'description': f'Dieses Kapitel behandelt {title.lower()} im Kontext von {topic}',
            'estimatedWordCount': 2000,
            'status': 'planned',
            'createdAt': datetime.now().isoformat()
        }
        chapters.append(chapter)

    outline = {
        'topic': topic,
        'template': template['name'],
        'structure': chapters,
        'estimatedWordCount': len(chapters) * 2000,
        'generatedAt': datetime.now().isoformat(),
        'options': options
    }

    return outline

def generate_chapter_content(chapter_data, options={}):
    """Generate chapter content"""
    # Mock chapter content generation
    paragraphs = []
    paragraph_count = options.get('paragraphCount', 10)

    for i in range(paragraph_count):
        paragraphs.append(f"Dies ist Absatz {i + 1} des Kapitels \"{chapter_data['title']}\". Hier wird der Inhalt ausführlich behandelt und wichtige Punkte erläutert. Die Informationen sind gut strukturiert und leicht verständlich.")

    return '\n\n'.join(paragraphs)

def format_book_content(book, chapters, format_type, options={}):
    """Format book content"""
    # Mock formatting based on format type
    content = f"# {book['title']}\n\n"
    content += f"**Autor:** {book['author']}\n\n"
    content += f"**Beschreibung:** {book['description']}\n\n"
    content += "---\n\n"

    for chapter in chapters:
        content += f"## {chapter['title']}\n\n"
        content += f"{chapter['content']}\n\n"
        content += "---\n\n"

    return content

def get_book(book_id):
    """Get book by ID"""
    book_file_path = os.path.join(BOOKS_DIR, f'{book_id}_book.json')
    if os.path.exists(book_file_path):
        with open(book_file_path, 'r') as f:
            return json.load(f)
    return None

def get_book_chapters(book_id):
    """Get book chapters"""
    chapters = []
    for filename in os.listdir(CHAPTERS_DIR):
        if filename.startswith(f'{book_id}_') and filename.endswith('_chapter.json'):
            with open(os.path.join(CHAPTERS_DIR, filename), 'r') as f:
                chapter = json.load(f)
                chapters.append(chapter)

    # Sort chapters by number
    chapters.sort(key=lambda x: x['number'])
    return chapters

def update_book_word_count(book_id, word_count):
    """Update book word count"""
    try:
        book = get_book(book_id)
        if book:
            book['wordCount'] = book.get('wordCount', 0) + word_count
            book['updatedAt'] = datetime.now().isoformat()
            save_book(book)
    except Exception as e:
        logger.error(f"Error updating book word count: {str(e)}")

def save_book(book):
    """Save book to file system"""
    try:
        book_file_path = os.path.join(BOOKS_DIR, f"{book['id']}_book.json")
        with open(book_file_path, 'w') as f:
            json.dump(book, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving book: {str(e)}")

def save_chapter(chapter):
    """Save chapter to file system"""
    try:
        chapter_file_path = os.path.join(CHAPTERS_DIR, f"{chapter['id']}_chapter.json")
        with open(chapter_file_path, 'w') as f:
            json.dump(chapter, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving chapter: {str(e)}")

def save_formatted_book(formatted_book):
    """Save formatted book to file system"""
    try:
        formatted_book_file_path = os.path.join(BOOKS_DIR, f"{formatted_book['id']}_formatted.json")
        with open(formatted_book_file_path, 'w') as f:
            json.dump(formatted_book, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving formatted book: {str(e)}")

def save_job(job):
    """Save job to file system"""
    try:
        job_file_path = os.path.join(JOBS_DIR, f"{job['id']}_job.json")
        with open(job_file_path, 'w') as f:
            json.dump(job, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving job: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)