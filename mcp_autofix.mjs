import https from 'https';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMDU2M2VjOTMtOTVhYy00YmY0LThhNTYtZWEyZmFlMDYzY2IxIiwiaWF0IjoxNzc0MjIxNTk1fQ.9TKpX6vgpY8p4lpTxs6xv-OHvi6Y4kavWs71BcRHBiI';
const N8N_HOST = 'n8n-l2mj.onrender.com';

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : '';
        const options = {
            hostname: N8N_HOST,
            path: '/api/v1' + path,
            method,
            headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
        };
        if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function autofix(wfId) {
    console.log(`--- INICIANDO MCP AUTOFIX EN WORKFLOW ${wfId} ---`);
    const wf = await request(`/workflows/${wfId}`);

    if (!wf || !wf.nodes) {
        console.error('Workflow no encontrado o sin nodos.');
        return;
    }

    let fixesApplied = 0;

    wf.nodes.forEach(node => {
        // Fix SQL Queries in Postgres Nodes
        if (node.type === 'n8n-nodes-base.postgres' && node.parameters && node.parameters.query) {
            let query = node.parameters.query;
            // Si empieza con =, n8n lo evalúa como JS puro y falla en sintaxis SQL.
            // Para strings mixtos con expresiones {{}}, se debe quitar el = inicial.
            if (query.startsWith('=')) {
                console.log(`[MCP AUTOFIX] Expresión corrupta encontrada en el nodo '${node.name}'.`);
                node.parameters.query = query.substring(1); // Quitar el '='
                fixesApplied++;
            }
        }
    });

    if (fixesApplied > 0) {
        console.log(`Aplicando ${fixesApplied} parche(s) al workflow...`);
        const payload = {
            name: wf.name,
            nodes: wf.nodes,
            connections: wf.connections,
            settings: wf.settings,
            staticData: wf.staticData,
            meta: wf.meta
        };
        const res = await request(`/workflows/${wfId}`, 'PUT', payload);
        if (res.id) {
            console.log('✅ Workflow parcheado y resuelto exitosamente.');
        } else {
            console.error('❌ Error al guardar parche:', res);
        }
    } else {
        console.log('Ningún error de sintaxis detectado.');
    }
}

// v13 ID: oixKorUBMFdGQsSS
autofix('oixKorUBMFdGQsSS');
