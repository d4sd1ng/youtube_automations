#!/bin/bash

# Quick Status Check Script for YouTube Automations (Linux/Ubuntu)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${CYAN}📊 YouTube Automations System Status${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

print_info "🐳 Docker Services:"
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps 2>/dev/null || echo "Docker Compose not available"
fi
echo ""

print_info "🌐 Service Health:"

# Check API
if curl -f http://localhost:3000/health &> /dev/null; then
    API_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null)
    if command -v python3 &> /dev/null; then
        API_STATUS=$(echo "$API_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        API_VERSION=$(echo "$API_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('version', 'unknown'))" 2>/dev/null || echo "unknown")
        print_success "API: $API_STATUS"
        echo "   Version: $API_VERSION"
    else
        print_success "API: Available"
    fi
else
    print_error "API: Not responding"
fi

# Check Web Interface
if curl -f http://localhost:3001 &> /dev/null; then
    print_success "Web Interface: Available"
else
    print_error "Web Interface: Not available"
fi

echo ""
print_info "💾 Database Status:"

# Check PostgreSQL
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        PG_STATUS=$(docker compose exec -T postgres pg_isready -U content_user 2>/dev/null || echo "error")
    else
        PG_STATUS=$(docker-compose exec -T postgres pg_isready -U content_user 2>/dev/null || echo "error")
    fi
    
    if [[ $PG_STATUS == *"accepting connections"* ]]; then
        print_success "PostgreSQL: Ready"
    else
        print_error "PostgreSQL: Not ready"
    fi
else
    print_error "Docker not available"
fi

# Check Redis
if [ -f .env ]; then
    REDIS_PASSWORD=$(grep REDIS_PASSWORD .env | cut -d= -f2)
    if docker compose version &> /dev/null; then
        REDIS_STATUS=$(docker compose exec -T redis redis-cli --pass "$REDIS_PASSWORD" ping 2>/dev/null || echo "error")
    else
        REDIS_STATUS=$(docker-compose exec -T redis redis-cli --pass "$REDIS_PASSWORD" ping 2>/dev/null || echo "error")
    fi
    
    if [[ $REDIS_STATUS == *"PONG"* ]]; then
        print_success "Redis: Ready"
    else
        print_error "Redis: Not ready"
    fi
fi

echo ""
echo -e "${YELLOW}🔗 Access URLs:${NC}"
echo "  Web Interface: http://localhost:3001"
echo "  API Endpoint: http://localhost:3000"
echo "  Health Check: http://localhost:3000/health"
echo ""
echo -e "${YELLOW}📋 Management:${NC}"
echo "  Full Status: ./scripts/manage.sh status"
echo "  View Logs: ./scripts/manage.sh logs"
echo "  Test System: ./scripts/manage.sh test"
echo "  Start System: ./scripts/manage.sh start"