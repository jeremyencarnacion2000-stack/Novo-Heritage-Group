const N8N_URL = 'https://suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WF_ID = 'tNfL2APn3vXKgTea';
const GROQ_CRED_ID = 'dPaEIXb59Mqbg7i2';

async function buildOrchestra() {
  console.log('📡 Fetching workflow...');
  const r = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await r.json();

  // ========== NODE UPDATES ==========

  // 1. UPDATE: Traductor Maestro — extract caption + base64 + metadata
  const traductor = wf.nodes.find(n => n.name === 'Traductor Maestro');
  if (traductor) {
    traductor.parameters.jsCode = `
// Extract all available data from WhatsApp message + download
const input = $json;
const originalMsg = $('Obtener mensajes').item.json;

// Extract caption from WhatsApp message
let caption = '';
if (originalMsg?.message?.imageMessage?.caption) {
  caption = originalMsg.message.imageMessage.caption;
} else if (originalMsg?.message?.conversation) {
  caption = originalMsg.message.conversation;
} else if (originalMsg?.message?.extendedTextMessage?.text) {
  caption = originalMsg.message.extendedTextMessage.text;
}

// Extract phone number
const phone = originalMsg?.key?.remoteJid || '';
const sender = originalMsg?.pushName || '';
const timestamp = originalMsg?.messageTimestamp || '';

// Extract base64 from download
let base64Data = null;
let hasImage = false;

if (input && input.message !== 'AxiosError' && input.status !== 500) {
  const keys = Object.keys(input);
  for (const key of keys) {
    if (typeof input[key] === 'string' && (input[key].length > 1000 || input[key].includes(';base64,'))) {
      base64Data = input[key];
      break;
    }
  }
}

if (base64Data) {
  hasImage = true;
  base64Data = base64Data.includes(',') ? base64Data.split(',').pop() : base64Data;
}

return {
  json: {
    caption: caption,
    phone: phone,
    sender: sender,
    timestamp: timestamp,
    hasImage: hasImage,
    base64: base64Data || '',
    messageRaw: JSON.stringify(originalMsg?.message || {}).substring(0, 500)
  },
  binary: hasImage ? {
    data: {
      data: base64Data,
      mimeType: 'image/jpeg',
      fileName: 'propiedad.jpg'
    }
  } : undefined
};
`;
    traductor.position = [700, 200];
    console.log('✅ Updated Traductor Maestro (extracts caption + base64 + metadata)');
  }

  // 2. NEW: "Preparar Visión" Code node — builds the vision API request
  const prepVisionNode = {
    id: 'prep-vision-node',
    name: 'Preparar Visión',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1100, 300],
    parameters: {
      jsCode: `
// Build the Groq Vision API request based on available data
const data = $('Traductor Maestro').item.json;
const dropboxUrl = $json.path_display ? 
  'https://www.dropbox.com/home' + $json.path_display : '';

const hasImage = data.hasImage && data.base64 && data.base64.length > 100;
const caption = data.caption || '';
const sender = data.sender || '';
const phone = data.phone || '';

if (hasImage) {
  // Build multimodal vision request
  return {
    json: {
      hasImage: true,
      caption: caption,
      sender: sender,
      phone: phone,
      dropboxUrl: dropboxUrl,
      visionRequest: {
        model: "llama-3.2-90b-vision-preview",
        stream: false,
        temperature: 0.2,
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Eres un experto inmobiliario dominicano. Analiza esta imagen de propiedad inmobiliaria. Describe en detalle: 1) Tipo de propiedad (apartamento, casa, solar, local comercial, etc.) 2) Estado (planos, en construcción, terminado) 3) Características visibles (piscina, terraza, acabados, dormitorios, etc.) 4) Ubicación si se ve algún letrero o indicación 5) Si hay logo/nombre de constructora o proyecto 6) Rango de precio estimado basado en lo que ves. Responde en español."
              },
              {
                type: "image_url",
                image_url: {
                  url: "data:image/jpeg;base64," + data.base64
                }
              }
            ]
          }
        ]
      }
    }
  };
} else {
  // No image available — text-only analysis
  return {
    json: {
      hasImage: false,
      caption: caption,
      sender: sender,
      phone: phone,
      dropboxUrl: dropboxUrl,
      visionRequest: {
        model: "llama-3.3-70b-versatile",
        stream: false,
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: "No hay imagen disponible. Solo tengo este texto de WhatsApp: '" + (caption || 'sin texto') + "'. Describe brevemente lo que puedas inferir sobre esta propiedad."
          }
        ]
      }
    }
  };
}
`
    }
  };

  // 3. NEW: "Visión IA (Groq)" HTTP Request — sends to Groq Vision API
  const visionNode = {
    id: 'vision-ai-node',
    name: 'Visión IA (Groq)',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1300, 300],
    parameters: {
      method: 'POST',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      contentType: 'json',
      jsonBody: '={{ JSON.stringify($json.visionRequest) }}',
      options: {
        timeout: 60000
      }
    },
    credentials: {
      httpHeaderAuth: { id: GROQ_CRED_ID, name: 'Groq AI Key' }
    },
    continueOnFail: true
  };

  // 4. NEW: "Orquestar Resultados" Code node — combines Vision + Caption for Text AI
  const orchestratorNode = {
    id: 'orchestrator-node',
    name: 'Orquestar Resultados',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1500, 300],
    parameters: {
      jsCode: `
// Combine vision analysis + caption + metadata for structured extraction
const prepData = $('Preparar Visión').item.json;
const visionResponse = $json;

// Extract vision description
let visionDescription = 'No se pudo analizar la imagen.';
try {
  if (visionResponse.choices && visionResponse.choices[0]) {
    visionDescription = visionResponse.choices[0].message.content;
  }
} catch (e) {
  visionDescription = 'Error en análisis de visión: ' + (visionResponse.message || 'desconocido');
}

const caption = prepData.caption || '';
const sender = prepData.sender || '';
const phone = prepData.phone || '';
const dropboxUrl = prepData.dropboxUrl || '';
const hadImage = prepData.hasImage;

// Build the comprehensive prompt for structured extraction
const userPrompt = \`
=== ANÁLISIS DE VISIÓN IA ===
\${visionDescription}

=== TEXTO DEL MENSAJE DE WHATSAPP ===
Caption: \${caption || '(sin texto)'}
Remitente: \${sender}
Teléfono: \${phone}

=== MULTIMEDIA ===
URL Dropbox: \${dropboxUrl || 'No disponible'}
Imagen disponible: \${hadImage ? 'Sí' : 'No'}

Con toda esta información, genera el JSON de la propiedad.\`;

return {
  json: {
    orchestratedPrompt: userPrompt,
    visionDescription: visionDescription,
    caption: caption,
    dropboxUrl: dropboxUrl,
    sender: sender,
    phone: phone,
    hadImage: hadImage
  }
};
`
    }
  };

  // 5. UPDATE: "Análisis de IA (Groq)" — now receives orchestrated input
  const groq = wf.nodes.find(n => n.name === 'Análisis de IA (Groq)');
  if (groq) {
    groq.parameters.jsonBody = `={{ JSON.stringify({
  model: "llama-3.3-70b-versatile",
  stream: false,
  temperature: 0.1,
  max_tokens: 1000,
  messages: [
    {
      role: "system",
      content: "Eres un experto inmobiliario dominicano senior. Tu trabajo es analizar propiedades a partir de análisis de visión IA e información de WhatsApp. DEBES responder SOLO con un JSON válido (sin markdown, sin texto extra) con estos campos:\\n\\n- nombre_proyecto (string): nombre del proyecto/residencial\\n- titulo (string): título descriptivo profesional\\n- descripcion (string): descripción detallada SIN teléfonos ni contactos\\n- es_oficial (boolean): true si parece de constructora oficial\\n- zona (string): ubicación/zona\\n- precio (string): precio con moneda (RD$ o US$)\\n- multimedia (array): URLs de Dropbox si hay"
    },
    {
      role: "user",
      content: $json.orchestratedPrompt
    }
  ]
}) }}`;
    groq.position = [1700, 300];
    console.log('✅ Updated Análisis de IA (now uses orchestrated vision+text input)');
  }

  // 6. UPDATE: Parser — add dropbox URL to multimedia if available
  const parser = wf.nodes.find(n => n.name === 'Parsear Respuesta IA');
  if (parser) {
    parser.parameters.jsCode = `
// Parse the Groq AI response (the final structured extraction)
const raw = $json.choices[0].message.content;
const orchestratorData = $('Orquestar Resultados').item.json;
let parsed;

try {
  const clean = raw
    .replace(/\`\`\`json\\n?/g, '')
    .replace(/\`\`\`\\n?/g, '')
    .trim();
  parsed = JSON.parse(clean);
} catch (e) {
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

const sanitize = (val) => String(val || '').replace(/'/g, "''");

// Add Dropbox URL to multimedia if available
let multimedia = parsed.multimedia || [];
if (orchestratorData.dropboxUrl && !multimedia.includes(orchestratorData.dropboxUrl)) {
  multimedia.push(orchestratorData.dropboxUrl);
}

return {
  json: {
    nombre_proyecto: sanitize(parsed.nombre_proyecto || parsed.nombre || 'Sin nombre'),
    titulo: sanitize(parsed.titulo || parsed.titulo_profesional || 'Sin titulo'),
    descripcion: sanitize(parsed.descripcion || ''),
    es_oficial: parsed.es_oficial === true || parsed.es_constructora_oficial === true,
    zona: sanitize(parsed.zona || parsed.ubicacion || 'No especificada'),
    precio: sanitize(parsed.precio || 'Consultar'),
    multimedia: JSON.stringify(multimedia),
    vision_analysis: sanitize(orchestratorData.visionDescription || '').substring(0, 500),
    source_caption: sanitize(orchestratorData.caption || ''),
    source_phone: sanitize(orchestratorData.phone || '')
  }
};
`;
    parser.position = [1900, 300];
    console.log('✅ Updated Parser (adds Dropbox URL + vision data)');
  }

  // 7. Remove old nodes and add new ones
  wf.nodes = wf.nodes.filter(n => 
    !['prep-vision-node', 'vision-ai-node', 'orchestrator-node'].includes(n.id)
  );
  wf.nodes.push(prepVisionNode, visionNode, orchestratorNode);

  // 8. Reposition remaining nodes
  const positions = {
    'Cada 1 minuto': [100, 400],
    'Gestionar Paginación': [300, 400],
    'Obtener mensajes': [500, 400],
    '¿Tiene medios?': [700, 400],
    'Descargar contenido': [700, 200],
    'Traductor Maestro': [900, 200],
    'Carga a Dropbox': [900, 300],
    'Guardar en Cockroach': [2100, 300],
    'Avanzar Paginación': [2300, 300],
    'Reiniciar Ciclo': [900, 600]
  };
  for (const [name, pos] of Object.entries(positions)) {
    const node = wf.nodes.find(n => n.name === name);
    if (node) node.position = pos;
  }

  // 9. REWIRE connections for the orchestra
  const triggerName = wf.nodes.find(n => n.type.includes('scheduleTrigger'))?.name || 'Cada 1 minuto';
  
  wf.connections = {
    [triggerName]: {
      main: [[{ node: 'Gestionar Paginación', type: 'main', index: 0 }]]
    },
    'Gestionar Paginación': {
      main: [[{ node: 'Obtener mensajes', type: 'main', index: 0 }]]
    },
    'Obtener mensajes': {
      main: [[{ node: '¿Tiene medios?', type: 'main', index: 0 }]]
    },
    '¿Tiene medios?': {
      main: [
        [{ node: 'Descargar contenido', type: 'main', index: 0 }],
        [{ node: 'Reiniciar Ciclo', type: 'main', index: 0 }]
      ]
    },
    'Descargar contenido': {
      main: [[{ node: 'Traductor Maestro', type: 'main', index: 0 }]]
    },
    'Traductor Maestro': {
      main: [[{ node: 'Carga a Dropbox', type: 'main', index: 0 }]]
    },
    'Carga a Dropbox': {
      main: [[{ node: 'Preparar Visión', type: 'main', index: 0 }]]
    },
    'Preparar Visión': {
      main: [[{ node: 'Visión IA (Groq)', type: 'main', index: 0 }]]
    },
    'Visión IA (Groq)': {
      main: [[{ node: 'Orquestar Resultados', type: 'main', index: 0 }]]
    },
    'Orquestar Resultados': {
      main: [[{ node: 'Análisis de IA (Groq)', type: 'main', index: 0 }]]
    },
    'Análisis de IA (Groq)': {
      main: [[{ node: 'Parsear Respuesta IA', type: 'main', index: 0 }]]
    },
    'Parsear Respuesta IA': {
      main: [[{ node: 'Guardar en Cockroach', type: 'main', index: 0 }]]
    },
    'Guardar en Cockroach': {
      main: [[{ node: 'Avanzar Paginación', type: 'main', index: 0 }]]
    }
  };

  console.log('\n✅ Orchestra connections:');
  console.log('   ⏰ Trigger → 📊 Pagination → 🐘 Fetch → ❓ Has Media?');
  console.log('   ├── YES → 📥 Download → 🔄 Traductor (caption+base64)');
  console.log('   │      → 📦 Dropbox Upload');
  console.log('   │      → 🧠 Preparar Visión (build request)');
  console.log('   │      → 👁️ Visión IA (Groq llama-3.2-90b-vision)');
  console.log('   │      → 🎭 Orquestar (merge vision + text)');
  console.log('   │      → 📝 Análisis IA (Groq llama-3.3-70b-versatile)');
  console.log('   │      → 🔧 Parser → 💾 Save → ⏩ Advance');
  console.log('   └── NO → 🔄 Reiniciar Ciclo');

  // 10. Push workflow
  console.log('\n📤 Pushing orchestra workflow...');
  const putRes = await fetch(`${N8N_URL}/api/v1/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '[PROD] Ingestor Multimedia v9.0 (Orquesta IA)',
      nodes: wf.nodes,
      connections: wf.connections,
      settings: { executionOrder: 'v1' }
    })
  });

  if (putRes.ok) {
    const d = await putRes.json();
    console.log(`\n🎉 ORCHESTRA DEPLOYED! ${d.nodes.length} nodes`);
    console.log('   Active:', d.active);
    console.log('   Name:', d.name);
    console.log('\n🎭 AI Models:');
    console.log('   👁️ Vision: llama-3.2-90b-vision-preview (image analysis)');
    console.log('   📝 Text:   llama-3.3-70b-versatile (structured extraction)');
  } else {
    console.log('❌', putRes.status, await putRes.text());
  }
}

buildOrchestra();
