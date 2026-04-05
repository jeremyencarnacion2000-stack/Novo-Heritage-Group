const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const POSTGRES_CRED = { id: 'ym3KfQZLjCvWmUjS', name: 'Postgres account' };
const SAMBANOVA_CRED = { id: 'u46bitcJQIW1QNfu', name: 'Header Auth account 2' };

const CF_ACCOUNT_ID = '9a24837cd5355d86f8ee13ee3b290cfc';
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
  console.log('=== DEPLOYING V39 (REAL ESTATE INTELLIGENCE PIPELINE) ===');

  const wfID = 'nkp8BcGXisFl9HAN';

  const nodes = [
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [0, 200],
      parameters: { path: 'backfill-v39', options: {} }
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
  "pushName" as sender_name,
  "messageTimestamp" as sent_at
FROM evolution."Message"
WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage')
ORDER BY "messageTimestamp" DESC
LIMIT 5000`,
        options: {}
      },
      credentials: { postgres: POSTGRES_CRED }
    },
    {
      id: 'rapid-filter',
      name: 'Rapid Filter',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [400, 400],
      parameters: {
        conditions: {
          boolean: [
            {
              value1: '={{ $json.text_content.toLowerCase().match(/precio|m2|zona|venta|alquiler|room|habitacion|solar|apartamento|casa/) !== null }}',
              operation: 'isTrue'
            }
          ]
        }
      }
    },
    {
      id: 'split-batches',
      name: 'split-batches',
      type: 'n8n-nodes-base.splitInBatches',
      typeVersion: 3,
      position: [600, 400],
      parameters: { batchSize: 1, options: {} }
    },
    {
      id: 'extraction-ai',
      name: 'SambaNova Extraction',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [800, 400],
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
        jsonBody: `{"model":"Meta-Llama-3.1-70B-Instruct","messages":[{"role":"system","content":"Eres un experto analista inmobiliario. Tu tarea es extraer datos de PROPIEDADES para un catálogo web profesional. No extraigas datos de contacto externos (vendedor), ya que usamos agentes internos.\\n\\nEXTRAE SOLO ESTOS CAMPOS:\\n- nombre_proyecto: El nombre del activo (si no lo hay, asigna un nombre descriptivo)\\n- tipo: (apartamento, casa, local, solar, proyecto, etc.)\\n- precio: (valor numérico, normaliza a USD si es posible)\\n- m2: (valor numérico de área)\\n- zona: (barrio o sector específico)\\n- habitaciones: (número de habitaciones)\\n- amenidades: (lista de extras: piscina, gym, etc.)\\n- relevancia_score: (Integer 0-10 basado en completitud de datos)\\n\\nJSON OUTPUT ONLY."},{"role":"user","content":"{{ JSON.stringify($json.text_content).slice(1, -1) }}"}],"max_tokens":1000}`,
        options: { timeout: 30000 }
      },
      credentials: { httpHeaderAuth: SAMBANOVA_CRED }
    },
    {
      id: 'persistence-logic',
      name: 'Persistence Logic',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1000, 400],
      parameters: {
        jsCode: `const item = $input.first().json;
let ai;
try {
  const content = item.choices[0].message.content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  ai = JSON.parse(content);
} catch (e) {
  return { json: { skip: true } };
}

if ((ai.relevance_score || 0) < 5) return { json: { skip: true } };

return {
  json: {
    title: ai.nombre_proyecto || 'Propiedad Inmobiliaria',
    type: ai.tipo || 'N/A',
    price: parseFloat(String(ai.precio).replace(/[^0-9.]/g, '')) || 0,
    m2: parseFloat(String(ai.m2).replace(/[^0-9.]/g, '')) || 0,
    zone: ai.zona || 'N/A',
    rooms: parseInt(ai.habitaciones) || 0,
    relevance_score: ai.relevance_score || 0,
    is_published: (ai.relevance_score >= 7),
    whatsapp_id: $node["split-batches"].json.whatsapp_id,
    raw_content: $node["split-batches"].json.text_content
  }
};`
      }
    },
    {
      id: 'neon-upsert',
      name: 'Neon Upsert',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [1200, 400],
      parameters: {
        operation: 'executeQuery',
        query: `INSERT INTO properties 
  (title, type, price, m2, zone, rooms, relevance_score, is_published, whatsapp_id, raw_content)
VALUES (
  '{{ $json.title }}',
  '{{ $json.type }}',
  {{ $json.price }},
  {{ $json.m2 }},
  '{{ $json.zone }}',
  {{ $json.rooms }},
  {{ $json.relevance_score }},
  {{ $json.is_published }},
  '{{ $json.whatsapp_id }}',
  '{{ $json.raw_content ? $json.raw_content.replace(/'/g, "''") : "N/A" }}'
)
ON CONFLICT (whatsapp_id) DO UPDATE SET
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published,
  relevance_score = EXCLUDED.relevance_score;`,
        options: {}
      },
      credentials: { postgres: POSTGRES_CRED }
    }
  ];

  const connections = {
    'rapid-filter': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] },
    'split-batches': { main: [[], [{ node: 'extraction-ai', type: 'main', index: 0 }]] },
    'extraction-ai': { main: [[{ node: 'persistence-logic', type: 'main', index: 0 }]] },
    'persistence-logic': { main: [[{ node: 'neon-upsert', type: 'main', index: 0 }]] },
    'neon-upsert': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] }
  };

  const payload = {
    name: '[PROD] Real Estate Intelligence V39',
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

  if (putRes.s !== 200) { console.log('Put Error:', putRes.d); return; }

  // 2. CLEANUP OTHER WORKFLOWS
  console.log('\n=== CLEANING UP LEGACY WORKFLOWS ===');
  const workflowsRes = await request({
    hostname: N8N_URL,
    path: '/api/v1/workflows',
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  
  if (workflowsRes.s === 200) {
    const list = JSON.parse(workflowsRes.d).data;
    for (const w of list) {
       if (w.id !== wfID && w.active) {
         console.log(`Deactivating ${w.name} (${w.id})...`);
         await request({ hostname: N8N_URL, path: `/api/v1/workflows/${w.id}/deactivate`, method: 'POST', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
       }
    }
  }

  // 3. ACTIVATE V39
  console.log('\n=== ACTIVATING V39 ===');
  await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}/activate`,
    method: 'POST',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  // 4. TRIGGER SYNC
  console.log('\n=== TRIGGERING FULL SYNC ===');
  const syncRes = await request({
    hostname: N8N_URL,
    path: '/webhook/backfill-v39',
    method: 'GET'
  });
  console.log('Sync Status:', syncRes.s);

  console.log('Deploy Status:', putRes.s);
  if (putRes.s === 200) {
    console.log('\\n✅ V39 REAL ESTATE PIPELINE DEPLOYED');
    console.log('  • Filter: Keyword-based rapid switch active');
    console.log('  • Extraction: Focus on Property (ignore external sellers)');
    console.log('  • Scoring: Auto-publish threshold = 7');
    console.log('  • Database: Relational Neon schema integrated');
  } else {
    console.log('Error:', putRes.d);
  }
}

run().catch(e => console.error('Fatal:', e.message));
