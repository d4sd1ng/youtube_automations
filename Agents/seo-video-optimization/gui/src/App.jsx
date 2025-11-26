import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SEOVideoForm from './components/SEOVideoForm';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateLongFormDescription = async (videoData, config) => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3004/generate-long-form', {
        videoData,
        config
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate long-form video SEO');
      setLoading(false);
    }
  };

  const handleGenerateShortsDescription = async (videoData, config) => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3004/generate-shorts', {
        videoData,
        config
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate shorts video SEO');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SEO Video Optimization</h1>
        <p>Optimize your YouTube video descriptions, titles, and tags</p>
      </header>

      <main className="app-main">
        <SEOVideoForm
          onGenerateLongForm={handleGenerateLongFormDescription}
          onGenerateShorts={handleGenerateShortsDescription}
          loading={loading}
        />

        {error && <div className="error-message">{error}</div>}

        {results && <ResultsDisplay results={results} />}
      </main>
    </div>
  );
}

export default App;