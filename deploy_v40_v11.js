const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const N8N_URL = 'suskj501-n8n.hf.space';
const workflowId = 'nkp8BcGXisFl9HAN';

const SAMBANOVA_API = '6295ae62-0920-4172-abc8-9548092ac526';
const POSTGRES_CRED = { host: 'ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech', database: 'neondb', user: 'neondb_owner', password: 'npg_Yhvk2DzABn6P', port: 5432, ssl: true };

// V40.11: LLAMA 3.3 EDITION + NEW KEY + SAFE JSON
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
      query: `SELECT id, key as whatsapp_id, "messageType", message FROM evolution."Message" WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage') ORDER BY id DESC LIMIT 50`,
      options: {}
    },
    credentials: { postgres: POSTGRES_CRED }
  },
  {
    id: 'format-data',
    name: 'Format Data (JS)',
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
          
          const escape = (str) => {
            if (!str) return '';
            return str
              .replace(/\\\\/g, '\\\\\\\\')
              .replace(/\\"/g, '\\\\\\"')
              .replace(/\\n/g, '\\\\n')
              .replace(/\\r/g, '\\\\r')
              .replace(/\\t/g, '\\\\t');
          };

          return {
            json: {
              ...item.json,
              text_content: escape(text),
              is_valid: text && text.length > 100
            }
          };
        }).filter(i => i.json.is_valid);
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
    id: 'media-router',
    name: 'Media Router',
    type: 'n8n-nodes-base.if',
    typeVersion: 1,
    position: [800, 400],
    parameters: {
      conditions: {
        string: [
          {
            value1: '={{$json["messageType"]}}',
            operation: 'equal',
            value2: 'imageMessage'
          }
        ]
      }
    }
  },
  {
    id: 'get-media',
    name: 'Get Image Media',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.1,
    position: [1000, 300],
    parameters: {
      url: '=https://evolution.novoheritage.com/media/download/{{ $json["whatsapp_id"] }}',
      responseFormat: 'file',
      options: { timeout: 30000 }
    }
  },
  {
    id: 'vision-ai',
    name: 'Vision Analysis',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.1,
    position: [1200, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: `={
        "model": "Meta-Llama-3.2-11B-Vision-Instruct",
        "messages": [
          {
            "role": "user",
            "content": [
              {"type": "text", "text": "Extrae JSON inmobiliario: {\\"proyecto\\":\\"...\\",\\"zona\\":\\"...\\",\\"precio\\":\\"...\\",\\"habitaciones\\":\\"...\\",\\"amenidades\\":\\"...\\"}"},
              {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,{{ $json['data'] }}"}}
            ]
          }
        ]
      }`,
      headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer ${SAMBANOVA_API}' }] }
    }
  },
  {
    id: 'text-ai',
    name: 'Text Analysis',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.1,
    position: [1000, 500],
    parameters: {
      method: 'POST',
      url: 'https://api.sambanova.ai/v1/chat/completions',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: `={
        "model": "Meta-Llama-3.3-70B-Instruct",
        "messages": [
          {
            "role": "user",
            "content": "Extrae JSON inmobiliario: {\\"proyecto\\":\\"...\\",\\"zona\\":\\"...\\",\\"precio\\":\\"...\\",\\"habitaciones\\":\\"...\\",\\"amenidades\\":\\"...\\"}. Texto: {{ $json['text_content'] }}"
          }
        ]
      }`,
      headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer ${SAMBANOVA_API}' }] }
    }
  },
  {
    id: 'persist-logic',
    name: 'Persistence Logic',
    type: 'n8n-nodes-base.code',
    typeVersion: 1,
    position: [1400, 400],
    parameters: {
      jsCode: `
        const item = $input.first().json;
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
    id: 'neon-upsert',
    name: 'Neon Upsert',
    type: 'n8n-nodes-base.postgres',
    typeVersion: 2.3,
    position: [1600, 400],
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
  'Fetch Member Data': { main: [[{ node: 'Format Data (JS)', type: 'main', index: 0 }]] },
  'Format Data (JS)': { main: [[{ node: 'Item Splitter', type: 'main', index: 0 }]] },
  'Item Splitter': { main: [[{ node: 'Media Router', type: 'main', index: 0 }]] },
  'Media Router': {
    main: [
      [{ node: 'Get Image Media', type: 'main', index: 0 }],
      [{ node: 'Text Analysis', type: 'main', index: 0 }]
    ]
  },
  'Get Image Media': { main: [[{ node: 'Vision Analysis', type: 'main', index: 0 }]] },
  'Vision Analysis': { main: [[{ node: 'Persistence Logic', type: 'main', index: 0 }]] },
  'Text Analysis': { main: [[{ node: 'Persistence Logic', type: 'main', index: 0 }]] },
  'Persistence Logic': { main: [[{ node: 'Neon Upsert', type: 'main', index: 0 }]] },
  'Neon Upsert': { main: [[{ node: 'Item Splitter', type: 'main', index: 0 }]] }
};

function deploy() {
  const data = JSON.stringify({ name: 'PROD: Real Estate Pipeline (V40.11 Llama 3.3)', nodes, connections, settings: { executionOrder: 'v1' } });
  const req = https.request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${workflowId}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('=== V40.11 DEPLOYED (LLAMA 3.3) ===');
      console.log('Status:', res.statusCode);
      if (res.statusCode !== 200) console.log('Error Body:', body);
    });
  });
  req.on('error', console.error);
  req.write(data);
  req.end();
}

deploy();
