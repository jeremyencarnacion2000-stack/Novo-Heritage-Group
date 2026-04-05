const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ s: res.statusCode, d: body }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  // 1. Get recent executions for this workflow
  const r1 = await request({
    hostname: N8N_URL,
    path: '/api/v1/executions?workflowId=nkp8BcGXisFl9HAN&limit=1&includeData=true',
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  
  const execs = JSON.parse(r1.d);
  const latest = (execs.data || execs)[0];
  
  if (!latest) {
    console.log('No executions found');
    return;
  }
  
  console.log('Execution:', latest.id, '| Status:', latest.status || latest.finished);
  
  const data = latest.data;
  if (!data?.resultData?.runData) {
    console.log('No run data available. Trying with full data...');
    // Try getting execution directly
    const r2 = await request({
      hostname: N8N_URL,
      path: `/api/v1/executions/${latest.id}?includeData=true`,
      method: 'GET',
      headers: { 'X-N8N-API-KEY': AUTH_KEY }
    });
    const fullExec = JSON.parse(r2.d);
    if (fullExec.data?.resultData?.runData) {
      analyzeRunData(fullExec.data.resultData.runData);
    } else {
      console.log('Could not get execution data');
      console.log('Keys:', Object.keys(fullExec).join(', '));
      console.log('Raw:', JSON.stringify(fullExec).substring(0, 1000));
    }
    return;
  }
  
  analyzeRunData(data.resultData.runData);
}

function analyzeRunData(runData) {
  for (const [nodeName, nodeRuns] of Object.entries(runData)) {
    const lastRun = nodeRuns[nodeRuns.length - 1];
    const outputData = lastRun?.data?.main?.[0] || [];
    const errorData = lastRun?.error;
    
    console.log(`\n=== ${nodeName} ===`);
    if (errorData) {
      console.log(`  ❌ ERROR: ${errorData.message || JSON.stringify(errorData).substring(0, 300)}`);
    }
    console.log(`  Items out: ${outputData.length}`);
    
    // Show first item output for key nodes
    if (['SambaNova Vision', 'SambaNova Text', 'process-logic', 'filter-node', 'upsert-node'].includes(nodeName)) {
      if (outputData.length > 0) {
        const firstItem = outputData[0]?.json || {};
        console.log(`  First output: ${JSON.stringify(firstItem).substring(0, 400)}`);
      }
      // Also check second output (for If nodes)
      const output2 = lastRun?.data?.main?.[1] || [];
      if (output2.length > 0) {
        console.log(`  Output 2 (${output2.length} items): ${JSON.stringify(output2[0]?.json || {}).substring(0, 300)}`);
      }
    }
  }
}

run().catch(e => console.error('Error:', e.message));
