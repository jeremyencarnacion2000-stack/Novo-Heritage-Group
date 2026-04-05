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

async function run() {
  // Get latest execution
  const execRes = await request({ hostname: N8N_URL, path: '/api/v1/executions?limit=3&includeData=true', method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const execs = JSON.parse(execRes.d).data;
  
  for (const exec of execs) {
    console.log(`\n=== EXECUTION #${exec.id} (${exec.status}) ===`);
    if (!exec.data?.resultData?.runData) continue;
    
    const runData = exec.data.resultData.runData;
    
    for (const [name, runs] of Object.entries(runData)) {
      for (let i = 0; i < runs.length; i++) {
        const run = runs[i];
        const out0 = run?.data?.main?.[0]?.length || 0;
        const out1 = run?.data?.main?.[1]?.length || 0;
        const error = run?.error?.message || null;
        
        if (name === 'upsert-node' || name === 'process-logic' || name === 'filter-node' || error) {
          console.log(`\n  ${name} [run ${i}]: out0=${out0}, out1=${out1}${error ? '\n  ❌ ERROR: ' + error : ''}`);
          
          // Show input/output data
          const items = run?.data?.main?.[0] || [];
          if (items.length > 0 && name !== 'filter-node') {
            console.log(`  DATA: ${JSON.stringify(items[0]?.json || {}).substring(0, 600)}`);
          }
          
          // For filter, show both branches
          if (name === 'filter-node') {
            const trueItems = run?.data?.main?.[0] || [];
            const falseItems = run?.data?.main?.[1] || [];
            console.log(`  TRUE (→upsert): ${trueItems.length} items`);
            console.log(`  FALSE (→bridge): ${falseItems.length} items`);
            if (trueItems.length > 0) {
              console.log(`  TRUE sample: ${JSON.stringify(trueItems[0]?.json || {}).substring(0, 400)}`);
            }
          }
        }
      }
    }
    
    if (exec.data.resultData.error) {
      console.log('\n  GLOBAL ERROR:', JSON.stringify(exec.data.resultData.error).substring(0, 500));
    }
    
    break; // Only latest
  }
}

run().catch(e => console.error('Error:', e.message));
