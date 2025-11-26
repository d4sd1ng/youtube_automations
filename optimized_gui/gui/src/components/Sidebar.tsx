import React from 'react';
import '../styles/sidebar.css';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen }) => {
  const navigationGroups = [
    {
      title: 'Monitoring & Control',
      icon: '📊',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🎯' },
        { id: 'tokens', label: 'Token Monitor', icon: '💰' },
      ],
    },
    {
      title: 'Content Pipeline',
      icon: '🔄',
      items: [
        { id: 'scraping', label: 'Web Scraping', icon: '🕷️' },
        { id: 'script', label: 'Script Generation', icon: '✍️' },
        { id: 'video', label: 'Video Production', icon: '🎬' },
      ],
    },
    {
      title: 'Creative Agents',
      icon: '🎨',
      items: [
        { id: 'seo', label: 'SEO Optimization', icon: '🔍' },
        { id: 'avatar', label: 'Avatar Generation', icon: '👤' },
        { id: 'bookwriter', label: 'Book Writer', icon: '📖' },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        {navigationGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="group-header">
              <span className="group-icon">{group.icon}</span>
              <h3 className="group-title">{group.title}</h3>
            </div>
            <nav className="group-items">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                >
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
