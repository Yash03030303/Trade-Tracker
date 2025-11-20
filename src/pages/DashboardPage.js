// src/pages/DashboardPage.js
import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage = ({ trades, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <Dashboard trades={trades} />;
};

export default DashboardPage;