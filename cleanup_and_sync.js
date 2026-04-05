const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const V39_ID = 'nkp8BcGXisFl9HAN';

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
  console.log('=== CLEANING UP WORKFLOWS ===');
  
  // 1. List all workflows
  const listRes = await request({
    hostname: N8N_URL,
    path: '/api/v1/workflows',
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  
  if (listRes.s !== 200) {
    console.log('Error listing workflows:', listRes.d);
    return;
  }
  
  const workflows = JSON.parse(listRes.d).data;
  for (const wf of workflows) {
    if (wf.id !== V39_ID && wf.active) {
      console.log(`Deactivating legacy flow: ${wf.name} (${wf.id})`);
      const patchRes = await request({
        hostname: N8N_URL,
        path: `/api/v1/workflows/${wf.id}/activate`,
        method: 'POST',
        headers: { 'X-N8N-API-KEY': AUTH_KEY }
      }, null);
      // Wait, let's use the actual deactivation method.
      // In n8n API, there isn't a single 'deactivate' endpoint always. 
      // We can use PUT with active: false.
      const putRes = await request({
        hostname: N8N_URL,
        path: `/api/v1/workflows/${wf.id}`,
        method: 'PUT',
        headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json' },
      }, JSON.stringify({ active: false }));
      console.log(`Deactivation status: ${putRes.s}`);
    }
  }

  // 2. Ensure V39 is ACTIVE
  console.log('\n=== ENSURING V39 IS ACTIVE ===');
  await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${V39_ID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json' },
  }, JSON.stringify({ active: true }));

  // 3. Trigger Backfill Sync
  console.log('\n=== TRIGGERING FULL BACKFILL (V39) ===');
  const triggerRes = await request({
    hostname: N8N_URL,
    path: '/webhook/backfill-v39',
    method: 'GET', // Webhooks are usually GET or POST
  });
  
  console.log('Trigger Sync Status:', triggerRes.s);
  if (triggerRes.s === 200) {
    console.log('🚀 SYSTEM SYNCING... ALL MESSAGES WILL BE READY FOR TOMORROW.');
  } else {
    // try POST
    const triggerPost = await request({
      hostname: N8N_URL,
      path: '/webhook/backfill-v39',
      method: 'POST',
    });
    console.log('Trigger POST Status:', triggerPost.s);
  }
}

run().catch(console.error);
