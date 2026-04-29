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

async function debugFull() {
  const exID = '2641';
  console.log(`--- FETCHING FULL DATA FOR ${exID} ---`);
  // includeData=true is key for v1 API to see execution results
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions/${exID}?includeData=true`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    console.log('Status:', data.status);
    
    if (data.data && data.data.resultData) {
        if (data.data.resultData.error) {
            console.log('\n--- GLOBAL ERROR ---');
            console.log('Message:', data.data.resultData.error.message);
        }
        
        const runData = data.data.resultData.runData;
        if (runData) {
            Object.keys(runData).forEach(node => {
                runData[node].forEach(run => {
                    if (run.error) {
                        console.log(`\n--- NODE [${node}] FAILED ---`);
                        console.log('Error:', run.error.message);
                    }
                });
            });
        }
    } else {
        console.log('No resultData found. Keys available:', Object.keys(data));
    }
  } else {
    console.error('Failed:', res.s, res.d);
  }
}

debugFull();
