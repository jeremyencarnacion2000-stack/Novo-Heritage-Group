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

async function oomFix() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        // 1. Inyectamos límites de memoria de Node.js
        const vars = [
            { key: 'PORT', value: '8080' },
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'DATABASE_ENABLED', value: 'false' },
            { key: 'WEB_CONCURRENCY', value: '0' },
            { key: 'NODE_OPTIONS', value: '--max-old-space-size=400' } // Límite agresivo para Render Free
        ];

        console.log('Aplicando optimizaciones de memoria (OOM Fix)...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Forzando despliegue de SUPERVIVENCIA...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('OPERACIÓN OOM INICIADA.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

oomFix();
