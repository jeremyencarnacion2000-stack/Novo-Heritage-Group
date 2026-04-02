const https = require('https');

const API_KEY = 'godmode_secret_123';
const INSTANCE_NAME = 'wa_inventory';
const BASE_URL = 'suskj501-evolution-wa.hf.space';

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
    console.log('🔍 Revisando estado de la instancia...');
    const state = await request('GET', `/instance/connectionState/${INSTANCE_NAME}`);
    console.log('📈 Estado de Conexión:', JSON.stringify(state, null, 2));

    console.log('⚙️ Revisando Webhooks...');
    const webhooks = await request('GET', `/webhook/find/${INSTANCE_NAME}`);
    console.log('🔗 Webhooks Configurados:', JSON.stringify(webhooks, null, 2));
}

main().catch(console.error);
