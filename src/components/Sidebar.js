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
  faRobot,
  faArrowTrendUp,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Get initials for avatar
  const getInitials = () => {
    const name = user?.displayName || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const navItems = [
    { to: '/dashboard',    icon: faChartLine,    label: 'Dashboard' },
    { to: '/add-trade',    icon: faPlus,         label: 'Add Trade' },
    { to: '/all-trades',   icon: faList,         label: 'All Trades' },
    { to: '/swing-trades', icon: faArrowTrendUp, label: 'Swing Trades' },
    { to: '/analytics',    icon: faChartBar,     label: 'Analytics' },
    { to: '/ai-analysis',  icon: faRobot,        label: 'AI Analysis' },
  ];

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon-wrap">📈</div>
            <h4 className="logo-text">Trading Tracker</h4>
          </div>
          {user && (
            <div className="user-info">
              <div className="user-avatar">{getInitials()}</div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || user.email}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <FontAwesomeIcon icon={icon} className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme Toggle */}
          <button
            className={`theme-toggle-btn ${theme === 'light' ? 'light-active' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className="theme-toggle-icon">
              <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} />
            </span>
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <div className="theme-toggle-track">
              <div className="theme-toggle-thumb" />
            </div>
          </button>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;