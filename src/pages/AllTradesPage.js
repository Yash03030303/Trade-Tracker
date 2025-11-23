// src/pages/AllTradesPage.js
import React from 'react';
import TradeTable from '../components/TradeTable';
import { Container, Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileExcel,
  faPrint 
} from '@fortawesome/free-solid-svg-icons';
import { downloadExcel, printTrades } from '../utils/downloadUtils';

const AllTradesPage = ({ trades, onDeleteTrade, onUpdateTrade, loading }) => {
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="page-title mb-0">📋 All Trades</h4>
        
        {trades && trades.length > 0 && (
          <ButtonGroup className="download-buttons">
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => downloadExcel(trades)}
              title="Download as Excel"
            >
              <FontAwesomeIcon icon={faFileExcel} /> Excel
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => printTrades(trades)}
              title="Print Report"
            >
              <FontAwesomeIcon icon={faPrint} /> Print
            </Button>
          </ButtonGroup>
        )}
      </div>
      
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