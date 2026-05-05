const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WORKFLOW_ID = 'tNfL2APn3vXKgTea';

async function wireCredentials() {
  const res = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();

  // Wire the AI node
  const aiNode = wf.nodes.find(n => n.name === 'Análisis de IA (SambaNova)');
  if (aiNode) {
    aiNode.parameters.authentication = 'genericCredentialType';
    aiNode.parameters.genericAuthType = 'httpHeaderAuth';
    aiNode.credentials = {
      httpHeaderAuth: {
        id: 'KwSuSbN8o5BztaZX',
        name: 'Header Auth account 3'
      }
    };

    // Bulletproof body using JSON.stringify
    aiNode.parameters.body = '={{ JSON.stringify({ model: "Meta-Llama-3.1-70B-Instruct", stream: false, temperature: 0.1, messages: [{ role: "system", content: "Eres un experto inmobiliario. Analiza el siguiente mensaje de WhatsApp y extrae los datos de la propiedad en formato JSON con estos campos: titulo, descripcion (sin contactos ni telefonos), precio, ubicacion, caracteristicas, tipo_propiedad, estado. Si es de constructora oficial pon es_oficial: true, sino false." }, { role: "user", content: $node["Obtener mensajes"].json.message || "sin mensaje" }] }) }}';

    delete aiNode.parameters.bodyInput;
    delete aiNode.parameters.jsonParameters;
    delete aiNode.parameters.bodyParameters;
  }

  // Also fix "Guardar en Cockroach" to use CockroachDB credential (Postgres account 4)
  const dbNode = wf.nodes.find(n => n.name === 'Guardar en Cockroach');
  if (dbNode) {
    dbNode.credentials = {
      postgres: {
        id: 'Rh6pnnREWkX5ExUN',
        name: 'Postgres account 4'
      }
    };
  }

  // Push with clean settings
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: 'v1' }
  };

  const putRes = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (putRes.status === 200) {
    console.log('✅ V7.0 FINAL: Credentials wired + body fixed.');
    console.log('   AI node: Header Auth account 3');
    console.log('   DB node: Postgres account 4 (CockroachDB)');
  } else {
    const err = await putRes.json();
    console.log('❌ Error:', JSON.stringify(err, null, 2));
  }
}

wireCredentials();
