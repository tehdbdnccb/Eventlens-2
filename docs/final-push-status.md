# Final push verification status

## Completed in this workspace

- Command Center now preflights risk status before execution.
- Risk gates are visible per trade: trading, time, edge, confidence, size, exposure, liquidity, slippage.
- Demo and live execution are explicitly separated.
- Live mode without a server signer is read-only; the execute action is disabled.
- Demo fixtures contain one deliberately obvious, clearly labeled strong signal for a clean judge demo.
- Demo mode reports no live P&L and does not present synthetic calibration performance as historical evidence.
- Shannon/mainnet DreamDEX indexer and WebSocket defaults are selected from `SOMNIA_NETWORK`.
- Historical calibration uses finalized Event Contracts and market-window-scoped candles in live mode.
- Submission/demo runbook added under `docs/`.

## Verified here

- TypeScript syntax/transpile checks pass for the modified web, API, demo, and DreamDEX adapter files.
- ZIP integrity is checked after packaging.

## Must be verified on a machine with npm network access

- `npm install`
- `npm run check`
- Vite production bundle
- Live Shannon market discovery
- One small IOC testnet execution with the dedicated testnet signer
- Real transaction hash and, where available, finalized calibration metrics

The workspace does not have the external npm registry connectivity needed to honestly claim those live-network and browser-build checks were executed here.
