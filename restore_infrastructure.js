const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const PINGS = [
  'OuDkzcXOvQvi1WbE', // WhatsApp Render Ping
  '1OUj4HsmgRZ9puml', // HF Keep-Alive
  'oH3DkQWToZvbtyGc', // Behavior Tracker
  'gup9SdTzQFIdn36Q'  // Profile API
];

function request(options) {
  return new Promise((resolve) => {
    const r = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ s: res.statusCode, d: body }));
    });
    r.on('error', (e) => resolve({ s: 500, d: e.message }));
    r.end();
  });
}

async function run() {
  console.log('=== RESTORING CRITICAL INFRASTRUCTURE (PINGS) ===');
  for (const id of PINGS) {
    console.log(`Activating workflow: ${id}...`);
    const res = await request({
      hostname: N8N_URL,
      path: `/api/v1/workflows/${id}/activate`,
      method: 'POST',
      headers: { 'X-N8N-API-KEY': AUTH_KEY }
    });
    console.log(`Result: ${res.s}`);
  }
  console.log('\n✅ INFRASTRUCTURE RESTORED');
}

run();
