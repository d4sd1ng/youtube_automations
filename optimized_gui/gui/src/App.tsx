import React, { useState } from 'react';
import './App.css';
import './styles/app.css';
import './styles/header.css';
import './styles/sidebar.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AgentDashboard from './AgentDashboard';
import WebScraping from './WebScraping';
import ScriptGeneration from './ScriptGeneration';
import VideoProduction from './VideoProduction';
import TokenMonitor from './TokenMonitor';
import SEOOptimization from './SEOOptimization';
import AvatarGeneration from './AvatarGeneration';
import BookWriter from './BookWriter';

type TabType = 'dashboard' | 'scraping' | 'script' | 'video' | 'tokens' | 'seo' | 'avatar' | 'bookwriter';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="app-container">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="app-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} />
        <main className={`app-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default App;
