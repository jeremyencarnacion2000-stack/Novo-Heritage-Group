import { NextResponse } from "next/server"
import { Home, Building, Users, Shield, Star, Award, TrendingUp } from "lucide-react"

export async function GET() {
    // In a real CRM integration, this data would be fetched from Supabase or an external CRM API.
    // For now, we provide the dynamic structure ready to be connected.
    const content = {
        services: [
            {
                icon: "Home",
                title: "Adquisición de Lujo",
                description: "Encuentra la propiedad que define tu estilo de vida con nuestra asesoría personalizada.",
                color: "from-blue-500/20 to-blue-600/20",
            },
            {
                icon: "Building",
                title: "Gestión de Activos",
                description: "Maximizamos el valor de tus propiedades con estrategias de mercado de alto nivel.",
                color: "from-emerald-500/20 to-emerald-600/20",
            },
            {
                icon: "Users",
                title: "Consultoría VIP",
                description: "Acompañamiento exclusivo en cada paso, desde la búsqueda hasta el cierre legal.",
                color: "from-purple-500/20 to-purple-600/20",
            },
            {
                icon: "Shield",
                title: "Seguridad Jurídica",
                description: "Garantizamos transacciones transparentes y protegidas bajo los más altos estándares.",
                color: "from-amber-500/20 to-amber-600/20",
            },
        ],
        stats: [
            { icon: "Users", value: "500+", label: "Clientes satisfechos", color: "text-blue-400" },
            { icon: "TrendingUp", value: "15+", label: "Años de experiencia", color: "text-emerald-400" },
            { icon: "Star", value: "98%", label: "Tasa de satisfacción", color: "text-amber-400" },
            { icon: "Award", value: "4.9/5", label: "Calificación promedio", color: "text-purple-400" },
        ],
        whyChooseUs: [
            {
                icon: "Award",
                title: "Excelencia Comprobada",
                description: "Premiados como la mejor agencia inmobiliaria por 5 años consecutivos",
            },
            {
                icon: "Users",
                title: "Equipo Experto",
                description: "Profesionales certificados con más de 15 años de experiencia",
            },
            {
                icon: "Shield",
                title: "Transacciones Seguras",
                description: "Proceso legal transparente con todas las garantías necesarias",
            },
        ],
        collections: [
            { title: "Pushkino", image: "/modern_minimalist_house_pushkino.png", subtitle: "Minimalismo Natural", area: "584", floors: "2", bedrooms: "3" },
            { title: "Renaissance", image: "/luxury_modern_villa_renaissance.png", subtitle: "Lujo Infinito", area: "720", floors: "3", bedrooms: "5" },
            { title: "Barminka", image: "/contemporary_house_barminka.png", subtitle: "Diseño Contemporáneo", area: "450", floors: "2", bedrooms: "4" },
            { title: "Venice", image: "/elegant_modern_home_venice.png", subtitle: "Elegancia Moderna", area: "610", floors: "2", bedrooms: "4" },
        ]
    }

    return NextResponse.json(content)
}
