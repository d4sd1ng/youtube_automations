import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ApiStatusDashboard from './ApiStatusDashboard';

interface PipelineJob {
  id: string;
  name: string;
  template: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  progress: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
    stepName: string;
  };
  steps: Array<{
    id: string;
    name: string;
    service: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: string;
    endTime?: string;
    duration?: number;
    result?: any;
    error?: string;
    aiRequired: boolean;
  }>;
  metadata: {
    topic?: string;
    contentType?: string;
    targetLength?: string;
    keywords?: string[];
    estimatedCost?: number;
    actualCost?: number;
    tokens?: {
      estimated: number;
      actual: number;
    };
  };
  created: string;
  updated: string;
  estimatedDuration: number;
  actualDuration?: number;
}

interface PipelineStats {
  totalJobs: number;
  activeJobs: number;
  queueLength: number;
  completedToday: number;
  failedToday: number;
  totalCost: number;
  totalTokens: number;
  averageJobDuration: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'warning' | 'error';
      uptime: number;
      requestCount: number;
      errorRate: number;
    };
  };
}

interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'politik' | 'ki' | 'allgemein';
  steps: Array<{
    id: string;
    name: string;
    service: string;
    aiRequired: boolean;
    estimatedDuration: number;
  }>;
  defaultConfig: {
    contentType: string;
    targetLength: string;
    tone: string;
  };
  keywords: string[];
  estimatedCost: number;
}

interface PipelineDashboardProps {
  apiBase: string;
}

const PipelineDashboard: React.FC<PipelineDashboardProps> = ({ apiBase }) => {
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [templates, setTemplates] = useState<PipelineTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Job creation form
  const [jobName, setJobName] = useState('');
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('explanation');
  const [targetLength, setTargetLength] = useState('5min');
  const [tone, setTone] = useState('informativ');
  const [keywords, setKeywords] = useState('');
  const [priority, setPriority] = useState(2);
  const [customConfig, setCustomConfig] = useState('{}');
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'jobs' | 'monitoring' | 'settings'>('overview');
  
  // Fix the NodeJS.Timeout type error
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Predefined templates for the YouTube automation system
  const defaultTemplates: PipelineTemplate[] = [
    {
      id: 'politik_long_analysis',
      name: 'Politik Long-Format Analyse',
      description: 'Ausführliche Analyse aktueller politischer Ereignisse (1-2 pro Woche)',
      category: 'politik',
      steps: [
        { id: 'bundestag_scraping', name: 'Bundestag & Politik Scraping', service: 'webScraping', aiRequired: false, estimatedDuration: 45000 },
        { id: 'trend_analysis', name: 'Themen Relevanz & Viral-Potential', service: 'trendAnalysis', aiRequired: true, estimatedDuration: 60000 },
        { id: 'content_research', name: 'Multi-Source Research', service: 'multiInput', aiRequired: false, estimatedDuration: 90000 },
        { id: 'long_script', name: 'Long-Format Script (10-15min)', service: 'scriptGeneration', aiRequired: true, estimatedDuration: 180000 },
        { id: 'quality_check', name: 'Fact-Check & Quality Review', service: 'prompting', aiRequired: true, estimatedDuration: 60000 }
      ],
      defaultConfig: { contentType: 'news', targetLength: '10min', tone: 'informativ' },
      keywords: ['#Bundestag', '#Politik', '#AfD', '#CDU', '#SPD', '#Deutschland', '#Verfassungsschutz'],
      estimatedCost: 0.25
    },
    {
      id: 'ki_viral_shorts',
      name: 'KI Viral Shorts Generator',
      description: 'Schnelle KI-Trend Shorts für maximale Reichweite (täglich möglich)',
      category: 'ki',
      steps: [
        { id: 'ai_news_scraping', name: 'KI News & Papers Scraping', service: 'webScraping', aiRequired: false, estimatedDuration: 30000 },
        { id: 'viral_analysis', name: 'Viral Potential Bewertung', service: 'trendAnalysis', aiRequired: true, estimatedDuration: 45000 },
        { id: 'short_script', name: 'Shorts Script (30s)', service: 'scriptGeneration', aiRequired: true, estimatedDuration: 90000 },
        { id: 'virality_optimization', name: 'Viral Hooks & CTAs', service: 'prompting', aiRequired: true, estimatedDuration: 60000 }
      ],
      defaultConfig: { contentType: 'explanation', targetLength: '30s', tone: 'unterhaltsam' },
      keywords: ['#AI', '#OpenAI', '#ChatGPT', '#Claude', '#Gemini', '#KI', '#Genspark', '#Whisky'],
      estimatedCost: 0.12
    },
    {
      id: 'breaking_news_rapid',
      name: 'Breaking News Rapid Response',
      description: 'Schnelle Reaktion auf Breaking Political News (1min Format)',
      category: 'politik',
      steps: [
        { id: 'breaking_monitor', name: 'Breaking News Monitoring', service: 'webScraping', aiRequired: false, estimatedDuration: 20000 },
        { id: 'relevance_filter', name: 'Relevanz & Impact Assessment', service: 'trendAnalysis', aiRequired: true, estimatedDuration: 30000 },
        { id: 'rapid_script', name: 'Rapid Response Script', service: 'scriptGeneration', aiRequired: true, estimatedDuration: 60000 },
        { id: 'urgent_optimization', name: 'Breaking News Optimization', service: 'prompting', aiRequired: true, estimatedDuration: 45000 }
      ],
      defaultConfig: { contentType: 'news', targetLength: '1min', tone: 'urgent' },
      keywords: ['#Breaking', '#Eilmeldung', '#Politik', '#Live', '#Deutschland', '#Bundestag'],
      estimatedCost: 0.08
    },
    {
      id: 'talkshow_analysis',
      name: 'Talkshow Content Mining',
      description: 'Analyse von Lanz, Illner, Maischberger für Content-Highlights',
      category: 'politik',
      steps: [
        { id: 'talkshow_scraping', name: 'Talkshow Monitoring', service: 'webScraping', aiRequired: false, estimatedDuration: 60000 },
        { id: 'highlight_detection', name: 'Best Quotes & Moments', service: 'trendAnalysis', aiRequired: true, estimatedDuration: 75000 },
        { id: 'content_processing', name: 'Multi-Format Processing', service: 'multiInput', aiRequired: false, estimatedDuration: 45000 },
        { id: 'commentary_script', name: 'Commentary & Analysis', service: 'scriptGeneration', aiRequired: true, estimatedDuration: 120000 },
        { id: 'engagement_optimization', name: 'Engagement Maximierung', service: 'prompting', aiRequired: true, estimatedDuration: 60000 }
      ],
      defaultConfig: { contentType: 'review', targetLength: '5min', tone: 'kritisch' },
      keywords: ['#Lanz', '#Illner', '#Maischberger', '#Talkshow', '#Politik', '#Analyse'],
      estimatedCost: 0.18
    }
  ];

  useEffect(() => {
    loadData();
    setTemplates(defaultTemplates);
    
    // Poll for updates every 3 seconds
    pollInterval.current = setInterval(() => {
      loadData();
    }, 3000);
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        axios.get(`${apiBase}/api/pipeline/jobs`),
        axios.get(`${apiBase}/api/pipeline/stats`)
      ]);
      
      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (error: any) {
      console.error('Failed to load pipeline data:', error);
    }
  };

  const createPipelineJob = async () => {
    if (!selectedTemplate || !topic.trim()) {
      setError('Template und Topic sind erforderlich');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template nicht gefunden');

      const jobConfig = {
        name: jobName || `${template.name} - ${topic}`,
        template: selectedTemplate,
        priority,
        config: {
          topic: topic.trim(),
          contentType,
          targetLength,
          tone,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
          customConfig: customConfig ? JSON.parse(customConfig) : {}
        }
      };

      const response = await axios.post(`${apiBase}/api/pipeline/create`, jobConfig);
      
      if (response.data.success) {
        await loadData();
        // Reset form
        setJobName('');
        setTopic('');
        setKeywords('');
        setCustomConfig('{}');
        setActiveTab('jobs');
      } else {
        setError('Pipeline-Job Erstellung fehlgeschlagen: ' + response.data.error);
      }
    } catch (error: any) {
      setError('Pipeline-Job Erstellung fehlgeschlagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await axios.post(`${apiBase}/api/pipeline/cancel`, { jobId });
      await loadData();
    } catch (error: any) {
      setError('Job-Abbruch fehlgeschlagen: ' + error.message);
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      await axios.post(`${apiBase}/api/pipeline/retry`, { jobId });
      await loadData();
    } catch (error: any) {
      setError('Job-Wiederholung fehlgeschlagen: ' + error.message);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}min`;
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'running': return '#2196f3';
      case 'failed': return '#f44336';
      case 'cancelled': return '#ff9800';
      case 'queued': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '⚡';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
      case 'queued': return '⏳';
      default: return '❓';
    }
  };

  const getServiceIcon = (service: string): string => {
    switch (service) {
      case 'webScraping': return '🕷️';
      case 'trendAnalysis': return '📈';
      case 'multiInput': return '📂';
      case 'scriptGeneration': return '📝';
      case 'prompting': return '🧠';
      default: return '⚙️';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'politik': return '🏛️';
      case 'ki': return '🤖';
      case 'allgemein': return '🌐';
      default: return '📋';
    }
  };

  return (
    <div className="pipeline-dashboard">
      <div className="section-header">
        <h2>🎬 Video Pipeline Dashboard</h2>
        <p>Überwachen und verwalten Sie alle Videoerstellungs-Pipelines</p>
      </div>

      {systemControl && (
        <div className="system-status-section clean-card">
          <h3>🎮 System Status</h3>
          <div className="status-content">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value ${systemControl.status}`}>
                {systemControl.status === 'running' && '🟢 RUNNING'}
                {systemControl.status === 'stopped' && '🔴 STOPPED'}
                {systemControl.status === 'weekend_pause' && '🟡 WEEKEND_PAUSE'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Weekend Pause:</span>
              <span className="status-value">
                {systemControl.autoWeekendPause ? 'Aktiviert' : 'Deaktiviert'}
              </span>
            </div>
            {systemControl.nextAction && (
              <div className="status-item">
                <span className="status-label">Nächste Aktion:</span>
                <span className="status-value">{systemControl.nextAction}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button 
          onClick={loadPipelineStats}
          className="simple-button primary"
          disabled={loading}
        >
          {loading ? '↻ Aktualisiere...' : '↻ Daten aktualisieren'}
        </button>
        
        <button 
          onClick={refreshAllData}
          className="simple-button secondary"
          disabled={loading}
        >
          {loading ? '↻ Aktualisiere alles...' : '↻ Alle Daten aktualisieren'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {pipelineStats && (
        <div className="stats-section clean-card">
          <h3>📊 Pipeline Statistiken</h3>
          <div className="stats-grid responsive-grid">
            <div className="stat-card responsive-grid-item">
              <div className="stat-value">{pipelineStats.totalPipelines}</div>
              <div className="stat-label">Gesamt Pipelines</div>
            </div>
            <div className="stat-card responsive-grid-item">
              <div className="stat-value">{pipelineStats.activePipelines}</div>
              <div className="stat-label">Aktive Pipelines</div>
            </div>
            <div className="stat-card responsive-grid-item">
              <div className="stat-value">{pipelineStats.completedPipelines}</div>
              <div className="stat-label">Abgeschlossen</div>
            </div>
            <div className="stat-card responsive-grid-item">
              <div className="stat-value">{pipelineStats.failedPipelines}</div>
              <div className="stat-label">Fehlgeschlagen</div>
            </div>
            <div className="stat-card responsive-grid-item">
              <div className="stat-value">{pipelineStats.averageProcessingTime}</div>
              <div className="stat-label">⌀ Verarbeitungszeit (min)</div>
            </div>
            <div className="stat-card responsive-grid-item">
              <div className="stat-value">{pipelineStats.successRate}%</div>
              <div className="stat-label">Erfolgsrate</div>
            </div>
          </div>
        </div>
      )}

      {recentPipelines && recentPipelines.length > 0 && (
        <div className="pipelines-section clean-card">
          <h3>📋 Aktuelle Pipelines</h3>
          <div className="pipelines-list">
            {recentPipelines.map((pipeline) => (
              <div key={pipeline.id} className="pipeline-item clean-card">
                <div className="pipeline-header">
                  <h4>{pipeline.topic}</h4>
                  <span className={`status-indicator ${pipeline.status}`}>
                    {pipeline.status === 'completed' && '✅'}
                    {pipeline.status === 'running' && '🔄'}
                    {pipeline.status === 'failed' && '❌'}
                    {pipeline.status === 'pending' && '⏳'}
                  </span>
                </div>
                <div className="pipeline-details">
                  <p><strong>Typ:</strong> {pipeline.type}</p>
                  <p><strong>ID:</strong> {pipeline.id}</p>
                  <p><strong>Erstellt:</strong> {formatDate(pipeline.createdAt)}</p>
                  {pipeline.completedAt && (
                    <p><strong>Abgeschlossen:</strong> {formatDate(pipeline.completedAt)}</p>
                  )}
                  {pipeline.processingTime && (
                    <p><strong>Verarbeitungszeit:</strong> {Math.round(pipeline.processingTime / 60)} min</p>
                  )}
                </div>
                <div className="pipeline-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${pipeline.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{pipeline.progress || 0}%</span>
                </div>
                <div className="pipeline-actions">
                  <button 
                    onClick={() => viewPipelineDetails(pipeline.id)}
                    className="simple-button secondary"
                  >
                    Details anzeigen
                  </button>
                  {pipeline.status === 'running' && (
                    <button 
                      onClick={() => cancelPipeline(pipeline.id)}
                      className="simple-button danger"
                    >
                      Abbrechen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resourceUsage && (
        <div className="resources-section clean-card">
          <h3>💻 Ressourcennutzung</h3>
          <div className="resources-grid responsive-grid">
            <div className="resource-card responsive-grid-item">
              <div className="resource-label">CPU</div>
              <div className="resource-value">{resourceUsage.cpu}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${resourceUsage.cpu}%`, backgroundColor: getColorForPercentage(resourceUsage.cpu) }}
                ></div>
              </div>
            </div>
            <div className="resource-card responsive-grid-item">
              <div className="resource-label">RAM</div>
              <div className="resource-value">{resourceUsage.memory}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${resourceUsage.memory}%`, backgroundColor: getColorForPercentage(resourceUsage.memory) }}
                ></div>
              </div>
            </div>
            <div className="resource-card responsive-grid-item">
              <div className="resource-label">Disk</div>
              <div className="resource-value">{resourceUsage.disk}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${resourceUsage.disk}%`, backgroundColor: getColorForPercentage(resourceUsage.disk) }}
                ></div>
              </div>
            </div>
            <div className="resource-card responsive-grid-item">
              <div className="resource-label">Netzwerk</div>
              <div className="resource-value">{resourceUsage.network} MB/s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineDashboard;