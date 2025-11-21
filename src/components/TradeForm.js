// src/components/TradeForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

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
    sellDate: ''
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
      sellDate: toInputDate(initialData.sellDate)
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
      sellDate: formData.sellDate || null
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
        sellDate: ''
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
                <Form.Control type="date" name="buyDate" value={formData.buyDate} onChange={handleChange} />
                <Form.Text className="text-muted">Optional — enter buy date.</Form.Text>
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

          <Button variant="primary" type="submit" disabled={loading} className="w-100">
            {loading ? 'Saving...' : (submitLabel || (initialData ? 'Save Changes' : 'Add Trade'))}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TradeForm;