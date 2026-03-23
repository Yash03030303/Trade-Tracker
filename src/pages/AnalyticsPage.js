// src/pages/AnalyticsPage.js
import React, { useState } from 'react';
import { Card, Row, Col, Table, Container, Form } from 'react-bootstrap';
import { calculateProfitLoss } from '../services/tradeService';

const AnalyticsPage = ({ trades }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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