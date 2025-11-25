import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  category: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Health & Status
  { method: 'GET', path: '/health', description: 'Systemgesundheitscheck', category: '🏥 Health & Status' },
  { method: 'GET', path: '/api/status', description: 'Detaillierter Servicestatus', category: '🏥 Health & Status' },
  
  // Agent & Workflow Management
  { method: 'POST', path: '/api/workflow', description: 'Neuen Workflow erstellen', category: '🤖 Agent & Workflow Management' },
  { method: 'GET', path: '/api/workflow/:id', description: 'Workflow-Details abrufen', category: '🤖 Agent & Workflow Management' },
  { method: 'GET', path: '/api/workflows', description: 'Alle Workflows auflisten', category: '🤖 Agent & Workflow Management' },
  { method: 'GET', path: '/api/agents/stats', description: 'Agentenstatistiken abrufen', category: '🤖 Agent & Workflow Management' },
  { method: 'POST', path: '/api/agents/predict', description: 'Predictive Processing starten', category: '🤖 Agent & Workflow Management' },
  
  // Audio Processing
  { method: 'POST', path: '/api/audio/analyze', description: 'Vollständige Audioanalyse (Transkription + Analyse)', category: '🎵 Audio Processing' },
  { method: 'POST', path: '/api/audio/transcribe', description: 'Einfache Audioumwandlung (NEU: Direkter Agentenzugriff)', category: '🎵 Audio Processing' },
  { method: 'POST', path: '/api/audio/key-points', description: 'Schlüsselpunkte und Themen aus Audio extrahieren (NEU)', category: '🎵 Audio Processing' },
  
  // Text Analysis
  { method: 'POST', path: '/api/text/analyze', description: 'Text analysieren und Schlüsselpunkte/Themen extrahieren (NEU)', category: '📝 Text Analysis' },
  { method: 'POST', path: '/api/text/key-points', description: 'Schlüsselpunkte und Themen aus Text extrahieren (NEU)', category: '📝 Text Analysis' },
  
  // Content Scraping & Trend Analysis
  { method: 'POST', path: '/api/scraping/execute', description: 'Umfassendes Content-Scraping durchführen', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'POST', path: '/api/scraping/search', description: 'Websuche durchführen', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'GET', path: '/api/scraping/stats', description: 'Scraping-Statistiken abrufen', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'GET', path: '/api/scraping/content', description: 'Gescrapte Inhalte abrufen', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'POST', path: '/api/scraping/start', description: 'Content-Scraping starten', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'GET', path: '/api/scraping/status', description: 'Scraping-Status abrufen', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'POST', path: '/api/trends/analyze', description: 'Trendanalyse starten', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'GET', path: '/api/trends/latest', description: 'Neueste Trends abrufen', category: '📊 Content Scraping & Trend Analysis' },
  { method: 'GET', path: '/api/trends/stats', description: 'Trend-Statistiken abrufen', category: '📊 Content Scraping & Trend Analysis' },
  
  // Pipeline Orchestration
  { method: 'POST', path: '/api/pipeline/create', description: 'Neuen Pipeline-Job erstellen', category: '🔄 Pipeline Orchestration' },
  { method: 'GET', path: '/api/pipeline/jobs', description: 'Alle Pipeline-Jobs auflisten', category: '🔄 Pipeline Orchestration' },
  { method: 'GET', path: '/api/pipeline/jobs/:jobId', description: 'Spezifischen Pipeline-Job abrufen', category: '🔄 Pipeline Orchestration' },
  { method: 'POST', path: '/api/pipeline/cancel', description: 'Pipeline-Job abbrechen', category: '🔄 Pipeline Orchestration' },
  { method: 'POST', path: '/api/pipeline/retry', description: 'Fehlgeschlagenen Pipeline-Job erneut versuchen', category: '🔄 Pipeline Orchestration' },
  { method: 'GET', path: '/api/pipeline/stats', description: 'Pipeline-Statistiken abrufen', category: '🔄 Pipeline Orchestration' },
  { method: 'GET', path: '/api/pipeline/templates', description: 'Verfügbare Pipeline-Templates abrufen', category: '🔄 Pipeline Orchestration' },
  { method: 'POST', path: '/api/pipeline/execute-step', description: 'Einzelnen Pipeline-Schritt ausführen', category: '🔄 Pipeline Orchestration' },
  { method: 'GET', path: '/api/pipeline/metrics', description: 'Pipeline-Metriken abrufen', category: '🔄 Pipeline Orchestration' },
  { method: 'POST', path: '/api/pipeline/scrape-and-analyze', description: 'Scraping und Analyse kombinieren', category: '🔄 Pipeline Orchestration' },
  
  // Dokumentenanalyse & Export
  { method: 'POST', path: '/api/analysis/export', description: 'Analyseergebnisse exportieren', category: '📄 Dokumentenanalyse & Export' },
  { method: 'GET', path: '/api/analysis/exports', description: 'Exportierte Dateien auflisten', category: '📄 Dokumentenanalyse & Export' },
  { method: 'GET', path: '/api/analysis/download/:filename', description: 'Exportierte Datei herunterladen', category: '📄 Dokumentenanalyse & Export' },
  { method: 'GET', path: '/api/analysis/stats', description: 'Analyse-Statistiken abrufen', category: '📄 Dokumentenanalyse & Export' },
  
  // Skriptgenerierung
  { method: 'POST', path: '/api/scripts/generate', description: 'Neues Skript generieren', category: '🧠 Skriptgenerierung' },
  { method: 'GET', path: '/api/scripts/:scriptId', description: 'Spezifisches Skript abrufen', category: '🧠 Skriptgenerierung' },
  { method: 'GET', path: '/api/scripts/list', description: 'Alle Skripte auflisten', category: '🧠 Skriptgenerierung' },
  { method: 'DELETE', path: '/api/scripts/:scriptId', description: 'Skript löschen', category: '🧠 Skriptgenerierung' },
  { method: 'GET', path: '/api/scripts/stats', description: 'Skriptgenerierungs-Statistiken abrufen', category: '🧠 Skriptgenerierung' },
  
  // Avatar-Generierung
  { method: 'POST', path: '/api/avatar/create', description: 'Neuen Avatar-Trainingsjob erstellen', category: '🤖 Avatar-Generierung' },
  { method: 'GET', path: '/api/avatar/jobs', description: 'Alle Avatar-Jobs auflisten', category: '🤖 Avatar-Generierung' },
  { method: 'GET', path: '/api/avatar/jobs/:jobId', description: 'Spezifischen Avatar-Job abrufen', category: '🤖 Avatar-Generierung' },
  { method: 'POST', path: '/api/avatar/generate/:avatarId', description: 'Avatar-Video generieren', category: '🤖 Avatar-Generierung' },
  { method: 'GET', path: '/api/avatar/stats', description: 'Avatar-Statistiken abrufen', category: '🤖 Avatar-Generierung' },
  { method: 'POST', path: '/api/avatar/cancel/:jobId', description: 'Avatar-Job abbrechen', category: '🤖 Avatar-Generierung' },
  { method: 'GET', path: '/api/avatar/templates', description: 'Verfügbare Avatar-Templates abrufen', category: '🤖 Avatar-Generierung' },
  { method: 'POST', path: '/api/avatar/templates/download', description: 'Avatar-Templates herunterladen', category: '🤖 Avatar-Generierung' },
  { method: 'GET', path: '/api/avatar/templates/progress', description: 'Fortschritt des Template-Downloads abrufen', category: '🤖 Avatar-Generierung' },
  { method: 'POST', path: '/api/avatar/templates/clear-cache', description: 'Avatar-Template-Cache leeren', category: '🤖 Avatar-Generierung' },
  
  // SEO-Optimierung
  { method: 'POST', path: '/api/seo/channel-description', description: 'SEO-konforme Kanalbeschreibung generieren', category: '🔍 SEO-Optimierung' },
  { method: 'POST', path: '/api/seo/video-description', description: 'SEO-konforme Videobeschreibung generieren', category: '🔍 SEO-Optimierung' },
  { method: 'POST', path: '/api/seo/batch-optimization', description: 'Batch-SEO-Optimierung für mehrere Videos', category: '🔍 SEO-Optimierung' },
  { method: 'GET', path: '/api/seo/templates', description: 'Verfügbare SEO-Templates abrufen', category: '🔍 SEO-Optimierung' },
  
  // Token & Kostenmonitoring
  { method: 'GET', path: '/api/tokens/content-types', description: 'Verfügbare Inhaltstypen für Kostenschätzung', category: '💰 Token & Kostenmonitoring' },
  { method: 'GET', path: '/api/tokens/estimate', description: 'Kostenschätzung für spezifischen Inhaltstyp', category: '💰 Token & Kostenmonitoring' },
  { method: 'GET', path: '/api/tokens/comparison', description: 'Anbieter-Kostenvergleich', category: '💰 Token & Kostenmonitoring' },
  { method: 'GET', path: '/api/tokens/projection', description: 'Monatliche Kostenprognose', category: '💰 Token & Kostenmonitoring' },
  { method: 'GET', path: '/api/tokens/providers', description: 'Verfügbare Token-Anbieter abrufen', category: '💰 Token & Kostenmonitoring' },
  { method: 'POST', path: '/api/tokens/providers/:provider/:model', description: 'Anbieterkosten aktualisieren', category: '💰 Token & Kostenmonitoring' },
  { method: 'GET', path: '/api/tokens/stats', description: 'Token-Statistiken abrufen', category: '💰 Token & Kostenmonitoring' },
  { method: 'GET', path: '/api/tokens/quota', description: 'Aktuelle Token-Quota-Nutzung', category: '💰 Token & Kostenmonitoring' },
  
  // Erweitertes Prompting
  { method: 'POST', path: '/api/prompts/generate', description: 'Optimiertes Prompt generieren', category: '🧠 Erweitertes Prompting' },
  { method: 'POST', path: '/api/prompts/test', description: 'Prompt-Test durchführen', category: '🧠 Erweitertes Prompting' },
  { method: 'GET', path: '/api/prompts/tests', description: 'Prompt-Testverlauf abrufen', category: '🧠 Erweitertes Prompting' },
  { method: 'GET', path: '/api/prompts/stats', description: 'Prompting-Statistiken abrufen', category: '🧠 Erweitertes Prompting' },
  
  // Multi-Input Processing
  { method: 'POST', path: '/api/multi-input/process', description: 'Multi-Input-Verarbeitung starten', category: '📥 Multi-Input Processing' },
  { method: 'GET', path: '/api/multi-input/jobs/:jobId', description: 'Spezifischen Multi-Input-Job abrufen', category: '📥 Multi-Input Processing' },
  { method: 'POST', path: '/api/multi-input/cancel/:jobId', description: 'Multi-Input-Job abbrechen', category: '📥 Multi-Input Processing' },
  { method: 'GET', path: '/api/multi-input/stats', description: 'Multi-Input-Statistiken abrufen', category: '📥 Multi-Input Processing' },
  
  // Systemkonfiguration & Steuerung
  { method: 'GET', path: '/api/system/control', description: 'Systemsteuerungsstatus abrufen', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'POST', path: '/api/system/control', description: 'System starten/stoppen', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'POST', path: '/api/system/weekend-pause', description: 'Wochenendpause umschalten', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'GET', path: '/api/system/api-status', description: 'Externe API-Konfigurationsstatus', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'GET', path: '/api/system/optimizations', description: 'Systemoptimierungsstatus', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'GET', path: '/api/system/token-usage', description: 'Token-Nutzungsstatistiken', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'GET', path: '/api/system/cache/stats', description: 'Cache-Statistiken abrufen', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'POST', path: '/api/system/cache/clear', description: 'Cache leeren', category: '🛠️ Systemkonfiguration & Steuerung' },
  { method: 'GET', path: '/api/youtube/config-status', description: 'YouTube-API-Konfigurationsstatus', category: '🛠️ Systemkonfiguration & Steuerung' },
  
  // Pipeline-Testing
  { method: 'POST', path: '/api/pipeline/test/run-suite', description: 'Test-Suite ausführen', category: '🧪 Pipeline-Testing' },
  { method: 'POST', path: '/api/pipeline/test/scenario/:scenarioId', description: 'Spezifisches Testszenario ausführen', category: '🧪 Pipeline-Testing' },
  { method: 'POST', path: '/api/pipeline/test/recovery/:scenarioId', description: 'Fehlerwiederherstellungstest ausführen', category: '🧪 Pipeline-Testing' },
  { method: 'GET', path: '/api/pipeline/test/stats', description: 'Test-Statistiken abrufen', category: '🧪 Pipeline-Testing' },
  { method: 'GET', path: '/api/pipeline/test/scenarios', description: 'Verfügbare Testszenarien abrufen', category: '🧪 Pipeline-Testing' },
  { method: 'GET', path: '/api/pipeline/test/results/latest', description: 'Neueste Testergebnisse abrufen', category: '🧪 Pipeline-Testing' },
];

interface ApiControllerProps {
  apiBase: string;
}

const ApiController: React.FC<ApiControllerProps> = ({ apiBase }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Extrahiere einzigartige Kategorien
    const uniqueCategories = Array.from(
      new Set(API_ENDPOINTS.map(endpoint => endpoint.category))
    ).sort();
    setCategories(uniqueCategories);
  }, []);

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    if (selectedIndex >= 0 && selectedIndex < API_ENDPOINTS.length) {
      setSelectedEndpoint(API_ENDPOINTS[selectedIndex]);
      setRequestBody('');
      setResponse('');
      setError('');
    }
  };

  const handleExecute = async () => {
    if (!selectedEndpoint) {
      setError('Bitte wählen Sie einen API-Endpunkt aus');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      let result;
      const url = `${apiBase}${selectedEndpoint.path.replace('/:id', '/123').replace('/:jobId', '/456').replace('/:scriptId', '/789').replace('/:scenarioId', '/999').replace('/:filename', '/test.txt').replace('/:provider/:model', '/openai/gpt-4')}`;
      
      switch (selectedEndpoint.method) {
        case 'GET':
          result = await axios.get(url);
          break;
        case 'POST':
          const body = requestBody ? JSON.parse(requestBody) : {};
          result = await axios.post(url, body);
          break;
        case 'PUT':
          const putBody = requestBody ? JSON.parse(requestBody) : {};
          result = await axios.put(url, putBody);
          break;
        case 'DELETE':
          result = await axios.delete(url);
          break;
        default:
          throw new Error(`Nicht unterstützte Methode: ${selectedEndpoint.method}`);
      }

      setResponse(JSON.stringify(result.data, null, 2));
    } catch (err: any) {
      setError(`Fehler: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-controller">
      <h2>🎛️ API Controller</h2>
      <p>Wählen Sie einen API-Endpunkt aus der Dropdown-Liste aus und führen Sie ihn aus.</p>
      
      <div className="api-controller-form">
        <div className="form-group">
          <label htmlFor="endpoint-select">API-Endpunkt:</label>
          <select 
            id="endpoint-select"
            onChange={handleEndpointChange}
            className="endpoint-select"
          >
            <option value="">-- API-Endpunkt auswählen --</option>
            {categories.map((category, catIndex) => (
              <optgroup label={category} key={catIndex}>
                {API_ENDPOINTS.filter(ep => ep.category === category).map((endpoint, index) => {
                  const globalIndex = API_ENDPOINTS.findIndex(ep => ep.path === endpoint.path && ep.method === endpoint.method);
                  return (
                    <option key={globalIndex} value={globalIndex}>
                      [{endpoint.method}] {endpoint.path} - {endpoint.description}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>

        {selectedEndpoint && (
          <>
            <div className="endpoint-details">
              <h3>Ausgewählter Endpunkt:</h3>
              <p><strong>Methode:</strong> {selectedEndpoint.method}</p>
              <p><strong>Pfad:</strong> {selectedEndpoint.path}</p>
              <p><strong>Beschreibung:</strong> {selectedEndpoint.description}</p>
              <p><strong>Kategorie:</strong> {selectedEndpoint.category}</p>
            </div>

            {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
              <div className="form-group">
                <label htmlFor="request-body">Request Body (JSON):</label>
                <textarea
                  id="request-body"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder={`{
  "key": "value"
}`}
                  rows={6}
                  className="request-body"
                />
              </div>
            )}

            <button 
              onClick={handleExecute}
              disabled={loading}
              className="execute-button"
            >
              {loading ? '⏳ Ausführen...' : `🚀 ${selectedEndpoint.method} Ausführen`}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="error-banner">
          ❌ {error}
        </div>
      )}

      {response && (
        <div className="response-section">
          <h3>📤 Response:</h3>
          <pre className="response-text">{response}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiController;