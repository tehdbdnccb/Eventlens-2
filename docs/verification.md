# Verification

## Static verification completed in the workspace

- Backend TypeScript verification with dependency stubs: PASS.
- Web TypeScript verification with dependency stubs: PASS.
- Quant package source verification: PASS.
- Risk package source verification: PASS.
- DreamDEX adapter source verification: PASS.
- ZIP integrity check: PASS.

## What was not possible here

The workspace does not have the external npm package installation path needed to run the complete production Vite bundle or a live Somnia transaction. The final artifact therefore includes both demo mode and a live Shannon adapter, but the live transaction path still needs to be verified from a machine with npm dependencies and a funded Shannon testnet execution wallet.

## Local verification

```bash
npm install
npm run check
npm run dev
node scripts/smoke.mjs
```

For live mode, configure `.env` from `.env.example`, restart the API, and verify `/health`, `/markets`, `/calibration`, `/trades/preview`, and a small IOC order on Shannon.
