import React, { useState } from 'react';
import axios from 'axios';

interface AudioAnalysis {
  success: boolean;
  audio: {
    filename: string;
    duration: number;
    language: string;
    confidence: number;
  };
  transcription: {
    text: string;
    wordCount: number;
    estimatedReadingTime: number;
  };
  analysis: {
    keyPoints: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      importance: 'hoch' | 'mittel' | 'niedrig';
      keywords: string[];
    }>;
    summary: string;
    categories: Record<string, string[]>;
    actionItems?: Array<{
      action: string;
      priority: string;
      timeframe: string;
    }>;
    insights: {
      complexity: string;
      mainCategory: string;
      topicDiversity: number;
    };
  };
}

interface ExportResult {
  success: boolean;
  export: {
    word?: { filename: string; size: number };
    pdf?: { filename: string; size: number };
  };
}

interface AudioAnalyzerProps {
  apiBase: string;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ apiBase }) => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [options, setOptions] = useState({
    language: 'de',
    analysisType: 'comprehensive',
    maxKeyPoints: 8,
    includeActionItems: false
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm'];
      const isValidType = allowedTypes.includes(selectedFile.type) || 
                         selectedFile.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i);
      
      if (!isValidType) {
        setError('Bitte wählen Sie eine Audio-Datei (MP3, WAV, M4A, etc.)');
        return;
      }
      
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('Datei zu groß. Maximum: 25MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setAnalysis(null);
      setExportResult(null);
    }
  };

  const analyzeAudio = async () => {
    if (!file) {
      setError('Bitte wählen Sie eine Audio-Datei');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', options.language);
      formData.append('analysisType', options.analysisType);
      formData.append('maxKeyPoints', options.maxKeyPoints.toString());
      formData.append('includeActionItems', options.includeActionItems.toString());

      const response = await axios.post(`${apiBase}/api/audio/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
      });

      setAnalysis(response.data);
    } catch (error: any) {
      console.error('Audio analysis failed:', error);
      setError('Analyse fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportAnalysis = async (format: 'word' | 'pdf' | 'both' = 'both') => {
    if (!analysis) {
      setError('Keine Analyse zum Exportieren verfügbar');
      return;
    }

    setExportLoading(true);
    setError('');

    try {
      const filename = analysis.audio.filename.replace(/\.[^/.]+$/, "");
      const response = await axios.post(`${apiBase}/api/analysis/export`, {
        analysisData: analysis,
        format,
        options: {
          title: `Audio-Analyse: ${analysis.audio.filename}`,
          filename: `analyse_${filename}_${Date.now()}`
        }
      });

      setExportResult(response.data);
    } catch (error: any) {
      console.error('Export failed:', error);
      setError('Export fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setExportLoading(false);
    }
  };

  const downloadFile = async (filename: string) => {
    try {
      const response = await axios.get(`${apiBase}/api/analysis/download/${filename}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      setError('Download fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'hoch': return '#f44336';
      case 'mittel': return '#ff9800';
      case 'niedrig': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="audio-analyzer">
      <div className="section-header">
        <h2>🎵 Audio-zu-Text Analyse</h2>
        <p>Laden Sie eine Audio-Datei hoch, um automatisch Text zu extrahieren und Hauptpunkte zu analysieren.</p>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="audio-file"
            accept=".mp3,.wav,.m4a,.aac,.ogg,.webm,audio/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="audio-file" className="file-input-label">
            {file ? `📁 ${file.name}` : '📎 Audio-Datei auswählen'}
          </label>
        </div>

        {file && (
          <div className="file-info">
            <p><strong>Datei:</strong> {file.name}</p>
            <p><strong>Größe:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Typ:</strong> {file.type || 'Unbekannt'}</p>
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="options-section">
        <h3>Einstellungen</h3>
        <div className="options-grid">
          <div className="option-group">
            <label htmlFor="language">Sprache:</label>
            <select
              id="language"
              value={options.language}
              onChange={(e) => setOptions({ ...options, language: e.target.value })}
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="option-group">
            <label htmlFor="analysisType">Analyse-Typ:</label>
            <select
              id="analysisType"
              value={options.analysisType}
              onChange={(e) => setOptions({ ...options, analysisType: e.target.value })}
            >
              <option value="comprehensive">Umfassend</option>
              <option value="summary">Zusammenfassung</option>
              <option value="keypoints">Hauptpunkte</option>
            </select>
          </div>

          <div className="option-group">
            <label htmlFor="maxKeyPoints">Max. Hauptpunkte:</label>
            <input
              type="number"
              id="maxKeyPoints"
              min="3"
              max="15"
              value={options.maxKeyPoints}
              onChange={(e) => setOptions({ ...options, maxKeyPoints: parseInt(e.target.value) })}
            />
          </div>

          <div className="option-group">
            <label>
              <input
                type="checkbox"
                checked={options.includeActionItems}
                onChange={(e) => setOptions({ ...options, includeActionItems: e.target.checked })}
              />
              Handlungsempfehlungen einschließen
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={analyzeAudio}
          disabled={!file || loading}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Analysiere...' : '🚀 Audio analysieren'}
        </button>

        {analysis && (
          <button
            onClick={() => exportAnalysis('both')}
            disabled={exportLoading}
            className={`btn btn-secondary ${exportLoading ? 'loading' : ''}`}
          >
            {exportLoading ? '📄 Exportiere...' : '💾 Als Word & PDF exportieren'}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Loading Progress */}
      {loading && (
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Verarbeite Audio-Datei... Dies kann einige Minuten dauern.</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results">
          <h3>📊 Analyse-Ergebnisse</h3>

          {/* Audio Info */}
          <div className="result-section audio-info">
            <h4>🎵 Audio-Information</h4>
            <div className="info-grid">
              <div><strong>Datei:</strong> {analysis.audio.filename}</div>
              <div><strong>Dauer:</strong> {formatDuration(analysis.audio.duration)}</div>
              <div><strong>Sprache:</strong> {analysis.audio.language.toUpperCase()}</div>
              <div><strong>Konfidenz:</strong> {(analysis.audio.confidence * 100).toFixed(1)}%</div>
              <div><strong>Wörter:</strong> {analysis.transcription.wordCount}</div>
              <div><strong>Lesezeit:</strong> {analysis.transcription.estimatedReadingTime} Min</div>
            </div>
          </div>

          {/* Summary */}
          <div className="result-section summary">
            <h4>📝 Zusammenfassung</h4>
            <p className="summary-text">{analysis.analysis.summary}</p>
          </div>

          {/* Key Points */}
          <div className="result-section key-points">
            <h4>🔑 Hauptpunkte</h4>
            <div className="key-points-list">
              {analysis.analysis.keyPoints.map((point, index) => (
                <div key={point.id} className="key-point">
                  <div className="point-header">
                    <span className="point-number">{index + 1}</span>
                    <h5>{point.title}</h5>
                    <span 
                      className="importance-badge"
                      style={{ backgroundColor: getImportanceColor(point.importance) }}
                    >
                      {point.importance}
                    </span>
                  </div>
                  <p className="point-description">{point.description}</p>
                  <div className="point-meta">
                    <span className="category">📂 {point.category}</span>
                    {point.keywords.length > 0 && (
                      <span className="keywords">
                        🏷️ {point.keywords.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="result-section categories">
            <h4>📂 Kategorien</h4>
            <div className="categories-grid">
              {Object.entries(analysis.analysis.categories).map(([category, points]) => (
                <div key={category} className="category-item">
                  <h5>{category}</h5>
                  <ul>
                    {points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          {analysis.analysis.actionItems && analysis.analysis.actionItems.length > 0 && (
            <div className="result-section action-items">
              <h4>✅ Handlungsempfehlungen</h4>
              <div className="actions-list">
                {analysis.analysis.actionItems.map((action, index) => (
                  <div key={index} className="action-item">
                    <div className="action-content">
                      <h5>{action.action}</h5>
                      <div className="action-meta">
                        <span className={`priority priority-${action.priority}`}>
                          📊 {action.priority}
                        </span>
                        <span className="timeframe">⏰ {action.timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="result-section insights">
            <h4>💡 Einblicke</h4>
            <div className="insights-grid">
              <div><strong>Komplexität:</strong> {analysis.analysis.insights.complexity}</div>
              <div><strong>Hauptkategorie:</strong> {analysis.analysis.insights.mainCategory}</div>
              <div><strong>Themenvielfalt:</strong> {analysis.analysis.insights.topicDiversity}</div>
            </div>
          </div>
        </div>
      )}

      {/* Export Results */}
      {exportResult && (
        <div className="export-results">
          <h3>💾 Export erfolgreich</h3>
          <div className="export-files">
            {exportResult.export.word && (
              <div className="export-file">
                <span>📄 Word-Dokument:</span>
                <button 
                  onClick={() => downloadFile(exportResult.export.word!.filename)}
                  className="btn btn-sm"
                >
                  📥 {exportResult.export.word.filename} herunterladen
                </button>
              </div>
            )}
            {exportResult.export.pdf && (
              <div className="export-file">
                <span>📄 PDF-Dokument:</span>
                <button 
                  onClick={() => downloadFile(exportResult.export.pdf!.filename)}
                  className="btn btn-sm"
                >
                  📥 {exportResult.export.pdf.filename} herunterladen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioAnalyzer;