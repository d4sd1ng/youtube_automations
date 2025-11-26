import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import LinkedInPostForm from './components/LinkedInPostForm';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePost = async (postData, config) => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:3005/generate-post', {
        postData,
        config
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate LinkedIn post SEO');
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SEO LinkedIn Optimization</h1>
        <p>Optimize your LinkedIn post descriptions, titles, and tags</p>
      </header>

      <main className="app-main">
        <LinkedInPostForm
          onGeneratePost={handleGeneratePost}
          loading={loading}
        />

        {error && <div className="error-message">{error}</div>}

        {results && <ResultsDisplay results={results} />}
      </main>
    </div>
  );
}

export default App;