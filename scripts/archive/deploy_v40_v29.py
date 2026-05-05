import json
import urllib.request
import urllib.error

# --- CONFIGURACIÓN V40.29 (THE NORMALIZER) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"
NEON_CRED = "QAujOADT2s8Oox8O"

def deploy():
    workflow_name = "[V29] OPTIMIZED Property Ingestor (Neon Guard)"
    
    nodes = [
        # 1. Trigger
        {
            "parameters": { "httpMethod": "POST", "path": "prop-ingest-v19", "options": {} },
            "id": "trigger-v29", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 200]
        },
        # 2. Normalizador de Payload: Extrae el mensaje puro sin importar la configuración de Evolution API
        {
            "parameters": { "jsCode": "const json = $json.body;\nlet msg = null;\n// 1. Evolution Event array\nif (json && json.data && Array.isArray(json.data.messages)) {\n    msg = json.data.messages[0];\n// 2. Evolution Event object\n} else if (json && json.data && json.data.key) {\n    msg = json.data;\n// 3. Direct/Manual\n} else {\n    msg = json;\n}\n\n// Extraer texto base\nlet textExtracted = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text;\nif (!textExtracted && msg?.message?.imageMessage?.caption) {\n    textExtracted = msg.message.imageMessage.caption;\n}\n\nconst isImage = msg?.messageType === 'imageMessage' || !!msg?.message?.imageMessage;\n// Intentamos sacar el Base64 directamente si viene habilitado en Evolution\nconst base64Data = msg?.message?.base64 || msg?.base64 || (msg?.message?.imageMessage && msg?.message?.imageMessage?.base64) || null;\n\nreturn { \n    isImage: isImage,\n    messageId: msg?.key?.id || 'Unknown_ID',\n    text: textExtracted || 'Propiedad sin descripción detectada',\n    base64: base64Data,\n    remoteJid: msg?.key?.remoteJid || ''\n};" },
            "id": "normalize-v29", "name": "Normalize Payload", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [200, 200]
        },
        # 3. Router
        {
            "parameters": { "conditions": { "boolean": [ { "value1": "={{ $json.isImage }}", "value2": True } ] } },
            "id": "router-v29", "name": "Media Router", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [400, 200]
        },
        # --- A: TEXTO ---
        {
            "parameters": { "jsCode": "const tit = $json.text; return { queryText: `INSERT INTO public.properties (id, title, price, image, created_at) VALUES (gen_random_uuid(), '${tit.replace(/'/g, \"''\")}', 0, NULL, NOW());` };" },
            "id": "format-text-29", "name": "Format Text SQL", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [650, 400]
        },
        # --- 4. NEON (SOLO SQL PARA NO CONSUMIR RECURSOS) ---
        {
            "parameters": { "operation": "executeQuery", "query": "={{ $json.queryText }}" },
            "id": "neon-sql-29", "name": "Neon Execute SQL", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [1100, 200],
            "credentials": { "postgres": { "id": NEON_CRED } }, "continueOnFail": True
        }
    ]

    connections = {
        "Webhook": { "main": [[{ "node": "Normalize Payload", "type": "main", "index": 0 }]] },
        "Normalize Payload": { "main": [[{ "node": "Media Router", "type": "main", "index": 0 }]] },
        "Media Router": { "main": [[], [{ "node": "Format Text SQL", "type": "main", "index": 0 }]] },
        "Format Text SQL": { "main": [[{ "node": "Neon Execute SQL", "type": "main", "index": 0 }]] }
    }

    # Descartando bloques de Visión por el momento para probar la recepción en crudo.
    payload = { "name": workflow_name, "nodes": nodes, "connections": connections, "settings": { "executionOrder": "v1" } }
    headers = { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" }
    
    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(payload).encode(), headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[OK] V29 Normalizer Pipeline deployed.")
            act = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers=headers, method='POST')
            urllib.request.urlopen(act)
            print("[SUCCESS] NEON DB IS GUARDED. WAITING FOR WHATSAPP REAL PAYLOAD.")
    except Exception as e:
        print(f"[FAIL] V29: {str(e)}")

if __name__ == "__main__":
    deploy()
