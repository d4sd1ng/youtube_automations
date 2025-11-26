import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
  channelCategory: string;
  channelPriority: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;
}

interface DiscoveryResult {
  category: string;
  timeframe: string;
  discovered: string;
  videos: Video[];
  summary: {
    totalChannelsScanned: number;
    totalVideosFound: number;
    avgViewCount: number;
    topPerformers: Array<{
      title: string;
      channel: string;
      views: number;
      engagement: number;
    }>;
  };
}

interface TrendingTopic {
  topic: string;
  frequency: number;
  category: string;
}

interface VideoDiscoveryProps {
  apiBase: string;
}

const VideoDiscovery: React.FC<VideoDiscoveryProps> = ({ apiBase }) => {
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [videoLimit, setVideoLimit] = useState(20);

  const categories = {
    'all': 'Alle Kategorien',
    'politics': 'Politik',
    'ai_tech': 'KI & Technologie'
  };

  const timeframes = {
    '1d': '1 Tag',
    '3d': '3 Tage', 
    '7d': '7 Tage',
    '14d': '14 Tage',
    '30d': '30 Tage'
  };

  useEffect(() => {
    loadDiscoveryData();
  }, [selectedCategory, selectedTimeframe, videoLimit]);

  const loadDiscoveryData = async () => {
    setLoading(true);
    setError('');

    try {
      const [videosRes, trendsRes] = await Promise.all([
        axios.get(`${apiBase}/api/discovery/videos`, {
          params: {
            category: selectedCategory,
            timeframe: selectedTimeframe,
            limit: videoLimit
          }
        }),
        axios.get(`${apiBase}/api/discovery/trends`, {
          params: {
            category: selectedCategory,
            limit: 15
          }
        })
      ]);

      setDiscoveryResult(videosRes.data);
      setTrendingTopics(trendsRes.data.trends || []);
    } catch (error: any) {
      console.error('Discovery failed:', error);
      setError('Fehler beim Laden der Video-Daten: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEngagementColor = (rate: number): string => {
    if (rate >= 5) return '#4caf50';
    if (rate >= 2) return '#ff9800';
    return '#f44336';
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'politics_de': 
      case 'politics_en':
      case 'politics_global': return '#2196f3';
      case 'ai_programming':
      case 'ai_general': 
      case 'ai_education': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  return (
    <div className="video-discovery">
      <div className="section-header">
        <h2>🔍 Video Discovery & Research</h2>
        <p>Entdecken Sie Top-Videos von führenden Politik- und KI-Kanälen für Content-Inspiration.</p>
      </div>

      {/* Configuration Panel */}
      <div className="config-panel">
        <h3>⚙️ Suchkonfiguration</h3>
        <div className="config-grid">
          <div className="config-group">
            <label>Kategorie:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="config-group">
            <label>Zeitraum:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              {Object.entries(timeframes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="config-group">
            <label>Anzahl Videos:</label>
            <select
              value={videoLimit}
              onChange={(e) => setVideoLimit(parseInt(e.target.value))}
            >
              <option value={10}>10 Videos</option>
              <option value={20}>20 Videos</option>
              <option value={50}>50 Videos</option>
              <option value={100}>100 Videos</option>
            </select>
          </div>

          <div className="config-group">
            <button 
              onClick={loadDiscoveryData}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '🔍 Suche...' : '🚀 Videos entdecken'}
            </button>
          </div>
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
          <p>Analysiere Top-Videos aus führenden Kanälen...</p>
        </div>
      )}

      {/* Discovery Summary */}
      {discoveryResult && (
        <div className="discovery-summary">
          <h3>📊 Entdeckungs-Übersicht</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-value">{discoveryResult.summary.totalVideosFound}</div>
              <div className="card-label">Videos gefunden</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{discoveryResult.summary.totalChannelsScanned}</div>
              <div className="card-label">Kanäle gescannt</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{formatNumber(discoveryResult.summary.avgViewCount)}</div>
              <div className="card-label">⌀ Aufrufe</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{categories[selectedCategory as keyof typeof categories]}</div>
              <div className="card-label">Kategorie</div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <div className="trending-topics">
          <h3>📈 Trending-Themen</h3>
          <div className="topics-cloud">
            {trendingTopics.slice(0, 12).map((topic, index) => (
              <span 
                key={index}
                className="topic-tag"
                style={{ 
                  fontSize: Math.max(12, 16 + (topic.frequency / Math.max(...trendingTopics.map(t => t.frequency))) * 8) + 'px'
                }}
              >
                {topic.topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {discoveryResult && discoveryResult.summary.topPerformers.length > 0 && (
        <div className="top-performers">
          <h3>🏆 Top-Performer</h3>
          <div className="performers-list">
            {discoveryResult.summary.topPerformers.map((performer, index) => (
              <div key={index} className="performer-item">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-title">{performer.title}</div>
                  <div className="performer-meta">
                    <span className="performer-channel">{performer.channel}</span>
                    <span className="performer-views">{formatNumber(performer.views)} Aufrufe</span>
                    <span 
                      className="performer-engagement"
                      style={{ color: getEngagementColor(performer.engagement) }}
                    >
                      {performer.engagement}% Engagement
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos List */}
      {discoveryResult && discoveryResult.videos.length > 0 && (
        <div className="videos-results">
          <h3>🎥 Entdeckte Videos</h3>
          <div className="videos-grid">
            {discoveryResult.videos.map((video) => (
              <div key={video.videoId} className="video-card">
                <div className="video-header">
                  <h4 className="video-title">{video.title}</h4>
                  <span 
                    className="video-category"
                    style={{ backgroundColor: getCategoryColor(video.channelCategory) }}
                  >
                    {video.channelCategory}
                  </span>
                </div>
                
                <div className="video-meta">
                  <div className="video-channel">{video.channelTitle}</div>
                  <div className="video-date">{formatDate(video.publishedAt)}</div>
                </div>

                <div className="video-description">
                  {video.description.length > 150 
                    ? video.description.substring(0, 150) + '...'
                    : video.description}
                </div>

                <div className="video-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-value">{formatNumber(video.viewCount)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👍</span>
                    <span className="stat-value">{formatNumber(video.likeCount)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <span className="stat-value">{formatNumber(video.commentCount)}</span>
                  </div>
                  <div className="stat-item engagement">
                    <span className="stat-icon">📊</span>
                    <span 
                      className="stat-value"
                      style={{ color: getEngagementColor(video.engagementRate) }}
                    >
                      {video.engagementRate}%
                    </span>
                  </div>
                </div>

                <div className="video-actions">
                  <button 
                    className="btn btn-sm"
                    onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                  >
                    🔗 Auf YouTube öffnen
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={async () => {
                      try {
                        // Start Audio Analysis workflow for the video
                        const response = await axios.post(`${apiBase}/api/audio/analyze`, {
                          videoId: video.videoId
                        });
                        
                        if (response.data.success) {
                          console.log('Audio analysis started for:', video.videoId);
                          // Optional: Show success message to user
                          alert(`Audio-Analyse für Video ${video.videoId} gestartet`);
                        } else {
                          console.error('Failed to start audio analysis:', response.data.error);
                          alert('Fehler beim Starten der Audio-Analyse');
                        }
                      } catch (error) {
                        console.error('Error starting audio analysis:', error);
                        alert('Fehler beim Starten der Audio-Analyse');
                      }
                    }}
                  >
                    🎵 Audio analysieren
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDiscovery;