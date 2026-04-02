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
            timeout: 10000,
            headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
        };
        if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function dump() {
    console.log('--- DUMPING ENV ---');
    const payload = {
        name: "Env Dumper",
        nodes: [
            {
                "parameters": {
                    "jsCode": "return [{json: process.env}];"
                },
                "name": "Code",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [250, 300]
            }
        ],
        connections: {},
        settings: {}
    };

    console.log('Creating dumper...');
    const wf = await request('/workflows', 'POST', payload);
    if (!wf || !wf.id) { console.error('Failed to create:', wf); return; }

    console.log(`Running dumper ${wf.id}...`);
    // Workflows must be active to be run directly via webhook, or run manually via Editor API.
    // The public API /workflows/:id/run works even if inactive sometimes, let's try.
    const runRes = await request(`/workflows/${wf.id}/run`, 'POST');
    console.log('Run res:', JSON.stringify(runRes));

    // We can also just read the executions. Wait, /run returns the execution ID and maybe the data.
    if (runRes && runRes.data && runRes.data.resultData && runRes.data.resultData.runData) {
        const runData = runRes.data.resultData.runData;
        if (runData.Code && runData.Code[0] && runData.Code[0].data && runData.Code[0].data.main) {
            const env = runData.Code[0].data.main[0][0].json;
            console.log('--- CRITICAL ENV VARIABLES ---');
            console.log('DB_TYPE:', env.DB_TYPE);
            console.log('DB_POSTGRESDB_DATABASE:', env.DB_POSTGRESDB_DATABASE);
            console.log('DB_POSTGRESDB_HOST:', env.DB_POSTGRESDB_HOST);
            console.log('DB_POSTGRESDB_PASSWORD:', env.DB_POSTGRESDB_PASSWORD);
            console.log('DB_POSTGRESDB_USER:', env.DB_POSTGRESDB_USER);
            console.log('N8N_ENCRYPTION_KEY:', env.N8N_ENCRYPTION_KEY);
        }
    }

    console.log('Deleting dumper...');
    await request(`/workflows/${wf.id}`, 'DELETE');
    console.log('Done.');
}
dump();
