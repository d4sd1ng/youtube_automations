import React from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  return (
    <div className="results-display">
      <h2>Results</h2>

      {results.success ? (
        <div className="results-content">
          {results.title && (
            <div className="result-section">
              <h3>Optimized Title</h3>
              <div className="result-box">
                <p>{results.title}</p>
              </div>
            </div>
          )}

          {results.description && (
            <div className="result-section">
              <h3>Video Description</h3>
              <div className="result-box">
                <pre>{results.description}</pre>
              </div>
            </div>
          )}

          {results.keywords && results.keywords.length > 0 && (
            <div className="result-section">
              <h3>Keywords</h3>
              <div className="result-box">
                <ul>
                  {results.keywords.map((keyword, index) => (
                    <li key={index}>{keyword}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.tags && results.tags.length > 0 && (
            <div className="result-section">
              <h3>Tags</h3>
              <div className="result-box">
                <div className="tags-container">
                  {results.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {results.metadata && (
            <div className="result-section">
              <h3>Metadata</h3>
              <div className="result-box metadata">
                <p><strong>Generated at:</strong> {results.metadata.generatedAt}</p>
                <p><strong>Content Type:</strong> {results.metadata.contentType}</p>
                <p><strong>Language:</strong> {results.metadata.language}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="error-result">
          <p>Error: {results.error}</p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;