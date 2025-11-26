import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">AGENTS SaaS</Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link to="/seo-tools" className="nav-link">SEO Tools</Link>
        </li>
        <li className="nav-item">
          <Link to="/billing" className="nav-link">Billing</Link>
        </li>
      </ul>
      <div className="navbar-user">
        {user && (
          <span className="user-info">
            Willkommen, {user.name} ({user.email})
          </span>
        )}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;