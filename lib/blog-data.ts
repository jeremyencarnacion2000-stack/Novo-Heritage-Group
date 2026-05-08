export interface BlogPost {
    slug: string
    title: string
    summary: string
    content: string
    imageUrl: string
    category: "Seguros" | "Inmuebles" | "Turismo" | "Lifestyle"
    author: string
    authorImageUrl: string
    date: string
    readingTime: string
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "guia-completa-seguros-de-vida",
        title: "Guía Completa de Seguros de Vida: Protegiendo a tu Familia",
        summary: "Entender los seguros de vida puede ser complicado. Te guiamos a través de los diferentes tipos, beneficios y cómo elegir el plan perfecto para tus seres queridos.",
        content: `
            <p>Entender los seguros de vida puede ser complicado. Te guiamos a través de los diferentes tipos, beneficios y cómo elegir el plan perfecto para tus seres queridos.</p>
            <h3 class="text-2xl font-serif mt-8 mb-4">Tipos de Seguros de Vida</h3>
            <p>Existen principalmente dos categorías: seguro de vida a término y seguro de vida permanente. El primero cubre un período específico, mientras que el segundo dura toda la vida.</p>
            <h3 class="text-2xl font-serif mt-8 mb-4">¿Cuánto Cuesta?</h3>
            <p>El costo varía según tu edad, salud y el monto de la cobertura. Es más asequible de lo que la mayoría de la gente piensa.</p>
        `,
        imageUrl: "/placeholder.jpg",
        category: "Seguros",
        author: "Ana García",
        authorImageUrl: "/placeholder-user.jpg",
        date: "12 de Oct, 2025",
        readingTime: "5 min"
    },
    {
        slug: "inversion-inteligente-bienes-raices",
        title: "Inversión Inteligente: 5 Consejos para Comprar tu Primera Propiedad",
        summary: "El mercado inmobiliario ofrece grandes oportunidades. Aprende los pasos clave para realizar una inversión segura y rentable en tu primera casa o apartamento.",
        content: `
            <p>El mercado inmobiliario ofrece grandes oportunidades. Aprende los pasos clave para realizar una inversión segura y rentable en tu primera casa o apartamento.</p>
            <h3 class="text-2xl font-serif mt-8 mb-4">1. Define tu Presupuesto</h3>
            <p>Antes de buscar, sabe cuánto puedes pagar. Considera la cuota inicial, los costos de cierre y los gastos mensuales.</p>
        `,
        imageUrl: "/luxury-modern-real-estate-property.jpg",
        category: "Inmuebles",
        author: "Carlos Martínez",
        authorImageUrl: "/placeholder-user.jpg",
        date: "10 de Oct, 2025",
        readingTime: "7 min"
    },
    {
        slug: "destinos-turisticos-para-desconectar",
        title: "Top 3 Destinos en el Caribe para Desconectar y Recargar Energías",
        summary: "¿Necesitas un descanso? Descubre playas paradisíacas, resorts de lujo y actividades inolvidables en los destinos más espectaculares del Caribe.",
        content: `
            <p>¿Necesitas un descanso? Descubre playas paradisíacas, resorts de lujo y actividades inolvidables en los destinos más espectaculares del Caribe.</p>
            <h3 class="text-2xl font-serif mt-8 mb-4">1. Punta Cana, República Dominicana</h3>
            <p>Playas de arena blanca, aguas cristalinas y una amplia oferta de resorts todo incluido. Ideal para relajarse y disfrutar del sol.</p>
        `,
        imageUrl: "/luxury-travel-destination-beach-resort.jpg",
        category: "Turismo",
        author: "Sofía Rodríguez",
        authorImageUrl: "/placeholder-user.jpg",
        date: "08 de Oct, 2025",
        readingTime: "4 min"
    }
]
