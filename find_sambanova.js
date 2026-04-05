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
  // List ALL credentials with details
  console.log('=== ALL CREDENTIALS ===');
  const r1 = await request({
    hostname: N8N_URL,
    path: '/api/v1/credentials',
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  const creds = JSON.parse(r1.d);
  for (const c of (creds.data || creds)) {
    console.log(`  ID: ${c.id} | Type: ${c.type} | Name: ${c.name}`);
  }

  // Find a WORKING workflow that actually uses SambaNova successfully
  console.log('\n=== FINDING WORKING SAMBANOVA CREDENTIAL ===');
  
  // Check V32 which was working before
  const workingWfs = ['C1IWntQvKlUwbshc', 'USRHol3Ql90O505f', 'jygw9aYmTz0HbEKh', '6w6qXRNh4JrWtmpi'];
  
  for (const wfId of workingWfs) {
    const r = await request({
      hostname: N8N_URL,
      path: `/api/v1/workflows/${wfId}`,
      method: 'GET',
      headers: { 'X-N8N-API-KEY': AUTH_KEY }
    });
    const wf = JSON.parse(r.d);
    for (const node of (wf.nodes || [])) {
      if (node.credentials?.httpHeaderAuth) {
        console.log(`  Workflow "${wf.name}" node "${node.name}": httpHeaderAuth = ${JSON.stringify(node.credentials.httpHeaderAuth)}`);
      }
    }
  }

  // Also check the workflows that were actually RUNNING (already saved 2 records)
  console.log('\n=== CHECKING V33/V34 which worked (saved 2 records) ===');
  // V33 had these nodes working - let's check what cred IDs the IngestorV18 uses
  const ingestor = await request({
    hostname: N8N_URL,
    path: '/api/v1/workflows/ULTINMGpK3CwaATb',
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  const ingWf = JSON.parse(ingestor.d);
  for (const node of (ingWf.nodes || [])) {
    if (node.credentials) {
      console.log(`  Ingestor node "${node.name}": ${JSON.stringify(node.credentials)}`);
    }
  }
}

run().catch(e => console.error('Error:', e.message));
