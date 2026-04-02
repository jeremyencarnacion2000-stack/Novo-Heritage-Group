const https = require('https');

const TOKEN = 'rnd_7Kzi745bJhXwQVXeVisSTwmCzRco';
const HOST = 'api.render.com';

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            path: '/v1' + path,
            method: method,
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body || '{}'));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function downgradeFix() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        // 1. Actualizamos la imagen a la v1.8.2 (Estable y sin Prisma)
        console.log('Cambiando imagen a v1.8.2...');
        await request('PATCH', `/services/${sid}`, {
            imagePath: 'docker.io/atendai/evolution-api:v1.8.2'
        });

        // 2. Limpiamos variables conflictivas de v2 y ponemos las de v1
        const vars = [
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'DATABASE_ENABLED', value: 'false' },
            { key: 'SERVER_URL', value: 'https://evolution-wa.onrender.com' }
        ];

        console.log('Aplicando variables de v1...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Forzando despliegue de V1 ESTABLE...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('OPERACIÓN DOWNGRADE EXITOSA.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

downgradeFix();
