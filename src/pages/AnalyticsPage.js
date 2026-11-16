// src/pages/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Container, Form, Badge } from 'react-bootstrap';
import { calculateProfitLoss } from '../services/tradeService';

const AnalyticsPage = ({ trades }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getItemsPerPage = () => (typeof window !== 'undefined' && window.innerWidth < 768) ? 2 : 4;
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);
  const [monthPnlPage, setMonthPnlPage] = useState(0); // 0 = most recent

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
      setMonthPnlPage(0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (trades.length === 0) {
    return (
      <Container>
        <h4 className="page-title">📈 Analytics</h4>
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h5 className="text-muted">No data available</h5>
            <p className="text-muted">Add some trades to see detailed analytics</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Stock-wise analysis
  const stockWiseData = {};

  trades.forEach(trade => {
    const { netProfit, status } = calculateProfitLoss(trade);

    if (!stockWiseData[trade.stockName]) {
      stockWiseData[trade.stockName] = {
        totalTrades: 0,
        closedTrades: 0,
        holdingTrades: 0,
        totalProfit: 0,
        totalQuantity: 0
      };
    }

    stockWiseData[trade.stockName].totalTrades++;
    stockWiseData[trade.stockName].totalQuantity += trade.quantity;

    if (status === 'closed') {
      stockWiseData[trade.stockName].closedTrades++;
      stockWiseData[trade.stockName].totalProfit += parseFloat(netProfit);
    } else {
      stockWiseData[trade.stockName].holdingTrades++;
    }
  });

  const stockWiseArray = Object.entries(stockWiseData).map(([stock, data]) => ({
    stock,
    ...data
  })).sort((a, b) => b.totalProfit - a.totalProfit);

  // Day-wise success percentage
  const getDayWiseAnalysis = (dateString) => {
    const selectedDayDate = new Date(dateString);
    const dayName = selectedDayDate.toLocaleDateString('en-US', { weekday: 'long' });

    const dayTrades = trades.filter(trade => {
      if (!trade.createdAt) return false;
      const tradeDate = trade.createdAt.toDate();
      return tradeDate.toLocaleDateString() === selectedDayDate.toLocaleDateString();
    });

    if (dayTrades.length === 0) {
      return {
        totalTrades: 0,
        successfulTrades: 0,
        failedTrades: 0,
        successPercentage: 0,
        dayName,
        selectedDate: dateString
      };
    }

    let successfulCount = 0;
    let totalClosedTrades = 0;
    let totalProfit = 0;

    dayTrades.forEach(trade => {
      const { netProfit, status } = calculateProfitLoss(trade);

      if (status === 'closed') {
        totalClosedTrades++;
        if (parseFloat(netProfit) > 0) {
          successfulCount++;
        }
        totalProfit += parseFloat(netProfit);
      }
    });

    const successPercentage = totalClosedTrades > 0
      ? ((successfulCount / totalClosedTrades) * 100).toFixed(2)
      : 0;

    return {
      totalTrades: dayTrades.length,
      closedTrades: totalClosedTrades,
      successfulTrades: successfulCount,
      failedTrades: totalClosedTrades - successfulCount,
      successPercentage,
      totalProfit: totalProfit.toFixed(2),
      dayName,
      selectedDate: dateString
    };
  };

  const dayWiseData = getDayWiseAnalysis(selectedDate);

  // Monthly analysis
  const monthlyData = {};

  trades.forEach(trade => {
    const { netProfit, status } = calculateProfitLoss(trade);

    if (status === 'closed' && trade.createdAt) {
      const date = trade.createdAt.toDate();
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          trades: 0,
          profit: 0
        };
      }

      monthlyData[monthKey].trades++;
      monthlyData[monthKey].profit += parseFloat(netProfit);
    }
  });

  // Build complete month list from first trade → current month (fill gaps with 0)
  const buildFullMonthList = () => {
    let earliest = null;
    trades.forEach(trade => {
      if (trade.createdAt) {
        const d = typeof trade.createdAt.toDate === 'function'
          ? trade.createdAt.toDate()
          : new Date(trade.createdAt);
        if (!earliest || d < earliest) earliest = d;
      }
    });
    if (!earliest) return [];

    const now = new Date();
    const result = [];
    const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

    while (cursor <= endDate) {
      const key = `${cursor.toLocaleString('default', { month: 'short' })} ${cursor.getFullYear()}`;
      result.push({
        key,
        profit: monthlyData[key]?.profit ?? 0,
        trades: monthlyData[key]?.trades ?? 0
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return result;
  };

  const allMonthsList = buildFullMonthList();

  // ===== MISTAKES ANALYSIS =====
  const mistakeFrequency = {};
  // eslint-disable-next-line no-unused-vars
  let totalMistakes = 0;

  trades.forEach(trade => {
    if (trade.mistakesMade && Array.isArray(trade.mistakesMade)) {
      trade.mistakesMade.forEach(mistake => {
        mistakeFrequency[mistake] = (mistakeFrequency[mistake] || 0) + 1;
        totalMistakes++;
      });
    }
  });

  // Sort by frequency (descending)
  const mistakesSorted = Object.entries(mistakeFrequency)
    .sort((a, b) => b[1] - a[1]);

  // Mistakes on losing trades vs winning trades
  let mistakesOnLoss = {};
  let mistakesOnWin = {};

  trades.forEach(trade => {
    const { netProfit, status } = calculateProfitLoss(trade);
    if (status !== 'closed' || !trade.mistakesMade) return;

    const isWin = parseFloat(netProfit) > 0;
    const target = isWin ? mistakesOnWin : mistakesOnLoss;

    trade.mistakesMade.forEach(m => {
      target[m] = (target[m] || 0) + 1;
    });
  });

  // ===== LESSONS LEARNED =====
  const lessonsData = trades
    .filter(t => t.lessonsLearned && t.lessonsLearned.trim())
    .map(t => ({
      stockName: t.stockName,
      lesson: t.lessonsLearned,
      date: t.createdAt
        ? (typeof t.createdAt.toDate === 'function'
          ? t.createdAt.toDate().toLocaleDateString('en-IN')
          : new Date(t.createdAt).toLocaleDateString('en-IN'))
        : 'N/A',
      netProfit: calculateProfitLoss(t).netProfit
    }));

  return (
    <Container>
      <h4 className="page-title">📈 Detailed Analytics</h4>

      {/* Day-wise Trade Success Percentage */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">📅 Day-wise Trade Success Percentage</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label><strong>Select Date:</strong></Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ maxWidth: '300px' }}
                />
              </Form.Group>

              {dayWiseData.totalTrades === 0 ? (
                <p className="text-muted">No trades found for {dayWiseData.dayName} ({dayWiseData.selectedDate})</p>
              ) : (
                <Row>
                  <Col md={6} className="mb-3">
                    <div className="border rounded p-3">
                      <h6 className="text-muted mb-2">Total Trades</h6>
                      <h3 className="text-primary mb-0">{dayWiseData.totalTrades}</h3>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="border rounded p-3">
                      <h6 className="text-muted mb-2">Success Percentage</h6>
                      <h3 className={dayWiseData.successPercentage >= 50 ? 'text-success' : 'text-danger'}>
                        {dayWiseData.successPercentage}%
                      </h3>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="border rounded p-3 bg-light">
                      <h6 className="text-muted mb-2">Successful Trades</h6>
                      <h4 className="text-success mb-0">{dayWiseData.successfulTrades}</h4>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="border rounded p-3 bg-light">
                      <h6 className="text-muted mb-2">Failed Trades</h6>
                      <h4 className="text-danger mb-0">{dayWiseData.failedTrades}</h4>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="border rounded p-3 bg-light">
                      <h6 className="text-muted mb-2">Day Total P/L</h6>
                      <h4 className={parseFloat(dayWiseData.totalProfit) >= 0 ? 'text-success' : 'text-danger'}>
                        ₹{dayWiseData.totalProfit}
                      </h4>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== MISTAKES ANALYSIS ===== */}
      {mistakesSorted.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm mistake-analytics-card">
              <Card.Header style={{ background: 'var(--accent-grad)', color: 'white' }}>
                <h5 className="mb-0">⚠️ Mistakes Analysis</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {/* Mistake Frequency Bar Chart */}
                  <Col md={7} className="mb-3">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Mistake Frequency
                      <span className="text-muted ms-2" style={{ fontSize: '0.85rem', fontWeight: 400 }}>
                        (across {trades.length} trades)
                      </span>
                    </h6>
                    {mistakesSorted.map(([mistake, count]) => {
                      const percentage = ((count / trades.length) * 100).toFixed(1);
                      return (
                        <div key={mistake} className="mistake-stat-item">
                          <span className="mistake-label">{mistake}</span>
                          <div className="mistake-bar-container flex-grow-1">
                            <div className="mistake-bar" style={{ width: `${percentage}%` }}>
                              <span>{count}</span>
                            </div>
                          </div>
                          <span className="mistake-count-badge">{percentage}%</span>
                        </div>
                      );
                    })}
                  </Col>

                  {/* Mistakes on Win vs Loss */}
                  <Col md={5} className="mb-3">
                    <h6 className="mb-3" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Win vs Loss Breakdown</h6>
                    <Table size="sm" hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Mistake</th>
                          <th className="text-center text-success">Wins</th>
                          <th className="text-center text-danger">Losses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mistakesSorted.map(([mistake]) => (
                          <tr key={mistake}>
                            <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{mistake}</td>
                            <td className="text-center">
                              <Badge bg="success" pill>{mistakesOnWin[mistake] || 0}</Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="danger" pill>{mistakesOnLoss[mistake] || 0}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* Top Mistake Highlight */}
                    {mistakesSorted.length > 0 && (
                      <div className="mt-3 p-3" style={{
                        background: 'linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)',
                        borderRadius: '10px',
                        border: '1px solid #fee'
                      }}>
                        <small className="text-muted">🔥 Most Common Mistake</small>
                        <h5 className="mb-0 mt-1" style={{ color: '#dc3545' }}>
                          {mistakesSorted[0][0]}
                          <Badge bg="danger" className="ms-2">{mistakesSorted[0][1]} times</Badge>
                        </h5>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* ===== MONTHLY P&L ===== */}
      {allMonthsList.length > 0 && (() => {
        const now = new Date();
        const currentMonthKey = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
        const totalPages = Math.ceil(allMonthsList.length / itemsPerPage);
        // page 0 = most recent; reverse to get recent-first, slice, then re-reverse to show chronologically
        const currentPageMonths = [...allMonthsList]
          .reverse()
          .slice(monthPnlPage * itemsPerPage, (monthPnlPage + 1) * itemsPerPage)
          .reverse();

        return (
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Header style={{ background: 'linear-gradient(135deg, #0f2027 0%, #1a3a2a 50%, #0f2027 100%)', color: 'white' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">📅 Monthly P&amp;L</h5>
                    {totalPages > 1 && (
                      <small style={{ opacity: 0.7, fontSize: '0.8rem' }}>
                        {monthPnlPage === 0 ? 'Latest' : `${monthPnlPage + 1} / ${totalPages}`}
                      </small>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div
                    className="monthly-pnl-grid"
                    style={{ gridTemplateColumns: `repeat(${itemsPerPage}, 1fr)` }}
                  >
                    {currentPageMonths.map(({ key, profit }) => {
                      const isZero = profit === 0;
                      const isProfit = profit > 0;
                      const isCurrentMonth = key === currentMonthKey;
                      return (
                        <div
                          key={key}
                          className={`monthly-pnl-box${isCurrentMonth ? ' monthly-pnl-box--active' : ''}`}
                        >
                          <div className="monthly-pnl-month">{key.toUpperCase()}</div>
                          <div className={`monthly-pnl-value ${isZero ? 'monthly-pnl-zero' : isProfit ? 'monthly-pnl-profit' : 'monthly-pnl-loss'}`}>
                            {isZero
                              ? '₹0'
                              : `${isProfit ? '+' : '−'}₹${Math.abs(profit).toFixed(0)}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setMonthPnlPage(p => Math.min(p + 1, totalPages - 1))}
                        disabled={monthPnlPage >= totalPages - 1}
                      >
                        ← Older
                      </button>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {monthPnlPage + 1} / {totalPages}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setMonthPnlPage(p => Math.max(p - 1, 0))}
                        disabled={monthPnlPage === 0}
                      >
                        Newer →
                      </button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      })()}

      {/* ===== LESSONS LEARNED ===== */}
      {lessonsData.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <h5 className="mb-0">📝 Lessons Learned ({lessonsData.length})</h5>
              </Card.Header>
              <Card.Body>
                {lessonsData.map((item, idx) => (
                  <div key={idx} className="lesson-item">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div>
                        <span className="lesson-stock-badge">{item.stockName}</span>
                        <span className="lesson-date">{item.date}</span>
                      </div>
                      {item.netProfit !== null && (
                        <Badge bg={parseFloat(item.netProfit) >= 0 ? 'success' : 'danger'}>
                          ₹{item.netProfit}
                        </Badge>
                      )}
                    </div>
                    <p className="mb-0" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      {item.lesson}
                    </p>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Stock-wise Performance</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Total Trades</th>
                      <th>Closed</th>
                      <th>Holding</th>
                      <th>Total Quantity</th>
                      <th>Net P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockWiseArray.map((item) => (
                      <tr key={item.stock}>
                        <td><strong>{item.stock}</strong></td>
                        <td>{item.totalTrades}</td>
                        <td>{item.closedTrades}</td>
                        <td>{item.holdingTrades}</td>
                        <td>{item.totalQuantity}</td>
                        <td>
                          <strong className={item.totalProfit >= 0 ? 'text-success' : 'text-danger'}>
                            ₹{item.totalProfit.toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {Object.keys(monthlyData).length > 0 && (
        <Row>
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Monthly Performance</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Trades</th>
                        <th>Net P/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData).map(([month, data]) => (
                        <tr key={month}>
                          <td><strong>{month}</strong></td>
                          <td>{data.trades}</td>
                          <td>
                            <strong className={data.profit >= 0 ? 'text-success' : 'text-danger'}>
                              ₹{data.profit.toFixed(2)}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AnalyticsPage;