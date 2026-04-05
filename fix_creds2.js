const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const POSTGRES_CRED = { id: 'ym3KfQZLjCvWmUjS', name: 'Postgres account' };
const SAMBANOVA_CRED = { id: 'fW0rDByk0v0p6N7R', name: 'SambaNova Auth' };

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
  
  const getRes = await request({ hostname: N8N_URL, path: `/api/v1/workflows/${wfID}`, method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const wf = JSON.parse(getRes.d);

  // Fix credentials
  for (const node of wf.nodes) {
    if (node.credentials?.postgres) {
      node.credentials.postgres = POSTGRES_CRED;
    }
    if (node.credentials?.httpHeaderAuth) {
      node.credentials.httpHeaderAuth = SAMBANOVA_CRED;
    }
  }

  // Clean settings — only allowed fields
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: 'v1'
    }
  };

  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);

  console.log('Deploy:', putRes.s);
  if (putRes.s === 200) {
    console.log('✅ V35 credentials fixed! Recarga y ejecuta.');
  } else {
    console.log('Error:', putRes.d.substring(0, 400));
  }
}

run().catch(e => console.error('Fatal:', e.message));
