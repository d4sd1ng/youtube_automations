# Dockerfile for Thumbnail Generation Agent
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Expose port (if needed for API)
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]