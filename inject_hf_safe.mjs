import https from 'https';
import fs from 'fs';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMDU2M2VjOTMtOTVhYy00YmY0LThhNTYtZWEyZmFlMDYzY2IxIiwiaWF0IjoxNzc0MjIxNTk1fQ.9TKpX6vgpY8p4lpTxs6xv-OHvi6Y4kavWs71BcRHBiI';
const HF_HOST = 'suskj501-n8n.hf.space';

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : '';
        const options = {
            hostname: HF_HOST,
            path: '/api/v1' + path,
            method,
            timeout: 15000,
            headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
        };
        if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function injectHFSafely() {
    console.log(`--- EMPEZANDO INYECCIÓN EN HUGGING FACE SPACES (${HF_HOST}) ---`);
    console.log('Probando API Key...');
    const credsCheck = await request('/credentials');
    if (credsCheck && credsCheck.data) {
        console.log('✅ API Auth Exitosa. Hugging Face responde velozmente.');
    } else {
        console.error('❌ HF API Error o Auth Inválida (N8N_ENCRYPTION_KEY cambió, o DB vacía):', credsCheck);
        return;
    }

    // El JSON que creamos antes
    const backfillPayload = JSON.parse(fs.readFileSync('d:\\Users\\User\\Downloads\\deploy-68ec5eaaa66cd5d7084e5733\\FINAL_V15_BACKFILL.json', 'utf8'));

    // Flujo del Webhook Ingestor
    const ingestorPayload = {
        "name": "[REAL-TIME OFICIAL] WhatsApp Ingestor 📥💎",
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "whatsapp-webhook",
                    "options": {}
                },
                "name": "Evolution_API_Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [
                    0,
                    400
                ],
                "webhookId": "cb4fce77-906f-449e-b816-c73d576ab131"
            },
            {
                "parameters": {
                    "operation": "executeQuery",
                    "query": "INSERT INTO public.inventario_digital (nombre_proyecto, zona, comision, tipo_activo, url_activo, stock_disponible)\nVALUES (\n    '{{JSON.parse($node[\"Groq_Logic\"].json.choices[0].message.content).proyecto.replace(/'/g, \"''\")}}', \n    '{{(JSON.parse($node[\"Groq_Logic\"].json.choices[0].message.content).zona || \"N/A\").replace(/'/g, \"''\")}}',\n    '{{(JSON.parse($node[\"Groq_Logic\"].json.choices[0].message.content).comision || \"N/A\").replace(/'/g, \"''\")}}',\n    'WhatsApp/Real-Time',\n    '{{$node[\"Evolution_API_Webhook\"].json[\"body\"]?.[\"data\"]?.[\"key\"]?.[\"id\"] || \"\"}}',\n    true\n)\nON CONFLICT (url_activo) DO UPDATE \nSET stock_disponible = EXCLUDED.stock_disponible;"
                },
                "name": "Save_Project",
                "type": "n8n-nodes-base.postgres",
                "typeVersion": 1,
                "position": [
                    800,
                    400
                ],
                "credentials": {
                    "postgres": {
                        "id": "ym3KfQZLjCvWmUjS"
                    }
                }
            },
            {
                "parameters": {
                    "method": "POST",
                    "url": "https://api.groq.com/openai/v1/chat/completions",
                    "authentication": "genericCredentialType",
                    "genericAuthType": "httpHeaderAuth",
                    "sendBody": true,
                    "bodyParameters": {
                        "parameters": [
                            {
                                "name": "model",
                                "value": "llama-3.1-70b-versatile"
                            },
                            {
                                "name": "messages",
                                "value": "=[{\"role\": \"system\", \"content\": \"Analista Inmobiliario. Si el texto es una oferta de venta/alquiler, extrae JSON: 'proyecto', 'zona', 'comision'. Si es una pregunta ('¿Precio?', 'Buenas'), spam o no es una oferta, responde proyecto: 'N/A'. Solo JSON.\"}, {\"role\": \"user\", \"content\": \"{{($json['body']?.['data']?.['message']?.['conversation'] || $json['body']?.['data']?.['message']?.['extendedTextMessage']?.['text'] || 'N/A').replace(/[\\\"\\\\\\b\\f\\n\\r\\t]/g, '')}}\"}]"
                            },
                            {
                                "name": "response_format",
                                "value": "={ \"type\": \"json_object\" }"
                            }
                        ]
                    }
                },
                "name": "Groq_Logic",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.1,
                "position": [
                    400,
                    400
                ],
                "credentials": {
                    "httpHeaderAuth": {
                        "id": "Bz3xfXM6claHNoqr"
                    }
                }
            },
            {
                "parameters": {
                    "conditions": {
                        "string": [
                            {
                                "value1": "={{$json[\"choices\"]?.[0]?.message?.content ? JSON.parse($json.choices[0].message.content).proyecto : \"N/A\"}}",
                                "operation": "notEqual",
                                "value2": "N/A"
                            }
                        ]
                    }
                },
                "name": "Is_Valid",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [
                    600,
                    400
                ]
            }
        ],
        "connections": {
            "Evolution_API_Webhook": {
                "main": [
                    [
                        {
                            "node": "Groq_Logic",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Groq_Logic": {
                "main": [
                    [
                        {
                            "node": "Is_Valid",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Is_Valid": {
                "main": [
                    [
                        {
                            "node": "Save_Project",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        "settings": {}
    };

    console.log('--- Limpiando versiones de Backfill exclusivas ...');
    const allWfs = await request('/workflows?limit=100');
    if (allWfs.data) {
        for (const wf of allWfs.data) {
            const lowName = wf.name.toLowerCase();
            // ONLY delete the specific backfill or real-time ingestor we created previously
            if (
                lowName.includes('backfill') ||
                lowName.includes('ingestor') ||
                lowName.includes('flujo en tiempo real')
            ) {
                console.log(`Borrando ${wf.name} (${wf.id})`);
                await request(`/workflows/${wf.id}`, 'DELETE');
            }
        }
    }

    console.log('--- Subiendo V15 Backfill ---');
    const v15Res = await request('/workflows', 'POST', backfillPayload);
    if (v15Res.id) {
        console.log(`✅ V15 Backfill creado. Activando ID ${v15Res.id}...`);
        await request(`/workflows/${v15Res.id}/activate`, 'POST');
    }

    console.log('--- Subiendo Ingestor de WhatsApp (Real-Time) ---');
    const ingestRes = await request('/workflows', 'POST', ingestorPayload);
    if (ingestRes.id) {
        console.log(`✅ Ingestor creado. Activando ID ${ingestRes.id}...`);
        await request(`/workflows/${ingestRes.id}/activate`, 'POST');
    }

    console.log(`
🎉 INYECCIÓN COMPLETADA !
`);
}

injectHFSafely();
