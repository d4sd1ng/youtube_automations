# Book Writer Python Agent

## Description
The Book Writer Python Agent is a comprehensive service for automated book creation, from initial concept to final publication. It handles content planning, research, writing, formatting, and publishing across multiple platforms.

## Features
- Complete book project management
- Content planning and structuring
- Automated research and interview management
- Market analysis and competitor research
- Chapter writing and content generation
- Visual content generation
- Multi-format book formatting (PDF, EPUB, MOBI, etc.)
- Publishing to various platforms
- Progress tracking and statistics

## Endpoints

### Health Check
```
GET /health
```

### Create Book Project
```
POST /create-book-project
```
Payload:
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "non-fiction",
  "description": "Book Description",
  "targetAudience": "General Audience",
  "language": "de",
  "wordCountTarget": 50000
}
```

### Plan Book Content
```
POST /plan-book-content
```
Payload:
```json
{
  "projectId": "book-project-id",
  "template": "standard",
  "customChapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "description": "Chapter Description"
    }
  ]
}
```

### Conduct Research
```
POST /conduct-research
```
Payload:
```json
{
  "projectId": "book-project-id",
  "topics": ["Topic 1", "Topic 2"]
}
```

### Conduct Interviews
```
POST /conduct-interviews
```
Payload:
```json
{
  "projectId": "book-project-id",
  "interviewees": ["Interviewee 1", "Interviewee 2"]
}
```

### Analyze Market
```
POST /analyze-market
```
Payload:
```json
{
  "projectId": "book-project-id",
  "competitors": ["Competitor Book 1", "Competitor Book 2"]
}
```

### Write Chapters
```
POST /write-chapters
```
Payload:
```json
{
  "projectId": "book-project-id",
  "chapterIds": ["chapter-1", "chapter-2"]
}
```

### Generate Visual Content
```
POST /generate-visual-content
```
Payload:
```json
{
  "projectId": "book-project-id",
  "visualElements": ["cover", "chapter_images"]
}
```

### Format Book
```
POST /format-book
```
Payload:
```json
{
  "projectId": "book-project-id",
  "formats": ["pdf", "epub", "mobi"]
}
```

### Publish Book
```
POST /publish-book
```
Payload:
```json
{
  "projectId": "book-project-id",
  "platforms": ["amazon", "apple-books"]
}
```

### Get Project Status
```
GET /project-status/<project_id>
```

### List Projects
```
GET /list-projects
```

### Get Statistics
```
GET /stats
```

## Installation
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the agent:
   ```
   python app.py
   ```

## Usage
The agent runs on port 5000 by default.