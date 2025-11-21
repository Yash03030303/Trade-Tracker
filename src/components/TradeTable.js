// src/components/TradeTable.js
import React, { useState } from 'react';
import { Table, Button, Badge, Card, Form, Row, Col, Modal } from 'react-bootstrap';
import TradeForm from './TradeForm';
import { calculateProfitLoss } from '../services/tradeService';

// Safe helpers
const toNumberSafe = (v) => {
  if (v === null || v === undefined) return NaN;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};
const formatMoney = (v) => {
  const n = toNumberSafe(v);
  return Number.isFinite(n) ? n.toFixed(2) : 'N/A';
};
const formatDate = (d) => {
  if (!d) return '-';
  try {
    if (typeof d.toDate === 'function') return d.toDate().toLocaleDateString();
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString();
  } catch {
    return '-';
  }
};

// compute per-trade totals
const computeTotals = (trade) => {
  const qty = toNumberSafe(trade.quantity);
  const bp = toNumberSafe(trade.buyPrice);
  const sp = toNumberSafe(trade.sellPrice);
  const totalBuy = (Number.isFinite(qty) && Number.isFinite(bp)) ? qty * bp : NaN;
  const totalSell = (Number.isFinite(qty) && Number.isFinite(sp)) ? qty * sp : NaN;
  return { totalBuy, totalSell };
};

const TradeTable = ({ trades = [], onDeleteTrade, onUpdateTrade, loading }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal state
  const [editingTrade, setEditingTrade] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (trade) => {
    setEditingTrade(trade);
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setEditingTrade(null);
    setShowEditModal(false);
    setSavingEdit(false);
  };

  const handleSaveEdit = async (updates) => {
    if (!editingTrade) return;
    setSavingEdit(true);
    try {
      // parent should provide onUpdateTrade(tradeId, updates)
      await onUpdateTrade(editingTrade.id, updates);
      closeEdit();
    } catch (err) {
      console.error('Failed to update trade:', err);
      setSavingEdit(false);
      // optionally show UI error
    }
  };

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

  const filteredTrades = trades.filter(trade => {
    const matchesType = filter === 'all' || trade.tradeType === filter;
    const matchesSearch = trade.stockName?.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Totals across filtered trades
  const totals = filteredTrades.reduce((acc, trade) => {
    const { totalBuy, totalSell } = computeTotals(trade);
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);

    return {
      totalBuy: acc.totalBuy + (Number.isFinite(totalBuy) ? totalBuy : 0),
      totalSell: acc.totalSell + (Number.isFinite(totalSell) ? totalSell : 0),
      grossProfit: acc.grossProfit + (status === 'closed' && Number.isFinite(Number(grossProfit)) ? Number(grossProfit) : 0),
      netProfit: acc.netProfit + (status === 'closed' && Number.isFinite(Number(netProfit)) ? Number(netProfit) : 0)
    };
  }, { totalBuy: 0, totalSell: 0, grossProfit: 0, netProfit: 0 });

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Trade History</h5>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-3">
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
                  <th>Buy Date</th>
                  <th>Sell Date</th>
                  <th>Buy Price</th>
                  <th>Sell Price</th>
                  <th>Total Buy</th>
                  <th>Total Sell</th>
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
                  const { totalBuy, totalSell } = computeTotals(trade);
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

                      <td>{formatDate(trade.buyDate)}</td>
                      <td>{formatDate(trade.sellDate)}</td>

                      <td>₹{formatMoney(trade.buyPrice)}</td>
                      <td>
                        {status === 'holding' ? (
                          <Badge bg="secondary">Holding</Badge>
                        ) : (
                          `₹${formatMoney(trade.sellPrice)}`
                        )}
                      </td>

                      <td>{Number.isFinite(totalBuy) ? `₹${totalBuy.toFixed(2)}` : '-'}</td>
                      <td>{Number.isFinite(totalSell) ? `₹${totalSell.toFixed(2)}` : '-'}</td>

                      <td>{trade.quantity ?? '-'}</td>

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

                      <td className="d-flex gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => openEdit(trade)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => onDeleteTrade(trade.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="table-light">
                <tr>
                  <td colSpan="7" className="text-end"><strong>Totals (filtered)</strong></td>
                  <td>
                    <strong className={totals.totalBuy >= 0 ? 'text-primary' : 'text-danger'}>
                      ₹{totals.totalBuy.toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <strong className={totals.totalSell >= 0 ? 'text-primary' : 'text-danger'}>
                      ₹{totals.totalSell.toFixed(2)}
                    </strong>
                  </td>
                  <td colSpan="2" className="text-end"><strong>Gross:</strong></td>
                  <td>
                    <strong className={totals.grossProfit >= 0 ? 'text-success' : 'text-danger'}>₹{totals.grossProfit.toFixed(2)}</strong>
                  </td>
                  <td>
                    <strong className={totals.netProfit >= 0 ? 'text-success' : 'text-danger'}>₹{totals.netProfit.toFixed(2)}</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={closeEdit} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Trade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTrade && (
            <TradeForm
              initialData={editingTrade}
              submitLabel={savingEdit ? 'Saving...' : 'Save Changes'}
              onSubmit={(updates) => handleSaveEdit(updates)}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TradeTable;