const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const wfID = 'nkp8BcGXisFl9HAN';

function request(options) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ s: res.statusCode, d: body }));
    });
    r.on('error', reject);
    r.end();
  });
}

async function check() {
  console.log('--- N8N ERROR LOGS ---');
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions?workflowId=${wfID}&status=error&limit=1`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    if (data.data.length === 0) {
        console.log('No errors found so far.');
        return;
    }
    const err = data.data[0];
    console.log(`Execution ${err.id} failed.`);
    // Fetch details of this execution
    const detailRes = await request({
        hostname: N8N_URL,
        path: `/api/v1/executions/${err.id}`,
        method: 'GET',
        headers: { 'X-N8N-API-KEY': AUTH_KEY }
    });
    console.log('Error Details:', detailRes.s, detailRes.d.slice(0, 500));
  } else {
    console.error('Failed to fetch errors:', res.s, res.d);
  }
}

check();
