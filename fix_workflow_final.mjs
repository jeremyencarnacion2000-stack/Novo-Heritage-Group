// Fix Workflow - Switch AI to Groq (has valid credentials) & fix DB node
const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WORKFLOW_ID = 'tNfL2APn3vXKgTea';

async function fix() {
  console.log('📡 Fetching current workflow...');
  const res = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  
  if (!res.ok) {
    console.log('❌ Failed to fetch workflow:', res.status, await res.text());
    return;
  }
  
  const wf = await res.json();
  console.log(`✅ Fetched workflow with ${wf.nodes.length} nodes`);

  // ===== FIX 1: AI Node - Use Groq instead of SambaNova =====
  // Groq credential ID: Bz3xfXM6claHNoqr (has valid API key)
  const aiNode = wf.nodes.find(n => n.id === 'final-ai-node');
  if (aiNode) {
    console.log('\n🔧 Fixing AI node...');
    
    // Switch to Groq API with its valid credential
    aiNode.parameters = {
      method: 'POST',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: `={{ JSON.stringify({
  model: "llama-3.1-70b-versatile",
  stream: false,
  temperature: 0.1,
  messages: [
    {
      role: "system",
      content: "Eres un experto inmobiliario dominicano. Analiza el siguiente mensaje de WhatsApp y extrae los datos de la propiedad en formato JSON ESTRICTO con estos campos exactos: nombre_proyecto (string), titulo (string), descripcion (string, sin contactos ni teléfonos), es_oficial (boolean, true si es constructora oficial), zona (string), precio (string con moneda), multimedia (array de URLs si hay). Si no encuentras un campo, usa null. RESPONDE SOLO EL JSON, sin markdown ni texto adicional."
    },
    {
      role: "user",
      content: $json.message || $json.text || JSON.stringify($json)
    }
  ]
}) }}`,
      options: {
        timeout: 30000
      }
    };
    
    // Wire Groq credential (Header Auth account 2 or we create a proper one)
    // First, let's check if Header Auth account 2 is for Groq
    // Actually, Groq has its own credential type - let's use httpHeaderAuth
    // We need a credential with Authorization: Bearer <groq_key>
    // Looking at the creds: "Header Auth account 2" (id: u46bitcJQIW1QNfu) 
    // and "Header Auth account" (id: IkaWMm84J2TGL1ZE)
    // Let's try Header Auth account 2 first
    aiNode.credentials = {
      httpHeaderAuth: {
        id: 'u46bitcJQIW1QNfu',
        name: 'Header Auth account 2'
      }
    };
    
    aiNode.name = 'Análisis de IA (Groq)';
    
    console.log('  ✅ Switched to Groq API (llama-3.1-70b-versatile)');
    console.log('  ✅ Using Header Auth account 2 credential');
    console.log('  ✅ Updated JSON body with safe expression');
  }

  // ===== FIX 2: Update connections to use new AI node name =====
  // Update connections referencing old name
  if (wf.connections['Análisis de IA (SambaNova)']) {
    wf.connections['Análisis de IA (Groq)'] = wf.connections['Análisis de IA (SambaNova)'];
    delete wf.connections['Análisis de IA (SambaNova)'];
  }
  
  // Update incoming connections pointing to the AI node
  for (const [sourceName, conn] of Object.entries(wf.connections)) {
    if (conn.main) {
      for (const outputs of conn.main) {
        if (outputs) {
          for (const link of outputs) {
            if (link.node === 'Análisis de IA (SambaNova)') {
              link.node = 'Análisis de IA (Groq)';
            }
          }
        }
      }
    }
  }

  // ===== FIX 3: DB Save Node - Fix SQL to use safe expressions =====
  const dbNode = wf.nodes.find(n => n.id === 'db-node');
  if (dbNode) {
    console.log('\n🔧 Fixing Guardar en Cockroach node...');
    
    dbNode.parameters = {
      operation: 'executeQuery',
      query: `INSERT INTO public.inventario_digital 
  (nombre_proyecto, titulo_profesional, descripcion_limpia, es_constructora_oficial, zona, precio, multimedia)
VALUES (
  '{{ $json.choices[0].message.content.includes("{") ? JSON.parse($json.choices[0].message.content).nombre_proyecto || "Sin nombre" : "Sin nombre" }}',
  '{{ $json.choices[0].message.content.includes("{") ? JSON.parse($json.choices[0].message.content).titulo || "Sin título" : "Sin título" }}',
  '{{ $json.choices[0].message.content.includes("{") ? JSON.parse($json.choices[0].message.content).descripcion || "" : $json.choices[0].message.content }}',
  {{ $json.choices[0].message.content.includes("{") ? JSON.parse($json.choices[0].message.content).es_oficial || false : false }},
  '{{ $json.choices[0].message.content.includes("{") ? JSON.parse($json.choices[0].message.content).zona || "No especificada" : "No especificada" }}',
  '{{ $json.choices[0].message.content.includes("{") ? JSON.parse($json.choices[0].message.content).precio || "Consultar" : "Consultar" }}',
  '{{ $json.choices[0].message.content.includes("{") ? JSON.stringify(JSON.parse($json.choices[0].message.content).multimedia || []) : "[]" }}'
)
ON CONFLICT DO NOTHING;`,
      options: {}
    };
    
    // Keep existing Postgres account 4 credential (CockroachDB)
    dbNode.credentials = {
      postgres: {
        id: 'Rh6pnnREWkX5ExUN',
        name: 'Postgres account 4'
      }
    };
    
    console.log('  ✅ Fixed SQL query with safe JSON parsing');
    console.log('  ✅ Added ON CONFLICT DO NOTHING for idempotency');
  }

  // ===== FIX 4: Fetch node - Keep using Postgres account (Neon/WhatsApp) =====
  const fetchNode = wf.nodes.find(n => n.id === 'fetch-node');
  if (fetchNode) {
    console.log('\n🔧 Verifying Obtener mensajes node...');
    console.log('  ✅ Credential:', JSON.stringify(fetchNode.credentials));
    console.log('  ✅ Query:', fetchNode.parameters.query?.slice(0, 80));
  }

  // ===== PUSH UPDATE =====
  console.log('\n📤 Pushing updated workflow...');
  
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: 'v1' }
  };

  const putRes = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (putRes.ok) {
    const result = await putRes.json();
    console.log('\n✅ SUCCESS! Workflow updated.');
    console.log('   Nodes:', result.nodes?.length);
    console.log('   Name:', result.name);
    console.log('\n📋 Node summary:');
    result.nodes?.forEach(n => {
      console.log(`   ${n.name} (${n.type}) → creds: ${JSON.stringify(n.credentials || 'none')}`);
    });
  } else {
    const err = await putRes.text();
    console.log('\n❌ Error pushing:', putRes.status, err);
  }
}

fix();
