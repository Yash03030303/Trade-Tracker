// src/App.js
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import { onAuthStateChange } from './services/authService';
import { addTrade, getTrades, deleteTrade, updateTrade } from './services/tradeService';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';

// Pages
import DashboardPage from './pages/DashboardPage';
import AddTradePage from './pages/AddTradePage';
import AllTradesPage from './pages/AllTradesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import SwingTradePage from './pages/SwingTradePage';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);

      if (currentUser) {
        fetchTrades(currentUser.uid);
      } else {
        setTrades([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTrades = async (userId) => {
    try {
      setLoading(true);
      const fetchedTrades = await getTrades(userId);
      setTrades(fetchedTrades);
      setError('');
    } catch (err) {
      setError('Failed to fetch trades. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = async (tradeData) => {
    try {
      const newTrade = await addTrade(tradeData, user.uid);
      setTrades(prevTrades => [newTrade, ...prevTrades]);
      setSuccess('Trade added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add trade. Please try again.');
      setTimeout(() => setError(''), 3000);
      throw err;
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await deleteTrade(tradeId);
        setTrades(prevTrades => prevTrades.filter(trade => trade.id !== tradeId));
        setSuccess('Trade deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete trade. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleUpdateTrade = async (tradeId, updates) => {
    try {
      await updateTrade(tradeId, updates);
      setTrades(prevTrades =>
        prevTrades.map(trade =>
          trade.id === tradeId ? { ...trade, ...updates } : trade
        )
      );
      setSuccess('Trade updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update trade. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)'
      }}>
        <div className="text-center">
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(99,102,241,0.5)',
            animation: 'pulse 2s infinite'
          }}>📈</div>
          <div className="spinner-border" role="status" style={{ width: '2rem', height: '2rem', borderColor: '#6366f1', borderRightColor: 'transparent' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ color: '#94a3b8', marginTop: '16px', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user}>
                  {/* Alert Messages */}
                  {(error || success) && (
                    <Container style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, maxWidth: '400px' }}>
                      {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                          {error}
                        </Alert>
                      )}

                      {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                          {success}
                        </Alert>
                      )}
                    </Container>
                  )}

                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage trades={trades} loading={loading} />} />
                    <Route path="/add-trade" element={<AddTradePage onAddTrade={handleAddTrade} />} />
                    <Route
                      path="/all-trades"
                      element={
                        <AllTradesPage
                          trades={trades}
                          onDeleteTrade={handleDeleteTrade}
                          onUpdateTrade={handleUpdateTrade}
                          loading={loading}
                        />
                      }
                    />
                    <Route path="/swing-trades" element={<SwingTradePage user={user} />} />
                    <Route path="/analytics" element={<AnalyticsPage trades={trades} />} />
                    <Route path="/ai-analysis" element={<AIAnalysisPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;