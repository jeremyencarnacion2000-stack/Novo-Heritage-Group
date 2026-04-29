import json
import urllib.request
import urllib.error

# --- CONFIGURACIÓN V40.25 (FAILSAFE ROUTER) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"

EVO_KEY = "422ed947-f495-46fd-9e9f-7ac4c995f32a"
NEON_CRED = "QAujOADT2s8Oox8O"

def deploy():
    workflow_name = "[V25] FAILSAFE Property Ingestor (Novo Heritage)"
    
    nodes = [
        # 1. Trigger Webhook
        {
            "parameters": { "httpMethod": "POST", "path": "prop-ingest-v19", "options": {} },
            "id": "trigger-v25", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 200]
        },
        # 2. Router
        {
            "parameters": { "conditions": { "boolean": [ { "value1": "={{ $json.body.messageType === 'imageMessage' }}", "value2": True } ] } },
            "id": "router-v25", "name": "Media Router", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [200, 200]
        },

        # --- BRANCH A: MEDIA (IMAGE) ---
        {
            "parameters": {
                "url": "=https://evolution.suskj501.hf.space/media/download/{{$node['Webhook'].json.body.key.remoteJid}}/{{$node['Webhook'].json.body.key.id}}",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "apikey", "value": EVO_KEY }] },
                "responseFormat": "file",
                "options": {}
            },
            "id": "fetcher-v25", "name": "Media Fetcher", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [450, 50]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://api.sambanova.ai/v1/chat/completions",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "Authorization", "value": "Bearer 6295ae62-0920-4172-abc8-9548092ac526" }] },
                "sendBody": True,
                "contentType": "json",
                "bodyParameters": {
                    "parameters": [
                        { "name": "model", "value": "Llama-3.2-11B-Vision-Instruct" },
                        { "name": "messages", "value": "={{ [ { 'role': 'user', 'content': [ { 'type': 'text', 'text': 'Return property description or title.' }, { 'type': 'image_url', 'image_url': { 'url': 'data:image/jpeg;base64,' + $node['Media Fetcher'].binary.data.data } } ] } ] }}" }
                    ]
                }
            },
            "id": "vision-v25", "name": "Vision AI", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [650, 0]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "=https://zqdldyyhzbxagdasmmfa.supabase.co/storage/v1/object/propiedades-fotos/{{$node['Webhook'].json.body.key.id}}.jpg",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "Authorization", "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZGxkeXloemJ4YWdkYXNtbWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3OTYxNywiZXhwIjoyMDkwNTU1NjE3fQ.xB61IlopQnZJWwCfkD9a6CfDd3au2GNGkUgJMo1MnkM" }] },
                "sendBody": True,
                "contentType": "binaryData",
                "inputDataFieldName": "data",
                "options": {}
            },
            "id": "supabase-v25", "name": "Supabase Store", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [650, 150]
        },
        {
            "parameters": {
                "jsCode": "return { title: $node['Vision AI'].json.choices?.[0]?.message?.content || 'Propiedad (Imagen)', image: 'https://zqdldyyhzbxagdasmmfa.supabase.co/storage/v1/object/public/propiedades-fotos/' + $node['Webhook'].json.body.key.id + '.jpg' };"
            },
            "id": "format-image", "name": "Format Image Data", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [850, 100]
        },

        # --- BRANCH B: TEXT ONLY ---
        {
            "parameters": {
                "jsCode": "const body = $node['Webhook'].json.body; const text = body.message?.conversation || body.message?.extendedTextMessage?.text || 'Propiedad Webhook (Sin Texto)'; return { title: text, image: null };"
            },
            "id": "format-text", "name": "Format Text Data", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [500, 350]
        },

        # 4. NEON UNIFIED SAVE
        {
            "parameters": {
                "operation": "insert", "schema": "public", "table": "properties",
                "columns": {
                    "mappingMode": "defineBelow",
                    "value": {
                        "title": "={{ $json.title }}",
                        "image": "={{ $json.image }}"
                    }
                }
            },
            "id": "neon-v25", "name": "Neon Save", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [1100, 200],
            "credentials": { "postgres": { "id": NEON_CRED } }
        }
    ]

    connections = {
        "Webhook": { "main": [[{ "node": "Media Router", "type": "main", "index": 0 }]] },
        "Media Router": { "main": [[{ "node": "Media Fetcher", "type": "main", "index": 0 }], [{ "node": "Format Text Data", "type": "main", "index": 0 }]] },
        "Media Fetcher": { "main": [[{ "node": "Vision AI", "type": "main", "index": 0 }]] },
        "Vision AI": { "main": [[{ "node": "Supabase Store", "type": "main", "index": 0 }]] },
        "Supabase Store": { "main": [[{ "node": "Format Image Data", "type": "main", "index": 0 }]] },
        "Format Image Data": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] },
        "Format Text Data": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] }
    }

    payload = { "name": workflow_name, "nodes": nodes, "connections": connections, "settings": { "executionOrder": "v1" } }
    headers = { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" }
    
    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(payload).encode(), headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[OK] Failsafe Pipeline V25 deployed.")
            act_req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers=headers, method='POST')
            urllib.request.urlopen(act_req)
            print("[SUCCESS] NOVO HERITAGE V25 IS ACTIVE AND SECURE.")
    except Exception as e:
        print(f"[FAIL] V25: {str(e)}")

if __name__ == "__main__":
    deploy()
