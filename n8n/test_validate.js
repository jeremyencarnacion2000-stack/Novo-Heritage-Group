const https = require('https');

const N8N_MCP_URL = 'https://novoauto.app.n8n.cloud/mcp-server/http';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMWQ5NTQ1Ny00ZmM3LTRmYjYtYjFhOC05ZDE3NjQzMjI2MjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjlhNTFhOWY5LWZiMDctNDYwYS1iNTZiLWQyMGU3OTYwMTQ4NiIsImlhdCI6MTc3Mzk3MzQyNH0.nafQ_hIGPxithQGBiisruGUymsC7DKpyLqiISGnyIq0';

function callMcp(method, params = {}) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now().toString(),
            method: method,
            params: params
        });

        const url = new URL(N8N_MCP_URL);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let buffer = '';
            res.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('data:')) {
                        try {
                            const parsed = JSON.parse(line.substring(5).trim());
                            if (parsed.result) { resolve(parsed.result); req.destroy(); return; }
                        } catch (e) { }
                    }
                }
                buffer = lines[lines.length - 1];
            });
            res.on('end', () => { if (!res.destroyed) reject(new Error('No response')); });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

const code = "module.exports = { name: 'Test', nodes: [{ name: 'Start', type: 'n8n-nodes-base.start', position: [250, 300] }], connections: {} };";

callMcp('tools/call', {
    name: 'validate_workflow',
    arguments: { code: code }
}).then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(e => console.error(e.message));
