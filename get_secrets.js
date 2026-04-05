const { Client } = require('pg');
const fs = require('fs');

async function getSecrets() {
    console.log('--- DB SECRETS ---');
    const client = new Client({
        connectionString: 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    });
    
    try {
        await client.connect();
        const res = await client.query('SELECT name, token FROM evolution."Instance" LIMIT 1');
        if (res.rows[0]) {
            console.log('EVOLUTION_INSTANCE=' + res.rows[0].name);
            console.log('EVOLUTION_TOKEN=' + res.rows[0].token);
        }
    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await client.end();
    }

    console.log('--- ENV SECRETS ---');
    if (fs.existsSync('.env')) {
        const env = fs.readFileSync('.env', 'utf8');
        const lines = env.split('\n');
        for (const line of lines) {
            if (line.includes('SUPABASE_SERVICE_ROLE_KEY=')) console.log(line.trim());
            if (line.includes('NEXT_PUBLIC_SUPABASE_URL=')) console.log(line.trim());
        }
    }
}

getSecrets();

