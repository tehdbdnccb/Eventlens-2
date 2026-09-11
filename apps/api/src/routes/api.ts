import type {FastifyInstance} from 'fastify'; import {detail,execute,preview,snapshot,trades,calibration,runtime} from '../services/marketService.js';
export async function apiRoutes(app:FastifyInstance){
  app.get('/health',async()=>({ok:true,service:'eventlens-api',...runtime()}));
  app.get('/runtime',async()=>runtime());
  app.get('/markets',async()=>snapshot());
  app.get('/markets/:id',async(req:any)=>detail(req.params.id));
  app.get('/positions',async()=>trades());
  app.get('/trades',async()=>trades());
  app.get('/calibration',async()=>calibration());
  app.post('/trades/preview',async(req:any)=>preview(req.body));
  app.post('/trades/execute',async(req:any)=>execute(req.body));
  app.post('/explain',async(req:any)=>({text:`EventLens sees a ${(Math.abs(req.body.edge||0)*100).toFixed(1)} percentage-point dislocation. The deterministic composite score combines fair value, order-book imbalance, momentum and cross-window structure; AI explains the inputs but never overrides execution or risk gates.`}));
}
