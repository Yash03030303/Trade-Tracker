import React from 'react';
import { Card, Button, Row, Col, Badge, ProgressBar } from 'react-bootstrap';

const ActiveSwings = ({ trades, onTargetHit, onCloseTrade }) => {
  const active = trades.filter(t => t.status === 'active' || t.status === 'partial_exit');

  const totalInvested = active.reduce((s, t) => s + (t.buyPrice || 0) * (t.quantity || 0), 0);
  const totalRisk = active.reduce((s, t) => {
    const risk = ((t.buyPrice || 0) - (t.stoploss || 0)) * (t.quantity || 0);
    return s + Math.max(0, risk);
  }, 0);

  const getTargetProgress = (trade) => {
    const sl = trade.stoploss || 0;
    const buy = trade.buyPrice || 0;
    const t1 = trade.target1 || buy;
    const range = t1 - sl;
    if (range <= 0) return 50;
    return Math.min(100, Math.max(0, ((buy - sl) / range) * 100));
  };

  if (active.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔥</div>
        <h5 className="text-muted">No Active Swing Trades</h5>
        <p className="text-muted">Enter a trade from your watchlist to see it here</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="swing-summary-card text-center">
            <Card.Body>
              <small className="text-muted">Active Trades</small>
              <h3 className="mb-0 fw-bold" style={{color:'#667eea'}}>{active.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="swing-summary-card text-center">
            <Card.Body>
              <small className="text-muted">Total Invested</small>
              <h3 className="mb-0 fw-bold text-primary">₹{totalInvested.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="swing-summary-card text-center">
            <Card.Body>
              <small className="text-muted">Max Risk Exposure</small>
              <h3 className="mb-0 fw-bold text-danger">₹{totalRisk.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Active Trade Cards */}
      <Row>
        {active.map(trade => {
          const invested = (trade.buyPrice || 0) * (trade.quantity || 0);
          const riskAmt = ((trade.buyPrice || 0) - (trade.stoploss || 0)) * (trade.quantity || 0);
          const slPct = trade.buyPrice ? (((trade.buyPrice - trade.stoploss) / trade.buyPrice) * 100).toFixed(1) : 0;
          const t1Pct = trade.buyPrice && trade.target1 ? (((trade.target1 - trade.buyPrice) / trade.buyPrice) * 100).toFixed(1) : 0;
          const t2Pct = trade.buyPrice && trade.target2 ? (((trade.target2 - trade.buyPrice) / trade.buyPrice) * 100).toFixed(1) : 0;
          const t3Pct = trade.buyPrice && trade.target3 ? (((trade.target3 - trade.buyPrice) / trade.buyPrice) * 100).toFixed(1) : 0;
          const progress = getTargetProgress(trade);
          const entryDateStr = trade.entryDate?.toDate ? trade.entryDate.toDate().toLocaleDateString() : (trade.entryDate ? new Date(trade.entryDate).toLocaleDateString() : '—');

          return (
            <Col lg={6} key={trade.id} className="mb-4">
              <Card className="swing-active-card h-100">
                <div className="swing-active-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0 text-white fw-bold">{trade.stockName}</h4>
                      <small className="text-white-50">Entered: {entryDateStr}</small>
                    </div>
                    <Badge bg={trade.status === 'partial_exit' ? 'warning' : 'success'} className="swing-status-badge-active">
                      {trade.status === 'partial_exit' ? '⚡ PARTIAL' : '🔥 ACTIVE'}
                    </Badge>
                  </div>
                </div>
                <Card.Body>
                  {/* Key Metrics */}
                  <Row className="mb-3">
                    <Col xs={4} className="text-center">
                      <small className="text-muted d-block">Buy Price</small>
                      <span className="fw-bold" style={{fontSize:'1.1rem'}}>₹{trade.buyPrice}</span>
                    </Col>
                    <Col xs={4} className="text-center">
                      <small className="text-muted d-block">Quantity</small>
                      <span className="fw-bold" style={{fontSize:'1.1rem'}}>{trade.quantity}</span>
                    </Col>
                    <Col xs={4} className="text-center">
                      <small className="text-muted d-block">Invested</small>
                      <span className="fw-bold" style={{fontSize:'1.1rem'}}>₹{invested.toLocaleString()}</span>
                    </Col>
                  </Row>

                  {/* SL / Targets Level Bar */}
                  <div className="swing-levels-bar mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-danger fw-bold">SL: ₹{trade.stoploss} ({slPct}%↓)</small>
                      <small className="text-success fw-bold">T1: ₹{trade.target1} ({t1Pct}%↑)</small>
                    </div>
                    <ProgressBar className="swing-progress">
                      <ProgressBar variant="danger" now={Math.min(progress, 30)} key={1} />
                      <ProgressBar variant="warning" now={Math.max(0, Math.min(progress - 30, 30))} key={2} />
                      <ProgressBar variant="success" now={Math.max(0, progress - 60)} key={3} />
                    </ProgressBar>
                  </div>

                  {/* Target Details */}
                  <div className="swing-target-details mb-3">
                    <div className={`swing-target-row ${trade.target1Hit ? 'target-hit' : ''}`}>
                      <span>🎯 Target 1</span>
                      <span className="fw-bold">₹{trade.target1} <small className="text-muted">(+{t1Pct}%)</small></span>
                      {trade.target1Hit
                        ? <Badge bg="success">✅ HIT</Badge>
                        : <Button size="sm" variant="outline-success" onClick={() => onTargetHit(trade.id, 'target1Hit')}>Mark Hit</Button>
                      }
                    </div>
                    {trade.target2 && (
                      <div className={`swing-target-row ${trade.target2Hit ? 'target-hit' : ''}`}>
                        <span>🎯 Target 2</span>
                        <span className="fw-bold">₹{trade.target2} <small className="text-muted">(+{t2Pct}%)</small></span>
                        {trade.target2Hit
                          ? <Badge bg="success">✅ HIT</Badge>
                          : <Button size="sm" variant="outline-success" onClick={() => onTargetHit(trade.id, 'target2Hit')}>Mark Hit</Button>
                        }
                      </div>
                    )}
                    {trade.target3 && (
                      <div className={`swing-target-row ${trade.target3Hit ? 'target-hit' : ''}`}>
                        <span>🎯 Target 3</span>
                        <span className="fw-bold">₹{trade.target3} <small className="text-muted">(+{t3Pct}%)</small></span>
                        {trade.target3Hit
                          ? <Badge bg="success">✅ HIT</Badge>
                          : <Button size="sm" variant="outline-success" onClick={() => onTargetHit(trade.id, 'target3Hit')}>Mark Hit</Button>
                        }
                      </div>
                    )}
                  </div>

                  {/* Risk Info */}
                  <div className="swing-risk-info mb-3">
                    <small className="text-danger">⚠️ Risk: ₹{riskAmt.toLocaleString()} ({slPct}%)</small>
                    {trade.rationale && (
                      <div className="mt-1"><small className="text-muted">💡 {trade.rationale}</small></div>
                    )}
                  </div>

                  <Button variant="outline-danger" size="sm" className="w-100" onClick={() => onCloseTrade(trade.id)}>
                    ❌ Close Trade
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default ActiveSwings;
