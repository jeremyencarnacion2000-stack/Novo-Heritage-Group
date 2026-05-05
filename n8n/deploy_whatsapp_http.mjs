import fs from 'fs';
import path from 'path';

const N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOGZmZTRmMTQtNzAwNi00ZDBlLTgxYzYtNDNkZWFkOTU1ZjBmIiwiaWF0IjoxNzc3NjkzOTA1fQ.rB2WCEolzUPJ4OAalW-qLSRuHmKbU4Icx3aexSOnW7Y";

const workflow = {
  "name": "🔥 Ingestor WhatsApp x Groq (Nativo HTTP)",
  "nodes": [
    {
      "parameters": {},
      "id": "manual-trigger",
      "name": "Prueba Manual (Click Aquí)",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [100, 100]
    },
    {
      "parameters": {
        "values": {
          "string": [
            { "name": "body.Body", "value": "Hola, somos Constructora Delta. Vendemos una villa premium de 3 habitaciones y 2 baños en Punta Cana por 250,000 USD. Metraje de 300m2. Foto: https://drive.google.com/villa" },
            { "name": "body.From", "value": "whatsapp:+12345678" },
            { "name": "body.message", "value": "" }
          ]
        },
        "options": {}
      },
      "id": "set-mock-data",
      "name": "Datos de Prueba",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [360, 100]
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-ingest-ai",
        "responseMode": "lastNode",
        "options": {}
      },
      "id": "webhook-whatsapp-in",
      "name": "WhatsApp Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 300]
    },
    {
      "parameters": {
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "groqApi",
        "method": "POST",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"model\": \"llama-3.3-70b-versatile\",\n  \"response_format\": { \"type\": \"json_object\" },\n  \"temperature\": 0.1,\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"Eres el Censor Oficial de Novo Heritage. Tu trabajo es FILTRAR propiedades inmobiliarias que llegan por WhatsApp.\\n\\nREGLA 1: SOLO aprobar propiedades de CONSTRUCTORAS o desarrolladores directos. RECHAZA propiedades de individuos particulares.\\nREGLA 2: Si es un proyecto válido, REDACTA UN TÍTULO PROFESIONAL ignorando jerga.\\nREGLA 3: Extrae precio, habitaciones, baños y metraje.\\nREGLA 4: Extrae CUALQUIER URL multimedia (fotos, videos, drive, web) que estén en el mensaje y guárdalos en el array 'imagenes'.\\n\\nDEBES responder única y exclusivamente con un objeto JSON (y la palabra JSON debe estar implícita en la instrucción) con esta estructura exacta:\\n{\\\"aprobado\\\": true, \\\"motivo_rechazo\\\": \\\"\\\", \\\"titulo_profesional\\\": \\\"\\\", \\\"descripcion\\\": \\\"\\\", \\\"tipo_propiedad\\\": \\\"\\\", \\\"constructora\\\": \\\"\\\", \\\"precio\\\": 0, \\\"habitaciones\\\": 0, \\\"banos\\\": 0, \\\"area_m2\\\": 0, \\\"ubicacion\\\": \\\"\\\", \\\"imagenes\\\": [\\\"url1\\\"]}\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"{{ $json.body.message || $json.body.Body || 'No message' }}\"\n    }\n  ]\n}",
        "options": {}
      },
      "id": "http-groq",
      "name": "Groq LLama3 (HTTP)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [360, 300],
      "credentials": {
        "groqApi": {
          "id": "BjFpWR9T4H92nwl9",
          "name": "Groq account"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const response = JSON.parse($input.first().json.choices[0].message.content);\nreturn { json: response };"
      },
      "id": "parse-json",
      "name": "Decodificar Respuesta IA",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [620, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "18f1eb73-af0e-4ebd-a330-fef17ad99876",
              "leftValue": "={{ $json.aprobado }}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "id": "if-approved",
      "name": "Si fue aprobada",
      "type": "n8n-nodes-base.if",
      "typeVersion": 3.2,
      "position": [880, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO properties (title, description, type, bedrooms, bathrooms, area, price, location, image, features, status, transaction_type, is_published, agent_name, whatsapp_id)\nVALUES (\n  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'available', 'venta', true, $11, $12\n) RETURNING id;",
        "options": {
          "queryParameters": "={{ [\n  $json.titulo_profesional || 'Propiedad de desarrollador',\n  $json.descripcion || '',\n  $json.tipo_propiedad || '',\n  $json.habitaciones || 0,\n  $json.banos || 0,\n  $json.area_m2 || 0,\n  $json.precio || 0,\n  $json.ubicacion || '',\n  $json.imagenes && $json.imagenes.length > 0 ? $json.imagenes[0] : '',\n  $json.imagenes || [],\n  $json.constructora || 'Desarrollador',\n  $('WhatsApp Webhook').first().json.body.From || 'unknown'\n] }}"
        }
      },
      "id": "insert-railway",
      "name": "Guardar en Railway",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.6,
      "position": [1160, 180],
      "credentials": {
        "postgres": {
          "id": "CvfAMQyiDbqrANJd", 
          "name": "Postgres account"
        }
      }
    },
    {
      "parameters": {
        "content": "Rechazado por IA. Motivo: {{ $json.motivo_rechazo }}"
      },
      "id": "reject-log",
      "name": "Bloqueado por Reglas",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [1160, 420]
    }
  ],
  "connections": {
    "Prueba Manual (Click Aquí)": {
      "main": [
        [
          {
            "node": "Datos de Prueba",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Datos de Prueba": {
      "main": [
        [
          {
            "node": "Groq LLama3 (HTTP)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "WhatsApp Webhook": {
      "main": [
        [
          {
            "node": "Groq LLama3 (HTTP)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Groq LLama3 (HTTP)": {
      "main": [
        [
          {
            "node": "Decodificar Respuesta IA",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Decodificar Respuesta IA": {
      "main": [
        [
          {
            "node": "Si fue aprobada",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Si fue aprobada": {
      "main": [
        [
          {
            "node": "Guardar en Railway",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Bloqueado por Reglas",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
};

async function deploy() {
    console.log("🚀 Desplegando Ingestor Nativo (Sin Bugs de Langchain)...");

    const payload = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: {}
    };

    try {
        const response = await fetch(`${N8N_API_URL}/workflows`, {
            method: 'POST',
            headers: {
                'X-N8N-API-KEY': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(`✅ Flujo desplegado de forma segura! (ID: ${result.id})`);
        } else {
            console.error(`❌ Error en n8n: ${JSON.stringify(result)}`);
        }
    } catch (error) {
        console.error(`💥 Error fatal: ${error.message}`);
    }
}

deploy();
