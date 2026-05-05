import postgres from 'postgres';

const railwaySql = postgres('postgresql://postgres:KiaBMQFhSCqJxunXUibJrlByNBHciqeP@switchyard.proxy.rlwy.net:21763/railway', { ssl: 'require' });

const properties = [
  {
    title: "Penthouse de Lujo en Piantini",
    description: "Espectacular penthouse con vistas panorámicas al skyline de Santo Domingo. Acabados en mármol y cocina italiana.",
    type: "apartamento",
    transaction_type: "venta",
    price: 850000.00,
    bedrooms: 3,
    bathrooms: 4,
    area: 450,
    location: "Piantini, Santo Domingo",
    city: "Santo Domingo",
    sector: "Piantini",
    image: "/premium-luxury-villa-real-estate-hero.png",
    status: "available",
    is_published: true,
    agent_name: "Novo Heritage Group",
    features: ["Piscina Privada", "Seguridad 24/7", "Gimnasio", "Terraza"]
  },
  {
    title: "Villa Contemporánea en Cap Cana",
    description: "Vivienda moderna a minutos de la playa Juanillo. Diseño de concepto abierto con techos de doble altura.",
    type: "villa",
    transaction_type: "venta",
    price: 1250000.00,
    bedrooms: 5,
    bathrooms: 6,
    area: 600,
    location: "Cap Cana, Punta Cana",
    city: "Punta Cana",
    sector: "Cap Cana",
    image: "/luxury-modern-villa-renaissance.png",
    status: "available",
    is_published: true,
    agent_name: "Novo Heritage Elite",
    features: ["Vista al Mar", "Golf Course", "Club de Playa", "Jardín Zen"]
  },
  {
    title: "Apartamento Moderno en Naco",
    description: "Perfecto para inversión o estancia familiar. Torre moderna con lobby de lujo y área social completa.",
    type: "apartamento",
    transaction_type: "venta",
    price: 245000.00,
    bedrooms: 2,
    bathrooms: 2,
    area: 125,
    location: "Naco, Santo Domingo",
    city: "Santo Domingo",
    sector: "Naco",
    image: "/premium-luxury-villa-real-estate-hero.png",
    status: "available",
    is_published: true,
    agent_name: "Novo Heritage Sales",
    features: ["Lobby Climatizado", "Área de Juegos", "Planta Eléctrica Full"]
  }
];

async function seed() {
  console.log("🧹 Limpiando tabla de propiedades en Railway...");
  try {
    // Primero intentamos borrar todo de forma segura
    await railwaySql`DELETE FROM properties`;
    
    console.log("🌱 Insertando propiedades premium...");
    for (const p of properties) {
      await railwaySql`
        INSERT INTO properties (
          title, description, type, transaction_type, price, 
          bedrooms, bathrooms, area, location, city, sector, 
          image, status, is_published, agent_name, features
        ) VALUES (
          ${p.title}, ${p.description}, ${p.type}, ${p.transaction_type}, ${p.price},
          ${p.bedrooms}, ${p.bathrooms}, ${p.area}, ${p.location}, ${p.city}, ${p.sector},
          ${p.image}, ${p.status}, ${p.is_published}, ${p.agent_name}, ${p.features}
        )
      `;
    }
    console.log("✅ ¡Base de datos de Railway poblada con éxito!");
  } catch (err) {
    console.error("❌ Error durante el seeding:", err);
  } finally {
    await railwaySql.end();
  }
}

seed();
