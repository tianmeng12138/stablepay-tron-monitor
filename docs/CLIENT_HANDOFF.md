# Client Handoff Notes

## What the client gets

- A hosted dashboard for recent incoming USDT-TRC20 payments.
- A JSON endpoint for internal tools or bots.
- Optional webhooks for order fulfillment, invoice matching, or alerts.
- Clear setup notes that do not require private keys.

## Deployment checklist

1. Create a receiving wallet address dedicated to the product or invoice flow.
2. Set `TRON_ADDRESS` and optional `TRONGRID_API_KEY`.
3. Set `WEBHOOK_URL` if another system should receive payment events.
4. Run the app with Node.js or Docker.
5. Verify `/health` and `/api/transfers`.

## Security boundaries

- This monitor is read-only.
- Do not store private keys, seed phrases, withdrawal keys, or exchange passwords.
- Use a separate webhook secret or allowlist at the receiver if the workflow needs stronger authentication.
