const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WF_ID = 'tNfL2APn3vXKgTea';

async function addParser() {
  console.log('📡 Fetching workflow...');
  const res = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();
  console.log(`✅ Got ${wf.nodes.length} nodes`);

  // 1. Add Code node to parse AI response
  const parserCode = `
// Parse the Groq AI response
const raw = $json.choices[0].message.content;
let parsed;

try {
  // Remove markdown code fences if present
  const clean = raw
    .replace(/\`\`\`json\\n?/g, '')
    .replace(/\`\`\`\\n?/g, '')
    .trim();
  parsed = JSON.parse(clean);
} catch (e) {
  // If parsing fails, store the raw text as description
  parsed = {
    nombre_proyecto: 'Parseo fallido',
    titulo: '',
    descripcion: raw,
    es_oficial: false,
    zona: '',
    precio: '',
    multimedia: []
  };
}

// Normalize and sanitize for SQL
const sanitize = (val) => String(val || '').replace(/'/g, "''");

return {
  json: {
    nombre_proyecto: sanitize(parsed.nombre_proyecto || parsed.nombre || 'Sin nombre'),
    titulo: sanitize(parsed.titulo || parsed.titulo_profesional || 'Sin titulo'),
    descripcion: sanitize(parsed.descripcion || parsed.descripcion_limpia || ''),
    es_oficial: parsed.es_oficial === true || parsed.es_constructora_oficial === true,
    zona: sanitize(parsed.zona || parsed.ubicacion || 'No especificada'),
    precio: sanitize(parsed.precio || 'Consultar'),
    multimedia: JSON.stringify(parsed.multimedia || [])
  }
};
`;

  const parserNode = {
    id: 'parser-node',
    name: 'Parsear Respuesta IA',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1300, 400],
    parameters: {
      jsCode: parserCode
    }
  };

  // Remove parser if it already exists (idempotent)
  wf.nodes = wf.nodes.filter(n => n.id !== 'parser-node');
  wf.nodes.push(parserNode);

  // 2. Fix DB node to use the parsed flat fields
  const db = wf.nodes.find(n => n.id === 'db-node');
  if (db) {
    db.parameters = {
      operation: 'executeQuery',
      query: [
        "INSERT INTO public.inventario_digital",
        "  (nombre_proyecto, titulo_profesional, descripcion_limpia, es_constructora_oficial, zona, precio, multimedia)",
        "VALUES (",
        "  '{{ $json.nombre_proyecto }}',",
        "  '{{ $json.titulo }}',",
        "  '{{ $json.descripcion }}',",
        "  {{ $json.es_oficial }},",
        "  '{{ $json.zona }}',",
        "  '{{ $json.precio }}',",
        "  '{{ $json.multimedia }}'",
        ")",
        "ON CONFLICT DO NOTHING;"
      ].join('\n'),
      options: {}
    };
    db.position = [1500, 400];
    console.log('✅ Fixed DB query with flat field references');
  }

  // 3. Reposition AI node
  const ai = wf.nodes.find(n => n.name === 'Análisis de IA (Groq)');
  if (ai) {
    ai.position = [1100, 400];
    console.log('✅ Repositioned AI node');
  }

  // 4. Fix connections: AI → Parser → DB
  wf.connections['Análisis de IA (Groq)'] = {
    main: [[{ node: 'Parsear Respuesta IA', type: 'main', index: 0 }]]
  };
  wf.connections['Parsear Respuesta IA'] = {
    main: [[{ node: 'Guardar en Cockroach', type: 'main', index: 0 }]]
  };
  console.log('✅ Rewired connections: AI → Parser → DB');

  // 5. Push
  console.log('\n📤 Pushing...');
  const putRes = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
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

  if (putRes.ok) {
    const d = await putRes.json();
    console.log(`\n✅ SUCCESS! ${d.nodes.length} nodes deployed:`);
    d.nodes.forEach(n => console.log(`   ${n.name} (${n.type})`));
    console.log('\nConnections:');
    Object.entries(d.connections).forEach(([src, conn]) => {
      conn.main?.forEach(outputs => {
        outputs?.forEach(link => {
          console.log(`   ${src} → ${link.node}`);
        });
      });
    });
  } else {
    console.log('❌ Error:', putRes.status, await putRes.text());
  }
}

addParser();
