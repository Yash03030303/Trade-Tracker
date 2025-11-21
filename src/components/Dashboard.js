// src/components/Dashboard.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateProfitLoss } from '../services/tradeService';

const Dashboard = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div>
        <h4 className="page-title">📊 Dashboard Overview</h4>
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h4 className="text-muted">Welcome to Your Trading Dashboard</h4>
            <p className="text-muted">Start adding trades to see your analytics here!</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const stats = trades.reduce((acc, trade) => {
    const { netProfit, status } = calculateProfitLoss(trade);
    
    if (status === 'closed') {
      const profit = parseFloat(netProfit);
      
      if (profit > 0) {
        acc.profitTrades++;
        acc.totalProfit += profit;
      } else {
        acc.lossTrades++;
        acc.totalLoss += Math.abs(profit);
      }
      acc.closedTrades++;
    } else {
      acc.holdingTrades++;
    }
    
    if (trade.tradeType === 'intraday') {
      acc.intradayCount++;
    } else {
      acc.deliveryCount++;
    }
    
    return acc;
  }, {
    profitTrades: 0,
    lossTrades: 0,
    totalProfit: 0,
    totalLoss: 0,
    intradayCount: 0,
    deliveryCount: 0,
    closedTrades: 0,
    holdingTrades: 0
  });

  const netProfitLoss = stats.totalProfit - stats.totalLoss;
  const winRate = stats.closedTrades > 0 
    ? ((stats.profitTrades / stats.closedTrades) * 100).toFixed(1) 
    : 0;

  // Pie chart data for trade types
  const tradeTypeData = [
    { name: 'Intraday', value: stats.intradayCount },
    { name: 'Delivery', value: stats.deliveryCount }
  ].filter(item => item.value > 0);

  // Pie chart data for profit/loss
  const profitLossData = [
    { name: 'Profit Trades', value: stats.profitTrades },
    { name: 'Loss Trades', value: stats.lossTrades }
  ].filter(item => item.value > 0);

  // Bar chart data - last 5 closed trades
  const closedTrades = trades.filter(t => calculateProfitLoss(t).status === 'closed');
  const recentTradesData = closedTrades.slice(0, 5).reverse().map((trade) => {
    const { netProfit } = calculateProfitLoss(trade);
    return {
      name: trade.stockName,
      profit: parseFloat(netProfit)
    };
  });

  const COLORS_TYPE = ['#ffc107', '#17a2b8'];
  const COLORS_PL = ['#28a745', '#dc3545'];

  return (
    <div>
      <h4 className="page-title">📊 Dashboard Overview</h4>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Total Trades</h6>
              <h2 className="mb-0">{trades.length}</h2>
              <small className="text-muted">
                {stats.closedTrades} closed, {stats.holdingTrades} holding
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Net P/L</h6>
              <h2 className={`mb-0 ${netProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{netProfitLoss.toFixed(2)}
              </h2>
              <small className="text-muted">From closed trades</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Win Rate</h6>
              <h2 className="text-primary mb-0">{winRate}%</h2>
              <small className="text-muted">
                {stats.profitTrades} wins / {stats.lossTrades} losses
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <h6 className="text-muted mb-3">Avg P/L</h6>
              <h2 className="mb-0">
                ₹{stats.closedTrades > 0 ? (netProfitLoss / stats.closedTrades).toFixed(2) : '0.00'}
              </h2>
              <small className="text-muted">Per closed trade</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>Trade Types Distribution</Card.Header>
            <Card.Body>
              {tradeTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tradeTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tradeTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">No data</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>Profit vs Loss Trades</Card.Header>
            <Card.Body>
              {profitLossData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={profitLossData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {profitLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PL[index % COLORS_PL.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">No closed trades</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>Recent 5 Closed Trades</Card.Header>
            <Card.Body>
              {recentTradesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={recentTradesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#8884d8">
                      {recentTradesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#28a745' : '#dc3545'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">No closed trades yet</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;