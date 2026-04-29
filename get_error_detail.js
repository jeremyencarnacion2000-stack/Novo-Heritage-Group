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

async function getErrorDetail() {
  const exID = '2633';
  console.log(`--- FETCHING ERROR DETAILS FOR ${exID} ---`);
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions/${exID}`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    console.log('Execution Status:', data.data.status);
    console.log('Flow Error:', JSON.stringify(data.data.data.resultData.error, null, 2));
    
    const runData = data.data.data.resultData.runData;
    for (const nodeName in runData) {
        const nodeRuns = runData[nodeName];
        nodeRuns.forEach((run, idx) => {
            if (run.error) {
                console.log(`\n!!! ERROR IN NODE: ${nodeName} (Run ${idx}) !!!`);
                console.log('Error Message:', run.error.message);
                console.log('Error Stack:', run.error.stack);
            }
        });
    }
  } else {
    console.error('Failed to fetch:', res.s, res.d);
  }
}

getErrorDetail();
