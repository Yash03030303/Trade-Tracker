// src/components/TradeForm.js
import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const TradeForm = ({ onAddTrade }) => {
  const [formData, setFormData] = useState({
    stockName: '',
    buyPrice: '',
    sellPrice: '',
    quantity: '',
    brokerage: '0',
    taxes: '0',
    tradeType: 'intraday'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.stockName || !formData.buyPrice || !formData.quantity) {
      setError('Please fill stock name, buy price, and quantity');
      return;
    }

    // For intraday, sell price is mandatory
    if (formData.tradeType === 'intraday' && !formData.sellPrice) {
      setError('Sell price is required for intraday trades');
      return;
    }

    setLoading(true);
    
    try {
      const tradeData = {
        stockName: formData.stockName.toUpperCase(),
        buyPrice: parseFloat(formData.buyPrice),
        sellPrice: formData.sellPrice ? parseFloat(formData.sellPrice) : 0,
        quantity: parseInt(formData.quantity),
        brokerage: parseFloat(formData.brokerage || 0),
        taxes: parseFloat(formData.taxes || 0),
        tradeType: formData.tradeType
      };

      await onAddTrade(tradeData);
      
      // Reset form
      setFormData({
        stockName: '',
        buyPrice: '',
        sellPrice: '',
        quantity: '',
        brokerage: '0',
        taxes: '0',
        tradeType: 'intraday'
      });
    } catch (err) {
      setError('Failed to add trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Add New Trade</h5>
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
                <Form.Select
                  name="tradeType"
                  value={formData.tradeType}
                  onChange={handleChange}
                >
                  <option value="intraday">Intraday</option>
                  <option value="delivery">Delivery</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  {formData.tradeType === 'delivery' && 
                    'For delivery, you can leave sell price empty if still holding'}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Buy Price (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="buyPrice"
                  value={formData.buyPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Sell Price (₹) {formData.tradeType === 'intraday' && '*'}
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="sellPrice"
                  value={formData.sellPrice}
                  onChange={handleChange}
                  placeholder={formData.tradeType === 'delivery' ? 'Optional' : '0.00'}
                  required={formData.tradeType === 'intraday'}
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Brokerage (₹)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="brokerage"
                  value={formData.brokerage}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Taxes (₹)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="taxes"
                  value={formData.taxes}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
          </Row>

          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="w-100"
          >
            {loading ? 'Adding Trade...' : 'Add Trade'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TradeForm;