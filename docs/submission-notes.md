# Submission notes

## Positioning

**Vision:** Find and trade mispriced DreamDEX Event Contracts with quantitative intelligence.

**Project detail:** EventLens is a quantitative intelligence layer for DreamDEX Event Contracts. It detects probability dislocations between market prices and independent fair-value estimates, analyzes order-book imbalance, momentum, volatility, and cross-window relationships, then risk-gates executable opportunities. Users can analyze markets, execute trades, and replay settlement outcomes through one focused trading terminal.

## What must be true before final submission

1. Vercel frontend points to the deployed API.
2. API starts in LIVE mode on Shannon with the current DreamDEX SDK.
3. A dedicated testnet wallet is used; private key never enters the frontend.
4. One small IOC testnet transaction is completed and the hash is captured.
5. Calibration endpoint returns real finalized-market evidence, or the UI clearly states evidence is unavailable.
6. Demo video uses the LIVE path when live evidence is available, otherwise clearly labels DEMO.

## Current integration facts

DreamDEX's developer docs use `@somnia-chain/markets-sdk`, recommend 0.28.0 or newer, and show live onchain status checks plus IOC execution for takers. Pools are recycled, so EventLens keys state by `marketId`.
