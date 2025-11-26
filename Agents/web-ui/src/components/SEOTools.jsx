import React, { useState } from 'react';
import axios from 'axios';
import './SEOTools.css';

const SEOTools = () => {
  const [activeTab, setActiveTab] = useState('channel');
  const [channelData, setChannelData] = useState({
    channelName: '',
    description: '',
    niche: '',
    targetAudience: ''
  });
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    contentType: 'long-form',
    keywords: ''
  });
  const [linkedinData, setLinkedinData] = useState({
    topic: '',
    tone: 'professional',
    keywords: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChannelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3006/api/seo/channel/description', {
        channelData,
        config: { language: 'de' }
      });

      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate channel SEO');
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const endpoint = videoData.contentType === 'long-form'
        ? 'http://localhost:3006/api/seo/video/long-form'
        : 'http://localhost:3006/api/seo/video/shorts';

      const response = await axios.post(endpoint, {
        videoData,
        config: { language: 'de' }
      });

      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate video SEO');
      setLoading(false);
    }
  };

  const handleLinkedinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3006/api/seo/linkedin/post', {
        postData: linkedinData,
        config: { language: 'de' }
      });

      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate LinkedIn post');
      setLoading(false);
    }
  };

  return (
    <div className="seo-tools">
      <h1>SEO Tools</h1>
      <div className="tabs">
        <button
          className={activeTab === 'channel' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('channel')}
        >
          Channel SEO
        </button>
        <button
          className={activeTab === 'video' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('video')}
        >
          Video SEO
        </button>
        <button
          className={activeTab === 'linkedin' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('linkedin')}
        >
          LinkedIn SEO
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'channel' && (
          <div className="tab-pane">
            <h2>YouTube Channel SEO</h2>
            <form onSubmit={handleChannelSubmit}>
              <div className="form-group">
                <label>Channel Name</label>
                <input
                  type="text"
                  value={channelData.channelName}
                  onChange={(e) => setChannelData({...channelData, channelName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={channelData.description}
                  onChange={(e) => setChannelData({...channelData, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Niche</label>
                <input
                  type="text"
                  value={channelData.niche}
                  onChange={(e) => setChannelData({...channelData, niche: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <input
                  type="text"
                  value={channelData.targetAudience}
                  onChange={(e) => setChannelData({...channelData, targetAudience: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Channel SEO'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="tab-pane">
            <h2>YouTube Video SEO</h2>
            <form onSubmit={handleVideoSubmit}>
              <div className="form-group">
                <label>Video Title</label>
                <input
                  type="text"
                  value={videoData.title}
                  onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={videoData.description}
                  onChange={(e) => setVideoData({...videoData, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content Type</label>
                <select
                  value={videoData.contentType}
                  onChange={(e) => setVideoData({...videoData, contentType: e.target.value})}
                >
                  <option value="long-form">Long-form Video</option>
                  <option value="shorts">YouTube Shorts</option>
                </select>
              </div>
              <div className="form-group">
                <label>Keywords (comma separated)</label>
                <input
                  type="text"
                  value={videoData.keywords}
                  onChange={(e) => setVideoData({...videoData, keywords: e.target.value})}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Video SEO'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'linkedin' && (
          <div className="tab-pane">
            <h2>LinkedIn Post SEO</h2>
            <form onSubmit={handleLinkedinSubmit}>
              <div className="form-group">
                <label>Topic</label>
                <input
                  type="text"
                  value={linkedinData.topic}
                  onChange={(e) => setLinkedinData({...linkedinData, topic: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tone</label>
                <select
                  value={linkedinData.tone}
                  onChange={(e) => setLinkedinData({...linkedinData, tone: e.target.value})}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="thoughtful">Thoughtful</option>
                </select>
              </div>
              <div className="form-group">
                <label>Keywords (comma separated)</label>
                <input
                  type="text"
                  value={linkedinData.keywords}
                  onChange={(e) => setLinkedinData({...linkedinData, keywords: e.target.value})}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Generating...' : 'Generate LinkedIn Post'}
              </button>
            </form>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result">
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SEOTools;