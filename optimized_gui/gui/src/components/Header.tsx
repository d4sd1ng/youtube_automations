import React from 'react';
import '../styles/header.css';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <h1 className="app-title">🎬 GNTN Orchestrator</h1>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <button className="header-icon" aria-label="Notifications">
            🔔
          </button>
          <button className="header-icon" aria-label="Settings">
            ⚙️
          </button>
          <button className="header-icon profile" aria-label="Profile">
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
