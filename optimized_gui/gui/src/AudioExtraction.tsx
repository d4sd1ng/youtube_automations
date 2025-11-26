import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  engagementRate: string;
  publishedAt: string;
}

interface ExtractionResult {
  success: boolean;
  videoId: string;
  videoTitle: string;
  channelTitle?: string;
  audioPath?: string;
  fileSize?: number;
  duration?: number;
  extractedAt: string;
  quality?: string;
  error?: string;
}

interface ExtractionSummary {
  total: number;
  successful: number;
  failed: number;
  totalSize: number;
  totalDuration: number;
}

interface AudioExtractionProps {
  apiBase: string;
}

const AudioExtraction: React.FC<AudioExtractionProps> = ({ apiBase }) => {
  const [discoveredVideos, setDiscoveredVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [extractionResults, setExtractionResults] = useState<ExtractionResult[]>([]);
  const [extractionSummary, setExtractionSummary] = useState<ExtractionSummary | null>(null);
  
  const [category, setCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('7d');
  const [discoveryLimit, setDiscoveryLimit] = useState(10);
  const [audioQuality, setAudioQuality] = useState('medium');
  const [maxConcurrent, setMaxConcurrent] = useState(2);
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const discoverVideos = async () => {
    setIsDiscovering(true);
    setError('');
    
    try {
      const response = await axios.get(`${apiBase}/api/discovery/videos`, {
        params: { category, timeframe, limit: discoveryLimit }
      });
      
      if (response.data.success) {
        setDiscoveredVideos(response.data.videos || []);
        setSelectedVideos(new Set());
        setExtractionResults([]);
        setExtractionSummary(null);
      } else {
        setError('Video discovery failed');
      }
    } catch (error: any) {
      setError('Failed to discover videos: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const selectAllVideos = () => {
    if (selectedVideos.size === discoveredVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(discoveredVideos.map(v => v.videoId)));
    }
  };

  const extractAudio = async () => {
    if (selectedVideos.size === 0) {
      setError('Please select at least one video for audio extraction');
      return;
    }

    setIsExtracting(true);
    setError('');
    setProgress(0);
    
    try {
      const videosToExtract = discoveredVideos.filter(v => selectedVideos.has(v.videoId));
      
      const response = await axios.post(`${apiBase}/api/extraction/extract`, {
        videos: videosToExtract,
        quality: audioQuality,
        maxConcurrent: maxConcurrent
      });
      
      if (response.data.success) {
        setExtractionResults(response.data.results || []);
        setExtractionSummary(response.data.summary);
        setProgress(100);
      } else {
        setError('Audio extraction failed');
      }
    } catch (error: any) {
      setError('Failed to extract audio: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsExtracting(false);
    }
  };

  const runCombinedPipeline = async () => {
    setIsDiscovering(true);
    setIsExtracting(true);
    setError('');
    setProgress(0);
    
    try {
      const response = await axios.post(`${apiBase}/api/pipeline/discover-and-extract`, {
        category,
        timeframe,
        limit: Math.min(discoveryLimit, 5), // Limit for demo
        audioQuality,
        maxConcurrent
      });
      
      if (response.data.success) {
        const { discovery, extraction } = response.data.pipeline;
        setDiscoveredVideos(discovery.videos || []);
        setExtractionResults(extraction.results || []);
        setExtractionSummary(extraction.summary);
        setSelectedVideos(new Set(discovery.videos.map((v: Video) => v.videoId)));
        setProgress(100);
      } else {
        setError('Combined pipeline failed');
      }
    } catch (error: any) {
      setError('Failed to run pipeline: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsDiscovering(false);
      setIsExtracting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSuccessRate = (): number => {
    if (!extractionSummary || extractionSummary.total === 0) return 0;
    return Math.round((extractionSummary.successful / extractionSummary.total) * 100);
  };

  return (
    <div className="audio-extraction">
      <div className="section-header">
        <h2>🎵 Audio Extraction Pipeline</h2>
        <p>Entdecke Videos und extrahiere Audio für die Analyse-Pipeline.</p>
      </div>

      {/* Configuration Panel */}
      <div className="config-panel">
        <h3>⚙️ Pipeline-Konfiguration</h3>
        <div className="config-grid">
          <div className="config-group">
            <label>Video-Kategorie:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Alle Kategorien</option>
              <option value="politics">Politik</option>
              <option value="ai_tech">KI & Technologie</option>
            </select>
          </div>

          <div className="config-group">
            <label>Zeitraum:</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="24h">Letzte 24 Stunden</option>
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
            </select>
          </div>

          <div className="config-group">
            <label>Video-Limit:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={discoveryLimit}
              onChange={(e) => setDiscoveryLimit(parseInt(e.target.value))}
            />
          </div>

          <div className="config-group">
            <label>Audio-Qualität:</label>
            <select value={audioQuality} onChange={(e) => setAudioQuality(e.target.value)}>
              <option value="low">Niedrig (Schnell)</option>
              <option value="medium">Mittel (Empfohlen)</option>
              <option value="high">Hoch (Langsam)</option>
            </select>
          </div>

          <div className="config-group">
            <label>Parallel Downloads:</label>
            <input
              type="number"
              min="1"
              max="4"
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-panel">
        <button
          onClick={discoverVideos}
          disabled={isDiscovering || isExtracting}
          className="action-button discover"
        >
          {isDiscovering ? '🔍 Entdecke...' : '🔍 Videos Entdecken'}
        </button>

        <button
          onClick={extractAudio}
          disabled={isExtracting || selectedVideos.size === 0}
          className="action-button extract"
        >
          {isExtracting ? '🎵 Extrahiere...' : `🎵 Audio Extrahieren (${selectedVideos.size})`}
        </button>

        <button
          onClick={runCombinedPipeline}
          disabled={isDiscovering || isExtracting}
          className="action-button pipeline"
        >
          {(isDiscovering || isExtracting) ? '🔄 Pipeline läuft...' : '🚀 Komplette Pipeline'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Progress Bar */}
      {(isDiscovering || isExtracting) && (
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>
            {isDiscovering && isExtracting ? 'Pipeline läuft...' :
             isDiscovering ? 'Videos werden entdeckt...' :
             isExtracting ? 'Audio wird extrahiert...' : ''}
          </p>
        </div>
      )}

      {/* Extraction Summary */}
      {extractionSummary && (
        <div className="extraction-summary">
          <h3>📊 Extraktions-Zusammenfassung</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value">{extractionSummary.successful}</div>
              <div className="summary-label">Erfolgreich</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{extractionSummary.failed}</div>
              <div className="summary-label">Fehlgeschlagen</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{getSuccessRate()}%</div>
              <div className="summary-label">Erfolgsrate</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatFileSize(extractionSummary.totalSize)}</div>
              <div className="summary-label">Gesamt-Größe</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatDuration(extractionSummary.totalDuration)}</div>
              <div className="summary-label">Gesamt-Dauer</div>
            </div>
          </div>
        </div>
      )}

      {/* Video Discovery Results */}
      {discoveredVideos.length > 0 && (
        <div className="videos-section">
          <h3>🎬 Entdeckte Videos</h3>
          <div className="videos-controls">
            <button onClick={selectAllVideos} className="select-all-button">
              {selectedVideos.size === discoveredVideos.length ? '⬜ Alle abwählen' : '☑️ Alle auswählen'}
            </button>
            <span className="selection-count">
              {selectedVideos.size} von {discoveredVideos.length} ausgewählt
            </span>
          </div>
          
          <div className="videos-grid">
            {discoveredVideos.map((video) => (
              <div 
                key={video.videoId} 
                className={`video-card ${selectedVideos.has(video.videoId) ? 'selected' : ''}`}
                onClick={() => toggleVideoSelection(video.videoId)}
              >
                <div className="video-header">
                  <input
                    type="checkbox"
                    checked={selectedVideos.has(video.videoId)}
                    onChange={() => toggleVideoSelection(video.videoId)}
                  />
                  <h4>{video.title}</h4>
                </div>
                <p><strong>Kanal:</strong> {video.channelTitle}</p>
                <p><strong>Aufrufe:</strong> {video.viewCount.toLocaleString()}</p>
                <p><strong>Engagement:</strong> {video.engagementRate}%</p>
                <p><strong>Veröffentlicht:</strong> {new Date(video.publishedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extraction Results */}
      {extractionResults.length > 0 && (
        <div className="results-section">
          <h3>🎵 Extraktions-Ergebnisse</h3>
          <div className="results-grid">
            {extractionResults.map((result, index) => (
              <div 
                key={index} 
                className={`result-card ${result.success ? 'success' : 'error'}`}
              >
                <div className="result-header">
                  <span className={`status-icon ${result.success ? 'success' : 'error'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <h4>{result.videoTitle}</h4>
                </div>
                
                {result.success ? (
                  <>
                    <p><strong>Kanal:</strong> {result.channelTitle}</p>
                    <p><strong>Dateigröße:</strong> {formatFileSize(result.fileSize || 0)}</p>
                    <p><strong>Dauer:</strong> {formatDuration(result.duration || 0)}</p>
                    <p><strong>Qualität:</strong> {result.quality}</p>
                    <p><strong>Pfad:</strong> {result.audioPath ? result.audioPath.split('/').pop() : 'N/A'}</p>
                  </>
                ) : (
                  <p className="error-text"><strong>Fehler:</strong> {result.error}</p>
                )}
                
                <p className="extraction-time">
                  <strong>Extrahiert:</strong> {new Date(result.extractedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioExtraction;