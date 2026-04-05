const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const wfID = 'nkp8BcGXisFl9HAN';
const POSTGRES_CRED = { id: 'ym3KfQZLjCvWmUjS', name: 'Postgres account' };
const SAMBANOVA_CRED = { id: 'u46bitcJQIW1QNfu', name: 'Header Auth account 2' };
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
  console.log('=== DEPLOYING V40.1 (ALIGNED SCHEMA: SECTOR + WHATSAPP_ID) ===');

  const nodes = [
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [0, 200],
      parameters: { httpMethod: 'POST', path: 'backfill-v40', options: {} }
    },
    {
      id: 'fetch-all',
      name: 'fetch-all',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [200, 400],
      parameters: {
        operation: 'executeQuery',
        query: `SELECT id, key as whatsapp_id, "messageType", message, CASE WHEN "messageType" = 'conversation' THEN message->>'conversation' WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text' WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'caption' ELSE '' END as text_content FROM evolution."Message" WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage') ORDER BY "messageTimestamp" DESC LIMIT 5000`,
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
        headers: { parameters: [{ name: 'apikey', value: EVOLUTION_TOKEN }] },
        options: { responseFormat: 'file' }
      },
      continueOnFail: true
    },
    {
      id: 'base64-converter',
      name: 'Base64 Converter',
      type: 'n8n-nodes-base.moveBinaryData',
      typeVersion: 1,
      position: [950, 200],
      parameters: {
        mode: 'binaryToJson',
        dataProperty: 'data',
        destinationKey: 'image_base64',
        options: { convertAll: false, encoding: 'base64' }
      }
    },
    {
      id: 'vision-ai',
      name: 'Vision Analysis',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [1100, 200],
      parameters: {
        method: 'POST',
        url: 'https://api.sambanova.ai/v1/chat/completions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `{"model":"Llama-3.2-11B-Vision-Instruct","messages":[{"role":"user","content":[{"type":"text","text":"Extrae datos inmobiliarios de esta imagen. Responde SOLO JSON: {\\"proyecto\\":\\"...\\",\\"zona\\":\\"...\\",\\"precio\\":\\"...\\",\\"habitaciones\\":\\"...\\",\\"amenidades\\":\\"...\\"}"},{"type":"image_url","image_url":{"url":"data:image/jpeg;base64,{{$json.image_base64}}"}}]}]}`,
        options: { timeout: 45000 }
      },
      credentials: { httpHeaderAuth: SAMBANOVA_CRED },
      continueOnFail: true
    },
    {
      id: 'text-ai',
      name: 'Text Analysis',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [1100, 500],
      parameters: {
        method: 'POST',
        url: 'https://api.sambanova.ai/v1/chat/completions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `{"model":"Meta-Llama-3.1-70B-Instruct","messages":[{"role":"system","content":"Experto inmobiliario. Extrae: proyecto, zona, metros, precio, habitaciones, links. Responde SOLO JSON."},{"role":"user","content":"{{ JSON.stringify($json.text_content).slice(1,-1) }}"}],"max_tokens":1000}`,
        options: { timeout: 30000 }
      },
      credentials: { httpHeaderAuth: SAMBANOVA_CRED },
      continueOnFail: true
    },
    {
      id: 'persistence-logic',
      name: 'Persistence Logic',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1300, 400],
      parameters: {
        jsCode: `const item = $input.first().json;
let ai;
try {
  let content = item.choices[0].message.content.replace(/\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '').trim();
  ai = JSON.parse(content);
} catch (e) { return { json: { skip: true } }; }

return {
  json: {
    title: ai.proyecto || ai.nombre_proyecto || 'Propiedad Inmobiliaria',
    price: parseFloat(String(ai.precio).replace(/[^0-9.]/g, '')) || 0,
    sector: ai.zona || ai.sector || 'N/A',
    whatsapp_id: $('split-batches').first().json.whatsapp_id,
    is_published: true
  }
};`
      }
    },
    {
      id: 'neon-upsert',
      name: 'Neon Upsert',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [1500, 400],
      parameters: {
        operation: 'executeQuery',
        query: `INSERT INTO properties (title, price, sector, whatsapp_id, is_published) \nVALUES ('{{ $json.title }}', {{ $json.price }}, '{{ $json.sector }}', '{{ $json.whatsapp_id }}', {{ $json.is_published }}) \nON CONFLICT (whatsapp_id) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price;`,
        options: {}
      },
      credentials: { postgres: POSTGRES_CRED }
    }
  ];

  const connections = {
    'Webhook Trigger': { main: [[{ node: 'fetch-all', type: 'main', index: 0 }]] },
    'fetch-all': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] },
    'split-batches': { main: [[{ node: 'check-type', type: 'main', index: 0 }]] },
    'check-type': { 
      main: [
        [{ node: 'Fetch Media', type: 'main', index: 0 }],
        [{ node: 'Text Analysis', type: 'main', index: 0 }]
      ]
    },
    'Fetch Media': { main: [[{ node: 'Base64 Converter', type: 'main', index: 0 }]] },
    'Base64 Converter': { main: [[{ node: 'Vision Analysis', type: 'main', index: 0 }]] },
    'Vision Analysis': { main: [[{ node: 'Persistence Logic', type: 'main', index: 0 }]] },
    'Text Analysis': { main: [[{ node: 'Persistence Logic', type: 'main', index: 0 }]] },
    'Persistence Logic': { main: [[{ node: 'Neon Upsert', type: 'main', index: 0 }]] },
    'Neon Upsert': { main: [[{ node: 'split-batches', type: 'main', index: 0 }]] }
  };

  const payload = { name: '[PROD] Real Estate Intelligence V40.1 (Aligned Schema)', nodes, connections, settings: { executionOrder: 'v1' } };
  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);

  console.log('Update V40.1 Status:', putRes.s);
  
  await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}/activate`,
    method: 'POST',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });

  console.log('\n✅ V40.1 ALIGNED PIPELINE DEPLOYED');
}

run().catch(console.error);
