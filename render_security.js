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

async function updateSecurity() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';

        // Obtenemos el servicio actual para no sobrescribir todo
        const service = await request('GET', `/services/${sid}`);

        const currentAllowList = service.serviceDetails.ipAllowList || [];

        const newIPs = [
            { cidrBlock: '74.220.48.0/24', description: 'User Provided Range 1' },
            { cidrBlock: '74.220.56.0/24', description: 'User Provided Range 2' }
        ];

        // Añadimos las nuevas IPs sin quitar 0.0.0.0/0 (por ahora para no bloquear el acceso al usuario)
        // Pero el usuario pidió conectarse, así que es probable que estas IPs sean SU conexión.
        const updatedList = [...currentAllowList, ...newIPs];

        console.log('Actualizando IP Allow List en Render...');
        await request('PATCH', `/services/${sid}`, {
            serviceDetails: {
                ipAllowList: updatedList
            }
        });

        console.log('SEGURIDAD ACTUALIZADA.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

updateSecurity();
