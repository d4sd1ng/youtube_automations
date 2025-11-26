import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch actual usage data from the billing service
      // For now, we'll simulate the data
      const simulatedData = {
        current: 450,
        limit: 1000,
        remaining: 550,
        resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week from now
      };

      setUsageData(simulatedData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch usage data');
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!usageData) return 0;
    return (usageData.current / usageData.limit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage > 90) return 'danger';
    if (percentage > 75) return 'warning';
    return 'success';
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="user-info">
          <h2>Welcome, {user?.name}</h2>
          <p>Email: {user?.email}</p>
          <p>Plan: {user?.subscription?.plan || 'Free'}</p>
        </div>

        <div className="usage-card">
          <h3>API Usage</h3>
          {loading ? (
            <p>Loading usage data...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : usageData ? (
            <div className="usage-details">
              <div className="usage-bar-container">
                <div className={`usage-bar ${getUsageColor()}`} style={{ width: `${getUsagePercentage()}%` }}></div>
              </div>
              <div className="usage-stats">
                <span>{usageData.current} / {usageData.limit} requests</span>
                <span>{usageData.remaining} remaining</span>
              </div>
              <p>Resets on: {usageData.resetDate}</p>
            </div>
          ) : (
            <p>No usage data available</p>
          )}
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card">
              <h4>SEO Channel Optimization</h4>
              <p>Optimize your YouTube channel description and keywords</p>
              <button className="action-btn">Start</button>
            </div>
            <div className="action-card">
              <h4>SEO Video Optimization</h4>
              <p>Create SEO-friendly video descriptions and tags</p>
              <button className="action-btn">Start</button>
            </div>
            <div className="action-card">
              <h4>LinkedIn Post Optimization</h4>
              <p>Generate engaging LinkedIn post content</p>
              <button className="action-btn">Start</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;