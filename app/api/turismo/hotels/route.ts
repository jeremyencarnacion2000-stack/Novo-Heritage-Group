import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination')
    const minPrice = Number(searchParams.get('minPrice') || '0')
    const maxPrice = Number(searchParams.get('maxPrice') || '1000000')
    const rating = Number(searchParams.get('rating') || '0')
    const stars = searchParams.get('stars') ? searchParams.get('stars')!.split(',').filter(s => s !== '').map(Number) : []
    const type = searchParams.get('type') ? searchParams.get('type')!.split(',').filter(s => s !== '') : []
    const amenities = searchParams.get('amenities') ? searchParams.get('amenities')!.split(',').filter(s => s !== '') : []

    try {
        // Fetch from Neon
        const dbHotels = await sql`
            SELECT * FROM hotels
            WHERE price >= ${minPrice} AND price <= ${maxPrice}
            AND rating >= ${rating}
            ORDER BY rating DESC
        `;

        if (!dbHotels || !Array.isArray(dbHotels)) {
            console.warn('Neon returned non-array:', dbHotels);
            return NextResponse.json(fallbackHotels);
        }

        // Apply additional filtering that's harder in SQL for mock/simple data
        const filteredHotels = dbHotels.filter(hotel => {
            if (!hotel) return false;
            
            // Robust check for location
            const location = hotel.location || "";
            if (destination && !location.toLowerCase().includes(destination.toLowerCase())) return false;
            
            // Robust check for stars
            const hotelStars = Number(hotel.stars || 0);
            if (stars.length > 0 && !stars.includes(hotelStars)) return false;
            
            // Robust check for type
            const hotelType = hotel.type || "";
            if (type.length > 0 && !type.includes(hotelType)) return false;
            
            // Robust check for amenities
            const hotelAmenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
            if (amenities.length > 0 && !amenities.every(a => hotelAmenities.includes(a))) return false;
            
            return true;
        })

        if (filteredHotels.length === 0 && !destination && minPrice === 0) {
            // Fallback to mock data if DB is empty for initial demo
            return NextResponse.json(fallbackHotels)
        }

        return NextResponse.json(filteredHotels)
    } catch (error) {
        console.error('Neon hotels fetch failed:', error)
        return NextResponse.json(fallbackHotels)
    }
}

const fallbackHotels = [
    {
        id: "t1",
        name: "Punta Cana: Luxury Flight + Resort",
        location: "Punta Cana, RD",
        rating: 8.8,
        ratingText: "Excelente",
        reviews: 12450,
        price: 850,
        stars: 5,
        type: "Paquete",
        amenities: ["Vuelos", "Hotel", "Traslados", "Plan All-In", "WiFi", "Seguro"],
        discount: "Incluye boleto aéreo ida y vuelta",
        image: "/luxury-travel-destination-beach-resort.jpg",
        images: [
            "/luxury-travel-destination-beach-resort.jpg",
            "/luxury_modern_villa_renaissance.png",
            "/premium-luxury-villa-real-estate-hero.png"
        ],
        description: "Paquete completo con aéreos. Disfruta del Hard Rock Punta Cana con todo resuelto desde el despegue.",
        provider: "NovoTravel Flights",
    },
    {
        id: "t2",
        name: "Samaná: Naturaleza y Vuelo Privado",
        location: "Samaná, RD",
        rating: 9.2,
        ratingText: "Excepcional",
        reviews: 5149,
        price: 1250,
        stars: 5,
        type: "Paquete",
        amenities: ["Vuelo Privado", "Eco-Villa", "Excursiones", "WiFi", "Piscina", "Privada"],
        discount: "Experiencia VIP sin escalas",
        image: "/luxury_modern_villa_renaissance.png",
        images: [
            "/luxury_modern_villa_renaissance.png",
            "/premium-luxury-villa-real-estate-hero.png",
            "/luxury-travel-destination-beach-resort.jpg"
        ],
        description: "El paquete más exclusivo del Caribe. Incluye traslado en avioneta privada y estadía en villas de ensueño.",
        provider: "Novo Heritage Elite",
    },
    {
        id: "t3",
        name: "Santo Domingo: Cultura y Conexión",
        location: "Santo Domingo, RD",
        rating: 9.5,
        ratingText: "Soberbio",
        reviews: 2100,
        price: 450,
        stars: 5,
        type: "Boleto + Hotel",
        amenities: ["Vuelo", "City Tour", "WiFi", "Hotel Boutique", "Traslados"],
        discount: "Ideal para escapadas de fin de semana",
        image: "/premium-luxury-villa-real-estate-hero.png",
        images: [
            "/premium-luxury-villa-real-estate-hero.png",
            "/luxury-travel-destination-beach-resort.jpg",
            "/luxury_modern_villa_renaissance.png"
        ],
        description: "Vive la Zona Colonial con vuelos incluidos. Un viaje al pasado con la comodidad del presente.",
        provider: "Novo Connect",
    }
]
