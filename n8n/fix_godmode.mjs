const N8N_URL = "https://suskj501-n8n.hf.space/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOGZmZTRmMTQtNzAwNi00ZDBlLTgxYzYtNDNkZWFkOTU1ZjBmIiwiaWF0IjoxNzc3NjkzOTA1fQ.rB2WCEolzUPJ4OAalW-qLSRuHmKbU4Icx3aexSOnW7Y";
const HEADERS = { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' };

const WORKFLOW_ID = "2an73cTYGEPQuW4Y";

// ═══════════════════════════════════════════════════════
// FLUJO CORREGIDO Y POTENCIADO
// Bugs corregidos:
//   1. NaN offset → ahora usa fallback a 0
//   2. Columna "nan" → eliminada con coalesce seguro
//   3. SambaNova → Groq (más rápido y estable)
//   4. inventario_digital → properties en Railway
//   5. Filtro mejorado: solo constructoras profesionales
// ═══════════════════════════════════════════════════════

const fixedNodes = [
  {
    "parameters": {
      "path": "ingest-property",
      "options": {}
    },
    "name": "Webhook_Trigger",
    "type": "n8n-nodes-base.webhook",
    "typeVersion": 1,
    "position": [0, 300],
    "id": "webhook-ingest"
  },
  {
    "parameters": {
      "values": {
        "string": [
          {
            "name": "messageContent",
            "value": "={{ $json.body?.message || $json.body?.content || $json.query?.text }}"
          }
        ]
      }
    },
    "name": "Prepare_Data",
    "type": "n8n-nodes-base.set",
    "typeVersion": 1,
    "position": [250, 300],
    "id": "prepare-data"
  },

  {
    "parameters": { "batchSize": 1 },
    "name": "Split",
    "type": "n8n-nodes-base.splitInBatches",
    "typeVersion": 1,
    "position": [600, 300],
    "id": "22ed67ab-f5a7-4d01-a9e6-fc1e1d97fd89"
  },
  {
    "parameters": {
      "conditions": {
        "string": [
          {
            "value1": "={{$json[\"messageContent\"] || $json[\"message\"]?.[\"conversation\"] || \"\"}}",
            "operation": "notEmpty"
          }
        ]
      }
    },
    "name": "Filter_Text",
    "type": "n8n-nodes-base.if",
    "typeVersion": 1,
    "position": [800, 300],
    "id": "89d1fb6a-daed-403a-b865-eeca95dff84b"
  },
  {
    // CAMBIO: SambaNova → Groq Llama 3.3 70B (mucho más rápido)
    // CAMBIO: Prompt mejorado con filtro de constructoras y extracción a properties
    "parameters": {
      "method": "POST",
      "url": "https://api.groq.com/openai/v1/chat/completions",
      "authentication": "predefinedCredentialType",
      "nodeCredentialType": "groqApi",
      "sendHeaders": true,
      "headerParameters": {
        "parameters": [
          { "name": "Content-Type", "value": "application/json" }
        ]
      },
      "sendBody": true,
      "specifyBody": "json",
      "jsonBody": `={
  "model": "llama-3.3-70b-versatile",
  "response_format": { "type": "json_object" },
  "temperature": 0.1,
  "messages": [
    {
      "role": "system",
      "content": "Eres el Censor de Propiedades de Novo Heritage Group. Analiza mensajes de WhatsApp de bienes raíces.\\n\\nREGLA 1: SOLO aprueba propiedades que provengan de CONSTRUCTORAS, promotores o desarrolladores inmobiliarios profesionales. RECHAZA ventas de particulares, dueños directos, mensajes genéricos, saludos, preguntas o spam.\\nREGLA 2: Redacta un titulo_profesional elegante (ej: 'Residencial Premium de 3 Habs en Piantini').\\nREGLA 3: Extrae precio, habitaciones, baños, área en m2, ubicación.\\nREGLA 4: Extrae URLs de fotos/videos/drive que aparezcan.\\nREGLA 5: Clasifica tipo_propiedad: apartamento, casa, villa, penthouse, local, solar, otro.\\n\\nResponde SOLO con JSON:\\n{\\\"aprobado\\\": true/false, \\\"motivo_rechazo\\\": \\\"\\\", \\\"titulo_profesional\\\": \\\"\\\", \\\"descripcion\\\": \\\"\\\", \\\"tipo_propiedad\\\": \\\"\\\", \\\"constructora\\\": \\\"\\\", \\\"precio\\\": 0, \\\"habitaciones\\\": 0, \\\"banos\\\": 0, \\\"area_m2\\\": 0, \\\"ubicacion\\\": \\\"\\\", \\\"transaction_type\\\": \\\"venta\\\", \\\"imagenes\\\": []}"
    },
    {
      "role": "user",
      "content": "{{ ($json['messageContent'] || $json['message']?.['conversation'] || 'N/A').replace(/[\\\\\\"\\\\\\\\\\\\ \\b\\f\\n\\r\\t]/g, ' ').substring(0, 2000) }}"
    }
  ]
}`,
      "options": {
        "timeout": 30000
      }
    },
    "name": "Groq_Filter",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.1,
    "position": [1050, 200],
    "credentials": {
      "groqApi": {
        "id": "BjFpWR9T4H92nwl9",
        "name": "Groq account"
      }
    },
    "id": "a206333a-8e61-4841-8294-1025d93b63de"
  },
  {
    // Nodo Code para parsear el JSON de Groq de forma segura
    "parameters": {
      "jsCode": `try {
  const raw = $input.first().json.choices[0].message.content;
  const parsed = JSON.parse(raw);
  return { json: parsed };
} catch(e) {
  return { json: { aprobado: false, motivo_rechazo: 'Error al parsear respuesta IA' } };
}`
    },
    "name": "Parse_AI",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [1250, 200],
    "id": "parse-ai-response"
  },
  {
    "parameters": {
      "conditions": {
        "string": [
          {
            "value1": "={{ String($json.aprobado) }}",
            "operation": "equal",
            "value2": "true"
          }
        ]
      }
    },
    "name": "Is_Valid",
    "type": "n8n-nodes-base.if",
    "typeVersion": 1,
    "position": [1450, 200],
    "id": "842929da-0f7b-492b-aed1-f7027ac588f7"
  },
  {
    // CAMBIO: Ahora inserta en properties de RAILWAY (no inventario_digital)
    "parameters": {
      "operation": "executeQuery",
      "query": "INSERT INTO properties (title, description, type, bedrooms, bathrooms, area, price, location, image, status, transaction_type, is_published, agent_name) VALUES ( '{{ $json.titulo_profesional.replace(/'/g, \"''\") }}', '{{ ($json.descripcion || \"\").replace(/'/g, \"''\") }}', '{{ $json.tipo_propiedad || \"\" }}', {{ $json.habitaciones || 0 }}, {{ $json.banos || 0 }}, {{ $json.area_m2 || 0 }}, {{ $json.precio || 0 }}, '{{ ($json.ubicacion || \"\").replace(/'/g, \"''\") }}', '{{ $json.imagenes && $json.imagenes.length > 0 ? $json.imagenes[0] : \"\" }}', 'available', '{{ $json.transaction_type || \"venta\" }}', true, '{{ ($json.constructora || \"Desarrollador\").replace(/'/g, \"''\") }}' ) ON CONFLICT DO NOTHING RETURNING id;"
    },
    "name": "Save_Railway",
    "type": "n8n-nodes-base.postgres",
    "typeVersion": 1,
    "position": [1650, 100],
    "credentials": {
      "postgres": {
        "id": "CvfAMQyiDbqrANJd",
        "name": "Railway Postgres"
      }
    },
    "id": "2ba4194f-1466-412a-9606-6b6389ba1afd"
  },
  {
    "parameters": {
      "amount": 1,
      "unit": "seconds"
    },
    "name": "Cooldown",
    "type": "n8n-nodes-base.wait",
    "typeVersion": 1,
    "position": [1850, 300],
    "id": "b35cce13-e273-4664-a562-253699dd52c1",
    "webhookId": "99b3c77c-09fc-4a87-9315-c049bd2cbaa8"
  }
];

const fixedConnections = {
  "Webhook_Trigger": {
    "main": [[{ "node": "Prepare_Data", "type": "main", "index": 0 }]]
  },
  "Prepare_Data": {
    "main": [[{ "node": "Split", "type": "main", "index": 0 }]]
  },
  "Split": {

    "main": [[{ "node": "Filter_Text", "type": "main", "index": 0 }]]
  },
  "Filter_Text": {
    "main": [[{ "node": "Groq_Filter", "type": "main", "index": 0 }]],
    "false": [[{ "node": "Cooldown", "type": "main", "index": 0 }]]
  },
  "Groq_Filter": {
    "main": [[{ "node": "Parse_AI", "type": "main", "index": 0 }]]
  },
  "Parse_AI": {
    "main": [[{ "node": "Is_Valid", "type": "main", "index": 0 }]]
  },
  "Is_Valid": {
    "main": [[{ "node": "Save_Railway", "type": "main", "index": 0 }]],
    "false": [[{ "node": "Cooldown", "type": "main", "index": 0 }]]
  },
  "Save_Railway": {
    "main": [[{ "node": "Cooldown", "type": "main", "index": 0 }]]
  },
  "Cooldown": {
    "main": []
  }
};

async function fixWorkflow() {
  console.log("🔧 Actualizando Godmode V15 con correcciones...");

  const updatePayload = {
    name: "[ELITE] Godmode V15 → Railway + Groq 🏡🚀",
    nodes: fixedNodes,
    connections: fixedConnections,
    settings: { "callerPolicy": "workflowsFromSameOwner" }
  };

  try {
    const res = await fetch(`${N8N_URL}/workflows/${WORKFLOW_ID}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(updatePayload)
    });
    const result = await res.json();
    if (res.ok) {
      console.log(`✅ Flujo actualizado! (ID: ${result.id})`);
      console.log(`   Nombre: ${result.name}`);
    } else {
      console.log(`❌ Error: ${JSON.stringify(result)}`);
    }
  } catch(e) {
    console.log(`💥 Fatal: ${e.message}`);
  }
}

fixWorkflow();
