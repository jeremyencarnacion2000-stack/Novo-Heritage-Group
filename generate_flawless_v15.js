const fs = require('fs');

const payload = {
    name: "[FINAL OFICIAL] Godmode Backfill V15 🏡🛡️💎",
    nodes: [
        { "parameters": {}, "name": "Trigger", "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1, "position": [0, 300] },
        { "parameters": { "values": { "number": [{ "name": "offset", "value": "={{$node[\"Split\"].context.currentRunIndex * 50}}" }] } }, "name": "Calc_Offset", "type": "n8n-nodes-base.set", "typeVersion": 1, "position": [200, 300] },
        { "parameters": { "operation": "executeQuery", "query": "SELECT * FROM evolution.\"Message\" ORDER BY \"messageTimestamp\" DESC LIMIT 50 OFFSET {{$json.offset}};" }, "name": "Fetch_50", "type": "n8n-nodes-base.postgres", "typeVersion": 1, "position": [400, 300], "credentials": { "postgres": { "id": "ym3KfQZLjCvWmUjS" } } },
        { "parameters": { "batchSize": 1 }, "name": "Split", "type": "n8n-nodes-base.splitInBatches", "typeVersion": 1, "position": [600, 300] },
        { "parameters": { "conditions": { "string": [{ "value1": "={{$json[\"messageContent\"] || $json[\"message\"]?.[\"conversation\"] || \"\"}}", "operation": "notEmpty" }] } }, "name": "Filter_Text", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [800, 300] },
        { "parameters": { "method": "POST", "url": "https://api.groq.com/openai/v1/chat/completions", "authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth", "sendBody": true, "bodyParameters": { "parameters": [{ "name": "model", "value": "llama-3.1-70b-versatile" }, { "name": "messages", "value": "=[{\"role\": \"system\", \"content\": \"Analista Inmobiliario. Si el texto es una oferta de venta/alquiler, extrae JSON: 'proyecto', 'zona', 'comision'. Si es una pregunta ('¿Precio?', 'Buenas'), spam o no es una oferta, responde proyecto: 'N/A'. Solo JSON.\"}, {\"role\": \"user\", \"content\": \"{{($json['messageContent'] || $json['message']?.['conversation'] || 'N/A').replace(/[\\\"\\\\\\b\\f\\n\\r\\t]/g, '')}}\"}]" }, { "name": "response_format", "value": "={ \"type\": \"json_object\" }" }] } }, "name": "Groq_Logic", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [1050, 200], "credentials": { "httpHeaderAuth": { "id": "Bz3xfXM6claHNoqr" } } },
        { "parameters": { "conditions": { "string": [{ "value1": "={{$json[\"choices\"]?.[0]?.message?.content ? JSON.parse($json.choices[0].message.content).proyecto : \"N/A\"}}", "operation": "notEqual", "value2": "N/A" }] } }, "name": "Is_Valid", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [1250, 200] },
        { "parameters": { "operation": "executeQuery", "query": "INSERT INTO public.inventario_digital (nombre_proyecto, zona, comision, tipo_activo, url_activo, stock_disponible) VALUES ('{{JSON.parse($node[\"Groq_Logic\"].json.choices[0].message.content).proyecto.replace(/'/g, \"''\")}}', '{{(JSON.parse($node[\"Groq_Logic\"].json.choices[0].message.content).zona || \"N/A\").replace(/'/g, \"''\")}}', '{{(JSON.parse($node[\"Groq_Logic\"].json.choices[0].message.content).comision || \"N/A\").replace(/'/g, \"''\")}}', 'WhatsApp/Backfill', '{{$node[\"Split\"].json[\"id\"]}}', true) ON CONFLICT (url_activo) DO UPDATE SET stock_disponible = EXCLUDED.stock_disponible;" }, "name": "Save_Project", "type": "n8n-nodes-base.postgres", "typeVersion": 1, "position": [1450, 100], "credentials": { "postgres": { "id": "ym3KfQZLjCvWmUjS" } } },
        { "parameters": { "amount": 1, "unit": "seconds" }, "name": "Wait_bridge", "type": "n8n-nodes-base.wait", "typeVersion": 1, "position": [1600, 300] }
    ],
    connections: {
        "Trigger": { "main": [[{ "node": "Calc_Offset", "type": "main", "index": 0 }]] },
        "Calc_Offset": { "main": [[{ "node": "Fetch_50", "type": "main", "index": 0 }]] },
        "Fetch_50": { "main": [[{ "node": "Split", "type": "main", "index": 0 }]] },
        "Split": { "main": [[{ "node": "Filter_Text", "type": "main", "index": 0 }]] },
        "Filter_Text": { "main": [[{ "node": "Groq_Logic", "type": "main", "index": 0 }]], "false": [[{ "node": "Wait_bridge", "type": "main", "index": 0 }]] },
        "Groq_Logic": { "main": [[{ "node": "Is_Valid", "type": "main", "index": 0 }]] },
        "Is_Valid": { "main": [[{ "node": "Save_Project", "type": "main", "index": 0 }]], "false": [[{ "node": "Wait_bridge", "type": "main", "index": 0 }]] },
        "Save_Project": { "main": [[{ "node": "Wait_bridge", "type": "main", "index": 0 }]] },
        "Wait_bridge": { "main": [[{ "node": "Calc_Offset", "type": "main", "index": 0 }]] }
    },
    settings: {}
};

fs.writeFileSync('d:\\Users\\User\\Downloads\\deploy-68ec5eaaa66cd5d7084e5733\\V15_FLAWLESS.json', JSON.stringify(payload, null, 2));
console.log('V15 FLAWLESS generado exitosamente.');
