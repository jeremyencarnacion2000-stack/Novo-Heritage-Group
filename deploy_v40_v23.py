import json
import urllib.request
import urllib.error

# --- CONFIGURACIÓN V40.23 (FINAL ALIGNMENT) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"

EVO_KEY = "422ed947-f495-46fd-9e9f-7ac4c995f32a"

def deploy():
    workflow_name = "[V23] FINAL PROPERTY INGESTOR (Novo Heritage)"
    
    nodes = [
        # 1. Trigger Webhook (Forzado a POST para Evolution API)
        {
            "parameters": { "httpMethod": "POST", "path": "prop-ingest-v19", "options": {} },
            "id": "trigger-v23", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 200]
        },
        # 2. Media Fetcher (Descarga Imagen)
        {
            "parameters": {
                "url": "=https://evolution.suskj501.hf.space/media/download/{{$json.body.key.remoteJid}}/{{$json.body.key.id}}",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "apikey", "value": EVO_KEY }] },
                "responseFormat": "file",
                "options": {}
            },
            "id": "downloader-v23", "name": "Media Fetcher", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [200, 100]
        },
        # 3. Vision AI (Sambanova)
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
                        { "name": "messages", "value": "={{ [ { 'role': 'user', 'content': [ { 'type': 'text', 'text': 'Extract structured property JSON (title, price, description).' }, { 'type': 'image_url', 'image_url': { 'url': 'data:image/jpeg;base64,' + $node['Media Fetcher'].binary.data.data } } ] } ] }}" }
                    ]
                }
            },
            "id": "vision-v23", "name": "Vision AI", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [450, 100]
        },
        # 4. Supabase Store (Gratis)
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
            "id": "supabase-v23", "name": "Supabase Store", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [450, 400]
        },
        # 5. Neon Final Save
        {
            "parameters": {
                "operation": "insert", "schema": "public", "table": "properties",
                "columns": {
                    "mappingMode": "defineBelow",
                    "value": {
                        "title": "={{ $node['Vision AI'].json.choices[0].message.content }}",
                        "image": "=https://zqdldyyhzbxagdasmmfa.supabase.co/storage/v1/object/public/propiedades-fotos/{{$node['Webhook'].json.body.key.id}}.jpg"
                    }
                }
            },
            "id": "neon-v23", "name": "Neon Save", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [750, 200],
            "credentials": { "postgres": { "id": "QAujOADT2s8Oox8O" } }
        }
    ]

    connections = {
        "Webhook": { "main": [[{ "node": "Media Fetcher", "type": "main", "index": 0 }, { "node": "Supabase Store", "type": "main", "index": 0 }]] },
        "Media Fetcher": { "main": [[{ "node": "Vision AI", "type": "main", "index": 0 }]] },
        "Vision AI": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] },
        "Supabase Store": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] }
    }

    payload = { "name": workflow_name, "nodes": nodes, "connections": connections, "settings": { "executionOrder": "v1" } }
    headers = { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" }
    
    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(payload).encode(), headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[OK] Pipeline V23 Final Alignment deployed.")
            act_req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers=headers, method='POST')
            urllib.request.urlopen(act_req)
            print("[SUCCESS] WEBHOOK ALIGNED TO POST. READY.")
    except Exception as e:
        print(f"[FAIL] V23: {str(e)}")

if __name__ == "__main__":
    deploy()
