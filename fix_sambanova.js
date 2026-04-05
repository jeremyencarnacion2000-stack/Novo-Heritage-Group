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
  const wfID = 'nkp8BcGXisFl9HAN';
  
  console.log('Getting V35...');
  const getRes = await request({ hostname: N8N_URL, path: `/api/v1/workflows/${wfID}`, method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const wf = JSON.parse(getRes.d);

  // Try BOTH httpHeaderAuth credentials
  const CRED_OPTIONS = [
    { id: 'u46bitcJQIW1QNfu', name: 'Header Auth account 2' },
    { id: 'IkaWMm84J2TGL1ZE', name: 'Header Auth account' }
  ];

  // Try with "Header Auth account 2" first (most likely)
  const headerCred = CRED_OPTIONS[0];  // u46bitcJQIW1QNfu
  console.log(`Trying credential: ${headerCred.name} (${headerCred.id})`);

  for (const node of wf.nodes) {
    if (node.credentials?.postgres) {
      node.credentials.postgres = { id: 'ym3KfQZLjCvWmUjS', name: 'Postgres account' };
    }
    if (node.credentials?.httpHeaderAuth) {
      node.credentials.httpHeaderAuth = headerCred;
      console.log(`  Set on "${node.name}"`);
    }
  }

  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: 'v1' }
  };

  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);

  console.log('Deploy:', putRes.s);
  
  if (putRes.s !== 200) {
    console.log('Trying second option...');
    // Try second one
    const headerCred2 = CRED_OPTIONS[1];
    for (const node of wf.nodes) {
      if (node.credentials?.httpHeaderAuth) {
        node.credentials.httpHeaderAuth = headerCred2;
      }
    }
    
    const payload2 = { ...payload, nodes: wf.nodes };
    const body2 = JSON.stringify(payload2);
    const putRes2 = await request({
      hostname: N8N_URL,
      path: `/api/v1/workflows/${wfID}`,
      method: 'PUT',
      headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body2) }
    }, body2);
    console.log('Deploy v2:', putRes2.s);
  }
  
  console.log('✅ Done! Recarga y ejecuta.');
  console.log('Si sigue fallando, prueba con "Header Auth account" en la UI de n8n.');
}

run().catch(e => console.error('Fatal:', e.message));
