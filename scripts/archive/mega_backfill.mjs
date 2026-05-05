import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("\n🧹 1. BORRANDO TODA LA TABLA PARA UN REINICIO ELITE...");
  await client.query("DELETE FROM properties");

  console.log("\n📦 2. LEYENDO HISTORIAL COMPLETO (FILTRADO POR CALIDAD)...");
  const res = await client.query(`
    SELECT "messageTimestamp", "key", "messageType",
      CASE
        WHEN "messageType" = 'conversation' THEN message->>'conversation'
        WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
        WHEN "messageType" = 'documentMessage' THEN message->'documentMessage'->>'caption'
        ELSE NULL
      END as txt,
      message->'imageMessage' as img_data,
      message->'documentMessage' as doc_data
    FROM evolution."Message"
    WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage', 'documentMessage')
    ORDER BY "messageTimestamp" DESC
  `);
  
  const allMsgs = res.rows;
  const imageMsgs = allMsgs.filter(m => m.messageType === 'imageMessage');
  const documentMsgs = allMsgs.filter(m => m.messageType === 'documentMessage');
  const textMsgs = allMsgs.filter(m => !['imageMessage', 'documentMessage'].includes(m.messageType) || (m.messageType === 'documentMessage' && m.txt));

  console.log(`\n📸 Imágenes en BD: ${imageMsgs.length}`);
  console.log(`📄 Documentos en BD: ${documentMsgs.length}`);
  console.log(`📝 Mensajes de texto: ${textMsgs.length}`);

  const realDeals = textMsgs.filter(r => {
      if (!r.txt) return false;
      const t = r.txt.toLowerCase();
      if (t.length < 50) return false; 
      
      const isSearch = t.includes("busco") || t.includes("búsqueda") || t.includes("buscamos") || 
                       t.includes("cliente busca") || t.includes("alguien tiene") || 
                       t.includes("solicito") || t.includes("requerimiento") ||
                       t.includes("tienes alguna") || t.includes("saludos, tienes");
      if (isSearch) return false;

      return t.includes("venta") || t.includes("alquiler") || t.includes("en renta") || 
             t.includes("us$") || t.includes("rd$") || t.includes("precio") || 
             t.includes("$") || t.includes("vendo") || t.includes("apto") || t.includes("villa") || t.includes("casa");
  });

  console.log(`\n🔎 Ofertas Reales Detectadas: ${realDeals.length}\n`);

  let insertados = 0;

  for(const msg of realDeals) {
       let rawText = msg.txt;
       let text = rawText.replace(/\n/g, ' ');
       
       // --- PRICE LOGIC (USD Base) ---
       let price = 0;
       const pMatch = text.match(/(?:US\$|RD\$|USD|US|u\$s|\$)\s*([\d,.]+)/i) || 
                      text.match(/([\d,.]+)\s*(?:dolares|pesos|usd|k|mil)/i);
       
       if (pMatch) {
            let pStr = pMatch[1].replace(/[,.]/g, '');
            price = parseInt(pStr);
            const explicitUSD = text.toLowerCase().includes("us$") || text.toLowerCase().includes("usd") || text.toLowerCase().includes("u$s") || text.toLowerCase().includes("dolar") || text.toLowerCase().includes("dólar");
            const explicitRD = text.toLowerCase().includes("rd$") || text.toLowerCase().includes("pesos") || text.toLowerCase().includes(" rd");

            if (explicitUSD) {
                if (price < 2000 && !text.toLowerCase().includes("alquiler")) price *= 1000;
            } else if (explicitRD) {
                price = Math.round(price / 60);
            } else {
                if (price >= 1500000) price = Math.round(price / 60);
                else if (price < 2000 && !text.toLowerCase().includes("alquiler")) price *= 1000;
            }
       }
       
       if (price === 0) {
          const mMatch = text.match(/([\d,.]+)\s*millones/i);
          if (mMatch) {
              let mVal = parseFloat(mMatch[1].replace(/[,.]/g, ''));
              let tempPrice = mVal * 1000000;
              if (text.toLowerCase().includes("us$") || text.toLowerCase().includes("usd") || text.toLowerCase().includes("u$s")) price = tempPrice;
              else price = Math.round(tempPrice / 60);
          }
       }

       let transaction_type = 'Venta';
       if(text.toLowerCase().includes("alquiler") || text.toLowerCase().includes("renta")) transaction_type = "Alquiler";

       const minSalePrice = 30000;
       const minRentPrice = 400;

       if ((transaction_type === 'Venta' && price < minSalePrice) || (transaction_type === 'Alquiler' && price < minRentPrice)) continue;
       if (price > 50000000 || price < 10) continue; 

       // --- MULTI-IMAGE & DOCUMENT CORRELATION ---
       const ts = parseInt(msg.messageTimestamp);
       const remoteJid = msg.key.remoteJid;
       const window = 1200; // 20 min

       // Collect ALL images in the window
       const relatedImages = imageMsgs.filter(m => {
          const mTs = parseInt(m.messageTimestamp);
          return m.key.remoteJid === remoteJid && Math.abs(mTs - ts) < window;
       });

       const finalImages = relatedImages.map(m => m.img_data?.url || m.img_data?.directPath).filter(Boolean);
       
       // Detect Brochure (PDF)
       const relatedDoc = documentMsgs.find(m => {
          const mTs = parseInt(m.messageTimestamp);
          const isPdf = m.doc_data?.mimetype === 'application/pdf' || m.doc_data?.fileName?.toLowerCase().endsWith('.pdf');
          return m.key.remoteJid === remoteJid && Math.abs(mTs - ts) < window && isPdf;
       });
       const brochureUrl = relatedDoc ? (relatedDoc.doc_data?.url || relatedDoc.doc_data?.directPath) : null;

       // Fallback
       if (finalImages.length === 0) {
          finalImages.push('https://images.unsplash.com/photo-1600607687931-cebf588c8f49?q=80&w=2070&auto=format&fit=crop');
       }

       // --- TITLES & ATTRIBUTES ---
       const bMatch = text.match(/(\d+)\s*(?:hab|habitacion|dormitorio|h)/i);
       const bedrooms = bMatch ? parseInt(bMatch[1]) : 3;
       const bathMatch = text.match(/(\d+)\s*(?:baño|bano|b)/i);
       const bathrooms = bathMatch ? parseInt(bathMatch[1]) : 2;
       
       let type = 'Apartamento';
       if(text.toLowerCase().includes("villa")) type = "Villa";
       if(text.toLowerCase().includes("casa")) type = "Casa";

       let title = (msg.txt.split('\n')[0].replace(/[*_~\[\]]/g, "").trim() || `${type} en ${transaction_type}`).substring(0, 75);
       if (title.toLowerCase().includes("buenos") || title.length < 10) title = `${type} Premium en ${transaction_type}`;

       let sector = 'Ubicación Premium';
       const drZonas = ["Piantini", "Naco", "Serralles", "Bella Vista", "Evaristo Morales", "Arroyo Hondo", "Los Cacicazgos", "Mirador Sur", "Anacaona", "Gazcue", "La Esperilla", "Punta Cana", "Bávaro", "Las Terrenas", "La Romana", "Santiago", "Jarabacoa"];
       for (const zona of drZonas) {
           if (text.toLowerCase().includes(zona.toLowerCase())) { sector = zona; break; }
       }
       
       let finalCity = "Santo Domingo";
       if (sector.toLowerCase().includes("punta cana") || sector.toLowerCase().includes("bávaro")) finalCity = "La Altagracia";

       try {
           // We'll store finalImages as a JSON string in the description or a new field if possible.
           // For now, let's keep the primary image and append multi-image links to description.
           let enrichedDesc = msg.txt;
           if (finalImages.length > 1) {
               enrichedDesc += "\n\n📸 Galería de Imágenes:\n" + finalImages.join('\n');
           }
           if (brochureUrl) {
               enrichedDesc += `\n\n📄 Brochure Digital (PDF):\n${brochureUrl}`;
           }

           await client.query(`
            INSERT INTO properties (
              id, title, price, transaction_type, type, location, city, sector, 
              bedrooms, bathrooms, area, description, features, image, is_published, created_at
            ) VALUES (gen_random_uuid(), $1, $2, $3, $4, 'República Dominicana', $5, $6, $7, $8, 150, $9, $10, $11, true, NOW())`, 
            [title, price, transaction_type, type, finalCity, sector, bedrooms, bathrooms, enrichedDesc, ['Premium', 'Exclusivo'], finalImages[0]]);
           insertados++;
           if (finalImages.length > 1) console.log(`📸 [GALERÍA] ${finalImages.length} fotos para: ${title}`);
           if (relatedDoc) console.log(`📄 [DOCUMENTO] Brochure vinculado a: ${title}`);
       } catch (err) { }
  }
  console.log(`\n🎉 [LIMPIEZA ELITE] ${insertados} fichas técnicas completadas.`);
  await client.end();
}
run().catch(console.error);
