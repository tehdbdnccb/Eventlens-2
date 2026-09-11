import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, BrainCircuit, CheckCircle2, CircleDollarSign, Layers3, Play, RefreshCw, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { getCalibration, getMarket, getMarkets, getRuntime, previewTrade, executeTrade, explain, getTrades } from './lib/api';

const pct = (n: number | null | undefined) => n == null ? '—' : `${(n * 100).toFixed(1)}%`;
const money = (n: number | null | undefined) => n == null ? '—' : `$${n.toFixed(2)}`;
const num = (n: number | null | undefined, digits = 0) => n == null ? '—' : n.toFixed(digits);

type CheckMap = Record<string, boolean>;

export default function App() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState<any>();
  const [tab, setTab] = useState('command');
  const [qty, setQty] = useState(5);
  const [side, setSide] = useState<'UP' | 'DOWN'>('UP');
  const [trade, setTrade] = useState<any>();
  const [tradePreview, setTradePreview] = useState<any>();
  const [explanation, setExplanation] = useState('');
  const [runtime, setRuntime] = useState<any>({ mode: 'DEMO', wallet: 'Demo execution' });
  const [calibration, setCalibration] = useState<any>();
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const [m, r, c] = await Promise.all([getMarkets(), getRuntime(), getCalibration()]);
      setMarkets(m);
      setRuntime(r);
      setCalibration(c);
      const id = m.some((x: any) => x.marketId === selected) ? selected : (m[0]?.marketId ?? '');
      if (id) {
        setSelected(id);
        setDetail(await getMarket(id));
      }
    } catch (e: any) {
      setError(e?.message || 'Unable to reach EventLens API');
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [selected]);

  useEffect(() => {
    if (!selected || !detail) return;
    const run = async () => {
      try {
        const p = await previewTrade({ marketId: selected, side, quantity: qty, wallet: runtime.wallet });
        setTradePreview(p);
      } catch {
        setTradePreview(undefined);
      }
    };
    run();
  }, [selected, side, qty, detail?.signal?.score, runtime.wallet]);

  const strongest = useMemo<any>(() => [...markets].sort((a, b) => Math.abs((b.signal?.edge ?? 0)) - Math.abs((a.signal?.edge ?? 0)))[0], [markets]);
  const strongSignals = markets.filter(x => x.signal?.direction !== 'HOLD').length;
  const riskChecks: CheckMap = tradePreview?.checks ?? {};
  const isLive = runtime.mode === 'LIVE';
  const hasLiveExecutor = isLive && runtime.wallet === 'Server execution wallet';
  const allRiskPass = tradePreview?.ok === true;

  const execute = async () => {
    if (!selected || (isLive && !hasLiveExecutor)) return;
    try {
      const p = await previewTrade({ marketId: selected, side, quantity: qty, wallet: runtime.wallet });
      setTrade(p);
      if (p.ok) {
        setTrade({ ...p, ...await executeTrade({ marketId: selected, side, quantity: qty, wallet: runtime.wallet }) });
      }
    } catch (e: any) {
      setTrade({ ok: false, reasons: [e?.message || 'Execution failed'] });
    }
  };

  return <div className="app">
    <aside>
      <div className="brand"><div className="brandmark">EL</div><div><b>EventLens</b><span>DreamDEX intelligence</span></div></div>
      <nav>{[['command', 'Command Center', BarChart3], ['surface', 'Market Surface', Layers3], ['portfolio', 'Portfolio', Wallet], ['replay', 'Trade Replay', Play]].map(([id, label, I]: any) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><I size={17} />{label}</button>)}</nav>
      <div className="sidecard">
        <small>NETWORK</small><b><i /> Somnia Shannon</b>
        <small>MARKET DATA</small><b className="modegood"><i /> {isLive ? 'LIVE' : 'DEMO'}</b>
        <small>EXECUTION</small><b className="demo">● {isLive ? (hasLiveExecutor ? 'LIVE / SERVER WALLET' : 'READ-ONLY') : 'DEMO / REPLAY'}</b>
      </div>
    </aside>

    <main>
      <header>
        <div><small>QUANTITATIVE EVENT CONTRACT INTELLIGENCE</small><h1>{tab === 'command' ? 'Command Center' : tab === 'surface' ? 'Market Surface' : tab === 'portfolio' ? 'Portfolio' : 'Trade Replay'}</h1></div>
        <div className="actions"><span className="live"><i /> {isLive ? 'LIVE DATA' : 'DEMO DATA'}</span><button onClick={load}><RefreshCw size={15} /> Refresh</button><button className="wallet"><Wallet size={15} /> {runtime.wallet || 'Execution wallet'}</button></div>
      </header>

      {error && <div className="errorbar">API unavailable: {error}</div>}

      {tab === 'command' && <>
        <div className="metrics">
          <Metric t={isLive ? "LIVE MARKETS" : "ACTIVE MARKETS"} v={String(markets.length)} I={Activity} />
          <Metric t="STRONG SIGNALS" v={String(strongSignals)} I={Zap} />
          <Metric t="OPEN EXPOSURE" v="$0.00" I={ShieldCheck} />
          <Metric t="REALIZED P&L" v="$0.00" I={CircleDollarSign} sub={isLive ? "No settled fills yet" : "Demo mode · no live P&L"} />
        </div>

        <section className="panel calibration">
          <div className="calcopy"><small className="eyebrow">MODEL VALIDATION</small><h2>Historical calibration</h2><p>{calibration?.available ? calibration.source : 'Demo mode does not fabricate model performance; live mode evaluates finalized BTC/ETH Event Contracts.'}</p></div>
          {calibration?.available ? <div className="calgrid">
            <Stat label="SAMPLES" value={String(calibration.sampleSize ?? 0)} />
            <Stat label="BRIER SCORE" value={num(calibration.brierScore, 3)} />
            <Stat label="MEAN PREDICTED" value={pct(calibration.meanPredicted)} />
            <Stat label="OBSERVED UP" value={pct(calibration.observedRate)} />
            <Stat label="CALIBRATION ERROR" value={pct(calibration.calibrationError)} />
          </div> : <div className="calpending"><ShieldCheck size={18} /><span>Calibration is evidence-driven: finalized onchain markets are used in LIVE mode; no synthetic backtest headline is shown.</span></div>}
        </section>

        <div className="grid">
          <section className="panel wide">
            <Head t="Market Scanner" s="Ranked by probability dislocation" badge={strongest ? `TOP EDGE ${pct(Math.abs(strongest.signal?.edge ?? 0))}` : '—'} />
            <div className="tablehead"><span>MARKET</span><span>MARKET</span><span>FAIR</span><span>EDGE</span><span>CONF</span><span>DECISION</span></div>
            {markets.map(m => <button className={'marketrow ' + (selected === m.marketId ? 'sel' : '')} key={m.marketId} onClick={() => setSelected(m.marketId)}>
              <strong>{m.asset}<span>{(m.intervalSeconds ?? 0) / 60}M</span></strong>
              <div><b>{pct(m.upPrice)}</b></div><div><b>{pct(m.signal?.modelProbability)}</b></div>
              <div><b className={(m.signal?.edge ?? 0) >= 0 ? 'pos' : 'neg'}>{(m.signal?.edge ?? 0) >= 0 ? '+' : ''}{pct(m.signal?.edge)}</b></div>
              <div><b>{num(m.signal?.confidence, 0)}</b></div>
              <em className={(m.signal?.direction ?? 'HOLD').toLowerCase()}>{m.signal?.direction === 'HOLD' ? 'HOLD' : 'BUY ' + m.signal?.direction}</em>
            </button>)}
          </section>

          <section className="panel">
            {detail && <>
              <Head t="Signal Engine" s="Deterministic model + microstructure" badge={`SCORE ${num(detail.signal?.score ? detail.signal.score * 100 : 0, 1)}`} />
              <div className="signalhero"><div><small>RECOMMENDATION</small><h2 className={(detail.signal?.direction ?? 'HOLD').toLowerCase()}>{detail.signal?.direction === 'HOLD' ? 'HOLD' : 'BUY ' + detail.signal?.direction}</h2></div><b>{num(detail.signal?.confidence, 0)}<small> CONFIDENCE</small></b></div>
              <div className="kv"><span>Market probability<b>{pct(detail.signal?.marketProbability)}</b></span><span>Model fair value<b>{pct(detail.signal?.modelProbability)}</b></span><span>Edge<b className={(detail.signal?.edge ?? 0) >= 0 ? 'pos' : 'neg'}>{(detail.signal?.edge ?? 0) >= 0 ? '+' : ''}{pct(detail.signal?.edge)}</b></span><span>OBI<b>{pct(detail.signal?.obi)}</b></span></div>
              <div className="decision"><span>DECISION ENGINE</span><b>{detail.signal?.direction === 'HOLD' ? 'Edge detected · composite score below threshold' : 'Threshold passed · candidate trade'}</b><small>Score {num(detail.signal?.score, 3)} · trigger ±0.20</small>{detail.signal?.direction === 'HOLD' && Math.abs(detail.signal?.edge ?? 0) >= 0.03 && <small className="decisionnote">Risk is evaluated separately from the signal. HOLD means the composite signal has not triggered execution.</small>}</div>
              <button className="explain" onClick={async () => setExplanation((await explain(detail.signal)).text)}><BrainCircuit size={15} /> Explain signal</button>
              {explanation && <p className="explanation">{explanation}</p>}
            </>}
          </section>
        </div>

        <div className="grid">
          <section className="panel wide">
            <Head t={`Market Detail · ${selected || '—'}`} s="Market probability vs independent fair value" badge={detail?.status || '—'} />
            <div className="detail"><div className="probchart"><div className="marketbar" style={{ width: `${(detail?.upPrice ?? 0) * 100}%` }}><span>MARKET {detail && pct(detail.upPrice)}</span></div><div className="modelbar" style={{ width: `${(detail?.signal?.modelProbability ?? 0) * 100}%` }}><span>MODEL {detail && pct(detail.signal?.modelProbability)}</span></div></div>
              <div className="book"><b>ORDER BOOK</b>{detail?.orderbook?.asks?.map((x: any) => <p key={'a' + x.price}><span>ASK</span><b>{pct(x.price)}</b><span>{x.quantity}</span></p>)}<hr />{detail?.orderbook?.bids?.map((x: any) => <p key={'b' + x.price}><span>BID</span><b>{pct(x.price)}</b><span>{x.quantity}</span></p>)}{detail?.orderbook?.asks?.[0] && detail?.orderbook?.bids?.[0] && <div className="spread">SPREAD <b>{pct((detail.orderbook.asks[0].price ?? 0) - (detail.orderbook.bids[0].price ?? 0))}</b></div>}</div>
            </div>
          </section>

          <section className="panel"><Head t="Execute" s={`${isLive ? (hasLiveExecutor ? 'IOC · risk-gated · onchain' : 'Read-only · signer required') : 'IOC · risk-gated · simulated'}`} />
            <div className="toggle"><button className={side === 'UP' ? 'chosen' : ''} onClick={() => setSide('UP')}>UP {detail && pct(detail.upPrice)}</button><button className={side === 'DOWN' ? 'chosen down' : ''} onClick={() => setSide('DOWN')}>DOWN {detail && pct(detail.downPrice)}</button></div>
            <label>CONTRACTS<input type="number" min="1" max="10" value={qty} onChange={(e: any) => setQty(Math.max(1, Math.min(10, Number(e.target.value))))} /></label>
            <div className="tradefacts"><span>MAX COST</span><b>{money(tradePreview?.cost ?? (((side === 'UP' ? detail?.upPrice : detail?.downPrice) ?? 0) * qty))}</b><span>MAX PAYOUT</span><b>{money(qty)}</b><span>EST. SLIPPAGE</span><b>{pct(tradePreview?.slippage)}</b><span>RISK STATUS</span><b className={allRiskPass ? 'pos' : tradePreview ? 'neg' : ''}>{tradePreview ? (allRiskPass ? 'PASS' : 'BLOCKED') : 'CHECKING'}</b></div>
            <div className="riskchecks">{Object.entries(riskChecks).map(([k, v]) => <span key={k} className={v ? 'pass' : 'fail'}>{v ? '✓' : '×'} {k}</span>)}</div>
            <button className="execute" disabled={isLive && !hasLiveExecutor || !allRiskPass} onClick={execute}><Zap size={16} /> {isLive && !hasLiveExecutor ? 'Connect server signer' : allRiskPass ? `Execute ${side}` : 'Risk gate blocked'}</button>
            {isLive && !hasLiveExecutor && <div className="signernote">Live market data is enabled. Execution remains read-only until <code>SOMNIA_PRIVATE_KEY</code> is configured on the API server.</div>}
            {trade && <div className={trade.ok ? 'result ok' : 'result bad'}>{trade.ok ? <><CheckCircle2 size={15} /> {trade.trade ? (isLive ? 'Confirmed · ' : 'Simulated fill · ') + trade.trade.txHash : 'Risk preview passed'}</> : <>Blocked: {trade.reasons?.join(', ')}</>}</div>}
          </section>
        </div>
      </>}
      {tab === 'surface' && <Surface markets={markets} />}
      {tab === 'portfolio' && <Portfolio />}
      {tab === 'replay' && <Replay />}
    </main>
  </div>;
}

