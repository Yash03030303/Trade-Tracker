// src/pages/AddTradePage.js
import React from 'react';
import TradeForm from '../components/TradeForm';
import { Container } from 'react-bootstrap';

const AddTradePage = ({ onAddTrade }) => {
  return (
    <Container>
      <h4 className="mb-4 text-white">➕ Add New Trade</h4>
      <TradeForm onAddTrade={onAddTrade} />
    </Container>
  );
};

export default AddTradePage;