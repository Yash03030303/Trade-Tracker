// src/utils/downloadUtils.js
import { calculateProfitLoss } from '../services/tradeService';

// Convert trades to CSV format
export const downloadCSV = (trades) => {
  if (trades.length === 0) {
    alert('No trades to download');
    return;
  }

  // CSV Headers
  const headers = [
    'Stock Name',
    'Trade Type',
    'Buy Price',
    'Sell Price',
    'Quantity',
    'Brokerage',
    'Taxes',
    'Gross P/L',
    'Net P/L',
    'Status',
    'Date'
  ];

  // CSV Rows
  const rows = trades.map(trade => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const date = trade.createdAt ? trade.createdAt.toDate().toLocaleDateString() : 'N/A';
    
    return [
      trade.stockName,
      trade.tradeType,
      trade.buyPrice.toFixed(2),
      status === 'holding' ? 'Holding' : trade.sellPrice.toFixed(2),
      trade.quantity,
      trade.brokerage.toFixed(2),
      trade.taxes.toFixed(2),
      status === 'closed' ? grossProfit : 'N/A',
      status === 'closed' ? netProfit : 'N/A',
      status === 'holding' ? 'Holding' : 'Closed',
      date
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Convert trades to JSON format
export const downloadJSON = (trades) => {
  if (trades.length === 0) {
    alert('No trades to download');
    return;
  }

  const tradesData = trades.map(trade => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    
    return {
      stockName: trade.stockName,
      tradeType: trade.tradeType,
      buyPrice: trade.buyPrice,
      sellPrice: trade.sellPrice,
      quantity: trade.quantity,
      brokerage: trade.brokerage,
      taxes: trade.taxes,
      grossProfit: status === 'closed' ? parseFloat(grossProfit) : null,
      netProfit: status === 'closed' ? parseFloat(netProfit) : null,
      status: status,
      date: trade.createdAt ? trade.createdAt.toDate().toISOString() : null
    };
  });

  const jsonContent = JSON.stringify(tradesData, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Convert trades to Excel format (using HTML table)
export const downloadExcel = (trades) => {
  if (trades.length === 0) {
    alert('No trades to download');
    return;
  }

  // Create HTML table
  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>Stock Name</th>
            <th>Trade Type</th>
            <th>Buy Price</th>
            <th>Sell Price</th>
            <th>Quantity</th>
            <th>Brokerage</th>
            <th>Taxes</th>
            <th>Gross P/L</th>
            <th>Net P/L</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
  `;

  trades.forEach(trade => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const date = trade.createdAt ? trade.createdAt.toDate().toLocaleDateString() : 'N/A';
    
    tableHTML += `
      <tr>
        <td>${trade.stockName}</td>
        <td>${trade.tradeType}</td>
        <td>₹${trade.buyPrice.toFixed(2)}</td>
        <td>${status === 'holding' ? 'Holding' : '₹' + trade.sellPrice.toFixed(2)}</td>
        <td>${trade.quantity}</td>
        <td>₹${trade.brokerage.toFixed(2)}</td>
        <td>₹${trade.taxes.toFixed(2)}</td>
        <td>${status === 'closed' ? '₹' + grossProfit : 'N/A'}</td>
        <td>${status === 'closed' ? '₹' + netProfit : 'N/A'}</td>
        <td>${status === 'holding' ? 'Holding' : 'Closed'}</td>
        <td>${date}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Print functionality
export const printTrades = (trades) => {
  if (trades.length === 0) {
    alert('No trades to print');
    return;
  }

  let printContent = `
    <html>
    <head>
      <title>Trading Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #667eea; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .profit { color: green; font-weight: bold; }
        .loss { color: red; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <h1>📈 Trading Report</h1>
      <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Trades:</strong> ${trades.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Stock</th>
            <th>Type</th>
            <th>Buy Price</th>
            <th>Sell Price</th>
            <th>Qty</th>
            <th>Net P/L</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalProfit = 0;
  
  trades.forEach((trade, index) => {
    const { netProfit, status } = calculateProfitLoss(trade);
    if (status === 'closed') {
      totalProfit += parseFloat(netProfit);
    }
    
    const profitClass = status === 'closed' ? (parseFloat(netProfit) >= 0 ? 'profit' : 'loss') : '';
    
    printContent += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${trade.stockName}</strong></td>
        <td>${trade.tradeType}</td>
        <td>₹${trade.buyPrice.toFixed(2)}</td>
        <td>${status === 'holding' ? 'Holding' : '₹' + trade.sellPrice.toFixed(2)}</td>
        <td>${trade.quantity}</td>
        <td class="${profitClass}">${status === 'closed' ? '₹' + netProfit : 'N/A'}</td>
        <td>${status === 'holding' ? 'Holding' : 'Closed'}</td>
      </tr>
    `;
  });

  printContent += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="text-align: right;"><strong>Total Net P/L:</strong></td>
            <td colspan="2" class="${totalProfit >= 0 ? 'profit' : 'loss'}">
              <strong>₹${totalProfit.toFixed(2)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
      
      <div class="footer">
        <p>Trading Tracker Report | Generated automatically</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};