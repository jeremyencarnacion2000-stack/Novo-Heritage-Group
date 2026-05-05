import fs from 'fs';
import path from 'path';

const N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOGZmZTRmMTQtNzAwNi00ZDBlLTgxYzYtNDNkZWFkOTU1ZjBmIiwiaWF0IjoxNzc3NjkzOTA1fQ.rB2WCEolzUPJ4OAalW-qLSRuHmKbU4Icx3aexSOnW7Y";

const workflow = {
  "name": "🔥 Ingestor WhatsApp x Groq x Railway",
  "nodes": [
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
      "typeVersion": 2.1,
      "position": [240, 640]
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Analiza el mensaje de WhatsApp. Extrae TODOS los detalles de la propiedad con extremo profesionalismo.\n\nCuerpo del Mensaje:\n{{ $json.body.message || $json.body.Body }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Eres el Censor Oficial de Novo Heritage. Tu trabajo es FILTRAR y ESTRUCTURAR propiedades inmobiliarias que llegan por WhatsApp.\n\nREGLA 1: SOLO puedes aprobar propiedades que provengan evidentemente de CONSTRUCTORAS o desarrolladores directos (ej. proyectos nuevos, residenciales en pre-venta). RECHAZA propiedades de individuos particulares, anuncios genéricos, dueños directos («dueño vende») o que no parezcan profesionales.\nREGLA 2: Si es una constructora/proyecto válido, REDACTA UN TÍTULO PROFESIONAL (ej. 'Exclusivo Apartamento de 3 Habitaciones en Torre Lumen, Naco') ignorando la jerga de WhatsApp.\nREGLA 3: Extrae todos los datos posibles: precio, habitaciones, baños, metraje (área).\nREGLA 4: Extrae CUALQUIER URL multimedia (enlaces a Google Drive, YouTube, fotos, videos cortos, web) que estén en el mensaje y guárdalos en el array 'imagenes'. Es muy importante atrapar las imágenes.\nSi se rechaza, pon 'aprobado': false y da un breve 'motivo_rechazo'."
        }
      },
      "id": "agent-groq",
      "name": "AI Filter & Extract (Groq)",
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "typeVersion": 1.4,
      "position": [464, 528]
    },
    {
      "parameters": {
        "model": "llama-3.3-70b-versatile",
        "options": {
          "temperature": 0.1
        }
      },
      "id": "model-groq",
      "name": "Groq Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatGroq",
      "typeVersion": 1,
      "position": [480, 752],
      "credentials": {
        "groqApi": {
          "id": "BjFpWR9T4H92nwl9",
          "name": "Groq account"
        }
      }
    },
    {
      "parameters": {
        "jsonSchemaExample": {
          "aprobado": true,
          "motivo_rechazo": "",
          "titulo_profesional": "Villa de Lujo Punta Cana Resort",
          "descripcion": "Descripción depurada y profesional...",
          "tipo_propiedad": "villa",
          "constructora": "Desarrollos del Este",
          "precio": 550000,
          "habitaciones": 4,
          "banos": 4,
          "area_m2": 350,
          "ubicacion": "Punta Cana, La Altagracia",
          "imagenes": ["https://drive.google.com/xyz", "https://ejemplo.com/foto.jpg"]
        }
      },
      "id": "parser-groq",
      "name": "Structured Output Parser",
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [608, 752]
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
              "leftValue": "={{ $json.output.aprobado }}",
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
      "name": "If Constructora Aprobada",
      "type": "n8n-nodes-base.if",
      "typeVersion": 3.2,
      "position": [816, 528]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO properties (title, description, type, bedrooms, bathrooms, area, price, location, image, features, status, transaction_type, is_published, agent_name, whatsapp_id)\nVALUES (\n  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'available', 'venta', true, $11, $12\n) RETURNING id;",
        "options": {
          "queryParameters": "={{ [\n  $json.output.titulo_profesional,\n  $json.output.descripcion,\n  $json.output.tipo_propiedad,\n  $json.output.habitaciones || 0,\n  $json.output.banos || 0,\n  $json.output.area_m2 || 0,\n  $json.output.precio || 0,\n  $json.output.ubicacion,\n  $json.output.imagenes && $json.output.imagenes.length > 0 ? $json.output.imagenes[0] : '',\n  $json.output.imagenes || [],\n  $json.output.constructora,\n  $node[\"WhatsApp Webhook\"].json.body.From || 'unknown'\n] }}"
        }
      },
      "id": "insert-railway",
      "name": "Save to Railway Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.6,
      "position": [1120, 420],
      "credentials": {
        "postgres": {
          "id": "CvfAMQyiDbqrANJd", 
          "name": "Postgres account"
        }
      }
    },
    {
      "parameters": {
        "content": "Rechazado por IA. Motivo: {{ $json.output.motivo_rechazo }}"
      },
      "id": "reject-log",
      "name": "Log Rechazo",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [1120, 640]
    }
  ],
  "connections": {
    "WhatsApp Webhook": {
      "main": [
        [
          {
            "node": "AI Filter & Extract (Groq)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Filter & Extract (Groq)": {
      "main": [
        [
          {
            "node": "If Constructora Aprobada",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Groq Model": {
      "ai_languageModel": [
        [
          {
            "node": "AI Filter & Extract (Groq)",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Structured Output Parser": {
      "ai_outputParser": [
        [
          {
            "node": "AI Filter & Extract (Groq)",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "If Constructora Aprobada": {
      "main": [
        [
          {
            "node": "Save to Railway Database",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Log Rechazo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
};

async function deploy() {
    console.log("🚀 Desplegando Ingestor Inteligente hacia n8n...");

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
            console.log(`✅ Flujo desplegado espectacularmente! (ID: ${result.id})`);
            console.log(`🔗 URL del Webhook: https://n8n-l2mj.onrender.com/webhook/whatsapp-ingest-ai`);
            console.log(`🛠️ Ve a tu UI de n8n para activarlo.`);
        } else {
            console.error(`❌ Error en n8n: ${JSON.stringify(result)}`);
        }
    } catch (error) {
        console.error(`💥 Error fatal: ${error.message}`);
    }
}

deploy();
