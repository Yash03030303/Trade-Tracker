// src/pages/DashboardPage.js
import React from 'react';
import Dashboard from '../components/Dashboard';
import { Container } from 'react-bootstrap';

const DashboardPage = ({ trades, loading }) => {
  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Dashboard trades={trades} />
    </Container>
  );
};

export default DashboardPage;