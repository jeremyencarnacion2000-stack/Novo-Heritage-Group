const https = require('https');

const API_KEY = 'godmode_secret_123';
const BASE_URL = 'suskj501-evolution-wa.hf.space';

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: 443,
            path: path,
            method: method,
            headers: {
                'apikey': API_KEY
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
        req.end();
    });
}

async function main() {
    console.log('🩺 Chequeando estado de la API...');
    try {
        const health = await request('GET', '/health');
        console.log('Health:', JSON.stringify(health, null, 2));
    } catch (e) { console.log('Health check failed'); }

    console.log('📦 Chequeando versiones e info...');
    try {
        const info = await request('GET', '/instance/fetchInstances');
        console.log('Instances:', JSON.stringify(info, null, 2));
    } catch (e) { console.log('Info fetch failed'); }
}

main().catch(console.error);
