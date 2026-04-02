const https = require('https');

const TOKEN = 'rnd_7Kzi745bJhXwQVXeVisSTwmCzRco';
const HOST = 'api.render.com';

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            path: '/v1' + path,
            method: method,
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json'
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
        req.end();
    });
}

async function checkStatus() {
    try {
        const sid = 'srv-d6uv22fgi27c73em8rf0';
        const service = await request('GET', `/services/${sid}`);

        // El objeto de Render tiene la estructura { id, name, type, ... }
        // Para servicios web, el status está en el root.
        console.log(`Estado de ${service.name}: ${service.suspended === 'not_suspended' ? 'ACTIVO' : 'SUSPENDIDO'}`);

        const deploys = await request('GET', `/services/${sid}/deploys?limit=1`);
        if (deploys && deploys.length > 0) {
            console.log(`Último despliegue (${deploys[0].deploy.id}): ${deploys[0].deploy.status}`);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkStatus();
