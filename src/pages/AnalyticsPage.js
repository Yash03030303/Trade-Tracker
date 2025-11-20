// src/pages/AnalyticsPage.js
import React from 'react';
import { Card, Row, Col, Table, Container } from 'react-bootstrap';
import { calculateProfitLoss } from '../services/tradeService';

const AnalyticsPage = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <Container>
        <h4 className="mb-4 text-white">📈 Analytics</h4>
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

  // Monthly analysis (simplified - can be enhanced)
  const monthlyData = {};
  
  trades.forEach(trade => {
    const { netProfit, status } = calculateProfitLoss(trade);
    
    if (status === 'closed' && trade.createdAt) {
      const date = trade.createdAt.toDate();
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
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
      <h4 className="mb-4 text-white">📈 Detailed Analytics</h4>
      
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Stock-wise Performance</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
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
              <Card.Body>
                <Table striped hover>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AnalyticsPage;