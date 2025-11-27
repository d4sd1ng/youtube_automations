<<<<<<< HEAD
# AGENTS Projekt

## Projektübersicht

Dieses Projekt ist eine vollständige agentenbasierte Plattform, die ursprünglich auf JavaScript-Services basierte, aber vollständig zu Python-Agenten migriert wurde.

## Projektstatus

✅ **Alle Services wurden zu Agenten umgewandelt**

Das Projektziel, alle Services zu Agenten umzuwandeln, wurde erreicht. Alle Funktionalitäten sind jetzt in Python-Agenten implementiert.

## Python-Agenten

Alle Agenten befinden sich im Verzeichnis `Agents/` und folgen einer einheitlichen Struktur:

- `app.py` - Hauptanwendungsdatei
- `Dockerfile` - Containerisierungskonfiguration
- `requirements.txt` - Python-Abhängigkeiten
- `package.json` - Paketinformationen und Skripte
- `data/` - Datenverzeichnis für persistente Speicherung

### Verfügbare Agenten

1. analytics-python
2. analytics-reporting-python
3. approval-python
4. audio-processing-python
5. avatar-generation-python
6. book-writer-python
7. caption-generation-python
8. comment-response-python
9. community-management-python
10. competitor-analysis-python
11. content-approval-python
12. content-planning-python
13. engagement-python
14. enhanced-seo-optimization-python
15. hashtag-optimization-python
16. monetization-python
17. multiinput-python
18. orchestrator-python
19. performance-monitoring-python
20. pipeline-orchestrator-python
21. quality-check-python
22. scheduling-python
23. script-generation-python
24. seo-optimization-python
25. social-media-posting-python
26. social-media-scheduling-python
27. thumbnail-generation-python
28. translation-python
29. trend-analysis-python
30. video-discovery-python
31. video-processing-python
32. video-scheduler-python
33. web-scraping-python

## Veraltete JavaScript-Module

Die ursprünglichen JavaScript-Module im Verzeichnis `services/agent-controller/modules/` wurden durch die Python-Agenten ersetzt und sind nicht mehr in Gebrauch. Siehe `services/agent-controller/modules/README.md` für weitere Informationen.

## Projektziele

- ✅ Umwandlung aller Services zu Python-Agenten
- ✅ Einheitliche Agentenarchitektur
- ✅ Flache Projektstruktur mit allen Agenten auf einer Ebene
- ✅ Vollständige Funktionalität aller ursprünglichen Services in Python

## Nächste Schritte

- Testen aller Agenten
- Implementierung des Agenten-Orchestrators
- Integration aller Agenten in eine vollständige Pipeline
- Dokumentation der API-Endpunkte aller Agenten
- Durchführung des vollständigen Short-Erstellungs-Tests
=======

# 🎬 YouTube Automations - Workflow Orchestration System

A comprehensive platform for automated video content generation and distribution, featuring modular architecture with specialized services for content processing, AI-powered script generation, and multi-format video production.

## ✨ Features

- **🤖 Automated Content Generation**: AI-powered video script and content creation
- **🎥 Multi-Format Video Production**: Long-form and short-form content support
- **📊 Real-time Monitoring**: Web dashboard for workflow tracking and management
- **🔧 Modular Architecture**: Microservices-based design for scalability
- **🗄️ Persistent Data**: PostgreSQL database with Redis caching
- **🐳 Containerized Deployment**: Docker Compose for easy setup and management

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- PowerShell (for Windows management scripts)

### 1. Start the System
```powershell
# Start all services
.\scripts\manage.ps1 start

# Or use Docker Compose directly
docker-compose up -d
```

### 2. Access the Interface
- **Web Interface**: http://localhost:3001
- **API Endpoint**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 3. Create Your First Workflow
1. Open the web interface at http://localhost:3001
2. Enter a video topic (e.g., "AI Breakthrough 2024")
3. Select content type (AI Content, Political Content, etc.)
4. Click "Create Workflow"
5. Monitor progress in the dashboard

## 📋 Management Commands

