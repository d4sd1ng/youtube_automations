#!/bin/bash
#
# Startskript für alle Python-Agenten
#

echo "Starte alle Python-Agenten..."

# Funktion zum Starten eines Agenten
start_agent() {
    local agent_name=$1
    local port=$2
    local agent_dir="Agents/${agent_name}"

    if [ -d "$agent_dir" ]; then
        echo "Starte $agent_name auf Port $port..."
        cd "$agent_dir"
        # Setze den Port in der app.py
        sed -i "s/app.run(host='0.0.0.0', port=[0-9]*/app.run(host='0.0.0.0', port=$port/" app.py
        # Starte den Agenten im Hintergrund
        python app.py > "../logs/${agent_name}.log" 2>&1 &
        echo "$agent_name gestartet (PID: $!)"
        cd ../..
    else
        echo "Warnung: $agent_dir nicht gefunden"
    fi
}

# Erstelle Logs-Verzeichnis falls nicht vorhanden
mkdir -p logs

# Starte alle Agenten
start_agent "web-scraping-python" 5000
start_agent "trend-analysis-python" 5001
start_agent "script-generation-python" 5002
start_agent "seo-optimization-python" 5003
start_agent "thumbnail-generation-python" 5004
start_agent "video-processing-python" 5005
start_agent "translation-python" 5006
start_agent "avatar-generation-python" 5007
start_agent "audio-processing-python" 5008
start_agent "content-approval-python" 5009
start_agent "approval-python" 5010
start_agent "content-planning-python" 5011
start_agent "analytics-python" 5012

echo "Alle Agenten gestartet!"
echo "Logs befinden sich im Verzeichnis logs/"