const https = require('https');

const WEBHOOK_URL = 'https://suskj501-n8n.hf.space/webhook/backfill-v37';

function trigger() {
  console.log(`Triggering webhook: ${WEBHOOK_URL}...`);
  const req = https.request(WEBHOOK_URL, { method: 'POST' }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', (err) => {
    console.error('Error:', err.message);
  });

  req.end();
}

trigger();
