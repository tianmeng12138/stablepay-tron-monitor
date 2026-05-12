'use strict';

const http = require('http');
const { fetchUsdtTransfers } = require('./tronGrid');
const { decimalToRaw, filterIncomingUsdt } = require('./filter');

function env(name, fallback) {
  return process.env[name] || fallback;
}

function loadDemoTransfers(address) {
  return [
    {
      transaction_id: 'demo-tx-001',
      from: 'TFromDemo1111111111111111111111111111',
      to: address,
      value: '125000000',
      block_timestamp: Date.now(),
      token_info: { address: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', symbol: 'USDT', decimals: 6 }
    }
  ];
}

async function postWebhook(url, event) {
  if (!url) return;
  const body = JSON.stringify(event);
  const target = new URL(url);
  const client = target.protocol === 'https:' ? require('https') : require('http');
  await new Promise((resolve, reject) => {
    const req = client.request(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      res.resume();
      res.on('end', resolve);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function renderDashboard(address, events) {
  const rows = events.map((event) => `
    <tr>
      <td>${new Date(event.timestamp || Date.now()).toLocaleString()}</td>
      <td>${event.amount} ${event.symbol}</td>
      <td><code>${event.from}</code></td>
      <td><a href="${event.explorerUrl || '#'}" target="_blank" rel="noreferrer">${event.txid}</a></td>
    </tr>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>StablePay TRON Monitor</title>
<style>
body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:32px;background:#0f172a;color:#e2e8f0}a{color:#67e8f9}.card{background:#111827;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:16px}code{color:#a7f3d0}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #334155;padding:10px;text-align:left}.pill{display:inline-block;background:#064e3b;color:#a7f3d0;padding:4px 10px;border-radius:999px}</style>
</head>
<body>
  <h1>StablePay TRON Monitor <span class="pill">USDT-TRC20</span></h1>
  <div class="card"><strong>Receiving address:</strong> <code>${address}</code></div>
  <div class="card">
    <h2>Recent incoming payments</h2>
    <table><thead><tr><th>Time</th><th>Amount</th><th>From</th><th>Tx</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No matching payments yet.</td></tr>'}</tbody></table>
  </div>
</body>
</html>`;
}

async function createApp() {
  const demo = process.argv.includes('--demo');
  const address = env('TRON_ADDRESS', demo ? 'TDemoReceiver1111111111111111111111111' : '');
  if (!address) throw new Error('Set TRON_ADDRESS first. See .env.example.');
  const apiKey = env('TRONGRID_API_KEY', '');
  const webhookUrl = env('WEBHOOK_URL', '');
  const minRaw = decimalToRaw(env('MIN_AMOUNT', '0'));
  const seen = new Set();
  let cache = [];
  let lastError = null;

  async function refresh() {
    try {
      const raw = demo ? loadDemoTransfers(address) : await fetchUsdtTransfers(address, { apiKey, limit: 50 });
      const events = filterIncomingUsdt(raw, address, minRaw);
      cache = events;
      lastError = null;
      for (const event of events) {
        if (!seen.has(event.txid)) {
          seen.add(event.txid);
          await postWebhook(webhookUrl, event).catch((error) => {
            lastError = `Webhook error: ${error.message}`;
          });
        }
      }
    } catch (error) {
      lastError = error.message;
    }
  }

  await refresh();
  const interval = Math.max(10, Number(env('POLL_SECONDS', '30'))) * 1000;
  setInterval(refresh, interval).unref();

  return http.createServer((req, res) => {
    if (req.url === '/health') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: !lastError, lastError }));
      return;
    }
    if (req.url === '/api/transfers') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ address, transfers: cache, lastError }, null, 2));
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderDashboard(address, cache));
  });
}

if (require.main === module) {
  createApp().then((server) => {
    const port = Number(env('PORT', '8787'));
    server.listen(port, () => {
      console.log(`StablePay TRON Monitor running on http://localhost:${port}`);
    });
  }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { createApp, renderDashboard };
