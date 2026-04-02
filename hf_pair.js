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
    console.log('🚀 Iniciando creación de instancia...');

    // 1. Crear instancia
    const createRes = await request('POST', '/instance/create', {
        instanceName: INSTANCE_NAME,
        token: 'token_secret_456',
        qrcode: true
    });
    console.log('✅ Resultado Creación:', JSON.stringify(createRes, null, 2));

    // 2. Obtener QR
    console.log('🔍 Obteniendo QR...');
    const connectRes = await request('GET', `/instance/connect/${INSTANCE_NAME}`);

    if (connectRes && connectRes.code) {
        console.log('--- QR CODE READY ---');
        console.log('BASE64:', connectRes.base64 ? 'RECIBIDO ✅' : 'NO RECIBIDO ❌');
        console.log('CODE:', connectRes.code);
        console.log('---------------------');
    } else {
        console.log('❌ Error al obtener el QR:', connectRes);
    }
}

main().catch(console.error);
