'use strict';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderDashboard({ address, events, lastError, updatedAt }) {
  const rows = events.map((event) => `
    <tr>
      <td>${escapeHtml(new Date(event.timestamp || Date.now()).toLocaleString())}</td>
      <td><strong>${escapeHtml(event.amount)} ${escapeHtml(event.symbol)}</strong></td>
      <td><code>${escapeHtml(event.from)}</code></td>
      <td><a href="${escapeHtml(event.explorerUrl || '#')}" target="_blank" rel="noreferrer">${escapeHtml(event.txid)}</a></td>
    </tr>`).join('');
  const statusClass = lastError ? 'bad' : 'good';
  const statusText = lastError ? `Error: ${lastError}` : 'Live';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>StablePay TRON Monitor</title>
<style>
:root{color-scheme:dark;--bg:#08111f;--card:#101a2c;--line:#28405f;--text:#e5eefb;--muted:#95a3b8;--cyan:#7dd3fc;--green:#86efac;--red:#fca5a5}
*{box-sizing:border-box}body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:radial-gradient(circle at top right,#123b3d,var(--bg) 46%);color:var(--text)}
main{max-width:1120px;margin:0 auto;padding:36px 20px 56px}.hero{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:24px}.card{background:rgba(16,26,44,.9);border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.18)}
h1{font-size:clamp(32px,5vw,58px);line-height:1;margin:0 0 12px}.subtitle{color:var(--muted);font-size:18px;max-width:740px}.pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;padding:7px 12px;color:var(--cyan);font-weight:700}.status.good{color:var(--green)}.status.bad{color:var(--red)}
.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}.metric strong{display:block;font-size:26px;margin-top:6px}.muted{color:var(--muted)}code{color:#a7f3d0;word-break:break-all}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid var(--line);padding:12px;text-align:left}th{color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em}a{color:var(--cyan)}@media(max-width:760px){.hero,.grid{display:block}.card{margin-bottom:14px}}
</style>
</head>
<body>
<main>
  <section class="hero">
    <div>
      <div class="pill">USDT-TRC20 payment ops</div>
      <h1>StablePay Monitor</h1>
      <p class="subtitle">Track incoming stablecoin payments, expose a JSON API, and trigger webhooks for order or invoice workflows without handling private keys.</p>
    </div>
    <div class="card"><strong>Status</strong><div class="status ${statusClass}">${escapeHtml(statusText)}</div><div class="muted">Updated: ${escapeHtml(updatedAt || 'not yet')}</div></div>
  </section>

  <section class="grid">
    <div class="card metric"><span class="muted">Receiving wallet</span><strong><code>${escapeHtml(address)}</code></strong></div>
    <div class="card metric"><span class="muted">Matched payments</span><strong>${events.length}</strong></div>
    <div class="card metric"><span class="muted">API endpoint</span><strong><a href="/api/transfers">/api/transfers</a></strong></div>
  </section>

  <section class="card">
    <h2>Recent incoming payments</h2>
    <table><thead><tr><th>Time</th><th>Amount</th><th>From</th><th>Tx</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No matching payments yet.</td></tr>'}</tbody></table>
  </section>
</main>
</body>
</html>`;
}

module.exports = { escapeHtml, renderDashboard };
