const https = require('https');

const TOKEN = 'rnd_7Kzi745bJhXwQVXeVisSTwmCzRco';
const HOST = 'api.render.com';
const NEON_URI = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&schema=evolution';

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

async function neonFix() {
    try {
        const sid = 'srv-d6uv22fgi27c73em8rf0';

        const vars = [
            { key: 'AUTHENTICATION_TYPE', value: 'apikey' },
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'DATABASE_ENABLED', value: 'true' },
            { key: 'DATABASE_PROVIDER', value: 'postgresql' },
            { key: 'DATABASE_CONNECTION_URI', value: NEON_URI },
            { key: 'SERVER_URL', value: 'https://wasa-el6v.onrender.com' },
            { key: 'PORT', value: '3333' }
        ];

        console.log('Vinculando con Neon...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Forzando despliegue final con Persistencia...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('ESTABILIZACIÓN NEON-RENDER INICIADA.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

neonFix();
