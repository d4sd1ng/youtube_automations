import React, { useState, useEffect } from 'react';
import './ApiStatusDashboard.css';

interface ApiConfig {
  name: string;
  key: string;
  hasApiKey: boolean;
  apiMode: string;
  isProduction: boolean;
  provider?: string;
  status: 'connected' | 'disconnected' | 'limited' | 'error';
  lastChecked?: string;
  error?: string;
  usage?: {
    requestsToday: number;
    limit?: number;
    resetDate?: string;
  };
}

const ApiStatusDashboard: React.FC = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApiConfigs();
  }, []);

  const fetchApiConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system/api-status');
      const data = await response.json();
      
      if (data.success) {
        setConfigs(data.configs);
      } else {
        setError(data.error || 'Failed to fetch API configurations');
      }
    } catch (err) {
      setError('Failed to connect to API');
      console.error('Error fetching API configs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="api-status-dashboard">
        <h3>API Status Dashboard</h3>
        <p>Loading API configurations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-status-dashboard">
        <h3>API Status Dashboard</h3>
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchApiConfigs}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="api-status-dashboard">
      <h3>🔐 Externe API-Konfigurationen</h3>
      
      <div className="api-grid">
        {configs.map((config) => (
          <div key={config.key} className={`api-card ${config.status}`}>
            <div className="api-header">
              <h4>{config.name}</h4>
              <span className={`status-indicator ${config.status}`}>
                {config.status === 'connected' && '🟢'}
                {config.status === 'disconnected' && '🔴'}
                {config.status === 'limited' && '🟡'}
                {config.status === 'error' && '❌'}
              </span>
            </div>
            
            <div className="api-details">
              <p><strong>Modus:</strong> {config.apiMode}</p>
              <p><strong>Production:</strong> {config.isProduction ? 'Ja' : 'Nein'}</p>
              
              {config.provider && (
                <p><strong>Provider:</strong> {config.provider}</p>
              )}
              
              {config.hasApiKey ? (
                <p className="api-key-info">API Key: ********</p>
              ) : (
                <p className="no-api-key">Kein API Key konfiguriert</p>
              )}
              
              {config.usage && (
                <div className="usage-info">
                  <p><strong>Requests heute:</strong> {config.usage.requestsToday}</p>
                  {config.usage.limit && (
                    <p><strong>Limit:</strong> {config.usage.limit}</p>
                  )}
                </div>
              )}
            </div>
            
            {config.error && (
              <div className="api-error">
                <p>Fehler: {config.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="api-actions">
        <button onClick={fetchApiConfigs}>Status aktualisieren</button>
      </div>
    </div>
  );
};

export default ApiStatusDashboard;