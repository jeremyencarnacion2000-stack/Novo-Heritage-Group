import json
import urllib.request

# --- CONFIGURACION V40.30 (MASTER FILTER) ---
N8N_API_URL = "https://suskj501-n8n.hf.space/api/v1"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDI1Mjg2OTctNGQyNS00YjAwLWIyY2ItOTdiZGY1N2Y5YjJhIiwiaWF0IjoxNzc1NDEyNjIxfQ.KNKdpH2fSsJoj1Ur402uRw_IKf-54MGucDvovDZLFrs"
NEON_CRED = "QAujOADT2s8Oox8O"

def deploy():
    print("1. Localizando llaves de Supabase Storage de Empresa...")
    req_creds = urllib.request.Request(f"{N8N_API_URL}/credentials", headers={"X-N8N-API-KEY": N8N_API_KEY})
    try:
        creds = json.loads(urllib.request.urlopen(req_creds).read().decode())
        SUPA_CRED = None
        for c in creds.get("data", []):
            if "supabase" in c["type"].lower() or "supabase" in c["name"].lower():
                SUPA_CRED = c["id"]
                break
    except:
        SUPA_CRED = None

    print(f"Credencial Supabase ID encontrada: {SUPA_CRED}")

    nodes = [
        # 1. Trigger
        {
            "parameters": { "httpMethod": "POST", "path": "prop-ingest-v19", "options": {} },
            "id": "trigger", "name": "Webhook", "type": "n8n-nodes-base.webhook", "typeVersion": 2, "position": [0, 200]
        },
        # 2. Advanced Pre-Filter (Mata a los "Buscos" aquí mismo sin gastar hardware AI)
        {
            "parameters": { "jsCode": """
const json = $json.body;
let msg = null;
if (json && json.data && Array.isArray(json.data.messages)) { msg = json.data.messages[0]; }
else if (json && json.data && json.data.key) { msg = json.data; }
else { msg = json; }

let text = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || msg?.message?.imageMessage?.caption || "";
if (text.length < 50) return []; // Filtrar por tamaño

let tLow = text.toLowerCase();
let badWords = ["busco", "búsqueda", "buscamos", "cliente busca", "alguien tiene", "agentes ojo", "solicito", "requerimiento"];
for(let bad of badWords) { if(tLow.includes(bad)) return []; }

let goodWords = ["venta", "alquiler", "renta", "us$", "rd$", "usd"];
let hasGood = false;
for(let good of goodWords) { if(tLow.includes(good)){ hasGood = true; break;} }
if(!hasGood) return [];

const isImage = msg?.messageType === 'imageMessage' || !!(msg?.message?.imageMessage);
const base64Data = msg?.message?.base64 || msg?.base64 || (msg?.message?.imageMessage && msg?.message?.imageMessage?.base64) || null;

return {
    isImage: isImage,
    messageId: msg?.key?.id || 'w_' + Math.random().toString(36).substr(2, 9),
    text: text,
    base64: base64Data
};
            """ },
            "id": "filter", "name": "El Muro (Pre-Filtro)", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [200, 200]
        },
        # 3. SambaNova AI Node
        {
            "parameters": {
                "method": "POST",
                "url": "https://api.sambanova.ai/v1/chat/completions",
                "sendHeaders": True,
                "headerParameters": { "parameters": [ { "name": "Authorization", "value": "Bearer 6295ae62-0920-4172-abc8-9548092ac526" } ] },
                "sendBody": True,
                "specifyBody": "json",
                "jsonBody": """={"model":"Meta-Llama-3.1-8B-Instruct","messages":[{"role":"system","content":"Extract real estate info. JSON EXACTO. Reglas: 'title' (max 6 palabras, corporativo, 0 EMOJIS), 'price' (solo numeros, 0 si imposible calcular), 'transaction_type' (Venta/Alquiler), 'type' (Casa/Apartamento/Villa/Local/Solar/Penthouse), 'bedrooms' (int), 'bathrooms' (int), 'sector' (La Romana, Evaristo Morales, Piantini, etc), 'description' (Texto original pero DESTRUYENDO o BORRANDO TODOS los Emojis visuales para dejarla profesional)."},{"role":"user","content":"{{ $json.text }}"}]}"""
            },
            "id": "samba", "name": "AI Llama (AntiEmojis)", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.1, "position": [400, 200]
        },
        # 4. JSON Parser
        {
             "parameters": { "jsCode": """
try {
   let raw = $json.choices[0].message.content;
   if(raw.includes('```json')) { raw = raw.split('```json')[1].split('```')[0]; }
   let data = JSON.parse(raw);
   let price = data.price || 0;
   if (price === 0) return []; // Descartar los vacios y los $0
   
   return { ...data, isImage: $('El Muro (Pre-Filtro)').item.json.isImage, base64: $('El Muro (Pre-Filtro)').item.json.base64, msgId: $('El Muro (Pre-Filtro)').item.json.messageId, rawText: $('El Muro (Pre-Filtro)').item.json.text };
} catch(e) {
   return []; // Skip si IA falla
}
             """ },
             "id": "parser", "name": "Validator $0", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [600, 200]
        },
        # 5. Image Router
        {
            "parameters": { "conditions": { "boolean": [ { "value1": "={{ $json.isImage }}", "value2": True } ] } },
            "id": "router", "name": "Switch: ¿Trae Foto Web?", "type": "n8n-nodes-base.if", "typeVersion": 1, "position": [800, 200]
        },
        # TRUE -> Usar Base64 Directa
        {
            "parameters": { "jsCode": """
const d = $('Validator $0').item.json;
const imgUrl = "data:image/jpeg;base64," + d.base64;

const safeTitle = (d.title || "Propiedad Premium").replace(/'/g, "''").substring(0, 50);
const escDesc = (d.description || d.rawText).replace(/'/g, "''");
const typeSafe = (d.type || "Apartamento").replace(/'/g, "");

return { query: `INSERT INTO properties (id, title, price, transaction_type, type, location, city, sector, bedrooms, bathrooms, area, description, image, is_published, created_at) VALUES (gen_random_uuid(), '${safeTitle}', ${d.price}, '${d.transaction_type || 'Venta'}', '${typeSafe}', 'República Dominicana', 'Santo Domingo', '${(d.sector || 'N/A').replace(/'/g,"''")}', ${d.bedrooms || 2}, ${d.bathrooms || 1}, ${d.area || 150}, '${escDesc}', '${imgUrl}', true, NOW());` };
            """ },
            "id": "sql-img", "name": "Ensamblar Tarjeta B64", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [1100, 100]
        },
        # FALSE -> Build SQL NO IMG
        {
            "parameters": { "jsCode": """
const d = $json;
const imgUrls = ['https://images.unsplash.com/photo-1600607687931-cebf588c8f49?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'];
const fallback = imgUrls[Math.floor(Math.random() * imgUrls.length)];

const safeTitle = (d.title || "Propiedad Premium").replace(/'/g, "''").substring(0, 50);
const escDesc = (d.description || d.rawText).replace(/'/g, "''");
const typeSafe = (d.type || "Apartamento").replace(/'/g, "");

return { query: `INSERT INTO properties (id, title, price, transaction_type, type, location, city, sector, bedrooms, bathrooms, area, description, image, is_published, created_at) VALUES (gen_random_uuid(), '${safeTitle}', ${d.price}, '${d.transaction_type || 'Venta'}', '${typeSafe}', 'República Dominicana', 'Santo Domingo', '${(d.sector || 'N/A').replace(/'/g,"''")}', ${d.bedrooms || 2}, ${d.bathrooms || 1}, ${d.area || 150}, '${escDesc}', '${fallback}', true, NOW());` };
            """ },
            "id": "sql-no-img", "name": "Ensamblar Tarjeta Texto", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [1100, 350]
        },
        # FINAL INSERT NEON
        {
            "parameters": { "operation": "executeQuery", "query": "={{ $json.query }}" },
            "id": "neon-insert", "name": "PostgreSQL NEON", "type": "n8n-nodes-base.postgres", "typeVersion": 2.1, "position": [1800, 200], "credentials": { "postgres": { "id": NEON_CRED } }
        }
    ]

    # Credenciales dinámicas no requeridas para Base64.

    conns = {
        "Webhook": { "main": [[{ "node": "El Muro (Pre-Filtro)", "type": "main", "index": 0 }]] },
        "El Muro (Pre-Filtro)": { "main": [[{ "node": "AI Llama (AntiEmojis)", "type": "main", "index": 0 }]] },
        "AI Llama (AntiEmojis)": { "main": [[{ "node": "Validator $0", "type": "main", "index": 0 }]] },
        "Validator $0": { "main": [[{ "node": "Switch: ¿Trae Foto Web?", "type": "main", "index": 0 }]] },
        "Switch: ¿Trae Foto Web?": { "main": [
            [{ "node": "Ensamblar Tarjeta B64", "type": "main", "index": 0 }],
            [{ "node": "Ensamblar Tarjeta Texto", "type": "main", "index": 0 }]
        ]},
        "Ensamblar Tarjeta B64": { "main": [[{ "node": "PostgreSQL NEON", "type": "main", "index": 0 }]] },
        "Ensamblar Tarjeta Texto": { "main": [[{ "node": "PostgreSQL NEON", "type": "main", "index": 0 }]] },
    }

    print("2. Empaquetando Workflow V40.30 y enviando a HuggingFace...")
    wf = { "name": "[V30] NOVO HERITAGE - Master Ingestor AI Pipeline", "nodes": nodes, "connections": conns, "settings": {"executionOrder": "v1"} }

    req = urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h", data=json.dumps(wf).encode(), headers={"X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json"}, method='PUT')
    try:
        with urllib.request.urlopen(req) as response:
            print("[EXITO TOTAL] Flujo N8N Profesional V40.30 ha sido inyectado en Servidor N8N.")
            urllib.request.urlopen(urllib.request.Request(f"{N8N_API_URL}/workflows/zbuHq4K16Ff7Wr8h/activate", data=b"{}", headers={"X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json"}, method='POST'))
            print("[ACTIVO] El escudo protector y pipeline de fotos ya está corriendo en la nube recibiendo datos en vivo.")
    except urllib.error.HTTPError as e:
        print(f"Error HTTP N8N: {e.read().decode()}")
    except Exception as e:
        print(f"Error general: {e}")

if __name__ == "__main__":
    deploy()
