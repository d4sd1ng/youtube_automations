#!/bin/bash

# YouTube Automations Management Script for Ubuntu/Linux
# Usage: ./scripts/manage.sh [action]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}🎬 YouTube Automations Management${NC}"
    echo -e "${CYAN}=================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

show_help() {
    print_header
    echo ""
    echo -e "${YELLOW}Usage: ./scripts/manage.sh [action]${NC}"
    echo ""
    echo -e "${GREEN}Available actions:${NC}"
    echo "  start    - Start all services"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  status   - Show service status"
    echo "  logs     - Show recent logs"
    echo "  build    - Build all services"
    echo "  fresh    - Fresh start (removes all data)"
    echo "  test     - Test all services"
    echo "  install  - Install Docker (if needed)"
    echo "  help     - Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./scripts/manage.sh start"
    echo "  ./scripts/manage.sh logs"
    echo "  ./scripts/manage.sh test"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        print_info "Run: ./scripts/manage.sh install"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available!"
        print_info "Run: ./scripts/manage.sh install"
        exit 1
    fi
}

install_docker() {
    print_header
    print_info "Installing Docker on Ubuntu..."
    
    # Update package index
    sudo apt update
    
    # Install prerequisites
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index
    sudo apt update
    
    # Install Docker Engine
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    print_success "Docker installed successfully!"
    print_warning "Please log out and log back in for group changes to take effect"
    print_info "Or run: newgrp docker"
}

start_services() {
    print_header
    check_docker
    print_info "Starting YouTube Automations services..."
    
    # Use docker compose (new) or docker-compose (legacy)
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully!"
        echo ""
        print_info "Access URLs:"
        echo "  🌐 Web Interface: http://localhost:3001"
        echo "  🔌 API: http://localhost:3000"
        echo "  📊 Health Check: http://localhost:3000/health"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

stop_services() {
    print_header
    check_docker
    print_info "Stopping YouTube Automations services..."
    
    if docker compose version &> /dev/null; then
        docker compose down
    else
        docker-compose down
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Services stopped successfully!"
    else
        print_error "Failed to stop services"
    fi
}

restart_services() {
    print_header
    check_docker
    print_info "Restarting YouTube Automations services..."
    
    if docker compose version &> /dev/null; then
        docker compose restart
    else
        docker-compose restart
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Services restarted successfully!"
    else
        print_error "Failed to restart services"
    fi
}

show_status() {
    print_header
    check_docker
    
    echo ""
    print_info "🐳 Docker Services:"
    if docker compose version &> /dev/null; then
        docker compose ps
    else
        docker-compose ps
    fi
    
    echo ""
    print_info "🌐 Service Health Checks:"
    
    # Check API health
    if curl -f http://localhost:3000/health &> /dev/null; then
        API_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null || echo '{"status":"error"}')
        API_STATUS=$(echo $API_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        print_success "API: $API_STATUS"
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
    
    # Check Redis
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
    
    echo ""
    print_info "🔗 Access URLs:"
    echo "  Web Interface: http://localhost:3001"
    echo "  API Endpoint: http://localhost:3000"
    echo "  Health Check: http://localhost:3000/health"
}

show_logs() {
    print_header
    check_docker
    print_info "📜 Recent logs for all services:"
    
    if docker compose version &> /dev/null; then
        docker compose logs --tail=50
    else
        docker-compose logs --tail=50
    fi
}

build_services() {
    print_header
    check_docker
    print_info "🔨 Building services..."
    
    if docker compose version &> /dev/null; then
        docker compose build
    else
        docker-compose build
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Services built successfully!"
    else
        print_error "Failed to build services"
    fi
}

fresh_start() {
    print_header
    check_docker
    print_warning "🆕 Fresh start will delete ALL data!"
    
    read -p "This will delete all data. Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "🗑️ Removing containers and volumes..."
        if docker compose version &> /dev/null; then
            docker compose down -v
            print_info "🔨 Building and starting fresh..."
            docker compose up -d --build
        else
            docker-compose down -v
            print_info "🔨 Building and starting fresh..."
            docker-compose up -d --build
        fi
        
        if [ $? -eq 0 ]; then
            print_success "Fresh start completed!"
        else
            print_error "Fresh start failed"
        fi
    else
        print_warning "Fresh start cancelled"
    fi
}

test_services() {
    print_header
    check_docker
    print_info "🧪 Testing all services..."
    echo ""
    
    # Test API
    print_info "Testing API..."
    if API_RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null); then
        API_STATUS=$(echo $API_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        print_success "API Health Check: $API_STATUS"
        
        # Test workflow creation
        if WORKFLOW_RESPONSE=$(curl -s -X POST http://localhost:3000/api/workflow \
            -H "Content-Type: application/json" \
            -d '{"topic": "Test Video", "type": "ai_content"}' 2>/dev/null); then
            WORKFLOW_ID=$(echo $WORKFLOW_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('workflowId', 'unknown'))" 2>/dev/null || echo "unknown")
            print_success "Workflow Creation: Success (ID: $WORKFLOW_ID)"
        else
            print_error "Workflow Creation: Failed"
        fi
    else
        print_error "API Tests: Failed"
    fi
    
    # Test Web Interface
    print_info "Testing Web Interface..."
    if curl -f http://localhost:3001 &> /dev/null; then
        print_success "Web Interface: Available"
    else
        print_error "Web Interface: Failed"
    fi
    
    # Test Database
    print_info "Testing Database..."
    if docker compose version &> /dev/null; then
        DB_STATUS=$(docker compose exec -T postgres pg_isready -U content_user 2>/dev/null)
    else
        DB_STATUS=$(docker-compose exec -T postgres pg_isready -U content_user 2>/dev/null)
    fi
    
    if [[ $DB_STATUS == *"accepting connections"* ]]; then
        print_success "PostgreSQL Database: Ready"
    else
        print_error "PostgreSQL Database: Not Ready"
    fi
    
    # Test Redis
    print_info "Testing Redis..."
    REDIS_PASSWORD=$(grep REDIS_PASSWORD .env | cut -d= -f2)
    if docker compose version &> /dev/null; then
        REDIS_RESPONSE=$(docker compose exec -T redis redis-cli --pass "$REDIS_PASSWORD" ping 2>/dev/null)
    else
        REDIS_RESPONSE=$(docker-compose exec -T redis redis-cli --pass "$REDIS_PASSWORD" ping 2>/dev/null)
    fi
    
    if [[ $REDIS_RESPONSE == *"PONG"* ]]; then
        print_success "Redis Cache: Ready"
    else
        print_error "Redis Cache: Not Ready"
    fi
    
    echo ""
    print_success "🎯 Test Summary Complete!"
}

# Main execution
case "${1:-help}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "build")
        build_services
        ;;
    "fresh")
        fresh_start
        ;;
    "test")
        test_services
        ;;
    "install")
        install_docker
        ;;
    "help"|*)
        show_help
        ;;
esac