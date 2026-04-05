const https = require('https');
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

function req(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'suskj501-n8n.hf.space',
      path: path,
      headers: { 'X-N8N-API-KEY': AUTH_KEY }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ s: res.statusCode, d: body }));
    }).on('error', reject);
  });
}

async function run() {
  // List all credentials
  console.log('=== CREDENTIALS ===');
  const r1 = await req('/api/v1/credentials');
  if (r1.s === 200) {
    const creds = JSON.parse(r1.d);
    for (const c of (creds.data || creds)) {
      console.log(`  ${c.id} | ${c.type} | ${c.name}`);
    }
  } else {
    console.log('Status:', r1.s, r1.d.substring(0, 200));
  }

  // Also check existing working workflows for credential IDs
  console.log('\n=== CHECKING KEEP-ALIVE WORKFLOW FOR CRED IDs ===');
  const wfs = await req('/api/v1/workflows');
  if (wfs.s === 200) {
    const list = JSON.parse(wfs.d);
    for (const w of (list.data || list)) {
      console.log(`  ${w.id} | ${w.name} | active:${w.active}`);
    }
  }

  // Get a workflow that uses postgres to find the cred ID
  console.log('\n=== CHECKING INGESTOR FOR POSTGRES CRED ===');
  const allWfs = JSON.parse(wfs.d);
  for (const w of (allWfs.data || allWfs)) {
    const detail = await req(`/api/v1/workflows/${w.id}`);
    const wfDetail = JSON.parse(detail.d);
    for (const node of (wfDetail.nodes || [])) {
      if (node.credentials?.postgres) {
        console.log(`  Found in "${wfDetail.name}" / node "${node.name}":`);
        console.log(`  Postgres cred: ${JSON.stringify(node.credentials.postgres)}`);
      }
      if (node.credentials?.httpHeaderAuth) {
        console.log(`  SambaNova cred in "${node.name}": ${JSON.stringify(node.credentials.httpHeaderAuth)}`);
      }
    }
  }
}

run().catch(e => console.error('Error:', e.message));
