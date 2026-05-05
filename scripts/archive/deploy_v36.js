const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const POSTGRES_CRED = { id: 'ym3KfQZLjCvWmUjS', name: 'Postgres account' };
const SAMBANOVA_CRED = { id: 'u46bitcJQIW1QNfu', name: 'Header Auth account 2' };

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
  // First, check what error upsert is throwing
  console.log('=== CHECKING LAST EXECUTION ERRORS ===');
  const execRes = await request({
    hostname: N8N_URL,
    path: '/api/v1/executions?workflowId=nkp8BcGXisFl9HAN&limit=1&includeData=true',
    method: 'GET',
    headers: { 'X-N8N-API-KEY': AUTH_KEY }
  });
  const execs = JSON.parse(execRes.d);
  const latest = (execs.data || execs)[0];
  if (latest?.data?.resultData?.runData) {
    const rd = latest.data.resultData.runData;
    for (const [name, runs] of Object.entries(rd)) {
      const last = runs[runs.length - 1];
      if (last?.error) {
        console.log(`❌ ${name}: ${last.error.message || JSON.stringify(last.error).substring(0, 300)}`);
      }
      // Check output for errors
      const out = last?.data?.main?.[0] || [];
      for (let i = 0; i < Math.min(2, out.length); i++) {
        const item = out[i]?.json;
        if (item?.error) {
          console.log(`⚠️ ${name} item[${i}]: ${JSON.stringify(item.error).substring(0, 200)}`);
        }
        if (name === 'process-logic' || name === 'upsert-node' || name === 'SambaNova Text') {
          console.log(`📋 ${name} item[${i}]: ${JSON.stringify(item).substring(0, 300)}`);
        }
      }
    }
  }

  // =============================================
  // V36: SIMPLIFIED — TEXT ONLY, BULLETPROOF
  // =============================================
  console.log('\n=== DEPLOYING V36 (TEXT ONLY - SIMPLIFIED) ===');
  
  const wfID = 'nkp8BcGXisFl9HAN';

  const nodes = [
    {
      id: 'trigger',
      name: 'Start Backfill',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [100, 400],
      parameters: {}
    },
    {
      id: 'fetch-all',
      name: 'fetch-all',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [320, 400],
      parameters: {
        operation: 'executeQuery',
        query: `SELECT 
  id,
  CASE
    WHEN "messageType" = 'conversation' THEN message->>'conversation'
    WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
    ELSE ''
  END as text_content,
  "pushName",
  "messageTimestamp"
FROM evolution."Message"
WHERE "messageType" IN ('conversation', 'extendedTextMessage')
  AND CASE
    WHEN "messageType" = 'conversation' THEN length(message->>'conversation') > 30
    WHEN "messageType" = 'extendedTextMessage' THEN length(message->'extendedTextMessage'->>'text') > 30
    ELSE FALSE
  END
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
      position: [540, 400],
      parameters: { batchSize: 1, options: {} }
    },
    {
      id: 'ai-call',
      name: 'SambaNova AI',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [760, 400],
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
        jsonBody: `={{"model":"Meta-Llama-3.1-8B-Instant","messages":[{"role":"system","content":"Eres un experto en bienes raíces de República Dominicana. Analiza el siguiente mensaje de un chat de WhatsApp inmobiliario y extrae la información del proyecto.\\n\\nResponde UNICAMENTE con JSON válido, sin markdown, sin backticks:\\n{{\\"nombre_proyecto\\": \\"nombre del proyecto o edificio\\",\\"zona\\": \\"ubicación/sector\\",\\"comision\\": \\"porcentaje o monto\\",\\"precio\\": \\"precio en USD o RD$\\",\\"descripcion\\": \\"resumen corto\\",\\"contacto\\": \\"nombre y teléfono\\"}}\\n\\nReglas:\\n- nombre_proyecto: nombre real del edificio/proyecto. Si no hay nombre específico, usa la dirección\\n- Si el mensaje NO es sobre bienes raíces (es saludo, spam, etc): nombre_proyecto=SKIP\\n- Si no hay dato: pon N/A"},{"role":"user","content":"" + ($json.text_content || "").replace(/[\\\\"\\']/g, " ").substring(0, 1500)}}],"max_tokens":400,"temperature":0.1}}`,
        options: { timeout: 30000 }
      },
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 10000,
      continueOnFail: true,
      credentials: { httpHeaderAuth: SAMBANOVA_CRED }
    },
    {
      id: 'process-logic',
      name: 'process-logic',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1000, 400],
      parameters: {
        jsCode: `const items = $input.all();
const results = [];

for (const item of items) {
  try {
    const raw = item.json;
    let aiText = '';
    
    if (raw.choices && raw.choices[0] && raw.choices[0].message) {
      aiText = raw.choices[0].message.content || '';
    } else if (raw.error) {
      results.push({ json: { nombre_proyecto: 'SKIP', _error: String(raw.error) } });
      continue;
    } else {
      results.push({ json: { nombre_proyecto: 'SKIP', _error: 'no choices' } });
      continue;
    }
    
    // Clean markdown
    aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch(e) {
      const m = aiText.match(/\\{[\\s\\S]*?\\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch(e2) {
          results.push({ json: { nombre_proyecto: 'SKIP', _error: 'parse fail: ' + aiText.substring(0, 100) } });
          continue;
        }
      } else {
        results.push({ json: { nombre_proyecto: 'SKIP', _error: 'no JSON found' } });
        continue;
      }
    }
    
    const name = (parsed.nombre_proyecto || '').trim();
    if (!name || name === 'SKIP' || name === 'N/A' || name.length < 3) {
      results.push({ json: { nombre_proyecto: 'SKIP' } });
      continue;
    }

    // Escape single quotes for SQL
    const safeName = name.replace(/'/g, "''");
    const safeZona = (parsed.zona || 'N/A').replace(/'/g, "''");
    const safeComision = (parsed.comision || 'N/A').replace(/'/g, "''");
    const safePrecio = (parsed.precio || 'N/A').replace(/'/g, "''");
    const safeDesc = (parsed.descripcion || '').replace(/'/g, "''");
    const safeContacto = (parsed.contacto || '').replace(/'/g, "''");
    
    const metadata = JSON.stringify({
      precio: parsed.precio || 'N/A',
      descripcion: parsed.descripcion || '',
      contacto: parsed.contacto || '',
      raw_ai: aiText.substring(0, 300)
    }).replace(/'/g, "''");
    
    results.push({
      json: {
        nombre_proyecto: safeName,
        tipo_activo: 'WhatsApp',
        url_activo: 'N/A',
        stock_disponible: true,
        zona: safeZona,
        comision: safeComision,
        precio: safePrecio,
        descripcion: safeDesc,
        contacto: safeContacto,
        metadata_json: metadata
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
      position: [1220, 400],
      parameters: {
        conditions: {
          string: [
            { value1: '={{$json.nombre_proyecto}}', operation: 'notEqual', value2: 'SKIP' }
          ]
        }
      }
    },
    {
      id: 'upsert-node',
      name: 'upsert-node',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [1440, 350],
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
  descripcion = CASE WHEN EXCLUDED.descripcion != '' THEN EXCLUDED.descripcion ELSE inventario_digital.descripcion END,
  contacto = CASE WHEN EXCLUDED.contacto != '' THEN EXCLUDED.contacto ELSE inventario_digital.contacto END,
  metadata = inventario_digital.metadata || EXCLUDED.metadata,
  fecha_actualizacion = NOW();`,
        options: {}
      },
      continueOnFail: true,
      credentials: { postgres: POSTGRES_CRED }
    },
    {
      id: 'delay-node',
      name: 'delay-node',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1660, 400],
      parameters: {
        jsCode: `await new Promise(r => setTimeout(r, 8000));
return $input.all();`
      }
    }
  ];

  const connections = {
    'Start Backfill': {
      main: [[{ node: 'fetch-all', type: 'main', index: 0 }]]
    },
    'fetch-all': {
      main: [[{ node: 'split-batches', type: 'main', index: 0 }]]
    },
    'split-batches': {
      main: [
        [],  // Output 0 = done
        [{ node: 'SambaNova AI', type: 'main', index: 0 }]  // Output 1 = batch
      ]
    },
    'SambaNova AI': {
      main: [[{ node: 'process-logic', type: 'main', index: 0 }]]
    },
    'process-logic': {
      main: [[{ node: 'filter-node', type: 'main', index: 0 }]]
    },
    'filter-node': {
      main: [
        [{ node: 'upsert-node', type: 'main', index: 0 }],  // TRUE = save
        [{ node: 'delay-node', type: 'main', index: 0 }]     // FALSE = skip
      ]
    },
    'upsert-node': {
      main: [[{ node: 'delay-node', type: 'main', index: 0 }]]
    },
    'delay-node': {
      main: [[{ node: 'split-batches', type: 'main', index: 0 }]]  // Loop
    }
  };

  const payload = {
    name: '[PROD] Godmode Backfill V36 (Text-Only Stable)',
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

  console.log('Deploy:', putRes.s);
  if (putRes.s === 200) {
    console.log('\n✅ V36 DEPLOYED (TEXT-ONLY STABLE)');
    console.log('  • Solo mensajes de texto (>30 chars)');
    console.log('  • SQL injection safe (quotes escaped in process-logic)');
    console.log('  • No Vision (URLs de WhatsApp expiradas)');
    console.log('  • Smart upsert (mayor comisión gana)');
    console.log('  • 8s delay, retry 3x');
    console.log('\n→ Recarga y ejecuta');
  } else {
    console.log('Error:', putRes.d.substring(0, 400));
  }
}

run().catch(e => console.error('Fatal:', e.message));
