# Dockerfile for Pipeline Orchestrator Agent
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Create necessary directories
RUN mkdir -p /app/data/jobs /app/data/outputs

# Expose port for WebSocket server
EXPOSE 8765

# Command to run the application
CMD ["python", "app.py"]