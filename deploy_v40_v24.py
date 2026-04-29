import json
import urllib.request
import urllib.error

# --- CONFIGURACIÓN V40.24 (MASTER STABILIZATION) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"

EVO_KEY = "422ed947-f495-46fd-9e9f-7ac4c995f32a"

def deploy():
    workflow_name = "[V24] MASTER Property Ingestor (Novo Heritage)"
    
    nodes = [
        # 1. Trigger Webhook
        {
            "parameters": { "httpMethod": "POST", "path": "prop-ingest-v19", "options": {} },
            "id": "trigger-v24", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 200]
        },
        # 2. Router Inteligente
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        { "value1": "={{ $json.body.messageType === 'imageMessage' }}", "value2": True }
                    ]
                }
            },
            "id": "router-v24", "name": "Media Router", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [200, 200]
        },
        # 3. Media Fetcher (Solo si es Media)
        {
            "parameters": {
                "url": "=https://evolution.suskj501.hf.space/media/download/{{$node['Webhook'].json.body.key.remoteJid}}/{{$node['Webhook'].json.body.key.id}}",
                "sendHeaders": True,
                "headerParameters": { "parameters": [{ "name": "apikey", "value": EVO_KEY }] },
                "responseFormat": "file",
                "options": {}
            },
            "id": "downloader-v24", "name": "Media Fetcher", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [450, 100]
        },
        # 4. Vision AI (Sambanova)
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
                        { "name": "messages", "value": "={{ [ { 'role': 'user', 'content': [ { 'type': 'text', 'text': 'Return property JSON: title, price.' }, { 'type': 'image_url', 'image_url': { 'url': 'data:image/jpeg;base64,' + $node['Media Fetcher'].binary.data.data } } ] } ] }}" }
                    ]
                }
            },
            "id": "vision-v24", "name": "Vision AI", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [700, 100]
        },
        # 5. Neon Save (Permanent Persist)
        {
            "parameters": {
                "operation": "insert", "schema": "public", "table": "properties",
                "columns": {
                    "mappingMode": "defineBelow",
                    "value": {
                        "title": "={{ $json.choices[0].message.content || $node['Webhook'].json.body.message?.conversation || $node['Webhook'].json.body.message?.extendedTextMessage?.text }}"
                    }
                }
            },
            "id": "neon-v24", "name": "Neon Save", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [1000, 200],
            "credentials": { "postgres": { "id": "QAujOADT2s8Oox8O" } }
        }
    ]

    connections = {
        "Webhook": { "main": [[{ "node": "Media Router", "type": "main", "index": 0 }]] },
        "Media Router": { "main": [[{ "node": "Media Fetcher", "type": "main", "index": 0 }], [{ "node": "Neon Save", "type": "main", "index": 0 }]] },
        "Media Fetcher": { "main": [[{ "node": "Vision AI", "type": "main", "index": 0 }]] },
        "Vision AI": { "main": [[{ "node": "Neon Save", "type": "main", "index": 0 }]] }
    }

    payload = { "name": workflow_name, "nodes": nodes, "connections": connections, "settings": { "executionOrder": "v1" } }
    headers = { "X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json" }
    
    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(payload).encode(), headers=headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[OK] Master Pipeline V24 deployed.")
            act_req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers=headers, method='POST')
            urllib.request.urlopen(act_req)
            print("[SUCCESS] NOVO HERITAGE IS NOW INDESTRUCTIBLE. ALREADY LISTENING.")
    except Exception as e:
        print(f"[FAIL] V24: {str(e)}")

if __name__ == "__main__":
    deploy()
