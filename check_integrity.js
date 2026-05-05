const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

async function queryViaN8n() {
  // Create a temporary workflow that queries the DB and returns results via webhook
  const tempWf = {
    name: '[TEMP] DB Integrity Check',
    nodes: [
      {
        id: 'trigger',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 300],
        parameters: {}
      },
      {
        id: 'query-total',
        name: 'Query Total',
        type: 'n8n-nodes-base.postgres',
        typeVersion: 2.5,
        position: [300, 300],
        parameters: {
          operation: 'executeQuery',
          query: `SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', '') AND nombre_proyecto IS NOT NULL) as con_nombre,
  COUNT(*) FILTER (WHERE nombre_proyecto IN ('Sin nombre', 'Parseo fallido', '') OR nombre_proyecto IS NULL) as sin_nombre,
  COUNT(*) FILTER (WHERE precio NOT IN ('Consultar', '', 'null') AND precio IS NOT NULL) as con_precio,
  COUNT(*) FILTER (WHERE zona NOT IN ('No especificada', '', 'null') AND zona IS NOT NULL) as con_zona,
  COUNT(*) FILTER (WHERE multimedia IS NOT NULL AND multimedia != '[]' AND multimedia != '') as con_media,
  COUNT(*) FILTER (WHERE descripcion_limpia IS NOT NULL AND LENGTH(descripcion_limpia) > 10) as con_desc,
  COUNT(*) FILTER (WHERE es_constructora_oficial = true) as oficiales
FROM public.inventario_digital;`,
          options: {}
        },
        credentials: {
          postgres: { id: 'Rh6pnnREWkX5ExUN', name: 'Postgres account 4' }
        }
      },
      {
        id: 'query-samples',
        name: 'Query Samples',
        type: 'n8n-nodes-base.postgres',
        typeVersion: 2.5,
        position: [500, 300],
        parameters: {
          operation: 'executeQuery',
          query: `SELECT nombre_proyecto, titulo_profesional, zona, precio, es_constructora_oficial, 
  LENGTH(descripcion_limpia) as desc_len
FROM public.inventario_digital 
WHERE nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', '')
ORDER BY ctid DESC LIMIT 10;`,
          options: {}
        },
        credentials: {
          postgres: { id: 'Rh6pnnREWkX5ExUN', name: 'Postgres account 4' }
        }
      },
      {
        id: 'query-top',
        name: 'Query Top Projects',
        type: 'n8n-nodes-base.postgres',
        typeVersion: 2.5,
        position: [700, 300],
        parameters: {
          operation: 'executeQuery',
          query: `SELECT nombre_proyecto, COUNT(*) as cnt 
FROM public.inventario_digital 
GROUP BY nombre_proyecto 
ORDER BY cnt DESC LIMIT 15;`,
          options: {}
        },
        credentials: {
          postgres: { id: 'Rh6pnnREWkX5ExUN', name: 'Postgres account 4' }
        }
      }
    ],
    connections: {
      'Manual Trigger': { main: [[{ node: 'Query Total', type: 'main', index: 0 }]] },
      'Query Total': { main: [[{ node: 'Query Samples', type: 'main', index: 0 }]] },
      'Query Samples': { main: [[{ node: 'Query Top Projects', type: 'main', index: 0 }]] }
    },
    settings: { executionOrder: 'v1' }
  };

  // Create temp workflow
  console.log('📡 Creating temp query workflow...');
  const createRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(tempWf)
  });
  
  if (!createRes.ok) {
    console.log('❌ Create failed:', createRes.status, await createRes.text());
    return;
  }
  
  const created = await createRes.json();
  const tempId = created.id;
  console.log('✅ Created temp workflow:', tempId);

  // Execute it manually via test endpoint
  console.log('▶️  Running query...');
  const execRes = await fetch(`${N8N_URL}/api/v1/workflows/${tempId}/run`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  // If direct exec doesn't work, check executions
  if (execRes.status === 405) {
    console.log('Using execution list approach...');
    // Wait a bit then check
    await new Promise(r => setTimeout(r, 3000));
    const execListRes = await fetch(`${N8N_URL}/api/v1/executions?workflowId=${tempId}&limit=1`, {
      headers: { 'X-N8N-API-KEY': API_KEY }
    });
    const execList = await execListRes.json();
    if (execList.data?.length > 0) {
      const execId = execList.data[0].id;
      const detailRes = await fetch(`${N8N_URL}/api/v1/executions/${execId}`, {
        headers: { 'X-N8N-API-KEY': API_KEY }
      });
      const detail = await detailRes.json();
      console.log('\n📊 RESULTS:');
      console.log(JSON.stringify(detail.data?.resultData?.runData, null, 2));
    }
  } else if (execRes.ok) {
    const result = await execRes.json();
    console.log('\n📊 RESULTS:');
    console.log(JSON.stringify(result, null, 2));
  }

  // Cleanup
  console.log('\n🗑️ Deleting temp workflow...');
  await fetch(`${N8N_URL}/api/v1/workflows/${tempId}`, {
    method: 'DELETE',
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  console.log('✅ Cleaned up');
}

queryViaN8n();
