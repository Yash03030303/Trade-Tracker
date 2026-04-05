// src/components/TradeForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const MISTAKE_OPTIONS = [
  'Overtrading',
  'Risked Too Much',
  'Exited Too Late',
  'Ignored Signals',
  'Ignored Stop Loss',
  'Greed',
  'Revenge Trading',
  'Exited Too Early',
  'FOMO Entry',
  'No Clear Plan',
  'No Mistakes'
];

/**
 * Props:
 *  - onAddTrade (legacy) OR onSubmit (preferred) -> async function(tradeData) for adding/updating
 *  - initialData: optional object to prefill form when editing (fields match your trade shape)
 *  - submitLabel: optional string for button ('Add Trade' / 'Save Changes')
 */
const TradeForm = ({ onAddTrade, onSubmit, initialData = null, submitLabel }) => {
  const [formData, setFormData] = useState({
    stockName: '',
    buyPrice: '',
    sellPrice: '',
    quantity: '',
    brokerage: '0',
    taxes: '0',
    tradeType: 'intraday',
    buyDate: '',
    sellDate: '',
    mistakesMade: [],
    lessonsLearned: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // populate when editing
  useEffect(() => {
    if (!initialData) return;
    // convert incoming dates (Timestamp or ISO) to YYYY-MM-DD for input value
    const toInputDate = (d) => {
      if (!d) return '';
      if (typeof d.toDate === 'function') {
        const dt = d.toDate();
        return dt.toISOString().slice(0, 10);
      }
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '';
      return dt.toISOString().slice(0, 10);
    };

    setFormData({
      stockName: initialData.stockName ?? '',
      buyPrice: initialData.buyPrice !== undefined ? String(initialData.buyPrice) : '',
      sellPrice: initialData.sellPrice !== undefined ? String(initialData.sellPrice) : '',
      quantity: initialData.quantity !== undefined ? String(initialData.quantity) : '',
      brokerage: initialData.brokerage !== undefined ? String(initialData.brokerage) : '0',
      taxes: initialData.taxes !== undefined ? String(initialData.taxes) : '0',
      tradeType: initialData.tradeType ?? 'intraday',
      buyDate: toInputDate(initialData.buyDate),
      sellDate: toInputDate(initialData.sellDate),
      mistakesMade: initialData.mistakesMade ?? [],
      lessonsLearned: initialData.lessonsLearned ?? ''
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.stockName || !formData.buyPrice || !formData.quantity) {
      setError('Please fill stock name, buy price, and quantity');
      return;
    }
    if (!formData.mistakesMade || formData.mistakesMade.length === 0) {
      setError('Please select at least one option under Mistakes Made');
      return;
    }
    if (formData.tradeType === 'intraday' && !formData.sellPrice) {
      setError('Sell price is required for intraday trades');
      return;
    }

    setLoading(true);

    const payload = {
      stockName: formData.stockName.toUpperCase(),
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: formData.sellPrice ? parseFloat(formData.sellPrice) : 0,
      quantity: parseInt(formData.quantity, 10),
      brokerage: parseFloat(formData.brokerage || 0),
      taxes: parseFloat(formData.taxes || 0),
      tradeType: formData.tradeType,
      buyDate: formData.buyDate || null,
      sellDate: formData.sellDate || null,
      mistakesMade: formData.mistakesMade,
      lessonsLearned: formData.lessonsLearned.trim() || ''
    };

    try {
      // prefer generic onSubmit (for both add & update), else fallback to onAddTrade
      if (typeof onSubmit === 'function') {
        await onSubmit(payload);
      } else if (typeof onAddTrade === 'function') {
        await onAddTrade(payload);
      } else {
        throw new Error('No submit handler provided to TradeForm');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to submit trade.');
      setLoading(false);
      return;
    }

    // Reset only when adding (if initialData was present, caller probably closes modal instead)
    if (!initialData) {
      setFormData({
        stockName: '',
        buyPrice: '',
        sellPrice: '',
        quantity: '',
        brokerage: '0',
        taxes: '0',
        tradeType: 'intraday',
        buyDate: '',
        sellDate: '',
        mistakesMade: [],
        lessonsLearned: ''
      });
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">{initialData ? 'Edit Trade' : 'Add New Trade'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="stockName"
                  value={formData.stockName}
                  onChange={handleChange}
                  placeholder="e.g., RELIANCE"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Trade Type *</Form.Label>
                <Form.Select name="tradeType" value={formData.tradeType} onChange={handleChange}>
                  <option value="intraday">Intraday</option>
                  <option value="delivery">Delivery</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Buy Price (₹) *</Form.Label>
                <Form.Control type="number" step="0.01" name="buyPrice" value={formData.buyPrice} onChange={handleChange} required />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Sell Price (₹) {formData.tradeType === 'intraday' && '*'}</Form.Label>
                <Form.Control type="number" step="0.01" name="sellPrice" value={formData.sellPrice} onChange={handleChange} required={formData.tradeType === 'intraday'} />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity *</Form.Label>
                <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Buy Date</Form.Label>
                <Form.Control type="date" name="buyDate" value={formData.buyDate} onChange={handleChange} required/>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sell Date</Form.Label>
                <Form.Control type="date" name="sellDate" value={formData.sellDate} onChange={handleChange} />
                <Form.Text className="text-muted">Optional — enter sell date.</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Brokerage (₹)</Form.Label>
                <Form.Control type="number" step="0.01" name="brokerage" value={formData.brokerage} onChange={handleChange} />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Taxes (₹)</Form.Label>
                <Form.Control type="number" step="0.01" name="taxes" value={formData.taxes} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          {/* Mistakes Made - Required */}
          <div className="mistakes-section mb-3">
            <Form.Label className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚠️ Mistakes Made *</span>
            </Form.Label>
            <div className="mistakes-grid">
              {MISTAKE_OPTIONS.map((mistake) => {
                const isChecked = formData.mistakesMade.includes(mistake);
                return (
                  <Form.Check
                    key={mistake}
                    type="checkbox"
                    id={`mistake-${mistake.replace(/\s+/g, '-').toLowerCase()}`}
                    label={mistake}
                    checked={isChecked}
                    onChange={() => {
                      setFormData(prev => {
                        let updated;
                        if (mistake === 'No Mistakes') {
                          // If selecting "No Mistakes", deselect all others
                          updated = isChecked ? [] : ['No Mistakes'];
                        } else {
                          // If selecting any other mistake, deselect "No Mistakes"
                          const withoutNoMistakes = prev.mistakesMade.filter(m => m !== 'No Mistakes');
                          updated = isChecked
                            ? withoutNoMistakes.filter(m => m !== mistake)
                            : [...withoutNoMistakes, mistake];
                        }
                        return { ...prev, mistakesMade: updated };
                      });
                    }}
                    className="mistake-checkbox"
                  />
                );
              })}
            </div>
            {formData.mistakesMade.length === 0 && (
              <Form.Text className="text-danger">Please select at least one option</Form.Text>
            )}
          </div>

          {/* Lessons Learned - Optional */}
          <Form.Group className="mb-3">
            <Form.Label>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>📝 Lessons Learned</span>
              <span className="text-muted ms-2" style={{ fontSize: '0.85rem', fontWeight: 400 }}>(Optional)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="lessonsLearned"
              value={formData.lessonsLearned}
              onChange={handleChange}
              placeholder="What did you learn from this trade?"
              className="lessons-textarea"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="secondary" type="button" onClick={() => {
              setFormData({
                stockName: '', buyPrice: '', sellPrice: '', quantity: '',
                brokerage: '0', taxes: '0', tradeType: 'intraday',
                buyDate: '', sellDate: '', mistakesMade: [], lessonsLearned: ''
              });
            }} className="flex-fill" style={{ fontWeight: 600 }}>
              🔄 Reset
            </Button>
            <Button variant="primary" type="submit" disabled={loading} className="flex-fill">
              {loading ? 'Saving...' : (submitLabel || (initialData ? '💾 Save Changes' : '💾 Save Trade'))}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TradeForm;