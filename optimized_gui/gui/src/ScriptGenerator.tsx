import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ScriptGenerationOptions {
  contentType: string;
  targetLength: string;
  tone: string;
  topic: string;
  sourceContent: any[];
  trendingKeywords: string[];
  audience: string;
  customInstructions: string;
  language: string;
}

interface GeneratedScript {
  id: string;
  topic: string;
  contentType: string;
  targetLength: string;
  tone: string;
  script: {
    sections: { [key: string]: string };
    fullText: string;
    wordCount: number;
    estimatedDuration: number;
    readingTime: number;
  };
  metadata: {
    trendingKeywords: string[];
    audience: string;
    language: string;
    sourceContentCount: number;
    customInstructions: string;
    generatedAt: string;
    processingTime: number;
    typeConfig: string;
    toneCharacteristics: string[];
  };
  optimization: {
    targetWords: number;
    actualWords: number;
    lengthOptimization: string;
    paceRecommendation: string;
    focusArea: string;
  };
}

interface ScriptStats {
  totalScripts: number;
  contentTypeDistribution: { [key: string]: number };
  lengthDistribution: { [key: string]: number };
  toneDistribution: { [key: string]: number };
  averageWordCount: number;
  averageDuration: number;
  latestScript: string | null;
  supportedContentTypes: string[];
  supportedLengths: string[];
  supportedTones: string[];
}

