import postgres from 'postgres';
const sql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full');

function fixTitle(title, type, transaction_type, sector) {
  let low = String(title).toLowerCase().trim();
  let badWords = ["acabadito de salir del horno", "vendo apartamento nuevo en", "lista de propiedades para", "🔥", "🚨", "oportunidad", "vendo en", "vendo", "alquilo", "se vende", "se alquila", "en venta"];
  
  for(let bad of badWords) {
     low = low.replace(bad, "").trim();
  }
  
  if(low.length < 5 || low.startsWith("hola") || low.startsWith("saludos") || low.startsWith("apartamento en alquiler")) {
      return `Exclusivo ${type} en ${transaction_type} en ${sector}`;
  }
  
  // Capitalize properly
  low = low.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ ,.-]/g, '');
  return low.charAt(0).toUpperCase() + low.slice(1);
}

function fixPrice(desc, title, currentPrice) {
   let fullText = (desc + " " + title).toUpperCase();
   
   // Check explicitly if it says RD$ or DOP or "pesos"
   let isPesos = fullText.includes("RD$") || fullText.includes("DOP") || fullText.includes(" PESOS") || fullText.includes("RD $");
   let isDolar = fullText.includes("US$") || fullText.includes("USD") || fullText.includes("US $") || fullText.includes("DOLARES");
   
   let price = currentPrice;
   
   if(isPesos && !isDolar) {
       price = Math.round(price / 60.5);
   } else if (!isPesos && !isDolar) {
       // Heuristic: If price is insanely high > 10,000,000 and it's an apartment it's likely Pesos.
       if(price > 5000000) {
           price = Math.round(price / 60.5);
       }
   }
   
   // Rental fallback logic
   if (fullText.includes("ALQUILER") || fullText.includes("RENTA")) {
      if (price > 100000) {
         // Maybe it extracted the full purchase price or it failed parsing.
         // Let's cap rentals to realistic numbers if it's crazy high (like 150000 as rental is wrong)
         // But we leave it as is if it's hard to tell
      }
   }

   return price;
}

async function run() {
  console.log("Analyzing local heuristics for top 300 properties...");
  const properties = await sql`SELECT id, title, description, price, type, transaction_type, sector FROM properties ORDER BY created_at DESC LIMIT 300`;
  
  let fixedCount = 0;
  for(let p of properties) {
      let newTitle = fixTitle(p.title, p.type, p.transaction_type, p.sector);
      let newPrice = fixPrice(p.description, p.title, p.price);
      
      if (newTitle.length > 50) newTitle = newTitle.substring(0, 50);
      
      // Force "Exclusivo Apartamento..." if title was utterly destroyed
      if(newTitle.length < 5) newTitle = `Exclusivo ${p.type} en ${p.sector}`;

      if(p.title !== newTitle || p.price !== newPrice) {
          await sql`UPDATE properties SET title = ${newTitle}, price = ${newPrice} WHERE id = ${p.id}`;
          console.log(`[${newPrice} USD] ${newTitle}`);
          fixedCount++;
      }
  }
  
  console.log(`Fixed ${fixedCount} properties perfectly.`);
  process.exit();
}
run();
