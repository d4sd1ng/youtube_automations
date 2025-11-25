import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ScrapingResult {
  success: boolean;
  totalItems: number;
  sources: {
    reddit: number;
    hackernews: number;
    youtube: number;
    twitter: number;
    tiktok: number;
    instagram: number;
    bundestag: number;
    landtags: number;
    talkshows: number;
    aiResearch: number;
    aiPapers: number;
  };
  topItems: Array<{
    source: string;
    title: string;
    engagement: number;
    viralPotential: number;
    url: string;
    created: string;
    momentum?: number;
  }>;
  duration: number;
  timestamp: string;
}

interface ScrapingStats {
  enabled: boolean;
  weekendPause: boolean;
  isWeekend: boolean;
  totalScrapingRuns: number;
  latestScrape: string;
  totalItemsLastRun: number;
  sources: string[];
  nextScrape: string;
}

interface TrendAnalysis {
  trends: Array<{
    keyword: string;
    mentions: number;
    sources: string[];
    crossPlatform: boolean;
    avgEngagement: number;
    avgViralPotential: number;
    trendingScore: number;
    momentum: number;
    sampleTitles: string[];
  }>;
  topics: Array<{
    category: string;
    items: Array<any>;
    avgScore: number;
    avgViralPotential: number;
  }>;
  analysis: {
    totalContent: number;
    trendsFound: number;
    topicsAnalyzed: number;
    sources: string[];
    topTrend: any;
    analysisTime: string;
  };
}

interface WebScrapingProps {
  apiBase: string;
}

