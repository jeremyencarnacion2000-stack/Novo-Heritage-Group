import postgres from 'postgres';

const connectionString = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(connectionString);

async function seed() {
    try {
        console.log('🚀 Poblando base de datos con datos de Novo Heritage...');

        // 1. Seed Properties (Bienes Raíces)
        await sql`
      INSERT INTO properties (title, location, price, type, bedrooms, bathrooms, status, description)
      VALUES 
        ('Penthouse de Lujo Piantini', 'Piantini, Santo Domingo', 450000, 'penthouse', 3, 4, 'available', 'Espectacular penthouse con vista al mar'),
        ('Villa Vista al Campo de Golf', 'Punta Cana', 750000, 'villa', 4, 5, 'available', 'Villa de ensueño frente al campo de golf')
      ON CONFLICT DO NOTHING;
    `;

        // 2. Seed Hotels (Turismo)
        await sql`
      INSERT INTO hotels (name, location, rating, price, type, stars)
      VALUES 
        ('Novo Resort & Spa', 'Bávaro, Punta Cana', 4.8, 250, 'Resort', 5),
        ('Heritage Boutique Hotel', 'Santo Domingo', 4.5, 180, 'Boutique', 4)
      ON CONFLICT DO NOTHING;
    `;

        // 3. Seed User Brain (Initial AI state)
        await sql`
        INSERT INTO perfil_usuario (usuario_id, tipo_usuario, score_interes)
        VALUES ('test_user@novo.com', 'vip_prospect', '{"inmuebles": 10, "seguros": 5, "turismo": 8}')
        ON CONFLICT DO NOTHING;
    `;

        console.log('✅ Datos iniciales cargados con éxito.');

    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
    } finally {
        await sql.end();
    }
}

seed();
