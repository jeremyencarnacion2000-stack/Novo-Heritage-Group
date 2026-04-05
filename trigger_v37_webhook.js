const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const WEBHOOK_PATH = 'backfill-v37';

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
  console.log(`Triggering webhook ${WEBHOOK_PATH}...`);
  // Try both production and test webhook URLs
  const prodRes = await request({
    hostname: N8N_URL,
    path: `/webhook/${WEBHOOK_PATH}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, '{}');
  
  console.log('Production Status:', prodRes.s);
  console.log('Production Body:', prodRes.d);
}

run().catch(console.error);
