# Optimized GUI for Agent Management

This is the optimized graphical user interface for managing all Python agents in the system.

## Features

- Real-time monitoring of all agents
- Easy configuration and management
- Dark theme interface
- German language support

## Structure

- `app.py`: Main application entry point
- `config.py`: Configuration settings
- `src/`: Source code directory
- `static/`: Static files (CSS, JS, images)
- `templates/`: HTML templates
- `requirements.txt`: Python dependencies
- `Dockerfile`: Docker configuration

## Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

## Docker

To run in Docker:
```
docker build -t optimized-gui .
docker run -p 8000:8000 optimized-gui
```