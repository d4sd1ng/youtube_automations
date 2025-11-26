# Web Scraping Agent

Python-based agent for web scraping tasks.

## Features
- Political content scraping
- Technology content scraping
- General content scraping

## API Endpoints
- GET /health - Health check
- POST /scrape - Web scraping tasks

## Installation
1. Build Docker image: docker build -t web-scraping-agent .`n2. Run container: docker run -p 5006:5006 web-scraping-agent`n
## Usage
Send POST requests to /scrape with JSON payload containing:
- task: Scraping task (scrape_political_content, scrape_tech_content, scrape_general_content)
- keywords: List of keywords to search for
- sources: List of sources to scrape from
