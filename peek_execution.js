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

async function check() {
  const exID = '2597'; // The V40.1 execution
  console.log(`--- DETAILS FOR EXECUTION ${exID} ---`);
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions/${exID}`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    console.log(`Status: ${data.status}`);
    // n8n API doesn't easily show "current node" in a summary, 
    // but the presence of data in data.data.resultData.runData might show progress.
    const runData = data.data.resultData.runData;
    Object.keys(runData).forEach(node => {
        console.log(`- Node: ${node} | Runs: ${runData[node].length}`);
    });
  } else {
    console.error('Failed:', res.s, res.d);
  }
}

check();
