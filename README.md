# StablePay TRON Monitor

A minimal USDT-TRC20 payment monitor for freelancers, small merchants, and Web3 teams.
It watches a public TRON receiving address, shows recent incoming USDT transfers, and can send webhook notifications when a new payment arrives.

## Why this exists

Many small Web3 businesses accept USDT but still reconcile payments manually in Telegram, spreadsheets, or exchange screenshots. This repo provides a small, auditable starting point for:

- USDT invoice confirmation
- Merchant dashboards
- Telegram/Discord payment alerts
- Subscription or order fulfillment webhooks
- Freelance escrow/payment proof workflows

## Features

- Watches USDT-TRC20 transfers to a public TRON address
- No private key required
- Simple dashboard at `/`
- JSON API at `/api/transfers`
- Health check at `/health`
- Optional webhook for new payment events
- Zero runtime dependencies; works on Node.js 16+

## Quick start

```bash
cp .env.example .env
# edit TRON_ADDRESS in .env
set -a && . ./.env && set +a
npm start
```

Open `http://localhost:8787`.

Demo mode uses sample data:

```bash
npm run demo
```

## Configuration

```bash
TRON_ADDRESS=TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=8787
POLL_SECONDS=30
TRONGRID_API_KEY=
WEBHOOK_URL=
MIN_AMOUNT=0
```

Only use a public receiving address. Never put a wallet private key, seed phrase, exchange password, or withdrawal API key in this app.

## Webhook payload

```json
{
  "txid": "...",
  "from": "T...",
  "to": "T...",
  "contract": "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj",
  "symbol": "USDT",
  "amount": "125.5",
  "rawAmount": "125500000",
  "timestamp": 1710000000000,
  "confirmed": true,
  "matchesReceiver": true,
  "explorerUrl": "https://tronscan.org/#/transaction/..."
}
```

## Commercial extensions

This starter can be extended into paid client work:

- invoice generation with unique payment amounts
- Telegram/Discord notifications
- admin login and team roles
- order reconciliation against a database
- multi-chain support for USDC/USDT on Base, Polygon, Arbitrum, Solana, and Ethereum
- Stripe + crypto hybrid checkout
- accounting exports

## License

MIT
