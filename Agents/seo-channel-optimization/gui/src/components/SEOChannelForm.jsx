import React, { useState } from 'react';
import './SEOChannelForm.css';

const SEOChannelForm = ({ onGenerateDescription, onGenerateKeywords, loading }) => {
  const [channelData, setChannelData] = useState({
    channelName: '',
    description: '',
    niche: '',
    targetAudience: ''
  });

  const [config, setConfig] = useState({
    language: 'de',
    maxDescriptionLength: 5000,
    maxTitleLength: 100,
    maxTags: 30
  });

  const handleChannelDataChange = (e) => {
    setChannelData({
      ...channelData,
      [e.target.name]: e.target.value
    });
  };

  const handleConfigChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateDescriptionClick = () => {
    onGenerateDescription(channelData, config);
  };

  const handleGenerateKeywordsClick = () => {
    onGenerateKeywords(channelData, config);
  };

  return (
    <div className="seo-channel-form">
      <div className="form-section">
        <h2>Channel Information</h2>
        <div className="form-group">
          <label htmlFor="channelName">Channel Name</label>
          <input
            type="text"
            id="channelName"
            name="channelName"
            value={channelData.channelName}
            onChange={handleChannelDataChange}
            placeholder="Enter your channel name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Channel Description</label>
          <textarea
            id="description"
            name="description"
            value={channelData.description}
            onChange={handleChannelDataChange}
            placeholder="Enter your channel description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="niche">Niche/Topic</label>
          <input
            type="text"
            id="niche"
            name="niche"
            value={channelData.niche}
            onChange={handleChannelDataChange}
            placeholder="Enter your channel niche"
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetAudience">Target Audience</label>
          <input
            type="text"
            id="targetAudience"
            name="targetAudience"
            value={channelData.targetAudience}
            onChange={handleChannelDataChange}
            placeholder="Enter your target audience"
          />
        </div>
      </div>

      <div className="form-section">
        <h2>Configuration</h2>
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            name="language"
            value={config.language}
            onChange={handleConfigChange}
          >
            <option value="de">German</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="maxDescriptionLength">Max Description Length</label>
          <input
            type="number"
            id="maxDescriptionLength"
            name="maxDescriptionLength"
            value={config.maxDescriptionLength}
            onChange={handleConfigChange}
            min="100"
            max="10000"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleGenerateDescriptionClick}
          disabled={loading}
          className="primary-btn"
        >
          {loading ? 'Generating...' : 'Generate Description'}
        </button>

        <button
          onClick={handleGenerateKeywordsClick}
          disabled={loading}
          className="secondary-btn"
        >
          {loading ? 'Generating...' : 'Generate Keywords'}
        </button>
      </div>
    </div>
  );
};

export default SEOChannelForm;