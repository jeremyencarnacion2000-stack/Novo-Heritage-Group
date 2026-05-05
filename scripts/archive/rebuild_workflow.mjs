const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WORKFLOW_ID = 'tNfL2APn3vXKgTea';

async function rebuild() {
  // 1. Fetch current workflow
  const res = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();

  // 2. Keep ONLY the 7 real nodes we need (by id)
  const keepIds = new Set([
    'start-node',        // Iniciar la ingesta
    'fetch-node',        // Obtener mensajes
    'filter-node',       // ¿Tiene medios?
    'download-node',     // Descargar contenido
    'master-converter',  // Traductor Maestro (base64 converter)
    'dropbox-node',      // Carga a Dropbox
    'final-ai-node',     // Análisis de IA (SambaNova)
    'db-node',           // Guardar en Cockroach
  ]);

  const cleanNodes = wf.nodes.filter(n => keepIds.has(n.id));

  // 3. Fix the AI node - use the REAL node name "Obtener mensajes" directly
  //    Remove the middleman "Organizador Maestro" entirely.
  //    The AI node will reference the source SQL node by its real name.
  const aiNode = cleanNodes.find(n => n.id === 'final-ai-node');
  if (aiNode) {
    aiNode.position = [1300, 400];
    // Use sendBody with raw JSON string mode
    aiNode.parameters = {
      method: 'POST',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'string',
      body: '={{ (function() {\n  const msg = $node["Obtener mensajes"].json.message || "";\n  const payload = {\n    model: "Meta-Llama-3.1-70B-Instruct",\n    stream: false,\n    temperature: 0.1,\n    messages: [\n      {\n        role: "system",\n        content: "Eres un experto inmobiliario. Analiza el siguiente mensaje de WhatsApp y extrae los datos de la propiedad en formato JSON con estos campos: titulo, descripcion (sin contactos ni telefonos), precio, ubicacion, caracteristicas, tipo_propiedad, estado. Si es de constructora oficial pon es_oficial: true, sino false."\n      },\n      {\n        role: "user",\n        content: msg\n      }\n    ]\n  };\n  return JSON.stringify(payload);\n})() }}',
      options: {}
    };
  }

  // 4. Fix positions for a clean layout
  cleanNodes.find(n => n.id === 'start-node').position = [200, 400];
  cleanNodes.find(n => n.id === 'fetch-node').position = [400, 400];
  cleanNodes.find(n => n.id === 'filter-node').position = [600, 400];
  cleanNodes.find(n => n.id === 'download-node').position = [800, 300];
  cleanNodes.find(n => n.id === 'master-converter').position = [1000, 300];
  cleanNodes.find(n => n.id === 'dropbox-node').position = [1200, 300];
  cleanNodes.find(n => n.id === 'db-node').position = [1500, 400];

  // 5. Build CLEAN connections from scratch - NO ghost references
  const cleanConnections = {
    "Iniciar la ingesta": {
      main: [[{ node: "Obtener mensajes", type: "main", index: 0 }]]
    },
    "Obtener mensajes": {
      main: [[{ node: "¿Tiene medios?", type: "main", index: 0 }]]
    },
    "¿Tiene medios?": {
      main: [
        // Output 0 (TRUE - has media): go to download
        [{ node: "Descargar contenido", type: "main", index: 0 }],
        // Output 1 (FALSE - no media): go straight to AI
        [{ node: "Análisis de IA (SambaNova)", type: "main", index: 0 }]
      ]
    },
    "Descargar contenido": {
      main: [[{ node: "Traductor Maestro", type: "main", index: 0 }]]
    },
    "Traductor Maestro": {
      main: [[{ node: "Carga a Dropbox", type: "main", index: 0 }]]
    },
    "Carga a Dropbox": {
      main: [[{ node: "Análisis de IA (SambaNova)", type: "main", index: 0 }]]
    },
    "Análisis de IA (SambaNova)": {
      main: [[{ node: "Guardar en Cockroach", type: "main", index: 0 }]]
    }
  };

  // 6. Build and push
  const payload = {
    name: '[PROD] Ingestor Multimedia v7.0 (Reconstrucción Total)',
    nodes: cleanNodes,
    connections: cleanConnections,
    settings: { executionOrder: 'v1' }
  };

  console.log(`\nRebuild summary:`);
  console.log(`  Nodes: ${cleanNodes.length} (was ${wf.nodes.length})`);
  console.log(`  Connections: ${Object.keys(cleanConnections).length} sources`);
  console.log(`  Node names: ${cleanNodes.map(n => n.name).join(', ')}`);

  const putRes = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (putRes.status === 200) {
    console.log('\n✅ SUCCESS: V7.0 deployed. Clean workflow with 0 ghost nodes.');
    console.log('\n⚠️  NEXT STEP: Open the workflow and configure the HTTP Header Auth');
    console.log('   credential on "Análisis de IA (SambaNova)" with your SambaNova API key.');
  } else {
    const err = await putRes.json();
    console.log('\n❌ Error:', JSON.stringify(err, null, 2));
  }
}

rebuild();
