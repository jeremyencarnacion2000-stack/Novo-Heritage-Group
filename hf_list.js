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
    console.log('🔍 Listando todas las instancias...');
    const result = await request('GET', '/instance/fetchInstances');
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
