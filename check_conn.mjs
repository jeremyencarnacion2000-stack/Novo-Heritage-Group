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

async function fixConnections(wfId) {
    console.log(`\nRevisando conexiones de ${wfId}...`);
    const wf = await request(`/workflows/${wfId}`);

    if (!wf.nodes || !wf.connections) {
        console.log('No tiene nodos o conexiones.');
        return;
    }

    const nodeNamesMap = new Map(); // id -> name or name -> name
    wf.nodes.forEach(n => {
        nodeNamesMap.set(n.id, n.name);
        nodeNamesMap.set(n.name, n.name); // Para búsqueda rápida
    });

    let connectionsValid = true;
    let newConnections = Object.assign({}, wf.connections);

    console.log(`Nodos presentes: ${Array.from(nodeNamesMap.values()).join(', ')}`);
    console.log(`Conexiones actuales:`, JSON.stringify(wf.connections, null, 2));

    let modified = false;

    // TODO: This is complex. For now, let's just see what's wrong.
}

async function run() {
    // 6DP1LWKVP4DaMo73 = whatsapp_ingest
    // U1vvMdYeDHvFUTvi = V12
    await fixConnections('6DP1LWKVP4DaMo73');
    await fixConnections('U1vvMdYeDHvFUTvi');
}

run();
