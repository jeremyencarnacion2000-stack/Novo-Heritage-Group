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
  
  console.log('Getting V33...');
  const getRes = await request({ hostname: N8N_URL, path: `/api/v1/workflows/${wfID}`, method: 'GET', headers: { 'X-N8N-API-KEY': AUTH_KEY } });
  const wf = JSON.parse(getRes.d);
  console.log('Got:', wf.name, '- Nodes:', wf.nodes.length);

  // =====================================================
  // 1. UPGRADE process-logic: extract links, better parsing
  // 2. ADD link-scraper: fetch URLs found in messages  
  // 3. UPGRADE upsert: smart dedup (keep highest commission)
  // 4. UPGRADE AI prompt: include scraped content
  // =====================================================

  for (const node of wf.nodes) {
    
    // === UPGRADE SambaNova HTTP prompt ===
    if (node.name === 'SambaNova HTTP') {
      const currentBody = node.parameters.body || '';
      // Update the system prompt to also extract URLs and handle links
      node.parameters.body = `={{"model":"Meta-Llama-3.1-8B-Instant","messages":[{"role":"system","content":"Eres un experto en bienes raíces. Analiza el mensaje de WhatsApp y extrae información de proyectos inmobiliarios.\\n\\nResponde SIEMPRE con JSON válido (sin markdown, sin backticks):\\n{\\n  \\"nombre_proyecto\\": \\"..\\",\\n  \\"tipo_activo\\": \\"WhatsApp\\",\\n  \\"zona\\": \\"..\\",\\n  \\"comision\\": \\"..\\",\\n  \\"precio\\": \\"..\\",\\n  \\"url_fuente\\": \\"..\\",\\n  \\"descripcion\\": \\"..\\",\\n  \\"contacto\\": \\"..\\",\\n  \\"tiene_imagen\\": false,\\n  \\"links_encontrados\\": []\\n}\\n\\nReglas:\\n- Si hay URLs en el mensaje, extráelas en links_encontrados\\n- comision debe ser un número o porcentaje (ej: 3, 5%, 2.5)\\n- Si no hay info del campo, pon N/A\\n- Si el mensaje no es sobre bienes raíces, pon nombre_proyecto=SKIP"},{"role":"user","content":"Analiza: " + JSON.stringify($json.message || $json.body || "").replace(/"/g, '\\\\"').substring(0, 2000)}],"max_tokens":500,"temperature":0.1}}`;
      console.log('✅ SambaNova prompt upgraded (extracts links, comision, contacto)');
    }

    // === UPGRADE process-logic: better JSON parsing ===
    if (node.name === 'process-logic') {
      node.parameters.jsCode = `
const items = $input.all();
const results = [];

for (const item of items) {
  try {
    const raw = item.json;
    let aiText = '';
    
    // Handle different response formats
    if (raw.choices?.[0]?.message?.content) {
      aiText = raw.choices[0].message.content;
    } else if (typeof raw === 'string') {
      aiText = raw;
    } else {
      aiText = JSON.stringify(raw);
    }
    
    // Clean markdown code blocks
    aiText = aiText.replace(/\`\`\`json?\\n?/g, '').replace(/\`\`\`/g, '').trim();
    
    // Try to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch(e) {
      // Try to find JSON in the text
      const match = aiText.match(/\\{[^{}]*\\}/s);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = { nombre_proyecto: 'SKIP' };
      }
    }
    
    // Parse comision to number for comparison
    let comisionNum = 0;
    const comStr = String(parsed.comision || '0');
    const numMatch = comStr.match(/([\\d.]+)/);
    if (numMatch) comisionNum = parseFloat(numMatch[1]);
    
    results.push({
      json: {
        nombre_proyecto: parsed.nombre_proyecto || 'N/A',
        tipo_activo: parsed.tipo_activo || 'WhatsApp',
        url_activo: parsed.url_fuente || 'N/A',
        stock_disponible: true,
        zona: parsed.zona || 'N/A',
        comision: comStr,
        comision_num: comisionNum,
        precio: parsed.precio || 'N/A',
        descripcion: parsed.descripcion || '',
        contacto: parsed.contacto || '',
        links_encontrados: parsed.links_encontrados || [],
        tiene_imagen: parsed.tiene_imagen || false,
        metadata: {
          precio: parsed.precio || 'N/A',
          descripcion: parsed.descripcion || '',
          contacto: parsed.contacto || '',
          links: parsed.links_encontrados || [],
          raw_ai: aiText.substring(0, 500)
        }
      }
    });
  } catch(e) {
    results.push({ json: { nombre_proyecto: 'SKIP', error: e.message } });
  }
}

return results;`;
      console.log('✅ process-logic upgraded (parses comision, links, contacto)');
    }

    // === UPGRADE filter-node: skip SKIP items ===
    if (node.name === 'filter-node') {
      node.parameters = {
        conditions: {
          string: [
            { value1: '={{$json.nombre_proyecto}}', operation: 'notEqual', value2: 'SKIP' },
            { value1: '={{$json.nombre_proyecto}}', operation: 'notEqual', value2: 'N/A' },
            { value1: '={{$json.nombre_proyecto}}', operation: 'isNotEmpty' }
          ]
        },
        combineOperation: 'all'
      };
      console.log('✅ filter-node upgraded (skip SKIP + N/A + empty)');
    }

    // === UPGRADE upsert-node: ON CONFLICT keep highest comision ===
    if (node.name === 'upsert-node') {
      node.parameters.query = `INSERT INTO public.inventario_digital 
  (nombre_proyecto, tipo_activo, url_activo, stock_disponible, zona, comision, metadata)
VALUES (
  '{{ $json.nombre_proyecto }}',
  '{{ $json.tipo_activo }}',
  '{{ $json.url_activo }}',
  {{ $json.stock_disponible }},
  '{{ $json.zona }}',
  '{{ $json.comision }}',
  '{{ JSON.stringify($json.metadata).replace(/'/g, "''") }}'::jsonb
)
ON CONFLICT (nombre_proyecto) 
DO UPDATE SET
  zona = CASE 
    WHEN EXCLUDED.zona != 'N/A' THEN EXCLUDED.zona 
    ELSE inventario_digital.zona 
  END,
  comision = CASE 
    WHEN (regexp_replace(EXCLUDED.comision, '[^0-9.]', '', 'g'))::numeric > 
         COALESCE(NULLIF(regexp_replace(inventario_digital.comision, '[^0-9.]', '', 'g'), '')::numeric, 0)
    THEN EXCLUDED.comision 
    ELSE inventario_digital.comision 
  END,
  url_activo = CASE 
    WHEN EXCLUDED.url_activo != 'N/A' THEN EXCLUDED.url_activo 
    ELSE inventario_digital.url_activo 
  END,
  metadata = inventario_digital.metadata || EXCLUDED.metadata,
  fecha_actualizacion = NOW()
WHERE EXCLUDED.zona != 'N/A' 
   OR (regexp_replace(EXCLUDED.comision, '[^0-9.]', '', 'g'))::numeric > 
      COALESCE(NULLIF(regexp_replace(inventario_digital.comision, '[^0-9.]', '', 'g'), '')::numeric, 0);`;
      console.log('✅ upsert-node upgraded (ON CONFLICT: keeps highest comision, merges metadata)');
    }
  }

  // === ENSURE unique constraint on nombre_proyecto exists ===
  console.log('\n=== CREATING UNIQUE CONSTRAINT ===');
  const { Client } = require('pg');
  const db = new Client({ connectionString: 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });
  await db.connect();
  
  try {
    // Add fecha_actualizacion column if not exists
    await db.query(`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT NOW()`);
    console.log('✅ Added fecha_actualizacion column');
    
    // Add descripcion/contacto to metadata or as columns
    await db.query(`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT ''`);
    await db.query(`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS contacto TEXT DEFAULT ''`);
    await db.query(`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS precio TEXT DEFAULT 'N/A'`);
    console.log('✅ Added descripcion, contacto, precio columns');
    
    // Create unique constraint on nombre_proyecto
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_inventario_nombre_proyecto ON public.inventario_digital (nombre_proyecto)`);
    console.log('✅ UNIQUE index on nombre_proyecto created');
  } catch(e) {
    console.log('DB note:', e.message);
  }
  
  // Show current data
  const count = await db.query('SELECT COUNT(*) as total FROM public.inventario_digital');
  console.log('\nCurrent rows:', count.rows[0].total);
  
  const sample = await db.query('SELECT nombre_proyecto, comision, zona FROM public.inventario_digital LIMIT 5');
  for (const r of sample.rows) {
    console.log(`  📍 ${r.nombre_proyecto} | ${r.comision} | ${r.zona}`);
  }
  
  await db.end();

  // === DEPLOY ===
  const payload = {
    name: '[PROD] Godmode Backfill V34 (Smart Upsert)',
    nodes: wf.nodes,
    connections: wf.connections,
    settings: { executionOrder: 'v1', saveExecutionProgress: true, executionTimeout: 86400 }
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
    console.log('\n✅ V34 DEPLOYED!');
    console.log('Features:');
    console.log('  • Smart AI prompt (extracts links, comision, contacto, precio)');
    console.log('  • Better JSON parsing (handles edge cases)');
    console.log('  • ON CONFLICT: keeps highest comision');
    console.log('  • Updates existing records with new data');
    console.log('  • Merges metadata from multiple mentions');
    console.log('\n→ Recarga y click "Execute Workflow"');
  } else {
    console.log('Error:', putRes.d.substring(0, 500));
  }
}

run().catch(e => console.error('Fatal:', e.message));
