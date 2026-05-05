const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WF_ID = 'tNfL2APn3vXKgTea';

async function activate() {
  // 1. Fetch current workflow
  console.log('📡 Fetching workflow...');
  const res = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();

  // 2. Change Manual Trigger → Schedule Trigger (every 5 min)
  const trigger = wf.nodes.find(n => n.id === 'start-node');
  if (trigger) {
    trigger.type = 'n8n-nodes-base.scheduleTrigger';
    trigger.typeVersion = 1.1;
    trigger.name = 'Cada 5 minutos';
    trigger.parameters = {
      rule: {
        interval: [
          { field: 'minutes', minutesInterval: 5 }
        ]
      }
    };
    console.log('✅ Changed trigger: Manual → Schedule (every 5 min)');
  }

  // 3. Update the fetch query to get latest unprocessed messages
  const fetch_node = wf.nodes.find(n => n.id === 'fetch-node');
  if (fetch_node) {
    fetch_node.parameters.query = `SELECT * FROM evolution."Message" 
WHERE "message"->'imageMessage' IS NOT NULL 
  AND "messageTimestamp" > (NOW() - INTERVAL '10 minutes')
ORDER BY "messageTimestamp" DESC 
LIMIT 5;`;
    console.log('✅ Updated query: fetch last 10 min messages (max 5)');
  }

  // 4. Update connections for new trigger name
  if (wf.connections['Iniciar la ingesta']) {
    wf.connections['Cada 5 minutos'] = wf.connections['Iniciar la ingesta'];
    delete wf.connections['Iniciar la ingesta'];
    console.log('✅ Updated connections for new trigger name');
  }

  // 5. Push update
  console.log('\n📤 Pushing workflow...');
  const putRes = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '[PROD] Ingestor Multimedia v8.0 (Producción)',
      nodes: wf.nodes,
      connections: wf.connections,
      settings: { executionOrder: 'v1' }
    })
  });

  if (!putRes.ok) {
    console.log('❌ Update failed:', putRes.status, await putRes.text());
    return;
  }
  console.log('✅ Workflow updated');

  // 6. Activate the workflow
  console.log('\n🚀 Activating workflow...');
  const actRes = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
  });

  if (actRes.ok) {
    const data = await actRes.json();
    console.log('✅ WORKFLOW ACTIVATED!');
    console.log('   Active:', data.active);
    console.log('   Name:', data.name);
  } else {
    // Try PATCH method instead
    console.log('⚠️  POST activate failed, trying PATCH...');
    const patchRes = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
      method: 'PATCH',
      headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });
    
    if (patchRes.ok) {
      const data = await patchRes.json();
      console.log('✅ WORKFLOW ACTIVATED via PATCH!');
      console.log('   Active:', data.active);
    } else {
      console.log('❌ Activation failed:', patchRes.status, await patchRes.text());
      console.log('\n💡 Try activating manually: Open n8n UI → Click "Publish" button');
    }
  }

  // 7. Verify final state
  console.log('\n📋 Final verification...');
  const verifyRes = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const final = await verifyRes.json();
  console.log('   Name:', final.name);
  console.log('   Active:', final.active);
  console.log('   Nodes:', final.nodes.length);
  console.log('   Trigger:', final.nodes.find(n => n.type.includes('Trigger'))?.name);
}

activate();
