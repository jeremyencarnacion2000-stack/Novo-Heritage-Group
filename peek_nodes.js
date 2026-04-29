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

async function check(id) {
  console.log(`--- PEEKING EXECUTION ${id} ---`);
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions/${id}`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    // n8n detail response actually has resultData under data.resultData in V1
    const runData = data.data.resultData.runData;
    if (runData) {
        Object.keys(runData).forEach(node => {
            console.log(`- Node: ${node} | Runs/Items: ${runData[node].length}`);
        });
    } else {
        console.log('No run data available yet.');
    }
  } else {
    console.error('Failed:', res.s, res.d);
  }
}

async function run() {
    await check('2605');
    console.log('\n');
    await check('2612');
}

run();
