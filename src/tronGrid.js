'use strict';

const https = require('https');
const { USDT_TRC20_CONTRACT } = require('./filter');

function getJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'stablepay-tron-monitor/0.1', ...headers } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function fetchUsdtTransfers(address, options = {}) {
  const limit = Number(options.limit || 50);
  const params = new URLSearchParams({
    only_confirmed: 'true',
    limit: String(limit),
    contract_address: USDT_TRC20_CONTRACT
  });
  const url = `https://api.trongrid.io/v1/accounts/${encodeURIComponent(address)}/transactions/trc20?${params}`;
  const headers = options.apiKey ? { 'TRON-PRO-API-KEY': options.apiKey } : {};
  const json = await getJson(url, headers);
  return json.data || [];
}

module.exports = { fetchUsdtTransfers, getJson };
