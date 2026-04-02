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

async function fixRender() {
    try {
        console.log('--- Listando servicios ---');
        const services = await request('GET', '/services?limit=20');

        const evoContainer = services.find(s => s.service.name.toLowerCase().includes('evolution'));
        if (!evoContainer) {
            console.error('No se encontró el servicio de Evolution.');
            return;
        }

        const sid = evoContainer.service.id;
        console.log(`Reparando: ${evoContainer.service.name} (${sid})`);

        // En V1 de Render API, para actualizar variables de entorno se usa PATCH en /services/{id}
        // o PUT en /services/{id}/env-vars. Probaremos PUT en /env-vars.
        const vars = [
            { key: 'DATABASE_ENABLED', value: 'false' },
            { key: 'CACHE_ENABLED', value: 'false' },
            { key: 'STORE_MESSAGES', value: 'false' },
            { key: 'AUTHENTICATION_TYPE', value: 'apikey' },
            { key: 'AUTHENTICATION_API_KEY', value: 'godmode_secret_123' },
            { key: 'PORT', value: '8080' }
        ];

        console.log('Aplicando variables de entorno...');
        await request('PUT', `/services/${sid}/env-vars`, vars);

        console.log('SISTEMA REPARADO. Render debería relanzar el servicio ahora.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fixRender();
