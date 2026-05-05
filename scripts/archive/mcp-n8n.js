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
                const text = chunk.toString();
                buffer += text;

                // Process lines in buffer for SSE
                const lines = buffer.split('\n');
                let foundResult = false;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith('data:')) {
                        const dataStr = line.substring(5).trim();
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.result) {
                                resolve(parsed.result);
                                foundResult = true;
                                req.destroy();
                                break;
                            }
                        } catch (e) {
                            // JSON might be split, keep in buffer
                        }
                    } else if (line.startsWith('{')) { // Try direct JSON if it falls back
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.result) { resolve(parsed.result); foundResult = true; req.destroy(); break; }
                            if (parsed.error) { reject(new Error(parsed.error.message)); foundResult = true; req.destroy(); break; }
                        } catch (e) { }
                    }
                }

                if (!foundResult) {
                    // Keep last partial line
                    buffer = lines[lines.length - 1];
                }
            });

            res.on('end', () => {
                if (!res.destroyed) {
                    // One last try on direct buffer
                    try {
                        const parsed = JSON.parse(buffer);
                        if (parsed.result) resolve(parsed.result);
                        else if (parsed.error) reject(new Error(parsed.error.message));
                    } catch (e) {
                        reject(new Error('No result found in response. Buffer: ' + buffer.substring(0, 100)));
                    }
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

const command = process.argv[2];

if (command === 'list') {
    callMcp('tools/list').then(result => {
        console.log(JSON.stringify(result.tools, null, 2));
    }).catch(e => console.error(e.message));
} else if (command === 'call') {
    const toolName = process.argv[3];
    const args = JSON.parse(process.argv[4] || '{}');
    callMcp('tools/call', { name: toolName, arguments: args }).then(result => {
        console.log(JSON.stringify(result, null, 2));
    }).catch(e => console.error(e.message));
} else {
    console.log('Usage: node mcp-n8n.js [list|call] [toolName] [jsonArgs]');
}
