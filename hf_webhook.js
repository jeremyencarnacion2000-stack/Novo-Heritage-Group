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
    console.log('🔗 Configurando Webhook en Evolution API...');

    const webhookRes = await request('POST', `/webhook/set/${INSTANCE_NAME}`, {
        enabled: true,
        url: N8N_WEBHOOK,
        webhook_by_events: false,
        events: [
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "SEND_MESSAGE"
        ]
    });

    console.log('✅ Resultado Webhook:', JSON.stringify(webhookRes, null, 2));
}

main().catch(console.error);
