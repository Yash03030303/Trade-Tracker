// src/utils/downloadUtils.js
import { calculateProfitLoss } from '../services/tradeService';

// Safe date formatting helpers
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return (typeof timestamp.toDate === 'function')
      ? timestamp.toDate().toLocaleDateString('en-IN')
      : new Date(timestamp).toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

// Safe number coercion: returns Number or NaN
const toNumberSafe = (v) => {
  if (v === null || v === undefined) return NaN;
  if (typeof v === 'number') return v;
  if (typeof v.toNumber === 'function') {
    try { return v.toNumber(); } catch {}
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const formatMoney = (v) => {
  const n = toNumberSafe(v);
  return Number.isFinite(n) ? n.toFixed(2) : 'N/A';
};

// helper: compute total buy/sell for a trade
const computeTotals = (trade) => {
  const qty = toNumberSafe(trade.quantity);
  const bp = toNumberSafe(trade.buyPrice);
  const sp = toNumberSafe(trade.sellPrice);

  const totalBuy = (Number.isFinite(qty) && Number.isFinite(bp)) ? qty * bp : NaN;
  const totalSell = (Number.isFinite(qty) && Number.isFinite(sp)) ? qty * sp : NaN;

  return { totalBuy, totalSell };
};

// ----------------------------------------------------
// EXCEL DOWNLOAD (HTML table → Excel)
// Columns: Sr No., Stock, Type, Buy Date, Sell Date, Buy Price, Sell Price,
//          Total Buy, Total Sell, Qty, Status, Gross P/L, Net P/L, Brokerage+Tax
// ----------------------------------------------------
export const downloadExcel = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    alert('No trades to download');
    return;
  }

  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          font-size: 11pt;
        }
        th, td { 
          border: 1px solid #000; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #4472C4; 
          color: white; 
          font-weight: bold; 
          text-align: center;
        }
        tr:nth-child(even) { 
          background-color: #F2F2F2; 
        }
        .number {
          text-align: right;
        }
        .header-row {
          background-color: #203864;
          color: white;
          font-size: 14pt;
          font-weight: bold;
        }
        .total-row {
          background-color: #FFD966;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <table>
        <tr class="header-row">
          <td colspan="14" style="text-align: center; padding: 15px;">
            📈 TRADING REPORT - ${new Date().toLocaleDateString('en-IN')}
          </td>
        </tr>
        <thead>
          <tr>
            <th>Sr No.</th>
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
            <th>Brokerage+Tax</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalGrossProfit = 0;
  let totalNetProfit = 0;
  let totalChargesSum = 0;

  trades.forEach((trade, index) => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const { totalBuy, totalSell } = computeTotals(trade);

    // Use buyDate and sellDate if available, otherwise use createdAt
    const buyDate = formatDate(trade.buyDate || trade.createdAt);
    const sellDate = status === 'holding' ? 'Holding' : formatDate(trade.sellDate || trade.createdAt);

    const brokerage = toNumberSafe(trade.brokerage);
    const taxes = toNumberSafe(trade.taxes);
    const charges = (Number.isFinite(brokerage) ? brokerage : 0) + (Number.isFinite(taxes) ? taxes : 0);
    totalChargesSum += charges;

    // Calculate totals for closed trades
    if (status === 'closed') {
      const gpNum = toNumberSafe(grossProfit);
      const npNum = toNumberSafe(netProfit);
      if (Number.isFinite(gpNum)) totalGrossProfit += gpNum;
      if (Number.isFinite(npNum)) totalNetProfit += npNum;
    }

    tableHTML += `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td><strong>${trade.stockName ?? ''}</strong></td>
        <td style="text-align: center;">${trade.tradeType ?? ''}</td>
        <td style="text-align: center;">${buyDate}</td>
        <td style="text-align: center;">${sellDate}</td>
        <td class="number">₹${formatMoney(trade.buyPrice)}</td>
        <td class="number">${status === 'holding' ? 'Holding' : '₹' + formatMoney(trade.sellPrice)}</td>
        <td class="number">${Number.isFinite(totalBuy) ? '₹' + totalBuy.toFixed(2) : 'N/A'}</td>
        <td class="number">${status === 'holding' ? 'Holding' : (Number.isFinite(totalSell) ? '₹' + totalSell.toFixed(2) : 'N/A')}</td>
        <td style="text-align: center;">${trade.quantity ?? ''}</td>
        <td style="text-align: center; ${status === 'holding' ? 'color: blue;' : 'color: green;'}">${status === 'holding' ? 'Holding' : 'Closed'}</td>
        <td class="number" style="${status === 'closed' && toNumberSafe(grossProfit) >= 0 ? 'color: green;' : 'color: red;'}">
          ${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(grossProfit)) ? grossProfit : 'N/A') : 'N/A'}
        </td>
        <td class="number" style="${status === 'closed' && toNumberSafe(netProfit) >= 0 ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;'}">
          ${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A') : 'N/A'}
        </td>
        <td class="number">₹${charges.toFixed(2)}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="11" style="text-align: right; padding-right: 10px;">
              <strong>TOTAL (Closed Trades):</strong>
            </td>
            <td class="number" style="${totalGrossProfit >= 0 ? 'color: green;' : 'color: red;'}">
              <strong>₹${totalGrossProfit.toFixed(2)}</strong>
            </td>
            <td class="number" style="${totalNetProfit >= 0 ? 'color: green;' : 'color: red;'}">
              <strong>₹${totalNetProfit.toFixed(2)}</strong>
            </td>
            <td class="number">
              <strong>₹${totalChargesSum.toFixed(2)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
      <br>
      <p style="text-align: center; color: #666; font-size: 10pt;">
        Generated on ${new Date().toLocaleString('en-IN')} | Total Trades: ${trades.length}
      </p>
    </body>
    </html>
  `;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `Trading_Report_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// PDF DOWNLOAD (Print-optimized format)
// Uses same columns as Excel
// ----------------------------------------------------
export const downloadPDF = (trades) => {
  if (!Array.isArray(trades) || trades.length === 0) {
    alert('No trades to download');
    return;
  }

  let printContent = `
    <html>
    <head>
      <title>Trading Report - PDF</title>
      <style>
        @media print {
          body { margin: 0; padding: 15px; }
          .no-print { display: none; }
        }
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          font-size: 11pt;
          color: #222;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 3px solid #667eea;
          padding-bottom: 10px;
        }
        h1 {
          color: #667eea;
          margin: 0;
          font-size: 24pt;
        }
        .report-info {
          text-align: center;
          margin-bottom: 20px;
          color: #666;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin-top: 10px;
          font-size: 10pt;
        }
        th, td { 
          border: 1px solid #333; 
          padding: 8px 5px; 
          text-align: left; 
        }
        th { 
          background-color: #667eea; 
          color: white; 
          font-weight: bold;
          text-align: center;
          font-size: 9pt;
        }
        tr:nth-child(even) { 
          background-color: #f8f9fa; 
        }
        .number {
          text-align: right;
        }
        .center {
          text-align: center;
        }
        .profit { 
          color: #28a745; 
          font-weight: bold; 
        }
        .loss { 
          color: #dc3545; 
          font-weight: bold; 
        }
        .total-row {
          background-color: #FFD966 !important;
          font-weight: bold;
          font-size: 11pt;
        }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          color: #666;
          font-size: 9pt;
          border-top: 2px solid #ddd;
          padding-top: 10px;
        }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📈 TRADING REPORT</h1>
      </div>
      
      <div class="report-info">
        <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
        <p><strong>Total Trades:</strong> ${trades.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 3%;">Sr No.</th>
            <th style="width: 10%;">Stock</th>
            <th style="width: 7%;">Type</th>
            <th style="width: 8%;">Buy Date</th>
            <th style="width: 8%;">Sell Date</th>
            <th style="width: 7%;">Buy Price</th>
            <th style="width: 7%;">Sell Price</th>
            <th style="width: 8%;">Total Buy</th>
            <th style="width: 8%;">Total Sell</th>
            <th style="width: 5%;">Qty</th>
            <th style="width: 7%;">Status</th>
            <th style="width: 8%;">Gross P/L</th>
            <th style="width: 8%;">Net P/L</th>
            <th style="width: 6%;">Charges</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalGrossProfit = 0;
  let totalNetProfit = 0;
  let totalChargesSum = 0;

  trades.forEach((trade, index) => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const { totalBuy, totalSell } = computeTotals(trade);

    const buyDate = formatDate(trade.buyDate || trade.createdAt);
    const sellDate = status === 'holding' ? 'Holding' : formatDate(trade.sellDate || trade.createdAt);

    const brokerage = toNumberSafe(trade.brokerage);
    const taxes = toNumberSafe(trade.taxes);
    const charges = (Number.isFinite(brokerage) ? brokerage : 0) + (Number.isFinite(taxes) ? taxes : 0);
    totalChargesSum += charges;

    if (status === 'closed') {
      const gpNum = toNumberSafe(grossProfit);
      const npNum = toNumberSafe(netProfit);
      if (Number.isFinite(gpNum)) totalGrossProfit += gpNum;
      if (Number.isFinite(npNum)) totalNetProfit += npNum;
    }

    const npClass = status === 'closed' && toNumberSafe(netProfit) >= 0 ? 'profit' : 'loss';
    const gpClass = status === 'closed' && toNumberSafe(grossProfit) >= 0 ? 'profit' : 'loss';

    printContent += `
      <tr>
        <td class="center">${index + 1}</td>
        <td><strong>${trade.stockName ?? ''}</strong></td>
        <td class="center">${trade.tradeType ?? ''}</td>
        <td class="center">${buyDate}</td>
        <td class="center">${sellDate}</td>
        <td class="number">₹${formatMoney(trade.buyPrice)}</td>
        <td class="number">${status === 'holding' ? 'Holding' : '₹' + formatMoney(trade.sellPrice)}</td>
        <td class="number">${Number.isFinite(totalBuy) ? '₹' + totalBuy.toFixed(2) : 'N/A'}</td>
        <td class="number">${status === 'holding' ? 'Holding' : (Number.isFinite(totalSell) ? '₹' + totalSell.toFixed(2) : 'N/A')}</td>
        <td class="center">${trade.quantity ?? ''}</td>
        <td class="center" style="${status === 'holding' ? 'color: #007bff;' : 'color: #28a745;'}">${status === 'holding' ? 'Holding' : 'Closed'}</td>
        <td class="number ${status === 'closed' ? gpClass : ''}">
          ${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(grossProfit)) ? grossProfit : 'N/A') : 'N/A'}
        </td>
        <td class="number ${status === 'closed' ? npClass : ''}">
          ${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A') : 'N/A'}
        </td>
        <td class="number">₹${charges.toFixed(2)}</td>
      </tr>
    `;
  });

  const totalProfitClass = totalNetProfit >= 0 ? 'profit' : 'loss';
  const totalGrossClass = totalGrossProfit >= 0 ? 'profit' : 'loss';

  printContent += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="11" style="text-align: right; padding-right: 10px;">
              <strong>TOTAL (Closed Trades):</strong>
            </td>
            <td class="number ${totalGrossClass}">
              ₹${totalGrossProfit.toFixed(2)}
            </td>
            <td class="number ${totalProfitClass}">
              ₹${totalNetProfit.toFixed(2)}
            </td>
            <td class="number">
              ₹${totalChargesSum.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
      
      <div class="footer">
        <p><strong>Trading Tracker Report</strong> | Generated automatically</p>
        <p>Total Trades: ${trades.length} | Closed: ${trades.filter(t => calculateProfitLoss(t).status === 'closed').length} | Holding: ${trades.filter(t => calculateProfitLoss(t).status === 'holding').length}</p>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14pt; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14pt; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for this site to download PDF');
    return;
  }
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Auto-print after content loads
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };
};

// Export printTrades as an alias for backward compatibility
export const printTrades = downloadPDF;