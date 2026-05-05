const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WORKFLOW_ID = 'tNfL2APn3vXKgTea';

async function finalFix() {
  const res = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();

  const aiNode = wf.nodes.find(n => n.name === 'Análisis de IA (SambaNova)');
  if (aiNode) {
    // CORRECT configuration for HTTP Request v4.1 sending JSON:
    // contentType = "json", specifyBody = "json", jsonBody = expression
    aiNode.parameters = {
      method: 'POST',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ model: "Meta-Llama-3.1-70B-Instruct", stream: false, temperature: 0.1, messages: [{ role: "system", content: "Eres un experto inmobiliario. Analiza el siguiente mensaje de WhatsApp y extrae los datos de la propiedad en formato JSON con estos campos: titulo, descripcion (sin contactos ni telefonos), precio, ubicacion, caracteristicas, tipo_propiedad, estado. Si es de constructora oficial pon es_oficial: true, sino false." }, { role: "user", content: $node["Obtener mensajes"].json.message || "sin mensaje" }] }) }}',
      options: {}
    };

    // Keep credential
    aiNode.credentials = {
      httpHeaderAuth: {
        id: 'KwSuSbN8o5BztaZX',
        name: 'Header Auth account 3'
      }
    };

    console.log('✅ AI node reconfigured with contentType=json + jsonBody');
  }

  // Push
  const putRes = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: { executionOrder: 'v1' }
    })
  });

  if (putRes.status === 200) {
    console.log('✅ V7.1 deployed successfully');
  } else {
    console.log('❌', JSON.stringify(await putRes.json(), null, 2));
  }
}

finalFix();
