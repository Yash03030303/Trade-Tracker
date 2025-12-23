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
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo-icon">📈</span>
            <h4 className="logo-text">Trading Tracker</h4>
          </div>
          {user && (
            <div className="user-info">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              <span>{user.displayName || user.email}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faChartLine} className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/add-trade" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faPlus} className="nav-icon" />
            <span>Add Trade</span>
          </NavLink>

          <NavLink 
            to="/all-trades" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faList} className="nav-icon" />
            <span>All Trades</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <FontAwesomeIcon icon={faChartBar} className="nav-icon" />
            <span>Analytics</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
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