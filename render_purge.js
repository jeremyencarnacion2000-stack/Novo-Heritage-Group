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

async function purgeFix() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        // 1. Vaciamos las variables (Render requiere al menos una a veces, pondremos una inofensiva)
        const vars = [
            { key: 'PORT', value: '8080' }
        ];

        console.log('Purgando variables...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('Forzando despliegue VAINILLA...');
        await request('POST', `/services/${sid}/deploys`);

        console.log('PURGA COMPLETADA.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

purgeFix();
