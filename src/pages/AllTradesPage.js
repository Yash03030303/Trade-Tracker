// src/pages/AllTradesPage.js
import React from 'react';
import TradeTable from '../components/TradeTable';
import { Container, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileExcel, 
  faFilePdf 
} from '@fortawesome/free-solid-svg-icons';
import { downloadExcel, downloadPDF } from '../utils/downloadUtils';

const AllTradesPage = ({ trades, onDeleteTrade, onUpdateTrade, loading }) => {
  return (
    <Container fluid className="px-2 px-md-3">
      <Row className="mb-3 mb-md-4 align-items-center">
        <Col xs={12} md={6} className="mb-2 mb-md-0">
          <h4 className="page-title mb-0">📋 All Trades</h4>
        </Col>
        
        <Col xs={12} md={6} className="text-md-end">
          {trades.length > 0 && (
            <ButtonGroup className="w-100 w-md-auto">
              <Button 
                variant="success" 
                size="sm"
                onClick={() => downloadExcel(trades)}
                title="Download as Excel"
                className="flex-fill flex-md-grow-0"
              >
                <FontAwesomeIcon icon={faFileExcel} /> Excel
              </Button>
              
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => downloadPDF(trades)}
                title="Download as PDF"
                className="flex-fill flex-md-grow-0"
              >
                <FontAwesomeIcon icon={faFilePdf} /> PDF
              </Button>
            </ButtonGroup>
          )}
        </Col>
      </Row>
      
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