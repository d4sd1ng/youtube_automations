# SEO Channel Optimization Agent Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application
COPY . .

# Expose port (if needed for future extensions)
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]