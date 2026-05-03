import React, { useState } from 'react';
import { Card, Button, Row, Col, Modal, Form, Badge } from 'react-bootstrap';
import { calculateRiskReward } from '../../services/swingTradeService';

const SwingWatchlist = ({ trades, onEnterTrade, onDelete, onEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [entryForm, setEntryForm] = useState({ buyPrice: '', quantity: '', entryDate: '' });
  const [entryLoading, setEntryLoading] = useState(false);

  const planned = trades.filter(t => t.status === 'planned');

  const getRRBadge = (rr) => {
    if (!rr) return null;
    const v = parseFloat(rr);
    let bg = '#dc3545';
    if (v >= 2) bg = '#28a745';
    else if (v >= 1) bg = '#ffc107';
    return <span className="swing-rr-badge" style={{ background: bg }}>1:{rr}</span>;
  };

  const openEntryModal = (trade) => {
    setSelectedTrade(trade);
    setEntryForm({ buyPrice: '', quantity: '', entryDate: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  };

  const handleEnter = async () => {
    if (!entryForm.buyPrice || !entryForm.quantity) return;
    setEntryLoading(true);
    await onEnterTrade(selectedTrade.id, {
      buyPrice: parseFloat(entryForm.buyPrice),
      quantity: parseInt(entryForm.quantity, 10),
      entryDate: entryForm.entryDate,
      status: 'active'
    });
    setEntryLoading(false);
    setShowModal(false);
  };

  if (planned.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <h5 className="text-muted">No Planned Trades Yet</h5>
        <p className="text-muted">Use the "Plan Trade" tab to create your watchlist</p>
      </div>
    );
  }

  return (
    <>
      <Row>
        {planned.map(trade => {
          const mid = (trade.entryZoneLow + trade.entryZoneHigh) / 2;
          const rr1 = calculateRiskReward(mid, trade.stoploss, trade.target1);
          const rr2 = trade.target2 ? calculateRiskReward(mid, trade.stoploss, trade.target2) : null;
          const rr3 = trade.target3 ? calculateRiskReward(mid, trade.stoploss, trade.target3) : null;
          const riskPct = trade.stoploss && mid ? (((mid - trade.stoploss) / mid) * 100).toFixed(1) : null;

          return (
            <Col lg={6} xl={4} key={trade.id} className="mb-4">
              <Card className="swing-watchlist-card h-100">
                <div className="swing-card-header-gradient">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-white fw-bold">{trade.stockName}</h5>
                    <Badge bg="info" className="swing-status-badge">PLANNED</Badge>
                  </div>
                  <small className="text-white-50">{trade.timeframe}</small>
                </div>
                <Card.Body className="pt-3">
                  <div className="swing-levels-grid mb-3">
                    <div className="swing-level-item">
                      <span className="swing-level-label">Entry Zone</span>
                      <span className="swing-level-value text-primary">₹{trade.entryZoneLow} — ₹{trade.entryZoneHigh}</span>
                    </div>
                    <div className="swing-level-item">
                      <span className="swing-level-label">🛑 Stoploss</span>
                      <span className="swing-level-value text-danger">₹{trade.stoploss}</span>
                    </div>
                    <div className="swing-level-item">
                      <span className="swing-level-label">🎯 Target 1</span>
                      <span className="swing-level-value text-success">₹{trade.target1}</span>
                    </div>
                    {trade.target2 && (
                      <div className="swing-level-item">
                        <span className="swing-level-label">🎯 Target 2</span>
                        <span className="swing-level-value text-success">₹{trade.target2}</span>
                      </div>
                    )}
                    {trade.target3 && (
                      <div className="swing-level-item">
                        <span className="swing-level-label">🎯 Target 3</span>
                        <span className="swing-level-value text-success">₹{trade.target3}</span>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {rr1 && <div><small className="text-muted">T1 R:R</small> {getRRBadge(rr1)}</div>}
                    {rr2 && <div><small className="text-muted">T2 R:R</small> {getRRBadge(rr2)}</div>}
                    {rr3 && <div><small className="text-muted">T3 R:R</small> {getRRBadge(rr3)}</div>}
                    {riskPct && <div><small className="text-muted">Risk</small> <span className="swing-rr-badge" style={{background:'#dc3545'}}>{riskPct}%</span></div>}
                  </div>

                  {trade.rationale && (
                    <div className="swing-rationale mb-3">
                      <small className="text-muted fw-bold">💡 Rationale</small>
                      <p className="mb-0 mt-1" style={{fontSize:'0.88rem'}}>{trade.rationale}</p>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <Button size="sm" variant="success" className="flex-fill" onClick={() => openEntryModal(trade)}>
                      🚀 Enter Trade
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => onDelete(trade.id)}>🗑</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Enter Trade Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>🚀 Enter Swing Trade — {selectedTrade?.stockName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTrade && (
            <div className="mb-3 p-2" style={{background:'#f8f9fa', borderRadius:'8px'}}>
              <small className="text-muted">Entry Zone: ₹{selectedTrade.entryZoneLow} — ₹{selectedTrade.entryZoneHigh} &nbsp;|&nbsp; SL: ₹{selectedTrade.stoploss}</small>
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Buy Price (₹) *</Form.Label>
            <Form.Control type="number" step="0.01" value={entryForm.buyPrice} onChange={e => setEntryForm(p => ({...p, buyPrice: e.target.value}))} placeholder="Actual buy price" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity *</Form.Label>
            <Form.Control type="number" value={entryForm.quantity} onChange={e => setEntryForm(p => ({...p, quantity: e.target.value}))} placeholder="Number of shares" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Entry Date</Form.Label>
            <Form.Control type="date" value={entryForm.entryDate} onChange={e => setEntryForm(p => ({...p, entryDate: e.target.value}))} />
          </Form.Group>
          {entryForm.buyPrice && entryForm.quantity && (
            <div className="p-2" style={{background:'#e8f5e9', borderRadius:'8px'}}>
              <small className="fw-bold">💰 Total Investment: ₹{(parseFloat(entryForm.buyPrice) * parseInt(entryForm.quantity || 0)).toLocaleString()}</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleEnter} disabled={entryLoading || !entryForm.buyPrice || !entryForm.quantity}>
            {entryLoading ? 'Entering...' : '✅ Confirm Entry'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SwingWatchlist;
