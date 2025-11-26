import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TokenDashboard.css';

interface TokenBreakdown {
  step: string;
  aiRequired: boolean;
  inputTokens: number;
  outputTokens: number;
  audioMinutes: number;
  inputCost: number;
  outputCost: number;
  audioCost: number;
  totalCost: number;
}

interface CostEstimate {
  contentType: string;
  provider: string;
  model: string;
  summary: {
    totalSteps: number;
    aiRequiredSteps: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalAudioMinutes: number;
    totalInputCost: number;
    totalOutputCost: number;
    totalAudioCost: number;
    totalCost: number;
  };
  breakdown: Record<string, TokenBreakdown>;
}

interface ProviderComparison {
  [key: string]: {
    totalCost: number;
    totalTokens: number;
    costPerToken: number;
  };
}

interface MonthlyProjection {
  videosPerWeek: number;
  videosPerMonth: number;
  costPerVideo: number;
  monthlyTotal: number;
  breakdown: {
    inputTokensPerMonth: number;
    outputTokensPerMonth: number;
    totalTokensPerMonth: number;
  };
}

// NEW: Interface for quota information
interface QuotaInfo {
  dailyLimit: number;
  monthlyLimit: number;
  emergencyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  emergencyUsed: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  emergencyRemaining: number;
  lastReset: string;
}

interface TokenDashboardProps {
  apiBase: string;
}

const TokenDashboard: React.FC<TokenDashboardProps> = ({ apiBase }) => {
  const [selectedContentType, setSelectedContentType] = useState('ai_content');
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('llama2:7b');
  const [videosPerWeek, setVideosPerWeek] = useState(5);
  const [audioDuration, setAudioDuration] = useState(10);
  
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [providerComparison, setProviderComparison] = useState<ProviderComparison>({});
  const [monthlyProjection, setMonthlyProjection] = useState<MonthlyProjection | null>(null);
  // NEW: State for quota information
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [contentTypes, setContentTypes] = useState<Record<string, any>>({
    political_content: {
      description: 'Political analysis and commentary videos',
      steps: 9,
      avgTokens: 9450
    },
    ai_content: {
      description: 'AI and technology focused content', 
      steps: 9,
      avgTokens: 11850
    },
    viral_shorts: {
      description: 'Short-form viral content',
      steps: 8, 
      avgTokens: 3450
    },
    educational: {
      description: 'Educational and instructional content',
      steps: 9,
      avgTokens: 8650
    },
    audio_analysis: {
      description: 'Audio transcription and analysis',
      steps: 7,
      avgTokens: 7300
    },
    multimedia_analysis: {
      description: 'Multi-media content analysis', 
      steps: 6,
      avgTokens: 6500
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const providerOptions = {
    ollama: ['llama2:7b', 'codellama:7b', 'mistral:7b'],
    openai: ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4'],
    anthropic: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']
  };

  useEffect(() => {
    loadContentTypes();
    loadQuotaInfo(); // NEW: Load quota information on component mount
  }, []);

  useEffect(() => {
    if (selectedContentType) {
      calculateCosts();
    }
  }, [selectedContentType, selectedProvider, selectedModel, videosPerWeek, audioDuration]);

  const loadContentTypes = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/tokens/content-types`);
      setContentTypes(response.data.contentTypes);
    } catch (error) {
      console.error('Failed to load content types:', error);
      setError('Fehler beim Laden der Content-Typen');
    }
  };

  // NEW: Function to load quota information
  const loadQuotaInfo = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/tokens/quota`);
      setQuotaInfo(response.data);
    } catch (error) {
      console.error('Failed to load quota info:', error);
    }
  };

  const calculateCosts = async () => {
    if (!selectedContentType) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Calculating costs with params:', {
        contentType: selectedContentType,
        provider: selectedProvider,
        model: selectedModel,
        videosPerWeek,
        audioDuration
      });
      
      // Erhöhte Timeout-Einstellungen und bessere Fehlerbehandlung
      const config = {
        timeout: 30000, // 30 Sekunden Timeout
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      // Sequenzielle Anfragen statt paralleler, um Overhead zu reduzieren
      const estimateRes = await axios.get(`${apiBase}/api/tokens/estimate`, {
        params: { 
          contentType: selectedContentType, 
          provider: selectedProvider, 
          model: selectedModel,
          audioDuration 
        },
        ...config
      });
      
      const comparisonRes = await axios.get(`${apiBase}/api/tokens/comparison`, {
        params: { 
          contentType: selectedContentType,
          audioDuration 
        },
        ...config
      });
      
      const projectionRes = await axios.get(`${apiBase}/api/tokens/projection`, {
        params: { 
          contentType: selectedContentType, 
          provider: selectedProvider, 
          model: selectedModel, 
          videosPerWeek 
        },
        ...config
      });

      setCostEstimate(estimateRes.data);
      setProviderComparison(comparisonRes.data.comparison);
      setMonthlyProjection(projectionRes.data);
    } catch (error: any) {
      console.error('Cost calculation failed:', error);
      // Detaillierte Fehleranalyse
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setError('Netzwerkfehler: Verbindung zum API-Server konnte nicht hergestellt werden. Bitte überprüfen Sie die Netzwerkeinstellungen.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Zeitüberschreitung bei der API-Anfrage. Der Server braucht zu lange zum Antworten.');
      } else if (error.response) {
        // Server antwortete mit einem Fehlercode
        setError(`Serverfehler (${error.response.status}): ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        // Anfrage wurde gesendet, aber keine Antwort erhalten
        setError('Keine Antwort vom Server erhalten. Bitte überprüfen Sie die Netzwerkverbindung.');
      } else {
        // Anderer Fehler
        setError('Fehler bei der Kostenberechnung: ' + (error.message || 'Unbekannter Fehler'));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE').format(Math.round(num));
  };

  // NEW: Function to get quota usage percentage
  const getUsagePercentage = (used: number, limit: number): number => {
    return Math.min(100, Math.max(0, (used / limit) * 100));
  };

  // NEW: Function to get quota status color
  const getQuotaStatusColor = (percentage: number): string => {
    if (percentage < 50) return '#4caf50'; // Green
    if (percentage < 80) return '#ffc107'; // Yellow
    if (percentage < 95) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getCostColor = (cost: number): string => {
    if (cost === 0) return '#4caf50'; // Green for free
    if (cost < 0.01) return '#8bc34a'; // Light green for very cheap
    if (cost < 0.05) return '#ffc107'; // Yellow for moderate
    if (cost < 0.20) return '#ff9800'; // Orange for expensive
    return '#f44336'; // Red for very expensive
  };

  const getStepIcon = (step: string): string => {
    const icons: Record<string, string> = {
      research: '🔍',
      outline: '📝',
      script_generation: '✍️',
      fact_checking: '✅',
      tone_adjustment: '🎭',
      verification: '🛡️',
      thumbnail: '🖼️',
      description: '📄',
      tags: '🏷️',
      transcription: '🎤',
      text_analysis: '📊',
      key_points: '🔑',
      summarization: '📋',
      categorization: '📂',
      action_items: '✅',
      technical_analysis: '⚙️',
      code_examples: '💻',
      explanation: '💡'
    };
    return icons[step] || '⚡';
  };

  return (
    <div className="token-dashboard">
      <div className="section-header">
        <h2>📊 Token & Kosten Dashboard</h2>
        <p>Analysieren Sie Token-Verbrauch und Kosten für verschiedene Content-Typen und Workflow-Schritte.</p>
      </div>

      {/* NEW: Quota Information Section */}
      {quotaInfo && (
        <div className="quota-section">
          <h3>📈 Token-Quota Status</h3>
          <div className="quota-grid">
            <div className="quota-card">
              <div className="quota-header">
                <span className="quota-label">Tägliches Limit</span>
                <span className="quota-value">{formatNumber(quotaInfo.dailyLimit)} Tokens</span>
              </div>
              <div className="quota-progress">
                <div 
                  className="quota-progress-bar"
                  style={{
                    width: `${getUsagePercentage(quotaInfo.dailyUsed, quotaInfo.dailyLimit)}%`,
                    backgroundColor: getQuotaStatusColor(getUsagePercentage(quotaInfo.dailyUsed, quotaInfo.dailyLimit))
                  }}
                ></div>
              </div>
              <div className="quota-details">
                <span>Verbraucht: {formatNumber(quotaInfo.dailyUsed)} Tokens</span>
                <span>Verfügbar: {formatNumber(quotaInfo.dailyRemaining)} Tokens</span>
              </div>
            </div>

            <div className="quota-card">
              <div className="quota-header">
                <span className="quota-label">Monatliches Limit</span>
                <span className="quota-value">{formatNumber(quotaInfo.monthlyLimit)} Tokens</span>
              </div>
              <div className="quota-progress">
                <div 
                  className="quota-progress-bar"
                  style={{
                    width: `${getUsagePercentage(quotaInfo.monthlyUsed, quotaInfo.monthlyLimit)}%`,
                    backgroundColor: getQuotaStatusColor(getUsagePercentage(quotaInfo.monthlyUsed, quotaInfo.monthlyLimit))
                  }}
                ></div>
              </div>
              <div className="quota-details">
                <span>Verbraucht: {formatNumber(quotaInfo.monthlyUsed)} Tokens</span>
                <span>Verfügbar: {formatNumber(quotaInfo.monthlyRemaining)} Tokens</span>
              </div>
            </div>

            <div className="quota-card">
              <div className="quota-header">
                <span className="quota-label">Notfall Budget</span>
                <span className="quota-value">{formatNumber(quotaInfo.emergencyLimit)} Tokens</span>
              </div>
              <div className="quota-progress">
                <div 
                  className="quota-progress-bar"
                  style={{
                    width: `${getUsagePercentage(quotaInfo.emergencyUsed, quotaInfo.emergencyLimit)}%`,
                    backgroundColor: getQuotaStatusColor(getUsagePercentage(quotaInfo.emergencyUsed, quotaInfo.emergencyLimit))
                  }}
                ></div>
              </div>
              <div className="quota-details">
                <span>Verbraucht: {formatNumber(quotaInfo.emergencyUsed)} Tokens</span>
                <span>Verfügbar: {formatNumber(quotaInfo.emergencyRemaining)} Tokens</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="config-panel">
        <h3>⚙️ Konfiguration</h3>
        <div className="config-grid">
          <div className="config-group">
            <label>Content-Typ:</label>
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
            >
              <option value="">Wählen Sie einen Typ...</option>
              {Object.entries(contentTypes).map(([key, info]: [string, any]) => (
                <option key={key} value={key}>
                  {info.description} ({formatNumber(info.avgTokens)} Tokens)
                </option>
              ))}
            </select>
          </div>

          <div className="config-group">
            <label>LLM Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setSelectedModel(providerOptions[e.target.value as keyof typeof providerOptions][0]);
              }}
            >
              {Object.keys(providerOptions).map(provider => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="config-group">
            <label>Modell:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {providerOptions[selectedProvider as keyof typeof providerOptions]?.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div className="config-group">
            <label>Videos pro Woche:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={videosPerWeek}
              onChange={(e) => setVideosPerWeek(parseInt(e.target.value))}
            />
          </div>

          {selectedContentType === 'audio_analysis' && (
            <div className="config-group">
              <label>Audio-Dauer (Minuten):</label>
              <input
                type="number"
                min="1"
                max="120"
                value={audioDuration}
                onChange={(e) => setAudioDuration(parseInt(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Berechne Token-Kosten...</p>
        </div>
      )}

      {/* Cost Overview */}
      {costEstimate && (
        <div className="cost-overview">
          <h3>💰 Kosten-Übersicht</h3>
          <div className="overview-cards">
            <div className="cost-card">
              <div className="cost-value" style={{ color: getCostColor(costEstimate.summary.totalCost) }}>
                {formatCurrency(costEstimate.summary.totalCost)}
              </div>
              <div className="cost-label">Kosten pro Video</div>
            </div>
            
            <div className="cost-card">
              <div className="cost-value">{formatNumber(costEstimate.summary.totalTokens)}</div>
              <div className="cost-label">Gesamt-Tokens</div>
            </div>
            
            <div className="cost-card">
              <div className="cost-value">{costEstimate.summary.aiRequiredSteps}</div>
              <div className="cost-label">KI-Schritte</div>
            </div>
            
            <div className="cost-card">
              <div className="cost-value">{costEstimate.summary.totalSteps}</div>
              <div className="cost-label">Gesamt-Schritte</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Projection */}
      {monthlyProjection && (
        <div className="monthly-projection">
          <h3>📅 Monatliche Projektion</h3>
          <div className="projection-grid">
            <div className="projection-item">
              <strong>Videos pro Monat:</strong> {monthlyProjection.videosPerMonth}
            </div>
            <div className="projection-item">
              <strong>Monatliche Kosten:</strong> 
              <span style={{ color: getCostColor(monthlyProjection.monthlyTotal) }}>
                {formatCurrency(monthlyProjection.monthlyTotal)}
              </span>
            </div>
            <div className="projection-item">
              <strong>Tokens pro Monat:</strong> {formatNumber(monthlyProjection.breakdown.totalTokensPerMonth)}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps Breakdown */}
      {costEstimate && (
        <div className="workflow-breakdown">
          <h3>🔧 Workflow-Schritte Aufschlüsselung</h3>
          <div className="steps-list">
            {Object.entries(costEstimate.breakdown).map(([stepName, step]) => (
              <div key={stepName} className={`step-item ${!step.aiRequired ? 'no-ai' : ''}`}>
                <div className="step-header">
                  <span className="step-icon">{getStepIcon(stepName)}</span>
                  <span className="step-name">{stepName.replace(/_/g, ' ')}</span>
                  {!step.aiRequired && <span className="no-ai-badge">Lokal</span>}
                  <span 
                    className="step-cost"
                    style={{ color: getCostColor(step.totalCost) }}
                  >
                    {formatCurrency(step.totalCost)}
                  </span>
                </div>
                
                {step.aiRequired && (
                  <div className="step-details">
                    <div className="token-info">
                      <span>📥 Input: {formatNumber(step.inputTokens)} Tokens</span>
                      <span>📤 Output: {formatNumber(step.outputTokens)} Tokens</span>
                      {step.audioMinutes > 0 && (
                        <span>🎵 Audio: {step.audioMinutes} Min</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Comparison */}
      {Object.keys(providerComparison).length > 0 && (
        <div className="provider-comparison">
          <h3>🏆 Provider-Vergleich</h3>
          <div className="comparison-table">
            {Object.entries(providerComparison).map(([provider, data], index) => (
              <div key={provider} className={`comparison-row ${index === 0 ? 'cheapest' : ''}`}>
                <div className="provider-name">
                  {provider}
                  {index === 0 && <span className="best-badge">Günstigste</span>}
                </div>
                <div className="provider-cost" style={{ color: getCostColor(data.totalCost) }}>
                  {formatCurrency(data.totalCost)}
                </div>
                <div className="provider-tokens">
                  {formatNumber(data.totalTokens)} Tokens
                </div>
                <div className="cost-per-token">
                  {formatCurrency(data.costPerToken)}/1K Tokens
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDashboard;

// Styles have been moved to TokenDashboard.css
