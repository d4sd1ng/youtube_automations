import React, { useState, useEffect } from 'react';
import './YouTubeApiStatus.css';

interface YouTubeConfig {
  hasApiKey: boolean;
  apiMode: string;
  isProduction: boolean;
  youtubeApiKey: string | null;
  instructions?: string[];
}

const YouTubeApiStatus: React.FC = () => {
  const [config, setConfig] = useState<YouTubeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchYouTubeConfig();
  }, []);

  const fetchYouTubeConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/config-status');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      } else {
        setError(data.error || 'Failed to fetch YouTube configuration');
      }
    } catch (err) {
      setError('Failed to connect to API');
      console.error('Error fetching YouTube config:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="youtube-api-status">
        <h3>YouTube API Status</h3>
        <p>Loading configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="youtube-api-status">
        <h3>YouTube API Status</h3>
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchYouTubeConfig}>Retry</button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="youtube-api-status">
        <h3>YouTube API Status</h3>
        <p>No configuration data available</p>
      </div>
    );
  }

  return (
    <div className="youtube-api-status">
      <h3>YouTube API Status</h3>
      
      <div className={`status-indicator ${config.hasApiKey ? 'connected' : 'disconnected'}`}>
        <span className={`status-dot ${config.hasApiKey ? 'green' : 'red'}`}></span>
        <span>
          {config.hasApiKey ? 'Connected' : 'Not Configured'}
        </span>
      </div>
      
      <div className="config-details">
        <p><strong>API Mode:</strong> {config.apiMode}</p>
        <p><strong>Production Mode:</strong> {config.isProduction ? 'Enabled' : 'Disabled'}</p>
      </div>
      
      {!config.hasApiKey && config.instructions && (
        <div className="setup-instructions">
          <h4>Setup Instructions:</h4>
          <ol>
            {config.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}
      
      {config.hasApiKey && (
        <div className="api-key-info">
          <p><strong>API Key:</strong> {config.youtubeApiKey}</p>
          <button onClick={fetchYouTubeConfig}>Refresh Status</button>
        </div>
      )}
    </div>
  );
};

export default YouTubeApiStatus;