import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface AvatarJob {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  type: 'full_person' | 'upper_body' | 'head_only';
  voiceType: 'custom' | 'ai_voice_natural' | 'ai_voice_professional' | 'ai_voice_local';
  enableGestures: boolean;
  enableBackgroundRemoval: boolean;
  progress: {
    currentStage: string | null;
    stageProgress: number;
    overallProgress: number;
    completedStages: string[];
  };
  metadata: {
    created: string;
    estimatedDuration: number;
    actualDuration?: number;
    templateUsed?: boolean;
    userPreferences?: any;
  };
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
  templateInfo?: {
    used: boolean;
    path: string;
    timeSaved: number;
  };
}

interface AvatarStats {
  totalJobs: number;
  activeJobs: number;
  queueLength: number;
  jobsByStatus: { [key: string]: number };
  jobsByType: { [key: string]: number };
  averageProcessingTime: number;
  modelStatus: { [key: string]: any };
}

interface AvatarTemplate {
  id: string;
  name: string;
  type: 'full_person' | 'upper_body' | 'head_only';
  previewImage: string;
  description: string;
  tags: string[];
}

interface VoiceTemplate {
  id: string;
  name: string;
  type: 'custom' | 'ai_voice_natural' | 'ai_voice_professional' | 'ai_voice_local';
  previewUrl: string;
  description: string;
}

interface AvatarGeneratorProps {
  apiBase: string;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ apiBase }) => {
  const [jobs, setJobs] = useState<AvatarJob[]>([]);
  const [stats, setStats] = useState<AvatarStats | null>(null);
  const [selectedJob, setSelectedJob] = useState<AvatarJob | null>(null);
  const [templates, setTemplates] = useState<AvatarTemplate[]>([]);
  const [voiceTemplates, setVoiceTemplates] = useState<VoiceTemplate[]>([]);

  // Workflow states
  const [currentStep, setCurrentStep] = useState<'selection' | 'configuration' | 'creation'>('selection');
  const [creationType, setCreationType] = useState<'new' | 'template'>('template');

  // Form states
  const [jobName, setJobName] = useState('');
  const [avatarType, setAvatarType] = useState<'head_only' | 'upper_body' | 'full_person'>('head_only');
  const [voiceType, setVoiceType] = useState<'custom' | 'ai_voice_natural' | 'ai_voice_professional' | 'ai_voice_local'>('custom');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedVoiceTemplate, setSelectedVoiceTemplate] = useState<string>('');
  const [enableGestures, setEnableGestures] = useState(false);
  const [enableBackgroundRemoval, setEnableBackgroundRemoval] = useState(true);
  const [useTemplate, setUseTemplate] = useState(true);
  const [userPreferences, setUserPreferences] = useState({ gender: '', style: '', useCase: '' });
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [audioSamples, setAudioSamples] = useState<File[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [textTemplates, setTextTemplates] = useState<string[]>([]);
  const [selectedTextTemplate, setSelectedTextTemplate] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'jobs' | 'monitoring'>('create');

  const pollInterval = useRef<any>();

  // Configurations
  const avatarConfigs: {
    [key: string]: {
      name: string;
      icon: string;
      time: string;
      timeWithTemplate: string;
      gestures: boolean;
    }
  } = {
    'head_only': { name: 'Nur Kopf', icon: '👤', time: '15-20 Min', timeWithTemplate: '4-6 Min', gestures: false },
    'upper_body': { name: 'Oberkörper', icon: '🧑‍💼', time: '25-30 Min', timeWithTemplate: '8-12 Min', gestures: true },
    'full_person': { name: 'Ganzkörper', icon: '🚶‍♂️', time: '45-60 Min', timeWithTemplate: '15-25 Min', gestures: true }
  };

  const voiceConfigs = {
    'custom': { name: 'Eigene Stimme', provider: 'Audio-Samples' },
    'ai_voice_natural': { name: 'KI-Stimme (Natürlich)', provider: 'ElevenLabs' },
    'ai_voice_professional': { name: 'KI-Stimme (Professionell)', provider: 'ElevenLabs' },
    'ai_voice_local': { name: 'KI-Stimme (Lokal)', provider: 'Coqui TTS' }
  };

  const textTemplateOptions = [
    'Politik & Gesellschaft',
    'Technologie & Innovation',
    'Wirtschaft & Finanzen',
    'Bildung & Wissenschaft',
    'Umwelt & Nachhaltigkeit',
    'Gesundheit & Medizin',
    'Kultur & Unterhaltung',
    'Sport & Freizeit'
  ];

  useEffect(() => {
    loadData();
    loadTemplates();
    pollInterval.current = setInterval(loadData, 3000);
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        axios.get(`${apiBase}/api/avatar/jobs`),
        axios.get(`${apiBase}/api/avatar/stats`)
      ]);

      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (error: any) {
      console.error('Failed to load avatar data:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      // Load avatar templates
      const templatesRes = await axios.get(`${apiBase}/api/avatar/templates/list`);
      if (templatesRes.data.success) {
        setTemplates(templatesRes.data.templates);
      }

      // Load voice templates
      const voiceTemplatesRes = await axios.get(`${apiBase}/api/avatar/voices/list`);
      if (voiceTemplatesRes.data.success) {
        setVoiceTemplates(voiceTemplatesRes.data.templates);
      }

      // Load text templates
      const textTemplatesRes = await axios.get(`${apiBase}/api/avatar/text-templates`);
      if (textTemplatesRes.data.success) {
        setTextTemplates(textTemplatesRes.data.templates);
      }
    } catch (error: any) {
      console.error('Failed to load templates:', error);
    }
  };

  const createAvatarJob = async () => {
    if (!jobName.trim()) {
      setError('Name ist erforderlich');
      return;
    }

    if (creationType === 'new' && !sourceVideo) {
      setError('Quellvideo ist erforderlich');
      return;
    }

    if (voiceType === 'custom' && audioSamples.length === 0 && !selectedVoiceTemplate) {
      setError('Audio-Samples oder eine Stimmevorlage sind erforderlich');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', jobName);
      formData.append('avatarType', avatarType);
      formData.append('voiceType', voiceType);
      formData.append('enableGestures', enableGestures.toString());
      formData.append('enableBackgroundRemoval', enableBackgroundRemoval.toString());
      formData.append('useTemplate', useTemplate.toString());

      // Add user preferences
      if (userPreferences.gender) formData.append('gender', userPreferences.gender);
      if (userPreferences.style) formData.append('style', userPreferences.style);
      if (userPreferences.useCase) formData.append('useCase', userPreferences.useCase);

      // Add source video if creating from scratch
      if (sourceVideo) {
        formData.append('sourceVideo', sourceVideo);
      }

      // Add audio samples
      audioSamples.forEach((file, index) => {
        formData.append(`audioSample_${index}`, file);
      });

      if (backgroundImage) {
        formData.append('backgroundImage', backgroundImage);
      }

      const response = await axios.post(`${apiBase}/api/avatar/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        await loadData();
        resetForm();
        setActiveTab('jobs');
        setCurrentStep('selection');
      } else {
        setError('Erstellung fehlgeschlagen: ' + response.data.error);
      }
    } catch (error: any) {
      setError('Fehler: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setJobName('');
    setSourceVideo(null);
    setAudioSamples([]);
    setBackgroundImage(null);
    setEnableGestures(false);
    setUseTemplate(true);
    setUserPreferences({ gender: '', style: '', useCase: '' });
    setSelectedTemplate('');
    setSelectedVoiceTemplate('');
    setCustomText('');
    setSelectedTextTemplate('');
  };

  const getStatusColor = (status: string) => {
    const colors = { completed: '#4caf50', processing: '#2196f3', failed: '#f44336', queued: '#ff9800' };
    return colors[status as keyof typeof colors] || '#9e9e9e';
  };

  const getStatusIcon = (status: string) => {
    const icons = { completed: '✅', processing: '⚡', failed: '❌', queued: '⏳' };
    return icons[status as keyof typeof icons] || '❓';
  };

  const formatDuration = (ms: number) => ms < 60000 ? `${Math.round(ms / 1000)}s` : `${Math.round(ms / 60000)}min`;
  const formatFileSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  // Render selection step
  const renderSelectionStep = () => (
    <div className="selection-step">
      <h3>🎬 Was möchten Sie erstellen?</h3>
      <div className="creation-options">
        <div
          className={`option-card ${creationType === 'template' ? 'selected' : ''}`}
          onClick={() => setCreationType('template')}
        >
          <div className="option-icon">⚡</div>
          <h4>Aus Vorlage</h4>
          <p>Schnelle Erstellung mit vorgefertigten Avataren</p>
        </div>

        <div
          className={`option-card ${creationType === 'new' ? 'selected' : ''}`}
          onClick={() => setCreationType('new')}
        >
          <div className="option-icon">✨</div>
          <h4>Von Grund auf</h4>
          <p>Eigener Avatar mit individuellen Einstellungen</p>
        </div>
      </div>

      <button
        className="continue-button"
        onClick={() => setCurrentStep('configuration')}
      >
        Weiter ➡️
      </button>
    </div>
  );

  // Render configuration step
  const renderConfigurationStep = () => (
    <div className="configuration-step">
      <h3>⚙️ Konfiguration</h3>

      <div className="form-group">
        <label>Avatar-Name *</label>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Geben Sie einen Namen für Ihren Avatar ein..."
          className="form-input"
        />
      </div>

      {creationType === 'template' ? (
        // Template selection
        <div className="template-selection">
          <h4>🎭 Vorlagen auswählen</h4>
          <div className="templates-grid">
            {templates.map(template => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="template-preview">
                  <div className="placeholder-image">🖼️</div>
                </div>
                <div className="template-info">
                  <h5>{template.name}</h5>
                  <p>{template.description}</p>
                  <div className="template-tags">
                    {template.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Custom creation
        <div className="custom-creation">
          <div className="form-group">
            <label>🎥 Quellvideo *</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setSourceVideo(e.target.files?.[0] || null)}
              className="file-input"
            />
            {sourceVideo && (
              <div className="file-preview">
                📁 {sourceVideo.name} ({formatFileSize(sourceVideo.size)})
                <button onClick={() => setSourceVideo(null)}>❌</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Avatar type selection */}
      <div className="avatar-type-selection">
        <h4>🎭 Avatar-Typ</h4>
        <div className="avatar-types-grid">
          {Object.entries(avatarConfigs).map(([type, config]) => (
            <div
              key={type}
              className={`avatar-type-card ${avatarType === type ? 'selected' : ''}`}
              onClick={() => setAvatarType(type as any)}
            >
              <span className="avatar-type-icon">{config.icon}</span>
              <span className="avatar-type-name">{config.name}</span>
              <span className="avatar-type-time">
                ⏱️ {useTemplate ? config.timeWithTemplate : config.time}
                {useTemplate && <span className="template-speedup"> (⚡ 70% schneller)</span>}
              </span>
              <span className="avatar-gestures">{config.gestures ? '✋ Gesten' : '🚫 Keine Gesten'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Voice selection */}
      <div className="voice-selection">
        <h4>🎤 Stimme auswählen</h4>
        <div className="voice-options">
          <div className="voice-option-group">
            <h5>Vorlagen</h5>
            <div className="voice-templates">
              {voiceTemplates.map(voice => (
                <div
                  key={voice.id}
                  className={`voice-template-card ${selectedVoiceTemplate === voice.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedVoiceTemplate(voice.id);
                    setVoiceType(voice.type);
                  }}
                >
                  <h6>{voice.name}</h6>
                  <p>{voice.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="voice-option-group">
            <h5>Eigene Stimme</h5>
            <div className="custom-voice-upload">
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => setAudioSamples(prev => [...prev, ...Array.from(e.target.files || [])])}
                className="file-input"
              />
              {audioSamples.map((file, index) => (
                <div key={index} className="file-preview">
                  🎵 {file.name} ({formatFileSize(file.size)})
                  <button onClick={() => setAudioSamples(prev => prev.filter((_, i) => i !== index))}>❌</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text templates for training */}
      <div className="text-templates">
        <h4>📝 Text-Vorlagen für Training</h4>
        <div className="text-template-selection">
          <select
            value={selectedTextTemplate}
            onChange={(e) => setSelectedTextTemplate(e.target.value)}
          >
            <option value="">Vorlage auswählen...</option>
            {textTemplates.map((template: string, index: number) => (
              <option key={index} value={template}>{template}</option>
            ))}
          </select>

          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Eigenen Text für das Avatar-Training eingeben..."
            rows={4}
            className="text-input"
          />
        </div>
      </div>

      {/* Additional options */}
      <div className="additional-options">
        <h4>🔧 Weitere Optionen</h4>
        <div className="checkbox-options">
          <label>
            <input type="checkbox" checked={enableGestures} onChange={(e) => setEnableGestures(e.target.checked)} />
            ✋ Gesten aktivieren
          </label>
          <label>
            <input type="checkbox" checked={enableBackgroundRemoval} onChange={(e) => setEnableBackgroundRemoval(e.target.checked)} />
            🎬 Hintergrundentfernung
          </label>
          <label>
            <input type="checkbox" checked={useTemplate} onChange={(e) => setUseTemplate(e.target.checked)} />
            ⚡ Template-basiertes Training (70% schneller)
          </label>
        </div>
      </div>

      <div className="workflow-navigation">
        <button
          className="back-button"
          onClick={() => setCurrentStep('selection')}
        >
          ⬅️ Zurück
        </button>
        <button
          className="create-button"
          onClick={createAvatarJob}
          disabled={isCreating}
        >
          {isCreating ? '⏳ Erstelle Avatar...' : '🎭 Avatar erstellen'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="avatar-generator">
      <div className="section-header">
        <h2>🎭 AI-Avatar Generator</h2>
        <p>Automatisches Training von AI-Avataren mit Lippensynchronisation und Gesten</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button className={`tab-button ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          🎬 Avatar Erstellen
        </button>
        <button className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          📋 Training Jobs ({jobs.length})
        </button>
        <button className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
          📊 System Monitoring
        </button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {/* Create Avatar Tab */}
      {activeTab === 'create' && (
        <div className="create-section">
          {currentStep === 'selection' && renderSelectionStep()}
          {currentStep === 'configuration' && renderConfigurationStep()}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="jobs-section">
          <h3>📋 Avatar Training Jobs</h3>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎭</div>
              <p>Noch keine Avatar-Training-Jobs. Erstellen Sie Ihren ersten Avatar!</p>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <span className="job-status-icon">{getStatusIcon(job.status)}</span>
                    <span className="job-name">{job.name}</span>
                    <span className="job-type">{avatarConfigs[job.type].icon} {avatarConfigs[job.type].name}</span>
                    <span className="job-id">#{job.id.slice(0, 8)}</span>
                  </div>

                  <div className="job-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${job.progress.overallProgress}%`,
                          backgroundColor: getStatusColor(job.status)
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      {job.progress.currentStage && `${job.progress.currentStage}: ${job.progress.stageProgress}%`}
                      <span className="overall-progress">Gesamt: {job.progress.overallProgress}%</span>
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="job-options">
                      {job.enableGestures && <span className="option-badge">✋ Gesten</span>}
                      {job.enableBackgroundRemoval && <span className="option-badge">🎬 Hintergrund</span>}
                      {job.metadata?.templateUsed && <span className="option-badge template">⚡ Template</span>}
                    </div>
                    <div className="job-timing">
                      <span>📅 {new Date(job.metadata.created).toLocaleString()}</span>
                      {job.metadata.actualDuration && <span>⏱️ {formatDuration(job.metadata.actualDuration)}</span>}
                    </div>
                  </div>

                  {job.logs.length > 0 && (
                    <div className="job-logs-preview">
                      <div className="latest-log">
                        <span className={`log-level ${job.logs[job.logs.length - 1].level}`}>
                          {job.logs[job.logs.length - 1].level.toUpperCase()}
                        </span>
                        <span className="log-message">{job.logs[job.logs.length - 1].message}</span>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setSelectedJob(job)} className="details-button">
                    📋 Details anzeigen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && stats && (
        <div className="monitoring-section">
          <h3>📊 Avatar System Monitoring</h3>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">🎭</div>
              <div className="metric-content">
                <div className="metric-value">{stats.totalJobs}</div>
                <div className="metric-label">Gesamt Jobs</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-content">
                <div className="metric-value">{stats.activeJobs}</div>
                <div className="metric-label">Aktive Jobs</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <div className="metric-value">{stats.queueLength}</div>
                <div className="metric-label">Warteschlange</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-value">{formatDuration(stats.averageProcessingTime)}</div>
                <div className="metric-label">Ø Training-Zeit</div>
              </div>
            </div>
          </div>

          <div className="distribution-section">
            <div className="distribution-card">
              <h4>📊 Jobs nach Status</h4>
              {Object.entries(stats.jobsByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-icon" style={{ color: getStatusColor(status) }}>●</span>
                  <span className="status-name">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            </div>

            <div className="distribution-card">
              <h4>🎭 Jobs nach Avatar-Typ</h4>
              {Object.entries(stats.jobsByType).map(([type, count]) => (
                <div key={type} className="type-item">
                  <span className="type-icon">{avatarConfigs[type as keyof typeof avatarConfigs]?.icon}</span>
                  <span className="type-name">{avatarConfigs[type as keyof typeof avatarConfigs]?.name}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="model-status-section">
            <h4>🤖 AI-Model Status</h4>
            <div className="model-status-grid">
              {Object.entries(stats.modelStatus).map(([model, status]) => (
                <div key={model} className="model-status-card">
                  <div className="model-name">{model}</div>
                  <div className="model-details">
                    <span className={`model-indicator ${status.available ? 'available' : 'unavailable'}`}>
                      {status.available ? '✅' : '❌'}
                    </span>
                    <span className="model-version">{status.version || status.model || 'Unbekannt'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="job-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🔍 Job Details: {selectedJob.name}</h3>
              <button onClick={() => setSelectedJob(null)} className="close-button">✕</button>
            </div>

            <div className="job-info">
              <p><strong>ID:</strong> {selectedJob.id}</p>
              <p><strong>Status:</strong> {selectedJob.status}</p>
              <p><strong>Typ:</strong> {avatarConfigs[selectedJob.type].name}</p>
              <p><strong>Stimme:</strong> {voiceConfigs[selectedJob.voiceType].name}</p>
              <p><strong>Progress:</strong> {selectedJob.progress.overallProgress}%</p>
              {selectedJob.metadata?.templateUsed && (
                <div className="template-usage">
                  <p><strong>🎯 Template:</strong> ✅ Verwendet</p>
                  {selectedJob.templateInfo?.timeSaved && (
                    <p><strong>⚡ Zeit gespart:</strong> {formatDuration(selectedJob.templateInfo.timeSaved)}</p>
                  )}
                </div>
              )}
            </div>

            <div className="logs-section">
              <h4>📜 Training Logs</h4>
              <div className="logs-container">
                {selectedJob.logs.map((log, index) => (
                  <div key={index} className="log-item">
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`log-level ${log.level}`}>{log.level}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarGenerator;