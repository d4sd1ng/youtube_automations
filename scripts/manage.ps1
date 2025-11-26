# YouTube Automations Management Script

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "build", "fresh", "test", "help")]
    [string]$Action = "help"
)

function Write-ColorText {
    param(
        [string]$Text,
        [ConsoleColor]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Show-Help {
    Write-ColorText "🎬 YouTube Automations Management Script" Cyan
    Write-ColorText "==========================================" Cyan
    Write-Host ""
    Write-ColorText "Usage: .\manage.ps1 [action]" Yellow
    Write-Host ""
    Write-ColorText "Available actions:" Green
    Write-ColorText "  start    - Start all services" White
    Write-ColorText "  stop     - Stop all services" White  
    Write-ColorText "  restart  - Restart all services" White
    Write-ColorText "  status   - Show service status" White
    Write-ColorText "  logs     - Show recent logs" White
    Write-ColorText "  build    - Build all services" White
    Write-ColorText "  fresh    - Fresh start (removes all data)" White
    Write-ColorText "  test     - Test all services" White
    Write-ColorText "  help     - Show this help" White
    Write-Host ""
    Write-ColorText "Examples:" Yellow
    Write-ColorText "  .\manage.ps1 start" Gray
    Write-ColorText "  .\manage.ps1 logs" Gray
    Write-ColorText "  .\manage.ps1 test" Gray
}

function Start-Services {
    Write-ColorText "🚀 Starting YouTube Automations..." Green
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "✅ Services started successfully!" Green
        Write-ColorText "🌐 Web Interface: http://localhost:3001" Cyan
        Write-ColorText "🔌 API: http://localhost:3000" Cyan
    } else {
        Write-ColorText "❌ Failed to start services" Red
    }
}

function Stop-Services {
    Write-ColorText "🛑 Stopping YouTube Automations..." Yellow
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "✅ Services stopped successfully!" Green
    } else {
        Write-ColorText "❌ Failed to stop services" Red
    }
}

function Restart-Services {
    Write-ColorText "🔄 Restarting YouTube Automations..." Yellow
    docker-compose restart
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "✅ Services restarted successfully!" Green
    } else {
        Write-ColorText "❌ Failed to restart services" Red
    }
}

function Show-Status {
    Write-ColorText "📊 YouTube Automations Status" Cyan
    Write-ColorText "=============================" Cyan
    Write-Host ""
    
    Write-ColorText "🐳 Docker Services:" Green
    docker-compose ps
    
    Write-Host ""
    Write-ColorText "🌐 Service Health Checks:" Green
    
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
        Write-ColorText "✅ API: $($health.status) - $($health.service)" Green
    } catch {
        Write-ColorText "❌ API: Unreachable" Red
    }
    
    try {
        Invoke-RestMethod -Uri "http://localhost:3001" -TimeoutSec 5 | Out-Null
        Write-ColorText "✅ Web Interface: Available" Green
    } catch {
        Write-ColorText "❌ Web Interface: Unreachable" Red
    }
    
    Write-Host ""
    Write-ColorText "🔗 Access URLs:" Yellow
    Write-ColorText "  Web Interface: http://localhost:3001" White
    Write-ColorText "  API Endpoint: http://localhost:3000" White
    Write-ColorText "  Health Check: http://localhost:3000/health" White
}

function Show-Logs {
    Write-ColorText "📜 Recent logs for all services:" Yellow
    docker-compose logs --tail=50
}

function Build-Services {
    Write-ColorText "🔨 Building services..." Yellow
    docker-compose build
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "✅ Services built successfully!" Green
    } else {
        Write-ColorText "❌ Failed to build services" Red
    }
}

function Fresh-Start {
    Write-ColorText "🆕 Fresh start (this will delete all data)..." Red
    $confirmation = Read-Host "This will delete all data. Continue? (y/N)"
    
    if ($confirmation -eq "y" -or $confirmation -eq "Y") {
        Write-ColorText "🗑️ Removing containers and volumes..." Yellow
        docker-compose down -v
        
        Write-ColorText "🔨 Building and starting fresh..." Yellow
        docker-compose up -d --build
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ Fresh start completed!" Green
        } else {
            Write-ColorText "❌ Fresh start failed" Red
        }
    } else {
        Write-ColorText "❌ Fresh start cancelled" Yellow
    }
}

function Test-Services {
    Write-ColorText "🧪 Testing all services..." Yellow
    Write-Host ""
    
    # Test API
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 10
        Write-ColorText "✅ API Health Check: $($health.status)" Green
        
        # Test workflow creation
        $workflow = Invoke-RestMethod -Uri "http://localhost:3000/api/workflow" -Method POST -Body (@{
            topic = "Test Video"
            type = "ai_content"
        } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
        
        Write-ColorText "✅ Workflow Creation: Success (ID: $($workflow.workflowId))" Green
        
    } catch {
        Write-ColorText "❌ API Tests Failed: $($_.Exception.Message)" Red
    }
    
    # Test Web Interface
    try {
        Invoke-RestMethod -Uri "http://localhost:3001" -TimeoutSec 10 | Out-Null
        Write-ColorText "✅ Web Interface: Available" Green
    } catch {
        Write-ColorText "❌ Web Interface: Failed" Red
    }
    
    # Test Database
    try {
        $dbTest = docker-compose exec -T postgres pg_isready -U content_user 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ PostgreSQL Database: Ready" Green
        } else {
            Write-ColorText "❌ PostgreSQL Database: Not Ready" Red
        }
    } catch {
        Write-ColorText "❌ PostgreSQL Database: Error" Red
    }
    
    # Test Redis
    try {
        $redisTest = docker-compose exec -T redis redis-cli --pass $(Get-Content .env | Where-Object { $_ -like "REDIS_PASSWORD=*" } | ForEach-Object { $_.Split("=")[1] }) ping 2>$null
        if ($redisTest -contains "PONG") {
            Write-ColorText "✅ Redis Cache: Ready" Green
        } else {
            Write-ColorText "❌ Redis Cache: Not Ready" Red
        }
    } catch {
        Write-ColorText "❌ Redis Cache: Error" Red
    }
    
    Write-Host ""
    Write-ColorText "🎯 Test Summary Complete!" Cyan
}

# Main execution
switch ($Action) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "status" { Show-Status }
    "logs" { Show-Logs }
    "build" { Build-Services }
    "fresh" { Fresh-Start }
    "test" { Test-Services }
    "help" { Show-Help }
    default { Show-Help }
}