import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PromptTestResult {
  testId: string;
  prompt: string;
  metadata: {
    section: string;
    contentType: string;
    targetLength: string;
    tone: string;
    estimatedTokens: number;
    optimizationLevel: string;
    qualityScore: number;
  };
  providerResults: {
    [provider: string]: {
      response?: string;
      responseTime?: number;
      tokenUsage?: {
        prompt: number;
        response: number;
        total: number;
      };
      quality?: number;
      cost?: {
        input: number;
        output: number;
        total: number;
      };
      error?: string;
      success?: boolean;
    };
  };
  recommendation: string;
}

interface PromptStats {
  totalTests: number;
  supportedContentTypes: string[];
  supportedLengths: string[];
  supportedTones: string[];
  tokenOptimization: {
    maxPromptTokens: number;
    maxResponseTokens: number;
    compressionStrategies: { [key: string]: number };
  };
  averageQuality: number;
  recentTests: Array<{
    testId: string;
    qualityScore: number;
    providers: string[];
    recommendation: string;
  }>;
}

interface PromptOptimizerProps {
  apiBase: string;
}

const PromptOptimizer: React.FC<PromptOptimizerProps> = ({ apiBase }) => {
  const [testResult, setTestResult] = useState<PromptTestResult | null>(null);
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [testHistory, setTestHistory] = useState<PromptTestResult[]>([]);
  
  // Test configuration
  const [section, setSection] = useState('hook');
  const [contentType, setContentType] = useState('explanation');
  const [targetLength, setTargetLength] = useState('5min');
  const [tone, setTone] = useState('informativ');
  const [topic, setTopic] = useState('');
  const [trendingKeywords, setTrendingKeywords] = useState('');
  const [audience, setAudience] = useState('alle');
  const [sourceContent, setSourceContent] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['ollama']);
  
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'optimizer' | 'history' | 'stats'>('optimizer');
  
  // Available options
  const contentTypes = {
    'news': 'News & Aktuelles',
    'tutorial': 'Tutorial & How-To',
    'review': 'Review & Bewertung',
    'entertainment': 'Entertainment & Lifestyle',
    'explanation': 'Erklärung & Deep Dive'
  };
  
  const sections = {
    'hook': 'Hook (Eröffnung)',
    'intro': 'Intro (Einführung)',
    'main_points': 'Hauptpunkte',
    'context': 'Kontext',
    'conclusion': 'Fazit',
    'cta': 'Call-to-Action'
  };
  
  const lengths = {
    '30s': '30 Sekunden',
    '1min': '1 Minute',
    '5min': '5 Minuten',
    '10min': '10 Minuten',
    '15min': '15 Minuten'
  };
  
  const tones = {
    'informativ': 'Informativ',
    'unterhaltsam': 'Unterhaltsam',
    'educational': 'Educational',
    'überzeugend': 'Überzeugend',
    'persönlich': 'Persönlich'
  };
  
  const providers = {
    'ollama': 'Ollama (Lokal)',
    'openai': 'OpenAI GPT',
    'anthropic': 'Anthropic Claude'
  };

  useEffect(() => {
    loadStats();
    loadTestHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/prompts/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Failed to load prompt stats:', error);
    }
  };

  const loadTestHistory = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/prompts/tests`);
      if (response.data.success) {
        setTestHistory(response.data.tests);
      }
    } catch (error: any) {
      console.error('Failed to load test history:', error);
    }
  };

  const runPromptTest = async () => {
    if (!topic.trim()) {
      setError('Bitte gib ein Thema ein');
      return;
    }

    setIsTesting(true);
    setError('');

    try {
      const testOptions = {
        section,
        contentType,
        targetLength,
        tone,
        topic: topic.trim(),
        trendingKeywords: trendingKeywords.split(',').map(k => k.trim()).filter(k => k),
        audience,
        sourceContent,
        customInstructions
      };

      const response = await axios.post(`${apiBase}/api/prompts/test`, {
        promptOptions: testOptions,
        testProviders: selectedProviders
      });
      
      if (response.data.success) {
        setTestResult(response.data.result);
        await loadStats();
        await loadTestHistory();
      } else {
        setError('Prompt-Test fehlgeschlagen: ' + (response.data.error || 'Unbekannter Fehler'));
      }
    } catch (error: any) {
      setError('Prompt-Test fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsTesting(false);
    }
  };

  const generateOptimizedPrompt = async () => {
    if (!topic.trim()) {
      setError('Bitte gib ein Thema ein');
      return;
    }

    try {
      const promptOptions = {
        section,
        contentType,
        targetLength,
        tone,
        topic: topic.trim(),
        trendingKeywords: trendingKeywords.split(',').map(k => k.trim()).filter(k => k),
        audience,
        sourceContent,
        customInstructions
      };

      const response = await axios.post(`${apiBase}/api/prompts/generate`, promptOptions);
      
      if (response.data.success) {
        // Show the generated prompt in a modal or separate section
        console.log('Generated prompt:', response.data.prompt);
        // Could implement a modal or expandable section here
      }
    } catch (error: any) {
      setError('Prompt-Generierung fehlgeschlagen: ' + error.message);
    }
  };

  const handleProviderToggle = (provider: string) => {
    setSelectedProviders(prev => 
      prev.includes(provider) 
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const getQualityColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#f44336';
  };

  const formatCost = (cost: number): string => {
    if (cost === 0) return 'Kostenlos';
    if (cost < 0.001) return '<$0.001';
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return `${tokens} tokens`;
    return `${(tokens / 1000).toFixed(1)}k tokens`;
  };

  return (
    <div className="prompt-optimizer">
      <div className="section-header">
        <h2>🧠 Advanced Prompt Optimizer</h2>
        <p>Teste und optimiere Prompts für verschiedene LLM-Provider mit spezialisierten Templates.</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'optimizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimizer')}
        >
          🔬 Prompt Optimizer
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 Test History ({testHistory.length})
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

      {/* Optimizer Tab */}
      {activeTab === 'optimizer' && (
        <div className="optimizer-section">
          <div className="optimizer-form">
            <h3>🔧 Prompt-Konfiguration</h3>
            
            <div className="form-grid">
              {/* Topic Input */}
              <div className="form-field full-width">
                <label>Thema/Topic: <span className="required">*</span></label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="z.B. 'KI-Revolution 2024' oder 'Beste Smartphones'"
                />
              </div>
              
              {/* Section Selection */}
              <div className="form-field">
                <label>Script-Abschnitt:</label>
                <select value={section} onChange={(e) => setSection(e.target.value)}>
                  {Object.entries(sections).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
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
                  placeholder="z.B. 'Tech-Interessierte', 'Anfänger'"
                />
              </div>
              
              {/* Trending Keywords */}
              <div className="form-field full-width">
                <label>Trending Keywords:</label>
                <input
                  type="text"
                  value={trendingKeywords}
                  onChange={(e) => setTrendingKeywords(e.target.value)}
                  placeholder="Komma-getrennt: AI, Machine Learning, ChatGPT"
                />
              </div>
              
              {/* Source Content */}
              <div className="form-field full-width">
                <label>Quell-Content:</label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Basis-Inhalt für den Prompt..."
                  rows={3}
                />
              </div>
              
              {/* Custom Instructions */}
              <div className="form-field full-width">
                <label>Zusätzliche Anweisungen:</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Spezielle Prompt-Anweisungen..."
                  rows={2}
                />
              </div>
            </div>

            {/* Provider Selection */}
            <div className="provider-selection">
              <h4>🤖 Test-Provider auswählen</h4>
              <div className="provider-grid">
                {Object.entries(providers).map(([key, label]) => (
                  <label key={key} className="provider-option">
                    <input
                      type="checkbox"
                      checked={selectedProviders.includes(key)}
                      onChange={() => handleProviderToggle(key)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-panel">
              <button
                onClick={generateOptimizedPrompt}
                disabled={!topic.trim()}
                className="generate-prompt-btn"
              >
                📝 Prompt Generieren
              </button>
              <button
                onClick={runPromptTest}
                disabled={isTesting || !topic.trim() || selectedProviders.length === 0}
                className="test-prompt-btn"
              >
                {isTesting ? '⏳ Teste...' : '🧪 Prompt Testen'}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="test-results">
              <div className="results-header">
                <h3>🧪 Test-Ergebnisse</h3>
                <div className="test-meta">
                  <span>Test-ID: {testResult.testId.slice(0, 8)}</span>
                  <span>Tokens: {formatTokens(testResult.metadata.estimatedTokens)}</span>
                  <span>Qualität: {testResult.metadata.qualityScore}%</span>
                </div>
              </div>

              {/* Generated Prompt */}
              <div className="generated-prompt">
                <h4>📄 Generierter Prompt</h4>
                <div className="prompt-display">
                  {testResult.prompt}
                </div>
                <div className="prompt-metadata">
                  <span>Optimierung: {testResult.metadata.optimizationLevel}</span>
                  <span>Geschätzte Tokens: {testResult.metadata.estimatedTokens}</span>
                </div>
              </div>

              {/* Provider Results */}
              <div className="provider-results">
                <h4>🤖 Provider-Vergleich</h4>
                <div className="provider-grid">
                  {Object.entries(testResult.providerResults).map(([provider, result]) => (
                    <div key={provider} className="provider-result-card">
                      <div className="provider-header">
                        <h5>{providers[provider as keyof typeof providers]}</h5>
                        {result.error ? (
                          <span className="status error">❌ Fehler</span>
                        ) : (
                          <span className="status success">✅ Erfolg</span>
                        )}
                      </div>
                      
                      {!result.error && result.quality !== undefined && (
                        <div className="provider-metrics">
                          <div className="metric">
                            <span className="metric-label">Qualität:</span>
                            <span 
                              className="metric-value"
                              style={{ color: getQualityColor(result.quality) }}
                            >
                              {Math.round(result.quality)}%
                            </span>
                          </div>
                          
                          <div className="metric">
                            <span className="metric-label">Antwortzeit:</span>
                            <span className="metric-value">{result.responseTime}ms</span>
                          </div>
                          
                          {result.tokenUsage && (
                            <div className="metric">
                              <span className="metric-label">Tokens:</span>
                              <span className="metric-value">{formatTokens(result.tokenUsage.total)}</span>
                            </div>
                          )}
                          
                          {result.cost && (
                            <div className="metric">
                              <span className="metric-label">Kosten:</span>
                              <span className="metric-value">{formatCost(result.cost.total)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {result.error && (
                        <div className="provider-error">
                          {result.error}
                        </div>
                      )}
                      
                      {result.response && (
                        <div className="provider-response">
                          <h6>Generierte Antwort:</h6>
                          <div className="response-text">
                            {result.response.substring(0, 200)}
                            {result.response.length > 200 && '...'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="recommendation">
                <h4>💡 Empfehlung</h4>
                <div className="recommendation-text">
                  {testResult.recommendation}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="history-section">
          <h3>📚 Test-Historie</h3>
          
          {testHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧪</div>
              <p>Noch keine Prompt-Tests durchgeführt. Starte deinen ersten Test im Optimizer-Tab.</p>
            </div>
          ) : (
            <div className="test-list">
              {testHistory.slice(0, 10).map((test) => (
                <div key={test.testId} className="test-card">
                  <div className="test-header">
                    <h4>Test {test.testId.slice(0, 8)}</h4>
                    <div className="test-quality">
                      <span 
                        style={{ color: getQualityColor(test.metadata.qualityScore) }}
                      >
                        {test.metadata.qualityScore}% Qualität
                      </span>
                    </div>
                  </div>
                  
                  <div className="test-config">
                    <span>{contentTypes[test.metadata.contentType as keyof typeof contentTypes]}</span>
                    <span>{sections[test.metadata.section as keyof typeof sections]}</span>
                    <span>{lengths[test.metadata.targetLength as keyof typeof lengths]}</span>
                    <span>{tones[test.metadata.tone as keyof typeof tones]}</span>
                  </div>
                  
                  <div className="test-providers">
                    <strong>Getestete Provider:</strong>
                    {Object.keys(test.providerResults).map(provider => (
                      <span key={provider} className="provider-tag">
                        {providers[provider as keyof typeof providers]}
                      </span>
                    ))}
                  </div>
                  
                  <div className="test-recommendation">
                    <strong>Empfehlung:</strong> {test.recommendation.substring(0, 100)}...
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
          <h3>📊 Prompt-Statistiken</h3>
          
          {/* Overview Stats */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-value">{stats.totalTests}</div>
              <div className="stat-label">Tests Durchgeführt</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(stats.averageQuality)}%</div>
              <div className="stat-label">⌀ Qualität</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatTokens(stats.tokenOptimization.maxPromptTokens)}</div>
              <div className="stat-label">Max Prompt Tokens</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.recentTests.length}</div>
              <div className="stat-label">Aktuelle Tests</div>
            </div>
          </div>

          {/* Token Optimization Settings */}
          <div className="token-optimization">
            <h4>⚡ Token-Optimierung</h4>
            <div className="optimization-grid">
              <div className="optimization-item">
                <span>Max Prompt Tokens:</span>
                <span>{stats.tokenOptimization.maxPromptTokens}</span>
              </div>
              <div className="optimization-item">
                <span>Max Response Tokens:</span>
                <span>{stats.tokenOptimization.maxResponseTokens}</span>
              </div>
              <div className="optimization-item">
                <span>Compression Strategien:</span>
                <div className="compression-strategies">
                  {Object.entries(stats.tokenOptimization.compressionStrategies).map(([level, ratio]) => (
                    <span key={level} className="strategy-tag">
                      {level}: {Math.round(ratio * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Supported Features */}
          <div className="supported-features">
            <div className="feature-section">
              <h4>📝 Content-Typen ({stats.supportedContentTypes.length})</h4>
              <div className="feature-tags">
                {stats.supportedContentTypes.map(type => (
                  <span key={type} className="feature-tag">
                    {contentTypes[type as keyof typeof contentTypes]}
                  </span>
                ))}
              </div>
            </div>

            <div className="feature-section">
              <h4>⏱️ Video-Längen ({stats.supportedLengths.length})</h4>
              <div className="feature-tags">
                {stats.supportedLengths.map(length => (
                  <span key={length} className="feature-tag">
                    {lengths[length as keyof typeof lengths]}
                  </span>
                ))}
              </div>
            </div>

            <div className="feature-section">
              <h4>🎭 Ton-Stile ({stats.supportedTones.length})</h4>
              <div className="feature-tags">
                {stats.supportedTones.map(tone => (
                  <span key={tone} className="feature-tag">
                    {tones[tone as keyof typeof tones]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Tests Overview */}
          {stats.recentTests.length > 0 && (
            <div className="recent-tests-overview">
              <h4>📈 Aktuelle Test-Performance</h4>
              <div className="recent-tests-grid">
                {stats.recentTests.map((test, index) => (
                  <div key={test.testId} className="recent-test-item">
                    <div className="test-id">Test #{index + 1}</div>
                    <div className="test-quality" style={{ color: getQualityColor(test.qualityScore) }}>
                      {test.qualityScore}%
                    </div>
                    <div className="test-providers">
                      {test.providers.length} Provider
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;