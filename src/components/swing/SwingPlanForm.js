import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { calculateRiskReward } from '../../services/swingTradeService';

const SwingPlanForm = ({ onSave, loading: saving }) => {
  const [form, setForm] = useState({
    stockName: '', entryZoneLow: '', entryZoneHigh: '',
    stoploss: '', target1: '', target2: '', target3: '',
    timeframe: 'Short-term (1-2 weeks)', rationale: '', notes: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const midEntry = (parseFloat(form.entryZoneLow) + parseFloat(form.entryZoneHigh)) / 2;
  const rr1 = calculateRiskReward(midEntry, form.stoploss, form.target1);
  const rr2 = calculateRiskReward(midEntry, form.stoploss, form.target2);
  const rr3 = calculateRiskReward(midEntry, form.stoploss, form.target3);

  const getRRColor = (rr) => {
    if (!rr) return '#6c757d';
    const v = parseFloat(rr);
    if (v >= 2) return '#28a745';
    if (v >= 1) return '#ffc107';
    return '#dc3545';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.stockName || !form.entryZoneLow || !form.entryZoneHigh || !form.stoploss || !form.target1) {
      setError('Please fill Stock Name, Entry Zone, Stoploss, and at least Target 1');
      return;
    }
    if (parseFloat(form.stoploss) >= parseFloat(form.entryZoneLow)) {
      setError('Stoploss should be below entry zone for long trades');
      return;
    }
    try {
      await onSave({
        stockName: form.stockName.toUpperCase(),
        entryZoneLow: parseFloat(form.entryZoneLow),
        entryZoneHigh: parseFloat(form.entryZoneHigh),
        stoploss: parseFloat(form.stoploss),
        target1: parseFloat(form.target1),
        target2: form.target2 ? parseFloat(form.target2) : null,
        target3: form.target3 ? parseFloat(form.target3) : null,
        timeframe: form.timeframe,
        rationale: form.rationale.trim(),
        notes: form.notes.trim(),
        buyPrice: null, quantity: null, entryDate: null,
        target1Hit: false, target2Hit: false, target3Hit: false
      });
      setForm({ stockName: '', entryZoneLow: '', entryZoneHigh: '', stoploss: '', target1: '', target2: '', target3: '', timeframe: 'Short-term (1-2 weeks)', rationale: '', notes: '' });
    } catch (err) {
      setError('Failed to save trade plan. ' + (err.message || ''));
    }
  };

  return (
    <Card className="swing-plan-card shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">📋 Plan a New Swing Trade</h5>
      </Card.Header>
      <Card.Body style={{ padding: '24px' }}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock Name *</Form.Label>
                <Form.Control name="stockName" value={form.stockName} onChange={handleChange} placeholder="e.g., RELIANCE" required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Timeframe</Form.Label>
                <Form.Select name="timeframe" value={form.timeframe} onChange={handleChange}>
                  <option>Short-term (1-2 weeks)</option>
                  <option>Medium (1-3 months)</option>
                  <option>Positional (3-6 months)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="swing-zone-section mb-3">
            <label className="form-label fw-bold" style={{ fontSize: '1.05rem' }}>🎯 Entry Zone & Levels</label>
            <Row>
              <Col md={3} xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted" style={{fontSize:'0.85rem'}}>Entry Low (₹) *</Form.Label>
                  <Form.Control type="number" step="0.01" name="entryZoneLow" value={form.entryZoneLow} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={3} xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted" style={{fontSize:'0.85rem'}}>Entry High (₹) *</Form.Label>
                  <Form.Control type="number" step="0.01" name="entryZoneHigh" value={form.entryZoneHigh} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={3} xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-danger" style={{fontSize:'0.85rem'}}>🛑 Stoploss (₹) *</Form.Label>
                  <Form.Control type="number" step="0.01" name="stoploss" value={form.stoploss} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={3} xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-success" style={{fontSize:'0.85rem'}}>🎯 Target 1 (₹) *</Form.Label>
                  <Form.Control type="number" step="0.01" name="target1" value={form.target1} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3} xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-success" style={{fontSize:'0.85rem'}}>Target 2 (₹)</Form.Label>
                  <Form.Control type="number" step="0.01" name="target2" value={form.target2} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={3} xs={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-success" style={{fontSize:'0.85rem'}}>Target 3 (₹)</Form.Label>
                  <Form.Control type="number" step="0.01" name="target3" value={form.target3} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                {(rr1 || rr2 || rr3) && (
                  <div className="swing-rr-live mt-2">
                    <span className="fw-bold me-2" style={{fontSize:'0.9rem'}}>📊 Risk : Reward</span>
                    {rr1 && <span className="swing-rr-badge" style={{background: getRRColor(rr1)}}>T1 → 1:{rr1}</span>}
                    {rr2 && <span className="swing-rr-badge" style={{background: getRRColor(rr2)}}>T2 → 1:{rr2}</span>}
                    {rr3 && <span className="swing-rr-badge" style={{background: getRRColor(rr3)}}>T3 → 1:{rr3}</span>}
                  </div>
                )}
              </Col>
            </Row>
          </div>

          <Form.Group className="mb-3">
            <Form.Label><span style={{fontSize:'1.05rem', fontWeight:700}}>💡 Trade Rationale</span></Form.Label>
            <Form.Control as="textarea" rows={2} name="rationale" value={form.rationale} onChange={handleChange} placeholder="Why this trade? (breakout, pattern, sector move...)" className="lessons-textarea" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📝 Notes <span className="text-muted" style={{fontSize:'0.85rem',fontWeight:400}}>(Optional)</span></Form.Label>
            <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={handleChange} placeholder="Any extra notes..." className="lessons-textarea" />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="secondary" type="button" className="flex-fill" style={{fontWeight:600}} onClick={() => setForm({ stockName: '', entryZoneLow: '', entryZoneHigh: '', stoploss: '', target1: '', target2: '', target3: '', timeframe: 'Short-term (1-2 weeks)', rationale: '', notes: '' })}>🔄 Reset</Button>
            <Button variant="primary" type="submit" disabled={saving} className="flex-fill">{saving ? 'Saving...' : '📋 Save Plan'}</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SwingPlanForm;
