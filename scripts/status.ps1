# Quick Status Check Script for YouTube Automations

Write-Host "📊 YouTube Automations System Status" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🐳 Docker Services:" -ForegroundColor Green
docker-compose ps
Write-Host ""

Write-Host "🌐 Service Health:" -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
    Write-Host "✅ API: $($health.status) - $($health.service)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($health.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API: Not responding" -ForegroundColor Red
}

try {
    Invoke-RestMethod -Uri "http://localhost:3001" -TimeoutSec 5 | Out-Null
    Write-Host "✅ Web Interface: Available" -ForegroundColor Green
} catch {
    Write-Host "❌ Web Interface: Not available" -ForegroundColor Red
}

Write-Host ""
Write-Host "💾 Database Status:" -ForegroundColor Green

# Check PostgreSQL
try {
    $pgReady = docker-compose exec -T postgres pg_isready -U content_user 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL: Ready" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL: Not ready" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL: Error checking status" -ForegroundColor Red
}

# Check Redis
try {
    $redisPassword = Get-Content .env | Where-Object { $_ -like "REDIS_PASSWORD=*" } | ForEach-Object { $_.Split("=")[1] }
    $redisPing = docker-compose exec -T redis redis-cli --pass $redisPassword ping 2>$null
    if ($redisPing -contains "PONG") {
        Write-Host "✅ Redis: Ready" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis: Not ready" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Redis: Error checking status" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Access URLs:" -ForegroundColor Yellow
Write-Host "  Web Interface: http://localhost:3001" -ForegroundColor White
Write-Host "  API Endpoint: http://localhost:3000" -ForegroundColor White
Write-Host "  Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "📋 Management:" -ForegroundColor Yellow
Write-Host "  Full Status: .\scripts\manage.ps1 status" -ForegroundColor Gray
Write-Host "  View Logs: .\scripts\manage.ps1 logs" -ForegroundColor Gray
Write-Host "  Test System: .\scripts\manage.ps1 test" -ForegroundColor Gray