function Metric({ t, v, I, sub }: any) { return <div className="metric"><I size={17} /><small>{t}</small><b>{v}</b>{sub && <span>{sub}</span>}</div>; }
function Stat({ label, value }: { label: string; value: string }) { return <span><small>{label}</small><b>{value}</b></span>; }
function Head({ t, s, badge }: { t: string; s: string; badge?: string }) { return <div className="head"><div><h2>{t}</h2><p>{s}</p></div>{badge && <span className="badge">{badge}</span>}</div>; }
function Surface({ markets }: any) { return <div className="surface">{markets.map((m: any) => <section className="panel" key={m.marketId}><Head t={`${m.asset} · ${(m.intervalSeconds ?? 0) / 60}M`} s="Probability surface" badge={`EDGE ${pct(m.signal?.edge)}`} /><div className="bar"><span>MARKET</span><i style={{ width: `${(m.upPrice ?? 0) * 100}%` }} /><b>{pct(m.upPrice)}</b></div><div className="bar"><span>MODEL</span><i style={{ width: `${(m.signal?.modelProbability ?? 0) * 100}%` }} /><b>{pct(m.signal?.modelProbability)}</b></div><footer>OBI {pct(m.signal?.obi)} · VOL {num(m.signal?.volatility, 2)} · SCORE {num(m.signal?.score ? m.signal.score * 100 : 0, 1)} · CONF {num(m.signal?.confidence, 0)}</footer></section>)}</div>; }
function Portfolio() { const [t, setT] = useState<any[]>([]); useEffect(() => { getTrades().then(setT).catch(() => setT([])); }, []); return <div className="panel"><Head t="Portfolio" s="Onchain-ready positions and P&L" />{t.length ? <>{t.map(x => <div className="tradeitem" key={x.id}><b>{x.marketId} · {x.side}</b><span>{x.quantity} contracts @ {pct(x.executionPrice)} · P&L {money(x.pnl)}</span></div>)}</> : <div className="empty"><Wallet size={32} /><h2>No live positions</h2><p>Execute a signal to populate this view.</p></div>}</div>; }
function Replay() { return <div className="panel"><Head t="Trade Replay" s="Signal → risk → fill → settlement" />{['Signal generated', 'Risk gates evaluated', 'IOC order filled', 'Market resolved', 'Payout credited'].map((x, i) => <div className="timeline" key={x}><strong>{i + 1}</strong><div><b>{x}</b><span>{['Model vs market dislocation detected', 'Edge, liquidity, time and exposure checks recorded', 'Canonical fill receipt recorded', 'Outcome resolved onchain', 'Payout and realized P&L recorded'][i]}</span></div></div>)}</div>; }

