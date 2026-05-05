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

async function serverUrlFix() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        const vars = [
            { key: 'DATABASE_ENABLED', value: 'false' },
            { key: 'DATABASE_PROVIDER', value: 'postgresql' },
            { key: 'DATABASE_CONNECTION_URI', value: 'postgres://dummy:dummy@localhost:5432/dummy' },
            { key: 'CACHE_ENABLED', value: 'false' },
            { key: 'REDIS_ENABLED', value: 'false' },
            { key: 'S3_ENABLED', value: 'false' },
            { key: 'STORE_MESSAGES', value: 'false' },
            { key: 'AUTHENTICATION_TYPE', value: 'apikey' },
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'PORT', value: '3333' },
            { key: 'SERVER_URL', value: 'https://evolution-wa.onrender.com' }
        ];

        console.log('Inyectando SERVER_URL...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Disparando despliegue final...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('SISTEMA EN REANIMACIÓN FINAL.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

serverUrlFix();
