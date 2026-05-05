const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

async function fix() {
  const r = await fetch(`${N8N_URL}/api/v1/workflows/tNfL2APn3vXKgTea`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await r.json();
  console.log('Got', wf.nodes.length, 'nodes');

  // 1. Change trigger to every 1 minute
  const trigger = wf.nodes.find(n => n.name === 'Cada 5 minutos');
  if (trigger) {
    trigger.name = 'Cada 1 minuto';
    trigger.parameters = {
      rule: {
        interval: [
          { field: 'minutes', minutesInterval: 1 }
        ]
      }
    };
    console.log('✅ Trigger: every 1 minute');
  }

  // 2. Widen query to 24h window (ON CONFLICT handles dupes)
  const fetch_node = wf.nodes.find(n => n.id === 'fetch-node');
  if (fetch_node) {
    fetch_node.parameters.query = `SELECT * FROM evolution."Message" 
WHERE "message"->>'imageMessage' IS NOT NULL 
  AND "messageTimestamp" > CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') AS INTEGER)
ORDER BY "messageTimestamp" DESC 
LIMIT 10;`;
    console.log('✅ Query: 24h window, limit 10');
  }

  // 3. Fix connection name
  if (wf.connections['Cada 5 minutos']) {
    wf.connections['Cada 1 minuto'] = wf.connections['Cada 5 minutos'];
    delete wf.connections['Cada 5 minutos'];
  }

  // 4. Push
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

  if (p.ok) {
    const d = await p.json();
    console.log('✅ Updated. Active:', d.active);
    console.log('   Trigger:', d.nodes.find(n => n.type.includes('schedule'))?.name);
  } else {
    console.log('❌', p.status, await p.text());
  }
}

fix();
