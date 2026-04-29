import postgres from 'postgres';

const sql = postgres('postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');
const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY || "6295ae62-0920-4172-abc8-9548092ac526";

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callSambaNova(textBase) {
  const prompt = `
  Eres el Directos de Marketing y Copywriter Principal de Novo Heritage Group. 
  Tu misión es transformar datos crudos de WhatsApp en anuncios inmobiliarios de CLASE MUNDIAL.
  
  REGLAS ESTRICTAS:
  1. TÍTULO: Debe ser magnético, elegante y vendedor. (Ej: "Majestuoso Penthouse en el Corazón de Piantini" o "Villa Paraíso: Lujo y Exclusividad en Cap Cana").
  2. MONEDA Y PRECIO: Analiza el texto. Si detectas RD$ o montos en millones (>2M) sin moneda, DIVIDE entre 60 para obtener USD. 
     - Si el resultado es menor a 30,000 para venta, algo está mal. Re-analiza.
  3. DESCRIPCIÓN PREMIUM: Escribe 2-3 párrafos seductores. Habla de acabados, vistas, amenidades y el estatus que otorga la propiedad. NO USES EMOJIS DE WHATSAPP.
  4. SEO: Genera una meta_description optimizada para Google.
  
  Devuelve estricto JSON:
  {
    "comercial_title": "Título Impactante",
    "final_price_usd": 250000,
    "premium_description": "Cuerpo del anuncio elegante y profesional...",
    "meta_description": "Frase SEO para buscadores..."
  }
  
  DATOS CRUDOS:
  ${textBase}
  `;

  for(let i=0; i<3; i++) {
    try {
      const res = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-70B-Instruct", // Downgraded to 70B for STABILITY
          messages: [
            {"role": "system", "content": "You are a luxury real estate expert. You ONLY output perfect, valid JSON based on the user schema. Do not include markdown formatting or extra text outside the JSON object."},
            {"role": "user", "content": prompt}
          ],
          temperature: 0.1,
          top_p: 0.1
        })
      });
      
      const textResponse = await res.text();
      
      try {
        const data = JSON.parse(textResponse);
        if(!data.choices) {
           console.error("SambaNova API Error:", data.error || data);
           await delay(5000); // Wait more on error
           continue;
        }
        
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if(jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("Non-JSON Response from SambaNova (likely rate limit HTML):", textResponse.substring(0, 100));
        await delay(10000); // Aggressive wait on HTML error
      }
      
    } catch(e) {
      console.error("SambaNova Logic failed:", e.message);
      await delay(5000);
    }
  }
  return null;
}

async function run() {
  console.log("🚀 INICIANDO REFECTORIZACIÓN DE IA (SAMBANOVA 70B - ESTABLE)...");
  
  const properties = await sql`
    SELECT id, title, description, price 
    FROM properties 
    WHERE title NOT LIKE '%|%' AND title NOT LIKE '%Exclusiv%'
    ORDER BY created_at DESC 
    LIMIT 200
  `;
  
  console.log(`📊 Procesando ${properties.length} propiedades...`);
  
  let fixed = 0;
  for(let p of properties) {
    const textBase = `TEXTO ORIGINAL: ${p.description}\nTITULO ACTUAL: ${p.title}\nPRECIO DETECTADO: ${p.price}`;
    
    process.stdout.write(`💎 Refinando ID ${p.id.substring(0,8)}... `);
    
    const result = await callSambaNova(textBase);
    
    if(result && result.comercial_title && result.final_price_usd) {
       const newPrice = Math.round(result.final_price_usd);
       
       await sql`
         UPDATE properties 
         SET 
           title = ${result.comercial_title}, 
           price = ${newPrice},
           description = ${result.premium_description},
           meta_description = ${result.meta_description}
         WHERE id = ${p.id}
       `;
       console.log(`✅ [${newPrice} USD] ${result.comercial_title}`);
       fixed++;
    } else {
       console.log(`❌ Falló la IA.`);
    }
    
    await delay(10000); // 10s wait between calls to safely stay under rate limits
  }
  
  console.log(`\n✨ EXITOSO: ${fixed} propiedades refinadas con estilo Élite.`);
  process.exit(0);
}

run();
