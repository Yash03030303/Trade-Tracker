// src/pages/AddTradePage.js
import React from 'react';
import TradeForm from '../components/TradeForm';

const AddTradePage = ({ onAddTrade }) => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={pageHeaderStyle}>
        <div style={headerIconStyle}>➕</div>
        <div>
          <h2 style={pageTitleStyle}>Add New Trade</h2>
          <p style={pageSubStyle}>Record your trade details, evaluate your mindset, and track every decision.</p>
        </div>
      </div>

      {/* ── Quick Tips Banner ── */}
      <div style={tipsRowStyle}>
        {TIPS.map(({ icon, text }) => (
          <div key={text} style={tipCardStyle}>
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            <span style={tipTextStyle}>{text}</span>
          </div>
        ))}
      </div>

      {/* ── Trade Form ── */}
      <TradeForm onAddTrade={onAddTrade} />

    </div>
  );
};

const TIPS = [
  { icon: '📌', text: 'Always log trades the same day' },
  { icon: '🧠', text: 'Honest mistake analysis improves your edge' },
  { icon: '📊', text: 'Brokerage + taxes affect your real P&L' },
  { icon: '🎯', text: 'Delivery trades can leave sell date blank' },
];

/* ─── Styles ─── */
const pageHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  marginBottom: '24px',
  padding: '28px 32px',
  background: 'var(--accent-grad)',
  borderRadius: '20px',
  boxShadow: '0 8px 30px var(--accent-glow)',
};

const headerIconStyle = {
  width: '58px',
  height: '58px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.8rem',
  flexShrink: 0,
  border: '1px solid rgba(255,255,255,0.25)',
};

const pageTitleStyle = {
  margin: 0,
  fontSize: '1.6rem',
  fontWeight: 800,
  color: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '-0.5px',
};

const pageSubStyle = {
  margin: '4px 0 0',
  fontSize: '0.88rem',
  color: 'rgba(255,255,255,0.78)',
  fontFamily: 'Inter, sans-serif',
};

const tipsRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
  marginBottom: '24px',
};

const tipCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  transition: 'border-color 0.2s',
};

const tipTextStyle = {
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  fontFamily: 'Inter, sans-serif',
  lineHeight: 1.4,
};

export default AddTradePage;