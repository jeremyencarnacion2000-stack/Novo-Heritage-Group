import fs from 'fs';

const HEADERS = {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOGZmZTRmMTQtNzAwNi00ZDBlLTgxYzYtNDNkZWFkOTU1ZjBmIiwiaWF0IjoxNzc3NjkzOTA1fQ.rB2WCEolzUPJ4OAalW-qLSRuHmKbU4Icx3aexSOnW7Y',
    'Content-Type': 'application/json'
};

const N8N_URL = 'https://suskj501-n8n.hf.space/api/v1/workflows';
const KEEP_ID = 'Qy7JQ0kiEzu9gGpA'; // El bueno recién desplegado!

async function cleanN8n() {
    const res = await fetch(N8N_URL, { headers: HEADERS });
    const data = await res.json();
    
    if (!data.data) {
        console.log("No workflows found or auth error.");
        return;
    }

    let deleted = 0;
    
    for (const w of data.data) {
        // Mantenemos los activos siempre y el que acabo de crear.
        if (w.active || w.id === KEEP_ID) {
            console.log(`[KEEP] ${w.name} (Active: ${w.active}, ID: ${w.id})`);
            continue;
        }

        const isOldVersion = 
            w.name.includes("Godmode Backfill") || 
            w.name.includes("WhatsApp Ingestion V18") ||
            w.name.includes("WhatsApp Monitor") ||
            w.name.includes("Ingestor WhatsApp");

        if (isOldVersion) {
            console.log(`[DELETE] Eliminando basura: ${w.name} (${w.id})`);
            try {
                const delReq = await fetch(`${N8N_URL}/${w.id}`, { method: 'DELETE', headers: HEADERS });
                if (delReq.ok) deleted++;
            } catch(e) {
                console.log("Error al borrar " + w.id);
            }
        } else {
            console.log(`[SKIP] No estoy seguro si borrar: ${w.name}`);
        }
    }
    
    console.log(`\n🧹 ¡Limpieza completada! Se eliminaron ${deleted} flujos antiguos.`);
}

cleanN8n();
