import React, { useState } from 'react';
import axios from 'axios';

interface TranscriptionResult {
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
  analysis?: {
    keyPoints: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      importance: string;
      keywords: string[];
    }>;
    summary: string;
    categories: Record<string, string[]>;
    structure: {
      type: string;
      flow: string;
    };
    actionItems: Array<{
      action: string;
      priority: string;
      timeframe: string;
    }>;
    insights: any;
  };
  redLines?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    keywords: string[];
  }>;
  metadata: {
    timestamp: string;
    processingTime: number;
    transcriptionService: string;
    analysisService: string;
  };
}

interface AudioTranscriberProps {
  apiBase: string;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ apiBase }) => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    language: 'de',
    includeAnalysis: true,
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
      setTranscription(null);
    }
  };

  const transcribeAudio = async () => {
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
      formData.append('includeActionItems', options.includeActionItems.toString());

      // Use the enhanced endpoint if analysis is requested
      const endpoint = options.includeAnalysis 
        ? `${apiBase}/api/audio/transcribe-analyze`
        : `${apiBase}/api/audio/transcribe`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
      });

      setTranscription(response.data);
    } catch (error: any) {
      console.error('Audio transcription failed:', error);
      setError('Transkription fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription.transcription.text);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-transcriber">
      <div className="section-header">
        <h2>🎤 Audio-zu-Text Transkription</h2>
        <p>Laden Sie eine Audio-Datei hoch, um direkt Text zu extrahieren (ohne weitere Analyse).</p>
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
            <label>
              <input
                type="checkbox"
                checked={options.includeAnalysis}
                onChange={(e) => setOptions({ ...options, includeAnalysis: e.target.checked })}
              />
              Mit Analyse
            </label>
          </div>
          
          {options.includeAnalysis && (
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={options.includeActionItems}
                  onChange={(e) => setOptions({ ...options, includeActionItems: e.target.checked })}
                />
                Handlungsempfehlungen
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={transcribeAudio}
          disabled={!file || loading}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Transkribiere...' : '🎤 Audio transkribieren'}
        </button>
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

      {/* Transcription Results */}
      {transcription && (
        <div className="transcription-results">
          <h3>📝 Transkriptionsergebnis</h3>

          {/* Audio Info */}
          <div className="result-section audio-info">
            <h4>🎵 Audio-Information</h4>
            <div className="info-grid">
              <div><strong>Datei:</strong> {transcription.audio.filename}</div>
              <div><strong>Dauer:</strong> {formatDuration(transcription.audio.duration)}</div>
              <div><strong>Sprache:</strong> {transcription.audio.language.toUpperCase()}</div>
              <div><strong>Konfidenz:</strong> {(transcription.audio.confidence * 100).toFixed(1)}%</div>
              <div><strong>Wörter:</strong> {transcription.transcription.wordCount}</div>
              <div><strong>Lesezeit:</strong> {transcription.transcription.estimatedReadingTime} Min</div>
            </div>
          </div>

          {/* Transcription Text */}
          <div className="result-section transcription-text">
            <h4>📄 Transkription</h4>
            <div className="transcription-content">
              <p>{transcription.transcription.text}</p>
            </div>
            <button onClick={copyToClipboard} className="btn btn-secondary">
              📋 In Zwischenablage kopieren
            </button>
          </div>

          {/* Analysis Results */}
          {transcription.analysis && (
            <div className="result-section analysis-results">
              <h4>🔍 Analyseergebnisse</h4>
              
              {/* Summary */}
              <div className="analysis-section">
                <h5>📋 Zusammenfassung</h5>
                <p>{transcription.analysis.summary}</p>
              </div>
              
              {/* Key Points */}
              <div className="analysis-section">
                <h5>⭐ Hauptpunkte</h5>
                <div className="key-points-list">
                  {transcription.analysis.keyPoints.map((point) => (
                    <div key={point.id} className="key-point-item">
                      <div className="key-point-header">
                        <span className="key-point-title">{point.title}</span>
                        <span className={`importance-badge ${point.importance}`}>
                          {point.importance === 'hoch' ? 'Hoch' : point.importance === 'mittel' ? 'Mittel' : 'Niedrig'}
                        </span>
                      </div>
                      <p className="key-point-description">{point.description}</p>
                      <div className="key-point-meta">
                        <span className="key-point-category">{point.category}</span>
                        <div className="key-point-keywords">
                          {point.keywords.map((keyword, idx) => (
                            <span key={idx} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Red Lines */}
              {transcription.redLines && transcription.redLines.length > 0 && (
                <div className="analysis-section red-lines-section">
                  <h5>🔴 Rote Linien</h5>
                  <div className="red-lines-list">
                    {transcription.redLines.map((line) => (
                      <div key={line.id} className="red-line-item">
                        <div className="red-line-header">
                          <span className="red-line-title">{line.title}</span>
                        </div>
                        <p className="red-line-description">{line.description}</p>
                        <div className="red-line-meta">
                          <span className="red-line-category">{line.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Items */}
              {transcription.analysis.actionItems && transcription.analysis.actionItems.length > 0 && (
                <div className="analysis-section">
                  <h5>✅ Handlungsempfehlungen</h5>
                  <div className="action-items-list">
                    {transcription.analysis.actionItems.map((item, idx) => (
                      <div key={idx} className="action-item">
                        <div className="action-item-header">
                          <span className="action-item-text">{item.action}</span>
                          <span className={`priority-badge ${item.priority}`}>
                            {item.priority === 'hoch' ? 'Hoch' : item.priority === 'mittel' ? 'Mittel' : 'Niedrig'}
                          </span>
                        </div>
                        <div className="action-item-meta">
                          <span className="timeframe">{item.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AudioTranscriber;