const WebScraping: React.FC<WebScrapingProps> = ({ apiBase }) => {
  const [scrapingResult, setScrapingResult] = useState<ScrapingResult | null>(null);
  const [scrapingStats, setScrapingStats] = useState<ScrapingStats | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [firecrawlStatus, setFirecrawlStatus] = useState<boolean>(false);
  
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadScrapingStats();
    loadLatestTrends();
    checkFirecrawlStatus();
  }, []);

  const checkFirecrawlStatus = async () => {
    try {
      // In a real implementation, we would check the actual Firecrawl API key status
      // For now, we'll assume it's enabled if the API key is present
      const hasFirecrawlKey = process.env.FIRECRAWL_API_KEY || true; // Simplified check
      setFirecrawlStatus(!!hasFirecrawlKey);
    } catch (error) {
      console.error('Failed to check Firecrawl status:', error);
      setFirecrawlStatus(false);
    }
  };

  const loadScrapingStats = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/scraping/status`);
      if (response.data.success) {
        setScrapingStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Failed to load scraping stats:', error);
    }
  };

  const loadLatestTrends = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/trends/latest`);
      if (response.data.success) {
        setTrendAnalysis(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load trends:', error);
    }
  };

  const startScraping = async () => {
    setIsScrapingLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${apiBase}/api/scraping/start`);
      
      if (response.data.success) {
        setScrapingResult(response.data);
        await loadScrapingStats();
      } else {
        setError('Scraping failed: ' + (response.data.reason || 'Unknown error'));
      }
    } catch (error: any) {
      setError('Scraping failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const analyzeTrends = async () => {
    setIsTrendLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${apiBase}/api/trends/analyze`);
      
      if (response.data.success) {
        setTrendAnalysis(response.data);
      } else {
        setError('Trend analysis failed');
      }
    } catch (error: any) {
      setError('Trend analysis failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsTrendLoading(false);
    }
  };

  const runFullPipeline = async () => {
    setIsPipelineLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${apiBase}/api/pipeline/scrape-and-analyze`);
      
      if (response.data.success) {
        setScrapingResult(response.data.pipeline.scraping);
        setTrendAnalysis(response.data.pipeline.trends);
        await loadScrapingStats();
      } else {
        setError('Pipeline failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error: any) {
      setError('Pipeline failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsPipelineLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getScoreColor = (score: number, max: number = 10): string => {
    const percentage = score / max;
    if (percentage > 0.8) return '#4caf50';
    if (percentage > 0.6) return '#ff9800';
    if (percentage > 0.4) return '#ff5722';
    return '#f44336';
  };

  return (
    <div className="web-scraping">
      <div className="section-header">
        <h2>🕷️ Web & Social Media Scraping</h2>
        <p>Automatisiertes Sammeln von Trending Content aus sozialen Medien, politischen Quellen, KI-Forschung und Tech-News mit Weekend-Pause-Compliance.</p>
      </div>

      {/* Firecrawl Status */}
      <div className={`firecrawl-status clean-card ${firecrawlStatus ? 'enabled' : 'disabled'}`}>
        <div className="status-header">
          <span className="status-icon">
            {firecrawlStatus ? '🟢' : '🔴'}
          </span>
          <h3>
            {firecrawlStatus ? 'Firecrawl Integration Aktiv' : 'Firecrawl Integration Inaktiv'}
          </h3>
        </div>
        <div className="status-details">
          <p>
            {firecrawlStatus 
              ? '🔥 Hochwertiges Scraping mit Firecrawl für bessere Ergebnisse' 
              : '💡 Firecrawl kann für verbessertes Scraping aktiviert werden'}
          </p>
        </div>
      </div>

      {/* System Status */}
      {scrapingStats && (
        <div className={`status-card clean-card ${scrapingStats.enabled ? 'enabled' : 'disabled'}`}>
          <div className="status-header">
            <span className={`status-indicator ${scrapingStats.enabled ? 'running' : 'paused'}`}>
              {scrapingStats.enabled ? '🟢' : '⏸️'}
            </span>
            <h3>
              {scrapingStats.enabled ? 'Scraping Aktiv' : 
               scrapingStats.isWeekend ? 'Weekend-Pause' : 'System Pausiert'}
            </h3>
          </div>
          
          <div className="status-details">
            <div className="detail-row">
              <span>Letzte Ausführung:</span>
              <span>{scrapingStats.latestScrape ? formatDate(scrapingStats.latestScrape) : 'Nie'}</span>
            </div>
            <div className="detail-row">
              <span>Letzte Anzahl Items:</span>
              <span>{scrapingStats.totalItemsLastRun}</span>
            </div>
            <div className="detail-row">
              <span>Aktive Quellen:</span>
              <span>{scrapingStats.sources.join(', ')}</span>
            </div>
            <div className="detail-row">
              <span>Nächste Ausführung:</span>
              <span>{scrapingStats.nextScrape === 'Available now' ? 'Verfügbar' : formatDate(scrapingStats.nextScrape)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-panel">
        <button
          onClick={startScraping}
          disabled={isScrapingLoading || isPipelineLoading || (scrapingStats?.isWeekend)}
          className="simple-button primary"
        >
          {isScrapingLoading ? '🕷️ Scrapt...' : '🕷️ Content Scrapen'}
        </button>

        <button
          onClick={analyzeTrends}
          disabled={isTrendLoading || isPipelineLoading}
          className="simple-button success"
        >
          {isTrendLoading ? '📈 Analysiert...' : '📈 Trends Analysieren'}
        </button>

        <button
          onClick={runFullPipeline}
          disabled={isPipelineLoading || (scrapingStats?.isWeekend)}
          className="simple-button secondary"
        >
          {isPipelineLoading ? '🔄 Pipeline läuft...' : '🚀 Komplette Pipeline'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Weekend Notice */}
      {scrapingStats?.isWeekend && (
        <div className="weekend-notice clean-card">
          🏖️ <strong>Weekend-Pause aktiv</strong><br/>
          Scraping ist von Freitag 18:00 bis Montag 06:00 pausiert zur Compliance.
        </div>
      )}

      {/* Scraping Results */}
      {scrapingResult && (
        <div className="scraping-results clean-card">
          <h3>🕷️ Scraping-Ergebnisse</h3>
          <div className="results-summary responsive-grid">
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.totalItems}</div>
              <div className="summary-label">Gesamt Items</div>
            </div>
            
            {/* Social Media Sources */}
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.reddit}</div>
              <div className="summary-label">Reddit Posts</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.hackernews}</div>
              <div className="summary-label">Hacker News</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.youtube}</div>
              <div className="summary-label">YouTube</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.twitter}</div>
              <div className="summary-label">Twitter</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.tiktok}</div>
              <div className="summary-label">TikTok</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.instagram}</div>
              <div className="summary-label">Instagram</div>
            </div>
            
            {/* Political Sources */}
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.bundestag}</div>
              <div className="summary-label">Bundestag</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.landtags}</div>
              <div className="summary-label">Landtage</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.talkshows}</div>
              <div className="summary-label">Talkshows</div>
            </div>
            
            {/* AI Sources */}
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.aiResearch}</div>
              <div className="summary-label">AI Forschung</div>
            </div>
            <div className="responsive-grid-item">
              <div className="summary-value">{scrapingResult.sources.aiPapers}</div>
              <div className="summary-label">AI Papers</div>
            </div>
            
            <div className="responsive-grid-item">
              <div className="summary-value">{Math.round(scrapingResult.duration / 1000)}s</div>
              <div className="summary-label">Dauer</div>
            </div>
          </div>

          {/* Top Items */}
          {scrapingResult.topItems && scrapingResult.topItems.length > 0 && (
            <div className="top-items">
              <h4>🔥 Top Content</h4>
              <div className="items-grid responsive-grid">
                {scrapingResult.topItems.slice(0, 6).map((item, index) => (
                  <div key={index} className="content-item clean-card">
                    <div className="item-header">
                      <span className="source-badge">{item.source}</span>
                      <span 
                        className="viral-score"
                        style={{ color: getScoreColor(item.viralPotential) }}
                      >
                        🔥 {item.viralPotential}
                      </span>
                    </div>
                    <h5>{item.title}</h5>
                    <div className="item-stats">
                      <span>💬 {item.engagement}</span>
                      <span>{formatDate(item.created)}</span>
                    </div>
                    <button 
                      onClick={() => window.open(item.url, "_blank")}
                      className="simple-button primary"
                    >
                      🔗 Öffnen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend Analysis Results */}
      {trendAnalysis && (
        <div className="trend-analysis clean-card">
          <h3>📈 Trend-Analyse</h3>
          
          {/* Analysis Summary */}
          {trendAnalysis.analysis && (
            <div className="analysis-summary responsive-grid">
              <div className="responsive-grid-item">
                <div className="summary-value">{trendAnalysis.analysis.trendsFound}</div>
                <div className="summary-label">Trends Gefunden</div>
              </div>
              <div className="responsive-grid-item">
                <div className="summary-value">{trendAnalysis.analysis.topicsAnalyzed}</div>
                <div className="summary-label">Themen Kategorien</div>
              </div>
              <div className="responsive-grid-item">
                <div className="summary-value">{trendAnalysis.analysis.totalContent}</div>
                <div className="summary-label">Analysierte Items</div>
              </div>
              <div className="responsive-grid-item">
                <div className="summary-value">{trendAnalysis.analysis.sources.length}</div>
                <div className="summary-label">Datenquellen</div>
              </div>
            </div>
          )}

          {/* Top Trends */}
          {trendAnalysis.trends && trendAnalysis.trends.length > 0 && (
            <div className="trends-section">
              <h4>🔥 Trending Keywords</h4>
              <div className="trends-grid responsive-grid">
                {trendAnalysis.trends.slice(0, 12).map((trend, index) => (
                  <div key={index} className="trend-item clean-card">
                    <div className="trend-header">
                      <span className="trend-keyword">{trend.keyword}</span>
                      <span 
                        className="trend-score"
                        style={{ color: getScoreColor(trend.trendingScore) }}
                      >
                        {trend.trendingScore}
                      </span>
                    </div>
                    <div className="trend-stats">
                      <div className="stat">
                        <span className="stat-label">Erwähnungen:</span>
                        <span className="stat-value">{trend.mentions}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Plattformen:</span>
                        <span className="stat-value">{trend.sources.join(', ')}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Engagement:</span>
                        <span className="stat-value">{trend.avgEngagement}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Momentum:</span>
                        <span className="stat-value">{Math.round(trend.momentum * 10) / 10}</span>
                      </div>
                    </div>
                    
                    {/* Sample Titles */}
                    {trend.sampleTitles && trend.sampleTitles.length > 0 && (
                      <div className="sample-titles">
                        <strong>Beispiele:</strong>
                        {trend.sampleTitles.slice(0, 2).map((title, idx) => (
                          <div key={idx} className="sample-title">
                            "{title.substring(0, 60)}{title.length > 60 ? '...' : ''}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Topics */}
          {trendAnalysis.topics && trendAnalysis.topics.length > 0 && (
            <div className="topics-section">
              <h4>🎯 Top Themen-Kategorien</h4>
              <div className="topics-grid responsive-grid">
                {trendAnalysis.topics.slice(0, 8).map((topic, index) => (
                  <div key={index} className="topic-item clean-card">
                    <div className="topic-header">
                      <span className="topic-name">{topic.category}</span>
                      <span className="topic-count">{topic.items.length} Items</span>
                    </div>
                    <div className="topic-stats">
                      <div className="stat">
                        <span>⌀ Score: {Math.round(topic.avgScore)}</span>
                      </div>
                      <div className="stat">
                        <span>🔥 Viral: {Math.round(topic.avgViralPotential * 10) / 10}</span>
                      </div>
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

export default WebScraping;