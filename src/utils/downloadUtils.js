// src/utils/downloadUtils.js
import { calculateProfitLoss } from '../services/tradeService';

// Safe date formatting helpers
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return (typeof timestamp.toDate === 'function')
      ? timestamp.toDate().toLocaleDateString()
      : new Date(timestamp).toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

const formatDateISO = (timestamp) => {
  if (!timestamp) return null;
  try {
    return (typeof timestamp.toDate === 'function')
      ? timestamp.toDate().toISOString()
      : new Date(timestamp).toISOString();
  } catch {
    return null;
  }
};

// Safe number coercion: returns Number or NaN
const toNumberSafe = (v) => {
  if (v === null || v === undefined) return NaN;
  if (typeof v === 'number') return v;
  // If it's a Firestore-like object with toNumber (rare), try that
  if (typeof v.toNumber === 'function') {
    try { return v.toNumber(); } catch {}
  }
  // Strings like "123.45"
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

// Format money for display (returns string like "123.45" or "N/A")
const formatMoney = (v) => {
  const n = toNumberSafe(v);
  return Number.isFinite(n) ? n.toFixed(2) : 'N/A';
};

// ----------------------------------------------------
// CSV DOWNLOAD
// ----------------------------------------------------
export const downloadCSV = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    alert('No trades to download');
    return;
  }

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

  const rows = trades.map(trade => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const date = formatDate(trade.createdAt);

    return [
      `"${trade.stockName ?? ''}"`,
      trade.tradeType ?? '',
      formatMoney(trade.buyPrice),
      status === 'holding' ? 'Holding' : formatMoney(trade.sellPrice),
      (trade.quantity !== undefined && trade.quantity !== null) ? String(trade.quantity) : 'N/A',
      formatMoney(trade.brokerage),
      formatMoney(trade.taxes),
      status === 'closed' ? (Number.isFinite(toNumberSafe(grossProfit)) ? grossProfit : 'N/A') : 'N/A',
      status === 'closed' ? (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A') : 'N/A',
      status === 'holding' ? 'Holding' : 'Closed',
      date
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// JSON DOWNLOAD
// ----------------------------------------------------
export const downloadJSON = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    alert('No trades to download');
    return;
  }

  const jsonTrades = trades.map(trade => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    return {
      stockName: trade.stockName ?? null,
      tradeType: trade.tradeType ?? null,
      buyPrice: Number.isFinite(toNumberSafe(trade.buyPrice)) ? toNumberSafe(trade.buyPrice) : null,
      sellPrice: Number.isFinite(toNumberSafe(trade.sellPrice)) ? toNumberSafe(trade.sellPrice) : null,
      quantity: trade.quantity ?? null,
      brokerage: Number.isFinite(toNumberSafe(trade.brokerage)) ? toNumberSafe(trade.brokerage) : null,
      taxes: Number.isFinite(toNumberSafe(trade.taxes)) ? toNumberSafe(trade.taxes) : null,
      grossProfit: status === 'closed' && Number.isFinite(toNumberSafe(grossProfit)) ? Number(grossProfit) : null,
      netProfit: status === 'closed' && Number.isFinite(toNumberSafe(netProfit)) ? Number(netProfit) : null,
      status,
      date: formatDateISO(trade.createdAt)
    };
  });

  const blob = new Blob([JSON.stringify(jsonTrades, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `trades_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// EXCEL DOWNLOAD (HTML table → Excel)
// ----------------------------------------------------
export const downloadExcel = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    alert('No trades to download');
    return;
  }

  let tableHTML = `
    <html>
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
    const date = formatDate(trade.createdAt);

    tableHTML += `
      <tr>
        <td>${trade.stockName ?? ''}</td>
        <td>${trade.tradeType ?? ''}</td>
        <td>₹${formatMoney(trade.buyPrice)}</td>
        <td>${status === 'holding' ? 'Holding' : '₹' + formatMoney(trade.sellPrice)}</td>
        <td>${trade.quantity ?? ''}</td>
        <td>₹${formatMoney(trade.brokerage)}</td>
        <td>₹${formatMoney(trade.taxes)}</td>
        <td>${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(grossProfit)) ? grossProfit : 'N/A') : 'N/A'}</td>
        <td>${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A') : 'N/A'}</td>
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `trades_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// PRINT TRADES
// ----------------------------------------------------
export const printTrades = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    alert('No trades to print');
    return;
  }

  let printContent = `
    <html>
    <head>
      <title>Trading Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
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
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalProfit = 0;

  trades.forEach((trade, index) => {
    const { netProfit, status } = calculateProfitLoss(trade);
    const date = formatDate(trade.createdAt);

    if (status === 'closed' && Number.isFinite(toNumberSafe(netProfit))) {
      totalProfit += parseFloat(netProfit);
    }

    printContent += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${trade.stockName ?? ''}</strong></td>
        <td>${trade.tradeType ?? ''}</td>
        <td>₹${formatMoney(trade.buyPrice)}</td>
        <td>${status === 'holding' ? 'Holding' : '₹' + formatMoney(trade.sellPrice)}</td>
        <td>${trade.quantity ?? ''}</td>
        <td class="${status === 'closed' && parseFloat(netProfit) >= 0 ? 'profit' : 'loss'}">
          ${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A') : 'N/A'}
        </td>
        <td>${status === 'holding' ? 'Holding' : 'Closed'}</td>
        <td>${date}</td>
      </tr>
    `;
  });

  printContent += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="text-align: right;"><strong>Total Net P/L:</strong></td>
            <td colspan="3" class="${totalProfit >= 0 ? 'profit' : 'loss'}">
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

  setTimeout(() => printWindow.print(), 300);
};
