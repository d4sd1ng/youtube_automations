# Trend Analysis Agent Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY app.py .

# Create data directory
RUN mkdir -p /data

# Expose port (if needed for future API endpoints)
EXPOSE 8000

# Run the application
CMD ["python", "app.py"]