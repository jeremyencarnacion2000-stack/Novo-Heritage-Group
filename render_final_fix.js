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

async function finalFix() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        const vars = [
            { key: 'DATABASE_ENABLED', value: 'false' },
            { key: 'CACHE_ENABLED', value: 'false' },
            { key: 'STORE_MESSAGES', value: 'false' },
            { key: 'AUTHENTICATION_TYPE', value: 'apikey' },
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'PORT', value: '3333' }, // Forzamos el puerto por defecto de Evolution
            { key: 'DATABASE_PROVIDER', value: 'postgresql' } // Lo ponemos aunque esté DISABLED por si el check de validación es estricto
        ];

        console.log('Aplicando variables de entorno finales...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Re-lanzando despliegue...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('PARCHE APLICADO. Monitoreando...');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

finalFix();
