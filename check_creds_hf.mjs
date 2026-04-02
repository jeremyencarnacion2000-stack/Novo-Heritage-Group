import https from 'https';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYTRjMjZjZTEtMzlmYi00NTFjLThhODUtNzhmNDc1ZDE4MWZkIiwiaWF0IjoxNzc0MjQzMDE0fQ.WWU2lMRhEbJbNhT1Irmc3Bg_OwSrYSlkMxcZ9M2Hjfo';
const HF_HOST = 'suskj501-n8n.hf.space';

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : '';
        const options = {
            hostname: HF_HOST,
            path: '/api/v1' + path,
            method,
            timeout: 10000,
            headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
        };
        if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve(data); } });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function check() {
    console.log('--- HF CREDS EXAMINER ---');
    const creds = await request('/credentials?limit=100');
    console.log('Creds Data:', JSON.stringify(creds.data, null, 2));
}

check();
