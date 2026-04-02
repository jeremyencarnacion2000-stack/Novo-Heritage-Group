const https = require('https');

const API_KEY = 'godmode_secret_123';
const INSTANCE_NAME = 'wa_inventory';
const BASE_URL = 'suskj501-evolution-wa.hf.space';
const N8N_WEBHOOK = 'https://n8n-l2mj.onrender.com/webhook/whatsapp-evolution-ingest';

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const body = data ? JSON.stringify(data) : '';
        const options = {
            hostname: BASE_URL,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => resData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(resData));
                } catch (e) {
                    resolve(resData);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(body);
        req.end();
    });
}

async function main() {
    console.log('🚶 Cerrando sesión (Logout)...');
    try { await request('DELETE', `/instance/logout/${INSTANCE_NAME}`); } catch (e) { }

    console.log('🗑️ Borrando instancia...');
    try { await request('DELETE', `/instance/delete/${INSTANCE_NAME}`); } catch (e) { }

    console.log('🚀 Recreando instancia...');
    const createRes = await request('POST', '/instance/create', {
        instanceName: INSTANCE_NAME,
        token: 'token_secret_456',
        qrcode: true
    });
    console.log('✅ Creada:', JSON.stringify(createRes, null, 2));

    if (createRes.status === 403) {
        console.log('❌ El nombre sigue en uso. Reintentando con wa_inventory_v2...');
        const altCreate = await request('POST', '/instance/create', {
            instanceName: INSTANCE_NAME + '_v2',
            token: 'token_secret_456',
            qrcode: true
        });
        console.log('✅ Alternativa Creada:', JSON.stringify(altCreate, null, 2));
    }

    console.log('🏁 Proceso finalizado.');
}

main().catch(console.error);
