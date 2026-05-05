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

async function debugV4010() {
  const exID = '2657'; // Última ejecución V40.10
  console.log(`--- DEBUGGING FAILURE FOR ${exID} ---`);
  const res = await request({
    hostname: N8N_URL,
    path: `/api/v1/executions/${exID}?includeData=true`,
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  if (res.s === 200) {
    const data = JSON.parse(res.d);
    console.log('Overall Status:', data.status);
    
    if (data.data?.resultData?.error) {
        console.log('Main Error:', data.data.resultData.error.message);
    }
    
    const runData = data.data?.resultData?.runData;
    if (runData) {
        for (const node in runData) {
            runData[node].forEach(run => {
                if (run.error) {
                    console.log(`!!! NODE [${node}] FAILED !!!`);
                    console.log('Message:', run.error.message);
                    console.log('Description:', run.error.description);
                }
            });
        }
    }
  } else {
    console.error('API Error:', res.s, res.d);
  }
}

debugV4010();
