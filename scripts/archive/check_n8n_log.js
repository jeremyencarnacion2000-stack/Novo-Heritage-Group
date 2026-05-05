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
  console.log('--- N8N EXECUTION LOG ---');
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions?workflowId=${wfID}&limit=5`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    data.data.forEach(ex => {
      console.log(`- ID: ${ex.id} | Status: ${ex.status} | Started: ${ex.startedAt} | Finished: ${ex.finishedAt || 'RUNNING'}`);
    });
  } else {
    console.error('Failed to fetch executions:', res.s, res.d);
  }
}

check();
