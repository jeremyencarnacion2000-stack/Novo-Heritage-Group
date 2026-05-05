import json
import urllib.request
import urllib.error

# --- CONFIGURACIÓN V40.20 (REAL PERSISTENCE) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"

SUPABASE_URL = "https://zqdldyyhzbxagdasmmfa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZGxkeXloemJ4YWdkYXNtbWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk3OTYxNywiZXhwIjoyMDkwNTU1NjE3fQ.xB61IlopQnZJWwCfkD9a6CfDd3au2GNGkUgJMo1MnkM"
NEON_CRED_ID = "QAujOADT2s8Oox8O"

SAMBANOVA_API_KEY = "6295ae62-0920-4172-abc8-9548092ac526"

def deploy():
    workflow_name = "[V20] FINAL Unified Property Ingestor (Novo Heritage)"
    
    nodes = [
        # 1. Trigger Webhook
        {
            "parameters": { "path": "prop-ingest-v19", "responseMode": "lastNode", "options": {} },
            "id": "trigger-v20", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [100, 200]
        },
        # 2. Vision Assistant (Sambanova)
        {
            "parameters": {
                "method": "POST",
                "url": "https://api.sambanova.ai/v1/chat/completions",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "Authorization", "value": f"Bearer {SAMBANOVA_API_KEY}" }] },
                "sendBody": True,
                "contentType": "json",
                "bodyParameters": {
                    "parameters": [
                        { "name": "model", "value": "Llama-3.2-11B-Vision-Instruct" },
                        { "name": "messages", "value": "={{ [ { 'role': 'user', 'content': [ { 'type': 'text', 'text': 'Extract structured property JSON. Fields: title, price, description, bedrooms, bathrooms, location.' }, { 'type': 'image_url', 'image_url': { 'url': 'data:image/jpeg;base64,' + $json.body.binaryData.data } } ] } ] }}" }
                    ]
                }
            },
            "id": "vision-v20", "name": "Vision AI", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [350, 100]
        },
        # 3. Supabase Storage (Subida Gratuita)
        {
            "parameters": {
                "method": "POST",
                "url": f"={SUPABASE_URL}/storage/v1/object/propiedades-fotos/{{{{ $node['Webhook'].json.body.key.id }}}}.jpg",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "Authorization", "value": f"Bearer {SUPABASE_KEY}" }, { "name": "x-upsert", "value": "true" }] },
                "sendBody": True,
                "contentType": "binaryData",
                "inputDataFieldName": "data",
                "options": {}
            },
            "id": "supabase-v20", "name": "Supabase Save", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [350, 300]
        },
        # 4. Neon Save (VINCULADO CON CREDENCIAL REAL)
        {
            "parameters": {
                "operation": "insert",
                "schema": "public",
                "table": "properties",
                "columns": {
                    "mappingMode": "defineBelow",
                    "value": {
                        "title": "={{ $node['Vision AI'].json.choices[0].message.content }}",
                        "image": f"={SUPABASE_URL}/storage/v1/object/public/propiedades-fotos/{{{{ $node['Webhook'].json.body.key.id }}}}.jpg"
                    }
                }
            },
            "id": "neon-v20", "name": "Neon Save", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [650, 200],
            "credentials": { "postgres": { "id": NEON_CRED_ID } }
        }
    ]

    connections = {
        "Webhook": { "main": [[{ "node": "Vision AI", "type": "main", "index": 0 }, { "node": "Supabase Save", "type": "main", "index": 0 }]] },
        "Vision AI": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] },
        "Supabase Save": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] }
    }

    payload = {
        "name": workflow_name,
        "nodes": nodes,
        "connections": connections,
        "settings": { 
            "executionOrder": "v1", 
            "saveDataErrorExecution": "all",
            "saveManualExecutions": False
        }
    }

    headers = { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" }
    
    # Update current workflow
    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(payload).encode(), headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[OK] Workflow V20 (Permanent Persistence) updated.")
            # Activate
            act_req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers=headers, method='POST')
            with urllib.request.urlopen(act_req) as act_res:
                print("[SUCCESS] V40.20 IS ACTIVE AND PERMANENT.")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] V40.20: {e.code} - {e.read().decode()}")

if __name__ == "__main__":
    deploy()
