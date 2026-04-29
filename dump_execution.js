const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

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

async function getFullDetail() {
  const exID = '2633';
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions/${exID}`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    console.log('--- FULL EXECUTION DUMP ---');
    // Log keys to see top level
    console.log('Keys:', Object.keys(data));
    
    // Check where execution data is
    if (data.data) {
        console.log('Data Keys:', Object.keys(data.data));
        if (data.data.resultData) {
            console.log('ResultData Error:', data.data.resultData.error);
        }
    } else {
        // If it's old version, or different nesting
        console.log('Top-level DUMP (Partial):', JSON.stringify(data).slice(0, 500));
    }
  } else {
    console.error('Failed:', res.s, res.d);
  }
}

getFullDetail();
