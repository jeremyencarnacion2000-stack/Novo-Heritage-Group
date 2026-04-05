const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const POSTGRES_CRED = { id: 'ym3KfQZLjCvWmUjS', name: 'Postgres account' };
const SAMBANOVA_CRED = { id: 'u46bitcJQIW1QNfu', name: 'Header Auth account 2' };

const EVOLUTION_INSTANCE = 'godmodebot';
const EVOLUTION_TOKEN = 'B2A5F6D97C20-4C6C-A383-112B9B535103';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ s: res.statusCode, d: body }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  console.log('=== DEPLOYING V37 (VISION + LINK EXTRACTION) ===');

  const wfID = 'nkp8BcGXisFl9HAN';

  const nodes = [
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [0, 200],
      parameters: {
        path: 'backfill-v37',
        options: {}
      }
    },
    {
      id: 'trigger',
      name: 'Start Backfill',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [0, 400],
      parameters: {}
    },
    {
      id: 'fetch-all',
      name: 'fetch-all',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [200, 400],
      parameters: {
        operation: 'executeQuery',
        query: `SELECT 
  id,
  key as whatsapp_id,
  "messageType",
  CASE
    WHEN "messageType" = 'conversation' THEN message->>'conversation'
    WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
    WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'caption'
    ELSE ''
  END as text_content,
  "pushName",
  "messageTimestamp"
FROM evolution."Message"
WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage')
  AND (
    length(
      CASE
        WHEN "messageType" = 'conversation' THEN message->>'conversation'
        WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
        WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'caption'
        ELSE ''
      END
    ) > 3
    OR message->>'conversation' LIKE '%http%'
    OR "messageType" = 'imageMessage'
  )
ORDER BY "messageTimestamp" DESC
LIMIT 5000`,
        options: {}
      },
      credentials: { postgres: POSTGRES_CRED }
    },
    {
      id: 'split-batches',
      name: 'split-batches',
      type: 'n8n-nodes-base.splitInBatches',
      typeVersion: 3,
      position: [400, 400],
      parameters: { batchSize: 1, options: {} }
    },
    {
      id: 'check-type',
      name: 'check-type',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [600, 400],
      parameters: {
        conditions: {
          string: [
            { value1: '={{$json["messageType"]}}', operation: 'equal', value2: 'imageMessage' }
          ]
        }
      }
    },
    {
      id: 'fetch-media',
      name: 'Fetch Media',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [800, 300],
      parameters: {
        method: 'GET',
        url: '={{"https://wasa-el6v.onrender.com/message/findMedia/" + $json.whatsapp_id + "?key=godmodebot"}}',
        headers: {
          parameters: [{ name: 'apikey', value: EVOLUTION_TOKEN }]
        },
        options: { responseFormat: 'file' }
      },
      continueOnFail: true,
      alwaysOutputData: true
    },
    {
      id: 'base64-converter',
      name: 'Base64 Converter',
      type: 'n8n-nodes-base.moveBinaryData',
      typeVersion: 1,
      position: [850, 150],
      parameters: {
        mode: 'binaryToJson',
        dataProperty: 'data',
        destinationKey: 'image_base64',
        options: {
          convertAll: false,
          encoding: 'base64'
        }
      }
    },
    {
      id: 'has-media',
      name: 'Has Media?',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [950, 300],
      parameters: {
        conditions: {
          string: [{ value1: '={{$json.image_base64 ? "YES" : "NO"}}', operation: 'equal', value2: 'YES' }]
        }
      }
    },
    {
      id: 'vision-call',
      name: 'SambaNova Vision',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [1000, 300],
      parameters: {
        method: 'POST',
        url: 'https://api.sambanova.ai/v1/chat/completions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [{ name: 'Content-Type', value: 'application/json' }]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `{"model":"Llama-3.2-11B-Vision-Instruct","messages":[{"role":"user","content":[{"type":"text","text":"Extract real estate inventory data from this image/flyer. Responde SOLO JSON: {\\"nombre_proyecto\\":\\"...\\",\\"zona\\":\\"...\\",\\"comision\\":\\"...\\",\\"precio\\":\\"...\\",\\"descripcion\\":\\"...\\",\\"contacto\\":\\"...\\"}"},{"type":"image_url","image_url":{"url":"data:image/jpeg;base64,{{$json.image_base64}}"}}]}]}`,
        options: { timeout: 45000 }
      },
      credentials: { httpHeaderAuth: SAMBANOVA_CRED }
    },
    {
      id: 'text-call',
      name: 'SambaNova Text',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [800, 500],
      parameters: {
        method: 'POST',
        url: 'https://api.sambanova.ai/v1/chat/completions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [{ name: 'Content-Type', value: 'application/json' }]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `{"model":"Meta-Llama-3.1-70B-Instruct","messages":[{"role":"system","content":"Eres un experto en bienes raíces. Analiza el mensaje y extrae los datos del proyecto. SI HAY LINKS (Dropbox, YouTube, Drive, Instagram), busca el nombre del proyecto en el URL o texto circundante. REGLA DE ORO: Si detectas cualquier mención a un proyecto inmobiliario, NUNCA devuelvas SKIP. Haz tu mejor esfuerzo para extraer el nombre. Solo responde JSON: {\\"nombre_proyecto\\":\\"...\\",\\"zona\\":\\"...\\",\\"comision\\":\\"...\\",\\"precio\\":\\"...\\",\\"descripcion\\":\\"...\\",\\"contacto\\":\\"...\\"}"},{"role":"user","content":"{{ JSON.stringify($json.text_content || $json.text || '').slice(1, -1).substring(0, 3000) }}"}],"max_tokens":1000}`,
        options: { timeout: 30000 }
      },
      credentials: { httpHeaderAuth: SAMBANOVA_CRED }
    },
    {
      id: 'process-logic',
      name: 'process-logic',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1250, 400],
      parameters: {
        jsCode: `const items = $input.all();
const results = [];

for (const item of items) {
  try {
    const raw = item.json;
    let aiText = '';
    
    if (raw.choices && raw.choices[0] && raw.choices[0].message) {
      aiText = raw.choices[0].message.content || '';
    } else {
      results.push({ json: { nombre_proyecto: 'SKIP' } });
      continue;
    }
    
    aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch(e) {
      const m = aiText.match(/\\{[\\s\\S]*?\\}/);
      if (m) parsed = JSON.parse(m[0]);
      else { results.push({ json: { nombre_proyecto: 'SKIP' } }); continue; }
    }
    
    const name = (parsed.nombre_proyecto || '').trim();
    if (!name || name === 'SKIP' || name === 'N/A') {
      results.push({ json: { nombre_proyecto: 'SKIP' } });
      continue;
    }

    results.push({
      json: {
        nombre_proyecto: name.replace(/'/g, "''"),
        tipo_activo: 'WhatsApp',
        url_activo: 'N/A',
        stock_disponible: true,
        zona: (parsed.zona || 'N/A').replace(/'/g, "''"),
        comision: (parsed.comision || 'N/A').replace(/'/g, "''"),
        precio: (parsed.precio || 'N/A').replace(/'/g, "''"),
        descripcion: (parsed.descripcion || '').replace(/'/g, "''"),
        contacto: (parsed.contacto || '').replace(/'/g, "''"),
        metadata_json: JSON.stringify(parsed).replace(/'/g, "''")
      }
    });
  } catch(e) {
    results.push({ json: { nombre_proyecto: 'SKIP', _error: e.message } });
  }
}

return results;`
      }
    },
    {
      id: 'filter-node',
      name: 'filter-node',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [1450, 400],
      parameters: {
        conditions: {
          string: [{ value1: '={{$json.nombre_proyecto}}', operation: 'notEqual', value2: 'SKIP' }]
        }
      }
    },
    {
      id: 'upsert-node',
      name: 'upsert-node',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [1650, 350],
      parameters: {
        operation: 'executeQuery',
        query: `INSERT INTO public.inventario_digital 
  (nombre_proyecto, tipo_activo, url_activo, stock_disponible, zona, comision, precio, descripcion, contacto, metadata)
VALUES (
  '{{ $json.nombre_proyecto }}',
  '{{ $json.tipo_activo }}',
  '{{ $json.url_activo }}',
  {{ $json.stock_disponible }},
  '{{ $json.zona }}',
  '{{ $json.comision }}',
  '{{ $json.precio }}',
  '{{ $json.descripcion }}',
  '{{ $json.contacto }}',
  '{{ $json.metadata_json }}'::jsonb
)
ON CONFLICT (nombre_proyecto) 
DO UPDATE SET
  zona = CASE WHEN EXCLUDED.zona != 'N/A' AND EXCLUDED.zona != '' THEN EXCLUDED.zona ELSE inventario_digital.zona END,
  comision = CASE 
    WHEN COALESCE(NULLIF(regexp_replace(EXCLUDED.comision, '[^0-9.]', '', 'g'), '')::numeric, 0) >
         COALESCE(NULLIF(regexp_replace(inventario_digital.comision, '[^0-9.]', '', 'g'), '')::numeric, 0)
    THEN EXCLUDED.comision ELSE inventario_digital.comision END,
  precio = CASE WHEN EXCLUDED.precio != 'N/A' THEN EXCLUDED.precio ELSE inventario_digital.precio END,
  fecha_actualizacion = NOW();`,
        options: {}
      },
      credentials: { postgres: POSTGRES_CRED }
    },
    {
      id: 'delay-node',
      name: 'delay-node',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1850, 400],
      parameters: {
        jsCode: `await new Promise(r => setTimeout(r, 8000));
return $input.all();`
      }
    }
  ];

  const connections = {
    'Webhook Trigger': { main: [[{ node: 'fetch-all', type: 'main', index: 0 }]] },
    'Start Backfill': { main: [[{ node: 'fetch-all', type: 'main', index: 0 }]] },
    'fetch-all': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] },
    'split-batches': { main: [[], [{ node: 'check-type', type: 'main', index: 0 }]] },
    'check-type': {
      main: [
        [{ node: 'Fetch Media', type: 'main', index: 0 }], // TRUE
        [{ node: 'SambaNova Text', type: 'main', index: 0 }] // FALSE
      ]
    },
    'Fetch Media': { main: [[{ node: 'Base64 Converter', type: 'main', index: 0 }]] },
    'Base64 Converter': { main: [[{ node: 'Has Media?', type: 'main', index: 0 }]] },
    'Has Media?': {
      main: [
        [{ node: 'SambaNova Vision', type: 'main', index: 0 }], // TRUE
        [{ node: 'SambaNova Text', type: 'main', index: 0 }]  // FALSE
      ]
    },
    'SambaNova Vision': { main: [[{ node: 'process-logic', type: 'main', index: 0 }]] },
    'SambaNova Text': { main: [[{ node: 'process-logic', type: 'main', index: 0 }]] },
    'process-logic': { main: [[{ node: 'filter-node', type: 'main', index: 0 }]] },
    'filter-node': {
      main: [
        [{ node: 'upsert-node', type: 'main', index: 0 }],
        [{ node: 'delay-node', type: 'main', index: 0 }]
      ]
    },
    'upsert-node': { main: [[{ node: 'delay-node', type: 'main', index: 0 }]] },
    'delay-node': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] }
  };

  const payload = {
    name: '[PROD] Godmode Backfill V37 (Vision + Links)',
    nodes,
    connections,
    settings: { executionOrder: 'v1' }
  };

  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);

  console.log('Deploy Status:', putRes.s);
  if (putRes.s === 200) {
    console.log('\n✅ V37 DEPLOYED SUCCESSFULLY');
    console.log('  • Vision: Llama 3.2 11B enabled');
    console.log('  • Links: Improved extraction for Dropbox/YouTube');
    console.log('  • Media: Fetching direct from Evolution API');
    console.log('  • Logic: Relaxed SQL filters to capture more data');
  } else {
    console.log('Error:', putRes.d);
  }
}

run().catch(e => console.error('Fatal:', e.message));
