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

async function healthFix() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        // 1. Forzamos Puerto y Health Check en la definición del servicio
        console.log('Configurando Health Check...');
        await request('PATCH', `/services/${sid}`, {
            serviceDetails: {
                healthCheckPath: '/'
            }
        });

        // 2. Seteamos las variables mínimas para v1
        const vars = [
            { key: 'PORT', value: '8080' },
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'DATABASE_ENABLED', value: 'false' }
        ];

        console.log('Aplicando variables...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Forzando despliegue de SALUD...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('OPERACIÓN SALUD INICIADA.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

healthFix();