interface ScriptGeneratorProps {
  apiBase: string;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ apiBase }) => {
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [scriptHistory, setScriptHistory] = useState<GeneratedScript[]>([]);
  const [stats, setStats] = useState<ScriptStats | null>(null);
  
  // Form state
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('explanation');
  const [targetLength, setTargetLength] = useState('5min');
  const [tone, setTone] = useState('informativ');
  const [audience, setAudience] = useState('alle');
  const [customInstructions, setCustomInstructions] = useState('');
  const [trendingKeywords, setTrendingKeywords] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'stats'>('generator');
  
  // Available options
  const contentTypes = {
    'news': 'News & Aktuelles',
    'tutorial': 'Tutorial & How-To',
    'review': 'Review & Bewertung',
    'entertainment': 'Entertainment & Lifestyle',
    'explanation': 'Erklärung & Deep Dive'
  };
  
  const lengths = {
    '30s': '30 Sekunden (Shorts)',
    '1min': '1 Minute (Kurz)',
    '5min': '5 Minuten (Standard)',
    '10min': '10 Minuten (Ausführlich)',
    '15min': '15 Minuten (Deep Dive)'
  };
  
  const tones = {
    'informativ': 'Informativ & Faktisch',
    'unterhaltsam': 'Unterhaltsam & Engaging',
    'educational': 'Educational & Lehrreich',
    'überzeugend': 'Überzeugend & Motivierend',
    'persönlich': 'Persönlich & Authentisch'
  };

  useEffect(() => {
    loadScriptHistory();
    loadStats();
  }, []);

  const loadScriptHistory = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/scripts/list`);
      if (response.data.success) {
        setScriptHistory(response.data.scripts);
      }
    } catch (error: any) {
      console.error('Failed to load script history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/scripts/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const generateScript = async () => {
    if (!topic.trim()) {
      setError('Bitte gib ein Thema ein');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const options: ScriptGenerationOptions = {
        contentType,
        targetLength,
        tone,
        topic: topic.trim(),
        sourceContent: sourceContent.trim() ? [sourceContent.trim()] : [],
        trendingKeywords: trendingKeywords.split(',').map(k => k.trim()).filter(k => k),
        audience,
        customInstructions,
        language: 'de'
      };

      const response = await axios.post(`${apiBase}/api/scripts/generate`, options);
      
      if (response.data.success) {
        setGeneratedScript(response.data.script);
        await loadScriptHistory();
        await loadStats();
        setActiveTab('generator'); // Stay on generator to show result
      } else {
        setError('Script-Generierung fehlgeschlagen: ' + (response.data.error || 'Unbekannter Fehler'));
      }
    } catch (error: any) {
      setError('Script-Generierung fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const viewScript = async (scriptId: string) => {
    try {
      const response = await axios.get(`${apiBase}/api/scripts/${scriptId}`);
      if (response.data.success) {
        setGeneratedScript(response.data.script);
        setActiveTab('generator');
      }
    } catch (error: any) {
      setError('Fehler beim Laden des Scripts: ' + error.message);
    }
  };

  const deleteScript = async (scriptId: string) => {
    if (!confirm('Script wirklich löschen?')) return;
    
    try {
      await axios.delete(`${apiBase}/api/scripts/${scriptId}`);
      await loadScriptHistory();
      await loadStats();
      
      if (generatedScript?.id === scriptId) {
        setGeneratedScript(null);
      }
    } catch (error: any) {
      setError('Fehler beim Löschen: ' + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Text copied to clipboard');
    });
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getOptimizationColor = (optimization: string): string => {
    switch (optimization) {
      case 'optimal': return '#4caf50';
      case 'too_long': return '#ff9800';
      case 'too_short': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="script-generator">
      <div className="section-header">
        <h2>📝 Script-Generator</h2>
        <p>Erstelle professionelle YouTube-Scripts basierend auf deinen Inhalten und aktuellen Trends.</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          🎬 Script Generator
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 Script History ({scriptHistory.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistiken
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <div className="generator-section">
          <div className="generator-form">
            <h3>🔧 Script-Konfiguration</h3>
            
            <div className="form-grid">
              {/* Topic Input */}
              <div className="form-field full-width">
                <label>Thema/Topic: <span className="required">*</span></label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="z.B. 'KI-Revolution 2024' oder 'Beste Smartphones unter 500€'"
                  className="topic-input"
                />
              </div>
              
              {/* Content Type */}
              <div className="form-field">
                <label>Content-Typ:</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                  {Object.entries(contentTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Target Length */}
              <div className="form-field">
                <label>Ziel-Länge:</label>
                <select value={targetLength} onChange={(e) => setTargetLength(e.target.value)}>
                  {Object.entries(lengths).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Tone */}
              <div className="form-field">
                <label>Ton & Stil:</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  {Object.entries(tones).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Audience */}
              <div className="form-field">
                <label>Zielgruppe:</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="z.B. 'Tech-Interessierte', 'Anfänger', 'Experten'"
                />
              </div>
              
              {/* Trending Keywords */}
              <div className="form-field full-width">
                <label>Trending Keywords (optional):</label>
                <input
                  type="text"
                  value={trendingKeywords}
                  onChange={(e) => setTrendingKeywords(e.target.value)}
                  placeholder="Komma-getrennt: AI, Machine Learning, ChatGPT"
                />
              </div>
              
              {/* Source Content */}
              <div className="form-field full-width">
                <label>Quelle/Basis-Content (optional):</label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Paste hier relevanten Inhalt, Artikel-Text, oder wichtige Punkte ein..."
                  rows={4}
                />
              </div>
              
              {/* Custom Instructions */}
              <div className="form-field full-width">
                <label>Zusätzliche Anweisungen (optional):</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Spezielle Wünsche, Call-to-Actions, Besonderheiten..."
                  rows={3}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="action-panel">
              <button
                onClick={generateScript}
                disabled={isGenerating || !topic.trim()}
                className="generate-btn"
              >
                {isGenerating ? '⏳ Generiere Script...' : '🚀 Script Erstellen'}
              </button>
            </div>
          </div>

          {/* Generated Script Display */}
          {generatedScript && (
            <div className="script-result">
              <div className="script-header">
                <h3>📄 Generiertes Script</h3>
                <div className="script-meta">
                  <span className="script-type">{contentTypes[generatedScript.contentType as keyof typeof contentTypes]}</span>
                  <span className="script-length">{lengths[generatedScript.targetLength as keyof typeof lengths]}</span>
                  <span className="script-tone">{tones[generatedScript.tone as keyof typeof tones]}</span>
                </div>
              </div>

              {/* Script Metrics */}
              <div className="script-metrics">
                <div className="metric-card">
                  <div className="metric-value">{generatedScript.script.wordCount}</div>
                  <div className="metric-label">Wörter</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{formatDuration(generatedScript.script.estimatedDuration)}</div>
                  <div className="metric-label">Sprech-Zeit</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{formatDuration(generatedScript.script.readingTime)}</div>
                  <div className="metric-label">Lese-Zeit</div>
                </div>
                <div className="metric-card">
                  <div 
                    className="metric-value"
                    style={{ color: getOptimizationColor(generatedScript.optimization.lengthOptimization) }}
                  >
                    {generatedScript.optimization.lengthOptimization === 'optimal' ? '✅' : 
                     generatedScript.optimization.lengthOptimization === 'too_long' ? '⚠️' : '📏'}
                  </div>
                  <div className="metric-label">Längen-Opt.</div>
                </div>
              </div>

              {/* Script Sections */}
              <div className="script-sections">
                <h4>📋 Script-Abschnitte</h4>
                {Object.entries(generatedScript.script.sections).map(([section, content]) => (
                  <div key={section} className="script-section">
                    <div className="section-header">
                      <h5>{section.replace(/_/g, ' ').toUpperCase()}</h5>
                      <button 
                        onClick={() => copyToClipboard(content)}
                        className="copy-btn"
                        title="In Zwischenablage kopieren"
                      >
                        📋
                      </button>
                    </div>
                    <div className="section-content">{content}</div>
                  </div>
                ))}
              </div>

              {/* Full Script */}
              <div className="full-script">
                <div className="full-script-header">
                  <h4>📜 Vollständiges Script</h4>
                  <button 
                    onClick={() => copyToClipboard(generatedScript.script.fullText)}
                    className="copy-btn-large"
                  >
                    📋 Gesamtes Script kopieren
                  </button>
                </div>
                <div className="full-script-content">
                  {generatedScript.script.fullText}
                </div>
              </div>

              {/* Script Details */}
              <div className="script-details">
                <h4>📊 Script-Details</h4>
                <div className="details-grid">
                  <div className="detail-row">
                    <span>Generiert am:</span>
                    <span>{new Date(generatedScript.metadata.generatedAt).toLocaleString('de-DE')}</span>
                  </div>
                  <div className="detail-row">
                    <span>Verarbeitungszeit:</span>
                    <span>{generatedScript.metadata.processingTime}ms</span>
                  </div>
                  <div className="detail-row">
                    <span>Trending Keywords:</span>
                    <span>{generatedScript.metadata.trendingKeywords.join(', ') || 'Keine'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Zielgruppe:</span>
                    <span>{generatedScript.metadata.audience}</span>
                  </div>
                  <div className="detail-row">
                    <span>Ton-Charakteristika:</span>
                    <span>{generatedScript.metadata.toneCharacteristics.join(', ')}</span>
                  </div>
                  <div className="detail-row">
                    <span>Optimierungsempfehlung:</span>
                    <span>{generatedScript.optimization.paceRecommendation} | {generatedScript.optimization.focusArea}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="history-section">
          <h3>📚 Script-Historie</h3>
          
          {scriptHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Noch keine Scripts generiert. Erstelle dein erstes Script im Generator-Tab.</p>
            </div>
          ) : (
            <div className="script-list">
              {scriptHistory.map((script) => (
                <div key={script.id} className="script-card">
                  <div className="script-card-header">
                    <h4>{script.topic}</h4>
                    <div className="script-card-actions">
                      <button 
                        onClick={() => viewScript(script.id)}
                        className="view-btn"
                      >
                        👁️ Anzeigen
                      </button>
                      <button 
                        onClick={() => deleteScript(script.id)}
                        className="delete-btn"
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                  </div>
                  
                  <div className="script-card-meta">
                    <span className="meta-item">{contentTypes[script.contentType as keyof typeof contentTypes]}</span>
                    <span className="meta-item">{lengths[script.targetLength as keyof typeof lengths]}</span>
                    <span className="meta-item">{tones[script.tone as keyof typeof tones]}</span>
                  </div>
                  
                  <div className="script-card-stats">
                    <div className="stat">
                      <span>{script.script.wordCount} Wörter</span>
                    </div>
                    <div className="stat">
                      <span>{formatDuration(script.script.estimatedDuration)}</span>
                    </div>
                    <div className="stat">
                      <span 
                        style={{ color: getOptimizationColor(script.optimization.lengthOptimization) }}
                      >
                        {script.optimization.lengthOptimization === 'optimal' ? '✅ Optimal' : 
                         script.optimization.lengthOptimization === 'too_long' ? '⚠️ Zu lang' : '📏 Zu kurz'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="script-card-date">
                    {new Date(script.metadata.generatedAt).toLocaleString('de-DE')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="stats-section">
          <h3>📊 Script-Statistiken</h3>
          
          {/* Overview Stats */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-value">{stats.totalScripts}</div>
              <div className="stat-label">Gesamt Scripts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageWordCount}</div>
              <div className="stat-label">⌀ Wörter</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatDuration(stats.averageDuration)}</div>
              <div className="stat-label">⌀ Dauer</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.supportedContentTypes.length}</div>
              <div className="stat-label">Content-Typen</div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="distributions">
            <div className="distribution-card">
              <h4>📊 Content-Typ Verteilung</h4>
              <div className="distribution-list">
                {Object.entries(stats.contentTypeDistribution).map(([type, count]) => (
                  <div key={type} className="distribution-item">
                    <span className="dist-label">{contentTypes[type as keyof typeof contentTypes]}</span>
                    <span className="dist-value">{count}</span>
                    <div className="dist-bar">
                      <div 
                        className="dist-fill"
                        style={{ width: `${(count / stats.totalScripts) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution-card">
              <h4>⏱️ Längen Verteilung</h4>
              <div className="distribution-list">
                {Object.entries(stats.lengthDistribution).map(([length, count]) => (
                  <div key={length} className="distribution-item">
                    <span className="dist-label">{lengths[length as keyof typeof lengths]}</span>
                    <span className="dist-value">{count}</span>
                    <div className="dist-bar">
                      <div 
                        className="dist-fill"
                        style={{ width: `${(count / stats.totalScripts) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution-card">
              <h4>🎭 Ton Verteilung</h4>
              <div className="distribution-list">
                {Object.entries(stats.toneDistribution).map(([tone, count]) => (
                  <div key={tone} className="distribution-item">
                    <span className="dist-label">{tones[tone as keyof typeof tones]}</span>
                    <span className="dist-value">{count}</span>
                    <div className="dist-bar">
                      <div 
                        className="dist-fill"
                        style={{ width: `${(count / stats.totalScripts) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supported Features */}
          <div className="supported-features">
            <div className="feature-card">
              <h4>📝 Unterstützte Content-Typen</h4>
              <div className="feature-list">
                {stats.supportedContentTypes.map(type => (
                  <span key={type} className="feature-tag">{contentTypes[type as keyof typeof contentTypes]}</span>
                ))}
              </div>
            </div>

            <div className="feature-card">
              <h4>⏱️ Verfügbare Längen</h4>
              <div className="feature-list">
                {stats.supportedLengths.map(length => (
                  <span key={length} className="feature-tag">{lengths[length as keyof typeof lengths]}</span>
                ))}
              </div>
            </div>

            <div className="feature-card">
              <h4>🎭 Verfügbare Töne</h4>
              <div className="feature-list">
                {stats.supportedTones.map(tone => (
                  <span key={tone} className="feature-tag">{tones[tone as keyof typeof tones]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;