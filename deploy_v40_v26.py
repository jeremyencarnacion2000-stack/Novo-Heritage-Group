import json
import urllib.request
import urllib.error

# --- CONFIGURACIÓN V40.26 (SQL NATIVO BLINDADO) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"

EVO_KEY = "422ed947-f495-46fd-9e9f-7ac4c995f32a"
NEON_CRED = "QAujOADT2s8Oox8O"

def deploy():
    workflow_name = "[V26] SQL NATIVE Property Ingestor (Novo Heritage)"
    
    nodes = [
        # 1. Trigger
        {
            "parameters": { "httpMethod": "POST", "path": "prop-ingest-v19", "options": {} },
            "id": "trigger-v26", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 200]
        },
        # 2. Router
        {
            "parameters": { "conditions": { "boolean": [ { "value1": "={{ $json.body.messageType === 'imageMessage' }}", "value2": True } ] } },
            "id": "router-v26", "name": "Media Router", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [200, 200]
        },

        # --- A: IMAGE ---
        {
            "parameters": { "url": "=https://evolution.suskj501.hf.space/media/download/{{$node['Webhook'].json.body.key.remoteJid}}/{{$node['Webhook'].json.body.key.id}}", "sendHeaders": True, "headerParameters": { "parameters": [{ "name": "apikey", "value": EVO_KEY }] }, "responseFormat": "file" },
            "id": "fetcher-v26", "name": "Media Fetcher", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [450, 50]
        },
        {
            "parameters": { "method": "POST", "url": "https://api.sambanova.ai/v1/chat/completions", "sendHeaders": True, "headerParameters": { "parameters": [{ "name": "Authorization", "value": "Bearer 6295ae62-0920-4172-abc8-9548092ac526" }] }, "sendBody": True, "contentType": "json", "bodyParameters": { "parameters": [ { "name": "model", "value": "Llama-3.2-11B-Vision-Instruct" }, { "name": "messages", "value": "={{ [ { 'role': 'user', 'content': [ { 'type': 'text', 'text': 'Extract property details and output only a brief string with title and price.' }, { 'type': 'image_url', 'image_url': { 'url': 'data:image/jpeg;base64,' + $node['Media Fetcher'].binary.data.data } } ] } ] }}" } ] } },
            "id": "vision-v26", "name": "Vision AI", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [650, 0]
        },
        {
            "parameters": { "method": "POST", "url": "=https://zqdldyyhzbxagdasmmfa.supabase.co/storage/v1/object/propiedades-fotos/{{$node['Webhook'].json.body.key.id}}.jpg", "sendHeaders": True, "headerParameters": { "parameters": [{ "name": "Authorization", "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZGxkeXloemJ4YWdkYXNtbWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3OTYxNywiZXhwIjoyMDkwNTU1NjE3fQ.xB61IlopQnZJWwCfkD9a6CfDd3au2GNGkUgJMo1MnkM" }] }, "sendBody": True, "contentType": "binaryData", "inputDataFieldName": "data" },
            "id": "supabase-v26", "name": "Supabase Store", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [650, 150]
        },
        {
            "parameters": { "jsCode": "const tit = $node['Vision AI'].json.choices?.[0]?.message?.content || 'Propiedad Extraída (IA)'; const img = 'https://zqdldyyhzbxagdasmmfa.supabase.co/storage/v1/object/public/propiedades-fotos/' + $node['Webhook'].json.body.key.id + '.jpg'; return { queryText: `INSERT INTO public.properties (id, title, price, image, created_at) VALUES (gen_random_uuid(), '${tit.replace(/'/g, \"''\")}', 0, '${img}', NOW());` };" },
            "id": "format-image-26", "name": "Format Image SQL", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [850, 50]
        },

        # --- B: TEXT ---
        {
            "parameters": { "jsCode": "const body = $node['Webhook'].json.body; const tit = body.message?.conversation || body.message?.extendedTextMessage?.text || 'Propiedad Sin Foto'; return { queryText: `INSERT INTO public.properties (id, title, price, image, created_at) VALUES (gen_random_uuid(), '${tit.replace(/'/g, \"''\")}', 0, NULL, NOW());` };" },
            "id": "format-text-26", "name": "Format Text SQL", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [500, 350]
        },

        # 4. NEON (SQL NATIVO) - Bypasses parameter insertion bugs
        {
            "parameters": { "operation": "executeQuery", "query": "={{ $json.queryText }}" },
            "id": "neon-sql-26", "name": "Neon Execute SQL", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [1100, 200],
            "credentials": { "postgres": { "id": NEON_CRED } },
            "continueOnFail": True
        }
    ]

    connections = {
        "Webhook": { "main": [[{ "node": "Media Router", "type": "main", "index": 0 }]] },
        "Media Router": { "main": [[{ "node": "Media Fetcher", "type": "main", "index": 0 }], [{ "node": "Format Text SQL", "type": "main", "index": 0 }]] },
        "Media Fetcher": { "main": [[{ "node": "Vision AI", "type": "main", "index": 0 }]] },
        "Vision AI": { "main": [[{ "node": "Supabase Store", "type": "main", "index": 0 }]] },
        "Supabase Store": { "main": [[{ "node": "Format Image SQL", "type": "main", "index": 0 }]] },
        "Format Image SQL": { "main": [[{ "node": "Neon Execute SQL", "type": "main", "index": 0 }]] },
        "Format Text SQL": { "main": [[{ "node": "Neon Execute SQL", "type": "main", "index": 0 }]] }
    }

    payload = { "name": workflow_name, "nodes": nodes, "connections": connections, "settings": { "executionOrder": "v1" } }
    headers = { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" }
    
    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(payload).encode(), headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[OK] V26 NATIVE SQL Pipeline deployed.")
            act = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers=headers, method='POST')
            urllib.request.urlopen(act)
            print("[SUCCESS] NEON DB IS NOW RECEIVING RAW SQL INSERTS.")
    except Exception as e:
        print(f"[FAIL] V26: {str(e)}")

if __name__ == "__main__":
    deploy()
