const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

async function fix() {
  const r = await fetch(`${N8N_URL}/api/v1/workflows/tNfL2APn3vXKgTea`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await r.json();
  
  const f = wf.nodes.find(n => n.id === 'fetch-node');
  if (f) {
    // Fix: messageTimestamp is integer (unix epoch), not timestamp
    // Use EXTRACT(EPOCH FROM NOW()) to compare as integers
    f.parameters.query = `SELECT * FROM evolution."Message" 
WHERE "message"->>'imageMessage' IS NOT NULL 
  AND "messageTimestamp" > CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '10 minutes') AS INTEGER)
ORDER BY "messageTimestamp" DESC 
LIMIT 5;`;
    console.log('✅ Fixed query - comparing integers now');
    console.log('   Query:', f.parameters.query);
  }

  const p = await fetch(`${N8N_URL}/api/v1/workflows/tNfL2APn3vXKgTea`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: { executionOrder: 'v1' }
    })
  });
  
  console.log('Status:', p.status);
  if (p.ok) {
    const d = await p.json();
    console.log('✅ Active:', d.active);
  } else {
    console.log('❌', await p.text());
  }
}

fix();
