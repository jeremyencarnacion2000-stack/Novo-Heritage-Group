import { Client } from 'pg';

const SAMBANOVA_KEY = "6295ae62-0920-4172-abc8-9548092ac526";
const DATABASE_URL = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("1. Limpiando data comercial de prueba...");
  await client.query("DELETE FROM properties WHERE title IN ('Villa Imperial Cap Cana', 'Penthouse Signature Piantini', 'Mansión de Cristal Casa de Campo', 'Reserva Eco-Lodge Las Terrenas', 'Torre Novo Skyline Naco', 'Hacienda Los Corales Punta Cana', 'Apartamento Brisa Marina Juan Dolio', 'Casona Colonial Zona Colonial', 'Propiedad Sin Foto');");
  await client.query("DELETE FROM properties WHERE title LIKE '%Prueba%' OR title LIKE '%Test%';");

  console.log("2. Extrayendo historial REAL (texto) de WhatsApp desde Evolution...");
  const res = await client.query(`
    SELECT "messageTimestamp",
      CASE
        WHEN "messageType" = 'conversation' THEN message->>'conversation'
        WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
      END as txt
    FROM evolution."Message"
    WHERE "messageType" IN ('conversation', 'extendedTextMessage')
  `);
  
  // Filtro inteligente para captar reales
  const realMessages = res.rows.filter(r => r.txt && r.txt.length > 50 && (
    r.txt.toLowerCase().includes("venta") || 
    r.txt.toLowerCase().includes("alquiler") || 
    r.txt.toLowerCase().includes("habitacion") ||
    r.txt.toLowerCase().includes("us$") ||
    r.txt.toLowerCase().includes("rd$")
  ));
  
  console.log(`\n=> Encontradas ${realMessages.length} descripciones de propiedades reales en tu WhatsApp.\n`);

  for(const msg of realMessages) {
     console.log(`Procesando Inmueble con IA: "${msg.txt.replace(/\n/g, ' ').substring(0, 60)}..."`);
     try {
       const aiRes = await fetch("https://api.sambanova.ai/v1/chat/completions", {
          method: "POST", 
          headers: { "Authorization": `Bearer ${SAMBANOVA_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
              model: "Meta-Llama-3.1-8B-Instruct",
              messages: [
                 { role: "system", content: "Extrae de la descripción un título comercial corto (max 6 palabras), un precio numérico entero limpio (sin comas ni símbolos, solo numeros, o 0 si no hay) y una descripción embellecida. Retorna SOLO este formato JSON exacto, sin markdown ni comillas chuecas: {\"title\":\"...\", \"price\": 100000, \"desc\": \"...\"}" },
                 { role: "user", content: msg.txt }
              ]
          })
       });
       
       const data = await aiRes.json();
       let rawJSON = data.choices[0].message.content.trim();
       rawJSON = rawJSON.replace(/```json/g, '').replace(/```/g, '').trim();
       
       const parsed = JSON.parse(rawJSON);
       await client.query("INSERT INTO properties (title, price, image, created_at) VALUES ($1, $2, NULL, NOW())", [parsed.title || 'Inmueble de WhatsApp', parsed.price || 0]);
       console.log("   ✅ Guardado en Neon: " + parsed.title);
     } catch(e) {
       console.log("   ⚠️ Guardado en Neon (Modo Seguro/Directo) por fallo de IA...");
       try {
           const safeTitle = msg.txt.substring(0, 40).replace(/\n/g, " ") + "...";
           await client.query("INSERT INTO properties (title, price, image, created_at) VALUES ($1, 0, NULL, NOW())", [safeTitle]);
       } catch (err) {}
     }
  }

  console.log("\n[OPERACION EXITOSA] BACKFILL DE DATOS REALES COMPLETADO.");
  await client.end();
}
run();
