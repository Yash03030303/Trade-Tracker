// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ user, children }) => {
  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main-content">
        {/* If app passed children (your alert + inner <Routes>), render them.
            Otherwise use Outlet for normal nested route rendering. */}
        {children ? children : <Outlet />}
      </div>
    </div>
  );
};

export default Layout;
