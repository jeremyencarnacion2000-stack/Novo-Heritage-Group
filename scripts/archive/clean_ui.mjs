import { Client } from 'pg';
const DATABASE_URL = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("Limpiando Emojis... y arreglando la clasificacion");
  const res = await client.query("SELECT id, title, description FROM properties");
  let arreglados = 0;
  for (const row of res.rows) {
      // Remover todo el espectro de emojis (Incluyendo banderas, circulos y símbolos)
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{2B50}\u{200D}\u{FE0F}🚀✨📍📣🤓🔻🏷️🚨🏡🏠💥💥✅🔥]/gu;
      let cleanTitle = row.title.replace(emojiRegex, '').replace(/\*/g, '').replace(/_/g, '').replace(/\s+/g, ' ').trim();
      let cleanDesc = row.description.replace(emojiRegex, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();

      let type = 'Apartamento';
      const tLow = (cleanTitle + ' ' + cleanDesc).toLowerCase();
      if (tLow.includes("villa") || tLow.includes("proyecto")) type = "Villa";
      if (tLow.includes("local comercial") || tLow.includes("nave") || tLow.includes("oficina")) type = "Comercial";
      if (tLow.includes("torre") || tLow.includes("apartamento") || tLow.includes("piso") || tLow.includes("apto") || tLow.includes("penthouse")) type = "Apartamento";
      if (tLow.match(/\bcasa\b/)) type = "Casa";
      if (tLow.includes("solar") || tLow.includes("terreno") || tLow.includes("lote")) type = "Solar";
      if (tLow.includes("penthouse")) type = "Penthouse";

      await client.query("UPDATE properties SET title = $1, description = $2, type = $3 WHERE id = $4", [cleanTitle, cleanDesc, type, row.id]);
      arreglados++;
  }
  
  console.log(`[EXITO] Emojis removidos y clasificaciones de propiedades reparadas en ${arreglados} registros.`);
  await client.end();
}
run();
