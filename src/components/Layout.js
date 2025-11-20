// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ user }) => {
  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;