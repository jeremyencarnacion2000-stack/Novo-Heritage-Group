const https = require('https');
const fs = require('fs');
const path = require('path');

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
                            if (parsed.error) { reject(new Error(parsed.error.message)); req.destroy(); return; }
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

const files = [
    { name: 'Behavioral Tracking & AI Profiling', path: 'n8n/tracking_profiling.json' },
    { name: 'WhatsApp Intelligence Ingestion', path: 'n8n/whatsapp_ingestion.json' },
    { name: 'AI Reactivation Email', path: 'n8n/reactivation_email.json' },
    { name: 'Chatbot User Profile API', path: 'n8n/chatbot_profile_api.json' }
];

async function deploy() {
    for (const file of files) {
        console.log(`🚀 Desplegando ${file.name}...`);
        try {
            const workflowJson = fs.readFileSync(path.join(process.cwd(), file.path), 'utf8');
            // We use the create_workflow_from_code tool.
            // In n8n MCP, 'code' often refers to the serialized workflow object or the SDK representation.
            // Let's try sending the JSON as code first.
            const result = await callMcp('tools/call', {
                name: 'create_workflow_from_code',
                arguments: {
                    name: file.name,
                    code: workflowJson, // Attempting to pass raw JSON string
                    description: `Automación de Godmode para ${file.name}`
                }
            });
            console.log(`✅ ${file.name} desplegado con ID: ${result.content[0].text}`);
        } catch (e) {
            console.error(`❌ Error en ${file.name}:`, e.message);
        }
    }
}

deploy();
