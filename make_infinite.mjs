const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WF_ID = 'tNfL2APn3vXKgTea';

async function makeInfinite() {
  console.log('📡 Fetching workflow...');
  const r = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await r.json();
  console.log(`Got ${wf.nodes.length} nodes`);

  // ===== 1. Add pagination manager node (after trigger, before DB fetch) =====
  const paginationNode = {
    id: 'pagination-node',
    name: 'Gestionar Paginación',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [300, 400],
    parameters: {
      jsCode: `// Persistent pagination using workflow static data
const staticData = $getWorkflowStaticData('global');

// Initialize offset if not set
if (staticData.offset === undefined) {
  staticData.offset = 0;
}

const currentOffset = staticData.offset;
const batchSize = 5;

return {
  json: {
    offset: currentOffset,
    batchSize: batchSize,
    cycle: staticData.cycle || 1
  }
};`
    }
  };

  // ===== 2. Modify the fetch query to use dynamic OFFSET (no time filter!) =====
  const fetchNode = wf.nodes.find(n => n.id === 'fetch-node');
  if (fetchNode) {
    fetchNode.parameters.query = `SELECT * FROM evolution."Message" 
WHERE "message"->>'imageMessage' IS NOT NULL
ORDER BY "messageTimestamp" ASC
LIMIT {{ $json.batchSize }}
OFFSET {{ $json.offset }};`;
    fetchNode.position = [500, 400];
    console.log('✅ Fetch query: ALL messages with OFFSET pagination');
  }

  // ===== 3. Add "advance offset" node after DB save =====
  const advanceNode = {
    id: 'advance-node',
    name: 'Avanzar Paginación',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1700, 400],
    parameters: {
      jsCode: `// Advance the offset for next run
const staticData = $getWorkflowStaticData('global');
const batchSize = 5;

staticData.offset = (staticData.offset || 0) + batchSize;

return {
  json: {
    nextOffset: staticData.offset,
    status: 'batch_processed',
    message: 'Offset advanced to ' + staticData.offset
  }
};`
    }
  };

  // ===== 4. Add "reset offset" node for when no results =====
  const resetNode = {
    id: 'reset-node',
    name: 'Reiniciar Ciclo',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [700, 600],
    parameters: {
      jsCode: `// No more messages - reset offset to start over
const staticData = $getWorkflowStaticData('global');
const previousOffset = staticData.offset || 0;

staticData.offset = 0;
staticData.cycle = (staticData.cycle || 1) + 1;

return {
  json: {
    status: 'cycle_complete',
    processedUpTo: previousOffset,
    newCycle: staticData.cycle,
    message: 'Processed all messages. Restarting from beginning (cycle ' + staticData.cycle + ')'
  }
};`
    }
  };

  // ===== 5. Modify IF node to check if results exist =====
  const ifNode = wf.nodes.find(n => n.id === 'if-node');
  if (ifNode) {
    // The IF node checks AFTER the DB fetch if there are results
    // We need to change it: if message has imageMessage data → process
    // The original condition should still work for checking media
    ifNode.position = [700, 300];
  }

  // ===== 6. Remove old pagination node if exists, add new ones =====
  wf.nodes = wf.nodes.filter(n => 
    !['pagination-node', 'advance-node', 'reset-node'].includes(n.id)
  );
  wf.nodes.push(paginationNode, advanceNode, resetNode);

  // ===== 7. Reposition existing nodes =====
  const positions = {
    'Análisis de IA (Groq)': [1100, 400],
    'Parsear Respuesta IA': [1300, 400],
    'Guardar en Cockroach': [1500, 400],
    'Descargar contenido': [900, 200],
    'Traductor Maestro': [1100, 200],
    'Carga a Dropbox': [1300, 200]
  };
  
  for (const [name, pos] of Object.entries(positions)) {
    const node = wf.nodes.find(n => n.name === name);
    if (node) node.position = pos;
  }

  // Find trigger node
  const trigger = wf.nodes.find(n => n.type.includes('scheduleTrigger'));
  if (trigger) {
    trigger.position = [100, 400];
  }

  // ===== 8. Rewire ALL connections =====
  const triggerName = trigger?.name || 'Cada 1 minuto';
  
  wf.connections = {
    [triggerName]: {
      main: [[{ node: 'Gestionar Paginación', type: 'main', index: 0 }]]
    },
    'Gestionar Paginación': {
      main: [[{ node: 'Obtener mensajes', type: 'main', index: 0 }]]
    },
    'Obtener mensajes': {
      main: [[{ node: '¿Tiene medios?', type: 'main', index: 0 }]]
    },
    '¿Tiene medios?': {
      main: [
        // true → process media
        [{ node: 'Descargar contenido', type: 'main', index: 0 }],
        // false → no media results, reset cycle
        [{ node: 'Reiniciar Ciclo', type: 'main', index: 0 }]
      ]
    },
    'Descargar contenido': {
      main: [[{ node: 'Traductor Maestro', type: 'main', index: 0 }]]
    },
    'Traductor Maestro': {
      main: [[{ node: 'Carga a Dropbox', type: 'main', index: 0 }]]
    },
    'Carga a Dropbox': {
      main: [[{ node: 'Análisis de IA (Groq)', type: 'main', index: 0 }]]
    },
    'Análisis de IA (Groq)': {
      main: [[{ node: 'Parsear Respuesta IA', type: 'main', index: 0 }]]
    },
    'Parsear Respuesta IA': {
      main: [[{ node: 'Guardar en Cockroach', type: 'main', index: 0 }]]
    },
    'Guardar en Cockroach': {
      main: [[{ node: 'Avanzar Paginación', type: 'main', index: 0 }]]
    }
  };

  console.log('✅ Connections rewired for infinite loop');

  // ===== 9. Push =====
  console.log('\n📤 Pushing...');
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

  if (putRes.ok) {
    const d = await putRes.json();
    console.log(`\n✅ SUCCESS! ${d.nodes.length} nodes deployed`);
    console.log('   Active:', d.active);
    console.log('\n📋 Flow:');
    console.log('   ⏰ Trigger → 📊 Pagination → 🐘 Fetch ALL → ❓ Has Media?');
    console.log('   ├─ YES → Download → Convert → Dropbox → Groq AI → Parse → Save → ⏩ Advance Offset');
    console.log('   └─ NO  → 🔄 Reset to beginning (new cycle)');
    console.log('\n   This creates an INFINITE LOOP through all messages!');
    
    console.log('\nNodes:');
    d.nodes.forEach(n => console.log(`   ${n.name} (${n.type.split('.').pop()})`));
    
    console.log('\nConnections:');
    Object.entries(d.connections).forEach(([src, conn]) => {
      conn.main?.forEach((outputs, idx) => {
        outputs?.forEach(link => {
          const label = conn.main.length > 1 ? (idx === 0 ? ' [TRUE]' : ' [FALSE]') : '';
          console.log(`   ${src}${label} → ${link.node}`);
        });
      });
    });
  } else {
    console.log('❌', putRes.status, await putRes.text());
  }
}

makeInfinite();
