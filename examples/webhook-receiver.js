'use strict';

const http = require('http');

const port = Number(process.env.PORT || 9090);

http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 404;
    res.end('not found');
    return;
  }

  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    console.log('Payment webhook received:');
    console.log(body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  });
}).listen(port, () => {
  console.log(`Webhook receiver listening on http://localhost:${port}`);
});
