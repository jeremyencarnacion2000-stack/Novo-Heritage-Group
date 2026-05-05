import postgres from 'postgres';
const sql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full');

async function clean() {
  console.log("Beginning surgical strike on NeonDB spam records...");

  // 1. Delete all "Busco" / Spam properties
  const resDel = await sql`
    DELETE FROM properties 
    WHERE 
      title ILIKE '%busco%' OR 
      description ILIKE '%busco%' OR
      title ILIKE '%buscando%' OR
      title ILIKE '%saludos%' OR
      title ILIKE '%alquilo%' OR
      title ILIKE '%hola%'
    RETURNING id, title;
  `;
  console.log(`DELETED ${resDel.length} spam/lead records:`, resDel.map(r => r.title));

  // 2. Eradicate Emojis via Regex UPDATE across ALL remaining titles and descriptions
  // POSIX Regex `[^a-zA-Z0-9$., %&()\\-áéíóúÁÉÍÓÚñÑüÜ:]` roughly targets emojis
  const resUpd = await sql`
    UPDATE properties 
    SET 
      title = REGEXP_REPLACE(title, '[^a-zA-Z0-9$., %&()\\-áéíóúÁÉÍÓÚñÑüÜ:]', '', 'g'),
      description = REGEXP_REPLACE(description, '[^a-zA-Z0-9$., \n\r%&()\\-áéíóúÁÉÍÓÚñÑüÜ:]', '', 'g')
    WHERE 
      title ~ '[^a-zA-Z0-9$., %&()\\-áéíóúÁÉÍÓÚñÑüÜ:]' OR
      description ~ '[^a-zA-Z0-9$., \n\r%&()\\-áéíóúÁÉÍÓÚñÑüÜ:]'
    RETURNING id, title;
  `;
  console.log(`STRIPPED EMOJIS from ${resUpd.length} records.`);

  // 3. Fix price formatting for weird 0s or super low ones
  const resPrice = await sql`
    UPDATE properties 
    SET price = 100000
    WHERE price <= 0 OR price IS NULL;
  `;
  
  console.log("Cleanup complete!");
  process.exit(0);
}
clean();
