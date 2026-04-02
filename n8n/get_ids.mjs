import https from 'https';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMWQ5NTQ1Ny00ZmM3LTRmYjYtYjFhOC05ZDE3NjQzMjI2MjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjlhNTFhOWY5LWZiMDctNDYwYS1iNTZiLWQyMGU3OTYwMTQ4NiIsImlhdCI6MTc3Mzk3MzQyNH0.nafQ_hIGPxithQGBiisruGUymsC7DKpyLqiISGnyIq0';
const N8N_API_BASE = 'https://novoauto.app.n8n.cloud/api/v1';

function apiRequest(path) {
    return new Promise((resolve, reject) => {
        const url = `${N8N_API_BASE}${path}`;
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            }
        };
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error(`Invalid JSON from ${path}: ${body.substring(0, 100)}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    try {
        console.log('--- BUSCANDO CREDENCIALES ---');
        const creds = await apiRequest('/credentials');
        if (creds.data) {
            creds.data.forEach(c => {
                console.log(`[${c.type}] ID: ${c.id} - Name: ${c.name}`);
            });
        } else {
            console.log('No se encontraron credenciales o error:', creds);
        }

        console.log('\n--- BUSCANDO WORKFLOWS ---');
        const workflows = await apiRequest('/workflows');
        if (workflows.data) {
            workflows.data.forEach(w => {
                console.log(`Workflow: ${w.name} - ID: ${w.id}`);
            });
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
