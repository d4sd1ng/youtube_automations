import React, { useState } from 'react';
import './LinkedInPostForm.css';

const LinkedInPostForm = ({ onGeneratePost, loading }) => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    keyPoints: '',
    callToAction: '',
    industry: '',
    profession: ''
  });

  const [config, setConfig] = useState({
    language: 'de',
    maxDescriptionLength: 3000,
    maxTitleLength: 200
  });

  const handlePostDataChange = (e) => {
    setPostData({
      ...postData,
      [e.target.name]: e.target.value
    });
  };

  const handleConfigChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  const handleGeneratePostClick = () => {
    const processedPostData = {
      ...postData,
      keyPoints: postData.keyPoints.split('\n').filter(point => point.trim() !== '')
    };

    onGeneratePost(processedPostData, config);
  };

  return (
    <div className="linkedin-post-form">
      <div className="form-section">
        <h2>LinkedIn Post Information</h2>
        <div className="form-group">
          <label htmlFor="title">Post Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={postData.title}
            onChange={handlePostDataChange}
            placeholder="Enter your post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Post Content</label>
          <textarea
            id="content"
            name="content"
            value={postData.content}
            onChange={handlePostDataChange}
            placeholder="Enter your post content"
            rows="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="keyPoints">Key Points (one per line)</label>
          <textarea
            id="keyPoints"
            name="keyPoints"
            value={postData.keyPoints}
            onChange={handlePostDataChange}
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
            value={postData.callToAction}
            onChange={handlePostDataChange}
            placeholder="Enter your call to action"
          />
        </div>

        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={postData.industry}
            onChange={handlePostDataChange}
            placeholder="Enter industry (e.g., Technology, Finance)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="profession">Profession</label>
          <input
            type="text"
            id="profession"
            name="profession"
            value={postData.profession}
            onChange={handlePostDataChange}
            placeholder="Enter profession (e.g., Developer, Manager)"
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
            max="5000"
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
            min="20"
            max="300"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleGeneratePostClick}
          disabled={loading}
          className="primary-btn"
        >
          {loading ? 'Generating...' : 'Generate LinkedIn Post SEO'}
        </button>
      </div>
    </div>
  );
};

export default LinkedInPostForm;