import fs from 'fs';
import path from 'path';

const N8N_API_URL = "https://n8n-l2mj.onrender.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiM2QzM2QxMTEtZjk4Zi00NGE0LWE1NTYtOTQ0NmYwY2MzOGQwIiwiaWF0IjoxNzc0MTYxMTEzfQ.7yaXK2HyRO4wQFQ7ew1XpUsFRo6XhFnrAzfczTe-EEo";

const workflowFiles = [
    'BACKFILL_GODMODE_LOOP.json',
    'godmode_unified.json',
    'whatsapp_ingest.json',
    'perfilador_usuario.json',
    'email_inactividad.json',
    'api_perfil.json'
];

async function restoreWorkflows() {
    console.log("🚀 Iniciando restauración automática de n8n...");

    for (const file of workflowFiles) {
        const filePath = path.join(process.cwd(), 'n8n', file);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Saltando ${file}: No encontrado.`);
            continue;
        }

        console.log(`📡 Restaurando ${file}...`);
        const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // n8n Public API requires 'name', 'nodes', and 'connections'
        const payload = {
            name: workflowData.name || file.replace('.json', ''),
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: workflowData.settings || {}
        };

        try {
            const response = await fetch(`${N8N_API_URL}/workflows`, {
                method: 'POST',
                headers: {
                    'X-N8N-API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok) {
                console.log(`✅ ${file} restaurado con éxito (ID: ${result.id})`);
            } else {
                console.error(`❌ Error en ${file}: ${JSON.stringify(result)}`);
            }
        } catch (error) {
            console.error(`💥 Error fatal enviando ${file}: ${error.message}`);
        }
    }
    console.log("🏁 Proceso completado. ¡Revisa tu n8n!");
}

restoreWorkflows();
