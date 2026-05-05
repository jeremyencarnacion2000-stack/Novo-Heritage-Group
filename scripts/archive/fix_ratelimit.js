const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const SAMBANOVA_KEY = '09b89a76-2d1c-4a47-863e-f4a5389e6ad8';

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
  
  console.log('Getting V32...');
  const getRes = await request({ hostname: N8N_URL, path: `/api/v1/workflows/${wfID}`, method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const wf = JSON.parse(getRes.d);
  console.log('Got:', wf.name, '- Nodes:', wf.nodes.length);

  // === FIX: Update nodes ===
  for (const node of wf.nodes) {
    if (node.name === 'split-batches') {
      // BATCH SIZE 1 — process one at a time to respect rate limits
      node.parameters.batchSize = 1;
      node.parameters.options = {};
      console.log('✅ split-batches → batchSize=1');
    }
    
    if (node.name === 'SambaNova HTTP') {
      // Add retry with backoff + continueOnFail
      node.retryOnFail = true;
      node.maxTries = 3;
      node.waitBetweenTries = 10000; // 10s between retries
      node.continueOnFail = true;
      // Also add batching delay in options
      node.parameters.options = node.parameters.options || {};
      node.parameters.options.batching = {
        batch: { batchSize: 1, batchInterval: 5000 } // 5s between requests
      };
      console.log('✅ SambaNova HTTP → retry=3, wait=10s, continueOnFail, batch interval=5s');
    }
  }

  // === ADD: delay-node (Code) between loop iterations ===
  // Add a simple Code node that waits 8 seconds before looping back
  const hasDelay = wf.nodes.some(n => n.name === 'delay-node');
  if (!hasDelay) {
    wf.nodes.push({
      parameters: {
        jsCode: `
// Rate-limit delay: wait 8 seconds before next batch
await new Promise(resolve => setTimeout(resolve, 8000));
return $input.all();`
      },
      name: 'delay-node',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1500, 300]
    });
    console.log('✅ Added delay-node (8s pause between batches)');
  }

  // === FIX: Connections ===
  // Route: upsert-node → delay-node → split-batches
  // Route: bridge-node → delay-node → split-batches  
  const newConnections = {
    "When clicking 'Execute workflow'": { main: [[{ node: 'fetch-all', type: 'main', index: 0 }]] },
    Webhook: { main: [[{ node: 'fetch-all', type: 'main', index: 0 }]] },
    'fetch-all': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] },
    'split-batches': { main: [
      [],  // Output 0 (done)
      [{ node: 'SambaNova HTTP', type: 'main', index: 0 }]  // Output 1 (batch items)
    ]},
    'SambaNova HTTP': { main: [[{ node: 'process-logic', type: 'main', index: 0 }]] },
    'process-logic': { main: [[{ node: 'filter-node', type: 'main', index: 0 }]] },
    'filter-node': { main: [
      [{ node: 'upsert-node', type: 'main', index: 0 }],   // True → save
      [{ node: 'bridge-node', type: 'main', index: 0 }]     // False → skip
    ]},
    'upsert-node': { main: [[{ node: 'delay-node', type: 'main', index: 0 }]] },
    'bridge-node': { main: [[{ node: 'delay-node', type: 'main', index: 0 }]] },
    'delay-node': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] }
  };

  const payload = {
    name: '[PROD] Godmode Backfill V33 (Rate-Limited)',
    nodes: wf.nodes,
    connections: newConnections,
    settings: {
      executionOrder: 'v1',
      saveExecutionProgress: true,
      executionTimeout: 86400 // 24 hours
    }
  };

  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);

  console.log('PUT:', putRes.s);
  if (putRes.s === 200) {
    const updated = JSON.parse(putRes.d);
    console.log('\n✅ V33 DEPLOYED! Nodes:', updated.nodes.length);
    console.log('Batch size: 1 item at a time');
    console.log('Delay: 8s between batches');
    console.log('Retry: 3 attempts, 10s between retries');
    console.log('Timeout: 24 hours');
    console.log('\n5000 items × ~13s/item ≈ 18 hours (overnight)');
    console.log('\n→ Recarga y click "Execute Workflow"');
  } else {
    console.log('Error:', putRes.d.substring(0, 500));
  }
}

run().catch(e => console.error('Fatal:', e.message));
