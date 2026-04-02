import https from 'https';
import fs from 'fs';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMDU2M2VjOTMtOTVhYy00YmY0LThhNTYtZWEyZmFlMDYzY2IxIiwiaWF0IjoxNzc0MjIxNTk1fQ.9TKpX6vgpY8p4lpTxs6xv-OHvi6Y4kavWs71BcRHBiI';
const N8N_HOST = 'n8n-l2mj.onrender.com';

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : '';
        const options = {
            hostname: N8N_HOST,
            path: '/api/v1' + path,
            method,
            timeout: 15000, // 15 seconds timeout
            headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
        };
        if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out after 15 seconds'));
        });

        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function forceDeployV15() {
    console.log('--- INYECTANDO V15 AUTOMÁTICAMENTE ---');
    try {
        const payload = JSON.parse(fs.readFileSync('d:\\Users\\User\\Downloads\\deploy-68ec5eaaa66cd5d7084e5733\\FINAL_V15_BACKFILL.json', 'utf8'));

        // 1. Delete previous buggy versions
        console.log('Borrando versiones defectuosas...');
        await request('/workflows/oixKorUBMFdGQsSS', 'DELETE').catch(() => { }); // V13
        await request('/workflows/U1vvMdYeDHvFUTvi', 'DELETE').catch(() => { }); // V12
        // If V14 was created and we didn't get the ID because of timeout:
        const allWfs = await request('/workflows?limit=100');
        if (allWfs.data) {
            for (const wf of allWfs.data) {
                if (wf.name.includes('[AUTOFIX] Godmode Backfill V14') || wf.name.includes('V15')) {
                    await request(`/workflows/${wf.id}`, 'DELETE');
                }
            }
        }

        // 2. Create V15
        console.log('Subiendo V15...');
        const result = await request('/workflows', 'POST', payload);
        if (!result.id) {
            console.error('Error al subir:', result);
            return;
        }
        console.log(`✅ V15 subido con ID: ${result.id}`);

        // 3. Activate
        console.log('Activando V15...');
        await request(`/workflows/${result.id}/activate`, 'POST');
        console.log('✅ V15 ACTIVADO.');

    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

forceDeployV15();
