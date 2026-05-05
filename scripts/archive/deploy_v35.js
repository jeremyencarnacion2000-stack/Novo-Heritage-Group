const https = require('https');

const N8N_URL = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

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
  const wfID = 'nkp8BcGXisFl9HAN';
  
  console.log('Getting V34...');
  const getRes = await request({ hostname: N8N_URL, path: `/api/v1/workflows/${wfID}`, method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const wf = JSON.parse(getRes.d);
  console.log('Got:', wf.name, '- Nodes:', wf.nodes.length);

  // ============================
  // V35 — COMPLETE REBUILD
  // ============================
  // Flow:
  // Manual Trigger → fetch-all (includes imageMessage) → split-batches
  //   → route-by-type (Code: decides text vs image)
  //     → If has text → SambaNova Text (Llama 3.1 8B)
  //     → If has image URL → Download Image → SambaNova Vision (Llama 3.2 11B Vision)
  //   → process-logic → filter-node → upsert-node
  //   → delay-node → loop back to split-batches

  const nodes = [
    // 1. Manual Trigger
    {
      id: 'trigger',
      name: 'Start Backfill',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [100, 400],
      parameters: {}
    },
    // 2. Fetch ALL messages (text + images + docs with URLs)
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
  "messageType",
  CASE
    WHEN "messageType" = 'conversation' THEN message->>'conversation'
    WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
    WHEN "messageType" = 'imageMessage' THEN COALESCE(message->'imageMessage'->>'caption', '')
    WHEN "messageType" = 'documentMessage' THEN COALESCE(message->'documentMessage'->>'caption', '')
    ELSE ''
  END as text_content,
  CASE
    WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'url'
    ELSE NULL
  END as image_url,
  CASE
    WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'mimetype'
    ELSE NULL
  END as image_mime,
  "messageTimestamp",
  "pushName"
FROM evolution."Message"
WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage')
  AND (
    CASE
      WHEN "messageType" = 'conversation' THEN length(message->>'conversation') > 20
      WHEN "messageType" = 'extendedTextMessage' THEN length(message->'extendedTextMessage'->>'text') > 20
      WHEN "messageType" = 'imageMessage' THEN TRUE
      ELSE FALSE
    END
  )
ORDER BY "messageTimestamp" DESC
LIMIT 5000`,
        options: {}
      },
      credentials: { postgres: { id: 'yMSa9We9B7k61h8A', name: 'Neon Postgres' } }
    },
    // 3. Split in batches of 1
    {
      id: 'split-batches',
      name: 'split-batches',
      type: 'n8n-nodes-base.splitInBatches',
      typeVersion: 3,
      position: [540, 400],
      parameters: { batchSize: 1, options: {} }
    },
    // 4. Route by message type (Code node)
    {
      id: 'route-type',
      name: 'route-type',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [760, 400],
      parameters: {
        jsCode: `const item = $input.first().json;
const msgType = item.messageType || 'conversation';
const text = item.text_content || '';
const imageUrl = item.image_url || null;

// Route decision
return [{
  json: {
    ...item,
    has_image: msgType === 'imageMessage' && imageUrl && imageUrl.startsWith('http'),
    has_text: text.length > 10,
    analysis_text: text || '[Image without caption]',
    image_url: imageUrl
  }
}];`
      }
    },
    // 5. If node: has image?
    {
      id: 'check-image',
      name: 'has-image',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [980, 400],
      parameters: {
        conditions: {
          boolean: [{ value1: '={{$json.has_image}}', value2: true }]
        }
      }
    },
    // 6A. SambaNova TEXT (for text messages) — Output FALSE of If
    {
      id: 'ai-text',
      name: 'SambaNova Text',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [1200, 550],
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
        jsonBody: `={{"model":"Meta-Llama-3.1-8B-Instant","messages":[{"role":"system","content":"Eres un experto en bienes raíces dominicanos. Analiza el mensaje de WhatsApp y extrae info de proyectos inmobiliarios.\\n\\nResponde SOLO JSON válido (sin markdown):\\n{\\n  \\"nombre_proyecto\\": \\"..\\",\\n  \\"tipo_activo\\": \\"WhatsApp\\",\\n  \\"zona\\": \\"..\\",\\n  \\"comision\\": \\"..\\",\\n  \\"precio\\": \\"..\\",\\n  \\"descripcion\\": \\"resumen corto\\",\\n  \\"contacto\\": \\"nombre y tel\\",\\n  \\"links_encontrados\\": []\\n}\\n\\nReglas:\\n- Si hay URLs, extráelas en links_encontrados\\n- comision: número o porcentaje\\n- precio: en USD o RD$\\n- Si no es sobre bienes raíces: nombre_proyecto=SKIP"},{"role":"user","content":"Analiza: " + JSON.stringify($json.analysis_text || "").replace(/"/g, '\\\\"').substring(0, 2000)}],"max_tokens":500,"temperature":0.1}}`,
        options: { timeout: 30000 }
      },
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 10000,
      continueOnFail: true,
      credentials: { httpHeaderAuth: { id: 'faBRy9yTlA1eR5Lk', name: 'SambaNova' } }
    },
    // 6B. SambaNova VISION (for image messages) — Output TRUE of If
    {
      id: 'ai-vision',
      name: 'SambaNova Vision',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.1,
      position: [1200, 250],
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
        jsonBody: `={{"model":"Llama-3.2-11B-Vision-Instruct","messages":[{"role":"system","content":"Eres un experto en bienes raíces. Analiza la imagen y su caption de un chat de WhatsApp inmobiliario.\\n\\nResponde SOLO JSON válido (sin markdown):\\n{\\n  \\"nombre_proyecto\\": \\"..\\",\\n  \\"tipo_activo\\": \\"WhatsApp-Imagen\\",\\n  \\"zona\\": \\"..\\",\\n  \\"comision\\": \\"..\\",\\n  \\"precio\\": \\"..\\",\\n  \\"descripcion\\": \\"describe la propiedad de la imagen\\",\\n  \\"tipo_propiedad\\": \\"apartamento/casa/solar/local\\",\\n  \\"acabados\\": \\"descripción de acabados visibles\\",\\n  \\"contacto\\": \\"..\\",\\n  \\"links_encontrados\\": []\\n}\\n\\nSi no es bienes raíces: nombre_proyecto=SKIP"},{"role":"user","content":[{"type":"text","text":"Caption: " + ($json.analysis_text || "Sin caption").replace(/"/g, '\\\\"').substring(0, 500)},{"type":"image_url","image_url":{"url":"" + ($json.image_url || "")}}]}],"max_tokens":600,"temperature":0.1}}`,
        options: { timeout: 45000 }
      },
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 12000,
      continueOnFail: true,
      credentials: { httpHeaderAuth: { id: 'faBRy9yTlA1eR5Lk', name: 'SambaNova' } }
    },
    // 7. Merge results (Code) — combine both paths
    {
      id: 'process-logic',
      name: 'process-logic',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1450, 400],
      parameters: {
        jsCode: `const items = $input.all();
const results = [];

for (const item of items) {
  try {
    const raw = item.json;
    let aiText = '';
    
    if (raw.choices?.[0]?.message?.content) {
      aiText = raw.choices[0].message.content;
    } else if (raw.error) {
      results.push({ json: { nombre_proyecto: 'SKIP', error: raw.error } });
      continue;
    } else {
      aiText = JSON.stringify(raw);
    }
    
    aiText = aiText.replace(/\\\`\\\`\\\`json?\\n?/g, '').replace(/\\\`\\\`\\\`/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch(e) {
      const match = aiText.match(/\\{[\\s\\S]*\\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch(e2) { parsed = { nombre_proyecto: 'SKIP' }; }
      } else {
        parsed = { nombre_proyecto: 'SKIP' };
      }
    }
    
    let comisionNum = 0;
    const comStr = String(parsed.comision || '0');
    const numMatch = comStr.match(/([\\d.]+)/);
    if (numMatch) comisionNum = parseFloat(numMatch[1]);
    
    results.push({
      json: {
        nombre_proyecto: (parsed.nombre_proyecto || 'N/A').trim(),
        tipo_activo: parsed.tipo_activo || 'WhatsApp',
        url_activo: parsed.url_fuente || 'N/A',
        stock_disponible: true,
        zona: parsed.zona || 'N/A',
        comision: comStr,
        comision_num: comisionNum,
        precio: parsed.precio || 'N/A',
        descripcion: parsed.descripcion || '',
        contacto: parsed.contacto || '',
        tipo_propiedad: parsed.tipo_propiedad || '',
        acabados: parsed.acabados || '',
        metadata: {
          precio: parsed.precio || 'N/A',
          descripcion: parsed.descripcion || '',
          contacto: parsed.contacto || '',
          tipo_propiedad: parsed.tipo_propiedad || '',
          acabados: parsed.acabados || '',
          links: parsed.links_encontrados || [],
          raw_ai: aiText.substring(0, 500)
        }
      }
    });
  } catch(e) {
    results.push({ json: { nombre_proyecto: 'SKIP', error: e.message } });
  }
}

return results;`
      }
    },
    // 8. Filter — skip non-real-estate
    {
      id: 'filter-node',
      name: 'filter-node',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [1680, 400],
      parameters: {
        conditions: {
          string: [
            { value1: '={{$json.nombre_proyecto}}', operation: 'notEqual', value2: 'SKIP' },
            { value1: '={{$json.nombre_proyecto}}', operation: 'notEqual', value2: 'N/A' },
            { value1: '={{$json.nombre_proyecto}}', operation: 'isNotEmpty' }
          ]
        },
        combineOperation: 'all'
      }
    },
    // 9. Upsert — smart dedup (keep highest commission)
    {
      id: 'upsert-node',
      name: 'upsert-node',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.3,
      position: [1900, 350],
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
  '{{ ($json.descripcion || "").replace(/'/g, "''") }}',
  '{{ ($json.contacto || "").replace(/'/g, "''") }}',
  '{{ JSON.stringify($json.metadata).replace(/'/g, "''") }}'::jsonb
)
ON CONFLICT (nombre_proyecto) 
DO UPDATE SET
  zona = CASE 
    WHEN EXCLUDED.zona != 'N/A' AND EXCLUDED.zona != '' THEN EXCLUDED.zona 
    ELSE inventario_digital.zona 
  END,
  comision = CASE 
    WHEN COALESCE(NULLIF(regexp_replace(EXCLUDED.comision, '[^0-9.]', '', 'g'), '')::numeric, 0) >
         COALESCE(NULLIF(regexp_replace(inventario_digital.comision, '[^0-9.]', '', 'g'), '')::numeric, 0)
    THEN EXCLUDED.comision 
    ELSE inventario_digital.comision 
  END,
  precio = CASE
    WHEN EXCLUDED.precio != 'N/A' AND EXCLUDED.precio != '' THEN EXCLUDED.precio
    ELSE inventario_digital.precio
  END,
  descripcion = CASE
    WHEN EXCLUDED.descripcion != '' THEN EXCLUDED.descripcion
    ELSE inventario_digital.descripcion
  END,
  contacto = CASE
    WHEN EXCLUDED.contacto != '' THEN EXCLUDED.contacto
    ELSE inventario_digital.contacto
  END,
  url_activo = CASE 
    WHEN EXCLUDED.url_activo != 'N/A' THEN EXCLUDED.url_activo 
    ELSE inventario_digital.url_activo 
  END,
  tipo_activo = CASE
    WHEN EXCLUDED.tipo_activo = 'WhatsApp-Imagen' THEN EXCLUDED.tipo_activo
    ELSE inventario_digital.tipo_activo
  END,
  metadata = inventario_digital.metadata || EXCLUDED.metadata,
  fecha_actualizacion = NOW();`,
        options: {}
      },
      continueOnFail: true,
      credentials: { postgres: { id: 'yMSa9We9B7k61h8A', name: 'Neon Postgres' } }
    },
    // 10. Delay — 8 seconds between batches
    {
      id: 'delay-node',
      name: 'delay-node',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [2100, 400],
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
        [],  // Output 0 = done (empty)
        [{ node: 'route-type', type: 'main', index: 0 }]  // Output 1 = batch items
      ]
    },
    'route-type': {
      main: [[{ node: 'has-image', type: 'main', index: 0 }]]
    },
    'has-image': {
      main: [
        [{ node: 'SambaNova Vision', type: 'main', index: 0 }],   // TRUE = has image
        [{ node: 'SambaNova Text', type: 'main', index: 0 }]      // FALSE = text only
      ]
    },
    'SambaNova Vision': {
      main: [[{ node: 'process-logic', type: 'main', index: 0 }]]
    },
    'SambaNova Text': {
      main: [[{ node: 'process-logic', type: 'main', index: 0 }]]
    },
    'process-logic': {
      main: [[{ node: 'filter-node', type: 'main', index: 0 }]]
    },
    'filter-node': {
      main: [
        [{ node: 'upsert-node', type: 'main', index: 0 }],  // TRUE = real estate
        [{ node: 'delay-node', type: 'main', index: 0 }]     // FALSE = skip, go to delay
      ]
    },
    'upsert-node': {
      main: [[{ node: 'delay-node', type: 'main', index: 0 }]]
    },
    'delay-node': {
      main: [[{ node: 'split-batches', type: 'main', index: 0 }]]  // Loop back
    }
  };

  const payload = {
    name: '[PROD] Godmode Backfill V35 (Vision + Links + Smart Upsert)',
    nodes: nodes,
    connections: connections,
    settings: {
      executionOrder: 'v1',
      saveExecutionProgress: true,
      executionTimeout: 86400  // 24 hours
    }
  };

  const body = JSON.stringify(payload);
  const putRes = await request({
    hostname: N8N_URL,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': AUTH_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);

  console.log('\nDeploy:', putRes.s);
  if (putRes.s === 200) {
    const result = JSON.parse(putRes.d);
    console.log('\n✅ V35 DEPLOYED! Nodes:', result.nodes.length);
    console.log('\nArchitecture:');
    console.log('  Start → Fetch 5000 msgs (text+images) → Split Batches (1)');
    console.log('  → Route by type → Image? → SambaNova Vision (Llama 3.2 11B)');
    console.log('                   → Text?  → SambaNova Text (Llama 3.1 8B)');
    console.log('  → Process AI → Filter SKIP → Smart Upsert (mayor comisión)');
    console.log('  → 8s Delay → Loop');
    console.log('\nStats:');
    console.log('  Text messages: ~57,000 (conversation)');
    console.log('  Image messages: ~14,668');
    console.log('  Processing: 5,000 per run, ~13s each');
    console.log('  Estimated: 18 hours per 5,000');
    console.log('\n→ Recarga y click "Execute Workflow"');
    console.log(`→ https://suskj501-n8n.hf.space/workflow/${wfID}`);
  } else {
    console.log('Error:', putRes.d.substring(0, 500));
  }
}

run().catch(e => console.error('Fatal:', e.message));
