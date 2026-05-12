'use strict';

async function postWebhook(url, event) {
  if (!url) return { skipped: true };

  const body = JSON.stringify(event);
  const target = new URL(url);
  const client = target.protocol === 'https:' ? require('https') : require('http');

  return new Promise((resolve, reject) => {
    const req = client.request(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'stablepay-tron-monitor/0.2'
      }
    }, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Webhook HTTP ${res.statusCode}: ${responseBody.slice(0, 200)}`));
          return;
        }
        resolve({ statusCode: res.statusCode });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { postWebhook };
