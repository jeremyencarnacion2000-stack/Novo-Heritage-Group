import fs from 'fs';

async function run() {
    const configPath = 'C:/Users/Administrator/.gemini/antigravity/mcp_config.json';
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const n8nConfig = configData.mcpServers["n8n-mcp"].env;
    const apiUrl = n8nConfig.N8N_API_URL + '/api/v1/workflows/G2sWuEiELj5TIxOZ';
    const apiKey = n8nConfig.N8N_API_KEY;

    // Fetch
    let res = await fetch(apiUrl, { headers: { 'X-N8N-API-KEY': apiKey } });
    let workflow = await res.json();

    // Patch
    workflow.nodes.forEach(n => {
        if (n.name === 'Calc_Offset') {
            n.parameters.values.number[0].value = '={{($node["Split"].context.currentRunIndex || 0) * 50}}';
        }
        if (n.name === 'Fetch_50') {
            n.parameters.query = '=SELECT * FROM evolution."Message" ORDER BY "messageTimestamp" DESC LIMIT 50 OFFSET {{$json.offset}};';
        }
        if (n.name === 'Save_Project') {
            n.parameters.query = '=INSERT INTO public.inventario_digital (nombre_proyecto, zona, comision, tipo_activo, url_activo, stock_disponible) VALUES (\\'{ { JSON.parse($node["Groq_Logic"].json.choices[0].message.content).proyecto.replace(/\\'/g, "''") } } \\', \\'{ { (JSON.parse($node["Groq_Logic"].json.choices[0].message.content).zona || "N/A").replace(/\\'/g, "''") } } \\', \\'{ { (JSON.parse($node["Groq_Logic"].json.choices[0].message.content).comision || "N/A").replace(/\\'/g, "''") } } \\', \\'WhatsApp / Backfill\\', \\'{ { $node["Split"].json["id"] } } \\', true) ON CONFLICT (url_activo) DO UPDATE SET stock_disponible = EXCLUDED.stock_disponible;';
        }
    });

    // Update
    let push = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
    });

    if (push.ok) {
        console.log("SUCCESS!");
    } else {
        const err = await push.text();
        console.error("FAILED:", err);
    }
}
run();
