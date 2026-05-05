const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

// CORRECT credential IDs from working workflows
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
  
  console.log('Getting V35...');
  const getRes = await request({ hostname: N8N_URL, path: `/api/v1/workflows/${wfID}`, method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const wf = JSON.parse(getRes.d);
  console.log('Got:', wf.name, '- Nodes:', wf.nodes.length);

  // Fix ALL credential references
  let fixed = 0;
  for (const node of wf.nodes) {
    if (node.credentials?.postgres) {
      node.credentials.postgres = POSTGRES_CRED;
      console.log(`✅ Fixed postgres cred on "${node.name}"`);
      fixed++;
    }
    if (node.credentials?.httpHeaderAuth) {
      node.credentials.httpHeaderAuth = SAMBANOVA_CRED;
      console.log(`✅ Fixed SambaNova cred on "${node.name}"`);
      fixed++;
    }
  }

  console.log(`\nFixed ${fixed} credential references`);

  // Deploy fix
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || { executionOrder: 'v1' }
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
    console.log('✅ Credentials fixed! Recarga y ejecuta.');
  } else {
    console.log('Error:', putRes.d.substring(0, 300));
  }
}

run().catch(e => console.error('Fatal:', e.message));
