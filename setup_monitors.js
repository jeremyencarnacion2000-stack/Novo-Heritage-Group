const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

function req(options, data) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ s: res.statusCode, d: body }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  // 1. Check current status
  console.log('=== CHECKING STATUS ===');
  
  const execRes = await req({ hostname: N8N_URL, path: '/api/v1/executions?limit=5', method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  if (execRes.s === 200) {
    const execs = JSON.parse(execRes.d).data;
    console.log('Latest executions:');
    for (const e of execs) {
      console.log(`  #${e.id} | ${e.status} | wf:${e.workflowId} | ${e.stoppedAt || 'RUNNING'}`);
    }
  } else {
    console.log('Exec check failed:', execRes.s);
  }

  // 2. Check DB
  const { Client } = require('pg');
  const c = new Client({ connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full' });
  await c.connect();
  
  const inv = await c.query('SELECT COUNT(*) as total FROM public.inventario_digital');
  console.log('\ninventario_digital rows:', inv.rows[0].total);
  
  const wa = await c.query('SELECT "connectionStatus" FROM evolution."Instance" LIMIT 1');
  console.log('WhatsApp status:', wa.rows[0]?.connectionStatus);
  
  await c.end();

  // 3. Create Keep-Alive workflow
  console.log('\n=== CREATING KEEP-ALIVE ===');
  const keepAlive = {
    name: '[PROD] HF Keep-Alive (5min)',
    nodes: [
      { parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 5 }] } }, name: 'Schedule', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.1, position: [100, 300] },
      { parameters: { method: 'GET', url: 'https://suskj501-n8n.hf.space/healthz', options: {} }, name: 'Ping', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.1, position: [350, 300] }
    ],
    connections: { Schedule: { main: [[{ node: 'Ping', type: 'main', index: 0 }]] } },
    settings: { executionOrder: 'v1', executionTimeout: 60 }
  };

  const r1 = await req({ hostname: N8N_URL, path: '/api/v1/workflows', method: 'POST', headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json' } }, JSON.stringify(keepAlive));
  console.log('Keep-Alive:', r1.s);
  if (r1.s === 200) {
    const wf = JSON.parse(r1.d);
    console.log('✅ ID:', wf.id, '→ https://suskj501-n8n.hf.space/workflow/' + wf.id);
  }

  // 4. Create WhatsApp Monitor
  console.log('\n=== CREATING WA MONITOR ===');
  const waMonitor = {
    name: '[PROD] WhatsApp Monitor (10min)',
    nodes: [
      { parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 10 }] } }, name: 'Schedule', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.1, position: [100, 300] },
      { parameters: { operation: 'executeQuery', query: 'SELECT name, "connectionStatus", token FROM evolution."Instance" LIMIT 1;' }, name: 'Check WA', type: 'n8n-nodes-base.postgres', typeVersion: 2.3, position: [350, 300] },
      { parameters: { jsCode: 'const d=$input.first().json;const ok=d.connectionStatus==="open";console.log(`WA status: ${d.connectionStatus}`);return[{json:{status:d.connectionStatus,ok,name:d.name,ts:new Date().toISOString()}}];' }, name: 'Log Status', type: 'n8n-nodes-base.code', typeVersion: 2, position: [600, 300] }
    ],
    connections: {
      Schedule: { main: [[{ node: 'Check WA', type: 'main', index: 0 }]] },
      'Check WA': { main: [[{ node: 'Log Status', type: 'main', index: 0 }]] }
    },
    settings: { executionOrder: 'v1', executionTimeout: 120 }
  };

  const r2 = await req({ hostname: N8N_URL, path: '/api/v1/workflows', method: 'POST', headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json' } }, JSON.stringify(waMonitor));
  console.log('WA Monitor:', r2.s);
  if (r2.s === 200) {
    const wf = JSON.parse(r2.d);
    console.log('✅ ID:', wf.id, '→ https://suskj501-n8n.hf.space/workflow/' + wf.id);
  }

  // 5. Check V32 backfill workflow status
  console.log('\n=== V32 BACKFILL STATUS ===');
  const v32 = await req({ hostname: N8N_URL, path: '/api/v1/workflows/nkp8BcGXisFl9HAN', method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  if (v32.s === 200) {
    const wf = JSON.parse(v32.d);
    console.log('Name:', wf.name);
    console.log('Active:', wf.active);
  }

  console.log('\n📋 RESUMEN:');
  console.log('1. Keep-Alive → Actívalo en la UI');
  console.log('2. WA Monitor → Asigna credencial Postgres + Actívalo');
  console.log('3. Backfill V32 → Recarga y ejecuta manualmente');
}

run().catch(e => console.error('Error:', e.message));
