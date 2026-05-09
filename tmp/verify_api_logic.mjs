import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Manual env parse
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
    }
});

const url = env.COCKROACH_DATABASE_URL || env.DATABASE_URL;
const sql = postgres(url, { ssl: 'require' });

async function check() {
    console.log("Checking properties data...");
    const data = await sql`
      SELECT *
      FROM public.inventario_digital
      WHERE (nombre_proyecto IS NOT NULL AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', ''))
         OR (titulo_profesional IS NOT NULL AND titulo_profesional NOT IN ('', 'Proyecto Novo'))
      ORDER BY id DESC
      LIMIT 5
    `;

    console.log(`Found ${data.length} properties matching API criteria.`);
    if (data.length > 0) {
        data.forEach(p => console.log(` - ID: ${p.id} | Titulo: ${p.titulo_profesional} | Fuente: ${p.fuente}`));
    } else {
        console.log("⚠️ NO PROPERTIES MATCHED CRITERIA!");
    }
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
