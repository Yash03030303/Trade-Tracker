// src/components/TradeForm.js
import React, { useState, useEffect, useMemo } from 'react';

const MISTAKE_OPTIONS = [
  { label: 'Overtrading',       icon: '🔄' },
  { label: 'Risked Too Much',   icon: '💸' },
  { label: 'Exited Too Late',   icon: '⏰' },
  { label: 'Ignored Signals',   icon: '🚦' },
  { label: 'Ignored Stop Loss', icon: '🛑' },
  { label: 'Greed',             icon: '🤑' },
  { label: 'Revenge Trading',   icon: '😡' },
  { label: 'Exited Too Early',  icon: '🏃' },
  { label: 'FOMO Entry',        icon: '😰' },
  { label: 'No Clear Plan',     icon: '🗺️' },
  { label: 'No Mistakes',       icon: '✅' },
];

const EMPTY_FORM = {
  stockName: '', buyPrice: '', sellPrice: '', quantity: '',
  brokerage: '0', taxes: '0', tradeType: 'intraday',
  buyDate: '', sellDate: '', mistakesMade: [], lessonsLearned: ''
};

const TradeForm = ({ onAddTrade, onSubmit, initialData = null, submitLabel }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  /* ── populate when editing ── */
  useEffect(() => {
    if (!initialData) return;
    const toInputDate = (d) => {
      if (!d) return '';
      if (typeof d.toDate === 'function') return d.toDate().toISOString().slice(0, 10);
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
    };
    setFormData({
      stockName:      initialData.stockName      ?? '',
      buyPrice:       initialData.buyPrice       !== undefined ? String(initialData.buyPrice)  : '',
      sellPrice:      initialData.sellPrice      !== undefined ? String(initialData.sellPrice) : '',
      quantity:       initialData.quantity       !== undefined ? String(initialData.quantity)  : '',
      brokerage:      initialData.brokerage      !== undefined ? String(initialData.brokerage) : '0',
      taxes:          initialData.taxes          !== undefined ? String(initialData.taxes)     : '0',
      tradeType:      initialData.tradeType      ?? 'intraday',
      buyDate:        toInputDate(initialData.buyDate),
      sellDate:       toInputDate(initialData.sellDate),
      mistakesMade:   initialData.mistakesMade   ?? [],
      lessonsLearned: initialData.lessonsLearned ?? '',
    });
  }, [initialData]);

  /* ── live P&L calculation ── */
  const liveCalc = useMemo(() => {
    const buy  = parseFloat(formData.buyPrice)  || 0;
    const sell = parseFloat(formData.sellPrice) || 0;
    const qty  = parseInt(formData.quantity, 10) || 0;
    const brok = parseFloat(formData.brokerage) || 0;
    const tax  = parseFloat(formData.taxes)     || 0;

    if (!buy || !sell || !qty) return null;

    const gross    = (sell - buy) * qty;
    const net      = gross - brok - tax;
    const pct      = ((net / (buy * qty)) * 100);
    const invested = buy * qty;
    const isProfit = net >= 0;

    return { gross, net, pct, invested, isProfit };
  }, [formData.buyPrice, formData.sellPrice, formData.quantity, formData.brokerage, formData.taxes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMistake = (label) => {
    setFormData(prev => {
      let updated;
      if (label === 'No Mistakes') {
        updated = prev.mistakesMade.includes('No Mistakes') ? [] : ['No Mistakes'];
      } else {
        const without = prev.mistakesMade.filter(m => m !== 'No Mistakes');
        updated = prev.mistakesMade.includes(label)
          ? without.filter(m => m !== label)
          : [...without, label];
      }
      return { ...prev, mistakesMade: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.stockName || !formData.buyPrice || !formData.quantity) {
      setError('Please fill Stock Name, Buy Price, and Quantity.'); return;
    }
    if (!formData.mistakesMade.length) {
      setError('Please select at least one option under Mistakes Made.'); return;
    }
    if (formData.tradeType === 'intraday' && !formData.sellPrice) {
      setError('Sell Price is required for Intraday trades.'); return;
    }
    setLoading(true);
    const payload = {
      stockName:      formData.stockName.toUpperCase(),
      buyPrice:       parseFloat(formData.buyPrice),
      sellPrice:      formData.sellPrice ? parseFloat(formData.sellPrice) : 0,
      quantity:       parseInt(formData.quantity, 10),
      brokerage:      parseFloat(formData.brokerage || 0),
      taxes:          parseFloat(formData.taxes || 0),
      tradeType:      formData.tradeType,
      buyDate:        formData.buyDate  || null,
      sellDate:       formData.sellDate || null,
      mistakesMade:   formData.mistakesMade,
      lessonsLearned: formData.lessonsLearned.trim() || '',
    };
    try {
      if (typeof onSubmit === 'function')        await onSubmit(payload);
      else if (typeof onAddTrade === 'function') await onAddTrade(payload);
      else throw new Error('No submit handler provided');
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to submit trade.');
      setLoading(false);
      return;
    }
    if (!initialData) {
      setFormData(EMPTY_FORM);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setError(''); };

  const isIntraday = formData.tradeType === 'intraday';

  return (
    <>
      <style>{CSS}</style>

      <div className="tf-card">

        {/* ══ FORM HEADER ══ */}
        <div className="tf-header">
          <div className="tf-header-icon">{initialData ? '✏️' : '📋'}</div>
          <div>
            <h2 className="tf-header-title">{initialData ? 'Edit Trade' : 'New Trade Entry'}</h2>
            <p className="tf-header-sub">
              {initialData ? 'Update the trade details below' : 'Fill in your trade details carefully'}
            </p>
          </div>

          {/* Trade Type toggle — top right */}
          <div className="tf-type-toggle">
            <button
              type="button"
              className={`tf-type-btn ${formData.tradeType === 'intraday' ? 'active' : ''}`}
              onClick={() => setFormData(p => ({ ...p, tradeType: 'intraday' }))}
            >⚡ Intraday</button>
            <button
              type="button"
              className={`tf-type-btn ${formData.tradeType === 'delivery' ? 'active' : ''}`}
              onClick={() => setFormData(p => ({ ...p, tradeType: 'delivery' }))}
            >📦 Delivery</button>
          </div>
        </div>

        {/* ══ MAIN BODY — 2 columns ══ */}
        <div className="tf-body">

          {/* ── LEFT COLUMN: Trade Details ── */}
          <div className="tf-left">

            {/* Success toast */}
            {success && (
              <div className="tf-toast-success">
                ✅ Trade saved successfully!
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="tf-error">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} id="trade-form">

              {/* ── Section 1: Identity ── */}
              <SectionLabel step="1" title="Trade Identity" icon="🏷️" />
              <div className="tf-row-2">
                <Field label="Stock Name" required hint="e.g. RELIANCE, TCS">
                  <input
                    className="tf-input"
                    type="text" name="stockName"
                    value={formData.stockName}
                    onChange={handleChange}
                    placeholder="Stock symbol"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </Field>
                <Field label="Buy Date" required>
                  <input className="tf-input" type="date" name="buyDate"
                    value={formData.buyDate} onChange={handleChange} required />
                </Field>
              </div>

              {/* ── Section 2: Price & Quantity ── */}
              <SectionLabel step="2" title="Price & Quantity" icon="💰" />
              <div className="tf-row-3">
                <Field label="Buy Price (₹)" required>
                  <div className="tf-input-prefix-wrap">
                    <span className="tf-prefix">₹</span>
                    <input className="tf-input tf-input-prefix" type="number"
                      step="0.01" name="buyPrice" value={formData.buyPrice}
                      onChange={handleChange} placeholder="0.00" required />
                  </div>
                </Field>
                <Field label={`Sell Price (₹)${isIntraday ? ' *' : ''}`} hint={!isIntraday ? 'Leave blank if still holding' : ''}>
                  <div className="tf-input-prefix-wrap">
                    <span className="tf-prefix">₹</span>
                    <input className="tf-input tf-input-prefix" type="number"
                      step="0.01" name="sellPrice" value={formData.sellPrice}
                      onChange={handleChange} placeholder="0.00"
                      required={isIntraday} />
                  </div>
                </Field>
                <Field label="Quantity" required>
                  <div className="tf-input-prefix-wrap">
                    <span className="tf-prefix">#</span>
                    <input className="tf-input tf-input-prefix" type="number"
                      name="quantity" value={formData.quantity}
                      onChange={handleChange} placeholder="0" required />
                  </div>
                </Field>
              </div>

              {/* ── Section 3: Charges & Dates ── */}
              <SectionLabel step="3" title="Charges & Dates" icon="🧾" />
              <div className="tf-row-2">
                <Field label="Brokerage (₹)" hint="Total broker fee">
                  <div className="tf-input-prefix-wrap">
                    <span className="tf-prefix">₹</span>
                    <input className="tf-input tf-input-prefix" type="number"
                      step="0.01" name="brokerage" value={formData.brokerage}
                      onChange={handleChange} />
                  </div>
                </Field>
                <Field label="Taxes / STT (₹)" hint="STT, GST etc.">
                  <div className="tf-input-prefix-wrap">
                    <span className="tf-prefix">₹</span>
                    <input className="tf-input tf-input-prefix" type="number"
                      step="0.01" name="taxes" value={formData.taxes}
                      onChange={handleChange} />
                  </div>
                </Field>
              </div>
              {!isIntraday && (
                <div className="tf-row-1">
                  <Field label="Sell Date" hint="Optional — enter when you exit">
                    <input className="tf-input" type="date" name="sellDate"
                      value={formData.sellDate} onChange={handleChange} />
                  </Field>
                </div>
              )}

              {/* ── Section 4: Mistakes Made ── */}
              <SectionLabel step="4" title="Mistakes Made" icon="⚠️" required
                badge={formData.mistakesMade.length > 0 ? `${formData.mistakesMade.length} selected` : null}
              />
              <div className="tf-mistakes-grid">
                {MISTAKE_OPTIONS.map(({ label, icon }) => {
                  const checked      = formData.mistakesMade.includes(label);
                  const isGreen      = label === 'No Mistakes';
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`tf-mistake-pill ${checked ? (isGreen ? 'checked-green' : 'checked') : ''}`}
                      onClick={() => toggleMistake(label)}
                    >
                      <span className="tf-pill-icon">{icon}</span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
              {formData.mistakesMade.length === 0 && (
                <p className="tf-field-hint" style={{ color: 'var(--loss)', marginTop: '8px' }}>
                  Select at least one option to proceed
                </p>
              )}

              {/* ── Section 5: Lessons Learned ── */}
              <SectionLabel step="5" title="Lessons Learned" icon="📝" hint="Optional" />
              <textarea
                className="tf-input tf-textarea"
                name="lessonsLearned"
                value={formData.lessonsLearned}
                onChange={handleChange}
                rows={3}
                placeholder="What would you do differently next time? What did you learn?"
              />

              {/* ── Action Buttons ── */}
              <div className="tf-actions">
                <button type="button" className="tf-btn-reset" onClick={resetForm}>
                  🔄 Reset
                </button>
                <button
                  type="submit"
                  form="trade-form"
                  className="tf-btn-save"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading
                    ? <><span className="tf-spinner" /> Saving...</>
                    : (submitLabel || (initialData ? '💾 Save Changes' : '💾 Save Trade'))
                  }
                </button>
              </div>

            </form>
          </div>

          {/* ── RIGHT COLUMN: Live P&L Panel ── */}
          <div className="tf-right">

            {/* Live P&L Calculator */}
            <div className="tf-panel">
              <div className="tf-panel-title">📊 Live P&L Preview</div>

              {liveCalc ? (
                <>
                  <div className={`tf-pl-big ${liveCalc.isProfit ? 'profit' : 'loss'}`}>
                    {liveCalc.isProfit ? '▲' : '▼'} ₹{Math.abs(liveCalc.net).toFixed(2)}
                  </div>
                  <div className={`tf-pl-pct ${liveCalc.isProfit ? 'profit' : 'loss'}`}>
                    {liveCalc.pct >= 0 ? '+' : ''}{liveCalc.pct.toFixed(2)}%
                  </div>

                  <div className="tf-pl-rows">
                    <PlRow label="Gross P&L"    value={`₹${liveCalc.gross.toFixed(2)}`}  colored={liveCalc.isProfit} />
                    <PlRow label="Brokerage"    value={`− ₹${(parseFloat(formData.brokerage)||0).toFixed(2)}`} />
                    <PlRow label="Taxes / STT"  value={`− ₹${(parseFloat(formData.taxes)||0).toFixed(2)}`} />
                    <div className="tf-pl-divider" />
                    <PlRow label="Net P&L"      value={`₹${liveCalc.net.toFixed(2)}`}    colored={liveCalc.isProfit} bold />
                    <PlRow label="Capital Used" value={`₹${liveCalc.invested.toFixed(2)}`} />
                  </div>
                </>
              ) : (
                <div className="tf-pl-empty">
                  <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🧮</div>
                  <p>Enter Buy Price, Sell Price &amp; Quantity to see live P&amp;L</p>
                </div>
              )}
            </div>

            {/* Trade Summary Panel */}
            <div className="tf-panel tf-summary-panel">
              <div className="tf-panel-title">🗂️ Trade Summary</div>
              <SummaryRow label="Stock"      value={formData.stockName || '—'} upper />
              <SummaryRow label="Type"       value={formData.tradeType === 'intraday' ? '⚡ Intraday' : '📦 Delivery'} />
              <SummaryRow label="Buy Date"   value={formData.buyDate   || '—'} />
              {!isIntraday && <SummaryRow label="Sell Date" value={formData.sellDate || 'Still Holding'} />}
              <SummaryRow label="Qty"        value={formData.quantity  || '—'} />
              <SummaryRow label="Mistakes"   value={formData.mistakesMade.length ? formData.mistakesMade.join(', ') : 'None selected'} wrap />
            </div>

            {/* Checklist */}
            <div className="tf-panel tf-checklist-panel">
              <div className="tf-panel-title">✅ Pre-Save Checklist</div>
              {[
                { label: 'Stock name filled',       ok: !!formData.stockName },
                { label: 'Buy price entered',        ok: !!formData.buyPrice },
                { label: 'Quantity entered',         ok: !!formData.quantity },
                { label: 'Buy date set',             ok: !!formData.buyDate },
                { label: 'Mistake(s) selected',      ok: formData.mistakesMade.length > 0 },
                { label: isIntraday ? 'Sell price (intraday)' : 'Trade type set',
                  ok: isIntraday ? !!formData.sellPrice : true },
              ].map(({ label, ok }) => (
                <div key={label} className={`tf-check-item ${ok ? 'ok' : 'pending'}`}>
                  <span className="tf-check-dot">{ok ? '✓' : '○'}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

          </div>{/* end tf-right */}

        </div>{/* end tf-body */}
      </div>{/* end tf-card */}
    </>
  );
};

/* ─── Sub-components ─── */
const SectionLabel = ({ step, title, icon, required, badge, hint }) => (
  <div className="tf-section-label">
    <span className="tf-step-num">{step}</span>
    <span className="tf-step-icon">{icon}</span>
    <span className="tf-step-title">{title}{required && <span style={{ color: 'var(--loss)', marginLeft: 3 }}>*</span>}</span>
    {hint && <span className="tf-step-hint">{hint}</span>}
    {badge && <span className="tf-step-badge">{badge}</span>}
  </div>
);

const Field = ({ label, required, hint, children }) => (
  <div className="tf-field">
    <label className="tf-label">
      {label}{required && <span style={{ color: 'var(--loss)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <span className="tf-field-hint">{hint}</span>}
  </div>
);

const PlRow = ({ label, value, colored, bold }) => (
  <div className="tf-pl-row">
    <span className="tf-pl-label">{label}</span>
    <span className={`tf-pl-value ${colored !== undefined ? (colored ? 'profit' : 'loss') : ''} ${bold ? 'bold' : ''}`}>
      {value}
    </span>
  </div>
);

const SummaryRow = ({ label, value, upper, wrap }) => (
  <div className="tf-summary-row">
    <span className="tf-sum-label">{label}</span>
    <span className={`tf-sum-value ${upper ? 'upper' : ''} ${wrap ? 'wrap' : ''}`}>{value}</span>
  </div>
);

/* ─── Scoped CSS ─── */
const CSS = `
/* ── Card shell ── */
.tf-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  font-family: Inter, sans-serif;
}

/* ── Header ── */
.tf-header {
  background: var(--accent-grad);
  padding: 22px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.tf-header-icon {
  width: 50px; height: 50px;
  border-radius: 14px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}
.tf-header-title {
  margin: 0; font-size: 1.2rem; font-weight: 800; color: #fff;
  letter-spacing: -0.3px;
}
.tf-header-sub {
  margin: 3px 0 0; font-size: 0.78rem; color: rgba(255,255,255,0.75);
}

/* ── Trade type toggle ── */
.tf-type-toggle {
  margin-left: auto;
  display: flex;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
  border: 1px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
}
.tf-type-btn {
  padding: 7px 14px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.75);
  font-size: 0.8rem; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: Inter, sans-serif;
  white-space: nowrap;
}
.tf-type-btn.active {
  background: rgba(255,255,255,0.95);
  color: var(--accent);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* ── Two-column body ── */
.tf-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
}
.tf-left {
  padding: 28px 28px 28px 28px;
  border-right: 1px solid var(--border-color);
}
.tf-right {
  padding: 24px 20px;
  background: var(--bg-surface2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

/* ── Section labels ── */
.tf-section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.tf-section-label:first-of-type { margin-top: 0; }
.tf-step-num {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--accent-grad);
  color: #fff;
  font-size: 0.68rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tf-step-icon { font-size: 1rem; }
.tf-step-title { font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
.tf-step-hint  { font-size: 0.75rem; color: var(--text-muted); margin-left: 2px; }
.tf-step-badge {
  background: var(--accent-grad);
  color: white;
  font-size: 0.68rem; font-weight: 700;
  padding: 2px 9px;
  border-radius: 20px;
  margin-left: 4px;
}

/* ── Grid rows ── */
.tf-row-1 { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 0; }
.tf-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 0; }
.tf-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 0; }

/* ── Field ── */
.tf-field { display: flex; flex-direction: column; gap: 6px; }
.tf-label {
  font-size: 0.74rem; font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.6px;
}
.tf-field-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; }

/* ── Inputs ── */
.tf-input {
  width: 100%;
  background: var(--input-bg);
  border: 1.5px solid var(--input-border);
  border-radius: 10px;
  color: var(--text-primary);
  padding: 11px 14px;
  font-size: 0.88rem;
  font-family: Inter, sans-serif;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  appearance: none;
  -webkit-appearance: none;
}
.tf-input:hover  { border-color: var(--border-accent); }
.tf-input:focus  {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px var(--input-focus) !important;
  background: var(--bg-surface) !important;
}
.tf-input::placeholder { color: var(--text-muted); }
.tf-input option { background: var(--bg-surface2); color: var(--text-primary); }

/* prefix wrapper */
.tf-input-prefix-wrap { position: relative; }
.tf-prefix {
  position: absolute; left: 13px; top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem; color: var(--text-muted);
  font-weight: 600; pointer-events: none;
  z-index: 1;
}
.tf-input-prefix { padding-left: 28px; }

/* textarea */
.tf-textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.6;
}

/* ── Mistakes grid ── */
.tf-mistakes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.tf-mistake-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 24px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-surface2);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: Inter, sans-serif;
}
.tf-mistake-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-surface);
  transform: translateY(-1px);
}
.tf-mistake-pill.checked {
  border-color: var(--accent);
  background: var(--accent-glow);
  color: var(--accent);
  font-weight: 700;
  box-shadow: 0 2px 8px var(--accent-glow);
}
.tf-mistake-pill.checked-green {
  border-color: var(--profit);
  background: var(--profit-bg);
  color: var(--profit);
  font-weight: 700;
}
.tf-pill-icon { font-size: 0.9rem; }

/* ── Actions ── */
.tf-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.tf-btn-reset {
  flex: 1;
  padding: 13px;
  background: transparent;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 0.88rem; font-weight: 600;
  cursor: pointer;
  font-family: Inter, sans-serif;
  transition: all 0.2s;
}
.tf-btn-reset:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-glow);
}
.tf-btn-save {
  flex: 2.5;
  padding: 13px 24px;
  background: var(--accent-grad);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 0.92rem; font-weight: 700;
  cursor: pointer;
  font-family: Inter, sans-serif;
  box-shadow: 0 4px 16px var(--accent-glow);
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.tf-btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-glow);
}
.tf-btn-save:disabled { cursor: not-allowed; }

/* ── Spinner ── */
.tf-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: tf-spin 0.7s linear infinite;
}
@keyframes tf-spin { to { transform: rotate(360deg); } }

/* ── Error / Success ── */
.tf-error {
  background: var(--loss-bg);
  border: 1px solid var(--loss);
  border-radius: 10px;
  color: var(--loss);
  padding: 11px 16px;
  margin-bottom: 18px;
  font-size: 0.84rem;
  display: flex; align-items: center; gap: 8px;
}
.tf-toast-success {
  background: var(--profit-bg);
  border: 1px solid var(--profit);
  border-radius: 10px;
  color: var(--profit);
  padding: 11px 16px;
  margin-bottom: 18px;
  font-size: 0.84rem;
  font-weight: 600;
  animation: fadeInUp 0.3s ease;
}

/* ── Right panels ── */
.tf-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
}
.tf-panel-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

/* Live P&L */
.tf-pl-big {
  font-size: 2rem; font-weight: 800;
  text-align: center;
  line-height: 1;
  margin-bottom: 4px;
}
.tf-pl-pct {
  text-align: center;
  font-size: 0.9rem; font-weight: 700;
  margin-bottom: 14px;
}
.tf-pl-big.profit, .tf-pl-pct.profit { color: var(--profit); }
.tf-pl-big.loss,   .tf-pl-pct.loss   { color: var(--loss); }

.tf-pl-rows { display: flex; flex-direction: column; gap: 8px; }
.tf-pl-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.8rem;
}
.tf-pl-label  { color: var(--text-secondary); }
.tf-pl-value  { color: var(--text-primary); font-weight: 600; }
.tf-pl-value.profit { color: var(--profit); }
.tf-pl-value.loss   { color: var(--loss); }
.tf-pl-value.bold   { font-weight: 800; font-size: 0.9rem; }
.tf-pl-divider { height: 1px; background: var(--border-color); margin: 4px 0; }

.tf-pl-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 12px 0;
  line-height: 1.5;
}

/* Summary */
.tf-summary-row {
  display: flex; justify-content: space-between;
  align-items: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
  gap: 8px;
  font-size: 0.78rem;
}
.tf-summary-row:last-child { border-bottom: none; }
.tf-sum-label { color: var(--text-muted); flex-shrink: 0; }
.tf-sum-value { color: var(--text-primary); font-weight: 600; text-align: right; }
.tf-sum-value.upper { text-transform: uppercase; letter-spacing: 0.5px; }
.tf-sum-value.wrap  { word-break: break-word; font-size: 0.72rem; font-weight: 500; }

/* Checklist */
.tf-check-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0;
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
}
.tf-check-item:last-child { border-bottom: none; }
.tf-check-item.ok      { color: var(--profit); }
.tf-check-item.pending { color: var(--text-muted); }
.tf-check-dot {
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 800;
  flex-shrink: 0;
}
.tf-check-item.ok .tf-check-dot      { background: var(--profit-bg); color: var(--profit); }
.tf-check-item.pending .tf-check-dot { background: var(--bg-surface2); color: var(--text-muted); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .tf-body { grid-template-columns: 1fr; }
  .tf-right { border-top: 1px solid var(--border-color); }
  .tf-left  { border-right: none; padding: 20px 16px; }
}
@media (max-width: 600px) {
  .tf-row-2, .tf-row-3 { grid-template-columns: 1fr; }
  .tf-header { padding: 18px 16px; }
  .tf-type-toggle { margin-left: 0; width: 100%; }
}
`;

export default TradeForm;