import React, { useState, useEffect } from 'react';
import './App.css';
import AgentDashboard from './AgentDashboard';
import WebScraping from './WebScraping';
import ScriptGeneration from './ScriptGeneration';
import VideoProduction from './VideoProduction';
import TokenMonitor from './TokenMonitor';
import SEOOptimization from './SEOOptimization';
import AvatarGeneration from './AvatarGeneration';
import BookWriter from './BookWriter'; // Neue Importzeile

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AgentDashboard />;
      case 'scraping':
        return <WebScraping />;
      case 'script':
        return <ScriptGeneration />;
      case 'video':
        return <VideoProduction />;
      case 'tokens':
        return <TokenMonitor />;
      case 'seo':
        return <SEOOptimization />;
      case 'avatar':
        return <AvatarGeneration />;
      case 'bookwriter':  // Neue Case-Bedingung
        return <BookWriter />;
      default:
        return <AgentDashboard />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎬 YouTube Automations - Agent Controller</h1>
        <nav className="main-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'scraping' ? 'active' : ''}
            onClick={() => setActiveTab('scraping')}
          >
            Web Scraping
          </button>
          <button
            className={activeTab === 'script' ? 'active' : ''}
            onClick={() => setActiveTab('script')}
          >
            Script Generation
          </button>
          <button
            className={activeTab === 'video' ? 'active' : ''}
            onClick={() => setActiveTab('video')}
          >
            Video Production
          </button>
          <button
            className={activeTab === 'tokens' ? 'active' : ''}
            onClick={() => setActiveTab('tokens')}
          >
            Token Monitor
          </button>
          <button
            className={activeTab === 'seo' ? 'active' : ''}
            onClick={() => setActiveTab('seo')}
          >
            SEO Optimization
          </button>
          <button
            className={activeTab === 'avatar' ? 'active' : ''}
            onClick={() => setActiveTab('avatar')}
          >
            Avatar Generation
          </button>
          <button
            className={activeTab === 'bookwriter' ? 'active' : ''}  // Neue Navigationsschaltfläche
            onClick={() => setActiveTab('bookwriter')}
          >
            Book Writer
          </button>
        </nav>
      </header>
      <main className="app-main">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;
