// src/pages/AllTradesPage.js
import React from 'react';
import TradeTable from '../components/TradeTable';
import { Container } from 'react-bootstrap';

const AllTradesPage = ({ trades, onDeleteTrade, onUpdateTrade, loading }) => {
  return (
    <Container>
      <h4 className="mb-4 text-white">📋 All Trades</h4>
      <TradeTable 
        trades={trades} 
        onDeleteTrade={onDeleteTrade}
        onUpdateTrade={onUpdateTrade}
        loading={loading}
      />
    </Container>
  );
};

export default AllTradesPage;