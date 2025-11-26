import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

interface MultiInputJob {
  id: string;
  type: string;
  status: string;
  priority: number;
  created: string;
  updated: string;
  items: Array<{
    id: string;
    filename?: string;
    url?: string;
    type: string;
    status: string;
    size?: number;
    result?: any;
    error?: string;
  }>;
  progress: {
    total: number;
    completed: number;
    failed: number;
    percentage: number;
  };
  metadata: {
    title: string;
    description: string;
    tags: string[];
    estimatedDuration: number;
    actualDuration: number;
  };
  settings: {
    retryFailed: boolean;
    maxRetries: number;
    processingType: string;
    outputFormat: string;
  };
}

interface MultiInputStats {
  totalJobs: number;
  activeJobs: number;
  queueLength: number;
  workers: Array<{
    id: string;
    status: string;
    currentJob: string | null;
    totalProcessed: number;
  }>;
  jobsByStatus: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  supportedTypes: {
    [key: string]: string[];
  };
}

interface MultiInputProps {
  apiBase: string;
}

const MultiInput: React.FC<MultiInputProps> = ({ apiBase }) => {
  const [jobs, setJobs] = useState<MultiInputJob[]>([]);
  const [stats, setStats] = useState<MultiInputStats | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  
  // Job creation form
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [priority, setPriority] = useState(2);
  const [processingType, setProcessingType] = useState('parallel');
  const [outputFormat, setOutputFormat] = useState('json');
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'jobs' | 'stats'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollInterval = useRef<number>();

  useEffect(() => {
    loadStats();
    loadJobs();
    
    // Poll for updates every 5 seconds
    pollInterval.current = setInterval(() => {
      loadStats();
      loadJobs();
    }, 5000);
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/multi-input/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/multi-input/jobs`);
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseUrls = (urlText: string): string[] => {
    return urlText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')));
  };

  const createBatchJob = async () => {
    if (selectedFiles.length === 0 && parseUrls(urls).length === 0) {
      setError('Mindestens eine Datei oder URL muss hinzugefügt werden');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create batch job
      const jobResponse = await axios.post(`${apiBase}/api/multi-input/create-batch`, {
        title: jobTitle || `Batch Job ${new Date().toLocaleString('de-DE')}`,
        description: jobDescription,
        priority: priority,
        processingType: processingType,
        outputFormat: outputFormat,
        retryFailed: true,
        maxRetries: 3
      });

      const batchId = jobResponse.data.job.id;

      // Upload files if any
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('batchId', batchId);
        
        selectedFiles.forEach((file, index) => {
          formData.append('files', file);
        });

        await axios.post(`${apiBase}/api/multi-input/upload-files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Add URLs if any
      const urlList = parseUrls(urls);
      if (urlList.length > 0) {
        await axios.post(`${apiBase}/api/multi-input/add-urls`, {
          batchId: batchId,
          urls: urlList
        });
      }

      // Reset form
      setSelectedFiles([]);
      setUrls('');
      setJobTitle('');
      setJobDescription('');
      
      // Refresh data
      await loadStats();
      await loadJobs();
      
      // Switch to jobs tab
      setActiveTab('jobs');

    } catch (error: any) {
      setError('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await axios.post(`${apiBase}/api/multi-input/cancel-job`, { jobId });
      await loadJobs();
    } catch (error: any) {
      setError('Failed to cancel job: ' + error.message);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}min`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'processing': return '#2196f3';
      case 'failed': return '#f44336';
      case 'cancelled': return '#ff9800';
      case 'queued': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⚡';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
      case 'queued': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="multi-input">
      <div className="section-header">
        <h2>📂 Multi-Input Processing System</h2>
        <p>Verarbeite mehrere Dateien und URLs gleichzeitig in intelligenten Batches mit Queue-Management.</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload & Create Batch
        </button>
        <button 
          className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          📋 Jobs ({jobs.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 System Stats
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="upload-section">
          {/* Job Configuration */}
          <div className="job-config">
            <h3>🔧 Batch-Konfiguration</h3>
            <div className="config-grid">
              <div className="config-field">
                <label>Titel:</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Optional - Batch Job Titel"
                />
              </div>
              
              <div className="config-field">
                <label>Beschreibung:</label>
                <input
                  type="text"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Optional - Beschreibung des Jobs"
                />
              </div>
              
              <div className="config-field">
                <label>Priorität:</label>
                <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
                  <option value={1}>🟢 Niedrig</option>
                  <option value={2}>🟡 Normal</option>
                  <option value={3}>🟠 Hoch</option>
                  <option value={4}>🔴 Urgent</option>
                </select>
              </div>
              
              <div className="config-field">
                <label>Verarbeitung:</label>
                <select value={processingType} onChange={(e) => setProcessingType(e.target.value)}>
                  <option value="parallel">⚡ Parallel</option>
                  <option value="sequential">📝 Sequenziell</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="file-upload-section">
            <h3>📁 Dateien</h3>
            <div 
              className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-content">
                <div className="drop-icon">📂</div>
                <div className="drop-text">
                  <strong>Dateien hier ablegen oder klicken zum Auswählen</strong>
                  <br />
                  Unterstützt: Audio, Video, Text, PDFs, Bilder (max. 500MB pro Datei)
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".mp3,.wav,.m4a,.flac,.ogg,.aac,.mp4,.avi,.mov,.mkv,.webm,.flv,.txt,.md,.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h4>📋 Ausgewählte Dateien ({selectedFiles.length})</h4>
                <div className="files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        <span className="file-type">{file.type || 'unknown'}</span>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="remove-file-btn"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="url-input-section">
            <h3>🔗 URLs</h3>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder={`Eine URL pro Zeile eingeben:\nhttps://example.com/video1\nhttps://example.com/article\nhttps://youtube.com/watch?v=xyz`}
              rows={6}
              className="url-textarea"
            />
            {parseUrls(urls).length > 0 && (
              <div className="url-preview">
                <strong>📄 {parseUrls(urls).length} URLs erkannt</strong>
              </div>
            )}
          </div>

          {/* Create Batch Button */}
          <div className="action-panel">
            <button
              onClick={createBatchJob}
              disabled={isUploading || (selectedFiles.length === 0 && parseUrls(urls).length === 0)}
              className="create-batch-btn"
            >
              {isUploading ? '⏳ Erstelle Batch...' : '🚀 Batch Job Erstellen'}
            </button>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="jobs-section">
          <h3>📋 Aktuelle Jobs</h3>
          
          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Keine Jobs vorhanden. Erstelle einen neuen Batch Job im Upload-Tab.</p>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <div className="job-title">
                      <span className="job-status-icon">{getStatusIcon(job.status)}</span>
                      <span className="job-name">{job.metadata.title}</span>
                      <span className="job-id">#{job.id.slice(0, 8)}</span>
                    </div>
                    <div className="job-actions">
                      {(job.status === 'queued' || job.status === 'processing') && (
                        <button 
                          onClick={() => cancelJob(job.id)}
                          className="cancel-btn"
                        >
                          🚫 Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="job-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${job.progress.percentage}%`,
                          backgroundColor: getStatusColor(job.status)
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      {job.progress.completed}/{job.progress.total} Items 
                      ({job.progress.percentage}%)
                      {job.progress.failed > 0 && ` • ${job.progress.failed} fehlerhafte`}
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="job-meta">
                      <span>🏷️ {job.items.length} Items</span>
                      <span>⚡ {job.settings.processingType}</span>
                      <span>📅 {new Date(job.created).toLocaleString('de-DE')}</span>
                      {job.metadata.actualDuration > 0 && (
                        <span>⏱️ {formatDuration(job.metadata.actualDuration)}</span>
                      )}
                    </div>
                    
                    {job.metadata.description && (
                      <div className="job-description">{job.metadata.description}</div>
                    )}
                  </div>

                  {/* Show some items */}
                  {job.items.length > 0 && (
                    <div className="job-items">
                      <h5>📄 Items (Zeige erste 3):</h5>
                      {job.items.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="job-item">
                          <span className="item-status">{getStatusIcon(item.status)}</span>
                          <span className="item-name">
                            {item.filename || item.url || 'Unknown'}
                          </span>
                          <span className="item-type">{item.type}</span>
                          {item.error && (
                            <span className="item-error" title={item.error}>⚠️</span>
                          )}
                        </div>
                      ))}
                      {job.items.length > 3 && (
                        <div className="more-items">
                          ... und {job.items.length - 3} weitere Items
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="stats-section">
          <h3>📊 System-Statistiken</h3>
          
          {/* Overview Stats */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-value">{stats.totalJobs}</div>
              <div className="stat-label">Gesamt Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeJobs}</div>
              <div className="stat-label">Aktive Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.queueLength}</div>
              <div className="stat-label">In Warteschlange</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.workers.filter(w => w.status === 'busy').length}</div>
              <div className="stat-label">Aktive Workers</div>
            </div>
          </div>

          {/* Job Status Distribution */}
          <div className="status-distribution">
            <h4>📈 Job Status Verteilung</h4>
            <div className="status-grid">
              {Object.entries(stats.jobsByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-icon">{getStatusIcon(status)}</span>
                  <span className="status-name">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workers Status */}
          <div className="workers-status">
            <h4>🏃 Worker Status</h4>
            <div className="workers-grid">
              {stats.workers.map((worker) => (
                <div key={worker.id} className="worker-card">
                  <div className="worker-header">
                    <span className="worker-name">{worker.id}</span>
                    <span className={`worker-status ${worker.status}`}>
                      {worker.status === 'busy' ? '🔥' : '💤'} {worker.status}
                    </span>
                  </div>
                  <div className="worker-details">
                    <div>Verarbeitet: {worker.totalProcessed}</div>
                    {worker.currentJob && (
                      <div>Aktuell: #{worker.currentJob.slice(0, 8)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Types */}
          <div className="supported-types">
            <h4>📁 Unterstützte Dateitypen</h4>
            <div className="types-grid">
              {Object.entries(stats.supportedTypes).map(([type, extensions]) => (
                <div key={type} className="type-card">
                  <div className="type-name">{type.toUpperCase()}</div>
                  <div className="type-extensions">
                    {extensions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiInput;