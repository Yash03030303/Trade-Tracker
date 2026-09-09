// src/components/Dashboard.js
import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { calculateProfitLoss } from '../services/tradeService';

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface2)', border: '1px solid var(--border-color)',
      borderRadius: '10px', padding: '10px 14px',
      color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
      boxShadow: 'var(--shadow-md)',
    }}>
      {label && <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.value >= 0 ? 'var(--profit)' : 'var(--loss)', fontWeight: 700 }}>
          {typeof p.value === 'number' ? `₹${p.value.toFixed(2)}` : `${p.name}: ${p.value}`}
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface2)', border: '1px solid var(--border-color)',
      borderRadius: '10px', padding: '10px 14px',
      color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
    }}>
      <strong>{payload[0].name}</strong>: {payload[0].value}
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, sub, valueColor, delay }) => (
  <div className="stat-card" style={{ animationDelay: delay, animation: 'fadeInUp 0.5s ease forwards', opacity: 0 }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color: valueColor || 'var(--text-primary)' }}>{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const Dashboard = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div>
        <h4 className="page-title">📊 Dashboard</h4>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderRadius: '20px', padding: '60px 40px',
          textAlign: 'center', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>
            Welcome to Trading Tracker
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Add your first trade to start seeing your analytics here!
          </p>
        </div>
      </div>
    );
  }

  /* ─── Stats ─── */
  const stats = trades.reduce((acc, trade) => {
    const { netProfit, status } = calculateProfitLoss(trade);
    if (status === 'closed') {
      const profit = parseFloat(netProfit);
      if (profit > 0) { acc.profitTrades++; acc.totalProfit += profit; }
      else            { acc.lossTrades++;   acc.totalLoss += Math.abs(profit); }
      acc.closedTrades++;
    } else {
      acc.holdingTrades++;
    }
    if (trade.tradeType === 'intraday') acc.intradayCount++;
    else                                acc.deliveryCount++;
    return acc;
  }, { profitTrades: 0, lossTrades: 0, totalProfit: 0, totalLoss: 0, intradayCount: 0, deliveryCount: 0, closedTrades: 0, holdingTrades: 0 });

  const netPL = stats.totalProfit - stats.totalLoss;
  const winRate = stats.closedTrades > 0
    ? ((stats.profitTrades / stats.closedTrades) * 100).toFixed(1)
    : 0;
  const avgPL = stats.closedTrades > 0 ? (netPL / stats.closedTrades).toFixed(2) : '0.00';

  /* ─── Chart data ─── */
  const tradeTypeData = [
    { name: 'Intraday', value: stats.intradayCount },
    { name: 'Delivery', value: stats.deliveryCount },
  ].filter(d => d.value > 0);

  const profitLossData = [
    { name: 'Profit', value: stats.profitTrades },
    { name: 'Loss',   value: stats.lossTrades },
  ].filter(d => d.value > 0);

  const closedTrades = trades.filter(t => calculateProfitLoss(t).status === 'closed');
  const recentTradesData = closedTrades.slice(0, 8).reverse().map(t => ({
    name: t.stockName,
    profit: parseFloat(calculateProfitLoss(t).netProfit),
  }));

  const TYPE_COLORS  = ['#f59e0b', '#06b6d4'];
  const PL_COLORS    = ['#10b981', '#ef4444'];

  const chartProps = {
    style: { fontFamily: 'Inter, sans-serif' },
  };

  const axisStyle = { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter, sans-serif' };
  const gridStyle = { stroke: 'var(--border-color)', strokeDasharray: '4 4' };

  return (
    <div>
      <h4 className="page-title">📊 Dashboard</h4>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <StatCard
          icon="📋" label="Total Trades"
          value={trades.length}
          sub={`${stats.closedTrades} closed · ${stats.holdingTrades} holding`}
          delay="0s"
        />
        <StatCard
          icon={netPL >= 0 ? '💰' : '📉'} label="Net P/L"
          value={`${netPL >= 0 ? '+' : ''}₹${netPL.toFixed(2)}`}
          valueColor={netPL >= 0 ? 'var(--profit)' : 'var(--loss)'}
          sub="From closed trades"
          delay="0.08s"
        />
        <StatCard
          icon="🎯" label="Win Rate"
          value={`${winRate}%`}
          valueColor="var(--accent)"
          sub={`${stats.profitTrades}W / ${stats.lossTrades}L`}
          delay="0.16s"
        />
        <StatCard
          icon="📈" label="Avg P/L"
          value={`₹${avgPL}`}
          sub="Per closed trade"
          delay="0.24s"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        {/* Trade Type Distribution */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>
            Trade Types
          </div>
          {tradeTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} {...chartProps}>
              <PieChart>
                <Pie data={tradeTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  labelLine={false} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {tradeTypeData.map((_, i) => (
                    <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No data yet
            </div>
          )}
        </div>

        {/* Profit vs Loss */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>
            Profit vs Loss Trades
          </div>
          {profitLossData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} {...chartProps}>
              <PieChart>
                <Pie data={profitLossData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  labelLine={false} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {profitLossData.map((_, i) => (
                    <Cell key={i} fill={PL_COLORS[i % PL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No closed trades
            </div>
          )}
        </div>

        {/* Recent Trades Bar */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>
            Recent Closed Trades
          </div>
          {recentTradesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} {...chartProps}>
              <BarChart data={recentTradesData} barSize={20}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {recentTradesData.map((entry, i) => (
                    <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No closed trades yet
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;