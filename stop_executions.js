const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const wfID = 'nkp8BcGXisFl9HAN';

function request(options) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end')
      r.end();
    });
    r.on('error', reject);
    r.end();
  });
}

// n8n v1 API doesn't have a direct "stop all for workflow" endpoint in documentation easily, 
// usually you have to get the IDs and stop them one by one.

async function stopAll() {
  console.log('--- CLEANING UP STUCK EXECUTIONS ---');
  // Get running executions
  const res = await new Promise(resolve => {
    https.get(`https://${N8N_URL}/api/v1/executions?workflowId=${wfID}&status=success`, {
        headers: { 'X-N8N-API-KEY': AUTH_KEY }
    }, r => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => resolve(JSON.parse(b)));
    });
  });

  const running = res.data.filter(ex => !ex.finishedAt);
  console.log(`Found ${running.length} active executions to stop.`);

  for (const ex of running) {
    console.log(`Stopping execution ${ex.id}...`);
    // POST /api/v1/executions/{id}/stop
    await new Promise(resolve => {
        const req = https.request({
            hostname: N8N_URL,
            path: `/api/v1/executions/${ex.id}/stop`,
            method: 'POST',
            headers: { 'X-N8N-API-KEY': AUTH_KEY }
        }, r => r.on('end', resolve));
        req.end();
    });
  }
  console.log('Cleanup complete.');
}

stopAll().catch(console.error);
