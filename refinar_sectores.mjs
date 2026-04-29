import { Client } from 'pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("1. Extrayendo propiedades con el tag repetitivo...");
  const res = await client.query(`SELECT id, description FROM properties WHERE sector = 'Sector Exclusivo'`);
  
  let fixes = 0;
  for(const row of res.rows) {
     const desc = row.description;
     let newSector = null;
     
     // 1. Detección Inteligente de Pines de Localización (📍 Ciudad Juan Bosch)
     const pinMatch = desc.match(/📍\s*([^📍\-–\n,]+)/i);
     if(pinMatch && pinMatch[1].trim().length > 3) {
        newSector = pinMatch[1].trim();
     } else {
        // 2. Extracción de Zonas Populares de Rep. Dominicana dentro del texto
        const drZonas = [
            "La Romana", "Bávaro", "Punta Cana", "Los Cacicazgos", "Evaristo Morales", 
            "Arroyo Hondo", "Gazcue", "Zona Universitaria", "Las Terrenas", "Bella Vista", 
            "La Esperilla", "Ciudad Juan Bosch", "Los Corales", "White Sands", "Cana Rock", 
            "Las Américas", "Santo Domingo Norte", "La Castellana", "Los Prados"
        ];
        
        for (const zona of drZonas) {
            if (desc.toLowerCase().includes(zona.toLowerCase())) {
                newSector = zona;
                break;
            }
        }
     }

     if(newSector) {
         // Limpiar caracteres indeseados al final
         newSector = newSector.replace(/[*_~\[\]]/g, '').trim();
         await client.query("UPDATE properties SET sector = $1 WHERE id = $2", [newSector, row.id]);
         console.log(`[CORREGIDO] ID termina en ...${row.id.slice(-4)} => ${newSector}`);
         fixes++;
     } else {
         // Fallback natural
         await client.query("UPDATE properties SET sector = 'Santo Domingo' WHERE id = $1", [row.id]);
     }
  }

  console.log(`\n¡BISTURÍ FINALIZADO! Se ha pulido el sector de ${res.rows.length} propiedades (Mejorados: ${fixes}).`);
  await client.end();
}
run();
