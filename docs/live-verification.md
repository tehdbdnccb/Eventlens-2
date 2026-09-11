# Live Shannon verification

EventLens supports two runtime modes behind the API.

## Demo

`DEMO_MODE=true`

Uses deterministic market/order-book fixtures and simulated fills. The UI labels this as DEMO DATA and DEMO / REPLAY. Historical calibration is intentionally not fabricated in demo mode.

## Live

Set:

```env
DEMO_MODE=false
SOMNIA_NETWORK=shannon
# Leave these blank to use the network-specific SDK defaults.
# Shannon: https://dev.smk.somnia.host/v1/graphql + wss://api.infra.testnet.somnia.network/ws
# Mainnet: https://prd.smk.somnia.host/v1/graphql + wss://api.infra.mainnet.somnia.network/ws
SOMNIA_INDEXER_URL=
SOMNIA_WS_RPC_URL=
SOMNIA_PRIVATE_KEY=0x...
```

The private key stays on the API server. The adapter discovers binary Event Contracts from the SDK, reads the live order book, checks the current on-chain market status before writing, and sends taker orders as IOC orders. Per-market state is keyed by `marketId`.

For a live execution demo, use a dedicated testnet wallet funded only with testnet collateral. The API never returns the private key to the frontend.

## Calibration

`GET /calibration` queries finalized BTC/ETH Event Contracts and uses a pre-expiry spot candle plus the EventLens fair-value model to create out-of-sample binary forecasts. It reports sample size, Brier score, mean predicted probability, observed Up rate, and calibration error.

The calibration result is marked `available=false` until at least 10 usable finalized markets are available. No synthetic performance number is presented as historical evidence.

## Suggested demo proof

1. Start the API in LIVE mode.
2. Open the Vercel frontend with `VITE_API_URL` pointing at the live API.
3. Show `LIVE DATA` and `LIVE / SERVER WALLET` in the sidebar.
4. Select a live market and open its order book.
5. Show market probability, model fair value, edge, OBI, score and risk status.
6. Execute a small IOC testnet order only after the UI shows risk PASS.
7. Record the resulting transaction hash in the demo video.
8. Open Trade Replay and show the signal → risk → fill sequence.
9. Open calibration and show the measured historical metrics when available.
