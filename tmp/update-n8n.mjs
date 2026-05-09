const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiImNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
// Wait, I should use the one I confirmed: f67f6042...
const validKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

async function updateWorkflow(workflowId) {
    console.log(`Updating workflow ${workflowId}...`);
    const res = await fetch(`https://suskj501-n8n.hf.space/api/v1/workflows/${workflowId}`, {
        headers: { 'X-N8N-API-KEY': validKey }
    });
    const data = await res.json();
    
    // Find the node to replace
    const oldNode = data.nodes.find(n => n.name === 'Guardar en Cockroach' || n.name === 'Save_Railway');
    if (!oldNode) {
        console.error('Target node not found in', workflowId);
        return;
    }

    const ingestNode = {
        id: 'ingest-api-node-' + Date.now(),
        name: 'Enviar a Ingest API',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: oldNode.position,
        parameters: {
            method: 'POST',
            url: 'https://novo-heritage.vercel.app/api/properties/ingest',
            sendHeaders: true,
            headerParameters: {
                parameters: [
                    { name: 'Authorization', value: 'Bearer ' + validKey }
                ]
            },
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={{ JSON.stringify($json) }}',
            options: {}
        }
    };

    // Replace the node
    data.nodes = data.nodes.filter(n => n.id !== oldNode.id);
    data.nodes.push(ingestNode);

    // Update connections
    for (const sourceNode in data.connections) {
        data.connections[sourceNode].main.forEach(connBranch => {
            connBranch.forEach(conn => {
                if (conn.node === oldNode.name) {
                    conn.node = ingestNode.name;
                }
            });
        });
    }

    // Prepare payload
    const payload = {
        name: data.name,
        nodes: data.nodes,
        connections: data.connections,
        settings: {}
    };

    const updateRes = await fetch(`https://suskj501-n8n.hf.space/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 
            'X-N8N-API-KEY': validKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    const result = await updateRes.json();
    console.log(`Result for ${workflowId}:`, result.id ? 'SUCCESS' : result);
}

const workflows = ['tNfL2APn3vXKgTea', '2an73cTYGEPQuW4Y'];
workflows.forEach(updateWorkflow);
