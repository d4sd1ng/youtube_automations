# Path Management Agent Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Create directories for persistent data
RUN mkdir -p data/channels data/content data/templates data/seo data/monetization data/analytics data/logs

# Expose port (if needed for future extensions)
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]