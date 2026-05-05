const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WORKFLOW_ID = 'tNfL2APn3vXKgTea';

async function cleanupAndFixV6() {
  try {
    const res = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
      headers: { 'X-N8N-API-KEY': API_KEY }
    });
    const wf = await res.json();

    wf.name = '[PROD] Ingestor Multimedia v6.0 (Arquitectura Blindada)';

    // 1. Identify and Keep only one instance of each logical node
    const keptNodes = [];
    const seenNames = new Set();
    
    // Core nodes for the production flow
    const coreNames = [
        'Iniciar la ingesta',
        'obtener mensajes',
        'WhatsAppSource',
        '¿Tiene medios?',
        'Descargar contenido',
        'Traductor Maestro',
        'Carga a Dropbox',
        'Organizador Maestro',
        'Análisis de IA (SambaNova)',
        'Guardar en Cucaracha',
        'Guardar en Cockroach'
    ];

    wf.nodes.forEach(node => {
        if (!seenNames.has(node.name)) {
            seenNames.add(node.name);
            keptNodes.push(node);
        }
    });
    wf.nodes = keptNodes;

    // 2. Final Technical Renaming for absolute stability
    const sqlNode = wf.nodes.find(n => n.name === 'obtener mensajes' || n.name === 'WhatsAppSource');
    if (sqlNode) sqlNode.name = 'WhatsApp_SQL_Source';

    const mapperNode = wf.nodes.find(n => n.name === 'Organizador Maestro');
    if (mapperNode) {
        mapperNode.parameters.values.string[0].value = "={{ $node[\"WhatsApp_SQL_Source\"].json.message }}";
        mapperNode.parameters.values.string[1].value = "={{ $json[\"public_url\"] || \"\" }}";
    }

    const switchNode = wf.nodes.find(n => n.name === '¿Tiene medios?');
    if (switchNode) {
        switchNode.parameters.value1 = "={{ $node[\"WhatsApp_SQL_Source\"].json.mediaType }}";
    }

    const aiNode = wf.nodes.find(n => n.name === 'Análisis de IA (SambaNova)');
    if (aiNode) {
        aiNode.parameters.specifyBody = 'string';
        aiNode.parameters.bodyInput = '={\n  "model": "Meta-Llama-3.1-70B-Instruct-Turbo",\n  "stream": false,\n  "temperature": 0.1,\n  "messages": [\n    {\n      "role": "system\",\n      "content": "Eres un experto inmobiliario. Extrae los datos de la propiedad en JSON: titulo, descripcion (sin contactos), precio, ubicacion, caracteristicas, tipo_propiedad, estado. Si es de constructora oficial pon es_oficial: true."\n    },\n    {\n      "role": "user\",\n      "content": ' + 'JSON.stringify($json.message)' + '\n    }\n  ]\n}';
    }

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
      console.log('SUCCESS: V6.0 Cleaned and Blinded.');
    } else {
      console.log('Error:', await putRes.json());
    }
  } catch (err) {
    console.error('Fatal:', err.message);
  }
}

cleanupAndFixV6();
