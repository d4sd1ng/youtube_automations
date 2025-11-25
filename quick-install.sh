#!/bin/bash
set -e

echo "YouTube Automations - Instant Setup"
echo "===================================="

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! docker compose version &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Create .env
cat > .env << 'ENVEOF'
NODE_ENV=development
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
MAX_CONCURRENT_WORKFLOWS=2
MAX_VIDEO_PROCESSING_JOBS=2
CPU_PROCESSING_THREADS=12
ENABLE_GPU_ACCELERATION=false
ENVEOF

# Create Docker Compose
cat > docker-compose.yml << 'DOCKEREOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: content_automation
      POSTGRES_USER: content_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
volumes:
  postgres_data:
DOCKEREOF

# Start services
docker compose up -d

echo "✅ YouTube Automations System RUNNING!"
echo "🎯 PostgreSQL: localhost:5432"
echo "🎯 Redis: localhost:6379"
echo "📝 Add your API keys to .env file"
