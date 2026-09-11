# EventLens — final judge demo

## 120–150 seconds

**0:00 — Problem**

“DreamDEX Event Contracts already provide a live onchain probability market. The problem is finding where those probabilities disagree with quantitative fair value — and knowing whether the edge is actually executable.”

**0:15 — Discover**

Open Command Center. Show BTC/ETH across 15M and 60M windows. Point to the scanner’s Market, Fair, Edge, Confidence and Decision columns.

**0:35 — Explain the edge**

Select the strongest market. Show market probability, fair value, edge, OBI, momentum and cross-window structure. Open “Explain signal.”

Say: “The model is deterministic. AI only explains the evidence; it cannot override the quantitative or risk engine.”

**0:55 — Prove execution discipline**

Show spread, estimated slippage and every risk gate. Keep the order small. Only press Execute when the UI shows PASS.

**1:10 — Prove DreamDEX integration**

In LIVE Shannon mode, show the actual transaction hash after the IOC fill. The backend checks the onchain market status immediately before the write.

**1:30 — Prove learning / validation**

Open Historical Calibration. Show sample size, Brier score, observed Up rate and calibration error from finalized BTC/ETH Event Contracts. Do not show fabricated demo performance.

**1:45 — Close**

“EventLens is not another black-box prediction bot. It is the quantitative intelligence layer that scans the DreamDEX market surface, identifies dislocations, risk-gates execution, and leaves an auditable path from signal to settlement.”

## Evidence checklist

- LIVE DATA badge
- Somnia Shannon network
- Live order book
- Market vs fair value
- Edge + microstructure evidence
- Risk PASS
- IOC fill transaction hash
- Calibration metrics from finalized markets
- Public GitHub repository
