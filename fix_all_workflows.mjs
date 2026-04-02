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

async function fixEverything() {
    console.log('--- INICIANDO REPARACIÓN TOTAL ---');

    // 1. Obtener credenciales válidas
    console.log('1. Buscando credenciales...');
    const credsResponse = await request('/credentials?limit=100');
    if (!credsResponse.data) {
        console.error('No se pudieron obtener credenciales', credsResponse);
        return;
    }

    let pgId = "ym3KfQZLjCvWmUjS"; // Default detected earlier
    let groqId = "Bz3xfXM6claHNoqr";

    credsResponse.data.forEach(c => {
        if (c.name === "Postgres account") pgId = c.id;
        if (c.name === "Groq account") groqId = c.id;
    });

    console.log(`Usando IDs - Postgres: ${pgId}, Groq: ${groqId}`);

    // 2. Revisar todos los workflows
    const workflowsResponse = await request('/workflows?limit=100');
    if (!workflowsResponse.data) {
        console.error('No se pudieron obtener workflows', workflowsResponse);
        return;
    }

    const workflows = workflowsResponse.data;
    console.log(`2. Encontrados ${workflows.length} workflows.`);

    for (const wfInfo of workflows) {
        const wfId = wfInfo.id;
        const wfName = wfInfo.name;
        console.log(`\nRevisando: ${wfName} [${wfId}]`);

        try {
            const wf = await request(`/workflows/${wfId}`);
            let modified = false;

            // Arreglar credenciales en los nodos
            if (wf.nodes) {
                wf.nodes.forEach(node => {
                    if (node.type === 'n8n-nodes-base.postgres') {
                        node.credentials = { postgres: { id: pgId } };
                        modified = true;
                    }
                    if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters && node.parameters.authentication === 'genericCredentialType') {
                        node.credentials = { httpHeaderAuth: { id: groqId } };
                        modified = true;
                    }
                });
            }

            // Validar conexiones visuales rotas (frecuente en fallos de UI)
            // A veces un nodo cambió de nombre pero las conexiones mantienen el viejo
            if (wf.connections && wf.nodes) {
                const nodeNames = new Set(wf.nodes.map(n => n.name));
                for (const source in wf.connections) {
                    if (!nodeNames.has(source)) {
                        console.log(`  - Conexión huérfana fuente: ${source}`);
                    }
                    const outputs = wf.connections[source];
                    for (const outType in outputs) {
                        for (const targetList of outputs[outType]) {
                            for (const target of targetList) {
                                if (!nodeNames.has(target.node)) {
                                    console.log(`  - Conexión huérfana destino: ${target.node} desde ${source}`);
                                    // Considerar limpiar aquí, pero es riesgoso sin contexto.
                                }
                            }
                        }
                    }
                }
            }

            if (modified) {
                console.log(`  - Guardando correciones en credenciales...`);
                const payload = {
                    name: wf.name,
                    nodes: wf.nodes,
                    connections: wf.connections,
                    settings: wf.settings,
                    staticData: wf.staticData,
                    meta: wf.meta
                };
                await request(`/workflows/${wfId}`, 'PUT', payload);
            }

            // Activar
            if (!wfInfo.active) {
                console.log(`  - Activando workflow...`);
                const actRes = await request(`/workflows/${wfId}/activate`, 'POST');
                if (actRes.success !== false) {
                    console.log(`  - ✅ ACTIVADO`);
                } else {
                    console.error(`  - ❌ Falló al activar:`, actRes);
                }
            } else {
                console.log(`  - ✅ Ya estaba ACTIVO`);
            }
        } catch (e) {
            console.error(`Error procesando ${wfName}:`, e.message);
        }
    }
}

fixEverything();
