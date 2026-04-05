const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

function request(options, data) {
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
  const wfId = 'OuDkzcXOvQvi1WbE';
  
  // Get then PUT with active=true
  const getRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfId}`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  
  const wf = JSON.parse(getRes.d);
  
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || { executionOrder: 'v1' },
    active: true
  };
  
  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfId}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  
  console.log('Activate status:', putRes.s);
  if (putRes.s === 200) {
    const updated = JSON.parse(putRes.d);
    console.log('Active:', updated.active ? '🟢 ACTIVO!' : '⚪ No activado');
  } else {
    console.log('Error:', putRes.d.substring(0, 300));
  }
}

run().catch(e => console.error('Fatal:', e.message));
