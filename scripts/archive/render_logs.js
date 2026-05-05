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

async function getLogs() {
    try {
        const sid = 'srv-d6unbsnkijhs73ccgm7g';
        // Render API for logs is a bit complex (usually via websocket or stream)
        // But we can check the 'status' and 'deploy' details.
        const deploy = await request('GET', `/services/${sid}/deploys?limit=1`);
        console.log('--- Resumen del último Deploy ---');
        console.log(JSON.stringify(deploy, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

getLogs();
