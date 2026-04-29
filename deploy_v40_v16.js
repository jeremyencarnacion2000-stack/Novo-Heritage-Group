const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const N8N_URL = 'suskj501-n8n.hf.space';
const workflowId = 'nkp8BcGXisFl9HAN';

const POSTGRES_CRED = { host: 'ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech', database: 'neondb', user: 'neondb_owner', password: 'npg_Yhvk2DzABn6P', port: 5432, ssl: true };

// V40.16: PAYLOAD BUILDER + MASTER RESTORATION
const nodes = [
  {
    id: 'trigger',
    name: 'Webhook Trigger',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1.1,
    position: [0, 400],
    parameters: { path: 'backfill-v40', httpMethod: 'POST', responseMode: 'onReceived' }
  },
  {
    id: 'fetch-all',
    name: 'Fetch Member Data',
    type: 'n8n-nodes-base.postgres',
    typeVersion: 2.3,
    position: [200, 400],
    parameters: {
      operation: 'executeQuery',
      query: `SELECT id, key as whatsapp_id, "messageType", message FROM evolution."Message" WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage') AND length(message::text) > 100 ORDER BY id DESC LIMIT 50`,
      options: {}
    },
    credentials: { postgres: POSTGRES_CRED }
  },
  {
    id: 'payload-builder',
    name: 'AI Payload Builder',
    type: 'n8n-nodes-base.code',
    typeVersion: 1,
    position: [400, 400],
    parameters: {
      jsCode: `
        return $input.all().map(item => {
          const msg = item.json.message || {};
          const type = item.json.messageType;
          let text = '';
          if (type === 'conversation') text = msg.conversation || '';
          else if (type === 'extendedTextMessage') text = (msg.extendedTextMessage && msg.extendedTextMessage.text) || '';
          else if (type === 'imageMessage') text = (msg.imageMessage && msg.imageMessage.caption) || '';
          
          const cleanText = text.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/"/g, "'");

          return {
            json: {
              ...item.json,
              ai_payload: {
                model: "Meta-Llama-3.3-70B-Instruct",
                messages: [
                  {
                    role: "user",
                    content: "Extrae JSON inmobiliario: {\\"proyecto\\":\\"...\\",\\"zona\\":\\"...\\",\\"precio\\":\\"...\\",\\"habitaciones\\":\\"...\\",\\"amenidades\\":\\"...\\"}. Texto: " + cleanText
                  }
                ]
              }
            }
          };
        });
      `
    }
  },
  {
    id: 'split-batches',
    name: 'Item Splitter',
    type: 'n8n-nodes-base.splitInBatches',
    typeVersion: 1,
    position: [600, 400],
    parameters: { batchSize: 1, options: {} }
  },
  {
    id: 'text-ai-v41',
    name: 'Text Analysis',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.1,
    position: [800, 400],
    parameters: {
      method: 'POST',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Authorization', value: 'Bearer 6295ae62-0920-4172-abc8-9548092ac526' },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ $json.ai_payload }}',
      options: { responseFormat: 'json' }
    }
  },
  {
    id: 'persist-logic',
    name: 'Persistence Logic',
    type: 'n8n-nodes-base.code',
    typeVersion: 1,
    position: [1000, 400],
    parameters: {
      jsCode: `
        const item = $input.first().json;
        if (!item.choices) return { json: { skip: true } };
        
        let ai = {};
        try {
          let content = item.choices[0].message.content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
          ai = JSON.parse(content);
        } catch (e) { return { json: { skip: true } }; }
        
        if (!ai.precio || String(ai.precio).includes('...')) return { json: { skip: true } };
        
        return {
          json: {
            title: ai.proyecto || 'Sin Titulo',
            price: parseFloat(String(ai.precio).replace(/[^0-9.]/g, '')) || 0,
            sector: ai.zona || 'N/A',
            whatsapp_id: $('Item Splitter').first().json.whatsapp_id,
            is_published: true
          }
        };
      `
    }
  },
  {
    id: 'neon-filter',
    name: 'Skip Errors',
    type: 'n8n-nodes-base.if',
    typeVersion: 1,
    position: [1200, 400],
    parameters: {
      conditions: {
        boolean: [{ value1: '={{$json["skip"]}}', operation: 'notEqual', value2: true }]
      }
    }
  },
  {
    id: 'neon-upsert',
    name: 'Neon Upsert',
    type: 'n8n-nodes-base.postgres',
    typeVersion: 2.3,
    position: [1400, 400],
    parameters: {
      operation: 'executeQuery',
      query: `=INSERT INTO properties (title, price, sector, whatsapp_id, is_published) VALUES ('{{ $json.title }}', {{ $json.price }}, '{{ $json.sector }}', '{{ $json.whatsapp_id }}', {{ $json.is_published }}) ON CONFLICT (whatsapp_id) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price;`,
      options: {}
    },
    credentials: { postgres: POSTGRES_CRED }
  }
];

const connections = {
  'Webhook Trigger': { main: [[{ node: 'Fetch Member Data', type: 'main', index: 0 }]] },
  'Fetch Member Data': { main: [[{ node: 'AI Payload Builder', type: 'main', index: 0 }]] },
  'AI Payload Builder': { main: [[{ node: 'Item Splitter', type: 'main', index: 0 }]] },
  'Item Splitter': { main: [[{ node: 'Text Analysis', type: 'main', index: 0 }]] },
  'Text Analysis': { main: [[{ node: 'Persistence Logic', type: 'main', index: 0 }]] },
  'Persistence Logic': { main: [[{ node: 'Skip Errors', type: 'main', index: 0 }]] },
  'Skip Errors': { main: [[{ node: 'Neon Upsert', type: 'main', index: 0 }]] },
  'Neon Upsert': { main: [[{ node: 'Item Splitter', type: 'main', index: 0 }]] }
};

function deploy() {
  const data = JSON.stringify({ name: 'PROD: Real Estate Pipeline (V40.16 Master Revision)', nodes, connections, settings: { executionOrder: 'v1' } });
  const req = https.request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${workflowId}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('=== V40.16 DEPLOYED (REVISION) ===');
      console.log('Status:', res.statusCode);
      if (res.statusCode !== 200) console.log('Error Body:', body);
    });
  });
  req.on('error', console.error);
  req.write(data);
  req.end();
}

deploy();
