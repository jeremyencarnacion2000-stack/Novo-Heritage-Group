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

async function extractWebhooks() {
    console.log('--- EXTRAYENDO URLS DE WEBHOOKS ---');
    const wfParams = await request('/workflows/6DP1LWKVP4DaMo73'); // whatsapp_ingest

    if (wfParams.nodes) {
        wfParams.nodes.forEach(n => {
            if (n.type === 'n8n-nodes-base.webhook') {
                const path = n.parameters.path;
                console.log(`\nWebhook de whatsapp_ingest configurado en path: "${path}"`);
                console.log(`URL de Producción: https://n8n-l2mj.onrender.com/webhook/${path}`);
                console.log(`URL de Test:       https://n8n-l2mj.onrender.com/webhook-test/${path}`);
            }
        });
    }

    // Verificar ejecuciones recientes
    const execs = await request('/executions?workflowId=6DP1LWKVP4DaMo73&limit=3');
    console.log(`\nÚltimas ejecuciones de Ingestor:`);
    if (execs.data && execs.data.length > 0) {
        execs.data.forEach(ex => console.log(`- ${ex.id} (${ex.status}) a las ${ex.startedAt}`));
    } else {
        console.log('NINGUNA (El bot de WhatsApp NO está enviando datos a este endpoint).');
    }

    // Checking if V13 backfill is running:
    const execs13 = await request('/executions?workflowId=oixKorUBMFdGQsSS&limit=5');
    console.log(`\nÚltimas ejecuciones de Backfill V13:`);
    if (execs13.data && execs13.data.length > 0) {
        execs13.data.forEach(ex => console.log(`- ${ex.id} (${ex.status})`));
    } else {
        console.log('Ninguna de V13.');
    }
}

extractWebhooks();