```powershell
# Check system status
.\scripts\status.ps1

# Full management options
.\scripts\manage.ps1 start     # Start all services
.\scripts\manage.ps1 stop      # Stop all services  
.\scripts\manage.ps1 restart   # Restart services
.\scripts\manage.ps1 status    # Detailed status check
.\scripts\manage.ps1 logs      # View recent logs
.\scripts\manage.ps1 build     # Build services
.\scripts\manage.ps1 fresh     # Fresh start (deletes data)
.\scripts\manage.ps1 test      # Test all components
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Interface │ ── │  Agent Controller │ ── │   PostgreSQL    │
│   (React + TS)  │    │   (Node.js API)   │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                └────────────────────────┤
                                                         │
                               ┌─────────────────┐       │
                               │      Redis      │ ──────┘
                               │     (Cache)     │
                               └─────────────────┘
```

### Components

- **Agent Controller**: Core orchestration service handling workflow management
- **Web Interface**: React-based dashboard for user interaction and monitoring
- **PostgreSQL**: Primary database for workflow data and system state
- **Redis**: High-performance cache for temporary data and session management

## 🔌 API Endpoints

### Health & Status
- `GET /health` - System health check
- `GET /api/status` - Detailed service status

### Workflow Management
- `POST /api/workflow` - Create new workflow
- `GET /api/workflow/:id` - Get workflow details
- `GET /api/workflows` - List all workflows

### Example API Usage
```bash
# Create a new workflow
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI Breakthrough 2024",
    "type": "ai_content",
    "parameters": {
      "priority": "high",
      "outputFormat": "mp4"
    }
  }'

# Check workflow status
curl http://localhost:3000/api/workflow/wf_123456789
```

## 🛠️ Configuration

### Environment Variables (.env)
```bash
# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=your_redis_password
REDIS_HOST=localhost

# API
API_PORT=3000
GUI_PORT=3001

# Processing
MAX_CONCURRENT_WORKFLOWS=2
CPU_PROCESSING_THREADS=12
```

## 📁 Project Structure

```
youtube_automations/
├── services/
│   ├── agent-controller/     # Main API service
│   │   ├── server.js         # Express server
│   │   ├── package.json      # Node.js dependencies
│   │   └── Dockerfile        # Container config
│   └── gui/                  # React web interface
│       ├── src/              # React source code
│       ├── public/           # Static assets
│       ├── package.json      # React dependencies
│       └── Dockerfile        # Container config
├── scripts/
│   ├── manage.ps1            # Main management script
│   └── status.ps1            # Quick status check
├── docker-compose.yml        # Service orchestration
├── .env                      # Environment configuration
└── README.md                 # This file
```

## 🔍 Troubleshooting

### Common Issues

**Services won't start:**
```powershell
# Check Docker is running
docker --version

# View detailed logs
.\scripts\manage.ps1 logs

# Try fresh start
.\scripts\manage.ps1 fresh
```

**npm/Node.js errors:**
- The system uses containerized Node.js, so local npm isn't required
- If you see npm errors, restart Docker services

**Cannot access web interface:**
```powershell
# Check if services are running
.\scripts\status.ps1

# Test API connectivity
curl http://localhost:3000/health
```

**Database connection issues:**
```powershell
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U content_user

# View database logs
docker-compose logs postgres
```

### Getting Help

1. **Check Status**: Run `.\scripts\status.ps1` for overview
2. **View Logs**: Use `.\scripts\manage.ps1 logs` for detailed information
3. **Test Services**: Run `.\scripts\manage.ps1 test` for comprehensive testing
4. **Fresh Start**: Try `.\scripts\manage.ps1 fresh` to reset everything

## 🚧 Development Roadmap

### Planned Features
- [ ] Video processing service (Python + FFmpeg)
- [ ] AI/NLP service for content generation  
- [ ] Content scraping and analysis
- [ ] Automated scheduling system
- [ ] Performance analytics dashboard
- [ ] Multi-platform publishing
- [ ] Advanced workflow templates

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with `.\scripts\manage.ps1 test`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**🎯 Ready to create automated video content?** Start with `.\scripts\manage.ps1 start` and visit http://localhost:3001!

# youtube_automations
completly automatic content creation for yt fb linkdinn, X, insta and tiktok
>>>>>>> 0daaa2a1b4a4753b2136bed91f3dec3f80708fd3
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
