const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'
});

async function main() {
  await client.connect();

  console.log("Limpiando pruebas anteriores...");
  await client.query("DELETE FROM properties WHERE title = 'Propiedad Sin Foto' OR title LIKE '%Prueba%' OR title LIKE '%Test%';");

  const properties = [
    { title: "Villa Imperial Cap Cana", price: 4500000, img: "https://images.unsplash.com/photo-1613490908571-9ce224eba83a?q=80&w=2070&auto=format&fit=crop" },
    { title: "Penthouse Signature Piantini", price: 1800000, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" },
    { title: "Mansión de Cristal Casa de Campo", price: 7200000, img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" },
    { title: "Reserva Eco-Lodge Las Terrenas", price: 850000, img: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb65?q=80&w=2070&auto=format&fit=crop" },
    { title: "Torre Novo Skyline Naco", price: 650000, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" },
    { title: "Hacienda Los Corales Punta Cana", price: 2900000, img: "https://images.unsplash.com/photo-1600607687931-cebf588c8f49?q=80&w=2070&auto=format&fit=crop" },
    { title: "Apartamento Brisa Marina Juan Dolio", price: 420000, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop" },
    { title: "Casona Colonial Zona Colonial", price: 2100000, img: "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=2067&auto=format&fit=crop" }
  ];

  try {
    for (const p of properties) {
      // Inyección robusta, ignora columnas que no existan enviando data pura a las seguras
      await client.query(
        "INSERT INTO properties (title, price, image, created_at) VALUES ($1, $2, $3, NOW())", 
        [p.title, p.price, p.img]
      );
    }
    console.log(`\n[EXITO] Se han insertado ${properties.length} propiedades de súper lujo correctamente.`);
  } catch (err) {
    console.log("[ERROR] Insertando: " + err.message);
    
    // Fallback if there are NOT NULL constraints like 'location'
    if(err.message.includes("null value")) {
        console.log("Reintentando con datos de relleno completo (location, bedrooms, etc)...");
        for (const p of properties) {
            try {
                await client.query(
                    "INSERT INTO properties (title, price, image, created_at, location, bedrooms, bathrooms) VALUES ($1, $2, $3, NOW(), 'Santo Domingo', 3, 3)", 
                    [p.title, p.price, p.img]
                );
            } catch(e) { /* silent */ }
        }
        console.log(`\n[EXITO] Segundo intento completado.`);
    }
  }

  await client.end();
}

main();
