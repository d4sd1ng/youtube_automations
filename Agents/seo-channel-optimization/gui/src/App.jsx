import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SEOChannelForm from './components/SEOChannelForm';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateDescription = async (channelData, config) => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3003/generate-description', {
        channelData,
        config
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate channel SEO');
      setLoading(false);
    }
  };

  const handleGenerateKeywords = async (channelData, config) => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3003/generate-keywords', {
        channelData,
        config
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate channel keywords');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SEO Channel Optimization</h1>
        <p>Optimize your YouTube channel description and keywords</p>
      </header>

      <main className="app-main">
        <SEOChannelForm
          onGenerateDescription={handleGenerateDescription}
          onGenerateKeywords={handleGenerateKeywords}
          loading={loading}
        />

        {error && <div className="error-message">{error}</div>}

        {results && <ResultsDisplay results={results} />}
      </main>
    </div>
  );
}

export default App;