// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faPlus, 
  faList, 
  faChartBar, 
  faSignOutAlt,
  faBars,
  faTimes,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import logo from '../logo.png';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* small fixed hamburger visible ONLY when sidebar is closed */}
      <button
        className={`sidebar-toggle fixed ${isOpen ? 'hidden' : ''}`}
        onClick={toggleSidebar}
        aria-label="Open sidebar"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Backdrop for mobile - visible when open */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <div className="brand-text">
              <h4>Trading Tracker</h4>
              <small className="tagline">Track your trades & analytics</small>
            </div>
          </div>

          {/* close button inside header when sidebar is open */}
          <button className="sidebar-toggle header-toggle" onClick={toggleSidebar} aria-label="Close sidebar">
            <FontAwesomeIcon icon={faTimes} />
          </button>

          {user && (
            <div className="user-info">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              <span>{user.displayName || user.email}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faChartLine} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/add-trade" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faPlus} className="nav-icon" />
            <span className="nav-text">Add Trade</span>
          </NavLink>

          <NavLink 
            to="/all-trades" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faList} className="nav-icon" />
            <span className="nav-text">All Trades</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faChartBar} className="nav-icon" />
            <span className="nav-text">Analytics</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
