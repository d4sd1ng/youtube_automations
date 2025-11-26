import React, { useState } from 'react';
import './SEOVideoForm.css';

const SEOVideoForm = ({ onGenerateLongForm, onGenerateShorts, loading }) => {
  const [videoData, setVideoData] = useState({
    title: '',
    content: '',
    keyPoints: '',
    callToAction: '',
    tags: ''
  });

  const [config, setConfig] = useState({
    language: 'de',
    maxDescriptionLength: 5000,
    maxTitleLength: 100,
    contentType: 'long-form'
  });

  const handleVideoDataChange = (e) => {
    setVideoData({
      ...videoData,
      [e.target.name]: e.target.value
    });
  };

  const handleConfigChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateLongFormClick = () => {
    const processedVideoData = {
      ...videoData,
      keyPoints: videoData.keyPoints.split('\n').filter(point => point.trim() !== '')
    };

    onGenerateLongForm(processedVideoData, config);
  };

  const handleGenerateShortsClick = () => {
    const processedVideoData = {
      ...videoData,
      keyPoints: videoData.keyPoints.split('\n').filter(point => point.trim() !== '')
    };

    onGenerateShorts(processedVideoData, {...config, contentType: 'shorts'});
  };

  return (
    <div className="seo-video-form">
      <div className="form-section">
        <h2>Video Information</h2>
        <div className="form-group">
          <label htmlFor="title">Video Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={videoData.title}
            onChange={handleVideoDataChange}
            placeholder="Enter your video title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Video Content/Script</label>
          <textarea
            id="content"
            name="content"
            value={videoData.content}
            onChange={handleVideoDataChange}
            placeholder="Enter your video content or script"
            rows="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="keyPoints">Key Points (one per line)</label>
          <textarea
            id="keyPoints"
            name="keyPoints"
            value={videoData.keyPoints}
            onChange={handleVideoDataChange}
            placeholder="Enter key points, one per line"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="callToAction">Call to Action</label>
          <input
            type="text"
            id="callToAction"
            name="callToAction"
            value={videoData.callToAction}
            onChange={handleVideoDataChange}
            placeholder="Enter your call to action"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={videoData.tags}
            onChange={handleVideoDataChange}
            placeholder="Enter tags, separated by commas"
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

        <div className="form-group">
          <label htmlFor="maxTitleLength">Max Title Length</label>
          <input
            type="number"
            id="maxTitleLength"
            name="maxTitleLength"
            value={config.maxTitleLength}
            onChange={handleConfigChange}
            min="10"
            max="100"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleGenerateLongFormClick}
          disabled={loading}
          className="primary-btn"
        >
          {loading ? 'Generating...' : 'Generate Long-Form SEO'}
        </button>

        <button
          onClick={handleGenerateShortsClick}
          disabled={loading}
          className="secondary-btn"
        >
          {loading ? 'Generating...' : 'Generate Shorts SEO'}
        </button>
      </div>
    </div>
  );
};

export default SEOVideoForm;