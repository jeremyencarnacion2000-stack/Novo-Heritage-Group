
const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

const workflow = {
  "name": "[PROD] Ingestor Multimedia V1.1 (Fixed AI Syntax)",
  "nodes": [
    {
      "parameters": {},
      "id": "trigger",
      "name": "Start Ingestion",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [0, 400]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n  id,\n  \"messageType\",\n  CASE\n    WHEN \"messageType\" = 'conversation' THEN message->>'conversation'\n    WHEN \"messageType\" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'\n    WHEN \"messageType\" = 'imageMessage' THEN message->'imageMessage'->>'caption'\n    WHEN \"messageType\" = 'videoMessage' THEN message->'videoMessage'->>'caption'\n    ELSE ''\n  END as text_content,\n  message as raw_message,\n  \"pushName\",\n  \"messageTimestamp\"\nFROM evolution.\"Message\"\nWHERE \"messageType\" IN ('conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage')\n  AND CASE\n    WHEN \"messageType\" = 'conversation' THEN length(message->>'conversation') > 30\n    WHEN \"messageType\" = 'extendedTextMessage' THEN length(message->'extendedTextMessage'->>'text') > 30\n    WHEN \"messageType\" = 'imageMessage' THEN TRUE\n    WHEN \"messageType\" = 'videoMessage' THEN TRUE\n    ELSE FALSE\n  END\nORDER BY \"messageTimestamp\" DESC\nLIMIT 100",
        "options": {}
      },
      "id": "fetch-messages",
      "name": "Fetch Messages",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.3,
      "position": [200, 400],
      "credentials": {
        "postgres": {
          "id": "ym3KfQZLjCvWmUjS",
          "name": "Postgres account"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.messageType}}",
              "operation": "regex",
              "value2": "imageMessage|videoMessage"
            }
          ]
        }
      },
      "id": "has-media",
      "name": "Has Media?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [400, 400]
    },
    {
      "parameters": {
        "url": "=https://wasa-el6v.onrender.com/media/download/{{JSON.parse($json.raw_message).key.id}}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "responseFormat": "file"
        }
      },
      "id": "download-media",
      "name": "Download Media",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [600, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "u46bitcJQIW1QNfu",
          "name": "Header Auth account 2"
        }
      },
      "continueOnFail": true
    },
    {
      "parameters": {
        "path": "=/NovosHeritage/{{$json.pushName || 'Media'}}/{{$json.id}}.jpg",
        "fileContent": "data"
      },
      "id": "dropbox-upload",
      "name": "Dropbox Upload",
      "type": "n8n-nodes-base.dropbox",
      "typeVersion": 1,
      "position": [800, 300],
      "credentials": {
        "dropboxOAuth2Api": {
          "id": "DRP_LINK",
          "name": "Dropbox account"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.sambanova.ai/v1/chat/completions",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ model: 'Meta-Llama-3.1-405B-Instruct', messages: [{ role: 'system', content: 'Eres un experto en bienes raíces. Analiza el mensaje y extrae datos en JSON.\\n\\nREGLAS:\\n1. Analiza si es una CONSTRUCTORA OFICIAL o proyecto formal (es_oficial: true). Si es un vendedor informal o independiente (es_oficial: false).\\n2. Crea un titulo_profesional atractivo.\\n3. descripcion_limpia NO debe tener teléfonos ni nombres de otros vendedores.\\n4. Responde ÚNICAMENTE el JSON puro.\\n\\nFormato:\\n{\"nombre\": \"...\", \"titulo\": \"...\", \"descripcion\": \"...\", \"es_oficial\": true, \"zona\": \"...\", \"precio\": \"...\"}' }, { role: 'user', content: 'Analiza este contenido:\\n' + ($json.text_content || '(Sin texto)') }], temperature: 0.1 }) }}",
        "options": {}
      },
      "id": "ai-analysis",
      "name": "AI Professional Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1000, 500],
      "credentials": {
        "httpHeaderAuth": {
          "id": "u46bitcJQIW1QNfu",
          "name": "Header Auth account 2"
        }
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=INSERT INTO public.inventario_digital \n  (nombre_proyecto, titulo_profesional, descripcion_limpia, es_constructora_oficial, zona, precio, multimedia)\nVALUES (\n  '{{ JSON.parse($json.choices[0].message.content).nombre }}',\n  '{{ JSON.parse($json.choices[0].message.content).titulo }}',\n  '{{ JSON.parse($json.choices[0].message.content).descripcion }}',\n  {{ JSON.parse($json.choices[0].message.content).es_oficial || false }},\n  '{{ JSON.parse($json.choices[0].message.content).zona }}',\n  '{{ JSON.parse($json.choices[0].message.content).precio }}',\n  '{{ JSON.stringify(($node[\"Dropbox Upload\"] && $node[\"Dropbox Upload\"].json && $node[\"Dropbox Upload\"].json.link) ? [$node[\"Dropbox Upload\"].json.link] : []) }}'::jsonb\n)\nON CONFLICT (nombre_proyecto) DO UPDATE SET\n  multimedia = COALESCE(inventario_digital.multimedia, '[]'::jsonb) || EXCLUDED.multimedia,\n  fecha_actualizacion = NOW();"
      },
      "id": "save-to-db",
      "name": "Save to DB",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.3,
      "position": [1300, 400],
      "credentials": {
        "postgres": {
          "id": "ym3KfQZLjCvWmUjS",
          "name": "Postgres account"
        }
      }
    }
  ],
  "connections": {
    "Start Ingestion": {
      "main": [[{"node": "Fetch Messages", "type": "main", "index": 0}]]
    },
    "Fetch Messages": {
      "main": [[{"node": "Has Media?", "type": "main", "index": 0}]]
    },
    "Has Media?": {
      "main": [
        [{"node": "Download Media", "type": "main", "index": 0}],
        [{"node": "AI Professional Analysis", "type": "main", "index": 0}]
      ]
    },
    "Download Media": {
      "main": [[{"node": "Dropbox Upload", "type": "main", "index": 0}]]
    },
    "Dropbox Upload": {
      "main": [[{"node": "AI Professional Analysis", "type": "main", "index": 0}]]
    },
    "AI Professional Analysis": {
      "main": [[{"node": "Save to DB", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
};

async function deploy() {
  try {
    const response = await fetch(`https://${N8N_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    });
    const data = await response.json();
    if (response.status === 200 || response.status === 201) {
      console.log('SUCCESS: Workflow deployed! ID:', data.id);
      console.log('URL:', `https://${N8N_URL}/workflow/${data.id}`);
    } else {
      console.log('Error deploying:', data);
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

deploy();
