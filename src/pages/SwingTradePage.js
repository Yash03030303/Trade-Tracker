import React, { useState, useEffect, useCallback } from 'react';
import { Container, Tab, Tabs, Spinner, Alert } from 'react-bootstrap';
import SwingPlanForm from '../components/swing/SwingPlanForm';
import SwingWatchlist from '../components/swing/SwingWatchlist';
import ActiveSwings from '../components/swing/ActiveSwings';
import {
  addSwingTrade,
  getSwingTrades,
  updateSwingTrade,
  deleteSwingTrade
} from '../services/swingTradeService';

const SwingTradePage = ({ user }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [error, setError] = useState('');

  const fetchTrades = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getSwingTrades(user.uid);
      setTrades(data);
    } catch (err) {
      console.error('Failed to fetch swing trades:', err);
      setError('Failed to load swing trades. Please check Firestore rules for the swingTrades collection.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const handleSavePlan = async (planData) => {
    setSaving(true);
    setError('');
    try {
      const newTrade = await addSwingTrade(planData, user.uid);
      setTrades(prev => [newTrade, ...prev]);
      setActiveTab('watchlist');
    } catch (err) {
      console.error(err);
      setError('Failed to save plan: ' + (err.message || 'Check Firestore security rules for swingTrades collection.'));
      throw err; // Re-throw so SwingPlanForm knows save failed and doesn't reset form
    } finally {
      setSaving(false);
    }
  };

  const handleEnterTrade = async (tradeId, updates) => {
    try {
      await updateSwingTrade(tradeId, updates);
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, ...updates } : t));
    } catch (err) {
      setError('Failed to enter trade: ' + (err.message || 'Unknown error'));
    }
  };

  const handleTargetHit = async (tradeId, targetField) => {
    try {
      const updates = { [targetField]: true, status: 'partial_exit' };
      await updateSwingTrade(tradeId, updates);
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, ...updates } : t));
    } catch (err) {
      setError('Failed to update target: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCloseTrade = async (tradeId) => {
    if (!window.confirm('Close this swing trade?')) return;
    try {
      await updateSwingTrade(tradeId, { status: 'closed' });
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'closed' } : t));
    } catch (err) {
      setError('Failed to close trade: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (tradeId) => {
    if (!window.confirm('Delete this swing trade plan?')) return;
    try {
      await deleteSwingTrade(tradeId);
      setTrades(prev => prev.filter(t => t.id !== tradeId));
    } catch (err) {
      setError('Failed to delete: ' + (err.message || 'Unknown error'));
    }
  };

  const plannedCount = trades.filter(t => t.status === 'planned').length;
  const activeCount = trades.filter(t => t.status === 'active' || t.status === 'partial_exit').length;

  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading swing trades...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h4 className="page-title">📈 Swing Trade Planner</h4>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="swing-tabs mb-4" fill>
        <Tab eventKey="plan" title="📋 Plan Trade">
          <div className="mt-3">
            <SwingPlanForm onSave={handleSavePlan} loading={saving} />
          </div>
        </Tab>
        <Tab eventKey="watchlist" title={<span>🎯 Watchlist {plannedCount > 0 && <span className="swing-tab-count">{plannedCount}</span>}</span>}>
          <div className="mt-3">
            <SwingWatchlist trades={trades} onEnterTrade={handleEnterTrade} onDelete={handleDelete} />
          </div>
        </Tab>
        <Tab eventKey="active" title={<span>🔥 Active Swings {activeCount > 0 && <span className="swing-tab-count swing-tab-count-active">{activeCount}</span>}</span>}>
          <div className="mt-3">
            <ActiveSwings trades={trades} onTargetHit={handleTargetHit} onCloseTrade={handleCloseTrade} />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default SwingTradePage;
