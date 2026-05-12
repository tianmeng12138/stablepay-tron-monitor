# API Reference

## `GET /health`

Returns service health and the latest polling status.

```json
{
  "ok": true,
  "lastError": null,
  "updatedAt": "2026-05-12T00:00:00.000Z"
}
```

## `GET /api/transfers`

Returns the currently cached matching USDT-TRC20 transfers.

```json
{
  "address": "T...",
  "transfers": [
    {
      "txid": "...",
      "from": "T...",
      "to": "T...",
      "symbol": "USDT",
      "amount": "125.5",
      "rawAmount": "125500000",
      "timestamp": 1710000000000,
      "confirmed": true,
      "matchesReceiver": true,
      "explorerUrl": "https://tronscan.org/#/transaction/..."
    }
  ],
  "lastError": null,
  "updatedAt": "2026-05-12T00:00:00.000Z"
}
```

## Webhook

Set `WEBHOOK_URL` to receive a `POST` for each newly observed transaction id.
The app never sends private keys or secrets because it only reads public chain data.
