'use strict';

const http = require('http');
const { loadConfig } = require('./config');
const { renderDashboard } = require('./dashboard');
const { loadDemoTransfers } = require('./demoData');
const { filterIncomingUsdt } = require('./filter');
const { createMemoryStore } = require('./store');
const { fetchUsdtTransfers } = require('./tronGrid');
const { postWebhook } = require('./webhook');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}

async function createApp(config = loadConfig()) {
  const store = createMemoryStore();

  async function refresh() {
    try {
      const raw = config.demo
        ? loadDemoTransfers(config.address)
        : await fetchUsdtTransfers(config.address, { apiKey: config.apiKey, limit: config.fetchLimit });
      const events = filterIncomingUsdt(raw, config.address, config.minRaw);
      store.replace(events);
      store.setError(null);

      for (const event of events) {
        if (store.markSeen(event.txid)) {
          await postWebhook(config.webhookUrl, event).catch((error) => {
            store.setError(error);
          });
        }
      }
    } catch (error) {
      store.setError(error);
    }
  }

  await refresh();
  setInterval(refresh, config.pollMs).unref();

  return http.createServer((req, res) => {
    const state = store.snapshot();

    if (req.url === '/health') {
      sendJson(res, state.lastError ? 503 : 200, { ok: !state.lastError, lastError: state.lastError, updatedAt: state.updatedAt });
      return;
    }

    if (req.url === '/api/transfers') {
      sendJson(res, 200, { address: config.address, transfers: state.events, lastError: state.lastError, updatedAt: state.updatedAt });
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderDashboard({ address: config.address, events: state.events, lastError: state.lastError, updatedAt: state.updatedAt }));
  });
}

if (require.main === module) {
  createApp().then((server) => {
    const config = loadConfig();
    server.listen(config.port, () => {
      console.log(`StablePay TRON Monitor running on http://localhost:${config.port}`);
    });
  }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { createApp, sendJson };
