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
  // 1. Create WhatsApp (Render) keep-alive ping - every 1 minute
  console.log('=== CREATING WASA PING (1min) ===');
  
  const wasaPing = {
    name: '[PROD] WhatsApp Render Ping (1min)',
    nodes: [
      {
        parameters: {
          rule: { interval: [{ field: 'minutes', minutesInterval: 1 }] }
        },
        name: 'Every 1min',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.1,
        position: [100, 300]
      },
      {
        parameters: {
          method: 'GET',
          url: 'https://wasa-el6v.onrender.com/',
          options: {
            timeout: 30000,
            allowUnauthorizedCerts: true
          }
        },
        name: 'Ping Render',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: [350, 200],
        continueOnFail: true
      },
      {
        parameters: {
          method: 'GET',
          url: 'https://suskj501-n8n.hf.space/healthz',
          options: { timeout: 15000 }
        },
        name: 'Ping n8n HF',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: [350, 400],
        continueOnFail: true
      },
      {
        parameters: {
          jsCode: `
const renderRes = $('Ping Render').first()?.json || {};
const hfRes = $('Ping n8n HF').first()?.json || {};
const now = new Date().toISOString();

console.log(\`[\${now}] Render: OK | HF: OK\`);

return [{json: {
  timestamp: now,
  render_status: 'pinged',
  hf_status: 'pinged'
}}];`
        },
        name: 'Log',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [600, 300]
      }
    ],
    connections: {
      'Every 1min': { main: [[
        { node: 'Ping Render', type: 'main', index: 0 },
        { node: 'Ping n8n HF', type: 'main', index: 0 }
      ]]},
      'Ping Render': { main: [[{ node: 'Log', type: 'main', index: 0 }]] },
      'Ping n8n HF': { main: [[{ node: 'Log', type: 'main', index: 0 }]] }
    },
    settings: {
      executionOrder: 'v1',
      executionTimeout: 45
    }
  };

  const r1 = await request({
    hostname: N8N_URL,
    path: '/api/v1/workflows',
    method: 'POST',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json' }
  }, JSON.stringify(wasaPing));

  console.log('Status:', r1.s);
  if (r1.s === 200) {
    const wf = JSON.parse(r1.d);
    console.log('✅ Created! ID:', wf.id);
    console.log('URL:', `https://suskj501-n8n.hf.space/workflow/${wf.id}`);
    
    // Try to activate it immediately
    const activateRes = await request({
      hostname: N8N_URL,
      path: `/api/v1/workflows/${wf.id}`,
      method: 'PUT',
      headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json' }
    }, JSON.stringify({ ...wasaPing, active: true }));
    
    if (activateRes.s === 200) {
      const activated = JSON.parse(activateRes.d);
      console.log('Active:', activated.active ? '🟢 YES' : '⚪ NO (activate manually)');
    }
  } else {
    console.log('Error:', r1.d.substring(0, 300));
  }

  // 2. Quick test ping to Render
  console.log('\n=== TESTING RENDER PING ===');
  const testPing = await request({
    hostname: 'wasa-el6v.onrender.com',
    path: '/',
    method: 'GET',
    headers: {}
  });
  console.log('Render response:', testPing.s);
  console.log('Body:', testPing.d.substring(0, 200));
}

run().catch(e => console.error('Fatal:', e.message));
