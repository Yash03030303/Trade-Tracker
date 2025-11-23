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
//          Total Buy, Total Sell, Qty, Status, Gross P/L, Net P/L, Action
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
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
        th { background-color: #4CAF50; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <table>
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  trades.forEach((trade, index) => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const { totalBuy, totalSell } = computeTotals(trade);

    const buyDate = formatDate(trade.buyDate);
    const sellDate = formatDate(trade.sellDate);

    tableHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${trade.stockName ?? ''}</td>
        <td>${trade.tradeType ?? ''}</td>
        <td>${buyDate}</td>
        <td>${sellDate}</td>
        <td>₹${formatMoney(trade.buyPrice)}</td>
        <td>${status === 'holding' ? 'Holding' : '₹' + formatMoney(trade.sellPrice)}</td>
        <td>${Number.isFinite(totalBuy) ? '₹' + totalBuy.toFixed(2) : 'N/A'}</td>
        <td>${Number.isFinite(totalSell) ? '₹' + totalSell.toFixed(2) : 'N/A'}</td>
        <td>${trade.quantity ?? ''}</td>
        <td>${status === 'holding' ? 'Holding' : 'Closed'}</td>
        <td>${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(grossProfit)) ? grossProfit : 'N/A') : 'N/A'}</td>
        <td>${status === 'closed' ? '₹' + (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A') : 'N/A'}</td>
        <td></td>
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
// PRINT TRADES (PDF-like / print)
// Uses same columns as above (Action left empty).
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
        body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
        h1 { font-size: 20px; margin-bottom: 6px; }
        .meta { margin-bottom: 12px; color: #555; }
        table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #667eea; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .profit { color: green; font-weight: bold; }
        .loss { color: red; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <h1>📈 Trading Report</h1>
      <div class="meta"><strong>Generated on:</strong> ${new Date().toLocaleString()} &nbsp; | &nbsp; <strong>Total Trades:</strong> ${trades.length}</div>
      <table>
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalNet = 0;

  trades.forEach((trade, index) => {
    const { grossProfit, netProfit, status } = calculateProfitLoss(trade);
    const { totalBuy, totalSell } = computeTotals(trade);

    const buyDate = formatDate(trade.buyDate);
    const sellDate = formatDate(trade.sellDate);

    if (status === 'closed' && Number.isFinite(toNumberSafe(netProfit))) {
      totalNet += parseFloat(netProfit);
    }

    const netClass = status === 'closed' && parseFloat(netProfit) >= 0 ? 'profit' : 'loss';
    const grossText = status === 'closed' ? ('₹' + (Number.isFinite(toNumberSafe(grossProfit)) ? grossProfit : 'N/A')) : 'N/A';
    const netText = status === 'closed' ? ('₹' + (Number.isFinite(toNumberSafe(netProfit)) ? netProfit : 'N/A')) : 'N/A';

    printContent += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${trade.stockName ?? ''}</strong></td>
        <td>${trade.tradeType ?? ''}</td>
        <td>${buyDate}</td>
        <td>${sellDate}</td>
        <td>₹${formatMoney(trade.buyPrice)}</td>
        <td>${status === 'holding' ? 'Holding' : '₹' + formatMoney(trade.sellPrice)}</td>
        <td>${Number.isFinite(totalBuy) ? '₹' + totalBuy.toFixed(2) : 'N/A'}</td>
        <td>${Number.isFinite(totalSell) ? '₹' + totalSell.toFixed(2) : 'N/A'}</td>
        <td>${trade.quantity ?? ''}</td>
        <td>${status === 'holding' ? 'Holding' : 'Closed'}</td>
        <td class="${netClass}">${grossText}</td>
        <td class="${netClass}">${netText}</td>
        <td></td>
      </tr>
    `;
  });

  printContent += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="11" style="text-align: right;"><strong>Total Net P/L:</strong></td>
            <td colspan="3" class="${totalNet >= 0 ? 'profit' : 'loss'}"><strong>₹${totalNet.toFixed(2)}</strong></td>
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
