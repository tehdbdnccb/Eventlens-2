import {DreamDexAdapter} from '@eventlens/dreamdex'; import {evaluateTrade,estimateSlippage} from '@eventlens/risk'; import type {Side,OrderBook,Market,CalibrationMetrics} from '@eventlens/shared';
import {DemoAdapter} from './demo.js'; import {SomniaDreamDexAdapter} from '@eventlens/dreamdex'; import {buildSignal} from './engine.js';

function envBool(name:string, fallback:boolean){const raw=process.env[name]; if(raw===undefined)return fallback; return raw.toLowerCase()==='true';}
function createAdapter():DreamDexAdapter{
  const live=!envBool('DEMO_MODE',true);
  if(!live) return new DemoAdapter();
  const network=(process.env.SOMNIA_NETWORK==='mainnet'?'mainnet':'shannon') as 'mainnet'|'shannon';
  const defaultIndexer=network==='mainnet'?'https://prd.smk.somnia.host/v1/graphql':'https://dev.smk.somnia.host/v1/graphql';
  const defaultWsRpc=network==='mainnet'?'wss://api.infra.mainnet.somnia.network/ws':'wss://api.infra.testnet.somnia.network/ws';
  const indexerUrl=process.env.SOMNIA_INDEXER_URL||defaultIndexer;
  const wsRpcUrl=process.env.SOMNIA_WS_RPC_URL||defaultWsRpc;
  const privateKey=process.env.SOMNIA_PRIVATE_KEY as `0x${string}`|undefined;
  return new SomniaDreamDexAdapter({indexerUrl,wsRpcUrl,network,privateKey});
}
export const adapter=createAdapter();

export async function snapshot(){const markets=await adapter.discoverMarkets(); const out=[]; for(const m of markets){const book=await adapter.orderBook(m.marketId); const spread=book.asks[0]&&book.bids[0]?Math.max(0,book.asks[0].price-book.bids[0].price):m.spread; out.push({...m,spread,signal:buildSignal({...m,spread},markets,book)});} return out;}

export async function detail(id:string){const markets=await adapter.discoverMarkets(); const base=markets.find(m=>m.marketId===id)??markets[0]; if(!base) throw new Error('No Event Contract markets available'); const orderbook=await adapter.orderBook(base.marketId); const spread=orderbook.asks[0]&&orderbook.bids[0]?Math.max(0,orderbook.asks[0].price-orderbook.bids[0].price):base.spread; const market={...base,spread}; return {...market,signal:buildSignal(market,markets,orderbook),orderbook};}

export async function preview(input:{marketId:string;side:Side;quantity:number;wallet:string}){const d=await detail(input.marketId); const bestSidePrice=input.side==='UP'?(d.orderbook.asks[0]?.price??d.upPrice):(d.orderbook.bids[0]?1-d.orderbook.bids[0].price:d.downPrice); const maxPrice=Math.min(0.999,bestSidePrice+0.002); const spread=d.orderbook.asks[0]&&d.orderbook.bids[0]?Math.max(0,d.orderbook.asks[0].price-d.orderbook.bids[0].price):d.spread; const risk=evaluateTrade({...d,spread},d.signal,input.side,input.quantity,0); const slippage=estimateSlippage(bestSidePrice,spread,input.quantity,d.liquidity); return {ok:risk.allowed,checks:risk.checks,reasons:risk.reasons,price:bestSidePrice,maxPrice,cost:bestSidePrice*input.quantity,slippage};}

export async function execute(input:{marketId:string;side:Side;quantity:number;wallet:string}){const p=await preview(input); if(!p.ok) return {ok:false,checks:p.checks,reasons:p.reasons}; return {ok:true,trade:await adapter.execute({...input,maxPrice:p.maxPrice})};}
export function trades(){return adapter instanceof DemoAdapter?adapter.listTrades():[];}
export async function calibration():Promise<CalibrationMetrics>{return adapter.calibration();}
export function runtime(){return {mode:adapter.mode(),wallet:adapter.walletLabel()};}
