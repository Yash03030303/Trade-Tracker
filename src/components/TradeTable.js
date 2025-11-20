// src/components/TradeTable.js
import React, { useState } from 'react';
import { Table, Button, Badge, Card, Form, Row, Col } from 'react-bootstrap';
import { calculateProfitLoss } from '../services/tradeService';

const TradeTable = ({ trades, onDeleteTrade, onUpdateTrade, loading }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const totalStats = filteredTrades.reduce((acc, trade) => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    if (status === 'closed') {
      return {
        grossProfit: acc.grossProfit + parseFloat(grossProfit),
        netProfit: acc.netProfit + parseFloat(netProfit)
      };
    }
    return acc;
  }, { grossProfit: 0, netProfit: 0 });

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">Trade History</h5>
          </Col>
        </Row>
      </Card.Header>
      
      <Card.Body className="p-3">
        {/* Filters */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Search by stock name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={6}>
            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Trades</option>
              <option value="intraday">Intraday Only</option>
              <option value="delivery">Delivery Only</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table striped hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Stock</th>
                <th>Type</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Gross P/L</th>
                <th>Net P/L</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, index) => {
                const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
                const isProfit = status === 'closed' && parseFloat(netProfit) >= 0;
                
                return (
                  <tr key={trade.id}>
                    <td>{index + 1}</td>
                    <td><strong>{trade.stockName}</strong></td>
                    <td>
                      <Badge bg={trade.tradeType === 'intraday' ? 'warning' : 'info'}>
                        {trade.tradeType}
                      </Badge>
                    </td>
                    <td>₹{trade.buyPrice.toFixed(2)}</td>
                    <td>
                      {status === 'holding' ? (
                        <Badge bg="secondary">Holding</Badge>
                      ) : (
                        `₹${trade.sellPrice.toFixed(2)}`
                      )}
                    </td>
                    <td>{trade.quantity}</td>
                    <td>
                      {status === 'holding' ? (
                        <Badge bg="primary">Active</Badge>
                      ) : (
                        <Badge bg="success">Closed</Badge>
                      )}
                    </td>
                    <td>
                      {status === 'closed' ? (
                        <span className={parseFloat(grossProfit) >= 0 ? 'text-success' : 'text-danger'}>
                          ₹{grossProfit}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {status === 'closed' ? (
                        <strong className={isProfit ? 'text-success' : 'text-danger'}>
                          ₹{netProfit}
                        </strong>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => onDeleteTrade(trade.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan="7" className="text-end"><strong>Closed Trades Totals:</strong></td>
                <td>
                  <strong className={totalStats.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{totalStats.grossProfit.toFixed(2)}
                  </strong>
                </td>
                <td>
                  <strong className={totalStats.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{totalStats.netProfit.toFixed(2)}
                  </strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TradeTable;