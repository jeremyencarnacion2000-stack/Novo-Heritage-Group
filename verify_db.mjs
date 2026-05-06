import postgres from 'postgres';

// Attempting to use the environment variable directly
const url = process.env.COCKROACH_DATABASE_URL;

if (!url) {
  console.error("❌ COCKROACH_DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = postgres(url, { ssl: 'require' });

async function verify() {
  try {
    const results = await sql`
      SELECT id, titulo_profesional, precio, area_m2, multimedia 
      FROM public.inventario_digital 
      WHERE titulo_profesional LIKE '%Jardines del Mar%'
      ORDER BY id DESC 
      LIMIT 1;
    `;
    
    if (results.length > 0) {
      console.log("✅ SUCCESS: Property 'Jardines del Mar' found!");
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      console.log("⏳ Property not found yet. The workflow might still be processing.");
    }
  } catch (error) {
    console.error("❌ Error querying DB:", error);
  } finally {
    await sql.end();
  }
}

verify();
