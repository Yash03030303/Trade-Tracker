// src/components/TradeTable.js
import React, { useState } from 'react';
import { Table, Button, Badge, Card, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import { calculateProfitLoss } from '../services/tradeService';
import './TradeTable.css';

const TradeTable = ({ trades, onDeleteTrade, onUpdateTrade, loading }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading trades...</p>
        </Card.Body>
      </Card>
    );
  }

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    const matchesType = filter === 'all' || trade.tradeType === filter;
    const matchesSearch = trade.stockName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (filteredTrades.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <h5 className="text-muted">No trades found</h5>
          <p className="text-muted">
            {trades.length === 0 ? 'Add your first trade to get started!' : 'Try adjusting your filters'}
          </p>
        </Card.Body>
      </Card>
    );
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return (typeof timestamp.toDate === 'function')
        ? timestamp.toDate().toLocaleDateString('en-IN')
        : new Date(timestamp).toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  // Handle edit click
  const handleEditClick = (trade) => {
    setEditingId(trade.id);
    setEditFormData({
      stockName: trade.stockName || '',
      tradeType: trade.tradeType || 'intraday',
      buyPrice: trade.buyPrice || '',
      sellPrice: trade.sellPrice || '',
      quantity: trade.quantity || '',
      brokerage: trade.brokerage || 0,
      taxes: trade.taxes || 0
    });
  };

  // Handle form field change
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit save
  const handleEditSave = async (tradeId) => {
    try {
      const updates = {
        stockName: editFormData.stockName.toUpperCase(),
        tradeType: editFormData.tradeType,
        buyPrice: parseFloat(editFormData.buyPrice) || 0,
        sellPrice: parseFloat(editFormData.sellPrice) || 0,
        quantity: parseInt(editFormData.quantity) || 0,
        brokerage: parseFloat(editFormData.brokerage) || 0,
        taxes: parseFloat(editFormData.taxes) || 0
      };
      
      // Validate
      if (!updates.stockName || !updates.buyPrice || !updates.quantity) {
        alert('Stock name, buy price, and quantity are required');
        return;
      }

      if (updates.tradeType === 'intraday' && !updates.sellPrice) {
        alert('Sell price is required for intraday trades');
        return;
      }
      
      await onUpdateTrade(tradeId, updates);
      setEditingId(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating trade:', error);
      alert('Failed to update trade');
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const totalStats = filteredTrades.reduce((acc, trade) => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    if (status === 'closed') {
      return {
        grossProfit: acc.grossProfit + parseFloat(grossProfit || 0),
        netProfit: acc.netProfit + parseFloat(netProfit || 0)
      };
    }
    return acc;
  }, { grossProfit: 0, netProfit: 0 });

  return (
    <Card className="shadow-sm trade-table-card">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Trade History ({filteredTrades.length})</h5>
      </Card.Header>
      
      <Card.Body className="p-3">
        {/* Filters */}
        <Row className="mb-3">
          <Col xs={12} md={6} className="mb-2 mb-md-0">
            <Form.Control
              type="text"
              placeholder="Search by stock name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={12} md={6}>
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Trades</option>
              <option value="intraday">Intraday Only</option>
              <option value="delivery">Delivery Only</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Scrollable Table Container */}
        <div className="table-scroll-container">
          <Table striped hover className="mb-0 trade-table">
            <thead className="table-light sticky-header">
              <tr>
                <th className="text-center">Sr No.</th>
                <th>Stock</th>
                <th className="text-center">Type</th>
                <th className="text-center">Buy Date</th>
                <th className="text-center">Sell Date</th>
                <th className="text-end">Buy Price</th>
                <th className="text-end">Sell Price</th>
                <th className="text-end">Total Buy</th>
                <th className="text-end">Total Sell</th>
                <th className="text-center">Qty</th>
                <th className="text-center">Brokerage</th>
                <th className="text-center">Taxes</th>
                <th className="text-center">Status</th>
                <th className="text-end">Gross P/L</th>
                <th className="text-end">Net P/L</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, index) => {
                const isEditing = editingId === trade.id;
                
                // Use edited values if in edit mode, otherwise use original
                const currentTrade = isEditing ? {
                  ...trade,
                  stockName: editFormData.stockName,
                  tradeType: editFormData.tradeType,
                  buyPrice: parseFloat(editFormData.buyPrice) || 0,
                  sellPrice: parseFloat(editFormData.sellPrice) || 0,
                  quantity: parseInt(editFormData.quantity) || 0,
                  brokerage: parseFloat(editFormData.brokerage) || 0,
                  taxes: parseFloat(editFormData.taxes) || 0
                } : trade;

                const { grossProfit, netProfit, status } = calculateProfitLoss(currentTrade);
                const isProfit = status === 'closed' && parseFloat(netProfit) >= 0;
                
                const buyDate = formatDate(trade.createdAt);
                const sellDate = status === 'holding' ? 'Holding' : formatDate(trade.createdAt);
                
                const totalBuy = (currentTrade.buyPrice * currentTrade.quantity).toFixed(2);
                const totalSell = status === 'holding' 
                  ? 'Holding' 
                  : (currentTrade.sellPrice * currentTrade.quantity).toFixed(2);
                
                return (
                  <tr key={trade.id} className={isEditing ? 'editing-row' : ''}>
                    <td className="text-center">{index + 1}</td>
                    
                    {/* Stock Name */}
                    <td className="text-nowrap">
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          size="sm"
                          value={editFormData.stockName}
                          onChange={(e) => handleEditChange('stockName', e.target.value)}
                          style={{ minWidth: '120px' }}
                        />
                      ) : (
                        <strong>{trade.stockName}</strong>
                      )}
                    </td>
                    
                    {/* Trade Type */}
                    <td className="text-center">
                      {isEditing ? (
                        <Form.Select
                          size="sm"
                          value={editFormData.tradeType}
                          onChange={(e) => handleEditChange('tradeType', e.target.value)}
                          style={{ minWidth: '100px' }}
                        >
                          <option value="intraday">Intraday</option>
                          <option value="delivery">Delivery</option>
                        </Form.Select>
                      ) : (
                        <Badge bg={trade.tradeType === 'intraday' ? 'warning' : 'info'} className="text-nowrap">
                          {trade.tradeType}
                        </Badge>
                      )}
                    </td>
                    
                    <td className="text-center text-nowrap">{buyDate}</td>
                    <td className="text-center text-nowrap">{sellDate}</td>
                    
                    {/* Buy Price */}
                    <td className="text-end text-nowrap">
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          step="0.01"
                          size="sm"
                          value={editFormData.buyPrice}
                          onChange={(e) => handleEditChange('buyPrice', e.target.value)}
                          style={{ minWidth: '100px' }}
                        />
                      ) : (
                        `₹${trade.buyPrice.toFixed(2)}`
                      )}
                    </td>
                    
                    {/* Sell Price */}
                    <td className="text-end text-nowrap">
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          step="0.01"
                          size="sm"
                          value={editFormData.sellPrice}
                          onChange={(e) => handleEditChange('sellPrice', e.target.value)}
                          style={{ minWidth: '100px' }}
                          placeholder={editFormData.tradeType === 'delivery' ? 'Optional' : 'Required'}
                        />
                      ) : (
                        status === 'holding' ? (
                          <Badge bg="secondary">Holding</Badge>
                        ) : (
                          `₹${trade.sellPrice.toFixed(2)}`
                        )
                      )}
                    </td>
                    
                    {/* Total Buy */}
                    <td className="text-end text-nowrap">₹{totalBuy}</td>
                    
                    {/* Total Sell */}
                    <td className="text-end text-nowrap">
                      {totalSell === 'Holding' ? (
                        <Badge bg="secondary">Holding</Badge>
                      ) : (
                        `₹${totalSell}`
                      )}
                    </td>
                    
                    {/* Quantity */}
                    <td className="text-center">
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          size="sm"
                          value={editFormData.quantity}
                          onChange={(e) => handleEditChange('quantity', e.target.value)}
                          style={{ minWidth: '80px' }}
                        />
                      ) : (
                        trade.quantity
                      )}
                    </td>
                    
                    {/* Brokerage */}
                    <td className="text-center">
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          step="0.01"
                          size="sm"
                          value={editFormData.brokerage}
                          onChange={(e) => handleEditChange('brokerage', e.target.value)}
                          style={{ minWidth: '90px' }}
                        />
                      ) : (
                        `₹${trade.brokerage.toFixed(2)}`
                      )}
                    </td>
                    
                    {/* Taxes */}
                    <td className="text-center">
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          step="0.01"
                          size="sm"
                          value={editFormData.taxes}
                          onChange={(e) => handleEditChange('taxes', e.target.value)}
                          style={{ minWidth: '90px' }}
                        />
                      ) : (
                        `₹${trade.taxes.toFixed(2)}`
                      )}
                    </td>
                    
                    {/* Status */}
                    <td className="text-center">
                      {status === 'holding' ? (
                        <Badge bg="primary">Active</Badge>
                      ) : (
                        <Badge bg="success">Closed</Badge>
                      )}
                    </td>
                    
                    {/* Gross P/L */}
                    <td className="text-end text-nowrap">
                      {status === 'closed' ? (
                        <span className={parseFloat(grossProfit) >= 0 ? 'text-success' : 'text-danger'}>
                          <strong>₹{grossProfit}</strong>
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    
                    {/* Net P/L */}
                    <td className="text-end text-nowrap">
                      {status === 'closed' ? (
                        <strong className={isProfit ? 'text-success' : 'text-danger'}>
                          ₹{netProfit}
                        </strong>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="text-center">
                      {isEditing ? (
                        <ButtonGroup size="sm" vertical className="w-100">
                          <Button 
                            variant="success" 
                            onClick={() => handleEditSave(trade.id)}
                            className="mb-1"
                          >
                            Save
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                        </ButtonGroup>
                      ) : (
                        <ButtonGroup size="sm" vertical className="w-100">
                          <Button 
                            variant="primary" 
                            onClick={() => handleEditClick(trade)}
                            className="mb-1 text-nowrap"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            onClick={() => onDeleteTrade(trade.id)}
                            className="text-nowrap"
                          >
                            Delete
                          </Button>
                        </ButtonGroup>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-light sticky-footer">
              <tr>
                <td colSpan="13" className="text-end"><strong>Closed Trades Totals:</strong></td>
                <td className="text-end">
                  <strong className={totalStats.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{totalStats.grossProfit.toFixed(2)}
                  </strong>
                </td>
                <td className="text-end">
                  <strong className={totalStats.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{totalStats.netProfit.toFixed(2)}
                  </strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </Table>
        </div>

        {/* Info Note */}
        <div className="text-muted text-center mt-2" style={{ fontSize: '0.85rem' }}>
          <small>📝 Click Edit to modify any trade • Scroll horizontally to view all columns • Total: {filteredTrades.length}</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TradeTable;